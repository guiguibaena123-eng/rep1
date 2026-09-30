import { router } from 'expo-router';
import { Camera, Compass, Pencil, ShieldCheck, Sparkles, X } from 'lucide-react-native';
import { useEffect, useEffectEvent, useRef, useState, type ReactNode } from 'react';
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheet, Button, Card, Chip, Input, LoadingScreen, Text, useToast } from '@/components';
import { ErrorScreen } from '@/components/ErrorScreen';
import { useAuth } from '@/features/auth/AuthProvider';
import { checkUsername, isOffline, UsernameTakenError, useProfile, useSaveDetails, useSuggestBio } from '@/features/profile/api';
import { Avatar } from '@/features/profile/Avatar';
import {
  addSkill,
  BIO_MAX,
  CITY_MAX,
  detailsFromProfile,
  detailsToUpdate,
  guessSkillType,
  hasChanges,
  HEADLINE_MAX,
  LINK_MAX,
  NAME_MAX,
  normalizeUsername,
  removeSkill,
  SKILL_NAME_MAX,
  skillSuggestions,
  USERNAME_MAX,
  usernameProblem,
  validateDetails,
} from '@/features/profile/details';
import { CourseSheet, EducationSheet, ExperienceSheet, LanguageSheet } from '@/features/profile/EditSheets';
import { CoverImage } from '@/features/profile/CoverImage';
import { CoverPositionEditor } from '@/features/profile/CoverPositionEditor';
import {
  cleanupPhotos,
  COVER_RATIO,
  pickPhoto,
  preparePhoto,
  uploadPhoto,
  type PhotoKind,
  type PickSource,
} from '@/features/profile/photo';
import {
  AREAS,
  AVAILABILITY,
  GOALS,
  WORK_FORMATS,
  type Course,
  type Education,
  type Experience,
  type Language,
  type Profile,
  type ProfileDetails,
  type SkillType,
} from '@/features/profile/types';
import { Group, SwitchRow } from '@/features/settings/rows';
import { ApiError } from '@/lib/api';
import { t } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, iconStroke, radius, screenPadding, size, space } from '@/theme/tokens';

const e = t.editProfile;
const m = t.myProfile;
const PHOTO = 88;
const USERNAME_CHECK_MS = 400;

/** Situação do @ digitado: conferindo, livre ou já usado por outra pessoa. */
type UsernameStatus = 'checking' | 'free' | 'taken' | null;

/** Lista em edição num sheet: index null = item novo ("+ Adicionar"). */
type ListKey = 'experiences' | 'education' | 'courses' | 'languages';
type OpenSheet = { list: ListKey; index: number | null } | null;

/** T19 Editar perfil. Carrega o perfil e entrega uma "foto" dele para o formulário. */
export default function EditProfileScreen() {
  const profile = useProfile();
  if (profile.isPending) return <LoadingScreen />;
  if (!profile.data) {
    return <ErrorScreen text={m.loadError} onRetry={() => profile.refetch()} retrying={profile.isFetching} />;
  }
  return <EditForm profile={profile.data} />;
}

