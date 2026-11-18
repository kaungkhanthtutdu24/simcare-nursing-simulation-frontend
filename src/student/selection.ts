import { papersFor, yearsFor } from './programmes'

/** Form state for the three dependent dropdowns. Values are strings, as select elements use. */
export interface ProgrammeSelection {
  programme: string
  yearOfStudy: string
  paperCode: string
}

export const emptySelection: ProgrammeSelection = { programme: '', yearOfStudy: '', paperCode: '' }

/**
 * Applies a change and clears any dependent choice that is no longer valid:
 * a year the programme does not have, or a paper the year does not offer.
 */
export function nextSelection(
  prev: ProgrammeSelection,
  change: Partial<ProgrammeSelection>,
): ProgrammeSelection {
  const next = { ...prev, ...change }
  if (!yearsFor(next.programme).some((y) => String(y.year) === next.yearOfStudy)) {
    next.yearOfStudy = ''
  }
  if (!papersFor(next.programme, next.yearOfStudy).some((p) => p.code === next.paperCode)) {
    next.paperCode = ''
  }
  return next
}
