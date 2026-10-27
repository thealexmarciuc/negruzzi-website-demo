// Fills the menu, homepage and contact globals with the structure from the design canvas,
// pointing at the imported pages and categories. Safe to re-run: it overwrites the three globals.
// Usage: npx tsx --env-file=.env.local scripts/seed-site.ts
import fs from 'node:fs/promises'
import { getPayload, type Payload } from 'payload'

import config from '../src/payload.config'

type Ref = { relationTo: 'pages' | 'categories' | 'articles'; value: number }
type Link = { type: 'internal' | 'external'; reference?: Ref; url?: string; newTab?: boolean }

const urls = { pages: new Map<string, number>(), categories: new Map<string, number>() }

async function load(payload: Payload) {
  for (const collection of ['pages', 'categories'] as const) {
    const { docs } = await payload.find({ collection, limit: 500, depth: 0, pagination: false })
    for (const doc of docs as { id: number; breadcrumbs?: { url?: string | null }[] }[]) {
      const url = doc.breadcrumbs?.at(-1)?.url
      if (url) urls[collection].set(url, doc.id)
    }
  }
}

// A path resolves to its page first, then to its category (a listing).
function to(path: string): Link {
  const page = urls.pages.get(path)
  if (page) return { type: 'internal', reference: { relationTo: 'pages', value: page } }
  const category = urls.categories.get(path)
  if (category) return { type: 'internal', reference: { relationTo: 'categories', value: category } }
  throw new Error(`No page or category at ${path}`)
}

const external = (url: string, newTab = true): Link => ({ type: 'external', url, newTab })
const item = (label: string, link: Link, description?: string) => ({ label, description, link })

async function articleLink(payload: Payload, legacyFragment: string): Promise<Link> {
  const { docs } = await payload.find({ collection: 'articles', where: { legacyPath: { like: legacyFragment } }, limit: 1, depth: 0 })
  if (!docs[0]) throw new Error(`No article matching ${legacyFragment}`)
  return { type: 'internal', reference: { relationTo: 'articles', value: docs[0].id } }
}

async function heroImage(payload: Payload) {
  const existing = await payload.find({ collection: 'media', where: { sourceUrl: { equals: 'design:cladire' } }, limit: 1, depth: 0 })
  if (existing.docs[0]) return existing.docs[0].id
  const data = await fs.readFile('public/site/cladire.jpg')
  const doc = await payload.create({
    collection: 'media',
    data: { alt: 'Clădirea Colegiului Național „Costache Negruzzi” Iași', sourceUrl: 'design:cladire' },
    file: { data, mimetype: 'image/jpeg', name: 'cladire-colegiu.jpg', size: data.length },
  })
  return doc.id
}

