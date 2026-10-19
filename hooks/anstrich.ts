// Saison-Anstrich für fremde Mods: färbt die Zeichnung anderer Plugins in Weihnachts- oder Herbstfarben um.
// Nach Farbton, damit die Bedeutung bleibt: Rot bleibt Warnung, Grün bleibt gut, nur festlicher.
// Rein und ohne `$`; der Baum wird kopiert, nie verändert.

export type Jahreszeit = 'winter' | 'herbst'

// Winter: Weihnachtsfarben. Herbst: Kürbis, Laub und Halloween-Lila. Bedeutung bleibt jeweils gleich.
const PALETTEN = {
  winter: { rot: '#E0303F', orange: '#E8794B', gold: '#E8B04B', gruen: '#3FA66B', eis: '#9ED8F0', beere: '#C76B98' },
  herbst: { rot: '#C0392B', orange: '#E8731C', gold: '#E3A33B', gruen: '#7FA34A', eis: '#A77BCA', beere: '#8E3B8C' },
}

const zuordnung = (P: (typeof PALETTEN)['winter']) => ({
  // Themenfarben der Engine, auf die sich Mods beziehen können.
  thema: { success: P.gruen, error: P.rot, warning: P.gold, claude: P.rot, suggestion: P.eis, permission: P.eis, merged: P.beere } as Record<string, string>,
  namen: {
    red: P.rot, redBright: P.rot, green: P.gruen, greenBright: P.gruen,
    yellow: P.gold, yellowBright: P.gold, blue: P.eis, blueBright: P.eis,
    cyan: P.eis, cyanBright: P.eis, magenta: P.beere, magentaBright: P.beere,
  } as Record<string, string>,
})
const ZUORDNUNG = { winter: zuordnung(PALETTEN.winter), herbst: zuordnung(PALETTEN.herbst) }

const hex = (s: string): [number, number, number] | null => {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(s.trim())
  if (!m) return null
  const h = m[1]!.length === 3 ? m[1]!.split('').map(c => c + c).join('') : m[1]!
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

// Farbton in Grad und Sättigung (0 bis 1).
const ton = ([r, g, b]: [number, number, number]) => {
  const max = Math.max(r, g, b) / 255, min = Math.min(r, g, b) / 255
  const d = max - min
  const l = (max + min) / 2
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))
  let h = 0
  if (d !== 0) {
    const R = r / 255, G = g / 255, B = b / 255
    if (max === R) h = 60 * (((G - B) / d) % 6)
    else if (max === G) h = 60 * ((B - R) / d + 2)
    else h = 60 * ((R - G) / d + 4)
  }
  return { h: (h + 360) % 360, s, l }
}

export const umfaerben = (farbe: string, zeit: Jahreszeit = 'winter'): string => {
  const PALETTE = PALETTEN[zeit]
  const { thema, namen } = ZUORDNUNG[zeit]
  if (thema[farbe]) return thema[farbe]!
  if (namen[farbe]) return namen[farbe]!
  const rgb = hex(farbe)
  if (!rgb) return farbe
  const { h, s, l } = ton(rgb)
  // Grau, Schwarz und Weiß bleiben: Text und Flächen sollen lesbar bleiben.
  if (s < 0.25 || l < 0.12 || l > 0.92) return farbe
  if (h < 15 || h >= 330) return PALETTE.rot
  if (h < 40) return PALETTE.orange
  if (h < 70) return PALETTE.gold
  if (h < 170) return PALETTE.gruen
  if (h < 260) return PALETTE.eis
  return PALETTE.beere
}

const FARBFELDER = ['color', 'backgroundColor', 'borderColor']

type Knoten = { type?: unknown; props?: Record<string, unknown>; hover?: Record<string, unknown>; children?: unknown[] } & Record<string, unknown>

const farbenIn = (props: Record<string, unknown> | undefined, zeit: Jahreszeit) => {
  if (!props) return props
  let neu: Record<string, unknown> | undefined
  for (const feld of FARBFELDER) {
    const wert = props[feld]
    if (typeof wert === 'string') {
      const um = umfaerben(wert, zeit)
      if (um !== wert) (neu ??= { ...props })[feld] = um
    }
  }
  return neu ?? props
}

// Geht den Baum durch und färbt Box, Text, Button und Link um; alles andere (Svg, Bilder, Engine-Knoten) bleibt.
export const anstreichen = <T>(baum: T, zeit: Jahreszeit = 'winter', tiefe = 0): T => {
  if (tiefe > 40 || baum === null || typeof baum !== 'object') return baum
  if (Array.isArray(baum)) return baum.map(k => anstreichen(k, zeit, tiefe + 1)) as T
  const k = baum as unknown as Knoten
  if (k.type !== 'Box' && k.type !== 'Text' && k.type !== 'Button' && k.type !== 'Link') return baum
  const props = farbenIn(k.props, zeit)
  const hover = farbenIn(k.hover, zeit)
  const kinder = Array.isArray(k.children) ? k.children.map(c => anstreichen(c, zeit, tiefe + 1)) : k.children
  return { ...k, props, ...(k.hover ? { hover } : {}), ...(k.children ? { children: kinder } : {}) } as T
}

// Setzt ein Saison-Zeichen vor einen Toast, außer er beginnt schon mit einem Symbol.
export const toastZeichen = (text: string, zeichen: string) => (/^[\p{Extended_Pictographic}✨❄]/u.test(text) ? text : `${zeichen} ${text}`)
