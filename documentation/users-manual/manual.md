Ročníkový projekt
=================
Vektorový screencast – Šimon Rozsíval, 2014
-------------------------------------------

Projekt vektorového screencastu má za cíl dát uživateli nástroj pro vytváření krátkých videí kreslením myší nebo grafickým tabletem po obrazovce doprovázených mluveným komentářem a sdílet tato videa s ostatními uživateli Internetu.
 
## Uživatelská dokumentace

### Spuštění aplikace
Aplikace běží na webovém serveru a pro přístup k ní je třeba využít webový prohlížeč, který splňuje minimální požadavky aplikace (viz příslušná sekce). Pro spuštění aplikace zadejte do adresního řádku prohlížeče adresu videa – např. http://www.rozsival.com/khan-academy a stiskněte klávesu enter.
Spuštění nástrojů pro tvorbu a přehrávání videa
Na úvodní straně vidíte seznam všech videí dostupných videí, které můžete spustit kliknutím na zelené tlačítko nebo smazat kliknutím na červené tlačítko.

Na úvodní stránce je také tlačítko pro spuštění nástroje pro záznam videa.

### Uživatelské rozhraní a ovládání přehrávače videí
Prostředí přehrávače se skládá ze dvou částí – z tmavé plochy tabule a světlého pruhu s ovládacími prvky ve spodní části obrazovky.

Spustit video je jednoduché – stačí kurzorem myši kliknout na zelené tlačítko v levém dolním rohu nebo stisknout klávesu mezerník. Stejným způsobem lze video kdykoli pozastavit. Pokud je video přehráno celé, opětovným stisknutím tlačítka nebo klávesy mezerník dojde k přehrání videa od začátku. Symbol zobrazený uvnitř tlačítka napovídá o tom, jaká akce bude vykonána v případě kliknutí na tlačítko nebo stisknutí mezerníku.

Napravo od tlačítka se nachází časová osa, kde zelený pruh ukazuje aktuální pozici přehrávaného videa a modrý pak která část zvuku je načtena ve vyrovnávací paměti prohlížeče. Kliknutím kamkoli na časovou osu dojde ke skoku na tuto pozici videa. V pravém dolním rohu je pak aktuální pozice videa vypsána, stejně jako délka celého videa.

Pro návrat na úvodní stránku stiskněte tlačítko „zpět“ webového prohlížeče, nebo do adresního pole znovu zadejte webovou adresu aplikace.

### Uživaltelské rozhraní a ovládání nahrávacího nástroje
Prostředí pro nahrávání je velice podobné přehrávači. Je zde tmavá plocha pro kreslení a pod ní lišta s ovládacími prvky.

Před zahájením nahrávání je třeba povolit v prohlížeči záznam zvuku mikrofonem.
Pro zahájení nahrávání stiskněte zelené tlačítko REC. Zahájení nahrávání bude indikováno změnou barvy tohoto tlačítka na červenou a bude se v něm průběžně ukazovat doba, po kterou již video nahráváte.

Jakmile začnete nahrávat, je zaznamenáván pohyb vašeho kurzoru po tmavé ploše tabule. Pro kreslení stiskněte levé tlačítko myši a táhněte kurzorem. Poté tlačítko znovu uvolněte.

K dispozici máte několik barev a šířek štětců. Kliknutím na příslušné tlačítko v liště s ovládacími prvky dojde ke změně barvy či šířky štětce a při kreslení další čáry bude toto nastavení aplikováno. Aktuální barvu či šířku štětce poznáte podle červeného obrysu tlačítka s příslušnou barvou nebo šířkou.
Ve chvíli, kdy chcete nahrávání ukončit, klikněte znovu na červené tlačítko. Poté vyvolejte kliknutím na tlačítko „UPLOAD“ formulář, do kterého prosím zadejte stručné informace o videu. Odesílání videa dokončíte stisknutím modrého tlačítka „Save video“. Poté prosím vyčkejte, než jsou informace odeslány a zpracovány na serveru. Doba závisí na rychlosti vašeho připojení k Internetu. 

