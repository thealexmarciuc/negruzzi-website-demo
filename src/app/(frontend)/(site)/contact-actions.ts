'use server'

import { type ContactState, readContactForm, validateContact } from '@/lib/contact'
import { payload } from '@/lib/site'

export async function sendMessage(_: ContactState, form: FormData): Promise<ContactState> {
  const input = readContactForm(form)
  const values = { name: input.name, email: input.email, subject: input.subject, message: input.message }
  // Bots fill the hidden "website" field; pretend it worked so they do not retry.
  if (input.website) return { status: 'sent' }

  const errors = validateContact(input)
  if (errors && Object.keys(errors).length) return { status: 'error', errors, values }

  try {
    await (await payload()).create({
      collection: 'messages',
      data: { ...values, subject: values.subject as never, status: 'nou', consentAt: new Date().toISOString() },
      overrideAccess: true,
    })
    return { status: 'sent' }
  } catch {
    return { status: 'error', errors: { form: 'Mesajul nu a putut fi trimis. Încearcă din nou peste câteva minute.' }, values }
  }
}
