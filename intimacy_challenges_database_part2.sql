-- Intimacy Challenges Module - Part 2
-- Remaining exercises for problems 7-9

-- Insert Exercises for Problem 7: Probleme de comunicare sexuală
INSERT INTO exercises (problem_id, title, description, content, difficulty, points_reward, estimated_minutes, order_index)
SELECT p.id, 'Jurnalul dorințelor nerostite', 'Explorezi și clarifici dorințele tale înainte de a le comunica, creând claritate asupra a ce vrei cu adevărat.',
'**Structura jurnalului:**
**Secțiunea 1: Dorințele fizice**
- Poziții pe care mi-ar plăcea să le încercăm
- Tipuri de atingeri pe care le doresc mai mult
- Locuri noi unde mi-ar plăcea să facem dragoste

**Secțiunea 2: Dorințele emoționale**
- Cum mi-ar plăcea să mă simt în timpul sexului
- Ce tip de conexiune îmi lipsește
- Cum aș vrea să fim amândoi după intimitate

**Secțiunea 3: Explorarea limitelor**
- Lucruri pe care cu siguranță le vreau să încercăm
- Lucruri despre care sunt curios dar nesigur
- Limite ferme pe care nu vreau să le trec

**Procesul de clarificare:**
Pentru fiecare dorință, întreabă-te:
- De ce îmi doresc acest lucru?
- Cum ar îmbunătăți experiența noastră?
- Care ar fi cea mai bună modalitate să comunic acest lucru?',
'medium', 10, 15, 1
FROM problems p WHERE p.title = 'Probleme de comunicare sexuală' AND p.user_type = 'intimacy_challenges';

INSERT INTO exercises (problem_id, title, description, content, difficulty, points_reward, estimated_minutes, order_index)
SELECT p.id, 'Tehnica "Da/Nu/Poate" pentru limite clare', 'Creați o hartă clară a preferințelor amândurora, facilitând comunicarea și respectul reciproc.',
'**Procesul pentru amândoi:**
**15 min individual:** Fiecare creează 3 liste
- **DA:** Lucruri pe care le îndrăgesc și le vreau mai mult
- **NU:** Limite ferme pe care nu vreau să le depășim
- **POATE:** Lucruri curioase despre care vreau să discutăm

**10 min împreună:** Împărtășirea listelor
- Prezentați listele fără justificări
- Nu întrebați "de ce" la limitele celuilalt
- Identificați zonele de suprapunere din categoria "DA"
- Planificați explorarea unui lucru din categoria "POATE"

**Regulile importante:**
- "NU" înseamnă NU, fără negociere
- "POATE" înseamnă discuție, nu consimțământ automat
- Listele se pot schimba în timp - revedeți-le lunar',
'easy', 5, 25, 2
FROM problems p WHERE p.title = 'Probleme de comunicare sexuală' AND p.user_type = 'intimacy_challenges';

INSERT INTO exercises (problem_id, title, description, content, difficulty, points_reward, estimated_minutes, order_index)
SELECT p.id, 'Feedback-ul pozitiv în timp real', 'Înveți să comunici ce îți place în timpul actului sexual, ghidând partenerul către ceea ce îți oferă maximum de plăcere.',
'**Formule pentru feedback pozitiv:**
**În loc de:** "Nu așa" sau "Nu îmi place"
**Spune:** 
- "Îmi place mai mult când..."
- "Simte-se incredibil când faci..."
- "Continuă exact așa"
- "Puțin mai sus/jos/încet/rapid"

**Tehnici non-verbale:**
- Gemete și sunete care arată plăcerea
- Ghidarea mâinilor partenerului către locul potrivit
- Mișcarea corpului pentru a indica ritmul preferat
- Contactul vizual pentru confirmare

**Exercițiul practic:**
În timpul următoarelor 3 întâlniri intime, obligă-te să dai cel puțin 3 feedback-uri pozitive per sesiune.',
'easy', 5, 10, 3
FROM problems p WHERE p.title = 'Probleme de comunicare sexuală' AND p.user_type = 'intimacy_challenges';

