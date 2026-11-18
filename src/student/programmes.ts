/**
 * University of Waikato nursing programmes and papers, used by the student
 * registration and profile forms.
 *
 * Verified from the university website on 2026-11-18: programme names,
 * abbreviations, total points, and paper codes, titles and points.
 *
 * NOT verified: which year of study each paper belongs to. The university
 * pages do not state it. The mapping below follows paper levels (100-level =
 * Year 1, and so on) and is marked 'provisional' until a supervisor confirms
 * it. Change `mappingStatus` to 'verified' once it is confirmed.
 */

export type ProgrammeId = 'bnurs' | 'mnursprac'

export interface Paper {
  code: string
  title: string
  points: number
}

export interface YearOfStudy {
  year: number
  label: string
  mappingStatus: 'verified' | 'provisional'
  papers: Paper[]
}

export interface Programme {
  id: ProgrammeId
  name: string
  abbreviation: string
  points: number
  years: YearOfStudy[]
  sourceUrl: string
}

export const PAPERS_SOURCE_URL = 'https://www.waikato.ac.nz/study/subject-regulations/nursing/2026/'

const paper = (code: string, title: string, points: number): Paper => ({ code, title, points })

const level100 = [
  paper('NURSE101', 'Health Assessment and Nursing Practice', 15),
  paper('NURSE102', 'Applied Health Science 1', 15),
  paper('NURSE103', 'Nursing Practicum 1A', 15),
  paper('NURSE104', 'The Socio-Political Context of Health and Healthcare', 15),
  paper('NURSE112', 'Applied Health Science 1B', 15),
  paper('NURSE113', 'Nursing Practicum 1B', 30),
  paper('NURSE120', 'Navigating Hauora for Nurses', 15),
]

const level200 = [
  paper('NURSE201', 'Health Assessment and Nursing Practice 2', 15),
  paper('NURSE202', 'Applied Health Science 2A', 15),
  paper('NURSE203', 'Nursing Practicum 2A', 15),
  paper('NURSE204', 'Pharmacology for Nurses', 15),
  paper('NURSE212', 'Applied Health Science 2B', 15),
  paper('NURSE213', 'Nursing Practicum 2B', 30),
  paper('NURSE220', 'Facilitating Hauora in Aotearoa', 15),
]

const level300 = [
  paper('NURSE301', 'Health Assessment and Nursing Practice 3', 30),
  paper('NURSE302', 'Applied Health Science 3', 30),
  paper('NURSE303', 'Nursing Practicum 3', 45),
  paper('NURSE305', 'Generating and Interpreting Evidence for Clinical Practice', 15),
]

const level500 = [
  paper('NURSE520', 'Navigating Hauora for Nurses', 15),
  paper('NURSE570', 'Professional Nursing Practice in Aotearoa Society', 15),
  paper('NURSE571', 'Applied Science for Nursing Practice I', 15),
  paper('NURSE572', 'Nursing Practicum I', 30),
  paper('NURSE573', 'Nursing Practicum II', 30),
  paper('NURSE574', 'Applied Science for Nursing Practice II', 15),
  paper('NURSE575', 'Applied Science for Nursing Practice III', 15),
  paper('NURSE576', 'Pharmacology for Nursing Practice', 15),
  paper('NURSE577', 'Nursing Practicum III', 30),
  paper('NURSE578', 'Research in Healthcare Practice', 15),
  paper('NURSE579', 'Transition to Registered Nurse Practice', 45),
]

const year = (n: number, papers: Paper[]): YearOfStudy => ({
  year: n,
  label: `Year ${n}`,
  mappingStatus: 'provisional',
  papers,
})

export const programmes: Programme[] = [
  {
    id: 'bnurs',
    name: 'Bachelor of Nursing',
    abbreviation: 'BNurs',
    points: 360,
    years: [year(1, level100), year(2, level200), year(3, level300)],
    sourceUrl: 'https://www.waikato.ac.nz/study/qualifications/bachelor-of-nursing/',
  },
  {
    id: 'mnursprac',
    name: 'Master of Nursing Practice',
    abbreviation: 'MNursPrac',
    points: 240,
    // The year split for MNursPrac papers is unknown, so both years list all of them.
    years: [year(1, level500), year(2, level500)],
    sourceUrl: 'https://www.waikato.ac.nz/study/qualifications/master-of-nursing-practice/',
  },
]

export function findProgramme(id: string): Programme | undefined {
  return programmes.find((p) => p.id === id)
}

export function yearsFor(programmeId: string): YearOfStudy[] {
  return findProgramme(programmeId)?.years ?? []
}

function findYear(programmeId: string, yearOfStudy: number | string): YearOfStudy | undefined {
  return yearsFor(programmeId).find((y) => String(y.year) === String(yearOfStudy))
}

export function papersFor(programmeId: string, yearOfStudy: number | string): Paper[] {
  return findYear(programmeId, yearOfStudy)?.papers ?? []
}

export function isProvisional(programmeId: string, yearOfStudy: number | string): boolean {
  return findYear(programmeId, yearOfStudy)?.mappingStatus === 'provisional'
}

export function findPaper(code: string): Paper | undefined {
  return [...level100, ...level200, ...level300, ...level500].find((p) => p.code === code)
}

export function formatProgrammeSummary(profile: {
  programme?: string
  yearOfStudy?: number
  paperCode?: string
}): string | null {
  const programme = profile.programme ? findProgramme(profile.programme) : undefined
  if (!programme) return null
  return [
    programme.abbreviation,
    profile.yearOfStudy ? `Year ${profile.yearOfStudy}` : null,
    profile.paperCode || null,
  ]
    .filter(Boolean)
    .join(' · ')
}
