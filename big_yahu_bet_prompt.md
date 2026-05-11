# Claude Code Prompt: Big Yahu Bet — Casino Demo Plattform

## Projektübersicht

Baue eine vollständige Casino-Webseite namens **"Big Yahu Bet"** (Demo/Spielgeld, **kein echtes Geld**), deren Layout, Design-Sprache und User-Flow stark an die Plattform **Rainbet (rainbet.com)** angelehnt ist. Die Seite muss klar als reine Demo-/Entertainment-Anwendung gekennzeichnet sein und an mehreren Stellen einen sichtbaren Disclaimer enthalten (z. B. "Demo Mode — Play Money Only — Not Real Gambling").

Die Plattform soll **drei voll funktionsfähige Spiele** enthalten:
1. Zwei Slot-Maschinen im Stil klassischer Novomatic-Slots (5x3 Fruit Slot + 5x3 Adventure/Egypt Slot mit Free Spins & Expanding Symbol)
2. Blackjack (Single-Deck, Standard-Regeln)
3. European Roulette (Single Zero)

---

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** TailwindCSS + shadcn/ui Komponenten + Framer Motion für Animationen
- **State Management:** Zustand (für globalen User-State, Wallet, Game-State)
- **Routing:** React Router v6
- **Persistenz:** localStorage für Demo-Wallet-Balance, Username, Game-History
- **Slot Engine:** Eigene TypeScript-Implementierung, optional Phaser 3 oder PixiJS für animierte Reels
- **Card Games:** Reine React-Komponenten mit CSS/Framer-Motion Animationen
- **Icons:** lucide-react
- **Sound:** howler.js für Sound-Effekte (Win, Spin, Card Flip, Chip Sound, Roulette Wheel)

Keine Backend-Pflicht — alles läuft client-seitig. Optional kann ein einfaches Express/Node-Backend für eine "Recent Wins"-Feed-Simulation genutzt werden, ansonsten alles lokal mocken.

---

## Branding & Visuelles Design (Rainbet-Stil)

### Farbpalette (orientiert an Rainbet)
- **Primärer Hintergrund:** sehr dunkles Violett/Navy (`#0F0E1A`, `#16142B`)
- **Sekundärer Hintergrund / Cards:** `#1C1A36`, `#252247`
- **Accent / CTA:** kräftiges Lila/Violett mit leichtem Glow (`#7B61FF`, `#9B7CFF`)
- **Erfolg / Wins:** Neon-Grün (`#00E676`)
- **Gold/Highlight für Jackpots:** `#FFC842`
- **Text primär:** `#FFFFFF`
- **Text sekundär:** `#A4A1C7`

### Typografie
- Sans-serif, modern, bold (z. B. Inter, Sora oder Manrope)
- Große Headings mit leichtem Letter-Spacing
- Game-Titel in Uppercase, fett

### Logo
- Wortmarke "BIG YAHU BET" mit stilisiertem "Y" als Krone oder Würfel
- Lila-Pink Gradient auf dem Logo
- Platzierung oben links in der Navbar

### Allgemeine UI-Sprache
- Stark abgerundete Ecken (rounded-2xl)
- Subtile Glow-/Shadow-Effekte unter Buttons und Game-Cards
- Hover-States mit leichtem Scale (1.02–1.05) und Glow
- Glassmorphism-Effekte bei Modals und Sidebars
- Animierte Gradient-Borders bei Featured-Elementen

---

## Seitenstruktur (Routes)

1. `/` — Home / Casino-Lobby
2. `/casino` — komplette Spiele-Übersicht mit Filtern
3. `/slots` — Kategorie-Seite Slots
4. `/table-games` — Kategorie-Seite Tisch-Spiele
5. `/play/sizzling-fruits` — Slot 1
6. `/play/book-of-yahu` — Slot 2
7. `/play/blackjack` — Blackjack-Tisch
8. `/play/roulette` — Roulette-Tisch
9. `/promotions` — Promotions-Seite (statisch, mit Bonus-Karten)
10. `/profile` — User-Profil mit Wallet, Stats, Game-History