INSERT INTO exercises (problem_id, title, description, content, difficulty, points_reward, estimated_minutes, order_index)
SELECT p.id, 'Conversația "o dorință pe rând"', 'Creați un cadru sigur pentru împărtășirea dorințelor, unde fiecare se simte ascultat și respectat.',
'**Structura conversației:**
**Setarea cadrului (5 min):**
- Alegeți un moment relaxat, în afara dormitorului
- Stabiliți că este doar o discuție, nu o obligație de acțiune
- Acordați-vă că nu veți judeca sau critica

**Împărtășirea pe rând (10 min):**
- Fiecare spune o dorință sexuală
- Celălalt ascultă fără să întrerupă
- Cel care ascultă rezumă ce a înțeles
- Schimbați rolurile

**Planificarea acțiunii (5 min):**
- Ce dorință comună vreți să explorați prima?
- Când și cum veți încerca?
- Ce limite trebuie respectate?

**Exemple de dorințe de împărtășit:**
- "Mi-ar plăcea mai mult preludiu înainte..."
- "Aș vrea să încercăm [poziție/locație/moment] nou"
- "Mi-ar plăcea să ne concentrăm mai mult pe..."',
'medium', 10, 20, 4
FROM problems p WHERE p.title = 'Probleme de comunicare sexuală' AND p.user_type = 'intimacy_challenges';

INSERT INTO exercises (problem_id, title, description, content, difficulty, points_reward, estimated_minutes, order_index)
SELECT p.id, 'Role-play de comunicare ca joc', 'Transformi comunicarea sexuală într-un joc distractiv care eliminate stânghereala și încurajează deschiderea.',
'**Jocul "Scenarii de comunicare":**
**Pregătirea (5 min):**
- Scrieți pe biletele diferite scenarii de comunicare
- Puneți-le într-o cutie și trageți la sorți

**Exemple de scenarii:**
- "Cum ai cere ceva nou pe care vrei să îl încerci?"
- "Cum ai comunica că vrei să schimbați poziția?"
- "Cum ai spune că ceva nu îți place fără să jignești?"
- "Cum ai complimenta partenera pentru ceva specific?"
- "Cum ai cere un tip anume de atingere?"

**Jocul propriu-zis (20 min):**
- Pe rând, jucați scenariul tras
- Celălalt dă feedback asupra comunicării
- Discutați ce a funcționat și ce s-ar putea îmbunătăți

**Debrief-ul final (5 min):**
- Ce ați învățat despre stilurile voastre de comunicare?
- Care fraze au fost cele mai eficiente?
- Cum puteți aplica în viața reală ceea ce ați exersat?',
'hard', 15, 30, 5
FROM problems p WHERE p.title = 'Probleme de comunicare sexuală' AND p.user_type = 'intimacy_challenges';

-- Insert Exercises for Problem 8: Dependența de pornografie / fantezii nerealistice
INSERT INTO exercises (problem_id, title, description, content, difficulty, points_reward, estimated_minutes, order_index)
SELECT p.id, 'Monitorizarea și conștientizarea consumului', 'Dezvolți conștientizare asupra pattern-urilor de consum pentru a putea face schimbări informate.',
'**Jurnalul de tracking:**
**Zilnic notează:**
- **Ora:** Când ai simțit dorința să urmărești pornografie?
- **Declanșatorul:** Ce te-a făcut să vrei (plictiseală, stres, singurătate)?
- **Starea emoțională:** Cum te-ai simțit înainte și după?
- **Alternativa:** Ce altceva ai fi putut face în acel moment?

**Săptămânal analizează:**
- Care sunt pattern-urile tale (zile, ore, emoții)?
- În ce momente ești cel mai vulnerabil?
- Ce activități alternative ți-ar putea satisface nevoia reală din spatele consumului?

**Fără judecată:** Scopul nu este să te simți vinovat, ci să înțelegi comportamentul pentru a-l putea schimba.',
'easy', 5, 5, 1
FROM problems p WHERE p.title = 'Dependența de pornografie / fantezii nerealistice' AND p.user_type = 'intimacy_challenges';

