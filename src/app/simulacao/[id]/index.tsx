import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import { Lightbulb } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { BottomSheet, Button, Card, Input, LoadingScreen, ProgressBar, Screen, ScreenHeader, Text, useToast } from '@/components';
import { ErrorScreen } from '@/components/ErrorScreen';
import { useAbandonSession, useSession } from '@/features/interview/api';
import { EMPTY_DRAFT, useDrafts, type Draft } from '@/features/interview/draft';
import {
  ANSWER_COUNTER_FROM,
  ANSWER_MAX_CHARS,
  canSendAnswer,
  type InterviewSession,
} from '@/features/interview/types';
import { t } from '@/i18n';
import { crisisUrl } from '@/lib/env';
import { useTheme } from '@/theme/ThemeProvider';
import { iconStroke, size, space } from '@/theme/tokens';

const s = t.simulation;

/** O rascunho é salvo no aparelho a cada 2s enquanto a pessoa escreve. */
const DRAFT_SAVE_MS = 2000;
/** "Estou pronto(a)" libera depois de 3s na tela de respiração. */
const READY_AFTER_MS = 3000;

/**
 * T7a "Respire fundo" + T7 Respondendo.
 * Uma pergunta por vez; ao enviar, a anterior fica travada. Na última, vai para a T8.
 */
export default function AnsweringScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const session = useSession(id);
  const hydrated = useDrafts((st) => st.hydrated);
  const saved = useDrafts((st) => st.drafts[id]);

  if (session.isPending || !hydrated) return <LoadingScreen />;
  if (session.isError) {
    return (
      <ErrorScreen
        onRetry={() => session.refetch()}
        retrying={session.isFetching}
        secondaryLabel={t.common.back}
        onSecondary={leaveFlow}
      />
    );
  }
  return <Flow key={id} session={session.data} initial={saved ?? EMPTY_DRAFT} />;
}

/** Volta para onde a pessoa estava antes da simulação (ou para o Início). */
function leaveFlow() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

function Flow({ session, initial }: { session: InterviewSession; initial: Draft }) {
  const toast = useToast();
  const saveDraft = useDrafts((st) => st.save);
  const clearDraft = useDrafts((st) => st.clear);
  const abandon = useAbandonSession();

  const [draft, setDraft] = useState<Draft>(initial);
  const [exitOpen, setExitOpen] = useState(false);

  const status = session.status;
  const questions = session.questions;
  const total = questions.length;
  const index = Math.min(draft.index, total - 1);
  const question = questions[index];
  const answer = draft.answers[question.id] ?? '';
  const isLast = index === total - 1;

  // Sessão que não está mais em andamento: mostra o resultado ou volta.
  useEffect(() => {
    if (status === 'completed') router.replace(`/simulacao/${session.id}/resultado`);
    else if (status === 'abandoned') {
      toast.show(s.closed, 'error');
      leaveFlow();
    }
  }, [status, session.id, toast]);

  // Salva o rascunho 2s depois da última mudança.
  useEffect(() => {
    const timer = setTimeout(() => saveDraft(session.id, draft), DRAFT_SAVE_MS);
    return () => clearTimeout(timer);
  }, [draft, session.id, saveDraft]);

  // Android: o botão "voltar" abre a confirmação de saída.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setExitOpen(true);
      return true;
    });
    return () => sub.remove();
  }, []);

  const update = (changes: Partial<Draft>) => {
    const next = { ...draft, ...changes };
    setDraft(next);
    // Passos importantes (começar, enviar) são salvos na hora.
    if (changes.index !== undefined || changes.started !== undefined) saveDraft(session.id, next);
  };

  const send = () => {
    if (!canSendAnswer(answer)) return;
    const answers = { ...draft.answers, [question.id]: answer.trim() };
    if (isLast) {
      saveDraft(session.id, { ...draft, answers });
      router.replace(`/simulacao/${session.id}/gerando`);
    } else {
      update({ answers, index: index + 1 });
    }
  };

  const leave = () => {
    abandon.mutate(session.id, {
      onSuccess: () => {
        clearDraft(session.id);
        setExitOpen(false);
        leaveFlow();
      },
      // Fecha o sheet antes: no iOS o toast fica atrás do Modal.
      onError: () => {
        setExitOpen(false);
        toast.show(s.exitError, 'error');
      },
    });
  };

  const exitSheet = (
    <BottomSheet visible={exitOpen} onClose={() => setExitOpen(false)} title={s.exitTitle} description={s.exitText}>
      <Button label={s.exitStay} onPress={() => setExitOpen(false)} />
      <Button label={s.exitLeave} variant="text" onPress={leave} loading={abandon.isPending} />
    </BottomSheet>
  );

  if (!draft.started) {
    return (
      <>
        <Breathe onClose={() => setExitOpen(true)} onReady={() => update({ started: true })} />
        {exitSheet}
      </>
    );
  }

  return (
    <>
      <ScreenHeader leading="close" onLeadingPress={() => setExitOpen(true)}>
        <View style={{ gap: space[2] }}>
          <Text variant="bodySmall" weight="semibold" color="textSecondary">
            {s.progress(index + 1, total)}
          </Text>
          <ProgressBar value={(index + 1) / total} accessibilityLabel={s.progress(index + 1, total)} />
        </View>
      </ScreenHeader>
      <Answering
        key={question.id}
        eyebrow={`${t.options.area[session.area]} · ${t.levels[session.level]}`.toUpperCase()}
        question={question.text}
        hint={question.hint}
        answer={answer}
        onChange={(text) => update({ answers: { ...draft.answers, [question.id]: text } })}
        isLast={isLast}
        onSend={send}
      />
      {exitSheet}
    </>
  );
}

