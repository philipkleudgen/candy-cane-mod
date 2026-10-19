import { expect, mock, test } from 'claude-code/testing'

import { anstreichen, toastZeichen, umfaerben } from './anstrich'
import { adventssonntag, ausText, ersterAdvent, kerzen, phase } from './kalender'
import { ansage, grussFuer, modusFuer, saisonFuer } from './ansage'
import type { Lage } from './ansage'
import { szene } from './svg'

// Die Desktop-App ließ eine Szene von 115.000 Zeichen ungezeichnet; 50.000 halten Abstand dazu.
test('Fenstergrafik bleibt klein genug für die Desktop-App', async () => {
  for (const bild of ['dorf', 'silvester'] as const) {
    expect(szene({ bild, flocken: 55, schild: { gross: 'Frohe Weihnachten', klein: 'Heiligabend' } }).length).toBeLessThan(50_000)
  }
})

const tag = (text: string) => ausText(text)!

const lageAm = (text: string, sprache: 'de' | 'en' = 'de'): Lage => {
  const heute = tag(text)
  const p = phase(heute)
  return { heute, phase: p, modus: modusFuer('auto', p), sprache, stufe: 'auto' }
}

test('1. Advent fällt richtig', async () => {
  expect(ersterAdvent(2026)).toEqual({ monat: 11, tag: 29 })
  expect(ersterAdvent(2027)).toEqual({ monat: 11, tag: 28 })
  // 24.12.2028 ist ein Sonntag und selbst der 4. Advent.
  expect(ersterAdvent(2028)).toEqual({ monat: 12, tag: 3 })
})

test('Phasen über die Saison', async () => {
  expect(phase(tag('2026-10-01'))).toBe('herbst')
  expect(phase(tag('2026-09-30'))).toBe('aus')
  expect(phase(tag('2026-10-18'))).toBe('herbst')
  expect(phase(tag('2026-10-31'))).toBe('herbst')
  expect(phase(tag('2026-11-01'))).toBe('countdown')
  expect(phase(tag('2026-11-28'))).toBe('countdown')
  expect(phase(tag('2026-11-29'))).toBe('advent')
  expect(phase(tag('2026-12-24'))).toBe('weihnachten')
  expect(phase(tag('2026-12-28'))).toBe('zwischen')
  expect(phase(tag('2026-12-31'))).toBe('silvester')
  expect(phase(tag('2027-01-01'))).toBe('neujahr')
  expect(phase(tag('2027-01-02'))).toBe('aus')
})

test('Stufen: auto schaltet am 1. Advent voll, an und aus übersteuern', async () => {
  expect(modusFuer('auto', 'countdown')).toBe('countdown')
  expect(modusFuer('auto', 'herbst')).toBe('countdown')
  expect(modusFuer('auto', 'advent')).toBe('voll')
  expect(modusFuer('auto', 'aus')).toBe('aus')
  expect(modusFuer('an', 'countdown')).toBe('voll')
  expect(modusFuer('dezent', 'advent')).toBe('dezent')
  expect(modusFuer('aus', 'weihnachten')).toBe('aus')
})

test('Kerzen und Adventssonntage', async () => {
  expect(kerzen(tag('2026-11-28'))).toBe(0)
  expect(kerzen(tag('2026-11-29'))).toBe(1)
  expect(kerzen(tag('2026-12-13'))).toBe(3)
  expect(kerzen(tag('2026-12-20'))).toBe(4)
  expect(adventssonntag(tag('2026-12-06'))).toBe(2)
  expect(adventssonntag(tag('2026-12-07'))).toBe(0)
})

test('Ansagen und Grüße', async () => {
  expect(ansage(lageAm('2026-10-18')).band.zeile).toBe('Noch 13 Tage bis Halloween')
  expect(ansage(lageAm('2026-10-18', 'en')).band.zeile).toBe('13 days until Halloween')
  expect(ansage(lageAm('2026-10-18')).bild).toBe('herbst')
  expect(ansage(lageAm('2026-10-31')).band.zeile).toBe('Heute ist Halloween. Süßes oder Saures!')
  expect(ansage(lageAm('2026-11-01')).band.zeile).toBe('Noch 28 Tage bis zum 1. Advent')
  expect(ansage(lageAm('2026-11-28')).band.zeile).toBe('Morgen ist der 1. Advent')
  expect(ansage(lageAm('2026-12-01')).band.zeile).toBe('Noch 23 Tage bis Heiligabend')
  expect(ansage(lageAm('2026-12-31T22:30')).band.zahl).toBe('1:30')
  expect(ansage(lageAm('2026-12-31T22:30')).bild).toBe('silvester')
  expect(ansage(lageAm('2027-01-01')).schild?.gross).toBe('2027')
  expect(grussFuer(tag('2026-11-29'), 'de')).toContain('Erster Advent')
  expect(grussFuer(tag('2026-12-02'), 'de')).toBe(null)
})

test('Saison für andere Mods', async () => {
  expect(saisonFuer(lageAm('2026-10-18')).aktiv).toBe(true)
  expect(saisonFuer(lageAm('2026-10-18')).zeichen).toBe('🎃')
  expect(saisonFuer(lageAm('2026-11-10')).zeichen).toBe('❄')
  expect(saisonFuer(lageAm('2026-12-06')).modus).toBe('voll')
  expect(saisonFuer(lageAm('2026-12-31')).zeichen).toBe('✨')
  expect(saisonFuer(lageAm('2027-01-02')).aktiv).toBe(false)
})

