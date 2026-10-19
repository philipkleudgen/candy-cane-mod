import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Einstellung, Saison, Stufe } from '../types'
import { ansage, FESTLICH, grussFuer, istTuerTag, modusFuer, saisonFuer, taktFuer } from './ansage'
import type { Lage } from './ansage'
import { ausText, berlin, phase, schluessel } from './kalender'
import type { Heute } from './kalender'
import { anstreichen, toastZeichen } from './anstrich'
import type { Jahreszeit } from './anstrich'
import { kopf, szene } from './svg'
import { FERTIG, T, TUEREN, UEBERRASCHUNG, WARTEN, WARTEN_SILVESTER, waehle } from './texte'
import type { Sprache } from './texte'

// Candy Cane: Weihnachten in Claude Code. Von Mitte Oktober bis zum 1. Advent ein Countdown im Band,
// ab dem 1. Advent alles (Schnee im Seitenfenster, Türchen, Wartetexte, Überraschungen), bis Neujahr.
// Ab dem 2. Januar schläft es. /weihnachten schaltet Stufe und Sprache um.

const PANE = 'candy-cane'
// Kräftige Weihnachtsfarben fürs Band.
const STREIFEN = { rot: '#D6001C', tief: '#A50016', weiss: '#FFFFFF', gold: '#FFD166' } as const
// Im Oktober: Kürbisorange auf Nachtschwarz, dazwischen Halloween-Lila.
const HERBST = { rot: '#E8731C', tief: '#3A1846', weiss: '#1B1020', gold: '#FFB347' } as const
const farbenFuer = (l: Lage) => (l.phase === 'herbst' ? HERBST : STREIFEN)
const jahreszeit = (l: Lage) => (l.phase === 'herbst' ? 'herbst' : 'winter') as Jahreszeit
const BEFEHL = 'weihnachten'

const einstellung = atom({ plugin: 'candy-cane', key: 'einstellung' } as const, { stufe: 'auto', sprache: 'de' } as Einstellung)
const testDatum = atom({ plugin: 'candy-cane', key: 'testDatum' } as const, null as string | null)
const takt = atom({ plugin: 'candy-cane', key: 'takt' } as const, '')
const tuerOffen = atom({ plugin: 'candy-cane', key: 'tuerOffen' } as const, '')
const saison = atom({ plugin: 'candy-cane', key: 'saison' } as const, null as unknown as Saison)

const jetzt = async ($: EngineInterface, test: string | null): Promise<Heute> => {
  const vorgabe = test ? ausText(test) : null
  return vorgabe ?? berlin(await $.clock.now())
}

const lage = async ($: EngineInterface): Promise<Lage> => {
  const { stufe, sprache } = await read($, einstellung)
  await read($, takt)
  const heute = await jetzt($, await read($, testDatum))
  const p = phase(heute)
  return { heute, phase: p, modus: modusFuer(stufe, p), sprache, stufe }
}

// Hält den öffentlichen Saison-Wert für andere Mods aktuell; schreibt nur, wenn sich etwas ändert.
const saisonAnsagen = async ($: EngineInterface) => {
  const neu = saisonFuer(await lage($))
  const alt = await read($, saison)
  if (JSON.stringify(alt) !== JSON.stringify(neu)) await update($, saison, () => neu)
}

// Anstrich für fremde Mods nur in der vollen Saison und solange er nicht abgeschaltet ist.
// Schon im Countdown: fremde Fenster sehen weihnachtlich aus, bleiben aber sonst, wie sie sind.
const mitAnstrich = async ($: EngineInterface, l: Lage) => (l.modus === 'voll' || l.modus === 'countdown') && (await read($, einstellung)).anstrich !== false

const THEMA = 'custom:candy-cane:'