---

## Layout / Globale Komponenten

### Top Navbar (sticky, full-width)
- Links: Logo "BIG YAHU BET"
- Mitte: Hauptnavigation (Casino, Slots, Live Casino [Coming Soon], Promotions)
- Rechts:
  - Wallet-Anzeige (z. B. "🪙 10,000.00 YAHU") — klickbar, öffnet Wallet-Modal
  - Suchleiste mit Lupen-Icon (durchsucht Spiele)
  - Profil-Avatar mit Dropdown (Profile, Settings, Logout)
  - "Deposit"-Button in Lila mit leichtem Glow (öffnet Demo-Modal mit Hinweis "Demo coins können kostenlos nachgeladen werden")

### Linke Sidebar (collapsable)
- Navigation mit Icons:
  - Casino
  - Slots
  - Table Games
  - Promotions
  - Leaderboard (Mock)
  - Affiliates (Mock-Seite)
- Unten: Sprachen-Switcher, Support-Chat-Bubble (öffnet Mock-Chat-Widget)

### Footer
- Spalten: About, Help, Legal, Responsible Gaming
- Provider-Logos (mocked, eigene erfundene Provider-Namen)
- Großer Disclaimer: "Big Yahu Bet ist eine Demo-Anwendung. Es findet kein echtes Glücksspiel statt. Keine Einsätze, Gewinne oder Auszahlungen mit echtem Geld."
- 18+ Hinweis und Responsible-Gaming-Logos (eigene SVG-Mocks)

---

## Home / Lobby Page

### Hero-Banner (Carousel mit 3 Slides)
- Slide 1: "Welcome to Big Yahu Bet — 10,000 Demo Coins to start"
- Slide 2: Promo für Sizzling Fruits Slot
- Slide 3: Promo für Blackjack Tournament (Mock)
- Große Buttons "Play Now", lila Gradient, Glow
- Auto-Rotate alle 6 Sekunden, manuelle Navigation möglich

### "Recent Big Wins"-Ticker
- Horizontaler Scroll-Ticker (von rechts nach links, smooth)
- Zeigt Mock-Daten: `User123 won 1,250 YAHU on Sizzling Fruits`
- Avatar, Username, Spielname, Gewinnbetrag
- Generiere alle 5 Sekunden einen neuen Mock-Eintrag, behalte die letzten 20

### Spiel-Kategorien (horizontale Scroll-Reihen, wie Netflix-Style)
Jede Reihe mit Header und "View All →" Link:
1. **Featured Games** — alle 4 Spiele
2. **Popular Slots** — Sizzling Fruits, Book of Yahu (+ Mock-Tiles "Coming Soon")
3. **Table Games** — Blackjack, Roulette (+ Mock-Tiles)
4. **New Releases** — Mock-Tiles
5. **Live Casino** — alle "Coming Soon" Mock-Tiles

### Game-Card Komponente
- Hochformat (Aspect Ratio ca. 3:4)
- Cover-Image (für jedes Spiel ein eigenes hochwertiges Cover-Image generieren oder mit CSS-Gradient + Spiel-Icon mocken)
- Hover-Effekt: leichtes Scale, dunkler Overlay erscheint mit "PLAY NOW"-Button und Provider-Name
- Badge oben links: "HOT", "NEW", "POPULAR" (je nach Status)
- Beim Klick: Navigation zur jeweiligen Spielseite

### Promo-Banner-Sektion
- 2-3 Karten nebeneinander (z. B. "Daily Reload", "Refer a Friend", "VIP Club")
- Jede Karte mit Gradient-Background, großem Icon, Text und CTA

---

## Wallet- / Demo-Coin-System

