import * as DocumentPicker from 'expo-document-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { Check, ChevronDown, CircleAlert, CircleQuestionMark, FileText, FileX, Shield, Upload } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, Input, Screen, ScreenHeader, Text, useToast } from '@/components';
import { ErrorScreen } from '@/components/ErrorScreen';
import { SegmentTabs } from '@/components/SegmentTabs';
import { WaitingScreen } from '@/components/WaitingScreen';
import { useAnalyzeLinkedIn, useLinkedInUsage, type AnalyzeInput } from '@/features/linkedin/api';
import { LinkedInLimitSheet, PdfHelpSheet } from '@/features/linkedin/Sheets';
import { openPremium } from '@/features/plan/navigation';
import {
  checkFile,
  EMPTY_PASTE,
  formatBytes,
  PASTE_FIELD_MAX,
  PASTE_KEYS,
  pasteIsEnough,
  TARGET_ROLE_MAX,
  type FileProblem,
  type PasteFields,
  type PickedFile,
} from '@/features/linkedin/types';
import { t } from '@/i18n';
import { ApiError } from '@/lib/api';
import { useTheme } from '@/theme/ThemeProvider';
import { iconStroke, radius, space } from '@/theme/tokens';

const a = t.analyze;
type Mode = 'pdf' | 'paste';

/**
 * T11 Enviar PDF / colar textos. "Analisar meu perfil" envia (PDF) e chama analyze-linkedin,
 * mostrando a mesma espera da T8. Sucesso → T12 (substitui esta tela).
 */
