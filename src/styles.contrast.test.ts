import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * jsdom cannot compute colour contrast, so this reads the stylesheet directly.
 * Every hex text colour must reach 4.5:1 on white (WCAG AA), except rules whose
 * text sits on a dark or coloured background, or that only colour decorative
 * icons and separators. Those are listed here on purpose.
 */
const onDarkOrDecorative = new Set([
  '.titlebar {',
  '.brand-mark {',
  '.brand small {',
  '.simulation-badge {',
  '.course-label {',
  '.role-switch {',
  '.primary-button {',
  '.progress-step.done > span {',
  '.toast {',
  '.inbox-flag {',
  '.nav-count {',
  '.auth-intro {',
  '.auth-eyebrow {',
  '.auth-intro p {',
  '.auth-points {',
  '.auth-points svg {',
  '.menu-button {',
  '.account-name {',
  '.account-name small {',
  '.account-action {',
  // Decorative icons and separators (non-text)
  '.pencil {',
  '.inbox {',
  '.review {',
  '.attention-icon {',
  '.divider {',
  '.footer-divider {',
])

function luminance(hex: string): number {
  const full = hex.length === 4 ? [...hex.slice(1)].map((c) => c + c).join('') : hex.slice(1)
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(full.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const contrastOnWhite = (hex: string) => 1.05 / (luminance(hex) + 0.05)

describe('stylesheet text colours', () => {
  it('meet 4.5:1 on white unless the rule is on a dark background or decorative', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8')
    const failures: string[] = []
    let selector = ''
    for (const line of css.split('\n')) {
      if (line.trimEnd().endsWith('{')) selector = line.trim()
      const match = /^\s+color:\s*(#[0-9a-fA-F]{3,6})\s*;/.exec(line)
      if (!match || onDarkOrDecorative.has(selector)) continue
      const ratio = contrastOnWhite(match[1])
      if (ratio < 4.5) failures.push(`${selector} ${match[1]} (${ratio.toFixed(2)}:1)`)
    }
    expect(failures).toEqual([])
  })
})