- Jeder neue User startet mit **10.000 YAHU Coins**
- Balance wird in `localStorage` persistiert
- Globaler Zustand via Zustand Store: `useWalletStore` mit Methoden `bet(amount)`, `win(amount)`, `reset()`
- Wenn Balance < Mindesteinsatz: "Reload Demo Coins"-Button im Wallet-Modal, der die Balance auf 10.000 zurücksetzt
- Wallet-Modal zeigt:
  - Aktuelle Balance
  - Letzte 10 Transaktionen
  - "Reload Coins"-Button
- Jede Spielaktion (Bet, Win, Loss) muss durch den Wallet-Store laufen

---

## SPIEL 1: Sizzling Fruits (Slot im Stil klassischer Fruit-Slots)

### Mechanik
- 5 Walzen × 3 Reihen
- 5 fixe Gewinnlinien (klassisches 5-Linien-Layout)
- Symbole: Kirsche, Zitrone, Orange, Pflaume, Wassermelone, Trauben, Stern (Scatter), 7 (Top Symbol)
- Gewinne nur von links nach rechts, mind. 3 gleiche Symbole in einer Linie
- Stern (Scatter) zahlt überall, mind. 3 davon irgendwo auf den Walzen
- Auszahlungstabelle (Multiplikator pro Linieneinsatz):
  - 7: 5x = 1000, 4x = 200, 3x = 50
  - Wassermelone/Trauben: 5x = 200, 4x = 50, 3x = 20
  - Orange/Pflaume/Zitrone: 5x = 100, 4x = 30, 3x = 10
  - Kirsche: 5x = 100, 4x = 30, 3x = 10, 2x = 5
  - Stern (Scatter): 5x = 100, 4x = 20, 3x = 10 (auf Gesamteinsatz)
- RTP-Ziel: ca. 95% (durch Gewichtung der Symbole pro Walze einstellbar)

### UI
- Klassische rote/orange/gelbe Slot-Optik mit dunklem Big-Yahu-Frame außen
- Leuchtende Symbole, Glow auf Win-Linien
- Steuerung unten: Bet-Selector (1, 2, 5, 10, 25, 50, 100 pro Linie), Linienzahl fix 5, "SPIN"-Button (groß, rund, lila Glow), "AUTO PLAY" (10/25/50/100 Spins), "MAX BET"
- Anzeige: Balance, Bet, Last Win
- Spin-Animation: Reels rotieren, stoppen nacheinander mit leichtem Bounce
- Win-Animation: Gewinnlinien-Highlight, Symbol-Pulse, Coin-Sound, Counter zählt hoch
- "Gamble"-Feature optional: Roter/Schwarzer Karte raten, Verdoppeln

### Implementierung
- Erstelle eine reine TypeScript Slot-Engine (keine Bibliothek nötig)
- Klasse `SlotEngine` mit:
  - `reels: Symbol[][]` — 5 Walzen mit jeweils 30+ Positionen, gewichtet
  - `spin(): SpinResult` — gibt Walzen-Stop-Positionen + sichtbare Matrix + Wins zurück
  - `evaluate(matrix): WinLine[]` — wertet die Linien aus
- Reihenfolge der Symbole pro Walze nicht zufällig pro Spin generieren, sondern fixed Reels mit zufälligem Start-Stop (so wie echte Slots)
- Verweis: Die Mechanik ist allgemein bekannt; auf GitHub gibt es zahlreiche Open-Source-Implementierungen klassischer 5×3-Fruit-Slots als Referenz (such nach "html5 slot machine", "fruit slot javascript", "5 reel slot js"). Nutze diese als Inspiration, aber **schreibe eigenen Code** und verwende **keine markenrechtlich geschützten Grafiken**.

---

## SPIEL 2: Book of Yahu (Adventure-Slot mit Free Spins & Expanding Symbol)

