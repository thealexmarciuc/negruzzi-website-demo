export const MESSAGE_SUBJECTS = [
  { label: 'Secretariat', value: 'secretariat' },
  { label: 'Admitere', value: 'admitere' },
  { label: 'Contabilitate', value: 'contabilitate' },
  { label: 'Biblioteca', value: 'biblioteca' },
  { label: 'Altceva', value: 'altceva' },
]

export type ContactState = {
  status: 'idle' | 'sent' | 'error'
  errors?: Partial<Record<'name' | 'email' | 'subject' | 'message' | 'consent' | 'form', string>>
  values?: { name: string; email: string; subject: string; message: string }
}

export type ContactInput = { name: string; email: string; subject: string; message: string; consent: boolean; website: string }

// Validation shared by the form action and its tests. Messages are in Romanian, shown next to each field.
export function validateContact(input: ContactInput): ContactState['errors'] {
  const errors: NonNullable<ContactState['errors']> = {}
  if (input.name.length < 2) errors.name = 'Scrie-ți numele.'
  else if (input.name.length > 120) errors.name = 'Numele este prea lung.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.email)) errors.email = 'Adresa de e-mail nu pare corectă.'
  if (!MESSAGE_SUBJECTS.some((s) => s.value === input.subject)) errors.subject = 'Alege un subiect.'
  if (input.message.length < 10) errors.message = 'Mesajul este prea scurt.'
  else if (input.message.length > 5000) errors.message = 'Mesajul poate avea cel mult 5000 de caractere.'
  if (!input.consent) errors.consent = 'Avem nevoie de acordul tău ca să-ți putem răspunde.'
  return errors
}

export function readContactForm(form: FormData): ContactInput {
  const text = (key: string) => String(form.get(key) ?? '').trim()
  return {
    name: text('name'),
    email: text('email').toLowerCase(),
    subject: text('subject'),
    message: text('message'),
    consent: form.get('consent') === 'on',
    website: text('website'),
  }
}