INSERT INTO exercises (problem_id, title, description, content, difficulty, points_reward, estimated_minutes, order_index)
SELECT p.id, 'Înlocuirea cu contact real și activități sociale', 'Redirecționezi energia sexuală către interacțiuni reale și construiești conexiuni autentice.',
'**Alternativele pentru redirecționare:**
**Când simți dorința de pornografie:**

**Plan A - Contact social real:**
- Sună un prieten pentru o conversație de 15 minute
- Ieși din casă și mergi într-un loc public (cafenea, parc)
- Planifică o întâlnire reală cu cineva

**Plan B - Activități fizice energizante:**
- 10 minute exerciții fizice intense
- Duș rece pentru resetarea sistemului
- Plimbare rapidă afară

**Plan C - Activități creative:**
- Scrie în jurnal despre ce simți cu adevărat
- Ascultă muzică și dansează liber
- Învață ceva nou (tutorial, curs online)

**Regula celor 15 minute:** Înainte de a accesa pornografia, încearcă o alternativă timp de 15 minute. Adesea dorința va trece.',
'medium', 10, 30, 2
FROM problems p WHERE p.title = 'Dependența de pornografie / fantezii nerealistice' AND p.user_type = 'intimacy_challenges';

INSERT INTO exercises (problem_id, title, description, content, difficulty, points_reward, estimated_minutes, order_index)
SELECT p.id, 'Reducerea graduală cu înlocuitori sănătoși', 'Reduci treptat dependența prin limitare conștientă și înlocuirea cu stimuli mai sănătoși pentru sistemul tău de răsplată.',
'**Planul de reducere pe 8 săptămâni:**
**Săptămâna 1-2:** Stabilește limita actuală (ex: dacă acum urmărești zilnic, limitează la o dată la 2 zile)
**Săptămâna 3-4:** Reduce cu încă 50% (de la o dată la 2 zile la 2 ori pe săptămână)
**Săptămâna 5-6:** Maxim o dată pe săptămână
**Săptămâna 7-8:** Maxim de 2 ori pe lună

**Înlocuitorii sănătoși pentru dopamină:**
- Exerciții fizice care eliberează endorfine
- Realizări mici zilnice (completarea task-urilor)
- Muzica preferat care îți place
- Socializarea cu oameni pe care îi apreciezi
- Hobby-uri care îți dau satisfacție

**Strategia pentru recăderi:**
- Nu te judeca dur - recăderile sunt normale
- Reia planul a doua zi, nu abandona complet
- Identifica ce a cauzat recăderea și pregătește-te mai bine data viitoare',
'hard', 15, 0, 3
FROM problems p WHERE p.title = 'Dependența de pornografie / fantezii nerealistice' AND p.user_type = 'intimacy_challenges';

INSERT INTO exercises (problem_id, title, description, content, difficulty, points_reward, estimated_minutes, order_index)
SELECT p.id, 'Detox de 7 zile cu activități alternative de plăcere', 'Faci o pauză completă pentru a reseta sistemul de răsplata și a descoperi surse alternative de satisfacție.',
'**Regulile celor 7 zile:**
1. **Zero pornografie** sau conținut sexual explicit
2. **Zero masturbare** în primele 7 zile
3. **Da la activitățile de înlocuire** zilnică

**Planul zilnic pentru cele 7 zile:**
**Dimineața (20 min):**
- Exerciții fizice sau alergare
- Duș revitalizant
- Planificarea zilei cu activități pozitive

**Ziua (30 min):**
- O activitate nouă sau un hobby
- Socializare cu oameni reali
- Învățarea unui skill nou

**Seara (20 min):**
- Citit sau podcasturi educaționale
- Meditație sau relaxare
- Scris în jurnal despre progres

**Monitorizarea schimbărilor:**
- Cum se schimbă nivelul de energie?
- Îți crește interesul pentru interacțiuni reale?
- Ce activități îți aduc cel mai multă satisfacție?',
'hard', 15, 70, 4
FROM problems p WHERE p.title = 'Dependența de pornografie / fantezii nerealistice' AND p.user_type = 'intimacy_challenges';