### Mechanik
- 5 Walzen × 3 Reihen
- 10 Gewinnlinien (Standard 10-Liner Layout)
- Symbole: Pharao (High), Anubis (High), Skarabäus (High), A, K, Q, J, 10 (Low), Buch (Wild + Scatter)
- Buch ersetzt alle Symbole und triggert bei 3+ Scattern **10 Free Spins**
- Vor den Free Spins wird **ein zufälliges Symbol als "Expanding Symbol" ausgewählt** — landet es während Free Spins auf einer Walze, expandiert es über die gesamte Walze und zahlt auf allen Linien
- Free Spins können retriggert werden (3+ Bücher währenddessen = +10 Free Spins)
- Auszahlungstabelle (Multiplikator pro Linieneinsatz):
  - Pharao: 5x = 5000, 4x = 500, 3x = 150, 2x = 10
  - Anubis: 5x = 2000, 4x = 200, 3x = 40
  - Skarabäus: 5x = 750, 4x = 75, 3x = 25
  - A, K: 5x = 150, 4x = 50, 3x = 15
  - Q, J: 5x = 125, 4x = 40, 3x = 10
  - 10: 5x = 100, 4x = 25, 3x = 5
  - Buch (Scatter): 5x = 200x Gesamteinsatz, 4x = 20x, 3x = 2x

### UI
- Ägyptisches Setting: dunkler Stein-/Sand-Hintergrund mit Hieroglyphen-Texturen, goldene Ornamente, Frame mit Anubis-Statuen seitlich
- Symbole in goldenen Rahmen
- Free-Spins-Modus mit dunklerem Hintergrund, Pyramiden-Silhouette, special Music
- Animation für Buch-Scatter: leuchtend, mit Funken
- Expanding-Symbol-Animation: Symbol wächst von einer Reihe auf die ganze Walze, mit Goldglühen

### Implementierung
- Gleiche Engine-Struktur wie Sizzling Fruits, plus:
  - `freeSpinsState`: Anzahl verbleibender Free Spins, gewähltes Expanding Symbol
  - In Free Spins: andere Reels (mehr Wilds), Expanding-Symbol-Logik
- Wieder gilt: Mechanik ist Standard, viele Open-Source-Klone verfügbar als Referenz

---

## SPIEL 3: Blackjack (Standard-Regeln, im Rainbet-Stil)

### Regeln
- Single Deck oder 6-Deck-Shoe (konfigurierbar, default 6-Deck)
- Dealer steht auf Soft 17 (S17)
- Blackjack zahlt 3:2
- Splits erlaubt (gleiche Werte, einmal pro Hand, Asse nur ein Karte zusätzlich)
- Double Down auf jede Anfangshand erlaubt
- Insurance bei Dealer-Ass (zahlt 2:1)
- Surrender: nicht enthalten (Standard)

### UI / Rainbet-Style Tisch
- Dunkler grüner Filz-Tisch (`#0E2A1B`) mit Big-Yahu-Logo in der Mitte (transparent, dezent)
- Tisch im Halbkreis, oben Dealer, unten Player
- Klare Bet-Spots (Kreise mit Glow auf Hover)
- Karten als hochwertige SVGs (eigene SVG-Card-Components mit klassischen Suit-Symbolen, sauberes minimal-Design, abgerundete Ecken, leichter Schatten)
- Card-Deal-Animation: Karten fliegen vom Deck (oben rechts) zum Spot, mit leichter Rotation
- Card-Flip-Animation für Dealer-Hole-Card (3D-Flip via CSS transform + Framer Motion)
- Chip-Stacks im Bet-Spot, animiert wenn man setzt
- Action-Buttons unten in einer leuchtenden Bar:
  - HIT, STAND, DOUBLE, SPLIT (disabled wenn nicht möglich)
  - Hover mit Glow, disabled-State mit reduzierter Opacity