function Answering({
  eyebrow,
  question,
  hint,
  answer,
  onChange,
  isLast,
  onSend,
}: {
  eyebrow: string;
  question: string;
  hint: string;
  answer: string;
  onChange: (text: string) => void;
  isLast: boolean;
  onSend: () => void;
}) {
  const { colors } = useTheme();
  const [hintOpen, setHintOpen] = useState(false);
  const ready = canSendAnswer(answer);
  const tooShort = answer.trim().length > 0 && !ready;

  return (
    <Screen
      withHeader
      footer={
        <>
          {tooShort && (
            <Text variant="bodySmall" color="textSecondary" align="center" accessibilityLiveRegion="polite">
              {s.tooShort}
            </Text>
          )}
          <View style={styles.actions}>
            <Button
              label={s.hint}
              variant="secondary"
              onPress={() => setHintOpen(true)}
              icon={<Lightbulb size={18} color={colors.primaryInk} strokeWidth={iconStroke} />}
              style={{ flex: 1 }}
            />
            <Button label={isLast ? s.finish : s.send} onPress={onSend} disabled={!ready} style={{ flex: 2 }} />
          </View>
        </>
      }
    >
      <Card style={{ gap: 10, paddingVertical: space[6] }}>
        <Text variant="caption" weight="semibold" color="primaryInk" style={{ letterSpacing: 0.4 }}>
          {eyebrow}
        </Text>
        <Text variant="screenTitle" accessibilityRole="header" style={{ fontSize: 22, lineHeight: 30 }}>
          {question}
        </Text>
      </Card>

      <Input
        label={s.answerLabel}
        hideLabel
        long
        value={answer}
        onChangeText={onChange}
        maxLength={ANSWER_MAX_CHARS}
        counterFrom={ANSWER_COUNTER_FROM}
        placeholder={s.answerPlaceholder}
        autoCapitalize="sentences"
      />

      <BottomSheet visible={hintOpen} onClose={() => setHintOpen(false)} title={s.hintTitle} description={hint}>
        <Button label={s.hintOk} onPress={() => setHintOpen(false)} />
      </BottomSheet>
    </Screen>
  );
}

/** T7a: círculo que cresce e diminui (8s por ciclo). Respeita "reduzir movimento". */
function Breathe({ onClose, onReady }: { onClose: () => void; onReady: () => void }) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const [canStart, setCanStart] = useState(false);
  const inner = useSharedValue(0.62);
  const outer = useSharedValue(0.8);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timer.current = setTimeout(() => setCanStart(true), READY_AFTER_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const half = { duration: 4000, easing: Easing.inOut(Easing.ease) };
    inner.set(withRepeat(withSequence(withTiming(1, half), withTiming(0.62, half)), -1));
    outer.set(withRepeat(withSequence(withTiming(1.08, half), withTiming(0.8, half)), -1));
  }, [reduceMotion, inner, outer]);

  const innerStyle = useAnimatedStyle(() => ({ transform: [{ scale: inner.get() }] }));
  const outerStyle = useAnimatedStyle(() => ({ transform: [{ scale: outer.get() }], opacity: 0.5 + (outer.get() - 0.8) * 1.8 }));

  return (
    <>
    <ScreenHeader leading="close" onLeadingPress={onClose} />
    <Screen
      scroll={false}
      withHeader
      footer={
        <>
          <Button label={s.ready} onPress={onReady} disabled={!canStart} />
          <Pressable
            onPress={() => Linking.openURL(crisisUrl())}
            accessibilityRole="link"
            style={styles.cvv}
          >
            <Text variant="bodySmall" color="textSecondary" align="center" style={{ textDecorationLine: 'underline' }}>
              {s.cvv}
            </Text>
          </Pressable>
        </>
      }
    >
      <View style={styles.breatheBody}>
        <View style={styles.circles} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Animated.View style={[styles.outer, { backgroundColor: colors.primarySoft }, outerStyle]} />
          <Animated.View style={[styles.inner, { backgroundColor: colors.primary }, innerStyle]} />
        </View>
        <View style={{ gap: 10 }}>
          <Text variant="display" align="center" accessibilityRole="header">
            {s.breatheTitle}
          </Text>
          <Text color="textSecondary" align="center">
            {s.breatheText}
          </Text>
        </View>
      </View>
    </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: 10 },
  breatheBody: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[10], paddingHorizontal: space[3] },
  circles: { width: 240, height: 240, alignItems: 'center', justifyContent: 'center' },
  outer: { position: 'absolute', width: 240, height: 240, borderRadius: 120 },
  inner: { width: 160, height: 160, borderRadius: 80, opacity: 0.9 },
  cvv: { minHeight: size.minTouch, alignItems: 'center', justifyContent: 'center' },
});
