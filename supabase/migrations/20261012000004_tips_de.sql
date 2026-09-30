-- Dicas em alemão (de). Mesmos slugs das dicas gerais em português, com fontes da Alemanha.
-- Dicas só do Brasil NÃO entram aqui. No lugar delas: ausbildung-wie-sie-funktioniert e praktikum-und-mindestlohn.
-- Plano grátis: 7 de 21 (33%). Fontes conferidas em 30/09/2026.

insert into public.tracks (language, slug, title, description, sort_order) values
  ('de', 'entrevista-sem-medo', 'Vorstellungsgespräch ohne Angst', 'Von der Nervosität bis zur letzten Frage, Schritt für Schritt.', 1),
  ('de', 'curriculo-do-zero', 'Lebenslauf von null', 'Lebenslauf und LinkedIn-Profil, auch ohne Erfahrung.', 2),
  ('de', 'primeiro-emprego', 'Erster Job', 'Was du wissen solltest, bevor du anfängst zu arbeiten.', 3);

insert into public.tips (language, slug, title, category, read_minutes, is_premium, track_id, track_order, goals, areas, for_nervous, body) values

-- ===== Trilha: Vorstellungsgespräch ohne Angst =====
(
  'de', 'nervosismo-antes-da-entrevista',
  'Nervös? So bereitest du dich auf den Tag vor',
  'entrevista', 3, false,
  (select id from public.tracks where language = 'de' and slug = 'entrevista-sem-medo'), 1,
  '{}', '{}', true,
  $j$[
    {"type":"p","text":"Vor einem Vorstellungsgespräch nervös zu sein, ist normal. Es geht nicht darum, die Nervosität loszuwerden, sondern gut vorbereitet anzukommen. Denk daran: Du wurdest eingeladen, weil der Betrieb dich kennenlernen will."},
    {"type":"h","text":"Am Tag davor"},
    {"type":"list","items":["Lies die Stellenanzeige noch einmal und informiere dich über das Unternehmen.","Übe das Gespräch mit Freunden oder der Familie (oder hier in der App). Übe auch, deinen Lebenslauf frei zu erzählen.","Leg deine Kleidung bereit, prüfe Adresse oder Link und schlaf genug."]},
    {"type":"h","text":"Am Tag selbst"},
    {"type":"list","items":["Plane genug Zeit ein, damit du pünktlich bist. Bei Online-Gesprächen: Kamera und Ton vorher testen.","Atme ruhig und sprich ohne Eile, mit kleinen Pausen.","Wenn du einen Blackout hast, sag: „Da muss ich kurz überlegen.“ Das ist völlig in Ordnung."]},
    {"type":"example","title":"Beispiel","text":"„Entschuldigung, ich bin etwas nervös. Darf ich noch einmal anfangen?“ Das verstehen alle. Ehrlichkeit wirkt sympathisch."},
    {"type":"p","text":"Wenn Angst deinen Alltag stark belastet, sprich mit einer Ärztin, einem Arzt oder einer Beratungsstelle."},
    {"type":"sources","items":[
      {"title":"planet-beruf.de (Bundesagentur für Arbeit): Das Vorstellungsgespräch","url":"https://planet-beruf.de/schuelerinnen/wie-bewerbe-ich-mich/vorstellungsgespraech"}
    ]}
  ]$j$::jsonb
),
(
  'de', 'como-responder-fale-sobre-voce',
  'Wie du auf „Erzählen Sie etwas über sich“ antwortest',
  'entrevista', 2, false,
  (select id from public.tracks where language = 'de' and slug = 'entrevista-sem-medo'), 2,
  '{}', '{}', true,
  $j$[
    {"type":"p","text":"Das ist fast immer die erste Frage. Man will wissen, wer du bist und warum du zur Stelle passt."},
    {"type":"p","text":"Du musst nicht dein ganzes Leben erzählen. Eine Minute reicht."},
    {"type":"h","text":"Nimm diese Reihenfolge"},
    {"type":"list","ordered":true,"items":["**Wer du bist:** Name und was du gerade machst oder lernst.","**Ein Beispiel:** etwas, das du gemacht hast und das zur Stelle passt.","**Was du suchst:** warum du diese Stelle willst."]},
    {"type":"example","title":"Beispiel","text":"„Ich heiße Lena, bin 17 und mache im Sommer meinen Realschulabschluss. Beim Tag der offenen Tür habe ich die Besucher empfangen und beraten, das hat mir viel Spaß gemacht. Deshalb möchte ich eine Ausbildung im Kundenservice machen.“"},
    {"type":"warning","text":"Lies nicht deinen Lebenslauf Punkt für Punkt vor. Den kennen sie schon. Erzähl, was nicht auf dem Papier steht."},
    {"type":"p","text":"Übe zwei- oder dreimal laut. Dann klingt es im Gespräch natürlicher."},
    {"type":"sources","items":[
      {"title":"planet-beruf.de (Bundesagentur für Arbeit): Welche Fragen erwarten dich im Vorstellungsgespräch?","url":"https://planet-beruf.de/schuelerinnen/wie-bewerbe-ich-mich/vorstellungsgespraech/gespraechsverlauf/bewerben-vorstellungsgespraech-vorbereiten"}
    ]}
  ]$j$::jsonb
),
(
  'de', 'conte-uma-historia',
  'Erzähl eine Geschichte: die STAR-Methode',
  'entrevista', 3, false,
  (select id from public.tracks where language = 'de' and slug = 'entrevista-sem-medo'), 3,
  '{primeiro_emprego}', '{}', false,
  $j$[
    {"type":"p","text":"Fragen wie „Erzählen Sie von einer Situation, in der Sie ein Problem gelöst haben“ verlangen eine echte Geschichte. Eine einfache Struktur dafür ist die STAR-Methode, die Karriereberatungen von Hochschulen empfehlen."},
    {"type":"list","ordered":true,"items":["**Situation:** Wo warst du, was war los? Ohne zu viele Details.","**Aufgabe:** Was war deine Rolle oder dein Ziel?","**Aktion:** Was hast DU gemacht? Das ist der größte Teil der Antwort: Sag „ich“, nicht „wir“.","**Resultat:** Was hat sich verändert, was hast du gelernt? Nenn wenn möglich eine Zahl."]},
    {"type":"example","title":"Beispiel","text":"„Bei einem Gruppenreferat haben zwei Leute nicht mehr geantwortet (Situation), und ich war für die Abgabe verantwortlich (Aufgabe). Ich habe die Aufgaben neu verteilt und einen Chat mit Fristen erstellt (Aktion). Wir haben pünktlich abgegeben und eine 2 bekommen (Resultat).“"},
    {"type":"p","text":"Noch keine Berufserfahrung? Beispiele aus Schule, Projekten, Sportverein oder Ehrenamt zählen genauso."},
    {"type":"warning","text":"Erfinde keine Geschichten. Oft wird nach Details gefragt, und die Antwort passt dann nicht zu deinem Lebenslauf."},
    {"type":"sources","items":[
      {"title":"MIT Career Advising: Using the STAR method (auf Englisch)","url":"https://capd.mit.edu/resources/the-star-method-for-behavioral-interviews/"}
    ]}
  ]$j$::jsonb
),
(
  'de', 'pontos-fortes-e-fracos',
  'Stärken und Schwächen ohne Floskeln',
  'entrevista', 3, true,
  (select id from public.tracks where language = 'de' and slug = 'entrevista-sem-medo'), 4,
  '{novo_emprego}', '{}', false,
  $j$[
    {"type":"p","text":"„Was ist Ihre größte Schwäche?“ klingt unangenehm, ist aber eine Chance zu zeigen, dass du dich kennst und an dir arbeitest."},
    {"type":"h","text":"Stärke"},
    {"type":"p","text":"Wähl eine, die zur Stelle passt, und belege sie mit einem kurzen Beispiel. „Ich bin organisiert“ wirkt stärker mit „Ich habe den Putzplan für meine Klasse gemacht“."},
    {"type":"h","text":"Schwäche"},
    {"type":"list","ordered":true,"items":["Nenn eine echte Schwäche, die für die Stelle nicht entscheidend ist.","Erzähl, was du schon tust, um besser zu werden.","Zeig am Ende deinen Fortschritt."]},
    {"type":"example","title":"Beispiel","text":"„Früher war ich beim Reden vor Gruppen sehr unsicher. Ich habe mich dann freiwillig für Referate gemeldet, und heute fällt es mir viel leichter.“"},
    {"type":"warning","text":"Vermeide „Ich bin Perfektionist“ oder „Ich arbeite zu viel“. Das hören Personaler ständig und denken vielleicht, du weichst aus."},
    {"type":"sources","items":[
      {"title":"planet-beruf.de (Bundesagentur für Arbeit): Welche Fragen erwarten dich im Vorstellungsgespräch?","url":"https://planet-beruf.de/schuelerinnen/wie-bewerbe-ich-mich/vorstellungsgespraech/gespraechsverlauf/bewerben-vorstellungsgespraech-vorbereiten"}
    ]}
  ]$j$::jsonb
),
(
  'de', 'perguntas-para-fazer-no-fim',
  'Fragen, die du am Ende stellen kannst',
  'entrevista', 2, true,
  (select id from public.tracks where language = 'de' and slug = 'entrevista-sem-medo'), 5,
  '{novo_emprego}', '{}', false,
  $j$[
    {"type":"p","text":"Am Ende heißt es fast immer: „Haben Sie noch Fragen?“ Mit „Nein“ verpasst du die Chance, Interesse zu zeigen."},
    {"type":"h","text":"Gute Fragen"},
    {"type":"list","items":["Wie sieht ein typischer Arbeitstag aus?","Was sollte die neue Person als Erstes lernen?","Wie werden Neue eingearbeitet?","Wie geht es im Bewerbungsprozess weiter?"]},
    {"type":"example","title":"Tipp","text":"Nimm 2 Fragen notiert mit. Wenn eine im Gespräch schon beantwortet wurde, stell die andere."},
    {"type":"warning","text":"Fragen zu Gehalt und Zusatzleistungen stellst du am besten, wenn das Unternehmen das Thema anspricht, oder in der letzten Runde, falls niemand darüber gesprochen hat."},
    {"type":"sources","items":[
      {"title":"planet-beruf.de (Bundesagentur für Arbeit): Das Vorstellungsgespräch","url":"https://planet-beruf.de/schuelerinnen/wie-bewerbe-ich-mich/vorstellungsgespraech"},
      {"title":"MIT Career Advising: Questions to ask an interviewer (auf Englisch)","url":"https://capd.mit.edu/resources/questions-to-ask-interviewer/"}
    ]}
  ]$j$::jsonb
),

