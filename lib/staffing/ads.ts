// One entry per agency ad page (montero.cool/ad/<slug>). Every fact must come from the agency's own job posting.
export type AdPage = {
  agency: string
  job: string
  facts: string            // one line under the title
  caption: string          // ready-to-paste caption
  versions: { name: string; about: string; file: string }[]   // files live in /public/ad-media
}

export const ADS: Record<string, AdPage> = {
  mancan: {
    agency: 'Mancan',
    job: 'maintenance mechanic',
    facts: 'Made from your Zanesville posting: $30 an hour, Monday to Friday, 3:00 to 11:30 PM.',
    caption: 'Maintenance mechanic, $30 an hour, Zanesville. Monday to Friday, 3:00 to 11:30 PM. Apply at mancan.com/zanesville',
    versions: [
      { name: 'The time card', about: 'A time card with no name on it gets punched for the week.', file: 'mancan-timecard' },
      { name: 'The text', about: 'The job arrives as a text and gets a "send it".', file: 'mancan-text' },
      { name: 'The pay stub', about: "The first week's pay prints out.", file: 'mancan-paystub' },
    ],
  },
}