// Schaltet in der vollen Saison das Farbthema von Claude Code auf Candy Cane und danach zurück.
// Lehnt die Engine das ab, bleibt alles, wie es ist; das Thema ist dann über /theme von Hand wählbar.
const themaAbgleichen = async ($: EngineInterface) => {
  const l = await lage($)
  const soll = l.modus === 'voll' && (await read($, einstellung)).thema !== false
  try {
    const zeile = (await $.config.list()).find(r => r.key === 'theme')
    if (!zeile) return
    const ist = String(zeile.value ?? '')
    const unseres = ist.startsWith(THEMA)
    if (soll && !unseres) {
      await $.store.set('vorherigesThema', ist)
      const { deny } = await $.config.set({ key: 'theme', value: `${THEMA}weihnachten-${/light/.test(ist) ? 'hell' : 'dunkel'}` })
      if (deny) $.ui.log(`candy-cane: Farbthema nicht umgeschaltet: ${deny}`, { to: 'debug' })
    } else if (!soll && unseres) {
      const vorher = (await $.store.get('vorherigesThema')) as string | undefined
      await $.config.set({ key: 'theme', value: vorher && !vorher.startsWith(THEMA) ? vorher : 'dark' })
    }
  } catch (err) {
    $.ui.log(`candy-cane: Farbthema: ${String(err)}`, { to: 'debug' })
  }
}

const speichern = async ($: EngineInterface, neu: Partial<Einstellung>) => {
  const alt = await read($, einstellung)
  const wert = { ...alt, ...neu }
  await update($, einstellung, () => wert)
  await $.store.set('einstellung', wert)
  await saisonAnsagen($)
  await themaAbgleichen($)
  return wert
}

const fensterAuf = async ($: EngineInterface) => {
  const titel = 'Candy Cane'
  return $.ui.open({ id: PANE, title: titel })
}

const tuerZeigen = async ($: EngineInterface, l: Lage) => {
  if (!istTuerTag(l.heute)) return false
  const heute = schluessel(l.heute)
  if ((await read($, tuerOffen)) === heute) return false
  await update($, tuerOffen, () => heute)
  await $.store.set('tuerOffen', heute)
  $.ui.toast(`🎁 ${TUEREN[l.sprache][l.heute.tag - 1]}`)
  return true
}

// Einmal am Tag Türchen und Gruß zeigen. Das eigene Fenster öffnet sich nie von selbst, nur mit /weihnachten:
// es soll die Fenster anderer Mods nicht verdecken.
const tagesbeginn = async ($: EngineInterface) => {
  const l = await lage($)
  if (l.modus === 'aus' || l.modus === 'dezent') return
  const heute = schluessel(l.heute)
  if (l.modus !== 'voll') return
  await tuerZeigen($, l)
  const gruss = grussFuer(l.heute, l.sprache)
  if (gruss && (await $.store.get('grussTag')) !== heute) {
    await $.store.set('grussTag', heute)
    $.ui.toast(`🎄 ${gruss}`)
  }
}

const parseArgs = (args: string) => args.trim().toLowerCase().split(/\s+/).filter(Boolean)