- Bet-Chip-Auswahl: 1, 5, 25, 100, 500, 1000 (verschiedenfarbige Chips, klickbar)
- "DEAL"-Button erscheint nach Bet-Platzierung
- "REBET" / "REBET x2" / "CLEAR" Optionen nach Hand-Ende
- Game-Status oben mittig: "Place your bet", "Your turn", "Dealer's turn", "You win!", "Bust!", etc.
- Side Panel rechts mit Game-History (letzte 10 Hände) und Total Won/Lost dieser Session

### Implementierung
- Klasse `BlackjackEngine` mit:
  - `deck`, `playerHands` (Array für Splits), `dealerHand`, `state`
  - Methoden: `deal()`, `hit(handIndex)`, `stand(handIndex)`, `double(handIndex)`, `split(handIndex)`, `dealerPlay()`, `settle()`
- Korrekte Soft-Hand-Bewertung (Asse als 1 oder 11)
- Reine TypeScript-Logik, getrennt von der UI

---

## SPIEL 4: European Roulette (Single Zero, im Rainbet-Stil)

### Regeln
- Europäisches Roulette mit Zahlen 0–36 (Single Zero)
- Standard-Wetten:
  - **Inside Bets:** Straight Up (1 Zahl, 35:1), Split (2 Zahlen, 17:1), Street (3 Zahlen, 11:1), Corner (4 Zahlen, 8:1), Line (6 Zahlen, 5:1)
  - **Outside Bets:** Red/Black (1:1), Even/Odd (1:1), Low (1-18) / High (19-36) (1:1), Dozens (1st 12, 2nd 12, 3rd 12, 2:1), Columns (2:1)
- Mehrere Wetten pro Spin gleichzeitig möglich

### UI / Rainbet-Style
- 3D-anmutendes Rad oben/links mit Zahlen, abwechselnd rot/schwarz, 0 in grün
- Spin-Animation: Rad dreht sich mehrere Sekunden, Kugel rollt entgegengesetzt, kommt langsam zur Ruhe in einem Slot
- Sound: Klackern der Kugel, Crescendo, Stop-Sound
- Klassisches Wett-Layout-Tableau rechts/unten mit allen Bet-Spots
- Hover über Bet-Spot zeigt Tooltip mit Auszahlungsquote
- Chip-Stack-Anzeige direkt auf den platzierten Wetten
- Chip-Selector: 1, 5, 25, 100, 500
- Buttons: SPIN, CLEAR ALL, UNDO LAST BET, REBET
- Side-Panel: History der letzten 20 Zahlen mit Farb-Coding (Rot, Schwarz, Grün)
- "Hot Numbers" / "Cold Numbers" Anzeige basierend auf den letzten 50 Spins
- Statistiken: Anteil Rot/Schwarz, Even/Odd, Low/High in % über letzte 100 Spins

### Implementierung
- Klasse `RouletteEngine`:
  - `placeBet(type, numbers, amount)`
  - `spin(): { number, color, wins }`
  - `evaluate()`: prüft alle platzierten Wetten gegen die Gewinnzahl
- Visualisiertes Rad: SVG oder Canvas, Rotation per Framer Motion oder CSS, mit präziser Endposition basierend auf Gewinnzahl
- Realistische Kugel-Physik nicht erforderlich, aber visuell glaubwürdig (Easing-Funktion)

---

## Globale Anforderungen

### Sound-Design
- Background-Music (loop, dezent, an/aus-toggelbar in Settings)
- Spiel-spezifische Sounds:
  - Slots: Reel-Spin, Reel-Stop, Win-Sound (klein/mittel/groß je nach Gewinnhöhe), Free-Spins-Trigger Fanfare
  - Blackjack: Card-Deal, Card-Flip, Chip-Place, Win-Cheer, Lose-Sound
  - Roulette: Wheel-Spin, Ball-Rolling, Ball-Drop, Win-Sound
- Master-Volume und Mute in den Settings persistiert in localStorage

### Animationen (Framer Motion)
- Sanfte Page-Transitions zwischen Routes
- Modal-Animations (Scale + Fade)
- Win-Celebrations mit Coin-Confetti (z. B. canvas-confetti) bei großen Wins (>10x Bet)
- Number-Counter-Animation für Wallet-Updates

