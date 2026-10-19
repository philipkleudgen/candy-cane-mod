// Alle Texte von Candy Cane, Deutsch und Englisch. Ton: amerikanischer Weihnachtsfilm, mit Absicht zu süß.

export type Sprache = 'de' | 'en'

type Satz = Record<Sprache, string>

// Wartetexte, solange Claude arbeitet.
export const WARTEN: Record<Sprache, string[]> = {
  de: [
    'Geschenke werden gepackt',
    'Die Plätzchen sind gleich fertig',
    'Der Bürgermeister schmückt den Baum',
    'Rentiere werden gestriegelt',
    'Kakao mit Marshmallows wird gerührt',
    'Lichterketten werden entwirrt',
    'Die Wichtel löten noch',
    'Schleifen werden gebunden',
    'Der Chor probt ein letztes Mal',
    'Zimtsterne werden ausgestochen',
    'Schnee wird bestellt',
    'Der Schlitten wird vorgewärmt',
    'Der Wunschzettel wird gelesen',
    'Mistelzweige werden aufgehängt',
  ],
  en: [
    'Wrapping presents',
    'The cookies are almost done',
    'The mayor is trimming the tree',
    'Brushing the reindeer',
    'Stirring the hot cocoa',
    'Untangling the string lights',
    'The elves are still soldering',
    'Tying the bows',
    'The carolers are warming up',
    'Cutting out gingerbread stars',
    'Ordering fresh snow',
    'Warming up the sleigh',
    'Reading the wish list',
    'Hanging the mistletoe',
  ],
}

export const FERTIG: Record<Sprache, string[]> = {
  de: ['Eingepackt', 'Gebacken', 'Geschmückt', 'Verschneit', 'Verzaubert', 'Unterm Baum'],
  en: ['Wrapped', 'Baked', 'Decorated', 'Snowed in', 'Enchanted', 'Under the tree'],
}

// Silvesterabend und Neujahr bekommen eigene Wartetexte.
export const WARTEN_SILVESTER: Record<Sprache, string[]> = {
  de: ['Raketen werden aufgestellt', 'Der Sekt wird kaltgestellt', 'Blei wird gegossen', 'Wunderkerzen werden verteilt', 'Der Countdown wird geprobt'],
  en: ['Setting up the fireworks', 'Chilling the champagne', 'Handing out sparklers', 'Rehearsing the countdown', 'Polishing the disco ball'],
}

