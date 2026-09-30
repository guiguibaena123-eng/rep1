import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { BottomSheet, Button, Checkbox, Chip, Input, Text } from '@/components';
import { t } from '@/i18n';
import { space } from '@/theme/tokens';

import {
  EDUCATION_STATUS,
  LANGUAGE_LEVELS,
  type Course,
  type Education,
  type Experience,
  type Language,
} from './types';

const e = t.editProfile;
const TEXT_MAX = 80;
const DESCRIPTION_MAX = 300;

type SheetProps<T> = {
  /** null = item novo ("+ Adicionar"). */
  initial: T | null;
  onSave: (item: T) => void;
  onDelete: () => void;
  onClose: () => void;
};

/**
 * Moldura comum: título, campos, "Salvar" (primário) e "Excluir" (só ao editar).
 * Caixa no meio da tela porque tem campo de texto (sobe com o teclado).
 */
function ItemSheet({
  title,
  isNew,
  children,
  onSave,
  onDelete,
  onClose,
}: {
  title: string;
  isNew: boolean;
  children: ReactNode;
  onSave: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  return (
    <BottomSheet visible placement="center" onClose={onClose} title={title}>
      <View style={styles.fields}>{children}</View>
      <Button label={e.sheetSave} onPress={onSave} style={{ marginTop: space[2] }} />
      {isNew ? (
        <Button label={t.common.notNow} variant="text" onPress={onClose} />
      ) : (
        <Button label={e.sheetDelete} variant="text" onPress={onDelete} />
      )}
    </BottomSheet>
  );
}

/** Campo obrigatório vazio → mensagem gentil embaixo, só depois de tentar salvar. */
function useRequired() {
  const [tried, setTried] = useState(false);
  return {
    tried,
    check: (...values: string[]) => {
      setTried(true);
      return values.every((v) => v.trim().length > 0);
    },
    error: (value: string) => (tried && !value.trim() ? e.required : null),
  };
}

const clean = (s: string) => s.replace(/\s+/g, ' ').trim();

export function ExperienceSheet({ initial, onSave, onDelete, onClose }: SheetProps<Experience>) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [place, setPlace] = useState(initial?.place ?? '');
  const [start, setStart] = useState(initial?.start ?? '');
  const [end, setEnd] = useState(initial?.end ?? '');
  const [current, setCurrent] = useState(initial ? initial.end === null : false);
  const [description, setDescription] = useState(initial?.description ?? '');
  const req = useRequired();

  const save = () => {
    if (!req.check(title)) return;
    onSave({
      title: clean(title),
      place: clean(place),
      start: clean(start),
      end: current ? null : clean(end),
      description: description.trim(),
    });
  };

  return (
    <ItemSheet title={e.experienceSheet} isNew={!initial} onSave={save} onDelete={onDelete} onClose={onClose}>
      <Input label={e.expTitle} placeholder={e.expTitlePlaceholder} value={title} onChangeText={setTitle} maxLength={TEXT_MAX} error={req.error(title)} />
      <Input label={e.expPlace} placeholder={e.expPlacePlaceholder} value={place} onChangeText={setPlace} maxLength={TEXT_MAX} />
      <View style={styles.row}>
        <View style={styles.half}>
          <Input label={e.expStart} placeholder={e.expStartPlaceholder} value={start} onChangeText={setStart} maxLength={20} />
        </View>
        {!current && (
          <View style={styles.half}>
            <Input label={e.expEnd} placeholder={e.expEndPlaceholder} value={end} onChangeText={setEnd} maxLength={20} />
          </View>
        )}
      </View>
      <Checkbox checked={current} onChange={setCurrent} accessibilityLabel={e.expCurrent}>
        <Text>{e.expCurrent}</Text>
      </Checkbox>
      <Input
        label={e.expDescription}
        placeholder={e.expDescriptionPlaceholder}
        value={description}
        onChangeText={setDescription}
        maxLength={DESCRIPTION_MAX}
        long
        counterFrom={DESCRIPTION_MAX - 60}
      />
    </ItemSheet>
  );
}