### Požadavky na vlastnosti webového prohlížeče
Aplikace využívá několik technologií, které nejsou podporovány staršími prohlížeči, avšak většina moderních prohlížečů je již má. Ujistěte se tedy, že používáte prohlížeč, který má podporu pro:
- HTML5 Canvas 2D API
- HTML5 Web Audio API
    - Podpora MP3
- getUserMedia





## Programátorská dokumentace

Cílem projektu je vytvořit software pro záznam a přehrávání výukových videí pro potřeby Khanovy školy. Na rozdíl od běžných videí nejsou obrazová data uložena ve formě bitmap, ale jako vektory, což umožní snížit datovou náročnost a vykreslit obraz ostře při libovolně velkém rozlišení obrazovky uživatele. Přehrávač videa i nástroj pro nahrávání běží ve webovém prohlížeči. Součástí práce je také návrh a implementace vhodného formátu pro uchovávání obrazových a zvukových dat a implementace v softwarové architektuře klient/server.

### Specifikace projektu
Pro podrobnou specifikaci projektu se podívejte do přiloženého dokumentu.

### Obsah projektu
Projekt obsahuje Javascriptovou knihovnu pro nahrávání i přehrávání videa, dále pak ukázkovou aplikaci, která navíc obsahuje ukázkový kód ukládání výsledného videa na webovém serveru.

### Zprovoznění ukázkové aplikace na webovém serveru
Projekt musí být umístěn na webovém serveru, ať už na lokálním serveru nebo přístupném z internetu, s nainstalovanými následujícími technologiemi:
- PHP 5.4 nebo vyšší
- MySQL 5.6 nebo vyšší

Soubory se zdrojovými kódy umístěte tak, aby obsah adresáře *www* byl v root adresáři serveru. V souboru *www/index.php* zkontrolujte relativní cestu k souboru *app/bootstrap.php*. Adresáře *temp* a *log* by měly mít nastavena práva pro zápis.

Před samotným spuštěním aplikace je ještě nutné ověřit, zda je nastavena vhodná maximální velikost souboru pro upload. Ve výchozím stavu nastavení PHP umožňujte přenést pouze jednotky megabajtů, avšak nekomprimovaný zvuk, který je nahráván při záznamu videa, zabírá přes 10 MB za každou minutu záznamu. Nastavení je třeba provést v konfiguračním souboru *php.ini* vaší instalace PHP, u direktiv *max_upload_size* a *post_max_size* nastavte vhodnější limit (200 MB by mělo být více než dostatečné pro čtvrthodinová videa). Po editaci souboru *php.ini* je třeba restartovat webový server, jinak se změny neprojeví.

Nyní by již měla být aplikace spustitelná po zadání adresy Vašeho serveru do webového prohlíže.

Pokud chcete využít komprimace audia na straně serveru, ujistěte se, že máte povolen php příkaz *exec* a na serveru nainstalovaný program FFmpeg.

### Použité JavaScriptové knihovny mimo ukázkovou aplikaci
Pro použití knihovny uvnitř HTML dokumentu je třeba před ukončovací značku *body* přidat odkaz na JavaScriptové knihovny jQuery, Twitter Bootstrap 3 a na samotnou knihovnu vektorového videa.

        <script src="//code.jquery.com/jquery.js"></script>
        <script src="//netdna.bootstrapcdn.com/bootstrap/3.1.0/js/bootstrap.min.js"></script>

        <!-- Samotná knihovna -->
        <script src="js/libs/vector-video.min.js"></script>
        <!-- Pro nahrávání je třeba přidat i odkaz na knihovnu RecordJS -->
        <script src="js/libs/recordjs/recorder.js"></script>