// Die 24 Türchen. Der 6. ist Nikolaus, der 24. Heiligabend.
export const TUEREN: Record<Sprache, string[]> = {
  de: [
    'Türchen 1: Ab heute ist offiziell Weihnachtszeit. Jede Datei, die du heute anlegst, riecht ein bisschen nach Zimt.',
    'Türchen 2: Ein heißer Kakao mit doppelt Sahne. Kalorien zählen im Advent nicht, das ist wissenschaftlich unbewiesen.',
    'Türchen 3: Heute darfst du beim Warten auf einen Build ein Weihnachtslied summen. Leise. Oder laut.',
    'Türchen 4: Barbaratag. Stell einen Kirschzweig ins Wasser. Wenn er an Heiligabend blüht, läuft nächstes Jahr alles.',
    'Türchen 5: Fun Fact: In Weihnachtsfilmen schneit es genau dann, wenn sich zwei Menschen endlich verstehen. Genau wie bei Merge-Konflikten.',
    'Türchen 6: Nikolaus! Stiefel geputzt? Für dich liegt ein Bugfix drin, der von ganz allein funktioniert.',
    'Türchen 7: Heute ist ein guter Tag, um jemandem ehrlich danke zu sagen. Mit Ausrufezeichen.',
    'Türchen 8: Die Kleinstadt hat abgestimmt: Du bist Mitarbeiter des Monats. Die Urkunde hängt im Bäckerladen.',
    'Türchen 9: Ein Lebkuchenherz mit der Aufschrift „Läuft.“ Gefunden zwischen zwei Commits.',
    'Türchen 10: Mach heute fünf Minuten früher Feierabend und guck aus dem Fenster. Vielleicht schneit es ja.',
    'Türchen 11: Die Wichtel haben deine Todo-Liste gesehen. Sie sagen: Zwei Punkte darfst du ins neue Jahr schieben.',
    'Türchen 12: Glühwein-Gutschein. Gültig ab 18 Uhr, einzulösen bei dir selbst.',
    'Türchen 13: Lucia-Tag. Ein Licht für die dunkelste Zeit des Jahres, und für jeden grünen Test.',
    'Türchen 14: Heute wird nicht gemeckert, nur gestaunt. Über Schnee, über Lichter, über Code, der beim ersten Mal läuft.',
    'Türchen 15: Halbzeit im Dezember. Zeit für eine zweite Runde Plätzchen.',
    'Türchen 16: Ein Rentier hat deinen letzten Pull Request gelesen und vorsichtig genickt.',
    'Türchen 17: Weihnachtsfilm-Regel Nr. 1: Wer in der Großstadt zu viel arbeitet, findet in der Kleinstadt sein Glück. Du bist gewarnt.',
    'Türchen 18: Heute ein Lied auf Wiederholung: „Last Christmas“. Wer es zuerst hört, hat verloren.',
    'Türchen 19: Der Bürgermeister lässt ausrichten: Das Lichterfest findet statt, und du bist eingeladen.',
    'Türchen 20: Noch vier Tage. Die Geschenke müssen jetzt aber wirklich mal gekauft werden.',
    'Türchen 21: Wintersonnenwende. Ab morgen werden die Tage wieder länger. Es geht bergauf.',
    'Türchen 22: Ein handgeschriebener Zettel unterm Teller: „Du hast das dieses Jahr wirklich gut gemacht.“',
    'Türchen 23: Morgen ist es so weit. Heute noch einmal tief durchatmen und den Laptop zuklappen.',
    'Türchen 24: Frohe Weihnachten! Heute wird nichts mehr deployed. Nur noch Kerzen angezündet und Plätzchen gegessen.',
  ],
  en: [
    'Door 1: The holiday season is officially open. Every file you create today smells faintly of cinnamon.',
    'Door 2: A hot cocoa with extra whipped cream. Calories don\'t count in December. Science is still checking.',
    'Door 3: You are hereby allowed to hum a carol while the build runs. Quietly. Or not.',
    'Door 4: Put a cherry branch in water today. If it blooms by Christmas Eve, next year is going to be great.',
    'Door 5: Fun fact: in holiday movies it starts snowing the moment two people finally understand each other. Just like merge conflicts.',
    'Door 6: St. Nicholas Day! Shoes polished? There\'s a bug fix inside that just works.',
    'Door 7: A good day to tell someone a sincere thank you. With an exclamation mark.',
    'Door 8: The town has voted: you are Employee of the Month. The certificate hangs in the bakery window.',
    'Door 9: A gingerbread heart that says "Nailed it." Found between two commits.',
    'Door 10: Log off five minutes early today and look out the window. It might be snowing.',
    'Door 11: The elves have seen your to-do list. They say two items may move to next year.',
    'Door 12: A voucher for mulled wine. Valid after 6 pm, redeemable with yourself.',
    'Door 13: St. Lucia\'s Day. A light for the darkest time of the year, and one for every green test.',
    'Door 14: No grumbling today, only wonder. At snow, at lights, at code that runs the first time.',
    'Door 15: Halfway through December. Time for a second batch of cookies.',
    'Door 16: A reindeer read your last pull request and gave a careful nod.',
    'Door 17: Holiday movie rule #1: whoever works too hard in the big city finds happiness in a small town. Consider yourself warned.',
    'Door 18: Today\'s song: "Last Christmas". Whoever hears it first loses.',
    'Door 19: The mayor sends word: the tree lighting is on, and you are invited.',
    'Door 20: Four days to go. The presents really need buying now.',
    'Door 21: Winter solstice. From tomorrow the days get longer again. Uphill from here.',
    'Door 22: A handwritten note under your plate: "You did really well this year."',
    'Door 23: Tomorrow\'s the day. Take a deep breath and close the laptop.',
    'Door 24: Merry Christmas! Nothing gets deployed today. Only candles lit and cookies eaten.',
  ],
}

// Kleine Überraschungen nach langen Läufen.
export const UEBERRASCHUNG: Record<Sprache, string[]> = {
  de: [
    'Ein Rentier hat deinen Build gelobt.',
    'Draußen hat es gerade angefangen zu schneien. Rein zufällig.',
    'Die Wichtel haben mitgezählt: Das war gute Arbeit.',
    'Jemand hat dir einen Lebkuchen auf den Schreibtisch gelegt.',
    'Der Bäcker hat dein Lieblingsplätzchen zurückgelegt.',
    'Ein Schneemann vor dem Fenster winkt dir zu.',
    'Die Kleinstadt-Zeitung titelt: „Großer Fortschritt im Projekt!“',
    'Ein Glöckchen hat geklingelt. Irgendwo hat ein Engel seine Flügel bekommen.',
    'Die Lichterkette blinkt jetzt im Takt deiner Tests.',
    'Der Weihnachtsmann hat dich auf die Liste der Braven gesetzt. Endgültig.',
  ],
  en: [
    'A reindeer just praised your build.',
    'It started snowing outside. Purely by coincidence.',
    'The elves were counting: that was good work.',
    'Someone left a gingerbread cookie on your desk.',
    'The baker set aside your favourite cookie.',
    'A snowman outside your window is waving at you.',
    'The town paper\'s headline: "Big Progress on the Project!"',
    'A bell just rang. Somewhere an angel got its wings.',
    'The string lights now blink in time with your tests.',
    'Santa moved you to the nice list. For good.',
  ],
}

