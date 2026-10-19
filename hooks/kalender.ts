// Kalender für Candy Cane: welche Phase heute gilt, in Berliner Zeit.
// Rein und ohne `$`, damit die Tests jedes Datum durchspielen können.

export type Phase = 'aus' | 'herbst' | 'countdown' | 'advent' | 'weihnachten' | 'zwischen' | 'silvester' | 'neujahr'

// Im Oktober Herbst und Halloween, ab November der Countdown zum 1. Advent.
export const HERBST_AB = { monat: 10, tag: 1 }
export const COUNTDOWN_AB = { monat: 11, tag: 1 }

export type Heute = {
  jahr: number
  monat: number
  tag: number
  stunde: number
  minute: number
  // 0 = Sonntag
  wochentag: number
}

export const berlin = (ms: number): Heute => {
  try {
    const teile = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Berlin',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(new Date(ms))
    const wert = (art: string) => Number(teile.find(t => t.type === art)?.value ?? 0)
    const jahr = wert('year'), monat = wert('month'), tag = wert('day')
    return { jahr, monat, tag, stunde: wert('hour'), minute: wert('minute'), wochentag: new Date(Date.UTC(jahr, monat - 1, tag)).getUTCDay() }
  } catch (err) {
    // Ohne Intl-Zeitzonen: MEZ als Näherung, eine Stunde Versatz im Sommer stört hier nicht.
    const d = new Date(ms + 3600_000)
    return { jahr: d.getUTCFullYear(), monat: d.getUTCMonth() + 1, tag: d.getUTCDate(), stunde: d.getUTCHours(), minute: d.getUTCMinutes(), wochentag: d.getUTCDay() }
  }
}

// Ein Testdatum `2026-12-24` oder `2026-12-31T22:30` als Berliner Wandzeit.
export const ausText = (text: string): Heute | null => {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?$/.exec(text.trim())
  if (!m) return null
  const jahr = Number(m[1]), monat = Number(m[2]), tag = Number(m[3])
  const stunde = Number(m[4] ?? 12), minute = Number(m[5] ?? 0)
  if (monat < 1 || monat > 12 || tag < 1 || tag > 31 || stunde > 23 || minute > 59) return null
  return { jahr, monat, tag, stunde, minute, wochentag: new Date(Date.UTC(jahr, monat - 1, tag)).getUTCDay() }
}

const tagNr = (jahr: number, monat: number, tag: number) => Math.round(Date.UTC(jahr, monat - 1, tag) / 86_400_000)

// 4. Advent ist der Sonntag am oder vor dem 24.12., der 1. Advent drei Wochen davor.
export const ersterAdvent = (jahr: number) => {
  const heiligabend = new Date(Date.UTC(jahr, 11, 24))
  const vierter = tagNr(jahr, 12, 24) - heiligabend.getUTCDay()
  const d = new Date((vierter - 21) * 86_400_000)
  return { monat: d.getUTCMonth() + 1, tag: d.getUTCDate() }
}

export const phase = (h: Heute): Phase => {
  const { jahr, monat, tag } = h
  if (monat === 1 && tag === 1) return 'neujahr'
  if (monat === 12 && tag === 31) return 'silvester'
  if (monat === 12 && tag >= 27) return 'zwischen'
  if (monat === 12 && tag >= 24) return 'weihnachten'
  const advent = ersterAdvent(jahr)
  const heute = tagNr(jahr, monat, tag)
  if (heute >= tagNr(jahr, advent.monat, advent.tag)) return 'advent'
  if (heute >= tagNr(jahr, COUNTDOWN_AB.monat, COUNTDOWN_AB.tag)) return 'countdown'
  if (heute >= tagNr(jahr, HERBST_AB.monat, HERBST_AB.tag)) return 'herbst'
  return 'aus'
}

export const tageBis = (h: Heute, monat: number, tag: number) => tagNr(h.jahr, monat, tag) - tagNr(h.jahr, h.monat, h.tag)

export const tageBisAdvent = (h: Heute) => {
  const a = ersterAdvent(h.jahr)
  return tageBis(h, a.monat, a.tag)
}

// Wie viele Adventskerzen heute brennen (0 bis 4).
export const kerzen = (h: Heute) => {
  if (h.monat === 12 && h.tag >= 24) return 4
  const tage = -tageBisAdvent(h)
  if (tage < 0) return 0
  return Math.min(4, Math.floor(tage / 7) + 1)
}

// Ist heute ein Adventssonntag? Dann welcher (1 bis 4), sonst 0.
export const adventssonntag = (h: Heute) => {
  const tage = -tageBisAdvent(h)
  if (tage < 0 || tage > 21 || tage % 7 !== 0) return 0
  return tage / 7 + 1
}

export const minutenBisMitternacht = (h: Heute) => (23 - h.stunde) * 60 + (60 - h.minute)

export const schluessel = (h: Heute) => `${h.jahr}-${String(h.monat).padStart(2, '0')}-${String(h.tag).padStart(2, '0')}`

// Das Jahr, das an Silvester beginnt.
export const neuesJahr = (h: Heute) => (h.monat === 1 ? h.jahr : h.jahr + 1)
