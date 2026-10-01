import { ChevronLeft } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { Button, Chip, Input, Screen, Text, useToast } from '@/components';
import { checkUsername, isUsernameTaken, useUpdateProfile } from '@/features/profile/api';
import { normalizeUsername, USERNAME_MAX, usernameMessage, usernameProblem } from '@/features/profile/details';
import { AREAS, DEFAULT_AGE, GOALS, MAX_AGE, MIN_AGE, type Area, type Goal } from '@/features/profile/types';
import { t } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, iconStroke, radius, size } from '@/theme/tokens';

const o = t.onboarding;
const USERNAME_CHECK_MS = 400;
/** O seletor deixa descer um pouco abaixo do mínimo só para explicar a regra de idade. */
const STEPPER_MIN = MIN_AGE - 3;
const MOUTHS = ['M11 23c2-3 8-3 10 0', 'M11 22.5c2-1.5 8-1.5 10 0', 'M11 21.5h10', 'M11 20.5c2 1.5 8 1.5 10 0', 'M10.5 20c2 3.5 9 3.5 11 0'];

/** T4 Conhecendo você: 3 passos. "Voltar" mantém as respostas; "Vamos lá" salva tudo. */
export default function OnboardingScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const update = useUpdateProfile();

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [nameTouched, setNameTouched] = useState(false);
  const [username, setUsername] = useState('');
  const [usernameTaken, setUsernameTaken] = useState(false);
  const [checked, setChecked] = useState<{ username: string; free: boolean | null } | null>(null);
  const [age, setAge] = useState(DEFAULT_AGE);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [area, setArea] = useState<Area | null>(null);
  const [feel, setFeel] = useState<number | null>(null);

  const trimmed = name.trim();
  const nameOk = trimmed.length >= 2 && trimmed.length <= 40;
  const ageOk = age >= MIN_AGE && age <= MAX_AGE;
  // O @ é opcional: vazio, o banco cria um a partir do nome. Preenchido, precisa ter o formato certo e estar livre.
  const handle = normalizeUsername(username);
  const handleProblem = handle ? usernameProblem(handle) : null;
  const shouldCheck = !!handle && !handleProblem;
  const handleChecking = shouldCheck && checked?.username !== handle;
  const handleTaken = usernameTaken || (shouldCheck && checked?.username === handle && checked.free === false);
  const handleFree = shouldCheck && checked?.username === handle && checked.free === true;
  const handleOk = !handle || (!handleProblem && !handleChecking && !handleTaken);
  const handleError = handleProblem ? usernameMessage(handleProblem) : handleTaken ? t.editProfile.usernameTaken : null;

  useEffect(() => {
    if (!shouldCheck) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      const free = await checkUsername(handle);
      if (!cancelled) setChecked({ username: handle, free });
    }, USERNAME_CHECK_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [handle, shouldCheck]);

  const valid = [nameOk && ageOk && handleOk, goal !== null, area !== null && feel !== null][step];
  const isLast = step === 2;

  const next = () => {
    if (!valid) return;
    if (!isLast) return setStep(step + 1);
    update.mutate(
      {
        name: trimmed,
        ...(handle ? { username: handle } : {}),
        age,
        goal,
        area,
        nervousness: (feel ?? 0) + 1, // 1 = muito nervoso(a) … 5 = tranquilo(a)
        onboarding_done: true,
        accepted_terms_at: new Date().toISOString(),
      },
      // Sucesso: o perfil completo libera as abas e o app troca de tela sozinho.
      {
        onError: (err) => {
          // Alguém pegou o @ entre a conferência e o envio: volta ao passo do nome para escolher outro.
          if (isUsernameTaken(err as { code?: string; message?: string })) {
            setUsernameTaken(true);
            setStep(0);
            return;
          }
          toast.show(o.saveError, 'error');
        },
      },
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 24) + 4 }]}>
        {step > 0 ? (
          <Pressable
            onPress={() => setStep(step - 1)}
            accessibilityRole="button"
            accessibilityLabel={t.common.back}
            style={styles.back}
          >
            <ChevronLeft size={24} color={colors.text} strokeWidth={iconStroke} />
          </Pressable>
        ) : (
          <View style={styles.back} />
        )}
        <View
          style={styles.bars}
          accessibilityRole="progressbar"
          accessibilityLabel={o.progress(step + 1)}
          accessibilityValue={{ min: 1, max: 3, now: step + 1 }}
        >
          {[0, 1, 2].map((k) => (
            <View key={k} style={[styles.bar, { backgroundColor: k <= step ? colors.primary : colors.border }]} />
          ))}
        </View>
        <Text variant="caption" color="textSecondary" style={styles.counter}>
          {step + 1}/3
        </Text>
      </View>

      <Screen
        withHeader
        gap={32}
        contentStyle={{ paddingTop: 32 }}
        footer={<Button label={isLast ? o.finish : o.next} onPress={next} disabled={!valid} loading={update.isPending} />}
      >
        {step === 0 && (
          <>
            <View style={styles.block}>
              <Text variant="screenTitle" accessibilityRole="header">
                {o.nameTitle}
              </Text>
              <Input
                label={o.nameTitle}
                hideLabel
                placeholder={o.namePlaceholder}
                value={name}
                onChangeText={setName}
                onBlur={() => setNameTouched(true)}
                maxLength={40}
                autoCapitalize="words"
                autoComplete="given-name"
                textContentType="givenName"
                error={nameTouched && !nameOk ? o.nameInvalid : null}
              />
              <View style={{ gap: 6 }}>
              <Input
                label={o.usernameLabel}
                placeholder={o.usernamePlaceholder}
                value={username}
                onChangeText={(value) => {
                  setUsername(value);
                  setUsernameTaken(false);
                }}
                maxLength={USERNAME_MAX + 1}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="username-new"
                textContentType="username"
                accessibilityHint={o.usernameHint}
                error={handleError}
              />
              {!handleError && (
                <Text variant="caption" color={handleFree ? 'successInk' : 'textSecondary'} accessibilityLiveRegion="polite">
                  {handleChecking
                    ? t.editProfile.usernameChecking
                    : handleFree
                      ? t.editProfile.usernameFree(handle)
                      : o.usernameHint}
                </Text>
              )}
              </View>
            </View>
            <View style={styles.block}>
              <Text variant="sectionTitle" nativeID="idade">
                {o.ageTitle}
              </Text>
              <View
                accessibilityRole="adjustable"
                accessibilityLabel={o.ageTitle}
                accessibilityValue={{ min: STEPPER_MIN, max: MAX_AGE, now: age, text: `${age} ${o.ageUnit}` }}
                accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
                onAccessibilityAction={(e) =>
                  setAge((a) => (e.nativeEvent.actionName === 'increment' ? Math.min(MAX_AGE, a + 1) : Math.max(STEPPER_MIN, a - 1)))
                }
                style={[styles.stepper, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <StepButton label="−" a11y={o.ageDecrease} onPress={() => setAge((a) => Math.max(STEPPER_MIN, a - 1))} />
                <Text style={styles.ageValue} accessibilityLiveRegion="polite">
                  {age}{' '}
                  <Text color="textSecondary">{o.ageUnit}</Text>
                </Text>
                <StepButton label="+" a11y={o.ageIncrease} onPress={() => setAge((a) => Math.min(MAX_AGE, a + 1))} />
              </View>
              {age < MIN_AGE && (
                <View style={[styles.note, { backgroundColor: colors.warningSoft }]} accessibilityLiveRegion="polite">
                  <Text variant="bodySmall" weight="medium" style={{ color: colors.warningInk }}>
                    {o.ageTooYoung}
                  </Text>
                </View>
              )}
            </View>
          </>
        )}

        {step === 1 && (
          <View style={styles.block}>
            <Text variant="screenTitle" accessibilityRole="header">
              {o.goalTitle}
            </Text>
            <View style={styles.list} accessibilityRole="radiogroup">
              {GOALS.map((g) => (
                <Chip key={g} label={t.options.goal[g]} selected={goal === g} onPress={() => setGoal(g)} height={56} block />
              ))}
            </View>
          </View>
        )}

        {step === 2 && (
          <>
            <View style={styles.block}>
              <Text variant="screenTitle" accessibilityRole="header">
                {o.areaTitle}
              </Text>
              <View style={styles.wrap} accessibilityRole="radiogroup">
                {AREAS.map((a) => (
                  <Chip key={a} label={t.options.area[a]} selected={area === a} onPress={() => setArea(a)} height={44} />
                ))}
              </View>
            </View>
            <View style={styles.block}>
              <Text variant="sectionTitle">{o.feelTitle}</Text>
              <View style={styles.faces} accessibilityRole="radiogroup">
                {t.options.feel.map((label, k) => (
                  <Face key={label} index={k} label={label} selected={feel === k} onPress={() => setFeel(k)} />
                ))}
              </View>
              <View style={styles.feelLabels}>
                <Text variant="caption" color="textSecondary">
                  {o.feelMin}
                </Text>
                {feel !== null && (
                  <Text variant="caption" weight="semibold" color="primaryInk">
                    {t.options.feel[feel]}
                  </Text>
                )}
                <Text variant="caption" color="textSecondary">
                  {o.feelMax}
                </Text>
              </View>
            </View>
          </>
        )}
      </Screen>
    </View>
  );
}

