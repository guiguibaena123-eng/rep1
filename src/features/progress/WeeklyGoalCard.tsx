import { StyleSheet, View } from 'react-native';

import { Card, ProgressBar, Text } from '@/components';
import { t } from '@/i18n';
import { space } from '@/theme/tokens';

import type { WeeklyGoal } from './logic';

const h = t.home;

/** Meta da semana conforme o plano (Premium: 3 simulações; grátis: 1 simulação + 2 dicas lidas). A barra fica menta quando completa. */
export function WeeklyGoalCard({ goal }: { goal: WeeklyGoal }) {
  const complete = goal.done >= goal.total;
  const count = goal.tips ? h.goalCount(goal.done, goal.total) : h.goalText(goal.done, goal.total);
  const goalA11y = goal.tips ? h.goalFreeA11y(goal.sims.done, goal.tips.done) : `${h.goalTitle}: ${count}`;

  return (
    <Card style={styles.card}>
      <View style={styles.head}>
        <Text weight="semibold" accessibilityRole="header" style={styles.shrink}>
          {h.goalTitle}
        </Text>
        <Text variant="bodySmall" color={complete ? 'successInk' : 'textSecondary'} style={styles.shrink}>
          {count}
        </Text>
      </View>
      <ProgressBar value={goal.done / goal.total} accessibilityLabel={complete ? h.goalDone : goalA11y} />
      {goal.tips && (
        <Text variant="bodySmall" color="textSecondary" importantForAccessibility="no" accessibilityElementsHidden>
          {h.goalFreeDetail(goal.sims.done, goal.tips.done)}
        </Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: space[2] },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space[2] },
  shrink: { flexShrink: 1 },
});