function EditForm({ profile }: { profile: Profile }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const userId = useAuth().session!.user.id;
  const saveDetails = useSaveDetails();
  const suggestBio = useSuggestBio();

  // Como o perfil estava ao abrir a tela: base do "Sair sem salvar?".
  const [initial] = useState(() => detailsFromProfile(profile));
  const [form, setForm] = useState<ProfileDetails>(initial);
  const [tried, setTried] = useState(false);

  // Imagens recém-escolhidas (aparecem na hora) e qual está sendo enviada.
  const [localImage, setLocalImage] = useState<Partial<Record<PhotoKind, string>>>({});
  const [uploading, setUploading] = useState<PhotoKind | null>(null);
  const uploaded = useRef(false);

  const [photoSheet, setPhotoSheet] = useState<PhotoKind | null>(null);
  const [adjusting, setAdjusting] = useState(false);
  const [discardSheet, setDiscardSheet] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [helped, setHelped] = useState(false);
  const [skillDraft, setSkillDraft] = useState('');
  const [askType, setAskType] = useState<string | null>(null);
  const [open, setOpen] = useState<OpenSheet>(null);

  const set = (patch: Partial<ProfileDetails>) => setForm((f) => ({ ...f, ...patch }));

  // ---------- @ (nome de usuário) ----------
  // Confere se está livre enquanto a pessoa digita (só quando mudou e o formato está certo).
  // Último resultado do servidor para um @ (free null = não deu para conferir, ex.: sem internet).
  const [checked, setChecked] = useState<{ username: string; free: boolean | null } | null>(null);
  const username = normalizeUsername(form.username);
  const shouldCheck = username !== normalizeUsername(initial.username) && !usernameProblem(username);
  let usernameStatus: UsernameStatus = null;
  if (shouldCheck) {
    if (checked?.username !== username) usernameStatus = 'checking';
    else if (checked.free !== null) usernameStatus = checked.free ? 'free' : 'taken';
  }
  useEffect(() => {
    if (!shouldCheck) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      const free = await checkUsername(username);
      if (!cancelled) setChecked({ username, free });
    }, USERNAME_CHECK_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [username, shouldCheck]);

  const formErrors = tried ? validateDetails(form) : {};
  const errors = usernameStatus === 'taken' && !formErrors.username ? { ...formErrors, username: e.usernameTaken } : formErrors;
  const changed = hasChanges(initial, form);

  // Sai da tela. Foto ou capa enviada nesta edição e não salva: apaga do servidor.
  const leave = () => {
    if (uploaded.current) cleanupPhotos(userId, [initial.photo_path, initial.cover_path]);
    router.back();
  };

  const tryClose = () => {
    if (changed) setDiscardSheet(true);
    else leave();
  };

  // Android: o "voltar" do sistema passa pela mesma pergunta do X.
  const onHardwareBack = useEffectEvent(() => {
    tryClose();
    return true;
  });
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', onHardwareBack);
    return () => sub.remove();
  }, []);

  // ---------- Foto e capa ----------

  const choosePhoto = async (source: PickSource) => {
    const kind = photoSheet;
    setPhotoSheet(null);
    if (!kind) return;
    if (await isOffline()) {
      toast.show(e.photoOffline, 'error');
      return;
    }
    // iOS: espera o sheet fechar antes de abrir a galeria/câmera (senão ela não aparece).
    if (Platform.OS === 'ios') await new Promise((r) => setTimeout(r, 400));
    const picked = await pickPhoto(source, kind);
    if (picked.status === 'denied') {
      toast.show(e.photoDenied, 'error');
      return;
    }
    if (picked.status !== 'ok') return;

    setUploading(kind);
    try {
      const image = await preparePhoto(picked.uri, kind);
      const path = await uploadPhoto(userId, image.bytes, kind);
      uploaded.current = true;
      setLocalImage((l) => ({ ...l, [kind]: image.uri }));
      if (kind === 'avatar') set({ photo_path: path });
      else {
        // Capa nova começa no centro e já abre o "Ajustar capa".
        set({ cover_path: path, cover_x: 50, cover_y: 50 });
        setAdjusting(true);
      }
    } catch {
      toast.show(kind === 'avatar' ? e.photoError : e.coverError, 'error');
    } finally {
      setUploading(null);
    }
  };

  const removePhoto = (kind: PhotoKind) => {
    setPhotoSheet(null);
    setLocalImage((l) => ({ ...l, [kind]: undefined }));
    set(kind === 'avatar' ? { photo_path: null } : { cover_path: null, cover_x: 50, cover_y: 50 });
  };

  // ---------- Bio ----------

  const helpWrite = () => {
    suggestBio.mutate(
      {
        name: form.name,
        age: profile.age,
        goal: form.goal,
        area: form.area,
        experiences: form.experiences,
        education: form.education,
      },
      {
        onSuccess: ({ bio }) => setSuggestion(bio.slice(0, BIO_MAX)),
        onError: (err) => toast.show(err instanceof ApiError ? err.message : e.helpError, 'error'),
      },
    );
  };

  const applySuggestion = () => {
    if (suggestion) set({ bio: suggestion });
    setSuggestion(null);
    setHelped(true);
  };

  // ---------- Competências ----------

  const pushSkill = (name: string, type: SkillType) => {
    const result = addSkill(form.skills, name, type);
    if (result.ok) {
      set({ skills: result.skills });
      setSkillDraft('');
    } else if (result.reason === 'duplicate') toast.show(e.skillDuplicate, 'error');
    else if (result.reason === 'full') toast.show(e.skillFull, 'error');
  };

  const addDraft = () => {
    const name = skillDraft.trim();
    if (!name) return;
    const type = guessSkillType(name);
    // Tipo óbvio (lista de sugestões ou palavras conhecidas): adiciona direto. Senão, pergunta.
    // (Repetida ou lista cheia: pushSkill já mostra o aviso, sem perguntar nada.)
    if (type) pushSkill(name, type);
    else if (addSkill(form.skills, name, 'comportamental').ok) setAskType(name);
    else pushSkill(name, 'comportamental');
  };

  const answerType = (type: SkillType) => {
    const name = askType;
    setAskType(null);
    if (name) pushSkill(name, type);
  };

  // ---------- Listas (experiências, formação, cursos, idiomas) ----------

  const saveItem = <T,>(list: ListKey, index: number | null, item: T) => {
    const current = form[list] as T[];
    const next = index === null ? [...current, item] : current.map((x, i) => (i === index ? item : x));
    set({ [list]: next } as Partial<ProfileDetails>);
    setOpen(null);
  };

  const deleteItem = (list: ListKey, index: number | null) => {
    if (index !== null) set({ [list]: (form[list] as unknown[]).filter((_, i) => i !== index) } as Partial<ProfileDetails>);
    setOpen(null);
  };

  const sheetProps = <T,>(list: ListKey) => ({
    initial: open && open.index !== null ? ((form[list] as T[])[open.index] ?? null) : null,
    onSave: (item: T) => saveItem(list, open?.index ?? null, item),
    onDelete: () => deleteItem(list, open?.index ?? null),
    onClose: () => setOpen(null),
  });

  // ---------- Salvar ----------

  const save = () => {
    setTried(true);
    if (Object.keys(validateDetails(form)).length > 0 || usernameStatus === 'taken') {
      toast.show(e.fixErrors, 'error');
      return;
    }
    saveDetails.mutate(form, {
      onSuccess: (mode) => {
        // Online: apaga a foto/capa antiga (ou a que foi trocada de novo). Sem internet, fica para a próxima.
        if (mode === 'online') {
          const saved = detailsToUpdate(form);
          cleanupPhotos(userId, [saved.photo_path, saved.cover_path]);
        }
        toast.show(mode === 'online' ? e.saved : e.savedOffline, 'success');
        router.back();
      },
      onError: (err) => {
        if (err instanceof UsernameTakenError) {
          setChecked({ username, free: false });
          toast.show(e.usernameTaken, 'error');
        } else toast.show(e.saveError, 'error');
      },
    });
  };

  const suggestions = skillSuggestions(form.area, form.skills);
  const hasPhoto = !!form.photo_path;
  const hasCover = !!form.cover_path;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.root, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 24) + space[1] }]}>
        <Pressable onPress={tryClose} accessibilityRole="button" accessibilityLabel={e.closeA11y} style={styles.iconButton}>
          <X size={24} color={colors.text} strokeWidth={iconStroke} />
        </Pressable>
        <Text accessibilityRole="header" style={styles.title}>
          {e.title}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Capa */}
        <View style={{ gap: space[3] }}>
          <CoverImage
            path={form.cover_path}
            localUri={localImage.cover}
            loading={uploading === 'cover'}
            x={form.cover_x}
            y={form.cover_y}
            style={styles.coverPreview}
          >
            <CameraButton
              label={uploading === 'cover' ? e.coverUploading : e.coverChange}
              busy={uploading === 'cover'}
              onPress={() => setPhotoSheet('cover')}
              style={styles.coverCamera}
            />
          </CoverImage>
          <View style={{ gap: space[1] }}>
            <Text weight="semibold">{e.coverTitle}</Text>
            <Text variant="bodySmall" color="textSecondary">
              {e.coverHint}
            </Text>
            {hasCover && uploading !== 'cover' && (
              <View style={styles.wrapActions}>
                <Button label={e.coverAdjust} variant="text" onPress={() => setAdjusting(true)} style={styles.inlineAction} />
                <Button label={e.coverRemove} variant="text" onPress={() => removePhoto('cover')} style={styles.inlineAction} />
              </View>
            )}
          </View>
        </View>

        {/* Foto */}
        <View style={styles.photoRow}>
          <View style={{ width: PHOTO, height: PHOTO }}>
            <Avatar
              name={form.name}
              photoPath={form.photo_path}
              localUri={localImage.avatar}
              loading={uploading === 'avatar'}
              size={PHOTO}
            />
            <CameraButton
              label={uploading === 'avatar' ? e.photoUploading : e.photoChange}
              busy={uploading === 'avatar'}
              onPress={() => setPhotoSheet('avatar')}
              style={styles.photoCamera}
            />
          </View>
          <View style={{ flex: 1, gap: space[1] }}>
            <Text weight="semibold">{e.photoTitle}</Text>
            <Text variant="bodySmall" color="textSecondary">
              {e.photoHint}
            </Text>
            {hasPhoto && uploading !== 'avatar' && (
              <Button label={e.photoRemove} variant="text" onPress={() => removePhoto('avatar')} style={styles.inlineAction} />
            )}
          </View>
        </View>

        {/* Nome, título e cidade */}
        <View style={{ gap: space[4] }}>
          <Input
            label={e.name}
            value={form.name ?? ''}
            onChangeText={(name) => set({ name })}
            maxLength={NAME_MAX}
            autoComplete="name"
            textContentType="name"
            autoCapitalize="words"
            error={errors.name}
          />
          <View style={{ gap: 6 }}>
            <Input
              label={e.username}
              value={form.username ?? ''}
              onChangeText={(value) => set({ username: value })}
              maxLength={USERNAME_MAX + 1}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
              textContentType="username"
              accessibilityHint={e.usernameHint}
              error={errors.username}
            />
            {!errors.username && (
              <Text
                variant="caption"
                color={usernameStatus === 'free' ? 'successInk' : 'textSecondary'}
                style={{ fontFamily: fonts.body400 }}
                accessibilityLiveRegion="polite"
              >
                {usernameStatus === 'checking'
                  ? e.usernameChecking
                  : usernameStatus === 'free'
                    ? e.usernameFree(username)
                    : e.usernameHint}
              </Text>
            )}
          </View>
          <View style={{ gap: 6 }}>
            <Input
              label={e.headline}
              value={form.headline ?? ''}
              onChangeText={(headline) => set({ headline })}
              maxLength={HEADLINE_MAX}
              accessibilityHint={e.headlineHint}
              error={errors.headline}
            />
            {!errors.headline && (
              <View style={styles.hintRow}>
                <Text variant="caption" color="textSecondary" style={{ flex: 1, fontFamily: fonts.body400 }}>
                  {e.headlineHint}
                </Text>
                <Text variant="caption" color="textSecondary" style={{ fontFamily: fonts.body400 }}>
                  {t.input.counter((form.headline ?? '').length, HEADLINE_MAX)}
                </Text>
              </View>
            )}
          </View>
          <Input
            label={e.city}
            placeholder={e.cityPlaceholder}
            value={form.city ?? ''}
            onChangeText={(city) => set({ city })}
            maxLength={CITY_MAX}
            autoCapitalize="words"
            error={errors.city}
          />
        </View>

        {/* Sobre mim */}
        <View style={{ gap: space[2] }}>
          <SectionTitle>{e.about}</SectionTitle>
          <Text variant="bodySmall" color="textSecondary">
            {e.aboutHint}
          </Text>
          <Input
            label={e.aboutA11y}
            hideLabel
            value={form.bio ?? ''}
            onChangeText={(bio) => set({ bio })}
            maxLength={BIO_MAX}
            long
            error={errors.bio}
          />
          <Pressable
            onPress={helpWrite}
            disabled={suggestBio.isPending}
            accessibilityRole="button"
            accessibilityLabel={suggestBio.isPending ? t.common.loading : e.helpWrite}
            accessibilityState={{ busy: suggestBio.isPending }}
            style={({ pressed }) => [styles.helpButton, { backgroundColor: colors.primarySoft }, pressed && { opacity: 0.8 }]}
          >
            <Sparkles size={16} color={colors.primaryInk} strokeWidth={iconStroke} />
            <Text variant="bodySmall" weight="semibold" style={{ color: colors.primaryInk }}>
              {suggestBio.isPending ? t.common.loading : e.helpWrite}
            </Text>
          </Pressable>
          {helped && (
            <Text variant="caption" color="textSecondary" accessibilityLiveRegion="polite">
              {e.helpApplied}
            </Text>
          )}
        </View>

        {/* Competências */}
        <View style={{ gap: space[3] }}>
          <SectionTitle>{e.skills}</SectionTitle>
          {form.skills.length > 0 && (
            <View style={styles.wrap}>
              {form.skills.map((s) => (
                <View key={s.name} style={[styles.skill, { backgroundColor: colors.primary }]}>
                  <Text variant="bodySmall" weight="semibold" style={{ color: colors.onPrimary, flexShrink: 1 }}>
                    {s.name}
                  </Text>
                  <Pressable
                    onPress={() => set({ skills: removeSkill(form.skills, s.name) })}
                    accessibilityRole="button"
                    accessibilityLabel={e.skillRemove(s.name)}
                    hitSlop={8}
                    style={styles.skillRemove}
                  >
                    <X size={14} color={colors.onPrimary} strokeWidth={2.25} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
          <View style={styles.addRow}>
            <View style={{ flex: 1 }}>
              <Input
                label={e.skillInput}
                hideLabel
                placeholder={e.skillPlaceholder}
                value={skillDraft}
                onChangeText={setSkillDraft}
                maxLength={SKILL_NAME_MAX}
                returnKeyType="done"
                submitBehavior="submit"
                onSubmitEditing={addDraft}
              />
            </View>
            <Pressable
              onPress={addDraft}
              accessibilityRole="button"
              accessibilityLabel={e.skillAdd}
              style={({ pressed }) => [styles.addButton, { backgroundColor: colors.primarySoft }, pressed && { opacity: 0.8 }]}
            >
              <Text style={{ fontFamily: fonts.body600, fontSize: 22, lineHeight: 28, color: colors.primaryInk }}>+</Text>
            </Pressable>
          </View>
          {suggestions.length > 0 && (
            <View style={{ gap: space[2] }}>
              <Text variant="caption" weight="semibold" color="textSecondary">
                {e.skillSuggestions(t.options.area[form.area ?? 'outra'])}
              </Text>
              <View style={styles.wrap}>
                {suggestions.map((s) => (
                  <Pressable
                    key={s.name}
                    onPress={() => pushSkill(s.name, s.type)}
                    accessibilityRole="button"
                    accessibilityLabel={e.skillSuggestionA11y(s.name)}
                    hitSlop={{ top: 4, bottom: 4 }}
                    style={({ pressed }) => [
                      styles.suggestion,
                      { borderColor: colors.textDisabled, backgroundColor: colors.surface },
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <Text variant="bodySmall" weight="medium">
                      + {s.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* O que você busca */}
        <View style={{ gap: space[3] }}>
          <SectionTitle>{e.seeking}</SectionTitle>
          <View accessibilityRole="radiogroup" accessibilityLabel={e.goalA11y} style={styles.wrap}>
            {GOALS.map((g) => (
              <Chip key={g} label={t.options.goal[g]} selected={form.goal === g} onPress={() => set({ goal: g })} />
            ))}
          </View>

          <FieldLabel>{e.area}</FieldLabel>
          <View accessibilityRole="radiogroup" accessibilityLabel={e.area} style={styles.wrap}>
            {AREAS.map((a) => (
              <Chip key={a} label={t.options.area[a]} selected={form.area === a} onPress={() => set({ area: a })} />
            ))}
          </View>

          <FieldLabel>
            {e.availability}{' '}
            <Text variant="bodySmall" color="textSecondary">
              {e.availabilityMulti}
            </Text>
          </FieldLabel>
          <View accessibilityLabel={e.availability} style={styles.wrap}>
            {AVAILABILITY.map((a) => {
              const on = form.availability.includes(a);
              return (
                <Chip
                  key={a}
                  role="checkbox"
                  label={t.options.availability[a]}
                  selected={on}
                  onPress={() => set({ availability: on ? form.availability.filter((x) => x !== a) : [...form.availability, a] })}
                />
              );
            })}
          </View>

          <FieldLabel>{e.format}</FieldLabel>
          <View accessibilityRole="radiogroup" accessibilityLabel={e.format} style={styles.wrap}>
            {WORK_FORMATS.map((f) => (
              <Chip
                key={f}
                label={t.options.workFormat[f]}
                selected={form.work_format === f}
                // Tocar de novo no escolhido desmarca (o campo é opcional).
                onPress={() => set({ work_format: form.work_format === f ? null : f })}
              />
            ))}
          </View>
        </View>

        {/* Experiências */}
        <View style={styles.listSection}>
          <SectionTitle>{e.experiences}</SectionTitle>
          <Text variant="bodySmall" color="textSecondary">
            {e.experiencesHint}
          </Text>
          <ItemList
            items={form.experiences.map((x) => ({
              title: [x.title, x.place].filter(Boolean).join(' · '),
              subtitle: m.period(x.start, x.end),
            }))}
            onPress={(index) => setOpen({ list: 'experiences', index })}
          />
          <Button label={e.addExperience} variant="text" onPress={() => setOpen({ list: 'experiences', index: null })} style={styles.inlineAction} />
        </View>

        {/* Formação e cursos */}
        <View style={styles.listSection}>
          <SectionTitle>{e.educationTitle}</SectionTitle>
          <ItemList
            items={[
              ...form.education.map((x) => ({ title: x.course, subtitle: m.educationLine(x.institution, x.status, x.year) })),
              ...form.courses.map((x) => ({ title: x.name, subtitle: [x.institution, x.year].filter(Boolean).join(' · ') || m.courses })),
            ]}
            onPress={(index) =>
              index < form.education.length
                ? setOpen({ list: 'education', index })
                : setOpen({ list: 'courses', index: index - form.education.length })
            }
          />
          <View style={styles.wrapActions}>
            <Button label={e.addEducation} variant="text" onPress={() => setOpen({ list: 'education', index: null })} style={styles.inlineAction} />
            <Button label={e.addCourse} variant="text" onPress={() => setOpen({ list: 'courses', index: null })} style={styles.inlineAction} />
          </View>
        </View>

        {/* Idiomas */}
        <View style={styles.listSection}>
          <SectionTitle>{e.languages}</SectionTitle>
          <ItemList
            items={form.languages.map((x) => ({ title: x.language, subtitle: t.options.languageLevel[x.level] }))}
            onPress={(index) => setOpen({ list: 'languages', index })}
          />
          <Button label={e.addLanguage} variant="text" onPress={() => setOpen({ list: 'languages', index: null })} style={styles.inlineAction} />
        </View>

        {/* Links */}
        <View style={{ gap: space[4] }}>
          <SectionTitle>{e.links}</SectionTitle>
          <Input
            label={e.linkedin}
            placeholder={e.linkedinPlaceholder}
            value={form.linkedin_url ?? ''}
            onChangeText={(linkedin_url) => set({ linkedin_url })}
            maxLength={LINK_MAX}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="URL"
            error={errors.linkedin_url}
          />
          <Input
            label={`${e.instagram} ${e.optional}`}
            placeholder={e.instagramPlaceholder}
            value={form.instagram ?? ''}
            onChangeText={(instagram) => set({ instagram })}
            maxLength={LINK_MAX}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="username"
            error={errors.instagram}
          />
          <Input
            label={`${e.portfolio} ${e.optional}`}
            placeholder="https://"
            value={form.portfolio_url ?? ''}
            onChangeText={(portfolio_url) => set({ portfolio_url })}
            maxLength={LINK_MAX}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="URL"
            error={errors.portfolio_url}
          />
        </View>

        {/* Privacidade: aparecer no Explorar (padrão desligado) */}
        <View style={{ gap: space[3] }}>
          <SectionTitle>{e.privacyTitle}</SectionTitle>
          <Group>
            <SwitchRow
              icon={Compass}
              title={e.publicTitle}
              subtitle={e.publicText}
              value={form.is_public}
              onChange={(is_public) => set({ is_public })}
            >
              <View style={[styles.privacy, { borderTopColor: colors.border }]}>
                <ShieldCheck size={16} color={colors.textSecondary} strokeWidth={iconStroke} style={{ marginTop: 1 }} />
                <Text variant="caption" color="textSecondary" style={{ flex: 1, fontFamily: fonts.body400, lineHeight: 18 }}>
                  {e.privacy}
                </Text>
              </View>
            </SwitchRow>
          </Group>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, space[5]) + space[3] },
        ]}
      >
        <Button label={e.save} onPress={save} loading={saveDetails.isPending} disabled={uploading !== null} />
      </View>

      {/* Foto ou capa: galeria, câmera ou remover */}
      <BottomSheet
        visible={photoSheet !== null}
        onClose={() => setPhotoSheet(null)}
        title={photoSheet === 'cover' ? e.coverTitle : e.photoSheetTitle}
      >
        <Button label={e.photoGallery} onPress={() => choosePhoto('gallery')} />
        <Button label={e.photoCamera} variant="secondary" onPress={() => choosePhoto('camera')} />
        {photoSheet === 'avatar' && hasPhoto && <Button label={e.photoRemove} variant="text" onPress={() => removePhoto('avatar')} />}
        {photoSheet === 'cover' && hasCover && <Button label={e.coverRemove} variant="text" onPress={() => removePhoto('cover')} />}
      </BottomSheet>

      {/* "Me ajude a escrever": só troca o texto se a pessoa confirmar */}
      <BottomSheet visible={suggestion !== null} onClose={() => setSuggestion(null)} title={e.helpTitle} description={e.helpText}>
        <Card style={{ backgroundColor: colors.background, marginBottom: space[2] }}>
          <Text>{suggestion}</Text>
        </Card>
        <Button label={e.helpUse} onPress={applySuggestion} />
        <Button label={e.helpKeep} variant="text" onPress={() => setSuggestion(null)} />
      </BottomSheet>

      {/* Tipo da competência, quando não é óbvio (padrão: comportamental) */}
      <BottomSheet
        visible={askType !== null}
        onClose={() => setAskType(null)}
        title={askType ? e.skillTypeTitle(askType) : undefined}
        description={e.skillTypeText}
      >
        <Button label={t.options.skillType.comportamental} onPress={() => answerType('comportamental')} />
        <Button label={t.options.skillType.tecnica} variant="secondary" onPress={() => answerType('tecnica')} />
      </BottomSheet>

      {/* Sair sem salvar? */}
      <BottomSheet visible={discardSheet} onClose={() => setDiscardSheet(false)} title={e.discardTitle} description={e.discardText}>
        <Button label={e.discardKeep} onPress={() => setDiscardSheet(false)} />
        <Button
          label={e.discardLeave}
          variant="text"
          onPress={() => {
            setDiscardSheet(false);
            leave();
          }}
        />
      </BottomSheet>

      {adjusting && !!form.cover_path && (
        <CoverPositionEditor
          path={form.cover_path}
          localUri={localImage.cover}
          initial={{ x: form.cover_x, y: form.cover_y }}
          onSave={({ x, y }) => {
            set({ cover_x: x, cover_y: y });
            setAdjusting(false);
          }}
          onClose={() => setAdjusting(false)}
        />
      )}

      {open?.list === 'experiences' && <ExperienceSheet {...sheetProps<Experience>('experiences')} />}
      {open?.list === 'education' && <EducationSheet {...sheetProps<Education>('education')} />}
      {open?.list === 'courses' && <CourseSheet {...sheetProps<Course>('courses')} />}
      {open?.list === 'languages' && <LanguageSheet {...sheetProps<Language>('languages')} />}
    </KeyboardAvoidingView>
  );
}

/** Botão redondo de câmera por cima da foto e da capa. */
function CameraButton({
  label,
  busy,
  onPress,
  style,
}: {
  label: string;
  busy: boolean;
  onPress: () => void;
  style: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ busy }}
      hitSlop={4}
      style={[styles.cameraButton, { backgroundColor: colors.primary, borderColor: colors.background }, style]}
    >
      <Camera size={18} color={colors.onPrimary} strokeWidth={iconStroke} />
    </Pressable>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Text variant="sectionTitle" accessibilityRole="header">
      {children}
    </Text>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <Text variant="bodySmall" weight="semibold" style={{ paddingTop: space[1] }}>
      {children}
    </Text>
  );
}

/** Card com os itens da lista; tocar num item abre o sheet de edição. Vazia: não mostra nada. */
function ItemList({ items, onPress }: { items: { title: string; subtitle: string }[]; onPress: (index: number) => void }) {
  const { colors } = useTheme();
  if (items.length === 0) return null;
  return (
    <View style={[styles.list, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {items.map((x, i) => (
        <Pressable
          key={`${x.title}-${i}`}
          onPress={() => onPress(i)}
          accessibilityRole="button"
          accessibilityLabel={e.editItemA11y(x.title)}
          style={({ pressed }) => [
            styles.listItem,
            i > 0 && { borderTopWidth: 1, borderTopColor: colors.border },
            pressed && { opacity: 0.7 },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text weight="semibold" style={{ fontSize: 15, lineHeight: 21 }}>
              {x.title}
            </Text>
            {!!x.subtitle && (
              <Text variant="bodySmall" color="textSecondary" style={{ fontSize: 13, lineHeight: 18 }}>
                {x.subtitle}
              </Text>
            )}
          </View>
          <Pencil size={18} color={colors.textSecondary} strokeWidth={iconStroke} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: space[1], paddingLeft: space[2], paddingRight: screenPadding },
  iconButton: { width: size.minTouch, height: size.minTouch, borderRadius: radius.chip, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.heading700, fontSize: 20, lineHeight: 26, flexShrink: 1 },
  content: { paddingHorizontal: screenPadding, paddingTop: space[5], paddingBottom: space[6], gap: 28 },
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: space[4] },
  coverPreview: { width: '100%', aspectRatio: COVER_RATIO, borderRadius: radius.card },
  coverCamera: { right: space[3], bottom: space[3] },
  photoCamera: { right: -4, bottom: -4 },
  cameraButton: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: radius.chip,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineAction: { alignSelf: 'flex-start', marginHorizontal: -space[4] },
  hintRow: { flexDirection: 'row', gap: space[3] },
  helpButton: {
    alignSelf: 'flex-start',
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  wrapActions: { flexDirection: 'row', flexWrap: 'wrap', columnGap: space[5] },
  skill: {
    minHeight: 40,
    paddingLeft: 14,
    paddingRight: space[1],
    borderRadius: radius.chip,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    maxWidth: '100%',
  },
  skillRemove: { width: 32, height: 32, borderRadius: radius.chip, alignItems: 'center', justifyContent: 'center' },
  addRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space[2] },
  addButton: { width: size.minTouch, height: size.inputHeight, borderRadius: radius.input, alignItems: 'center', justifyContent: 'center' },
  suggestion: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: radius.chip,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listSection: { gap: 10 },
  list: { borderRadius: radius.card, borderWidth: 1, overflow: 'hidden' },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: space[3], paddingVertical: 14, paddingHorizontal: space[4], minHeight: size.minTouch },
  privacy: { flexDirection: 'row', alignItems: 'flex-start', gap: space[2], paddingTop: 14, borderTopWidth: 1 },
  footer: { paddingHorizontal: screenPadding, paddingTop: space[4], borderTopWidth: 1 },
});