Pro správné zobrazování je vhodné přidat do hlavičky dokumentu také odkaz na kaskádové styly knihovny Twitter Boostrap a na styly knihovny vektorového videa:

        <link rel="stylesheet" href="css/style.css"> <!-- url souboru style.css bude množná nutné upravit tak, aby odkazovala na správný soubor dle vašeho umístění souborů v root adresáři serveru -->
        <link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.1.0/css/bootstrap.min.css">

#### Konfigurace Nahrávače
Pro nahrávání v příslušném HTML dokumentu označíme místo, kam budete chtít nahrávání umístit, např.:

        <div id="recorder"></div>

Poté na konci dokumentu před značku *body* přidáme JavaScriptový kód, který inicializuje nahrávání, např.:

        <script>
            $(function() {
                var recorder = new Recorder({
                    url: {
                        uploadVideo: "upload-video.php",
                        getLink: "get-result-link.php"
                    },
                    audio: {
                        uploadAudio: "upload-audio.php",
                        recordJs: {
                            workerPath: "/js/libs/recordjs/recorderWorker.js"
                        }
                    }
                });
            });
        </script>

Je důležité, aby byl objekt *Recorder* vytvořen až ve chvíli, kdy je celý dokument načtený. O to se v ukázce stará *jQuery* konstrukce 

        $(function() { ... });

což je jen zkratka za

        $(document).on("ready", function() { ... })

Objekt *Recorder* přijímá v konstruktoru jediný parametr a tím je konfigurační objekt. Ten může obsahovat následující parametry:

- **url**: hodnotou je objekt upřesňující některé URL, na které se bude knihovna AJAXově dotazovat, konkrétně tyto dvě:
    * *uploadVideo*: odkaz na skript, který zpracovává nahrané XML
    * *getLink: odkaz na skript, který vrací odkaz na stránku pro přehrání výsledného videa
    * **bez udání těchto parametrů nebude nahrávání fungovat správně**
- **audio**: konfigurační objekt, který bude předán konstruktoru objektu *AudioRecorder* (popis viz popis tohoto objektu)
- **cursor**: konfigurační objekt, který bude předán konstruktoru objektu *Cursor* (popis viz popis tohoto objektu)
- **container**: hodnotou je objekt, kterým je upřesněno, kde má být nahrávač umístěn
    + *selector*: řetězec, obsahující selektor elementu, do kterého má být nahrávač umístěn - výchozí hodnota je *"#recorder"*
- **localization**: objekt obsahující řetězce, které jsou zobrazeny uživately a může sloužit pro překlad prostředí nahrávače do libovolného jazyka
    + *redirectPrompt*: řetězec, který se uživateli zobrazí před tím, než by mohl být přesměrován na přehrávání právě nahraného videa, výchozí hodnota je *"Do you want to view your recorded video?"*
    + *failureApology*: řetězec, kterým je uživateli v případě chyby tato skutečnost oznámena a je mu nabídnuto stažení dat přímo do svého počítače, výchozí hodnota je *"We are sorry, but your recording could not be uploaded to the server. Do you want to save the recorded data to your computer?"*
    + *ui*: objekt, který je předán konstruktoru objektu *RecorderUI* jako hodnota klíče *localization*
- **chunkLength**: celé číslo, tento parametr ovlivňuje, po kolika milisekundách bude během nahrávání rozdělován obsah do menších části, tzv. *"chunků"*

#### Konfigurace Přehrávače
Pro přehrávání v příslušném HTML dokumentu obdobně označíme místo, kam budete chtít přehrávač umístit, např.:

        <div id="player"></div>

Poté na konci dokumentu před uzavírací značku *body* přidáme JavaScriptový kód, který inicializuje přehrávání, např.:

        <script>
            $(function() {
                var player = new Player({                    
                    xml: {
                        file: "data.xml",
                    },
                    audio: [
                        {
                            file: "data.mp3",
                            type: "mp3"
                        },
                        {
                            file: "data.ogg",
                            type: "ogg"
                        }
                    ]
                });
            });
        </script>

Stejně jako u nahrávání, i nyní je důležité, aby byl objekt *Player* vytvořen až ve chvíli, kdy je celý dokument načtený.