for (const surface of ['terminal', 'desktop'] as const) {
  test(`Band und Fenster zeichnen auf ${surface}`, async ($, on) => {
    // 06.12.2026, 12 Uhr Berliner Zeit
    mock.clock(on, { now: Date.UTC(2026, 11, 6, 11, 0) })
    mock.store(on)
    // Steht für die Engine darunter: ohne fremde Mods ein leeres Feld.
    on('ui.render', ($, e) => {
      const { Box } = $.ui.resolve(e)
      return <Box />
    })
    const band = await $.ui.mount({ plugin: 'candy-cane', surface, component: 'AbovePrompt', props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 100 } as never })
    expect(await band.find({ type: 'Text', text: /Noch 18 Tage bis Heiligabend/ })).toBeDefined()
    await band.unmount()

    const fenster = await $.ui.mount({ plugin: 'candy-cane', surface, component: 'Pane', requestId: 'candy-cane', props: { title: 'Candy Cane', bodyColumns: 60 } as never })
    expect(await fenster.find({ type: 'Text', text: /Noch 18 Tage bis Heiligabend/ })).toBeDefined()
    await fenster.press({ key: 'sprache-en' })
    expect(await fenster.find({ type: 'Text', text: /18 days until Christmas Eve/ })).toBeDefined()
    await fenster.unmount()
  })
}

for (const surface of ['terminal', 'desktop'] as const) {
  test(`im Herbst bleibt das fremde Fenster sichtbar, mit Herbstanstrich auf ${surface}`, async ($, on) => {
    // 19.10.2026, 12 Uhr Berliner Zeit: Herbst, noch vor Halloween
    mock.clock(on, { now: Date.UTC(2026, 9, 19, 10, 0) })
    mock.store(on)
    on('ui.render', ($, e) => {
      const { Box, Text } = $.ui.resolve(e)
      return <Box><Text key="fremd" color="#FFD23F">Kontingente</Text></Box>
    })
    const fenster = await $.ui.mount({ plugin: 'candy-cane', surface, component: 'Pane', requestId: 'laufende-arbeit', props: { title: 'Laufende Arbeit', bodyColumns: 60 } as never })
    const text = await fenster.find({ type: 'Text', text: /Kontingente/ })
    expect(text).toBeDefined()
    expect(JSON.stringify(text)).toContain('#E3A33B')
    await fenster.unmount()
    const band = await $.ui.mount({ plugin: 'candy-cane', surface, component: 'AbovePrompt', props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 100 } as never })
    expect(await band.find({ type: 'Text', text: /Noch 12 Tage bis Halloween/ })).toBeDefined()
    await band.unmount()
  })
}

test('Umfärben nach Farbton, Grau bleibt', async () => {
  expect(umfaerben('#FFD23F')).toBe('#E8B04B')
  expect(umfaerben('#2EC27E')).toBe('#3FA66B')
  expect(umfaerben('#FF5A36')).toBe('#E0303F')
  expect(umfaerben('#4EA8DE')).toBe('#9ED8F0')
  expect(umfaerben('#3A3A3A')).toBe('#3A3A3A')
  expect(umfaerben('success')).toBe('#3FA66B')
  const baum = anstreichen({ type: 'Box', props: { borderColor: '#FF9F1C' }, children: [{ type: 'Text', props: { color: '#2EC27E' }, children: ['ok'] }, 'roh'] })
  expect(baum).toEqual({ type: 'Box', props: { borderColor: '#E8794B' }, children: [{ type: 'Text', props: { color: '#3FA66B' }, children: ['ok'] }, 'roh'] })
  expect(toastZeichen('Regel-Wächter hat abgewiesen', '🎄')).toBe('🎄 Regel-Wächter hat abgewiesen')
  expect(toastZeichen('🎁 Türchen', '🎄')).toBe('🎁 Türchen')
})

for (const surface of ['terminal', 'desktop'] as const) {
  test(`fremdes Fenster und Band bekommen den Anstrich auf ${surface}`, async ($, on) => {
    mock.clock(on, { now: Date.UTC(2026, 11, 6, 11, 0) })
    mock.store(on)
    // Steht für einen fremden Mod unter Candy Cane.
    on('ui.render', ($, e) => {
      const { Box, Text } = $.ui.resolve(e)
      return <Box borderStyle="round" borderColor="#FF9F1C"><Text key="fremd" color="#FFD23F">fremder Mod</Text></Box>
    })
    const fenster = await $.ui.mount({ plugin: 'candy-cane', surface, component: 'Pane', requestId: 'fremd', props: { title: 'Fremd', bodyColumns: 60 } as never })
    const text = await fenster.find({ type: 'Text', text: /fremder Mod/ })
    expect(text).toBeDefined()
    expect(JSON.stringify(text)).toContain('#E8B04B')
    await fenster.unmount()
    const band = await $.ui.mount({ plugin: 'candy-cane', surface, component: 'AbovePrompt', props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 100 } as never })
    expect(await band.find({ type: 'Text', text: /fremder Mod/ })).toBeDefined()
    await band.unmount()
  })
}