INSERT INTO exercises (problem_id, title, description, content, difficulty, points_reward, estimated_minutes, order_index)
SELECT p.id, 'Crearea de fantezii personale realiste cu partenera', 'Îți dezvolți imaginația erotică bazată pe experiențe reale și posibile, nu pe stimuli artificiali.',
'**Tehnica fanteziei ghidate realiste:**
1. **Setarea scenei realiste:** Imaginează un cadru plausibil cu partenera ta reală
2. **Focus pe emoții și senzații:** Concentrează-te pe ce ai simți, nu doar pe aspectul vizual
3. **Include comunicarea:** Imaginează conversații și feedback pozitiv dintre voi
4. **Detalii senzoriale:** Mirosuri, texturi, sunete specifice momentului
5. **Finalul emoțional:** Include conectarea post-intimitate și afecțiunea

**Exemple de scenarii realiste:**
- O seară romantică acasă care evolues natural către intimitate
- O escapadă de weekend într-un loc frumos
- O dimineață leneșă în care vă treziți împreună
- Primul moment intim după o perioadă de separare

**Beneficiile fanteziei realiste:**
- Te pregătește pentru experiențe reale posibile
- Crește anticiparea pentru intimitatea cu partenera
- Reduce dependența de stimuli artificiali
- Îmbunătățește capacitatea de a fi prezent în momentele reale',
'medium', 10, 15, 5
FROM problems p WHERE p.title = 'Dependența de pornografie / fantezii nerealistice' AND p.user_type = 'intimacy_challenges';

-- Insert Exercises for Problem 9: Anxietatea de performanță și stresul sexual
INSERT INTO exercises (problem_id, title, description, content, difficulty, points_reward, estimated_minutes, order_index)
SELECT p.id, 'Tehnica "Grounding 5-4-3-2-1" pentru prezența în moment', 'Te aduci rapid în momentul prezent când anxietatea începe să te copleșească.',
'**Tehnica aplicată în intimitate:**
Când simți că anxietatea crește, oprește-te mental și identifică:
- **5 lucruri pe care le VEZI** (pielea partenerului, lumina, expresia ei)
- **4 lucruri pe care le AUZI** (respirația ei, sunetele naturale, bătăile inimii)
- **3 lucruri pe care le SIMȚI fizic** (căldura, textura, presiunea)
- **2 lucruri pe care le MIROȘI** (parfumul ei, mirosul intimității)
- **1 lucru pe care îl GUȘTI** (sărutul, pielea ei)

**Rezultatul:** Mintea ta trece de la gândurile anxioase la experiența senzorială reală.',
'easy', 5, 3, 1
FROM problems p WHERE p.title = 'Anxietatea de performanță și stresul sexual' AND p.user_type = 'intimacy_challenges';

INSERT INTO exercises (problem_id, title, description, content, difficulty, points_reward, estimated_minutes, order_index)
SELECT p.id, 'Recadrarea gândurilor negative cu afirmații pozitive', 'Înveți să identifici și să transformi gândurile care îți sabotează performanța.',
'**Gândurile anxioase comune și recadrarea lor:**

**"Nu o să performez bine" → "Corpul meu știe ce să facă natural"**
**"Nu o să îi placă" → "Ne bucurăm împreună de această experiență"**
**"Sunt prea grăbit/lent" → "Merg în ritmul care se simte natural"**
**"Nu arăt bine" → "Ea este aici pentru că îi plac și corpul, și personalitatea mea"**
**"Trebuie să fiu perfect" → "Intimitatea autentică este mai valoroasă decât perfecțiunea"**

**Exercițiul zilnic:**
- Dimineața: Repetă 3 afirmații pozitive despre capacitatea ta sexuală
- Seara: Recadrează orice gând negativ din ziua respectivă
- Înainte de intimitate: Repetă mentală afirmația care te calmează cel mai mult',
'medium', 10, 10, 2
FROM problems p WHERE p.title = 'Anxietatea de performanță și stresul sexual' AND p.user_type = 'intimacy_challenges';

