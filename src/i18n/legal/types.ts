export type LegalSection = { title: string; body: string };

/** Mesmas seções, na mesma ordem, em todos os idiomas. */
export type LegalDocs = { privacy: LegalSection[]; terms: LegalSection[] };