export const register: Register = on => {
  // Wartetext je Lauf, beim Absenden gezogen, damit er nicht bei jedem Neuzeichnen wechselt.
  let wartenIndex = 0
  let laufStart = 0

  on('session.start', async ($, e, next) => {
    const gespeichert = (await $.store.get('einstellung')) as Einstellung | undefined
    if (gespeichert && gespeichert.stufe && gespeichert.sprache) await update($, einstellung, () => gespeichert)
    const offen = (await $.store.get('tuerOffen')) as string | undefined
    if (offen) await update($, tuerOffen, () => offen)

    await $.command.register({
      name: BEFEHL,
      description: 'Candy Cane: Stand zeigen; Stufe auto|an|dezent|aus; Sprache de|en; tür; fenster; test JJJJ-MM-TT',
      argumentHint: '[auto|an|dezent|aus|de|en|tür|anstrich an|aus|thema an|aus|test <datum>|test aus]',
    })

    const ticken = async () => {
      const h = await jetzt($, await read($, testDatum))
      const neu = taktFuer(h)
      if ((await read($, takt)) !== neu) {
        await update($, takt, () => neu)
        await saisonAnsagen($)
        await themaAbgleichen($)
        await tagesbeginn($)
      }
    }
    await ticken()
    await saisonAnsagen($)
    await themaAbgleichen($)
    $.clock.every(30_000, () => void ticken())

    return next(e)
  })

  on('session.attach', { surface: 'desktop' }, async ($, e, next) => {
    const r = await next(e)
    await tagesbeginn($)
    return r
  })

  on('command.run', { command: BEFEHL }, async ($, e) => {
    const [a, b] = parseArgs(e.args)
    let antwort = ''
    // Das eigene Fenster verdrängt in der App das Fenster anderer Mods, darum nur auf ausdrücklichen Wunsch.
    if (!a) {
      antwort = ''
    } else if (a === 'fenster' || a === 'window') {
      await fensterAuf($)
    } else if (a === 'auto' || a === 'an' || a === 'dezent' || a === 'aus') {
      await speichern($, { stufe: a })
    } else if (a === 'on' || a === 'off' || a === 'subtle') {
      await speichern($, { stufe: a === 'on' ? 'an' : a === 'off' ? 'aus' : 'dezent' })
    } else if ((a === 'anstrich' || a === 'thema' || a === 'paint' || a === 'theme') && (b === 'an' || b === 'aus' || b === 'on' || b === 'off')) {
      const wert = b === 'an' || b === 'on'
      await speichern($, a === 'anstrich' || a === 'paint' ? { anstrich: wert } : { thema: wert })
    } else if (a === 'de' || a === 'en') {
      await speichern($, { sprache: a })
    } else if (a === 'tür' || a === 'tuer' || a === 'door') {
      const l = await lage($)
      if (!istTuerTag(l.heute)) antwort = T.tuerVorfreude[l.sprache]
      else {
        await update($, tuerOffen, () => '')
        await tuerZeigen($, l)
      }
    } else if (a === 'test') {
      if (!b || b === 'aus' || b === 'off') await update($, testDatum, () => null)
      else if (ausText(b)) await update($, testDatum, () => b)
      else return { text: 'Datum bitte als JJJJ-MM-TT oder JJJJ-MM-TTTHH:MM, z. B. /weihnachten test 2026-12-24' }
      const h = await jetzt($, await read($, testDatum))
      await update($, takt, () => taktFuer(h))
      await saisonAnsagen($)
      await themaAbgleichen($)
    } else {
      return { text: 'Unbekannt. Möglich: auto, an, dezent, aus, de, en, tür, fenster, anstrich an|aus, thema an|aus, test JJJJ-MM-TT, test aus' }
    }
    const l = await lage($)
    const test = await read($, testDatum)
    const { anstrich, thema } = await read($, einstellung)
    return { text: antwort || `Candy Cane · ${T.stufe[l.sprache]}: ${T.stufen[l.stufe][l.sprache]} · ${l.sprache.toUpperCase()} · Anstrich ${anstrich === false ? 'aus' : 'an'} · Thema ${thema === false ? 'aus' : 'an'}${test ? ` · Testdatum ${test}` : ''}${a ? '' : ' — umschalten mit /weihnachten auto|an|dezent|aus, Sprache de|en, eigenes Fenster mit /weihnachten fenster'}` }
  })

  on('prompt.submit', async ($, e, next) => {
    wartenIndex = Math.floor(Math.random() * 1000)
    laufStart = await $.clock.now()
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    const r = await next(e)
    const dauer = (await $.clock.now()) - laufStart
    if (laufStart > 0 && dauer > 60_000) {
      const l = await lage($)
      if (l.modus === 'voll' && Math.random() < 0.3) $.ui.toast(`✨ ${waehle(UEBERRASCHUNG[l.sprache], Math.random() * 1000)}`)
    }
    return r
  })

  // Wartetext: auf dem Desktop nur dort, wo die Zeile keinen Arbeitsschritt nennt.
  on('ui.render', { component: 'Spinner' }, async ($, e, next) => {
    const l = await lage($)
    const festlich = l.modus === 'voll' || (l.modus === 'dezent' && FESTLICH.includes(l.phase))
    if (!festlich || e.props.message) return next(e)
    const schritt = e.props.mode === 'tool-use' || e.props.mode === 'tool-input'
    if (e.surface !== 'terminal' && schritt && e.props.word !== 'Working') return next(e)
    const liste = l.phase === 'silvester' ? WARTEN_SILVESTER[l.sprache] : WARTEN[l.sprache]
    return next({ ...e, props: { ...e.props, word: waehle(liste, wartenIndex) } })
  })

  on('ui.render', { component: 'TurnDuration' }, async ($, e, next) => {
    const l = await lage($)
    if (l.modus !== 'voll') return next(e)
    return next({ ...e, props: { ...e.props, word: waehle(FERTIG[l.sprache], e.props.durationMs) } })
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) return next(e)
    const l = await lage($)
    if (l.modus === 'aus') return next(e)
    const a = ansage(l)
    const { Box, Text } = $.ui.resolve(e)
    // Bänder anderer Mods liegen darunter: sie bleiben sichtbar, mit Anstrich in Weihnachtsfarben.
    const fremd = await next(e)
    const unten = (await mitAnstrich($, l)) ? anstreichen(fremd, jahreszeit(l)) : fremd
    // Aus App-Bausteinen statt als Grafik: eine schmale Zeile über die volle Breite, auf jeder Oberfläche gleich.
    const b = a.band
    const F = farbenFuer(l)
    const kerzenZeile = b.herbst ? '🍂 🎃 🍁' : b.silvester ? '🎆 🥂 🎆' : b.kerzen !== undefined ? [0, 1, 2, 3].map(i => (i < (b.kerzen ?? 0) ? '🕯️' : '○')).join(' ') : ''
    // Streifen aus Schrägdreiecken, im Winter rot auf weiß wie eine Zuckerstange, im Oktober orange auf schwarz.
    const felder = Math.ceil(((e.props as { bodyColumns?: number }).bodyColumns ?? 160) / 2)
    const streifen = () => (
      // Kurze Stücke nebeneinander, die nie umbrechen; was über die Breite ragt, schneidet die Zeile ab.
      // Ein langer Text bräche in der App um oder bekäme ein „…“.
      <Box flexDirection="row" height={1} overflow="hidden">
        {Array.from({ length: Math.ceil(felder / 4) }, (_, i) => (
          <Box key={i} flexShrink={0}>
            <Text color={F.rot} backgroundColor={F.weiss}>{'◤◢◤◢◤◢◤◢'}</Text>
          </Box>
        ))}
      </Box>
    )
    return (
      <Box flexDirection="column">
        <Box flexDirection="column" borderStyle="round" borderColor={F.rot}>
          {streifen()}
          <Box flexDirection="row" justifyContent="space-between" alignItems="center" backgroundColor={F.tief} paddingX={1}>
            <Text wrap="truncate-end">
              <Text>{b.herbst ? '🎃🦇 ' : '🍬🎄 '}</Text>
              <Text color={b.herbst ? '#FFF1D6' : F.weiss} bold>{b.zeile}</Text>
              {b.unterzeile ? <Text color={F.gold} italic>{`  ${b.unterzeile}`}</Text> : null}
            </Text>
            {kerzenZeile ? <Text color={F.gold} bold>{kerzenZeile}</Text> : null}
          </Box>
          {streifen()}
        </Box>
        {unten}
      </Box>
    )
  })

  // Fenster anderer Mods: mit Anstrich in Weihnachtsfarben. Das eigene zeichnet der Hook darunter.
  on('ui.render', { component: 'Pane' }, async ($, e, next) => {
    if (e.requestId === PANE) return next(e)
    const baum = await next(e)
    const l = await lage($)
    if (!(await mitAnstrich($, l))) return baum
    const { Box, Text } = $.ui.resolve(e)
    // Oben ein schmaler Saisonkopf, darunter das fremde Fenster unverändert, nur in Saisonfarben.
    let oben: JSX.Element
    if (e.surface === 'terminal') {
      oben = <Text color={farbenFuer(l).rot} backgroundColor={farbenFuer(l).weiss}>{'◤◢'.repeat(30)}</Text>
    } else {
      const { Svg } = $.ui.resolve(e)
      oben = <Svg source={kopf(ansage(l).bild, l.modus === 'voll' ? 30 : 18)} alt={l.phase === 'herbst' ? 'Herbstabend mit Kürbissen' : 'Winterdorf im Schnee'} />
    }
    return (
      <Box flexDirection="column" gap={1}>
        {oben}
        {anstreichen(baum, jahreszeit(l))}
      </Box>
    )
  })

  // Toasts anderer Mods bekommen mit Anstrich das Saison-Zeichen vorn; der Text selbst bleibt.
  on('ui.toast', async ($, e, next) => {
    const l = await lage($)
    if (!(await mitAnstrich($, l))) return next(e)
    return next({ ...e, text: toastZeichen(e.text, saisonFuer(l).zeichen) })
  }).catch(($, e, next) => (next.called ? undefined : next(e)))

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const l = await lage($)
    const { Box, Text, Button } = $.ui.resolve(e)
    const s = l.sprache
    const a = ansage(l)
    const offen = (await read($, tuerOffen)) === schluessel(l.heute)
    const test = await read($, testDatum)

    const stufeKnopf = (stufe: Stufe) => (
      <Button
        key={`stufe-${stufe}`}
        label={T.stufen[stufe][s]}
        variant={l.stufe === stufe ? 'primary' : 'secondary'}
        onPress={() => void speichern($, { stufe })}
      />
    )
    const spracheKnopf = (sp: Sprache) => (
      <Button key={`sprache-${sp}`} label={sp.toUpperCase()} variant={s === sp ? 'primary' : 'secondary'} onPress={() => void speichern($, { sprache: sp })} />
    )

    let bildteil: JSX.Element
    if (e.surface === 'terminal') {
      bildteil = <Text color={farbenFuer(l).rot} bold>{l.phase === 'herbst' ? '🎃' : '🎄'} {a.schild?.gross} {a.schild?.klein}</Text>
    } else {
      const { Svg } = $.ui.resolve(e)
      // Wenige Flocken halten die Grafik klein genug für die Desktop-App.
      const flocken = l.modus === 'voll' ? 55 : 25
      bildteil = <Svg source={szene({ bild: a.bild, flocken, schild: a.schild })} alt={`${a.schild?.gross ?? ''} ${a.schild?.klein ?? ''}`} isInteractive />
    }

    return (
      <Box flexDirection="column" gap={1}>
        {bildteil}
        {l.modus === 'aus' ? <Text dimColor>{T.ausserSaison[s]}</Text> : null}
        <Text bold color="#8E0B20">{a.band.zeile}</Text>
        {a.band.unterzeile ? <Text italic color="#1F4D3A">{a.band.unterzeile}</Text> : null}
        {istTuerTag(l.heute) ? (
          <Box flexDirection="column">
            <Text bold>🎁 {T.tuerHeute[s]}</Text>
            {offen
              ? <Text>{TUEREN[s][l.heute.tag - 1]}</Text>
              : <Button key="tuer" label={T.tuerZu[s]} variant="primary" onPress={async () => { await tuerZeigen($, await lage($)) }} />}
          </Box>
        ) : null}
        {l.phase === 'herbst' ? <Text dimColor>{T.herbstHinweis[s]}</Text> : null}
        {l.phase === 'countdown' ? <Text dimColor>{T.countdownHinweis[s]}</Text> : null}
        <Box flexDirection="row" gap={1} flexWrap="wrap">
          {stufeKnopf('auto')}
          {stufeKnopf('an')}
          {stufeKnopf('dezent')}
          {stufeKnopf('aus')}
        </Box>
        <Box flexDirection="row" gap={1}>
          {spracheKnopf('de')}
          {spracheKnopf('en')}
        </Box>
        {test ? <Text dimColor>Testdatum: {test} · /weihnachten test aus</Text> : null}
      </Box>
    )
  })
}
