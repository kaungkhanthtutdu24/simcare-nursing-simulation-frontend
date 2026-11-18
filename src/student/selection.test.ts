import { describe, expect, it } from 'vitest'
import { nextSelection } from './selection'

describe('nextSelection', () => {
  it('clears year and paper when the programme no longer offers them', () => {
    expect(
      nextSelection(
        { programme: 'bnurs', yearOfStudy: '3', paperCode: 'NURSE303' },
        { programme: 'mnursprac' },
      ),
    ).toEqual({ programme: 'mnursprac', yearOfStudy: '', paperCode: '' })
  })

  it('keeps a year the new programme also has, but clears a paper it does not offer', () => {
    expect(
      nextSelection(
        { programme: 'bnurs', yearOfStudy: '1', paperCode: 'NURSE101' },
        { programme: 'mnursprac' },
      ),
    ).toEqual({ programme: 'mnursprac', yearOfStudy: '1', paperCode: '' })
  })

  it('clears the paper when the year changes', () => {
    expect(
      nextSelection(
        { programme: 'bnurs', yearOfStudy: '1', paperCode: 'NURSE101' },
        { yearOfStudy: '2' },
      ),
    ).toEqual({ programme: 'bnurs', yearOfStudy: '2', paperCode: '' })
  })

  it('keeps the paper when it is still offered', () => {
    expect(
      nextSelection(
        { programme: 'mnursprac', yearOfStudy: '1', paperCode: 'NURSE579' },
        { yearOfStudy: '2' },
      ),
    ).toEqual({ programme: 'mnursprac', yearOfStudy: '2', paperCode: 'NURSE579' })
  })

  it('clears everything below when the programme is cleared', () => {
    expect(
      nextSelection(
        { programme: 'bnurs', yearOfStudy: '2', paperCode: 'NURSE204' },
        { programme: '' },
      ),
    ).toEqual({ programme: '', yearOfStudy: '', paperCode: '' })
  })
})
