// Shared helpers for the student / teacher details used by both generators.

export const PRONOUNS = {
  she: { subj: 'she', obj: 'her', poss: 'her' },
  he: { subj: 'he', obj: 'him', poss: 'his' },
  they: { subj: 'they', obj: 'them', poss: 'their' },
}

export function firstName(full) {
  return full.trim().split(/\s+/)[0] || full.trim()
}
