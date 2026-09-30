import { Construction } from 'lucide-react-native';
import type { ReactNode } from 'react';

import { t } from '@/i18n';

import { EmptyState } from './EmptyState';
import { Screen } from './Screen';
import { Text } from './Text';

/** Tela provisória das abas na Fase 1. Some quando cada tela real for implementada. */
export function PlaceholderScreen({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <Screen gap={24}>
      <Text variant="screenTitle" accessibilityRole="header">
        {title}
      </Text>
      <EmptyState icon={Construction} title={t.placeholder.title} text={t.placeholder.text} />
      {children}
    </Screen>
  );
}