export default function AnalyzeScreen() {
  const { colors } = useTheme();
  const toast = useToast();
  const { modo } = useLocalSearchParams<{ modo?: string }>();
  const usage = useLinkedInUsage().data;
  const analyze = useAnalyzeLinkedIn();

  const [mode, setMode] = useState<Mode>(modo === 'texto' ? 'paste' : 'pdf');
  const [file, setFile] = useState<PickedFile | null>(null);
  const [fileProblem, setFileProblem] = useState<FileProblem>(null);
  const [unreadable, setUnreadable] = useState(false);
  const [paste, setPaste] = useState<PasteFields>(EMPTY_PASTE);
  const [open, setOpen] = useState(0);
  const [role, setRole] = useState('');
  const [limitOpen, setLimitOpen] = useState(false);
  const [resetsAt, setResetsAt] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const exhausted = !!usage && usage.used >= usage.limit;
  const ready = mode === 'pdf' ? !!file && !fileProblem && !unreadable : pasteIsEnough(paste);

  const pick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      const picked: PickedFile = { uri: asset.uri, name: asset.name, size: asset.size ?? null, mimeType: asset.mimeType ?? null };
      setFile(picked);
      setFileProblem(checkFile(picked));
      setUnreadable(false);
    } catch {
      toast.show(a.pickError, 'error');
    }
  };

  const toPaste = () => {
    setMode('paste');
    setUnreadable(false);
  };

  const submit = () => {
    if (exhausted) {
      setResetsAt(usage?.resets_at ?? null);
      setLimitOpen(true);
      return;
    }
    let input: AnalyzeInput;
    if (mode === 'pdf') {
      if (!file) return;
      input = { source: 'pdf', file, target_role: role };
    } else {
      input = { source: 'paste', sections: paste, target_role: role };
    }
    setFailed(false);
    analyze.mutate(input, {
      onSuccess: ({ report_id }) => router.replace(`/analise/${report_id}`),
      onError: (err) => {
        if (!(err instanceof ApiError)) return setFailed(true);
        if (err.code === 'PDF_UNREADABLE') return setUnreadable(true);
        if (err.code === 'LIMIT_REACHED' && err.extra.reason === 'monthly') {
          setResetsAt(typeof err.extra.resets_at === 'string' ? err.extra.resets_at : null);
          return setLimitOpen(true);
        }
        // Rate limit, arquivo ausente, campos curtos: a mensagem já explica o que fazer.
        if (err.code === 'LIMIT_REACHED' || err.code === 'INVALID_INPUT') return toast.show(err.message, 'error');
        setFailed(true);
      },
    });
  };

  if (analyze.isPending) return <WaitingScreen phrases={a.phrases} wait={a.wait} />;

  if (failed) {
    return (
      <ErrorScreen
        title={a.errorTitle}
        text={analyze.error instanceof ApiError && analyze.error.code === 'NETWORK' ? analyze.error.message : a.errorText}
        onRetry={submit}
        secondaryLabel={t.common.back}
        onSecondary={() => setFailed(false)}
      />
    );
  }

  const problemTitle = unreadable ? a.unreadableTitle : fileProblem === 'too_big' ? a.tooBigTitle : a.notPdfTitle;
  const hasProblem = mode === 'pdf' && !!file && (!!fileProblem || unreadable);

  return (
    <>
      <ScreenHeader title={a.title} onLeadingPress={() => router.back()} />
      <Screen
        withHeader
        gap={space[6]}
        footer={
          hasProblem ? (
            <Button label={a.pickOther} onPress={pick} />
          ) : (
            <Button label={a.submit} onPress={submit} disabled={!ready} />
          )
        }
      >
        <SegmentTabs
          options={[
            { value: 'pdf', label: a.tabPdf },
            { value: 'paste', label: a.tabPaste },
          ]}
          value={mode}
          onChange={setMode}
        />

        {mode === 'pdf' ? (
          <View style={{ gap: space[4] }}>
            {!file ? (
              <Pressable
                onPress={pick}
                accessibilityRole="button"
                accessibilityLabel={`${a.pick}. ${a.pickHint}`}
                style={[styles.drop, { backgroundColor: colors.surface, borderColor: colors.textDisabled }]}
              >
                <View style={[styles.dropIcon, { backgroundColor: colors.primarySoft }]}>
                  <Upload size={26} color={colors.primary} strokeWidth={iconStroke} />
                </View>
                <Text weight="semibold">{a.pick}</Text>
                <Text variant="bodySmall" color="textSecondary">
                  {a.pickHint}
                </Text>
              </Pressable>
            ) : (
              <View
                style={[
                  styles.file,
                  { backgroundColor: colors.surface },
                  hasProblem ? { borderColor: colors.error, borderWidth: 2 } : { borderColor: colors.border, borderWidth: 1 },
                ]}
              >
                <View style={[styles.fileIcon, { backgroundColor: hasProblem ? colors.errorSoft : colors.primarySoft }]}>
                  {hasProblem ? (
                    <FileX size={24} color={colors.errorInk} strokeWidth={iconStroke} />
                  ) : (
                    <FileText size={24} color={colors.primary} strokeWidth={iconStroke} />
                  )}
                </View>
                <View style={styles.flex}>
                  <Text weight="semibold" numberOfLines={1}>
                    {file.name}
                  </Text>
                  <Text variant="bodySmall" color="textSecondary">
                    {formatBytes(file.size)}
                  </Text>
                </View>
                {!hasProblem && (
                  <Pressable onPress={pick} accessibilityRole="button" style={styles.change}>
                    <Text variant="bodySmall" weight="semibold" color="primary">
                      {a.change}
                    </Text>
                  </Pressable>
                )}
              </View>
            )}

            {hasProblem && (
              <View style={[styles.alert, { backgroundColor: colors.errorSoft }]} accessibilityRole="alert">
                <View style={styles.alertHead}>
                  <CircleAlert size={20} color={colors.toastErrorText} strokeWidth={iconStroke} />
                  <Text weight="semibold" style={[styles.flex, { color: colors.toastErrorText }]}>
                    {problemTitle}
                  </Text>
                </View>
                <Text variant="bodySmall">{a.fileHelp}</Text>
              </View>
            )}
            <View>
              <Pressable onPress={() => setHelpOpen(true)} accessibilityRole="button" style={styles.helpLink}>
                <CircleQuestionMark size={20} color={colors.primary} strokeWidth={iconStroke} />
                <Text weight="semibold" color="primary">
                  {t.linkedin.howTo}
                </Text>
              </Pressable>
              {hasProblem && <Button label={a.preferPaste} variant="text" onPress={toPaste} style={styles.inlineAction} />}
            </View>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {PASTE_KEYS.map((key, i) => {
              const f = a.fields[key];
              const isOpen = open === i;
              const filled = paste[key].trim().length > 0;
              return (
                <View key={key} style={[styles.accordion, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Pressable
                    onPress={() => setOpen(isOpen ? -1 : i)}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: isOpen }}
                    accessibilityLabel={filled ? `${f.label}, ${a.filled}` : f.label}
                    style={styles.accordionHead}
                  >
                    <Text weight="semibold" style={styles.flex}>
                      {f.label}
                    </Text>
                    {filled && !isOpen && <Check size={18} color={colors.successInk} strokeWidth={2} />}
                    <View style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}>
                      <ChevronDown size={20} color={colors.text} strokeWidth={iconStroke} />
                    </View>
                  </Pressable>
                  {isOpen && (
                    <View style={styles.accordionBody}>
                      <Text variant="bodySmall" color="textSecondary">
                        {f.help}
                      </Text>
                      <Input
                        label={f.label}
                        hideLabel
                        long
                        value={paste[key]}
                        onChangeText={(v) => setPaste((p) => ({ ...p, [key]: v }))}
                        maxLength={PASTE_FIELD_MAX}
                        counterFrom={PASTE_FIELD_MAX - 500}
                      />
                    </View>
                  )}
                </View>
              );
            })}
            {!ready && (
              <Text variant="bodySmall" color="textSecondary">
                {a.pasteMin}
              </Text>
            )}
          </View>
        )}

        <View style={{ gap: 6 }}>
          <Input
            label={`${a.roleLabel}${a.roleOptional}`}
            placeholder={a.rolePlaceholder}
            value={role}
            onChangeText={setRole}
            maxLength={TARGET_ROLE_MAX}
            returnKeyType="done"
          />
          <Text variant="caption" color="textSecondary">
            {a.roleHint}
          </Text>
        </View>

        <View style={styles.privacy}>
          <Shield size={16} color={colors.textSecondary} strokeWidth={iconStroke} />
          <Text variant="caption" color="textSecondary" style={styles.flex}>
            {t.linkedin.privacy}
          </Text>
        </View>
      </Screen>

      <PdfHelpSheet visible={helpOpen} onClose={() => setHelpOpen(false)} />

      <LinkedInLimitSheet
        visible={limitOpen}
        onClose={() => setLimitOpen(false)}
        premium={usage?.premium ?? false}
        resetsAt={resetsAt}
        onPremium={() => {
          setLimitOpen(false);
          openPremium('linkedin');
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  drop: {
    height: 200,
    borderRadius: radius.card,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[3],
  },
  dropIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  file: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: space[4], borderRadius: radius.card },
  fileIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  change: { minHeight: 48, justifyContent: 'center', paddingHorizontal: space[2] },
  alert: { padding: space[4], borderRadius: radius.card, gap: space[2] },
  alertHead: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  inlineAction: { alignSelf: 'flex-start', marginLeft: -16 },
  helpLink: { flexDirection: 'row', alignItems: 'center', gap: space[2], alignSelf: 'flex-start', minHeight: 48 },
  accordion: { borderRadius: radius.card, borderWidth: 1, overflow: 'hidden' },
  accordionHead: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 56, paddingHorizontal: space[4] },
  accordionBody: { paddingHorizontal: space[4], paddingBottom: space[4], gap: space[2] },
  privacy: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
});