Objekt *Player* přijímá v konstruktoru jediný parametr a tím je konfigurační objekt. Ten může obsahovat následující parametry:

- **xml**: hodnotou je objekt
    * *file*: URL souboru obsahující obrazová data
    * **bez udání tohoto parametrů nebude přehrávání možné**
- **audio**: pole objektů odkazujících na zdroje audio dat pro video; každý z prvků pole musí mít následující strukturu
    + *file*: URL souboru obsahující audio data
    + *type*: typ dat (nejspíše jeden z následujících: mp3, ogg, wav)
- **cursor**: konfigurační objekt, který bude předán konstruktoru objektu *Cursor* (popis viz popis tohoto objektu)
- **container**: hodnotou je objekt, kterým je upřesněno, kde má být přehrávač umístěn
    + *selector*: řetězec, obsahující selektor elementu, do kterého má být přehrávač umístěn - výchozí hodnota je *"#player"*
- **localization**: objekt obsahující řetězce, které jsou zobrazeny uživately a může sloužit pro překlad prostředí přehrávače do libovolného jazyka
    + *ui*: objekt, který je předán konstruktoru objektu *PlayerUI* jako hodnota klíče *localization*

### Zpracování odeslaných dat na straně serveru
Zvkuková a obrazová data jsou odesílána odděleně (dvěma HTTP požadavky) a jsou spojena na straně serveru.

#### Upload XML dat
Jako první je proveden upload XML dat. Data jsou odeslána HTTP POST požadavkem na url předanou v konfiguraci objektu *Recorder*. Data požadavku jsou následující:

- **type:** "video",
- **id:** identifikátor videa (čas zahájení uploadu),
- **format:** "xml",
- **rawData:** vlastní XML data záznamu - XML neobsahuje prolog,
- **title:** titulek videa zadaný uživatelem,
- **author:** jméno autora,
- **description:** popis videa zadaný uživatelem

Pokud uložení dat na straně serveru proběhne v pořádku, měla by být nazpět odeslána HTTP odpověď s kódem 200 strukturovaná ve formátu JSON. Jediný povinný parametr odpovědi je **recordingId**, pomocí kterého dojde v zápětí ke spojení XML a audio dat.

#### Upload audio dat
Po přijetí zprávy o úspěchu uploadu XML je zahájen i upload audio dat. Jedná se o HTTP POST (multipart) požadavek s následujícími daty:

- **id:** identifikátor videa (čas zahájení uploadu) - shoduje se s *id* odeslaným při uploadu XML,
- **recordingId:** ID získané z odpovědi serveru,
- **wav:** nekomprimovaná audio data ve [formátu WAVE]:https://ccrma.stanford.edu/courses/422/projects/WaveFormat/

Není žádný předepsaný formát odpovědi. Při úspěchu však musí být odeslána odpoveď s kódem 200 OK, při neúspěchu s kódem 500.

Inspirovat se můžete obslužnými metodami *handleUploadXml()* a *handleUploadAudio()* třídy *RecorderPresenter* v souboru *app/presenters/RecorderPresenter.php*. Při uložení audia je vhodné na straně serveru provést rovněž vhodnou komprimaci - např. převod do formátu MP3. Vhodné je k tomu použít například program [FFmpeg]:https://www.ffmpeg.org/ obdobně, jako je tomu v ukázce v PHP třídě *App\Model\Audio* v souboru *app/model/Audio.php*.

## Implementace JavaScriptové knihovny

### Event driven development
Celá knihovna je založena na [vyvolávání a obsluhování událostí]:http://en.wikipedia.org/wiki/Event-driven_programming. Tento přístup je v JavaScriptových knihovnách běžný a přirozený.

### Popis objektů
K dispozici jsou kromě minifikovaného javascriptového souboru *vector-video.min.js* také jednotlivé soubory, které obsahují příslušné objekty a ze kterých je snadno čitelná jejich implementace. Tyto soubory naleznete ve složce *js/app*.