async function main() {
  const payload = await getPayload({ config: await config })
  await load(payload)

  await payload.updateGlobal({
    slug: 'navigation',
    data: {
      quickLinks: [
        item('Catalog Adservio', external('https://www.adservio.ro')),
        item('Microsoft Teams', external('https://teams.microsoft.com')),
        item('Informații de interes public', to('/organizare/informatii-de-interes-public')),
      ],
      main: [
        {
          label: 'Despre noi',
          link: to('/despre-noi'),
          columns: [
            {
              heading: 'Școala',
              items: [
                item('Viziunea și misiunea', to('/despre-noi/viziunea-si-misiunea-scolii'), 'Ce ne propunem'),
                item('Valori promovate', to('/despre-noi/valori-promovate'), 'Ce prețuim'),
                item('Simboluri', to('/despre-noi/simboluri'), 'Stema, imnul, medalia'),
                item('De ce Negruzzi?', to('/despre-noi/de-ce-negruzzi'), 'Pentru viitorii elevi'),
              ],
            },
            {
              heading: 'Istorie',
              items: [
                item('File de istorie', to('/despre-noi/scurt-istoric'), 'De la Liceul Internat la azi'),
                item('În oglinzile timpului', to('/despre-noi/in-oglinzile-timpului'), 'Filme despre școală'),
                item('Distincții', to('/despre-noi/distinctii'), 'Medalii și titluri'),
              ],
            },
            {
              heading: 'Oameni',
              items: [
                item('Foști directori', to('/despre-noi/fosti-directori'), 'Din 1895 până azi'),
                item('Șefi de promoție', to('/despre-noi/sefi-de-promotie'), 'Generațiile Negruzzi'),
                item('Contact', to('/despre-noi/contact'), 'Adresă, telefon, e-mail'),
              ],
            },
          ],
        },
        {
          label: 'Organizare',
          link: to('/organizare'),
          columns: [
            {
              heading: 'Conducere',
              items: [
                item('Consiliul de Administrație', to('/organizare/consiliul-de-administratie'), 'Componență și hotărâri'),
                item('Conducerea Colegiului', to('/organizare/conducerea-colegiului'), 'Director și directori adjuncți'),
                item('Catedre', to('/organizare/catedre'), 'Catedrele și cabinetul psihopedagogic'),
              ],
            },
            {
              heading: 'Regulamente',
              items: [
                item('ROFUIP', to('/organizare/rofuip'), 'Regulamentul de organizare și funcționare'),
                item('Regulament intern', to('/organizare/regulament-intern'), 'Reguli pentru elevi și personal'),
              ],
            },
            {
              heading: 'Servicii',
              items: [
                item('Secretariat', to('/organizare/secretariat'), 'Acte, adeverințe, program'),
                item('Contabilitate', to('/organizare/contabilitate'), 'Bugete și execuție'),
                item('Biblioteca', to('/organizare/biblioteca'), 'Program și regulament'),
                item('Planul sălilor', to('/organizare/planul-salilor'), 'Unde găsești fiecare clasă'),
              ],
            },
            {
              heading: 'Transparență',
              items: [
                item('Informații de interes public', to('/organizare/informatii-de-interes-public'), 'Declarații, PDI, rapoarte'),
                item('Personal angajat', to('/organizare/personal-angajat'), 'Lista actualizată'),
                item('Salariile funcțiilor', to('/organizare/salariile-functiilor'), 'Conform Legii 153/2017'),
                item('CEAC', to('/organizare/ceac'), 'Evaluarea și asigurarea calității'),
              ],
            },
          ],
        },
        {
          label: 'Elevi',
          link: to('/elevi'),
          columns: [
            {
              heading: 'La școală',
              items: [
                item('Orar', to('/elevi/orar'), 'Elevi și profesori'),
                item('Biblioteca', to('/elevi/biblioteca'), 'Program și resurse'),
                item('Consiliul elevilor', to('/elevi/consiliul-elevilor'), 'Reprezentanții elevilor'),
              ],
            },
            {
              heading: 'Învățare',
              items: [
                item('Resurse educaționale online', to('/resurse-educationale-online'), 'Platforme și materiale'),
                item('Centrul de Excelență', to('/elevi/centrul-de-excelenta-negruzzi-invatamant-primar-matematica'), 'Învățământ primar, matematică'),
              ],
            },
          ],
        },
        {
          label: 'Rezultate',
          link: to('/rezultate'),
          columns: [
            {
              heading: 'Rezultate',
              items: [
                item('Competiții', to('/rezultate/competitii'), 'Olimpiade și concursuri, an de an'),
                item('Olimpici internaționali', to('/rezultate/olimpici-internationali'), 'Medaliații negruzziști'),
                item('Cambridge exams', to('/rezultate/cambridge-exams'), 'Centru de examinare'),
              ],
            },
          ],
        },
        {
          label: 'Proiecte',
          link: to('/proiecte'),
          columns: [
            {
              heading: 'Ale școlii',
              items: [
                item('Proiecte ale școlii', to('/proiecte/proiecte-ale-scolii'), 'Inițiative proprii'),
                item('Parteneriate educaționale', to('/proiecte/parteneriate-educationale'), 'Cu alte școli și instituții'),
                item('Părinți pentru părinți', to('/proiecte/programul-parinti-pentru-parinti'), 'Programul părinților'),
                item('Turnul Babel', to('/proiecte/turnul-babel'), 'Limbi străine'),
              ],
            },
            {
              heading: 'Internaționale',
              items: [
                item('Erasmus+', to('/proiecte/proiecte-internationale/erasmus'), 'Mobilități pentru elevi și profesori'),
                item('Acreditare Erasmus+ 2022-2027', to('/proiecte/proiecte-internationale/erasmus/acreditare-erasmus-2022-2027'), 'Educație școlară'),
                item('Acreditare Erasmus+ VET', to('/proiecte/proiecte-internationale/erasmus/acreditare-erasmus-vet'), 'Educație vocațională'),
                item('World School', to('/proiecte/proiecte-internationale/world-school-editii-succesive'), 'Ediții succesive'),
              ],
            },
          ],
        },
        {
          label: 'Noutăți',
          link: to('/noutati'),
          columns: [
            {
              heading: 'Noutăți',
              items: [
                item('Anunțuri', to('/anunturi'), 'Cele mai noi informații'),
                item('Evenimente', to('/noutati/evenimente'), 'Din viața școlii'),
                item('Achiziții publice', to('/noutati/achizitii-publice'), 'Anunțuri și contracte'),
                item('Mobilitate personal didactic', to('/noutati/mobilitate-personal-didactic'), 'Posturi și transferuri'),
              ],
            },
          ],
        },
        {
          label: 'Admitere',
          link: to('/admitere'),
          columns: [
            {
              heading: 'Admitere',
              items: [
                item('Clasa a V-a', to('/admitere/clasa-a-v-a'), 'Testare, calendar, rezultate'),
                item('Clasa a IX-a', to('/admitere/clasa-a-ix-a'), 'Profiluri și specializări'),
                item('Centrul de Excelență', to('/elevi/centrul-de-excelenta-negruzzi-invatamant-primar-matematica'), 'Învățământ primar, matematică'),
              ],
            },
          ],
        },
      ],
    },
  })

  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      schoolName: 'Colegiul Național „Costache Negruzzi” Iași',
      contact: {
        address: 'Str. Toma Cozma nr. 4, 700555 Iași',
        phone: '+40 232 210 510',
        fax: '+40 232 216 373',
        email: 'colegiul_negruzzi@yahoo.com',
        hours: 'Luni - Vineri 8.00 - 10.00\nMarți și joi 16.00 - 18.00',
      },
      footerColumns: [
        {
          heading: 'Despre noi',
          items: [
            item('Viziune și misiune', to('/despre-noi/viziunea-si-misiunea-scolii')),
            item('File de istorie', to('/despre-noi/scurt-istoric')),
            item('Simboluri', to('/despre-noi/simboluri')),
            item('De ce Negruzzi?', to('/despre-noi/de-ce-negruzzi')),
            item('Contact', to('/despre-noi/contact')),
          ],
        },
        {
          heading: 'Elevi',
          items: [
            item('Orar', to('/elevi/orar')),
            item('Resurse online', to('/resurse-educationale-online')),
            item('Consiliul elevilor', to('/elevi/consiliul-elevilor')),
            item('Biblioteca', to('/elevi/biblioteca')),
          ],
        },
        {
          heading: 'Transparență',
          items: [
            item('Informații de interes public', to('/organizare/informatii-de-interes-public')),
            item('Achiziții publice', to('/noutati/achizitii-publice')),
            item('Regulamente (ROFUIP, intern)', to('/organizare/rofuip')),
            item('Personal și salarii', to('/organizare/salariile-functiilor')),
            item('CEAC', to('/organizare/ceac')),
          ],
        },
      ],
    },
  })

  await payload.updateGlobal({
    slug: 'homepage',
    data: {
      hero: {
        eyebrow: 'Iași · din 1895',
        title: 'Erudiție, tradiție și modernitate',
        text: 'Colegiul Național „Costache Negruzzi” formează, de peste 130 de ani, elevi pentru care învățătura și caracterul merg împreună.',
        image: await heroImage(payload),
        actions: [
          { label: 'Admitere', link: to('/admitere') },
          { label: 'De ce Negruzzi?', link: to('/despre-noi/de-ce-negruzzi') },
        ],
      },
      audienceLinks: [
        { label: 'Orar', description: 'Elevi și profesori', link: to('/elevi/orar') },
        { label: 'Planul sălilor', description: 'Unde e fiecare clasă', link: to('/organizare/planul-salilor') },
        { label: 'Anunțuri', description: 'Cele mai noi informații', link: to('/anunturi') },
        { label: 'Burse', description: 'Cereri și acte', link: await articleLink(payload, '%burse-2026%') },
        { label: 'Biblioteca', description: 'Program și regulament', link: to('/organizare/biblioteca') },
        { label: 'Secretariat', description: 'Acte și adeverințe', link: to('/organizare/secretariat') },
      ],
      highlights: [
        { title: 'Acreditare Erasmus+ 2022-2027', text: 'Mobilități pentru elevi și profesori', link: to('/proiecte/proiecte-internationale/erasmus/acreditare-erasmus-2022-2027') },
        { title: 'Olimpiade și competiții', text: 'Premiile negruzziștilor, an de an', link: to('/rezultate/competitii') },
        { title: 'Cambridge exams', text: 'Centru de examinare în limba engleză', link: to('/rezultate/cambridge-exams') },
        { title: 'Parteneriate educaționale', text: 'Proiecte cu alte școli și instituții', link: to('/proiecte/parteneriate-educationale') },
      ],
    },
  })

  console.log('navigation, site-settings and homepage updated')
  process.exit(0)
}

main()
