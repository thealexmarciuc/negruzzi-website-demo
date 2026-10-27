'use client'

import React, { useActionState } from 'react'

import { sendMessage } from '@/app/(frontend)/(site)/contact-actions'
import { type ContactState, MESSAGE_SUBJECTS } from '@/lib/contact'

const initial: ContactState = { status: 'idle' }

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <span className="field__error" id={id}>
      {message}
    </span>
  )
}

export function ContactForm() {
  const [state, action, pending] = useActionState(sendMessage, initial)
  const e = state.errors ?? {}
  const v = state.values

  if (state.status === 'sent') {
    return (
      <div className="card form-done" role="status">
        <p className="h3" style={{ fontSize: 22 }}>
          Mulțumim, mesajul a fost trimis.
        </p>
        <p className="muted" style={{ margin: 0 }}>
          Îți răspundem pe e-mail în zilele lucrătoare.
        </p>
      </div>
    )
  }

  const invalid = (key: keyof typeof e) => (e[key] ? { 'aria-invalid': true, 'aria-describedby': `err-${key}` } : {})

  return (
    <form className="card contact-form" action={action} noValidate>
      {e.form && (
        <p className="field__error" role="alert" style={{ margin: 0 }}>
          {e.form}
        </p>
      )}
      <div className="contact-form__row">
        <div className="field">
          <label htmlFor="c-name">Nume și prenume</label>
          <input className="input" id="c-name" name="name" autoComplete="name" required defaultValue={v?.name} {...invalid('name')} />
          <FieldError id="err-name" message={e.name} />
        </div>
        <div className="field">
          <label htmlFor="c-email">E-mail</label>
          <input className="input" id="c-email" name="email" type="email" autoComplete="email" required defaultValue={v?.email} {...invalid('email')} />
          <FieldError id="err-email" message={e.email} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="c-subject">Subiect</label>
        <select className="input" id="c-subject" name="subject" defaultValue={v?.subject ?? 'secretariat'} {...invalid('subject')}>
          {MESSAGE_SUBJECTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <FieldError id="err-subject" message={e.subject} />
      </div>
      <div className="field">
        <label htmlFor="c-message">Mesaj</label>
        <textarea className="input textarea" id="c-message" name="message" rows={6} required maxLength={5000} defaultValue={v?.message} {...invalid('message')} />
        <FieldError id="err-message" message={e.message} />
      </div>
      {/* Left empty by people; bots fill it in. */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="c-website">Site web</label>
        <input id="c-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div>
        <label className="option" style={{ alignItems: 'flex-start' }}>
          <input type="checkbox" name="consent" style={{ marginTop: 3 }} {...invalid('consent')} />
          <span>Sunt de acord cu prelucrarea datelor mele personale ca să primesc un răspuns la acest mesaj.</span>
        </label>
        <FieldError id="err-consent" message={e.consent} />
      </div>
      <button className="button" type="submit" disabled={pending} style={{ alignSelf: 'flex-start' }}>
        {pending ? 'Se trimite…' : 'Trimite mesajul'}
      </button>
    </form>
  )
}