#### 1. skupina objektů a funkcí "Helpers"
Helpery jsou malé pomocné třídy a soubory funkcí, které usnadňují a zpřehledňují časté akce používané v kódu dalších objektů. Ve složce *js/app/helpers* jsou následující objekty a soubor s funkcemi:

##### 1.1 VideoEvents
Důležitý statický objekt, který umožňuje využívat systém událostí pro komunikaci mezi jednotlivými objekty, aniž by na sebe musely mít přímé odkazy.

Objekt obsahuje dvě funkce:

**on((string) event, (function) callback)**
- *event* je řetězecový identifikátor události, při které má být vykonána funkce *callback*

**trigger((string) event[, ... arguments])**
- je spuštěna událost identifikovaná řetězcem *event*, čili jsou zavolány všechny funkce, které byly k této události přiřazeny voláním metody *on(event, ...)*. Volání metody *trigger* může mít neomezený počet dalších parametrů, které budou předány všem spouštěným funkcím.

##### 1.2 VideoTimer
Tento objekt poskytuje jednoduché API pro měření času v milisekundách.

##### 1.3 Saver
Tento objekt poskytuje jednoduchou možnost, jak uložit soubor na uživatelův počítač přímo z prohlížeče. Ukládat může buď objekt *Blob* a nebo textová data, která budou uložena jako text/xml.

Objekt poskytuje dvě funkce:

**saveWav((Blob) blob)**
- zahájí ukládání souboru vytvořeného z objektu typu Blob na uživatelův disk

**saveXml((string) text)**
- zahájí ukládání XML souboru vytvořeného z textu, který byl předán jako parametr; nedochází k validaci vstupního textu

##### 1.4 helper-functions.js
Obsahuje dvě funkce pro formátování času ve tvaru přirozeném pro lidi.

**secondsToString((int) s)**
- převede počet sekud do tvaru *Minuty:Sekundy*

**millisecondsToString((int) ms)**
- převede počet milisekund do tvaru *Minuty:Sekundy*

#### 2. objekt Player
Objekt *Player* je velice jednoduchý, jeho jedinou funkcí je vytvoření všech potřebných instancí objektů pro fungování přehrávače a předání konfigurace těmto objektům. Konfigurace objektu *Player* je popsána v předchozí kapitole. 

#### 3. Recorder
Objekt *Recorder* má čtyři funkce:
- vytvoření všech potřebných objektů,
- zaznamenávání stavů kurzoru během nahrávání,
- upload nashromážděných dat
- zakončení nahrávání po uploadu všech částí  

Konfigurace objektu *Recorder* je popsána v předchozí kapitole. 

#### 4. Uživatelské rozhraní
Ve složce *js/app/ui* je několik objektů, které zjednodušují vytváření uživatelského rozhraní.

##### 4.1 UIFactory
Objekt UIFactory má v sobě několik funkcí pro vytváření prvků uživatelského rozhraní využívající knihovny Twitter Bootstrap. Pomocí tohoto objektu lze:

- vytvořit a změnit ikonu
- vytvořit a změnit tlačítko
- vytvořit progress bar a měnit průběh
- vytvořit kurzorový kříž

Názvy a popis parametrů jednotlivých funkcí je uveden a okomentován v souboru *js/app/ui/ui-factory.js*.

##### 4.2 PlayerUI
Objekt *PlayerUI* vytvoří uvnitř daného elementu všechny prvky uživatelského rozhraní přehrávače a nachystá obsluhu událostí vyvolaných interakcí uživatele s uživatelským rozhraním, které dále spouštějí interní události přehrávače.

Uživatelské rozhraní lze konfigurovat jedním objektem předaným konstruktoru. Tento objekt může obsahovat tyto parametry:

-**localization**: objekt obsahující některé popisky uživatelského rozhraní, výchozím jazykem je angličtina
    * *noJS*: zobrazí se, když prohlížeč nepodporuje nebo nemá povolený JavaScript; výchozí hodnota je *"Your browser does not support JavaScript or it is turned off. Video can't be played without enabled JavaScript in your browser."*
    * *play*: popisek tlačítka pro přehrání videa; výchozí hodnota je *"Play video"*
    * *pause*: popisek tlačítka pro pozastavení videa; výchozí hodnota je *"Pause video"*
    * *replay*: popisek tlačítka pro opakování videa; výchozí hodnota je *"Replay video"**
    * *skip*: popisek progress baru; výchozí hodnota je *"Skip to this point"*
- **cursor**: konfigurační objekt objektu *Cursor*
- **container**: jQuery objekt elementu, do kterého je přehrávač vložen
- **containerSelector**: selektor elementu, do kterého má být přehrávač vložen; tento selektor je použit pouze tehdy, když není specifikován parametr *container*

##### 4.3 RecorderUI
Objekt *RecorderUI* je velice podobný objektu *PlayerUI*. Obsahuje však některé prvky, které přehrávač nemá a některé vypouští. S tím souvisí rozdílná konfigurace objektu:

- **pallete**: objekt popisující barevnou paletu dostupnou pro nahrávání videa; pomocí tohoto objektu lze dodefinovat další barvy a pozměnit odstíny výchozích barev:
    + *barva: css-atribut-barvy,*
    + white: "#ffffff",
    + yellow: "#fbff06",
    + red: "#fa5959",
    + green: "#8cfa59",
    + blue: "#59a0fa"

##### 4.4 Cursor
Objekt kurzor je velice jednoduchý a stará se jen o jedinou věc - vykreslovat vždy kurzor na tom správném místě. Poslouchá události a pokaždé, když je nahlášen nový stav (událost *`new-state`*), nastaví pozici kurzoru právě na toto místo. Kurzor představuje kurzorový kříž a proto je zobrazen tak, aby se aktuální pixel nacházel v průsečíku úseček tvořících kříž.

Objekt *Cursor* přijímá v konstruktoru jediný parametr a tím je konfigurační objekt. Ten může obsahovat následující parametry:

- **size**: celé číslo, šířka a výška kurzoru v pixelech
- **color**: CSS formát barvy, kterou má mít kurzor

#### 5. Aktuální nastavení prostředí

##### 5.1 BasicSettings
Toto je velice hloupý objekt. Poslouchá některé události a ukládá si aktuální barvu, šířku štětce a koeficinet pro přepočítávání souřadnic. Tento objekt má veřejnou metodu **getCurrentSettings()**, která vrací objekt s těmito hodnotami (klíče *color*, *brushSize* a *correctionRatio*).

#### 6. Manipulace s XML daty
Formát vektorového videa je stanoven ve specifikaci. Pro čtení a zapisování těchto dat slouží objekty *XmlReader* a *XmlWriter*.

##### 6.1 XmlReader
Tento objekt zajišťuje načtení XML souboru z dané URL a pokud je tento soubor správně strukturovaný (tzv. *well-formated*) a jedná se o validní soubor vektorového videa v podporované verzi, je jeho obsah načten do paměti.

Konstruktoru objektu je nutné předat objekt obsahující vlastnost **file**, jejíž hodnota je URL zdrojového XML souboru. Konfigurační objekt pak může obsahovat ještě hodnoty **error** a **success**, jejichž hodnoty mohou být funkce příjimající jeden parametr typu string. Tyto funkce jsou volány v případě chyby resp. úspěchu a je jim předána zpráva pro uživatele.

*XmlReader* pak poskytuje data pomocí veřejné funkce **getNext()**, která vrací následující stav kurzoru. Pokud byl dosažen konec, vrací tato funkce hodnotu *undefined*. Objekt vhodně reaguje na libovolnou změnu pozice videa.

##### 6.2 XmlWriter
Tento objekt převádí data nashromážděná objektem *Recorder* do definovaného XML formátu.

#### 7. Získávání dat