### Responsive Design
- Mobile-first denken, aber Tablet/Desktop ist Hauptzielgruppe
- Auf Mobile: Sidebar wird zu Bottom-Nav, Game-Cards in 2-Spalten-Grid
- Roulette-Tableau auf Mobile horizontal scrollbar
- Slots auf Mobile vollformatig, Steuerung darunter

### Accessibility
- Korrekte ARIA-Labels auf allen interaktiven Elementen
- Keyboard-Navigation (Spin via Spacebar in Slots, etc.)
- Sound-Toggle prominent platziert
- Disclaimer-Banner: "This is a demo. No real money is used."

### Code-Qualität
- Strict TypeScript (`strict: true`, `noImplicitAny: true`)
- Klare Trennung: `/components`, `/games/{slot,blackjack,roulette}/{engine,ui}`, `/store`, `/lib`, `/hooks`, `/pages`
- Engines sind reine TypeScript-Klassen ohne React-Abhängigkeiten — voll unit-testbar
- Mindestens grundlegende Vitest-Tests für jede Game-Engine (z. B. Blackjack-Hand-Bewertung, Roulette-Auszahlungen, Slot-Win-Evaluation)
- ESLint + Prettier konfigurieren
- README.md mit Setup-Anleitung, Tech-Stack, Architektur-Übersicht und einem deutlichen Disclaimer

---

## Lieferung & Schritte

Bitte gehe folgendermaßen vor:

1. **Initialisierung:** Vite + React + TS Projekt aufsetzen, Tailwind + shadcn/ui konfigurieren, Routing einrichten.
2. **Layout:** Navbar, Sidebar, Footer + globales Theme implementieren.
3. **Lobby:** Home-Page mit Hero, Wins-Ticker, Game-Rows.
4. **Wallet-Store:** Zustand Store für Coins, persistiert in localStorage.
5. **Slot 1 (Sizzling Fruits):** Engine zuerst, dann UI, dann Animationen.
6. **Slot 2 (Book of Yahu):** Engine erweitern um Free-Spins + Expanding Symbol.
7. **Blackjack:** Engine + Tisch-UI + Card-Animations.
8. **Roulette:** Engine + Wheel + Tableau.
9. **Sound-Integration:** Howler einbinden, Sound-Manager-Hook.
10. **Polish:** Animationen verfeinern, Confetti, Win-Celebrations, Mobile-Layout testen.
11. **Tests:** Vitest-Tests für die drei Engines.
12. **README + Disclaimer.**

Arbeite Schritt für Schritt, committe nach jeder logischen Einheit, und stelle sicher, dass die Demo nach jedem Schritt lauffähig bleibt (`npm run dev`).

---

## Wichtige rechtliche & ethische Hinweise

- Verwende **keine** markenrechtlich geschützten Grafiken, Logos oder Namen (kein "Sizzling Hot", "Book of Ra", "Novomatic", "Greentube", "Rainbet"-Logo etc.)
- Erstelle **eigene** Symbole, Coverbilder, Provider-Namen
- Disclaimer "Demo / No Real Money" muss prominent platziert sein (Footer + erstmaliger Visit-Modal)
- Keine Funktion zur Einzahlung von echtem Geld, keine Krypto-Wallet-Anbindung, keine Auszahlung — alles ist reine Spielgeld-Simulation
- Füge einen "Responsible Gaming"-Footer-Link mit Hinweisen auf Hilfsangebote (z. B. BZgA, GamCare) auf einer statischen Seite hinzu

---

**Ziel:** Eine optisch beeindruckende, voll funktionsfähige Demo-Casino-Plattform mit hochwertigem UX, sauberem Code und drei spielmechanisch korrekten Casino-Spielen — als reines Showcase- / Lernprojekt ohne echtes Glücksspiel.
