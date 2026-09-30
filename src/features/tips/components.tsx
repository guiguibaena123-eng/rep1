import * as Linking from 'expo-linking';
import { Bookmark, CircleAlert, ExternalLink, Lock, MessageCircle } from 'lucide-react-native';
import { Fragment, type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type TextStyle } from 'react-native';

import { BottomSheet, Button, Text, useToast } from '@/components';
import { openPremium } from '@/features/plan/navigation';
import { t } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, iconStroke, radius, size, space } from '@/theme/tokens';

import { useSetFavorite } from './api';
import { splitBold } from './logic';
import type { TipBlock } from './types';

/** Dica Premium tocada por quem é do plano grátis (T13 e T14). */
export function TipPremiumSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { colors } = useTheme();
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      icon={
        <View style={[styles.sheetIcon, { backgroundColor: colors.warningSoft }]}>
          <Lock size={26} color={colors.streakIcon} strokeWidth={iconStroke} />
        </View>
      }
      title={t.tips.premiumTitle}
      description={t.tips.premiumText}
    >
      <Button
        label={t.tips.premiumCta}
        onPress={() => {
          onClose();
          openPremium('dicas');
        }}
      />
      <Button label={t.common.notNow} variant="text" onPress={onClose} />
    </BottomSheet>
  );
}

/** Marcador de "salvar dica" (o design usa marcador, não coração). */
export function SaveButton({ tipId, saved, color }: { tipId: string; saved: boolean; color?: string }) {
  const { colors } = useTheme();
  const toast = useToast();
  const setFavorite = useSetFavorite();
  const idle = color ?? colors.textSecondary;
  return (
    <Pressable
      onPress={() =>
        setFavorite.mutate({ tipId, on: !saved }, { onError: () => toast.show(t.tips.saveError, 'error') })
      }
      accessibilityRole="button"
      accessibilityLabel={saved ? t.tips.unsave : t.tips.save}
      accessibilityState={{ selected: saved }}
      style={styles.iconButton}
    >
      <Bookmark
        size={22}
        color={saved ? colors.primary : idle}
        fill={saved ? colors.primary : 'none'}
        strokeWidth={iconStroke}
      />
    </Pressable>
  );
}

/** Texto com trechos **em negrito**. */
function RichText({ text, style }: { text: string; style?: StyleProp<TextStyle> }) {
  return (
    <Text style={style}>
      {splitBold(text).map((part, i) =>
        part.bold ? (
          <Text key={i} weight="semibold" style={style}>
            {part.text}
          </Text>
        ) : (
          <Fragment key={i}>{part.text}</Fragment>
        ),
      )}
    </Text>
  );
}

/** Blocos da T14: parágrafo, subtítulo, lista (com números ou pontos), exemplo e cuidado. */
export function TipBlocks({ blocks }: { blocks: TipBlock[] }) {
  const { colors } = useTheme();
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'p':
            return <RichText key={i} text={block.text} />;
          case 'h':
            return (
              <Text key={i} variant="sectionTitle" accessibilityRole="header" style={{ marginBottom: -space[2] }}>
                {block.text}
              </Text>
            );
          case 'list':
            return (
              <View key={i} style={styles.list}>
                {block.items.map((item, k) => (
                  <View key={k} style={styles.listItem}>
                    {block.ordered ? (
                      <View style={[styles.number, { backgroundColor: colors.primarySoft }]}>
                        <Text style={[styles.numberText, { color: colors.primaryInk }]}>{k + 1}</Text>
                      </View>
                    ) : (
                      <View style={styles.bulletBox}>
                        <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
                      </View>
                    )}
                    <RichText text={item} style={styles.flex} />
                  </View>
                ))}
              </View>
            );
          case 'example':
            return (
              <Callout
                key={i}
                label={block.title ? block.title.toUpperCase() : t.tipRead.example}
                text={block.text}
                icon={<MessageCircle size={16} color={colors.primaryInk} strokeWidth={iconStroke} />}
                bg={colors.primarySoft}
                ink={colors.primaryInk}
              />
            );
          case 'warning':
            return (
              <Callout
                key={i}
                label={t.tipRead.warning}
                text={block.text}
                icon={<CircleAlert size={16} color={colors.warningInk} strokeWidth={iconStroke} />}
                bg={colors.warningSoft}
                ink={colors.warningInk}
              />
            );
          case 'sources':
            return <Sources key={i} items={block.items} />;
        }
      })}
    </>
  );
}

/** "Fontes": de onde saiu o conteúdo. Cada link abre no navegador. */
function Sources({ items }: { items: { title: string; url: string }[] }) {
  const { colors } = useTheme();
  const toast = useToast();
  const open = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      toast.show(t.tipRead.sourceError, 'error');
    }
  };
  return (
    <View style={[styles.sources, { borderTopColor: colors.border }]}>
      <Text variant="caption" weight="semibold" color="textSecondary">
        {items.length === 1 ? t.tipRead.source : t.tipRead.sources}
      </Text>
      {items.map((item) => (
        <Pressable
          key={item.url}
          onPress={() => open(item.url)}
          accessibilityRole="link"
          accessibilityLabel={t.tipRead.sourceA11y(item.title)}
          style={({ pressed }) => [styles.sourceRow, pressed && { opacity: 0.6 }]}
        >
          <ExternalLink size={16} color={colors.primaryInk} strokeWidth={iconStroke} style={{ marginTop: 2 }} />
          <Text variant="bodySmall" color="primaryInk" style={[styles.flex, { textDecorationLine: 'underline' }]}>
            {item.title}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function Callout({ label, text, icon, bg, ink }: { label: string; text: string; icon: ReactNode; bg: string; ink: string }) {
  return (
    <View style={[styles.callout, { backgroundColor: bg }]}>
      <View style={styles.calloutHead}>
        {icon}
        <Text variant="caption" weight="semibold" style={{ color: ink }}>
          {label}
        </Text>
      </View>
      <RichText text={text} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  sheetIcon: { width: 56, height: 56, borderRadius: radius.chip, alignItems: 'center', justifyContent: 'center', marginTop: space[2] },
  iconButton: { width: size.minTouch, height: size.minTouch, alignItems: 'center', justifyContent: 'center' },
  list: { gap: 10 },
  listItem: { flexDirection: 'row', gap: space[3], alignItems: 'flex-start' },
  number: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  numberText: { fontFamily: fonts.body600, fontSize: 13, lineHeight: 26 },
  bulletBox: { width: 26, height: 24, alignItems: 'center', justifyContent: 'center' },
  bullet: { width: 6, height: 6, borderRadius: 3 },
  callout: { padding: space[4], borderRadius: radius.card, gap: space[2] },
  calloutHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sources: { gap: space[1], paddingTop: space[4], borderTopWidth: 1 },
  sourceRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space[2], minHeight: 40, paddingVertical: space[2] },
});