##### 7.1 XmlDataProvider
Tento objekt iniciuje čtení XML dat a reaguje na činnost uživatele - spouštění, pozastavování a přeskakování videa. Objekt načítá a zpracovává data od objektu *XmlReader* a dává pokyny k vykreslování nových částí obrazu po uplynutí dané doby mezi dvěma stavy.

Konstruktor přijímá jediný parametr, a tím je URL XML souboru.

##### 7.2 AudioPlayer
Objekt *AudioPlayer* obsluhuje přehrávání audia. Na základě vstupních audio stop předaných konstruktoru je vytvořen HTML5 přehrávač a jsou nachystány obsluhy událostí pro správné přehrávání zvuku.

Objekt hlídá, jaká část audio stopy je načtena v paměti a předává tuto informaci objektu *PlayerUI* (přes událost *buffered-until*).

##### 7.3 UserInputDataProvider
Tento objekt je využíván při nahrávání, hlídá uživatelovy kroky, zaznamenává hodnoty kurzoru a volá interní události s těmito hodnotami. Pokud je dostupné API grafického tabletu Wacom, pak jsou zaznamenávány i přesné hodnoty tlaku pera.

#### 8. Vykreslování čar

##### 8.1 RoundedLines
Pro vykreslování čar slouží objekt *RoundedLines*. Konstruktor tohoto objektu má jako parametr proměnnou typu *BasicSettings*, od které se dozvídá aktuální nastavení štětce/křídy.

Při vykreslení čáry mezi dvěma body je na obou koncích vykreslen kruh o poloměru vypočítaném v závislosti na tlaku pera (stisknutí myši) a aktuálního nastavení šířky štětce/křídy v koncových bodech. Mezi těmito body je poté vykreslen rovnostranný lichoběžník, jehož základny jsou úsečky procházející středy výše zmíněných kruhů o délce jejich průměrů.

#### 9. Nahrávání zvuku

##### 9.1 AudioRecorder
Pro přístup k mikrofonu je použito *MediaStream API* (více info například v [draftu W3C]:http://w3c.github.io/mediacapture-main/getusermedia.html nebo na webu [HTML5 Rocks]:http://www.html5rocks.com/en/tutorials/getusermedia/intro/), která je podporovaná většinou současných moderních prohlížečů.

Při nahrávání je využívána také knihovna [RecorderJS]:https://github.com/mattdiamond/Recorderjs.

*AudioRecorder* detekuje podporu *getUserMedia()* v prohlížeči a v případě, že uspěje, vytváří instanci objektu knihovny RecorderJS a přidává obsluhu událostí pro zahájení/ukončení nahrávání a uploadování nahraných dat.

Pro konfiguraci chování lze předat konstruktoru jeden objekt, obsahující tyto položky:

-**uploadAudio**: URL, na kterou má směřovat HTTP požadavek s nahranými daty; **bez správně uvedené URL nebude nahrávání zvuku fungovat**
-**recordJS**: konfigurační objekt knihovny RecorderJS, který upřesňuje cestu k souboru *js/libs/recordjs/recorderWorker.js* v parametru **workerPath**.

###### Možnosti budoucího vylepšení nahrávání zvuku
Data nejsou při záznamu nijak komprimována, což má za důsledek velký objem dat, který je nutné přenést od uživatele na server. Upload výsledného záznamu tedy trvá i při kvalitním připojení k Internetu poměrně dlouhou dobu.

Řešením by mohlo být průběžné odesílání dat na server již během nahrávání. K tomu by mohla sloužit technologie [WebRTC]:http://www.webrtc.org/.

### Použité JavaScriptové knihovny
Pro lepší zajištění přenositelnosti mezi prohlížeči, přehlednější zápis kódu a přímočařejší práci s HTML DOM elementy byly použity tyto knihovny:

- [jQuery v1.11.1]:http://www.jquery.com
- [Twitter Bootstrap v3.1.0]:http://getbootstrap.com/
- [RecordJS]:https://github.com/mattdiamond/Recorderjs