export function EducationSheet({ initial, onSave, onDelete, onClose }: SheetProps<Education>) {
  const [course, setCourse] = useState(initial?.course ?? '');
  const [institution, setInstitution] = useState(initial?.institution ?? '');
  const [status, setStatus] = useState(initial?.status ?? 'cursando');
  const [year, setYear] = useState(initial?.year ?? '');
  const req = useRequired();

  const save = () => {
    if (!req.check(course)) return;
    onSave({ course: clean(course), institution: clean(institution), status, year: clean(year) });
  };

  return (
    <ItemSheet title={e.educationSheet} isNew={!initial} onSave={save} onDelete={onDelete} onClose={onClose}>
      <Input label={e.eduCourse} placeholder={e.eduCoursePlaceholder} value={course} onChangeText={setCourse} maxLength={TEXT_MAX} error={req.error(course)} />
      <Input label={e.eduInstitution} value={institution} onChangeText={setInstitution} maxLength={TEXT_MAX} />
      <View style={{ gap: space[2] }}>
        <Text variant="bodySmall" weight="semibold" nativeID="edu-status">
          {e.eduStatus}
        </Text>
        <View accessibilityRole="radiogroup" accessibilityLabelledBy="edu-status" style={styles.wrap}>
          {EDUCATION_STATUS.map((s) => (
            <Chip key={s} label={t.options.educationStatus[s]} selected={status === s} onPress={() => setStatus(s)} />
          ))}
        </View>
      </View>
      {status !== 'trancado' && (
        <Input
          label={e.eduYear}
          placeholder={e.eduYearPlaceholder}
          value={year}
          onChangeText={(v) => setYear(v.replace(/\D/g, ''))}
          keyboardType="number-pad"
          maxLength={4}
        />
      )}
    </ItemSheet>
  );
}

export function CourseSheet({ initial, onSave, onDelete, onClose }: SheetProps<Course>) {
  const [name, setName] = useState(initial?.name ?? '');
  const [institution, setInstitution] = useState(initial?.institution ?? '');
  const [year, setYear] = useState(initial?.year ?? '');
  const req = useRequired();

  const save = () => {
    if (!req.check(name)) return;
    onSave({ name: clean(name), institution: clean(institution), year: clean(year) });
  };

  return (
    <ItemSheet title={e.courseSheet} isNew={!initial} onSave={save} onDelete={onDelete} onClose={onClose}>
      <Input label={e.courseName} placeholder={e.courseNamePlaceholder} value={name} onChangeText={setName} maxLength={TEXT_MAX} error={req.error(name)} />
      <Input label={e.courseInstitution} value={institution} onChangeText={setInstitution} maxLength={TEXT_MAX} />
      <Input
        label={e.courseYear}
        placeholder={e.eduYearPlaceholder}
        value={year}
        onChangeText={(v) => setYear(v.replace(/\D/g, ''))}
        keyboardType="number-pad"
        maxLength={4}
      />
    </ItemSheet>
  );
}

export function LanguageSheet({ initial, onSave, onDelete, onClose }: SheetProps<Language>) {
  const [language, setLanguage] = useState(initial?.language ?? '');
  const [level, setLevel] = useState(initial?.level ?? 'basico');
  const req = useRequired();

  const save = () => {
    if (!req.check(language)) return;
    onSave({ language: clean(language), level });
  };

  return (
    <ItemSheet title={e.languageSheet} isNew={!initial} onSave={save} onDelete={onDelete} onClose={onClose}>
      <Input label={e.langName} placeholder={e.langNamePlaceholder} value={language} onChangeText={setLanguage} maxLength={40} error={req.error(language)} />
      <View style={{ gap: space[2] }}>
        <Text variant="bodySmall" weight="semibold" nativeID="lang-level">
          {e.langLevel}
        </Text>
        <View accessibilityRole="radiogroup" accessibilityLabelledBy="lang-level" style={styles.wrap}>
          {LANGUAGE_LEVELS.map((l) => (
            <Chip key={l} label={t.options.languageLevel[l]} selected={level === l} onPress={() => setLevel(l)} />
          ))}
        </View>
      </View>
    </ItemSheet>
  );
}

const styles = StyleSheet.create({
  fields: { gap: space[4] },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: space[3] },
  half: { flexGrow: 1, flexBasis: 120 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
});