INSERT INTO exercises (problem_id, title, description, content, difficulty, points_reward, estimated_minutes, order_index)
SELECT p.id, 'Focusul pe plăcerea partenerului pentru ieșirea din propriul cap', 'Reduci anxietatea prin redirecționarea atenției către experiența și plăcerea partenerului.',
'**Strategia de redirecționare:**
**În loc să te gândești la:** "Cum performez eu?"
**Concentrează-te pe:** "Cum se simte ea în acest moment?"

**Întrebările mentale utile:**
- Ce expresie are pe față?
- Cum respiră acum?
- Ce parte a corpului ei răspunde cel mai mult?
- Ce tipuri de atingeri o fac să se simtă cel mai bine?
- Cum pot să o fac să se simtă și mai plăcută?

**Beneficiul dublu:** 
- Ieși din anxietatea legată de propria performanță
- Devii un partener mai atent și mai bun',
'easy', 5, 0, 3
FROM problems p WHERE p.title = 'Anxietatea de performanță și stresul sexual' AND p.user_type = 'intimacy_challenges';

INSERT INTO exercises (problem_id, title, description, content, difficulty, points_reward, estimated_minutes, order_index)
SELECT p.id, 'Acceptarea "imperfecțiunii" ca parte normală din intimitate', 'Înveți să accepți că intimitatea reală include și momente neperfecte, și că acestea nu înseamnă eșec.',
'**Exercițiul de normalizare:**
**Scrie pe o hârtie situații "imperfecte" normale:**
- Pierderea erecției temporar
- Ejacularea mai rapidă decât dorit
- Momente stânjenitoare sau amuzante
- Oboseala sau lipsa de sincronizare
- Zgomote sau situații neprevăzute

**Pentru fiecare situație, scrie:**
- "Acest lucru este normal și uman"
- "Nu definește valoarea mea ca partener"
- "Partenera mea înțelege că suntem amândoi oameni reali"
- "Pot să râd de situație și să continuu"

**Mantra pentru acceptare:**
"Intimitatea perfectă nu există. Intimitatea autentică și cu erori este mai valoroasă decât performanța artificială."',
'medium', 10, 15, 4
FROM problems p WHERE p.title = 'Anxietatea de performanță și stresul sexual' AND p.user_type = 'intimacy_challenges';

INSERT INTO exercises (problem_id, title, description, content, difficulty, points_reward, estimated_minutes, order_index)
SELECT p.id, 'Rutina de relaxare pre-intimitate personalizată', 'Creezi un ritual personalizat care îți calmează sistemul nervos și te pregătește mental pentru intimitate.',
'**Rutina ta de 15 minute:**
**Minute 1-5: Pregătirea fizică**
- Duș cald sau spălare pe față cu apă rece
- Respirații adânci în fața oglinzii
- Afirmația: "Sunt pregătit să fiu prezent și să oferă dragoste"

**Minute 6-10: Conectarea emoțională**
- Gândește-te la 3 lucruri pe care le iubești la partenera ta
- Imaginează-te relaxat și fericit în timpul intimității
- Setează intenția: "Vreau să ne conectăm și să ne bucurăm împreună"

**Minute 11-15: Prezența în corp**
- Relaxarea progresivă rapidă (contractă și relaxează fiecare parte a corpului)
- Observă cum te simți fizic fără să judeci
- Acceptă orice tensiune rămasă: "Este normal să mai simt puțină emoție"

**Adaptarea rutinei:**
Modifică rutina în funcție de ce îți funcționează cel mai bine. Unii preferă exerciții fizice, alții meditația, alții conversația cu partenera.',
'medium', 10, 15, 5
FROM problems p WHERE p.title = 'Anxietatea de performanță și stresul sexual' AND p.user_type = 'intimacy_challenges';

-- Success message for part 2
SELECT 'Intimacy Challenges Module Part 2 completed successfully!' as message,
       (SELECT COUNT(*) FROM exercises e 
        JOIN problems p ON e.problem_id = p.id 
        WHERE p.user_type = 'intimacy_challenges') as total_exercises_now
FROM problems 
WHERE user_type = 'intimacy_challenges'
LIMIT 1;