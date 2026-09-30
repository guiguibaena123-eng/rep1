import { APP_NAME } from '../app';

import type { LegalDocs } from './types';

export const de: LegalDocs = {
  privacy: [
    {
      title: 'Welche Daten wir erheben',
      body: `E-Mail und Passwort (für dein Konto), Name oder Spitzname, Alter, Ziel, Interessengebiet und wie du dich bei Vorstellungsgesprächen fühlst. Wenn du Mein Profil ausfüllst, speichern wir auch, was du dort einträgst: Foto und Titelbild, Überschrift, Stadt, Bio, Kompetenzen, Erfahrungen, Ausbildung, Kurse, Sprachen, Verfügbarkeit und Links (LinkedIn, Portfolio, Instagram). Außerdem speichern wir deine Antworten aus den Übungen, den LinkedIn-Text oder das PDF, das du sendest, die erstellten Berichte, die Tipps, die du gelesen oder gespeichert hast, die Tage, an denen du geübt hast, und die gewählte Sprache. Wenn du Entdecken nutzt, speichern wir, wem du folgst, wen du blockiert hast und welche Meldungen du sendest. Wir fragen nicht nach Ausweisnummer, Telefonnummer oder Adresse.`,
    },
    {
      title: 'Wofür wir sie nutzen',
      body: `Nur, damit ${APP_NAME} funktioniert: Fragen erstellen, Feedback geben, Berichte erstellen, deinen Fortschritt zeigen und Tipps für dich auswählen. Dein Profil ist nur für dich sichtbar, außer du schaltest „In Entdecken anzeigen“ ein (siehe unten). Wir verkaufen deine Daten nicht und zeigen keine Werbung.`,
    },
    {
      title: 'Nutzungsstatistiken',
      body: `Um die App zu verbessern, speichern wir einfache Aktionen wie „hat eine Übung beendet“ oder „hat die Premium-Seite geöffnet“, mit Datum und Uhrzeit. Diese Statistiken enthalten nie, was du geschrieben hast. Wir nutzen keine Analyse- oder Werbetools anderer Firmen.`,
    },
    {
      title: 'Einsatz von künstlicher Intelligenz',
      body: `Um Fragen, Feedback, Berichte und Bio-Vorschläge zu erstellen, wird der für jede Anfrage nötige Text an einen KI-Dienst eines Drittanbieters gesendet. Deine E-Mail und dein Passwort senden wir nie. Dein Name wird nur gesendet, wenn du einen Bio-Vorschlag anforderst (oder wenn er in einem Text oder PDF steht, das du selbst sendest).`,
    },
    {
      title: 'Erinnerungen',
      body: `Wenn du die tägliche Erinnerung einschaltest, wird sie auf deinem eigenen Handy geplant. Du kannst sie jederzeit in den Einstellungen der App oder des Handys ausschalten.`,
    },
    {
      title: 'Entdecken: was andere sehen',
      body: `Die Option „In Entdecken anzeigen“ (Mein Profil › Bearbeiten › Datenschutz) ist anfangs ausgeschaltet. Wenn du sie einschaltest, können Personen mit einem ${APP_NAME}-Konto dein Profil finden und sehen: Foto und Titelbild, Name, Kurzbeschreibung, Stadt, Bio, Kompetenzen, Ziel, Bereich, Verfügbarkeit, Arbeitsform, Erfahrung, Ausbildung und Kurse, wie viele Follower du hast, wie vielen Personen du folgst und deine Erfolge (erste Übung, Serie von Tagen, LinkedIn analysiert). Deine E-Mail, dein Alter, dein Tarif, deine Übungsnoten oder Antworten, deine Sprachen und deine Links werden nie angezeigt. Wenn du die Option ausschaltest, verschwindet dein Profil sofort aus Entdecken. Wenn du jemanden blockierst, seht ihr das Profil des anderen nicht mehr, und die Person wird nicht benachrichtigt. Meldungen sind für die gemeldete Person anonym: Wir speichern, wer gemeldet hat, den Grund, den Text und eine Kopie des gemeldeten Profils, nur für die Moderation.`,
    },
    {
      title: 'Bezahlung von Premium',
      body: `Das Abo wird auf der Bezahlseite von Stripe (einem Zahlungsdienstleister) abgeschlossen, der deine Karte jeden Monat belastet. Dafür erhält Stripe deine E-Mail und deine Kartendaten und kann sie außerhalb Brasiliens verarbeiten. Die Kartendaten bleiben nur bei Stripe: ${APP_NAME} sieht und speichert keine Karten- oder Bankdaten. Wir speichern nur Betrag, Datum, Zahlungsart (z. B. „Kreditkarte“) und Status jeder Zahlung und des Abos, um dein Premium freizuschalten und nachzuweisen.`,
    },
    {
      title: 'Wie lange wir sie speichern',
      body: `Deine Daten bleiben gespeichert, solange dein Konto besteht. Das LinkedIn-PDF wird direkt nach dem Erstellen des Berichts gelöscht. Wenn du dein Konto löschst, wird alles gelöscht, auch die Fotos und die Nutzungsstatistiken.`,
    },
    {
      title: 'Deine Rechte',
      body: `Du kannst deine Daten jederzeit ansehen und korrigieren, eine Kopie herunterladen (Einstellungen › Meine Daten exportieren) und dein Konto löschen (Einstellungen › Mein Konto löschen). Das garantieren das brasilianische Datenschutzgesetz (LGPD), da ${APP_NAME} von Brasilien aus betrieben wird, und das Datenschutzrecht deines Wohnorts (zum Beispiel die DSGVO in der Europäischen Union). Wenn du Hilfe brauchst, schreib uns über den Kontakt unten.`,
    },
    {
      title: 'Kontakt',
      body: `Nutze „Hilfe und Kontakt“ in den Einstellungen.`,
    },
  ],
  terms: [
    {
      title: 'Was die App ist',
      body: `${APP_NAME} ist ein Übungs- und Orientierungswerkzeug für Vorstellungsgespräche und dein berufliches Profil. Es garantiert keine Einstellung und ersetzt keine professionelle Unterstützung.`,
    },
    {
      title: 'Wer sie nutzen darf',
      body: `Personen ab 16 Jahren.`,
    },
    {
      title: 'Dein Konto',
      body: `Du bist dafür verantwortlich, dein Passwort geheim zu halten. Verwende beim Üben wahre Angaben über dich.`,
    },
    {
      title: 'KI-generierte Inhalte',
      body: `Feedback und Vorschläge werden automatisch erstellt und können Fehler enthalten. Verlass dich auf dein eigenes Urteil, bevor du einen Vorschlag übernimmst.`,
    },
    {
      title: 'Tarife',
      body: `Der kostenlose Tarif hat Nutzungsgrenzen. Premium ist ein monatliches Abo über Stripe, das sich automatisch verlängert: Der Betrag wird jeden Monat von deiner Karte abgebucht, bis du kündigst. Der Preis ist in brasilianischen Real (R$) festgelegt. Die Bezahlseite von Stripe kann ihn in deiner Währung anzeigen: Stripe rechnet ihn um, eine Umrechnungsgebühr von etwa 2–4 % ist bereits enthalten, und der Betrag in deiner Währung kann sich jeden Monat mit dem Wechselkurs leicht ändern. Du kannst auch in Real bezahlen; dann rechnet deine Bank den Betrag um und kann Gebühren verlangen. Premium wird freigeschaltet, sobald die Zahlung bestätigt ist. Du kannst jederzeit auf der Profil-Seite kündigen („Abo kündigen“): Es gibt keine neuen Abbuchungen, und Premium bleibt bis zum Ende des bereits bezahlten Monats aktiv.`,
    },
    {
      title: 'Widerruf und Erstattung',
      body: `Nach dem brasilianischen Verbraucherschutzgesetz kannst du das Premium-Abo innerhalb von 7 Tagen nach der ersten Zahlung widerrufen und bekommst dein Geld zurück. Wenn das Recht deines Wohnorts eine längere Frist vorsieht, gilt die längere Frist. Kündige dazu das Abo im Profil und schreib uns über „Hilfe und Kontakt“. Die Erstattung erfolgt über Stripe auf dieselbe Karte. Auch wenn du widerrufst, kündigst oder eine Erstattung verlangst, bleibt dein Premium bis zum Ende des Monats dieser Zahlung aktiv.`,
    },
    {
      title: 'Faire Nutzung',
      body: `Damit die App für alle funktioniert, gibt es technische Nutzungsgrenzen, auch bei Premium. Es ist nicht erlaubt, diese Grenzen zu umgehen oder die App für beleidigende oder illegale Inhalte zu nutzen. Sei in Entdecken respektvoll: Falsche Profile, Belästigung, Beleidigungen, Betrug und falsche Jobangebote sind nicht erlaubt. Gemeldete Profile werden geprüft und können entfernt werden.`,
    },
    {
      title: 'Änderungen',
      body: `Diese Bedingungen können sich ändern. Wenn das passiert, informieren wir dich in der App.`,
    },
  ],
};