export const GRUSS: Record<'advent1' | 'advent2' | 'advent3' | 'advent4' | 'heiligabend' | 'weihnachten1' | 'weihnachten2' | 'silvester' | 'neujahr', Satz> = {
  advent1: { de: 'Erster Advent! Die erste Kerze brennt. Ab heute ist hier alles weihnachtlich.', en: 'First Sunday of Advent! The first candle is lit. From today, everything here is festive.' },
  advent2: { de: 'Zweiter Advent. Zwei Kerzen, doppelt so gemütlich.', en: 'Second Sunday of Advent. Two candles, twice as cozy.' },
  advent3: { de: 'Dritter Advent. Drei Kerzen, und der Duft von Zimt liegt in der Luft.', en: 'Third Sunday of Advent. Three candles and a hint of cinnamon in the air.' },
  advent4: { de: 'Vierter Advent. Alle vier Kerzen brennen. Gleich ist es so weit.', en: 'Fourth Sunday of Advent. All four candles are lit. Almost there.' },
  heiligabend: { de: 'Frohe Weihnachten! Schön, dass du da bist.', en: 'Merry Christmas! So glad you\'re here.' },
  weihnachten1: { de: 'Erster Weihnachtstag. Reste essen ist heute Pflicht.', en: 'Christmas Day. Leftovers are mandatory today.' },
  weihnachten2: { de: 'Zweiter Weihnachtstag. Noch ein Stück Stollen?', en: 'Boxing Day. One more slice of fruitcake?' },
  silvester: { de: 'Silvester! Danke für dieses Jahr. Heute Abend knallt es.', en: 'New Year\'s Eve! Thanks for this year. Tonight we celebrate.' },
  neujahr: { de: 'Frohes neues Jahr! Candy Cane verabschiedet sich heute und kommt im Herbst wieder.', en: 'Happy New Year! Candy Cane says goodbye today and returns next autumn.' },
}

export const T = {
  titel: { de: 'Candy Cane', en: 'Candy Cane' },
  bisAdvent: { de: (n: number) => (n === 1 ? 'Morgen ist der 1. Advent' : `Noch ${n} Tage bis zum 1. Advent`), en: (n: number) => (n === 1 ? 'Advent starts tomorrow' : `${n} days until Advent`) },
  bisHalloween: { de: (n: number) => (n === 1 ? 'Morgen ist Halloween' : `Noch ${n} Tage bis Halloween`), en: (n: number) => (n === 1 ? 'Halloween is tomorrow' : `${n} days until Halloween`) },
  halloween: { de: 'Heute ist Halloween. Süßes oder Saures!', en: 'Happy Halloween. Trick or treat!' },
  bisHeiligabend: { de: (n: number) => (n === 1 ? 'Morgen ist Heiligabend' : `Noch ${n} Tage bis Heiligabend`), en: (n: number) => (n === 1 ? 'Christmas Eve is tomorrow' : `${n} days until Christmas Eve`) },
  heiligabend: { de: 'Heiligabend. Frohe Weihnachten!', en: 'Christmas Eve. Merry Christmas!' },
  weihnachtstag: { de: (n: number) => `${n}. Weihnachtstag`, en: (n: number) => (n === 1 ? 'Christmas Day' : 'Boxing Day') },
  zwischen: { de: (n: number) => `Zwischen den Jahren · noch ${n} Tage bis Silvester`, en: (n: number) => `Between the years · ${n} days until New Year's Eve` },
  silvester: {
    de: (std: number, min: number, jahr: number) => `Noch ${std} Std. ${min} Min. bis ${jahr}`,
    en: (std: number, min: number, jahr: number) => `${std}h ${min}m until ${jahr}`,
  },
  neujahr: { de: (jahr: number) => `Frohes neues Jahr ${jahr}!`, en: (jahr: number) => `Happy New Year ${jahr}!` },
  kerzen: { de: (n: number) => `${n}. Advent`, en: (n: number) => `Advent ${n}` },
  tuerZu: { de: 'Türchen öffnen', en: 'Open today\'s door' },
  tuerHeute: { de: 'Heutiges Türchen', en: 'Today\'s door' },
  tuerVorfreude: { de: 'Ab dem 1. Dezember öffnet sich hier jeden Tag ein Türchen.', en: 'From December 1st a new door opens here every day.' },
  stufe: { de: 'Stufe', en: 'Mode' },
  stufen: {
    auto: { de: 'Automatisch', en: 'Automatic' },
    an: { de: 'Voll an', en: 'Full on' },
    dezent: { de: 'Dezent', en: 'Subtle' },
    aus: { de: 'Aus', en: 'Off' },
  },
  ausserSaison: { de: 'Außer Saison. Candy Cane schläft bis Oktober.', en: 'Out of season. Candy Cane sleeps until October.' },
  herbstHinweis: {
    de: 'Bis Halloween ist Herbst. Ab dem 1. November zählt Candy Cane zum Advent, ab dem 1. Advent kommen Schnee, Türchen und Wartetexte.',
    en: 'Autumn until Halloween. From November 1st Candy Cane counts down to Advent; on the first Sunday of Advent snow, doors and festive spinners arrive.',
  },
  countdownHinweis: {
    de: 'Ab dem 1. Advent schaltet sich alles von allein ein: Schnee, Türchen, Wartetexte und kleine Überraschungen.',
    en: 'On the first Sunday of Advent everything switches on by itself: snow, doors, festive spinner and little surprises.',
  },
}

export const waehle = <X>(liste: X[], zahl: number) => liste[Math.abs(Math.floor(zahl)) % liste.length] as X