-- ===== Trilha: Lebenslauf von null =====
(
  'de', 'curriculo-sem-experiencia',
  'Lebenslauf ohne Erfahrung: Was gehört rein?',
  'curriculo', 3, false,
  (select id from public.tracks where language = 'de' and slug = 'curriculo-do-zero'), 1,
  '{jovem_aprendiz,estagio,primeiro_emprego}', '{}', false,
  $j$[
    {"type":"p","text":"Alle fangen ohne Erfahrung an. Der Lebenslauf für den ersten Job zeigt, was du schon kannst und dass du lernen willst."},
    {"type":"h","text":"Was reingehört"},
    {"type":"list","items":["**Persönliche Daten:** Name, Adresse, Telefon, E-Mail.","**Schulbildung:** aktuelle Schule, Abschlüsse, Lieblingsfächer.","**Praktika und Nebenjobs:** auch ein Schülerpraktikum zählt.","**Kenntnisse:** Sprachen und Computer (mit deinem echten Niveau).","**Hobbys und Ehrenamt:** wenn sie zur Stelle passen oder etwas über dich aussagen."]},
    {"type":"example","title":"Beispiel","text":"„Ehrenamtliche Helferin bei der Lebensmittelsammlung der Schule (2025): Spenden sortiert und Familien betreut.“"},
    {"type":"warning","text":"Übertreib nicht bei Englisch- oder Computerkenntnissen. Manche Betriebe testen das direkt."},
    {"type":"sources","items":[
      {"title":"planet-beruf.de (Bundesagentur für Arbeit): Den perfekten Lebenslauf erstellen","url":"https://planet-beruf.de/schuelerinnen/wie-bewerbe-ich-mich/bewerbung/lebenslauf-und-deckblatt"}
    ]}
  ]$j$::jsonb
),
(
  'de', 'curriculo-de-uma-pagina',
  'Der tabellarische Lebenslauf: kurz und klar',
  'curriculo', 3, true,
  (select id from public.tracks where language = 'de' and slug = 'curriculo-do-zero'), 2,
  '{}', '{}', false,
  $j$[
    {"type":"p","text":"Personaler schauen oft nur kurz auf einen Lebenslauf. In Deutschland ist er tabellarisch und höchstens zwei Seiten lang. Am Anfang reicht oft eine Seite."},
    {"type":"h","text":"In dieser Reihenfolge"},
    {"type":"list","ordered":true,"items":["**Persönliche Daten:** Name, Adresse, Telefon und E-Mail.","**Schulbildung und Kurse:** das Neueste steht oben.","**Praktika, Nebenjobs, Ehrenamt:** ebenfalls das Neueste oben.","**Kenntnisse:** Sprachen, Computer.","**Hobbys,** wenn sie etwas über dich aussagen."]},
    {"type":"warning","text":"Nimm eine seriöse E-Mail-Adresse mit deinem Namen. Spitznamen oder Witze wirken unprofessionell. Und bleib bei Lücken im Lebenslauf immer bei der Wahrheit."},
    {"type":"p","text":"Ein Bewerbungsfoto ist freiwillig. Speichere den Lebenslauf als PDF, damit das Layout beim Empfänger gleich bleibt."},
    {"type":"sources","items":[
      {"title":"planet-beruf.de (Bundesagentur für Arbeit): Den perfekten Lebenslauf erstellen","url":"https://planet-beruf.de/schuelerinnen/wie-bewerbe-ich-mich/bewerbung/lebenslauf-und-deckblatt"}
    ]}
  ]$j$::jsonb
),
(
  'de', 'titulo-do-linkedin',
  'Ein LinkedIn-Slogan, mit dem man dich findet',
  'linkedin', 2, false,
  (select id from public.tracks where language = 'de' and slug = 'curriculo-do-zero'), 3,
  '{estagio,novo_emprego}', '{}', false,
  $j$[
    {"type":"p","text":"Der Profil-Slogan steht unter deinem Namen und erscheint auch in den Suchergebnissen. Recruiter suchen nach Stichwörtern, und im Slogan zählen sie besonders."},
    {"type":"h","text":"Eine einfache Formel"},
    {"type":"p","text":"**Was du suchst + was du lernst oder kannst.**"},
    {"type":"example","title":"Beispiele","text":"„Auf der Suche nach einem Ausbildungsplatz im Kundenservice | Realschulabschluss 2026“\n„Schüler mit Interesse an Logistik | Excel und Lagerorganisation“"},
    {"type":"warning","text":"Schreib nicht nur „Schüler“ oder „Arbeitssuchend“. Sag, was du machen willst."},
    {"type":"sources","items":[
      {"title":"LinkedIn Hilfe: Ihren Profil-Slogan bearbeiten","url":"https://www.linkedin.com/help/linkedin/answer/a542926?lang=de"}
    ]}
  ]$j$::jsonb
),
(
  'de', 'foto-de-perfil-no-linkedin',
  'Profilbild bei LinkedIn: das Wichtigste',
  'linkedin', 2, true,
  (select id from public.tracks where language = 'de' and slug = 'curriculo-do-zero'), 4,
  '{}', '{}', false,
  $j$[
    {"type":"p","text":"Profile mit Foto werden meist öfter angeklickt. Du brauchst keinen Fotografen: Ein Handy reicht."},
    {"type":"list","items":["Das Gesicht gut sichtbar, Blick in die Kamera.","Licht von vorne (am Fenster klappt das gut).","Ein ruhiger, aufgeräumter Hintergrund.","Kleidung, wie du sie im Job tragen würdest."]},
    {"type":"warning","text":"Vermeide Partyfotos, abgeschnittene andere Personen, Sonnenbrillen und Filter."},
    {"type":"sources","items":[
      {"title":"LinkedIn Talent Blog: 10 tips for a professional profile photo (auf Englisch)","url":"https://www.linkedin.com/business/talent/blog/product-tips/tips-for-taking-professional-linkedin-profile-pictures"}
    ]}
  ]$j$::jsonb
),

