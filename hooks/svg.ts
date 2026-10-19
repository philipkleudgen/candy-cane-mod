// SVG-Bausteine für Band und Seitenfenster. Desktop zeichnet sie in einem skriptlosen Rahmen,
// CSS-Animationen laufen dort: Schneefall, blinkende Lichter, flackernde Kerzen.


export const ROT = '#C8102E'
export const DUNKELROT = '#8E0B20'
export const TANNE = '#1F4D3A'
export const CREME = '#FBF6EC'
export const GOLD = '#E8B04B'
export const KUERBIS = '#E8731C'

const SCHRIFT = "Georgia, 'Times New Roman', serif"

const xml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Fester Zufall, damit jede Zeichnung gleich aussieht und nichts springt.
const zufall = (saat: number) => {
  let s = saat >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

const STIL = `
@keyframes fallA { from { transform: translate(0px, -30px) } to { transform: translate(40px, 560px) } }
@keyframes fallB { from { transform: translate(0px, -30px) } to { transform: translate(-40px, 560px) } }
@keyframes funkeln { 0%, 100% { opacity: 1 } 50% { opacity: .25 } }
@keyframes flackern { 0%, 100% { transform: scale(1, 1) } 40% { transform: scale(.9, 1.12) } 70% { transform: scale(1.06, .94) } }
@keyframes wiegen { 0%, 100% { transform: rotate(-4deg) } 50% { transform: rotate(4deg) } }
.licht { animation: funkeln 1.6s ease-in-out infinite }
.flamme { transform-box: fill-box; transform-origin: 50% 100%; animation: flackern .9s ease-in-out infinite }
.wiegen { transform-box: fill-box; transform-origin: 50% 0%; animation: wiegen 4s ease-in-out infinite }
`

const streifenMuster = (id: string, breite: number, herbst = false) => `
<pattern id="${id}" width="${breite}" height="${breite}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
  <rect width="${breite}" height="${breite}" fill="${herbst ? '#1B1020' : '#fff'}"/>
  <rect width="${breite / 2}" height="${breite}" fill="${herbst ? KUERBIS : ROT}"/>
</pattern>`

// Eine kleine Zuckerstange als Symbol.
const zuckerstange = (x: number, y: number, h: number) => `
<g transform="translate(${x} ${y})">
  <path d="M ${h * 0.18} ${h} L ${h * 0.18} ${h * 0.32} A ${h * 0.2} ${h * 0.2} 0 0 1 ${h * 0.58} ${h * 0.32}" fill="none" stroke="#fff" stroke-width="${h * 0.16}" stroke-linecap="round"/>
  <path d="M ${h * 0.18} ${h} L ${h * 0.18} ${h * 0.32} A ${h * 0.2} ${h * 0.2} 0 0 1 ${h * 0.58} ${h * 0.32}" fill="none" stroke="${ROT}" stroke-width="${h * 0.16}" stroke-linecap="round" stroke-dasharray="${h * 0.09} ${h * 0.09}"/>
</g>`

// Lichterkette entlang einer Welle.
const lichterkette = (breite: number, y: number, anzahl: number, saat: number) => {
  const farben = [ROT, GOLD, '#2E8B57', '#FFFFFF', '#4AA3DF']
  const r = zufall(saat)
  let welle = `M 0 ${y}`
  const schritt = breite / anzahl
  for (let i = 0; i < anzahl; i++) welle += ` Q ${i * schritt + schritt / 2} ${y + 9} ${(i + 1) * schritt} ${y}`
  let lichter = ''
  for (let i = 0; i < anzahl; i++) {
    const cx = i * schritt + schritt / 2
    const farbe = farben[i % farben.length]
    lichter += `<g class="licht" style="animation-delay:-${(r() * 1.6).toFixed(2)}s"><circle cx="${cx}" cy="${y + 11}" r="8" fill="${farbe}" opacity=".3"/><rect x="${cx - 2.5}" y="${y + 4}" width="5" height="4" rx="1" fill="#4a4a4a"/><ellipse cx="${cx}" cy="${y + 12}" rx="4" ry="5.5" fill="${farbe}"/></g>`
  }
  return `<path d="${welle}" fill="none" stroke="${TANNE}" stroke-width="2.5"/>${lichter}`
}

const kerze = (x: number, y: number, brennt: boolean, verzoegerung: number) => `
<g transform="translate(${x} ${y})">
  <rect x="-5" y="0" width="10" height="26" rx="2" fill="${ROT}"/>
  <rect x="-5" y="0" width="3" height="26" rx="1.5" fill="#fff" opacity=".25"/>
  <line x1="0" y1="0" x2="0" y2="-4" stroke="#333" stroke-width="1.2"/>
  ${brennt ? `<ellipse cx="0" cy="-9" rx="7" ry="9" fill="${GOLD}" opacity=".25"/><path class="flamme" style="animation-delay:-${verzoegerung}s" d="M 0 -15 C 4 -9 3 -5 0 -4 C -3 -5 -4 -9 0 -15 Z" fill="#FFC94A"/>` : ''}
</g>`

export type BandInhalt = {
  zeile: string
  unterzeile?: string
  zahl?: string
  kerzen?: number
  silvester?: boolean
  herbst?: boolean
}

// Das Band über dem Eingabefeld.
export const band = (b: BandInhalt) => {
  const W = 1200, H = 78
  const mitZahl = !!b.zahl
  const textX = mitZahl ? 132 : 70
  const kerzenBlock = b.kerzen !== undefined
    ? `<g>${[0, 1, 2, 3].map(i => kerze(W - 150 + i * 28, 38, i < (b.kerzen ?? 0), i * 0.3)).join('')}
       <path d="M ${W - 166} 66 Q ${W - 108} 74 ${W - 46} 66" fill="none" stroke="${TANNE}" stroke-width="7" stroke-linecap="round"/>
       <circle cx="${W - 150}" cy="66" r="3" fill="${ROT}"/><circle cx="${W - 108}" cy="69" r="3" fill="${ROT}"/><circle cx="${W - 66}" cy="66" r="3" fill="${ROT}"/></g>`
    : ''
  const rechts = b.silvester
    ? [0, 1, 2].map(i => `<g class="licht" style="animation-delay:-${i * 0.5}s" transform="translate(${W - 140 + i * 40} ${34 + (i % 2) * 8})">${Array.from({ length: 8 }, (_, k) => `<line x1="0" y1="0" x2="${(Math.cos(k * Math.PI / 4) * 14).toFixed(1)}" y2="${(Math.sin(k * Math.PI / 4) * 14).toFixed(1)}" stroke="${k % 2 ? GOLD : ROT}" stroke-width="2" stroke-linecap="round"/>`).join('')}</g>`).join('')
    : kerzenBlock
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<style>${STIL}</style>
<defs>${streifenMuster('streifen', 14)}
<linearGradient id="grund" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFDF8"/><stop offset="1" stop-color="${CREME}"/></linearGradient></defs>
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="14" fill="url(#grund)" stroke="url(#streifen)" stroke-width="5"/>
<g>${lichterkette(W, 3, 24, 7)}</g>
${zuckerstange(22, 22, 44)}
${mitZahl ? `<g><circle cx="98" cy="44" r="25" fill="${ROT}"/><circle cx="98" cy="44" r="21" fill="none" stroke="#fff" stroke-width="1.5" stroke-dasharray="3 3"/>
<text x="98" y="52" text-anchor="middle" font-family="${SCHRIFT}" font-size="${b.zahl!.length > 2 ? 18 : 24}" font-weight="bold" fill="#fff">${xml(b.zahl!)}</text></g>` : ''}
<text x="${textX}" y="${b.unterzeile ? 44 : 52}" font-family="${SCHRIFT}" font-size="22" font-weight="bold" fill="${DUNKELROT}">${xml(b.zeile)}</text>
${b.unterzeile ? `<text x="${textX}" y="66" font-family="${SCHRIFT}" font-size="14" font-style="italic" fill="${TANNE}">${xml(b.unterzeile)}</text>` : ''}
${rechts}
</svg>`
}

export type SzeneInhalt = {
  bild: 'dorf' | 'silvester' | 'herbst'
  flocken: number
  schild?: { gross: string; klein?: string }
}

// Fallender Schnee: Punkte und ein paar Sterne, jede Flocke mit eigenem Takt.
const schneefall = (anzahl: number, W: number, laub = false) => {
  const r = zufall(42)
  const LAUB = [KUERBIS, '#C0392B', '#E3A33B', '#8E4A1C']
  let flocken = ''
  for (let i = 0; i < anzahl; i++) {
    const x = (r() * W).toFixed(0)
    const groesse = 1.8 + r() * 3.4
    const dauer = (7 + r() * 9).toFixed(1)
    const verz = (r() * 16).toFixed(1)
    const art = r() < 0.5 ? 'fallA' : 'fallB'
    const form = laub
      ? `<g transform="translate(${x} 0) rotate(${(r() * 360).toFixed(0)}) scale(${(groesse / 3).toFixed(2)})"><path d="M 0 -6 C 5 -4 6 3 0 7 C -6 3 -5 -4 0 -6 Z" fill="${LAUB[i % LAUB.length]}"/><line x1="0" y1="-5" x2="0" y2="8" stroke="#5A2E10" stroke-width=".8"/></g>`
      : groesse > 4.4
      ? `<g transform="translate(${x} 0)"><path d="M -7 0 L 7 0 M -3.5 -6 L 3.5 6 M -3.5 6 L 3.5 -6" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></g>`
      : `<circle cx="${x}" cy="0" r="${groesse.toFixed(1)}" fill="#fff" opacity="${(0.7 + r() * 0.3).toFixed(2)}"/>`
    flocken += `<g style="animation:${art} ${dauer}s linear -${verz}s infinite" filter="url(#schatten)">${form}</g>`
  }
  return flocken
}

// Die Winternacht als Vektorgrafik: Die Desktop-App zeichnet eingebettete Fotos nicht,
// ohne dunklen Himmel wäre der Schnee weiß auf weiß.
const landschaft = (bild: SzeneInhalt['bild'], W: number, H: number) => {
  if (bild === 'herbst') return herbstabend(W, H)
  const r = zufall(7)
  const silvester = bild === 'silvester'
  let sterne = ''
  for (let i = 0; i < 38; i++) {
    sterne += `<circle cx="${(r() * W).toFixed(0)}" cy="${(r() * H * 0.5).toFixed(0)}" r="${(0.6 + r() * 1.3).toFixed(1)}" fill="#FFF8E1" opacity="${(0.4 + r() * 0.6).toFixed(2)}"/>`
  }
  const tanne = (x: number, y: number, h: number) => {
    const b = h * 0.42
    return `<g transform="translate(${x} ${y})"><rect x="-3" y="-6" width="6" height="10" fill="#4A2E1A"/>`
      + `<path d="M 0 ${-h} L ${b} -4 L ${-b} -4 Z" fill="#0F4A2E"/>`
      + `<path d="M 0 ${-h} L ${b * 0.45} ${-h * 0.55} L ${-b * 0.45} ${-h * 0.55} Z" fill="#F4F8FF"/></g>`
  }
  const haus = (x: number, y: number, w: number) => {
    const h = w * 0.7
    return `<g transform="translate(${x} ${y})"><rect x="0" y="${-h}" width="${w}" height="${h}" fill="#7A3B2E"/>`
      + `<path d="M ${-6} ${-h} L ${w / 2} ${-h - w * 0.55} L ${w + 6} ${-h} Z" fill="#F4F8FF"/>`
      + `<rect class="licht" x="${w * 0.18}" y="${-h * 0.72}" width="${w * 0.24}" height="${h * 0.32}" fill="#FFC94A"/>`
      + `<rect class="licht" style="animation-delay:-.7s" x="${w * 0.58}" y="${-h * 0.72}" width="${w * 0.24}" height="${h * 0.32}" fill="#FFC94A"/></g>`
  }
  let baumLichter = ''
  for (let i = 0; i < 14; i++) {
    const t = 0.15 + r() * 0.8
    const bx = 360 + (r() - 0.5) * 2 * 62 * t
    const by = 352 - 150 + 150 * t
    const farbe = [ROT, GOLD, '#FFFFFF'][i % 3]
    baumLichter += `<circle class="licht" style="animation-delay:-${(r() * 1.6).toFixed(2)}s" cx="${bx.toFixed(0)}" cy="${by.toFixed(0)}" r="3.4" fill="${farbe}"/>`
  }
  let feuerwerk = ''
  if (silvester) {
    for (const [fx, fy, farbe] of [[170, 110, GOLD], [470, 80, ROT], [600, 150, '#FFFFFF']] as const) {
      for (let k = 0; k < 12; k++) {
        const w = (k / 12) * Math.PI * 2
        feuerwerk += `<line x1="${fx + Math.cos(w) * 12}" y1="${fy + Math.sin(w) * 12}" x2="${(fx + Math.cos(w) * 46).toFixed(0)}" y2="${(fy + Math.sin(w) * 46).toFixed(0)}" stroke="${farbe}" stroke-width="2.4" stroke-linecap="round" class="licht" style="animation-delay:-${(k * 0.13).toFixed(2)}s"/>`
      }
    }
  }
  return `<defs><linearGradient id="himmel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${silvester ? '#050A1E' : '#0A1A3D'}"/><stop offset="1" stop-color="${silvester ? '#1B2550' : '#2F5287'}"/></linearGradient>
<radialGradient id="mondschein"><stop offset="0" stop-color="#FFF6D5" stop-opacity=".55"/><stop offset="1" stop-color="#FFF6D5" stop-opacity="0"/></radialGradient></defs>
<rect width="${W}" height="${H}" fill="url(#himmel)"/>
${sterne}
${silvester ? feuerwerk : `<circle cx="590" cy="90" r="70" fill="url(#mondschein)"/><circle cx="590" cy="90" r="30" fill="#FFF6D5"/>`}
<path d="M 0 300 C 120 250 240 280 360 262 C 480 244 600 270 ${W} 248 L ${W} ${H} L 0 ${H} Z" fill="#B9C9E4"/>
${tanne(60, 292, 70)}${tanne(110, 284, 52)}${tanne(640, 262, 66)}${tanne(680, 266, 48)}
<path d="M 0 360 C 160 318 280 346 400 332 C 520 318 620 338 ${W} 326 L ${W} ${H} L 0 ${H} Z" fill="#EAF1FB"/>
${haus(150, 352, 54)}${haus(220, 346, 44)}${haus(470, 340, 50)}${haus(540, 344, 42)}
<g><rect x="354" y="342" width="12" height="16" fill="#4A2E1A"/><path d="M 360 196 L 424 344 L 296 344 Z" fill="#0F5A34"/><path d="M 360 196 L 392 270 L 328 270 Z" fill="#137040"/>
<path d="M 360 184 l 4 9 l 10 1 l -7 7 l 2 10 l -9 -5 l -9 5 l 2 -10 l -7 -7 l 10 -1 Z" fill="${GOLD}"/>${baumLichter}</g>
${tanne(30, 396, 80)}${tanne(700, 390, 74)}
<path d="M 0 410 C 200 388 520 398 ${W} 384 L ${W} ${H} L 0 ${H} Z" fill="#FFFFFF"/>`
}

// Herbstabend für Oktober: Dämmerhimmel, Kürbismond, Fledermäuse, kahle Bäume und leuchtende Kürbisse.
const herbstabend = (W: number, H: number) => {
  const r = zufall(11)
  let sterne = ''
  for (let i = 0; i < 18; i++) {
    sterne += `<circle cx="${(r() * W).toFixed(0)}" cy="${(r() * H * 0.3).toFixed(0)}" r="${(0.6 + r() * 1.1).toFixed(1)}" fill="#FFF1D6" opacity="${(0.3 + r() * 0.5).toFixed(2)}"/>`
  }
  const fledermaus = (x: number, y: number, g: number, v: number) =>
    `<g class="licht" style="animation-delay:-${v}s" transform="translate(${x} ${y}) scale(${g})"><path d="M 0 0 C -6 -8 -14 -8 -24 -2 C -18 -2 -16 2 -14 6 C -10 2 -6 4 -4 7 C -2 4 2 4 4 7 C 6 4 10 2 14 6 C 16 2 18 -2 24 -2 C 14 -8 6 -8 0 0 Z" fill="#140A18"/></g>`
  const kahlerBaum = (x: number, y: number, h: number) =>
    `<g transform="translate(${x} ${y})" stroke="#1B1020" stroke-linecap="round" fill="none"><path d="M 0 0 L 0 ${-h}" stroke-width="${h * 0.09}"/>`
    + `<path d="M 0 ${-h * 0.45} L ${-h * 0.32} ${-h * 0.8} M 0 ${-h * 0.6} L ${h * 0.3} ${-h * 0.95} M 0 ${-h * 0.8} L ${-h * 0.18} ${-h * 1.05} M ${-h * 0.2} ${-h * 0.68} L ${-h * 0.36} ${-h * 0.66}" stroke-width="${h * 0.04}"/></g>`
  const haus = (x: number, y: number, w: number) => {
    const h = w * 0.7
    return `<g transform="translate(${x} ${y})"><rect x="0" y="${-h}" width="${w}" height="${h}" fill="#4A2A2E"/>`
      + `<path d="M ${-6} ${-h} L ${w / 2} ${-h - w * 0.55} L ${w + 6} ${-h} Z" fill="#2A1626"/>`
      + `<rect class="licht" x="${w * 0.18}" y="${-h * 0.72}" width="${w * 0.24}" height="${h * 0.32}" fill="#FFB347"/>`
      + `<rect class="licht" style="animation-delay:-.7s" x="${w * 0.58}" y="${-h * 0.72}" width="${w * 0.24}" height="${h * 0.32}" fill="#FFB347"/></g>`
  }
  const kuerbis = (x: number, y: number, g: number, v: number) =>
    `<g transform="translate(${x} ${y})"><ellipse cx="0" cy="0" rx="${g * 1.25}" ry="${g}" fill="${KUERBIS}"/>`
    + `<ellipse cx="0" cy="0" rx="${g * 0.6}" ry="${g}" fill="none" stroke="#B8540E" stroke-width="${g * 0.07}"/><ellipse cx="0" cy="0" rx="${g * 0.15}" ry="${g}" fill="none" stroke="#B8540E" stroke-width="${g * 0.06}"/>`
    + `<path d="M -${g * 0.08} -${g * 0.95} L -${g * 0.02} -${g * 1.3} L ${g * 0.14} -${g * 1.28} L ${g * 0.1} -${g * 0.95} Z" fill="#4E5A1E"/>`
    + `<g class="licht" style="animation-delay:-${v}s" fill="#FFD34A"><path d="M -${g * 0.55} -${g * 0.2} L -${g * 0.3} -${g * 0.55} L -${g * 0.08} -${g * 0.2} Z M ${g * 0.08} -${g * 0.2} L ${g * 0.3} -${g * 0.55} L ${g * 0.55} -${g * 0.2} Z"/>`
    + `<path d="M -${g * 0.65} ${g * 0.15} Q 0 ${g * 0.75} ${g * 0.65} ${g * 0.15} L ${g * 0.35} ${g * 0.3} L ${g * 0.2} ${g * 0.15} L 0 ${g * 0.32} L -${g * 0.2} ${g * 0.15} L -${g * 0.35} ${g * 0.3} Z"/></g></g>`
  return `<defs><linearGradient id="himmel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1E1033"/><stop offset=".5" stop-color="#5B2A55"/><stop offset="1" stop-color="#E07A3A"/></linearGradient>
<radialGradient id="mondschein"><stop offset="0" stop-color="#FFB347" stop-opacity=".6"/><stop offset="1" stop-color="#FFB347" stop-opacity="0"/></radialGradient></defs>
<rect width="${W}" height="${H}" fill="url(#himmel)"/>
${sterne}
<circle cx="580" cy="110" r="90" fill="url(#mondschein)"/><circle cx="580" cy="110" r="44" fill="#F6C25A"/>
${fledermaus(180, 90, 1.3, 0)}${fledermaus(250, 130, 0.9, 0.6)}${fledermaus(470, 70, 1.1, 1.1)}${fledermaus(120, 215, 0.8, 0.4)}${fledermaus(620, 205, 0.9, 0.9)}
<path d="M 0 290 C 120 250 240 280 360 262 C 480 244 600 270 ${W} 248 L ${W} ${H} L 0 ${H} Z" fill="#3A2238"/>
${kahlerBaum(70, 290, 110)}${kahlerBaum(660, 262, 120)}${kahlerBaum(600, 270, 70)}
<path d="M 0 360 C 160 318 280 346 400 332 C 520 318 620 338 ${W} 326 L ${W} ${H} L 0 ${H} Z" fill="#4A2A22"/>
${haus(130, 352, 54)}${haus(200, 346, 44)}${haus(500, 340, 50)}${haus(570, 344, 42)}
${kuerbis(360, 334, 44, 0)}${kuerbis(285, 356, 24, 0.5)}${kuerbis(438, 356, 28, 1)}
<path d="M 0 410 C 200 388 520 398 ${W} 384 L ${W} ${H} L 0 ${H} Z" fill="#2E1A14"/>`
}

// Die Szene im Seitenfenster: Bild, Zuckerstangenrahmen, fallender Schnee, ein Holzschild.
export const szene = (s: SzeneInhalt) => {
  const W = 720, H = 480
  const herbst = s.bild === 'herbst'
  const flocken = schneefall(s.flocken, W, herbst)
  const schild = s.schild
    ? `<g class="wiegen" transform="translate(0 0)">
  <line x1="${W / 2 - 110}" y1="${H - 150}" x2="${W / 2 - 90}" y2="${H - 118}" stroke="#5A3A22" stroke-width="3"/>
  <line x1="${W / 2 + 110}" y1="${H - 150}" x2="${W / 2 + 90}" y2="${H - 118}" stroke="#5A3A22" stroke-width="3"/>
  <rect x="${W / 2 - 160}" y="${H - 120}" width="320" height="${s.schild.klein ? 92 : 70}" rx="12" fill="${CREME}" stroke="url(#streifenGross)" stroke-width="7"/>
  <text x="${W / 2}" y="${H - 72}" text-anchor="middle" font-family="${SCHRIFT}" font-size="38" font-weight="bold" fill="${DUNKELROT}">${xml(s.schild.gross)}</text>
  ${s.schild.klein ? `<text x="${W / 2}" y="${H - 44}" text-anchor="middle" font-family="${SCHRIFT}" font-size="17" font-style="italic" fill="${TANNE}">${xml(s.schild.klein)}</text>` : ''}
</g>`
    : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<style>${STIL}</style>
<defs>${streifenMuster('streifenGross', 22, herbst)}
<filter id="schatten" x="-1" y="-1" width="3" height="3"><feDropShadow dx="0" dy="0.6" stdDeviation="0.9" flood-color="#2b3550" flood-opacity=".55"/></filter>
<clipPath id="rund"><rect x="0" y="0" width="${W}" height="${H}" rx="22"/></clipPath>
<linearGradient id="dunst" x1="0" y1="0" x2="0" y2="1"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient></defs>
<g clip-path="url(#rund)">
${landschaft(s.bild, W, H)}
<rect width="${W}" height="${H}" fill="url(#dunst)"/>
${flocken}
${schild}
</g>
<rect x="5" y="5" width="${W - 10}" height="${H - 10}" rx="19" fill="none" stroke="url(#streifenGross)" stroke-width="10"/>
${herbst ? '' : `<g transform="translate(${W / 2} 16)">
  <path d="M 0 8 C -30 -14 -54 4 -40 18 C -30 26 -12 18 0 8 Z" fill="${ROT}"/>
  <path d="M 0 8 C 30 -14 54 4 40 18 C 30 26 12 18 0 8 Z" fill="${ROT}"/>
  <path d="M -4 12 L -22 46 L -10 42 L -4 54 Z M 4 12 L 22 46 L 10 42 L 4 54 Z" fill="${DUNKELROT}"/>
  <circle cx="0" cy="10" r="8" fill="${DUNKELROT}"/>
</g>`}
</svg>`
}

// Ein schmaler Kopf über fremden Fenstern: Ausschnitt der Szene mit Schnee oder Laub und gestreiftem Rand.
export const kopf = (bild: SzeneInhalt['bild'], anzahl: number) => {
  const W = 720, Y = 170, H = 230
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 ${Y} ${W} ${H}">
<style>${STIL}</style>
<defs>${streifenMuster('streifenKopf', 22, bild === 'herbst')}
<filter id="schatten" x="-1" y="-1" width="3" height="3"><feDropShadow dx="0" dy="0.6" stdDeviation="0.9" flood-color="#2b3550" flood-opacity=".55"/></filter>
<clipPath id="rundKopf"><rect x="0" y="${Y}" width="${W}" height="${H}" rx="18"/></clipPath></defs>
<g clip-path="url(#rundKopf)">
${landschaft(bild, W, 480)}
${schneefall(anzahl, W, bild === 'herbst')}
</g>
<rect x="4" y="${Y + 4}" width="${W - 8}" height="${H - 8}" rx="15" fill="none" stroke="url(#streifenKopf)" stroke-width="8"/>
</svg>`
}
