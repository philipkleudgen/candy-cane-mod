export type Stufe = 'auto' | 'an' | 'dezent' | 'aus'
// Öffentlich für andere Mods: Saison und Farben. Liest jeder Mod mit
// `$.state.get({ plugin: 'candy-cane', key: 'saison' })`; nicht gesetzt oder `aktiv: false` heißt: normale Farben.
export type Saison = {
  aktiv: boolean
  phase: 'aus' | 'herbst' | 'countdown' | 'advent' | 'weihnachten' | 'zwischen' | 'silvester' | 'neujahr'
  modus: 'aus' | 'countdown' | 'dezent' | 'voll'
  // Farben für dunklen und hellen Grund gleichermaßen lesbar.
  farben: { akzent: string; gold: string; gut: string; warn: string; schlecht: string; info: string; neutral: string }
  // Ein Zeichen, das andere Mods vor Überschriften oder Toasts setzen können.
  zeichen: string
}
// anstrich: fremde Mods umfärben; thema: Claude-Code-Farbthema in der Saison umschalten. Fehlt der Wert, gilt an.
export type Einstellung = { stufe: Stufe; sprache: 'de' | 'en'; anstrich?: boolean; thema?: boolean }

declare module 'claude-code' {
  interface PluginState {
    'candy-cane': {
      einstellung: Einstellung
      // Ein vorgetäuschtes Datum für Vorschau und Tests, `2026-12-24` oder `2026-12-31T23:10`.
      testDatum: string | null
      // Grober Zeitschlüssel; wechselt er, zeichnen Band und Fenster neu.
      takt: string
      // Datum, an dem das Türchen zuletzt geöffnet wurde.
      tuerOffen: string
      saison: Saison
    }
  }
}