function StepButton({ label, a11y, onPress }: { label: string; a11y: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      style={[styles.stepButton, { backgroundColor: colors.primarySoft }]}
    >
      <Text weight="semibold" style={{ fontSize: 22, lineHeight: 28, color: colors.primaryInk }}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Carinha de 1 a 5 (de "Muito nervoso(a)" a "Tranquilo(a)"). */
function Face({ index, label, selected, onPress }: { index: number; label: string; selected: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  const color = selected ? colors.primaryInk : colors.textSecondary;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      style={[
        styles.face,
        {
          backgroundColor: selected ? colors.primarySoft : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
        },
      ]}
    >
      <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
        <Circle cx={16} cy={16} r={13} stroke={color} strokeWidth={iconStroke} />
        <Circle cx={11.5} cy={13} r={1.2} fill={color} />
        <Circle cx={20.5} cy={13} r={1.2} fill={color} />
        <Path d={MOUTHS[index]} stroke={color} strokeWidth={iconStroke} strokeLinecap="round" />
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8, paddingRight: 20 },
  back: { width: size.minTouch, height: size.minTouch, alignItems: 'center', justifyContent: 'center' },
  bars: { flex: 1, flexDirection: 'row', gap: 6 },
  bar: { flex: 1, height: 8, borderRadius: radius.chip },
  counter: { width: 32, textAlign: 'right' },
  block: { gap: 14 },
  list: { gap: 10 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stepper: {
    minHeight: 64,
    borderRadius: radius.card,
    borderWidth: 1,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepButton: { width: 48, height: 48, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' },
  ageValue: { fontFamily: fonts.heading800, fontSize: 28, lineHeight: 34 },
  note: { padding: 14, borderRadius: radius.button },
  faces: { flexDirection: 'row', gap: 6 },
  face: { flex: 1, height: 64, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  feelLabels: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
});
