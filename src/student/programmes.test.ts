import { describe, expect, it } from 'vitest'
import {
  findPaper,
  formatProgrammeSummary,
  isProvisional,
  papersFor,
  programmes,
  yearsFor,
} from './programmes'

const codes = (programmeId: string, year: number) => papersFor(programmeId, year).map((p) => p.code)
const points = (programmeId: string, year: number) =>
  papersFor(programmeId, year).reduce((sum, p) => sum + p.points, 0)

describe('programmes', () => {
  it('lists BNurs and MNursPrac with official names', () => {
    expect(programmes.map((p) => [p.id, p.name, p.abbreviation, p.points])).toEqual([
      ['bnurs', 'Bachelor of Nursing', 'BNurs', 360],
      ['mnursprac', 'Master of Nursing Practice', 'MNursPrac', 240],
    ])
  })

  it('gives BNurs three years and MNursPrac two', () => {
    expect(yearsFor('bnurs').map((y) => y.year)).toEqual([1, 2, 3])
    expect(yearsFor('mnursprac').map((y) => y.year)).toEqual([1, 2])
  })

  it('maps BNurs Year 1 to the 100-level papers', () => {
    expect(codes('bnurs', 1)).toEqual([
      'NURSE101',
      'NURSE102',
      'NURSE103',
      'NURSE104',
      'NURSE112',
      'NURSE113',
      'NURSE120',
    ])
  })

  it('makes each BNurs year total 120 points', () => {
    expect([1, 2, 3].map((year) => points('bnurs', year))).toEqual([120, 120, 120])
  })

  it('gives MNursPrac 240 points including NURSE579', () => {
    expect(points('mnursprac', 1)).toBe(240)
    expect(codes('mnursprac', 2)).toContain('NURSE579')
  })

  it('excludes papers not clearly in either programme', () => {
    const all = programmes.flatMap((p) => p.years.flatMap((y) => y.papers.map((x) => x.code)))
    expect(all).not.toContain('NURSE001')
    expect(all).not.toContain('HLTSC593')
  })

  it('returns no papers for unknown programmes or years', () => {
    expect(papersFor('bnurs', 4)).toEqual([])
    expect(papersFor('nope', 1)).toEqual([])
    expect(papersFor('', '')).toEqual([])
  })

  it('accepts the year as a string from a select element', () => {
    expect(codes('bnurs', 2)).toEqual(papersFor('bnurs', '2').map((p) => p.code))
  })

  it('marks year mappings as provisional', () => {
    expect(isProvisional('bnurs', 2)).toBe(true)
    expect(isProvisional('mnursprac', '1')).toBe(true)
    expect(isProvisional('nope', 1)).toBe(false)
  })

  it('finds a paper by code', () => {
    expect(findPaper('NURSE204')?.title).toBe('Pharmacology for Nurses')
    expect(findPaper('NURSE999')).toBeUndefined()
  })

  it('formats a programme summary', () => {
    expect(
      formatProgrammeSummary({ programme: 'bnurs', yearOfStudy: 2, paperCode: 'NURSE204' }),
    ).toBe('BNurs · Year 2 · NURSE204')
    expect(formatProgrammeSummary({ programme: 'mnursprac', yearOfStudy: 1 })).toBe(
      'MNursPrac · Year 1',
    )
    expect(formatProgrammeSummary({})).toBeNull()
  })
})
