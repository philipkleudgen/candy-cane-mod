// Was Band, Schild und Grüße sagen: reine Logik ohne `$`, damit Tests und Vorschau sie nutzen können.

import type { Saison, Stufe } from '../types'
import { adventssonntag, kerzen, minutenBisMitternacht, neuesJahr, schluessel, tageBis, tageBisAdvent } from './kalender'
import type { Heute, Phase } from './kalender'
import type { BandInhalt, SzeneInhalt } from './svg'
import { GRUSS, T } from './texte'
import type { Sprache } from './texte'

export type Modus = 'aus' | 'countdown' | 'dezent' | 'voll'

export type Lage = { heute: Heute; phase: Phase; modus: Modus; sprache: Sprache; stufe: Stufe }

export const FESTLICH: Phase[] = ['advent', 'weihnachten', 'zwischen', 'silvester', 'neujahr']

export const modusFuer = (stufe: Stufe, p: Phase): Modus => {
  if (stufe === 'aus') return 'aus'
  if (stufe === 'an') return 'voll'
  if (stufe === 'dezent') return p === 'aus' ? 'aus' : 'dezent'
  if (p === 'aus') return 'aus'
  return p === 'countdown' || p === 'herbst' ? 'countdown' : 'voll'
}

// Der Zeitschlüssel: an Silvester minütlich, sonst täglich.
export const taktFuer = (h: Heute) => (h.monat === 12 && h.tag === 31 ? `${schluessel(h)}T${h.stunde}:${h.minute}` : schluessel(h))

export const istTuerTag = (h: Heute) => h.monat === 12 && h.tag >= 1 && h.tag <= 24

// Was Band und Schild sagen.
export const ansage = (l: Lage): { band: BandInhalt; schild: SzeneInhalt['schild']; bild: SzeneInhalt['bild'] } => {
  const { heute: h, phase: p, sprache: s } = l
  if (p === 'herbst') {
    const n = tageBis(h, 10, 31)
    const advent = tageBisAdvent(h)
    return {
      band: { zahl: String(n), zeile: n === 0 ? T.halloween[s] : T.bisHalloween[s](n), unterzeile: s === 'de' ? `… und ${advent} Tage bis zum 1. Advent` : `… and ${advent} days until Advent`, herbst: true },
      schild: n === 0 ? { gross: 'Halloween', klein: s === 'de' ? 'Süßes oder Saures!' : 'Trick or treat!' } : { gross: s === 'de' ? `${n} Tage` : `${n} days`, klein: s === 'de' ? 'bis Halloween' : 'until Halloween' },
      bild: 'herbst',
    }
  }
  if (p === 'countdown' || p === 'aus') {
    // Zwischen 2. Januar und 1. Advent liegt der Advent desselben Jahres immer noch vorn.
    const n = tageBisAdvent(h)
    const heilig = tageBis(h, 12, 24)
    return {
      band: { zahl: String(n), zeile: T.bisAdvent[s](n), unterzeile: s === 'de' ? `… und ${heilig} Tage bis Heiligabend` : `… and ${heilig} days until Christmas Eve`, kerzen: 0 },
      schild: { gross: s === 'de' ? `${n} Tage` : `${n} days`, klein: s === 'de' ? 'bis zum 1. Advent' : 'until Advent' },
      bild: 'dorf',
    }
  }
  if (p === 'advent') {
    const n = tageBis(h, 12, 24)
    const k = kerzen(h)
    return {
      band: { zahl: String(n), zeile: T.bisHeiligabend[s](n), unterzeile: k > 0 ? (s === 'de' ? `${k}. Advent · Candy Cane` : `Advent ${k} · Candy Cane`) : undefined, kerzen: k },
      schild: { gross: s === 'de' ? `${n} Tage` : `${n} days`, klein: s === 'de' ? 'bis Heiligabend' : 'until Christmas Eve' },
      bild: 'dorf',
    }
  }
  if (p === 'weihnachten') {
    const zeile = h.tag === 24 ? T.heiligabend[s] : T.weihnachtstag[s](h.tag - 24)
    return {
      band: { zeile, unterzeile: s === 'de' ? 'Schön, dass du da bist.' : 'So glad you\'re here.', kerzen: 4 },
      schild: { gross: s === 'de' ? 'Frohe Weihnachten' : 'Merry Christmas', klein: h.tag === 24 ? (s === 'de' ? 'Heiligabend' : 'Christmas Eve') : T.weihnachtstag[s](h.tag - 24) },
      bild: 'dorf',
    }
  }
  if (p === 'zwischen') {
    const n = tageBis(h, 12, 31)
    return {
      band: { zahl: String(n), zeile: T.zwischen[s](n), kerzen: 4 },
      schild: { gross: s === 'de' ? 'Zwischen den Jahren' : 'Between the years', klein: s === 'de' ? 'Plätzchenreste und Ruhe' : 'Leftover cookies and quiet' },
      bild: 'dorf',
    }
  }
  if (p === 'silvester') {
    const rest = minutenBisMitternacht(h)
    const std = Math.floor(rest / 60), min = rest % 60
    const jahr = neuesJahr(h)
    return {
      band: { zahl: `${std}:${String(min).padStart(2, '0')}`, zeile: T.silvester[s](std, min, jahr), unterzeile: s === 'de' ? 'Danke für dieses Jahr.' : 'Thank you for this year.', silvester: true },
      schild: { gross: `${std}:${String(min).padStart(2, '0')}`, klein: s === 'de' ? `bis ${jahr}` : `until ${jahr}` },
      bild: 'silvester',
    }
  }
  // Neujahr
  const jahr = neuesJahr(h)
  return {
    band: { zeile: T.neujahr[s](jahr), unterzeile: s === 'de' ? 'Candy Cane verabschiedet sich bis zum Herbst.' : 'Candy Cane says goodbye until autumn.', silvester: true },
    schild: { gross: String(jahr), klein: s === 'de' ? 'Frohes neues Jahr' : 'Happy New Year' },
    bild: 'silvester',
  }
}