-- ===== Trilha: Erster Job =====
(
  'de', 'sem-experiencia-comece-por-aqui',
  'Keine Erfahrung? Fang hier an',
  'primeiro_emprego', 4, false,
  (select id from public.tracks where language = 'de' and slug = 'primeiro-emprego'), 1,
  '{jovem_aprendiz,estagio,primeiro_emprego}', '{}', false,
  $j$[
    {"type":"p","text":"Den ersten Job zu suchen, kann schwierig wirken. Du kannst die Suche aber in kleine Schritte aufteilen."},
    {"type":"list","ordered":true,"items":["**Wähl 1 oder 2 Bereiche** (zum Beispiel Kundenservice und Einzelhandel).","**Schreib deinen Lebenslauf** und leg ein LinkedIn-Profil an.","**Such Stellen** in der Jobbörse der Arbeitsagentur, bei LinkedIn, bei Ausbildungs- und Praktikumsangeboten und bei Betrieben in deiner Nähe.","**Übe Vorstellungsgespräche,** bevor du eingeladen wirst.","**Notier dir,** wo du dich beworben hast, um nachzufassen."]},
    {"type":"example","title":"Tipp","text":"Wenige, sorgfältige Bewerbungen bringen meist mehr als hundertmal derselbe Lebenslauf."},
    {"type":"warning","text":"Seriöse Firmen verlangen vor dem Arbeitsvertrag kein Video-Ident und keine Kontoeröffnung. Schick keine Ausweiskopien oder Kontodaten per Chat oder E-Mail. So funktioniert Job-Scamming (Warnung der Verbraucherzentrale)."},
    {"type":"sources","items":[
      {"title":"Verbraucherzentrale: Gefälschte Stellenanzeigen, was ist Job-Scamming?","url":"https://www.verbraucherzentrale.de/wissen/digitale-welt/datenschutz/gefaelschte-stellenanzeigen-was-ist-jobscamming-28475"},
      {"title":"planet-beruf.de (Bundesagentur für Arbeit): Bewerbung","url":"https://planet-beruf.de/schuelerinnen/wie-bewerbe-ich-mich"}
    ]}
  ]$j$::jsonb
),
(
  'de', 'ausbildung-wie-sie-funktioniert',
  'Die duale Ausbildung: lernen und Geld verdienen',
  'direitos', 3, true,
  (select id from public.tracks where language = 'de' and slug = 'primeiro-emprego'), 2,
  '{jovem_aprendiz}', '{}', false,
  $j$[
    {"type":"p","text":"In der dualen Ausbildung lernst du einen Beruf im Betrieb und in der Berufsschule. Du hast einen Ausbildungsvertrag und bekommst jeden Monat eine Ausbildungsvergütung."},
    {"type":"h","text":"So funktioniert es"},
    {"type":"list","items":["**Betrieb und Berufsschule:** meist 1 bis 2 Tage pro Woche Berufsschule, den Rest im Betrieb.","**Dauer:** je nach Beruf 2 bis 3,5 Jahre.","**Vergütung:** Der Betrieb zahlt. Für Ausbildungen, die 2026 beginnen, beträgt die Mindestausbildungsvergütung im 1. Jahr 724 Euro im Monat; in Tarifverträgen kann sie höher sein.","**Abschluss:** eine Prüfung, zum Beispiel bei der IHK oder der Handwerkskammer."]},
    {"type":"h","text":"Wo du suchst"},
    {"type":"p","text":"In der Jobbörse der Bundesagentur für Arbeit, auf den Seiten der Kammern und direkt bei Betrieben. Die Berufsberatung der Arbeitsagentur hilft kostenlos."},
    {"type":"warning","text":"Beträge und Regeln ändern sich jedes Jahr. Prüf die aktuellen Infos beim BIBB oder bei der Arbeitsagentur, bevor du unterschreibst."},
    {"type":"sources","items":[
      {"title":"Bundesagentur für Arbeit: Ausbildung","url":"https://www.arbeitsagentur.de/bildung/ausbildung"},
      {"title":"BIBB: Mindestausbildungsvergütung","url":"https://www.bibb.de/mindestausbildungsverguetung"}
    ]}
  ]$j$::jsonb
),
(
  'de', 'falar-de-salario',
  'Übers Gehalt sprechen, ohne Angst',
  'salario', 3, true,
  (select id from public.tracks where language = 'de' and slug = 'primeiro-emprego'), 3,
  '{primeiro_emprego,novo_emprego}', '{}', false,
  $j$[
    {"type":"p","text":"Über Geld zu reden, ist vielen unangenehm. Es gehört aber ganz normal zur Bewerbung. Mit Vorbereitung fällt es leichter."},
    {"type":"h","text":"Vor dem Gespräch"},
    {"type":"list","items":["Schau, ob die Stellenanzeige schon ein Gehalt nennt.","Informier dich, was für diesen Beruf in deinem Bundesland üblich ist. Der **Entgeltatlas** der Bundesagentur für Arbeit ist kostenlos und zeigt das mittlere Gehalt (Median) für über 4.000 Berufe.","Prüf, ob es einen Tarifvertrag gibt. Dort steht das Gehalt oft schon fest."]},
    {"type":"h","text":"Wenn man dich nach deiner Gehaltsvorstellung fragt"},
    {"type":"p","text":"Nenn eine Spanne auf Basis deiner Recherche, keine einzelne Zahl, und sag dazu, ob du brutto im Monat oder im Jahr meinst."},
    {"type":"example","title":"Beispiel","text":"„Nach meiner Recherche liegt das Gehalt für diese Stelle meist zwischen [Betrag] und [Betrag] brutto im Monat. Als Berufseinsteiger bin ich offen für ein Gespräch.“"},
    {"type":"p","text":"Frag auch nach Urlaubstagen, Fahrtkostenzuschuss oder Weiterbildungen. Das macht einen echten Unterschied."},
    {"type":"warning","text":"Gehälter hängen von Region, Branche und Zeitpunkt ab. Nutz deine Recherche als Orientierung, nicht als feste Regel."},
    {"type":"sources","items":[
      {"title":"Bundesagentur für Arbeit: Entgeltatlas","url":"https://web.arbeitsagentur.de/entgeltatlas/"},
      {"title":"George Mason University Career Services: Salary Negotiation (auf Englisch)","url":"https://careers.gmu.edu/undergraduate-students/salary-negotiation"}
    ]}
  ]$j$::jsonb
),
(
  'de', 'praktikum-und-mindestlohn',
  'Praktikum: Wann gibt es Mindestlohn?',
  'direitos', 3, true,
  (select id from public.tracks where language = 'de' and slug = 'primeiro-emprego'), 4,
  '{estagio}', '{}', false,
  $j$[
    {"type":"p","text":"Für Praktikantinnen und Praktikanten gilt grundsätzlich der gesetzliche Mindestlohn. Es gibt aber wichtige Ausnahmen."},
    {"type":"h","text":"Die Regeln laut BMAS"},
    {"type":"list","items":["**Pflichtpraktikum** (von Schul-, Ausbildungs- oder Studienordnung vorgeschrieben): kein Anspruch auf Mindestlohn.","**Freiwilliges Praktikum** zur Berufsorientierung oder begleitend zu Ausbildung oder Studium: kein Mindestlohn, solange es **höchstens drei Monate** dauert.","**Dauert es länger,** gibt es Mindestlohn ab dem ersten Tag.","**Seit dem 1. Januar 2026** beträgt der Mindestlohn 13,90 Euro brutto pro Stunde."]},
    {"type":"example","title":"Frag vor dem Start","text":"„Ist das Praktikum vergütet? Was lerne ich, und wer betreut mich?“"},
    {"type":"warning","text":"Es gibt weitere Sonderfälle. Bei Fragen hilft die Mindestlohn-Hotline des BMAS oder die Beratung deiner Schule oder Hochschule."},
    {"type":"sources","items":[
      {"title":"BMAS: Mindestlohn und Praktikum","url":"https://www.bmas.de/DE/Arbeit/Arbeitsrecht/Mindestlohn/Mindestlohn-und-Praktikum/mindestlohn-praktikum-art.html"}
    ]}
  ]$j$::jsonb
),

