'use client'

import React, { useEffect, useRef, useState } from 'react'

import { A11Y_KEY } from '@/lib/a11y'


type Prefs = { text: number; contrast: 'normal' | 'high' | 'mono'; underline: boolean; readable: boolean; still: boolean; cursor: boolean }
const DEFAULTS: Prefs = { text: 0, contrast: 'normal', underline: false, readable: false, still: false, cursor: false }

const TOGGLES: { key: 'underline' | 'readable' | 'still' | 'cursor'; label: string; hint: string }[] = [
  { key: 'underline', label: 'Subliniază linkurile', hint: 'Linkurile se văd clar în text' },
  { key: 'readable', label: 'Font ușor de citit', hint: 'Litere mai late, spațiere mai mare' },
  { key: 'still', label: 'Oprește animațiile', hint: 'Fără mișcare și tranziții' },
  { key: 'cursor', label: 'Cursor mare', hint: 'Indicator de mouse mărit' },
]


function applyPrefs(p: Prefs) {
  const d = document.documentElement
  if (p.text) d.dataset.text = String(p.text)
  else delete d.dataset.text
  if (p.contrast !== 'normal') d.dataset.contrast = p.contrast
  else delete d.dataset.contrast
  for (const t of TOGGLES) {
    if (p[t.key]) d.dataset[t.key] = ''
    else delete d.dataset[t.key]
  }
}

function load(): Prefs {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(A11Y_KEY) ?? '{}') }
  } catch {
    return DEFAULTS
  }
}

export function AccessibilityPanel() {
  const dialog = useRef<HTMLDialogElement>(null)
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS)
  useEffect(() => setPrefs(load()), [])
  useEffect(() => {
    // Before the saved settings are read, the boot script has already applied them: nothing to do.
    if (prefs === DEFAULTS) return
    applyPrefs(prefs)
    try {
      localStorage.setItem(A11Y_KEY, JSON.stringify(prefs))
    } catch {
      // Private mode: the settings still apply to this page.
    }
  }, [prefs])

  const update = (change: Partial<Prefs>) => setPrefs((current) => ({ ...current, ...change }))

  return (
    <>
      <button className="utility__a11y" type="button" onClick={() => dialog.current?.showModal()} aria-haspopup="dialog">
        Accesibilitate
      </button>
      <dialog
        ref={dialog}
        className="a11y"
        aria-labelledby="a11y-title"
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current.close()
        }}
      >
        <div className="a11y__inner">
          <div className="a11y__head">
            <h2 id="a11y-title" className="h3" style={{ fontSize: 22 }}>
              Accesibilitate
            </h2>
            <button className="icon-button" type="button" aria-label="Închide" onClick={() => dialog.current?.close()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="a11y__group">
            <span id="a11y-text" className="a11y__label">
              Mărimea textului
            </span>
            <div className="a11y__segmented" role="group" aria-labelledby="a11y-text">
              {[0, 1, 2, 3].map((size) => (
                <button
                  key={size}
                  type="button"
                  aria-pressed={prefs.text === size}
                  aria-label={['Text normal', 'Text mare', 'Text foarte mare', 'Text maxim'][size]}
                  onClick={() => update({ text: size })}
                  style={{ fontSize: 14 + size * 3 }}
                >
                  A
                </button>
              ))}
            </div>
          </div>

          <div className="a11y__group">
            <span id="a11y-contrast" className="a11y__label">
              Contrast
            </span>
            <div className="a11y__segmented" role="group" aria-labelledby="a11y-contrast">
              {(
                [
                  ['normal', 'Normal'],
                  ['high', 'Ridicat'],
                  ['mono', 'Monocrom'],
                ] as const
              ).map(([value, label]) => (
                <button key={value} type="button" aria-pressed={prefs.contrast === value} onClick={() => update({ contrast: value })}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <ul className="a11y__toggles">
            {TOGGLES.map((t) => (
              <li key={t.key}>
                <label>
                  <span>
                    <span className="a11y__toggle-label">{t.label}</span>
                    <span className="small muted">{t.hint}</span>
                  </span>
                  <input type="checkbox" role="switch" checked={prefs[t.key]} onChange={(e) => update({ [t.key]: e.target.checked })} />
                </label>
              </li>
            ))}
          </ul>

          <button className="button button--outline" type="button" onClick={() => update(DEFAULTS)}>
            Resetează
          </button>
        </div>
      </dialog>
    </>
  )
}