// Gruß für besondere Tage, sonst null.
export const grussFuer = (h: Heute, s: Sprache) => {
  if (h.monat === 1 && h.tag === 1) return GRUSS.neujahr[s]
  if (h.monat === 12 && h.tag === 31) return GRUSS.silvester[s]
  if (h.monat === 12 && h.tag === 26) return GRUSS.weihnachten2[s]
  if (h.monat === 12 && h.tag === 25) return GRUSS.weihnachten1[s]
  if (h.monat === 12 && h.tag === 24) return GRUSS.heiligabend[s]
  const a = adventssonntag(h)
  if (a > 0) return GRUSS[`advent${a}` as 'advent1'][s]
  return null
}


const FARBEN: Saison['farben'] = { akzent: '#E0303F', gold: '#E8B04B', gut: '#3FA66B', warn: '#F2994A', schlecht: '#E0303F', info: '#9ED8F0', neutral: '#3A3A3A' }

const FARBEN_HERBST: Saison['farben'] = { akzent: '#E8731C', gold: '#E3A33B', gut: '#7FA34A', warn: '#E8731C', schlecht: '#C0392B', info: '#A77BCA', neutral: '#3A3A3A' }

// Was Candy Cane anderen Mods über die Saison sagt.
export const saisonFuer = (l: Lage): Saison => ({
  aktiv: l.modus !== 'aus',
  phase: l.phase,
  modus: l.modus,
  farben: l.phase === 'herbst' ? FARBEN_HERBST : FARBEN,
  zeichen: l.phase === 'herbst' ? '🎃' : l.phase === 'silvester' || l.phase === 'neujahr' ? '✨' : l.modus === 'countdown' ? '❄' : '🎄',
})