-- ===== Sem trilha =====
(
  'de', 'por-que-quer-mudar-de-emprego',
  'Wie du erklärst, warum du den Job wechseln willst',
  'entrevista', 2, false, null, null,
  '{novo_emprego}', '{}', false,
  $j$[
    {"type":"p","text":"Wenn du schon arbeitest, hörst du fast immer: „Warum wollen Sie Ihre jetzige Stelle verlassen?“ Man will wissen, ob du etwas suchst oder nur vor etwas wegläufst."},
    {"type":"list","ordered":true,"items":["**Sprich über die Zukunft:** was du lernen oder mehr machen willst.","**Stell den Bezug zur Stelle her:** was diese Chance dir bietet.","**Bleib ehrlich,** ohne private Details."]},
    {"type":"example","title":"Beispiel","text":"„Im Verkauf habe ich viel gelernt, aber ich möchte mich Richtung Büro weiterentwickeln. Diese Stelle verbindet beides.“"},
    {"type":"warning","text":"Sprich nicht schlecht über deinen Chef oder deine Firma, auch wenn du Gründe hast. Das wirkt meist gegen dich."},
    {"type":"sources","items":[
      {"title":"Robert Half: how to answer “what are your reasons for leaving a job?” (auf Englisch)","url":"https://www.roberthalf.com/us/en/insights/landing-job/how-to-answer-what-is-your-reason-for-leaving-a-job"}
    ]}
  ]$j$::jsonb
),
(
  'de', 'entrevista-para-atendimento',
  'Kundenservice: Zeig, dass du zuhören kannst',
  'entrevista', 2, true, null, null,
  '{}', '{atendimento}', false,
  $j$[
    {"type":"p","text":"Im Kundenservice sucht der Betrieb jemanden, der freundlich mit Menschen umgeht, auch in schwierigen Momenten. Im Gespräch ist deine Art zu reden schon ein Test."},
    {"type":"h","text":"Was meistens zählt"},
    {"type":"list","items":["**Erst zuhören, dann antworten:** die Person ausreden lassen.","**Höflichkeit:** grüßen, die Person mit Namen ansprechen, „bitte“ sagen.","**Ehrlichkeit:** Wenn du etwas nicht weißt, sag, dass du nachfragst, statt zu raten.","**Ruhe bewahren,** auch bei verärgerten Kunden."]},
    {"type":"example","title":"Häufige Frage","text":"„Wie gehen Sie mit einem verärgerten Kunden um?“ Antworte Schritt für Schritt: zuhören, sich für die Unannehmlichkeit entschuldigen, das Problem verstehen und sagen, was du tust."},
    {"type":"sources","items":[
      {"title":"BIBB: Kaufmann/Kauffrau für Dialogmarketing (Ausbildungsberuf)","url":"https://www.bibb.de/dienst/berufesuche/de/index_berufesuche.php/profile/apprenticeship/h161205"}
    ]}
  ]$j$::jsonb
),
(
  'de', 'entrevista-para-vendas',
  'Verkauf: Zuhören verkauft mehr als Reden',
  'entrevista', 2, true, null, null,
  '{}', '{vendas}', false,
  $j$[
    {"type":"p","text":"Viele denken, gute Verkäufer reden viel. In Wahrheit hilft am meisten, zu verstehen, was die Kundschaft braucht."},
    {"type":"h","text":"Zeig es im Gespräch"},
    {"type":"list","items":["**Zuhören:** erst Fragen stellen, dann etwas anbieten.","**Beratung:** dich in die Kundin oder den Kunden hineinversetzen.","**Produkte kennen:** informier dich vorher, was der Laden oder die Firma verkauft.","**Ein echtes Beispiel:** Kuchenverkauf in der Schule, Flohmarkt, Aushilfe im Familienbetrieb."]},
    {"type":"example","title":"Häufige Frage","text":"„Verkaufen Sie mir diesen Kugelschreiber.“ Statt Vorteile aufzuzählen, frag zuerst: „Wofür brauchen Sie im Alltag einen Kugelschreiber?“ Dann bietest du ihn als Lösung an."},
    {"type":"sources","items":[
      {"title":"BIBB: Kaufmann/Kauffrau im Einzelhandel (Ausbildungsberuf)","url":"https://www.bibb.de/dienst/berufesuche/de/index_berufesuche.php/profile/apprenticeship/100815"}
    ]}
  ]$j$::jsonb
),
(
  'de', 'entrevista-para-administrativo',
  'Bürojob: Organisation ist deine Visitenkarte',
  'entrevista', 2, true, null, null,
  '{}', '{administrativo}', false,
  $j$[
    {"type":"p","text":"Im Büro unterstützt du viele Bereiche: Personal, Einkauf, Buchhaltung, Kundschaft. Deshalb zählen Organisation und klare Kommunikation besonders."},
    {"type":"h","text":"Was du zeigen kannst"},
    {"type":"list","items":["**Organisation:** wie du Termine, Aufgaben oder Unterlagen im Blick behältst (Kalender, Liste, Tabelle).","**Programme:** sag ehrlich, was du in Excel, Word und E-Mail kannst.","**Sorgfalt:** ein Beispiel, bei dem du etwas geprüft und einen Fehler verhindert hast.","**Freundlichkeit** gegenüber Kollegen und Kunden."]},
    {"type":"example","title":"Beispiel","text":"„In der SV habe ich das Geld vom Schulfest in einer Tabelle verwaltet und am Ende die Abrechnung gemacht.“"},
    {"type":"warning","text":"Wenn es einen Excel-Test gibt, darfst du sagen, was du noch nicht kannst. Flunkern fällt sofort auf."},
    {"type":"sources","items":[
      {"title":"BIBB: Kaufmann/-frau für Büromanagement (Ausbildungsberuf)","url":"https://www.bibb.de/dienst/berufesuche/de/index_berufesuche.php/profile/apprenticeship/kfmfb25"}
    ]}
  ]$j$::jsonb
),
(
  'de', 'entrevista-para-tecnologia',
  'Erster Job in der IT: Zeig deine Projekte',
  'entrevista', 3, true, null, null,
  '{}', '{tecnologia}', false,
  $j$[
    {"type":"p","text":"In der IT sagen Projekte oft mehr als Zeugnisse. Auch kleine Projekte, aus Kursen oder privat, zeigen, was du kannst."},
    {"type":"h","text":"Deine Visitenkarte auf GitHub"},
    {"type":"list","ordered":true,"items":["**Schreib eine Profil-README:** wer du bist, was du lernst und welche Technologien du kennst.","**Pinne 3 bis 5 Projekte,** die am besten zur Stelle passen.","**Erklär jedes Projekt:** was es macht, wie man es startet und, wenn möglich, einen Link zum Ausprobieren."]},
    {"type":"example","title":"Im Gespräch","text":"Such dir ein Projekt aus und übe, davon zu erzählen: das Problem, was du gebaut hast, eine Schwierigkeit und wie du sie gelöst hast."},
    {"type":"warning","text":"Wenn ein Teil aus einem Tutorial stammt, sag es. Man wird dich fragen, wie der Code funktioniert."},
    {"type":"sources","items":[
      {"title":"GitHub Docs: Verwenden Ihres GitHub-Profils zum Verbessern Ihres Lebenslaufs","url":"https://docs.github.com/de/account-and-profile/tutorials/using-your-github-profile-to-enhance-your-resume"}
    ]}
  ]$j$::jsonb
),
(
  'de', 'entrevista-para-marketing',
  'Marketing: ein Portfolio, auch ohne Erfahrung',
  'entrevista', 3, true, null, null,
  '{}', '{marketing}', false,
  $j$[
    {"type":"p","text":"Im Marketing wollen Personaler sehen, was du schon gestaltet hast. Ein Portfolio kannst du schon vor dem ersten Job aufbauen."},
    {"type":"h","text":"Was reinkommt"},
    {"type":"list","items":["Arbeiten aus Schule oder Kursen.","Social-Media-Kanäle, die du betreut hast (für ein Projekt, einen Verein, den Laden von Verwandten).","Ehrenamt.","**Ergebnisse in Zahlen,** wenn du welche hast: Follower, Likes, Verkäufe."]},
    {"type":"h","text":"So ordnest du es"},
    {"type":"list","items":["Fang mit deinen 2 besten Arbeiten an.","Schreib einen kurzen Teil „Über mich“.","Mach deine Kontaktdaten leicht auffindbar."]},
    {"type":"warning","text":"Nenn nur Zahlen, die du belegen kannst. Ohne Zahlen erzählst du, was du gemacht und gelernt hast."},
    {"type":"sources","items":[
      {"title":"BIBB: Kaufmann/Kauffrau für Marketingkommunikation (Ausbildungsberuf)","url":"https://www.bibb.de/dienst/berufesuche/de/index_berufesuche.php/profile/apprenticeship/n7636646"}
    ]}
  ]$j$::jsonb
),
(
  'de', 'entrevista-para-logistica',
  'Logistik: Sorgfalt, Routine und Sicherheit',
  'entrevista', 2, true, null, null,
  '{}', '{logistica}', false,
  $j$[
    {"type":"p","text":"Am Anfang in der Logistik nimmst du Waren an, prüfst Menge und Zustand, lagerst sie ein und bereitest Sendungen vor. Das ist Routinearbeit, bei der ein kleiner Fehler zu einem großen Problem werden kann."},
    {"type":"h","text":"Was du zeigen solltest"},
    {"type":"list","items":["**Sorgfalt:** Mengen, Artikelnummern und Adressen prüfen.","**Organisation:** wissen, wo was liegt.","**Sicherheit:** Regeln einhalten und Schutzausrüstung tragen, besonders an Staplern und Förderanlagen.","**Lust, Lagerprogramme** und Handscanner zu lernen."]},
    {"type":"example","title":"Beispiel","text":"„Bei der Lebensmittelsammlung der Schule habe ich die Spenden nach Art sortiert, die Mengen notiert und die Pakete gepackt.“"},
    {"type":"sources","items":[
      {"title":"BIBB: Fachkraft für Lagerlogistik (Ausbildungsberuf)","url":"https://www.bibb.de/dienst/berufesuche/profile/apprenticeship/89787i6u"}
    ]}
  ]$j$::jsonb
),
(
  'de', 'entrevista-para-saude',
  'Gesundheit und Pflege: Fürsorge, Ethik und Schweigepflicht',
  'entrevista', 3, true, null, null,
  '{}', '{saude}', false,
  $j$[
    {"type":"p","text":"Im Gesundheitsbereich zählt neben dem Fachwissen sehr, wie du mit Patientinnen, Patienten und ihren Daten umgehst."},
    {"type":"h","text":"Was meistens zählt"},
    {"type":"list","items":["**Respekt und Würde:** alle mit Sorgfalt und ohne Vorurteile behandeln.","**Schweigepflicht:** Was du bei der Arbeit erfährst, bleibt dort.","**Ehrlichkeit:** klar sagen, was du schon kannst und was du noch lernst.","**Die Einrichtung kennen:** informier dich über die Werte des Krankenhauses oder der Praxis."]},
    {"type":"example","title":"Tipp","text":"Wenn du in die Pflege willst, lies den Ethikkodex des International Council of Nurses (ICN), den auch der DBfK vertritt. Er kann bei Fragen zu schwierigen Situationen helfen."},
    {"type":"sources","items":[
      {"title":"International Council of Nurses: The ICN Code of Ethics for Nurses (auf Englisch)","url":"https://www.icn.ch/resources/publications-and-reports/icn-code-ethics-nurses"}
    ]}
  ]$j$::jsonb
);
