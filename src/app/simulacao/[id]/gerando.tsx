import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';

import { ErrorScreen } from '@/components/ErrorScreen';
import { WaitingScreen } from '@/components/WaitingScreen';
import { useSubmitInterview } from '@/features/interview/api';
import { useDrafts } from '@/features/interview/draft';
import { t } from '@/i18n';
import { ApiError } from '@/lib/api';

const g = t.generating;

/**
 * T8 Gerando feedback: envia as respostas e espera a IA.
 * Sucesso → T9 (substitui esta tela). Falha → "Tentar de novo" (as respostas já estão salvas) ou "Ver depois".
 */
export default function GeneratingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const submit = useSubmitInterview();
  const clearDraft = useDrafts((st) => st.clear);
  const started = useRef(false);

  const run = () => {
    // Lido na hora do envio: o rascunho pode ter acabado de ser salvo pela T7.
    const draft = useDrafts.getState().drafts[id];
    const answers = draft
      ? Object.entries(draft.answers).map(([question_id, answer_text]) => ({ question_id, answer_text }))
      : undefined;
    submit.mutate(
      { session_id: id, answers: answers?.length ? answers : undefined },
      {
        onSuccess: () => {
          clearDraft(id);
          router.replace(`/simulacao/${id}/resultado`);
        },
      },
    );
  };

  // Dispara uma única vez ao abrir (o "Tentar de novo" chama run() de novo).
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (submit.isError) {
    const err = submit.error;
    // Respostas inválidas (ex.: faltou uma): a mensagem do servidor já diz qual.
    const text = err instanceof ApiError && err.code !== 'LLM_FAILED' && err.code !== 'INTERNAL' ? err.message : g.errorText;
    return (
      <ErrorScreen
        title={g.errorTitle}
        text={text}
        onRetry={run}
        retrying={submit.isPending}
        secondaryLabel={g.later}
        onSecondary={() => router.dismissTo('/')}
      />
    );
  }

  return <WaitingScreen phrases={g.phrases} wait={g.wait} />;
}
