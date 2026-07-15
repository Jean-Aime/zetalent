import type {
  Sport, NewsCategory, NewsArticle, Team, Player,
  Match, StandingRow, SocialPost, Sponsor, NavigationItem,
} from '../types';

export const sports: Sport[] = [
  { id: 's1', slug: 'football', name: { en: 'Football', fr: 'Football', rw: 'Umupira w\'Amaguru' }, icon: 'Circle', color: '#22c55e', teamCount: 12 },
  { id: 's2', slug: 'basketball', name: { en: 'Basketball', fr: 'Basketball', rw: 'Ikibuga cya Basketball' }, icon: 'Dribbble', color: '#f97316', teamCount: 10 },
  { id: 's3', slug: 'volleyball', name: { en: 'Volleyball', fr: 'Volleyball', rw: 'Volleyball' }, icon: 'Volleyball', color: '#3b82f6', teamCount: 8 },
  { id: 's4', slug: 'handball', name: { en: 'Handball', fr: 'Handball', rw: 'Handball' }, icon: 'Hand', color: '#ef4444', teamCount: 8 },
  { id: 's5', slug: 'athletics', name: { en: 'Athletics', fr: 'Athlétisme', rw: 'Ibyiza by\'Umubiri' }, icon: 'Activity', color: '#a855f7', teamCount: 0 },
];

export const newsCategories: NewsCategory[] = [
  { id: 'c1', slug: 'match-reports', name: { en: 'Match Reports', fr: 'Comptes Rendus', rw: 'Igitangazo cy\'Imikino' } },
  { id: 'c2', slug: 'transfers', name: { en: 'Transfers', fr: 'Transferts', rw: 'Kuvaho Ajahoze' } },
  { id: 'c3', slug: 'interviews', name: { en: 'Interviews', fr: 'Entretiens', rw: 'Ibiganiro' } },
  { id: 'c4', slug: 'sponsorship', name: { en: 'Sponsorship', fr: 'Sponsoring', rw: 'Abaterankunga' } },
  { id: 'c5', slug: 'league-updates', name: { en: 'League Updates', fr: 'Actualités de la Ligue', rw: 'Amakuru y\'Irushanwa' } },
  { id: 'c6', slug: 'press-releases', name: { en: 'Press Releases', fr: 'Communiqués', rw: 'Ibyo bahuye abanyamakuru' } },
];

const ph = (seed: string, w = 1200, h = 800) =>
  `https://images.pexels.com/photos/${seed}/pexels-photo-${seed}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop`;

export const news: NewsArticle[] = [
  {
    id: 'n1', slug: 'rwanda-women-football-final-2-1',
    title: {
      en: 'Women\'s Football Final Ends 2-1 in Thrilling Championship Decider',
      fr: 'La Finale du Football Féminin se Termine 2-1 dans un Decider Palpitant',
      rw: 'Final y\'Umupira w\'Amaguru y\'Abagore Yarangiye 2-1 mu Kiganiro cyiza',
    },
    excerpt: {
      en: 'Kigali Queens clinched the championship with a last-minute winner before a packed Amahoro Stadium.',
      fr: 'Kigali Queens a remporté le championnat avec un but de dernière minute devant un stade Amahoro comble.',
      rw: 'Kigali Queens yatsindiye irushanwa ibitego by\'isosiyete mu mpera z\'umukino mu kibuga cya Amahoro cyuzuye.',
    },
    body: {
      en: 'A record crowd of 18,000 fans packed Amahoro National Stadium on Saturday afternoon to witness one of the most dramatic women\'s football finals in Rwandan history. Kigali Queens, trailing 1-0 at halftime, mounted a stirring second-half comeback that culminated in a stoppage-time winner from captain Alice Mukamana.\n\nThe match began cautiously, with both sides probing for openings in a tense opening quarter. AS Kigali Women took the lead in the 34th minute through striker Nadia Uwase, who latched onto a through ball and slotted past the onrushing goalkeeper.\n\nKigali Queens responded with renewed purpose after the break. Midfielder Grace Ingabire equalized in the 58th minute with a curled effort from the edge of the box. As the clock ticked into added time, Mukamana rose highest to meet a corner and headed home, sparking jubilant celebrations.',
      fr: 'Une foule record de 18 000 supporters a envahi le stade national Amahoro samedi après-midi pour assister à l\'une des finales de football féminin les plus dramatiques de l\'histoire du Rwanda. Kigali Queens, menée 1-0 à la mi-temps, a monté un retour passionné en deuxième mi-temps qui a culminé avec un but de dernière minute de la capitaine Alice Mukamana.\n\nLe match a commencé prudemment, les deux équipes cherchant des ouvertures dans un premier quart tendu. AS Kigali Women a pris l\'avance à la 34e minute grâce à l\'attaquante Nadia Uwase, qui a repris un ballon profond et a trompé la gardienne de but.\n\nKigali Queens a répondu avec une nouvelle détermination après la pause. La milieu de terrain Grace Ingabire a égalisé à la 58e minute avec une frappe enroulée depuis l\'entrée de la surface. Alors que le chronomètre entrait dans les arrêts de jeu, Mukamana s\'est élevée le plus haut pour reprendre un corner de la tête, déclenchant des célébrations jubilatoires.',
      rw: 'Abafana 18,000 bari mu kibuga cya Amahoro ku cyumweru mu manya bashwitura umukino wa nyuma w\'umupira w\'amaguru w\'abagore w\'ibyiza cyane mu Rwanda. Kigali Queens, yari igaye 1-0 mu biecyerezo, yagarutse mu kabanzeho ikine ibitego by\'isosiyete by\'umuherwe w\'umukino witwa Alice Mukamana.\n\nUmukino watangiye neza, iqabane ku munsi wose rishaka ahantu h\'ibyiza. AS Kigali Women yatuye ibitego bya mbere mu gika cya 34 cy\'umukino, wari ukinyegayegwa na Nadia Uwase.\n\nKigali Queens yagarutse neza mu kabanzeho. Grace Ingabire yatuye ibitego bya boboze mu gika cya 58. N\'igihe cy\'umukino cyari cyarageze mu byuma, Mukamana yaguye hejuru y\'abandi y\'umupaka w\'agahato kandi yatuye ibitego by\'isosiyete.',
    },
    image: ph('114296', 1600, 900),
    imageAlt: 'Women\'s football final at Amahoro Stadium',
    category: 'match-reports', sport: 'football',
    author: 'Claudine Uwase', authorAvatar: ph('1239291', 100, 100),
    publishedAt: '2026-07-13T18:30:00Z', readTime: 4,
    featured: true, trending: true, breaking: false,
    tags: ['championship', 'kigali-queens', 'final', 'football'],
    views: 12480,
  },
  {
    id: 'n2', slug: 'basketball-league-opens-new-season',
    title: {
      en: 'Women\'s Basketball League Tips Off New Season with Expanded Roster',
      fr: 'La Ligue de Basketball Féminin Lance sa Nouvelle Saison avec un Effectif Élargi',
      rw: 'Irushanwa ry\'Umupira w\'Amaguru w\'Ibibando ryatangiye Igihe Gishya cy\'Abakora benshi',
    },
    excerpt: {
      en: 'The 2026 season welcomes two new franchises and a revitalized youth development pipeline.',
      fr: 'La saison 2026 accueille deux nouvelles franchises et un pipeline de développement des jeunes revitalisé.',
      rw: 'Igihe cy\'umwaka wa 2026 cyakira amakipe mashya abiri n\'urubyiruko rw\'iterambere.',
    },
    body: {
      en: 'The Rwanda Women\'s Basketball League officially opened its 2026 campaign this weekend, marking the largest season in the competition\'s history. Two expansion franchises — Eastern Eagles and Northern Storm — joined the ten returning teams, bringing the total to twelve.\n\nLeague commissioner Diane Uwamariya announced a new partnership with the national youth federation to create a structured development pathway from under-16 through senior level. "This is about building a sustainable future for women\'s basketball in Rwanda," she said at the opening press conference.\n\nThe season\'s first slate of games drew strong attendance, with the opener between defending champions Patriots Women and newcomers Eastern Eagles attracting over 3,500 fans to Petit Stade.',
      fr: 'La Ligue Rwandaise de Basketball Féminin a officiellement ouvert sa campagne 2026 ce week-end, marquant la plus grande saison de l\'histoire de la compétition. Deux nouvelles franchises — Eastern Eagles et Northern Storm — ont rejoint les dix équipes de retour, portant le total à douze.\n\nLa commissaire de la ligue Diane Uwamariya a annoncé un nouveau partenariat avec la fédération nationale de la jeunesse pour créer un parcours de développement structuré des moins de 16 ans au niveau senior. "Il s\'agit de construire un avenir durable pour le basketball féminin au Rwanda", a-t-elle déclaré lors de la conférence de presse d\'ouverture.\n\nLa première série de matchs de la saison a attiré une forte affluence, le match d\'ouverture entre les championnes en titre Patriots Women et les nouvelles venues Eastern Eagles attirant plus de 3 500 fans au Petit Stade.',
      rw: 'Irushanwa ry\'umupira w\'amaguru w\'ibibando mu Rwanda ryatangiye igihe cy\'umwaka wa 2026 ku munsi w\'umunsi w\'icyumweru, ari nacyo gihe kinini cy\'irushanwa. Amakipe mashya abiri — Eastern Eagles na Northern Storm — yinjiye mu makipe cumi, bikaba make umunani gato.\n\nDiane Uwamariya, umuyobozi w\'irushanwa, yatangaje igufatanya n\'ishyirahamwe ry\'urubyiruko mu rwego rwo kubaka nzego y\'iterambere kuva mu banyuma imyaka 16 kugeza ku bakuru. "Ibi ni ukubaka ejo hazaza h\'umupira w\'amaguru w\'ibibando w\'abagore mu Rwanda," yagize atyo.\n\nImikino ya mbere y\'umwaka yahuye n\'abafana benshi, aho imikino mpimbano hagati ya Patriots Women n\'Eastern Eagles yahuje abafana 3,500 mu kibuga cya Petit Stade.',
    },
    image: ph('1752757', 1600, 900),
    imageAlt: 'Women\'s basketball game action',
    category: 'league-updates', sport: 'basketball',
    author: 'Mugisha Nshimiyimana', authorAvatar: ph('1681010', 100, 100),
    publishedAt: '2026-07-12T15:00:00Z', readTime: 3,
    featured: true, trending: true, breaking: false,
    tags: ['basketball', 'new-season', 'league'],
    views: 8230,
  },
  {
    id: 'n3', slug: 'volleyball-champions-threepeat',
    title: {
      en: 'APR Volleyball Queens Chase Historic Three-Peat',
      fr: 'APR Volleyball Queens Poursuivent un Triplé Historique',
      rw: 'APR Volleyball Queens I Shyaka rya Gatura mu byiciro Bitatu',
    },
    excerpt: {
      en: 'The reigning champions aim for an unprecedented third consecutive title as the playoffs begin.',
      fr: 'Les championnes en titre visent un troisième titre consécutif inédit alors que les playoffs commencent.',
      rw: 'Abanyamabanga b\'ibyiciro bagerageza kwatsinda igihembo cya gatatu ku giti cyabo mu gihe cy\'imikino y\'inyuma.',
    },
    body: {
      en: 'APR Volleyball Queens enter the 2026 playoffs as overwhelming favourites, having dominated the regular season with a 14-1 record. A third consecutive championship would cement their status as the most dominant women\'s volleyball program in East Africa.\n\nHead coach Patrick Mazimaka has built his squad around a formidable core led by opposite hitter Sylvie Iradukunda, whose powerful attacks have made her the league\'s leading scorer. "We respect every opponent, but we believe in our system and our preparation," Mazimaka said.\n\nThe best-of-five finals series begins next weekend at Kigali Arena, where APR will face either RRA Volleyball or INATEK Women, who meet in a decisive semifinal rubber this Thursday.',
      fr: 'APR Volleyball Queens entrent dans les playoffs 2026 en tant que favorites écrasantes, ayant dominé la saison régulière avec un bilan de 14-1. Un troisième championnat consécutif cimenterait leur statut de programme de volleyball féminin le plus dominant d\'Afrique de l\'Est.\n\nL\'entraîneur-chef Patrick Mazimaka a construit son équipe autour d\'un noyau redoutable mené par l\'attaquante opposée Sylvie Iradukunda, dont les attaques puissantes ont fait d\'elle la meilleure marqueuse de la ligue. "Nous respectons chaque adversaire, mais nous croyons en notre système et notre préparation", a déclaré Mazimaka.\n\nLa série finale en cinq matchs commence le week-end prochain à la Kigali Arena, où APR affrontera soit RRA Volleyball soit INATEK Women, qui s\'affrontent dans une demi-finale décisive ce jeudi.',
      rw: 'APR Volleyball Queens bingiye mu mikino y\'inyuma y\'umwaka wa 2026 nk\'abakwiiye cyane, bafite ibyiringiro bya 14-1. Igihembo cya gatatu kizana cyane izina ry\'urubyiruko rw\'abagore rw\'ibibando mu karere k\'iburasirazuba bwa Afurika.\n\nPatrick Mazimaka, umutoza, yubatse ikipe ye ku banyamabanga bakomeye cyane, barimo Sylvie Iradukunda, w\'ibitego byinshi mu makipe yose. "Tubaha buri uwo duhanganye, ariko twe dufite ibyiringiro mu buryo bwacu n\'ibyitunganya," Mazimaka yagize atyo.\n\nImikino y\'anyuma y\'ibyiciro bitanu yatangira ku munsi w\'umunsi w\'icyumweru ukurikira mu kibuga cya Kigali Arena, aho APR izahura na RRA Volleyball cyangwa INATEK Women, aho bazahura ku wa kane mu mukino wa nyuma w\'ibyiringiro.',
    },
    image: ph('274506', 1600, 900),
    imageAlt: 'Volleyball action at the net',
    category: 'match-reports', sport: 'volleyball',
    author: 'Claudine Uwase', authorAvatar: ph('1239291', 100, 100),
    publishedAt: '2026-07-11T12:00:00Z', readTime: 3,
    featured: false, trending: true, breaking: false,
    tags: ['volleyball', 'playoffs', 'APR', 'championship'],
    views: 5670,
  },
  {
    id: 'n4', slug: 'athletics-record-broken-5000m',
    title: {
      en: 'National 5000m Record Shattered at Kigali International Meet',
      fr: 'Record National du 5000m Battu au Meeting International de Kigali',
      rw: 'Igifaransa cy\'Igihugu cya 5000m Cyarangijwe mu Mikino mpuzamahanga ya Kigali',
    },
    excerpt: {
      en: 'Young distance runner Salima Nyiraneza lowered the national mark by 12 seconds in a stunning breakthrough.',
      fr: 'La jeune coureuse de fond Salima Nyiraneza a amélioré la marque nationale de 12 secondes lors d\'une percée spectaculaire.',
      rw: 'Umukinnyi w\'umunsi Salima Nyiraneza yagabanyije agaciro k\'igihugu mu by секунда 12 mu bijyanye n\'amahirwe.',
    },
    body: {
      en: 'Twenty-one-year-old Salima Nyiraneza stunned the athletics world on Friday evening by shattering the Rwandan national record in the women\'s 5000 metres. Running at the Kigali International Meet, Nyiranezana clocked 14:52.31, eclipsing the previous mark of 15:04.18 set in 2019.\n\n"It hasn\'t sunk in yet," an emotional Nyiranezana said after the race. "I knew I was in good shape, but to break the record by that much, on home soil, in front of my family — it\'s beyond anything I imagined."\n\nThe performance puts Nyiranezana firmly in contention for a place at the World Athletics Championships, with her coach indicating she will target the qualifying standard in her next two races.',
      fr: 'Salima Nyiranezana, vingt et un ans, a stupéfié le monde de l\'athlétisme vendredi soir en pulvérisant le record national rwandais du 5000 mètres féminin. Courant au Meeting International de Kigali, Nyiranezana a chronométré 14:52.31, éclipsant la marque précédente de 15:04.18 établie en 2019.\n\n"Ce n\'est pas encore arrivé", a déclaré une Nyiranezana émue après la course. "Je savais que j\'étais en bonne forme, mais battre le record d\'autant, sur le sol natal, devant ma famille — c\'est au-delà de tout ce que j\'imaginais."\n\nLa performance place Nyiranezana fermement en lice pour une place aux Championnats du Monde d\'Athlétisme, son entraîneur indiquant qu\'elle visera le standard de qualification dans ses deux prochaines courses.',
      rw: 'Salima Nyiranezana, w\'imyaka makumyabiri n\'imwe, yatumije isi y\'ibyiza by\'umubiri ku wa gatanu mu manya ashyizeho agaciro k\'igihugu cy\'u Rwanda mu bagore b\'ibihumbi bitanu. Yareze agaciro k\'amasegonda 14:52.31, asimbuza agaciro k\'ibyuma bya 15:04.18 byari byashyizweho mu 2019.\n\n"Iki ntago nkibuka neza," Nyiranezana yagize atyo arangije umukino. "Nari nzi ko ndi mu buzima bwiza, ariko kugabanya agaciro k\'igihugu cy\'ibihumbi bitanu, ku giso cy\'u Rwanda, imbere y\'umuryango wanjye — n\'iby\'agaciro kurenza ibyo nari ntekereje."\n\nIki kibanza gisiga Nyiranezana mu nzego y\'abahatanira kugera ku mikino y\'isi y\'ibyiza by\'umubiri, n\'umutoza we avuga ko azagerageza ku gipimo cy\'ibyangombwa mu mikino ye ibiri ikurikira.',
    },
    image: ph('4498293', 1600, 900),
    imageAlt: 'Athletics track competition',
    category: 'match-reports', sport: 'athletics',
    author: 'Mugisha Nshimiyimana', authorAvatar: ph('1681010', 100, 100),
    publishedAt: '2026-07-10T20:00:00Z', readTime: 4,
    featured: true, trending: false, breaking: false,
    tags: ['athletics', 'record', '5000m', 'kigali'],
    views: 9890,
  },
  {
    id: 'n5', slug: 'handball-cup-semifinals-set',
    title: {
      en: 'Handball Cup Semifinals Set After Quarterfinal Sweep',
      fr: 'Les Demi-finales de la Coupe de Handball Déterminées après un Balayage en Quart de Finale',
      rw: 'Ibyiringiro by\'Igikombe cya Handball byagenze nyuma y\'umukino w\'ibyiringiro',
    },
    excerpt: {
      en: 'Police Handball and APR Handball headline a blockbuster semifinal pairing in the national cup.',
      fr: 'Police Handball et APR Handball animent une affiche d\'affiche en demi-finale de la coupe nationale.',
      rw: 'Police Handball na APR Handball bari mu mikino y\'ibyiringiro y\'igikombe cy\'igihugu.',
    },
    body: {
      en: 'The Rwanda Women\'s Handball Cup semifinals are set after a decisive weekend of quarterfinal action. Top-seeded Police Handball secured their spot with a commanding 28-19 victory over Muhanga Women, while defending champions APR Handball edged Esperance 25-23 in a tense affair.\n\nThe semifinal draw produced the matchup every fan anticipated: Police against APR, the two dominant forces of Rwandan women\'s handball, will clash at Kigali Arena next Saturday. The other semifinal pits underdogs Ruhango Women against a surging Nyanza side.\n\n"It\'s the final everyone wanted, just a round early," said APR captain Beatrice Uwase. "We know each other inside out. It will come down to who handles the pressure better on the day."',
      fr: 'Les demi-finales de la Coupe Rwandaise de Handball Féminin sont déterminées après un week-end décisif de quarts de finale. Tête de série numéro un Police Handball a sécurisé sa place avec une victoire autoritaire de 28-19 sur Muhanga Women, tandis que les championnes en titre APR Handball ont battu Esperance 25-23 dans un match tendu.\n\nLe tirage des demi-finales a produit l\'affiche que chaque fan attendait : Police contre APR, les deux forces dominantes du handball féminin rwandais, s\'affronteront à la Kigali Arena samedi prochain. L\'autre demi-finale oppose les outsiders Ruhango Women à une équipe de Nyanza en pleine ascension.\n\n"C\'est la finale que tout le monde voulait, juste un tour trop tôt", a déclaré la capitaine d\'APR Beatrice Uwase. "Nous nous connaissons par cœur. Tout se jouera sur qui gérera le mieux la pression le jour J."',
      rw: 'Ibyiringiro by\'igikombe cy\'u Rwanda cy\'abagore cy\'ibibando cyagenze nyuma y\'umunsi w\'icyumweru w\'ibyiringiro. Police Handball, ikipe y\'icyiciro cya mbere, yatsindiye ku giti cyayo ibitego 28-19 kuri Muhanga Women, mu gihe APR Handball, abanyamabanga b\'ibyiciro, batsindiye Esperance 28-23 mu mukino w\'ibyiringiro.\n\nIbyiringiro by\'ibyiringiro byatuma umukino wose wari witezwe: Police na APR, amakipe abiri y\'abagore y\'ibibando mu Rwanda, azahura mu kibuga cya Kigali Arena ku cyumweru gikurikira. Ikindi kibungabunga ni Ruhango Women na Nyanza.\n\n"Iki nicyo cy\'anyuma abafana bose bahitanye, ariko ku cyiciro kibanza," Beatrice Uwase, umutware w\'APR, yagize atyo. "Tumenye neza. Bizagenda ku uko wemerera iby\'agaciro ku munsi w\'umukino."',
    },
    image: ph('3621108', 1600, 900),
    imageAlt: 'Handball match action',
    category: 'match-reports', sport: 'handball',
    author: 'Claudine Uwase', authorAvatar: ph('1239291', 100, 100),
    publishedAt: '2026-07-09T16:30:00Z', readTime: 3,
    featured: false, trending: false, breaking: false,
    tags: ['handball', 'cup', 'semifinal', 'APR', 'police'],
    views: 4120,
  },
  {
    id: 'n6', slug: 'star-striker-joins-kigali-queens',
    title: {
      en: 'Star Striker Nadia Uwase Completes Blockbuster Move to Kigali Queens',
      fr: 'L\'Attaquante Étoile Nadia Uwase Finalise un Transfert Coup d\'Éclat vers Kigali Queens',
      rw: 'Nadia Uwase, Umukinnyi w\'Ibitego, Yasezwe mu Kipe ya Kigali Queens',
    },
    excerpt: {
      en: 'The league\'s top scorer signs a two-year deal in the biggest transfer of the women\'s football window.',
      fr: 'La meilleure buteuse de la ligue signe un contrat de deux ans dans le plus gros transfert de la fenêtre du football féminin.',
      rw: 'Umukinnyi w\'ibitego byinshi mu makipe y\'abagore yasezwe amasezerano y\'imyaka ibiri mu buvanze bw\'umupira w\'amaguru.',
    },
    body: {
      en: 'In the marquee transfer of the women\'s football window, league top scorer Nadia Uwase has completed her move to Kigali Queens on a two-year contract. The deal, described by both clubs as record-setting, sees Uwase depart AS Kigali Women after four seasons.\n\nUwase, 24, has been the league\'s most prolific forward for three consecutive seasons, netting 67 goals in that span. Her arrival at Kigali Queens reunites her with head coach Eric Nshuti, who previously coached her at youth international level.\n\n"I\'m ready for a new challenge," Uwase said at her unveiling. "Kigali Queens have ambition, and I want to win trophies. The World Cup qualifiers are coming, and I need to be at my best." The transfer fee was undisclosed but reportedly a league record.',
      fr: 'Lors du transfert phare de la fenêtre du football féminin, la meilleure buteuse de la ligue Nadia Uwase a finalisé son transfert vers Kigali Queens avec un contrat de deux ans. Le transfert, décrit par les deux clubs comme un record, voit Uwase quitter AS Kigali Women après quatre saisons.\n\nUwase, 24 ans, a été la buteuse la plus prolifique de la ligue pendant trois saisons consécutives, marquant 67 buts sur cette période. Son arrivée à Kigali Queens la réunit avec l\'entraîneur-chef Eric Nshuti, qui l\'avait précédemment entraînée au niveau international des jeunes.\n\n"Je suis prête pour un nouveau défi", a déclaré Uwase lors de sa présentation. "Kigali Queens a de l\'ambition, et je veux gagner des trophées. Les qualifications pour la Coupe du Monde arrivent, et je dois être au meilleur de ma forme." Les frais de transfert n\'ont pas été divulgués mais seraient un record de la ligue.',
      rw: 'Mu buvanze bw\'umupira w\'amaguru w\'abagore, Nadia Uwase, umukinnyi w\'ibitego byinshi, yasezwe amasezerano y\'imyaka ibiri mu kipe ya Kigali Queens. Iki buvanze, cyavuzwe n\'amakipe yombi nk\'icya mbere, kizana Uwase ava mu kipe ya AS Kigali Women nyuma y\'imyaka ine.\n\nUwase, w\'imyaka 24, yari umukinnyi w\'ibitego byinshi mu makipe y\'abagore mu myaka itatu ikurikira, atuye ibitego 67. Ku kipe ya Kigali Queens azahura n\'umutoza Eric Nshuti, wari umutoze w\'urubyiruko rw\'amahanga.\n\n"Nditeguye icyizere gishya," Uwase yagize atyo ku munsi w\'amasezerano. "Kigali Queens ifite icyizere, kandi nshaka gutsinda ibihembo. Imikino y\'ibyangombwa by\'igikombe cy\'isi iri hafi, kandi nkeneye kuba mu buzima bwiza." Agaciro k\'iki buvanze ntikamenyekanye, ariko bivugwa ko ari agaciro k\'ibyiza.',
    },
    image: ph('114296', 1600, 900),
    imageAlt: 'Football player signing ceremony',
    category: 'transfers', sport: 'football',
    author: 'Mugisha Nshimiyimana', authorAvatar: ph('1681010', 100, 100),
    publishedAt: '2026-07-08T11:00:00Z', readTime: 3,
    featured: true, trending: true, breaking: true,
    tags: ['transfer', 'nadia-uwase', 'kigali-queens', 'football'],
    views: 15300,
  },
  {
    id: 'n7', slug: 'exclusive-interview-alice-mukamana',
    title: {
      en: 'Exclusive: Captain Alice Mukamana on Leadership, Legacy and the Next Generation',
      fr: 'Exclusif : La Capitaine Alice Mukamana sur le Leadership, l\'Héritage et la Génération Suivante',
      rw: 'Ibiganiro: Alice Mukamana, Umutware, ku Buyobozi, Ibyibutsa n\'Urubyiruko rw\'Aho Hasi',
    },
    excerpt: {
      en: 'The Kigali Queens and national team skipper opens up about carrying the weight of expectation.',
      fr: 'La capitaine de Kigali Queens et de l\'équipe nationale se confie sur le poids des attentes.',
      rw: 'Umutware wa Kigali Queens n\'u w\'u Rwanda avuga ku bw\'ibyangombwa by\'amahitamo.',
    },
    body: {
      en: 'Alice Mukamana has become synonymous with women\'s football in Rwanda. As captain of both Kigali Queens and the national team, the 27-year-old midfielder carries a weight that extends far beyond the pitch.\n\n"When I started, there were maybe fifty girls playing seriously in the whole country," she reflects. "Now we have a full league, academies, and girls who believe they can make a living from this sport. That\'s the legacy I care about most."\n\nIn a wide-ranging conversation, Mukamana discussed her journey from a schoolground in Musanze to the national captaincy, her philosophy of leadership, and why she has turned down offers to play abroad — at least for now.\n\n"I\'ve had opportunities to leave," she admits. "But I feel a responsibility here. The league is growing, and I want to be part of building something that lasts. When the time is right, I\'ll go. But not yet."',
      fr: 'Alice Mukamana est devenue synonyme de football féminin au Rwanda. En tant que capitaine de Kigali Queens et de l\'équipe nationale, la milieu de terrain de 27 ans porte un poids qui va bien au-delà du terrain.\n\n"Quand j\'ai commencé, il y avait peut-être cinquante filles qui jouaient sérieusement dans tout le pays", se souvient-elle. "Maintenant nous avons une ligue complète, des académies, et des filles qui croient qu\'elles peuvent gagner leur vie avec ce sport. C\'est l\'héritage qui me tient le plus à cœur."\n\nLors d\'une conversation approfondie, Mukamana a discuté de son parcours d\'un terrain d\'école à Musanze à la capitainerie nationale, de sa philosophie de leadership, et pourquoi elle a refusé des offres pour jouer à l\'étranger — du moins pour l\'instant.\n\n"J\'ai eu des opportunités de partir", admet-elle. "Mais je ressens une responsabilité ici. La ligue grandit, et je veux faire partie de la construction de quelque chose qui dure. Quand le moment sera venu, je partirai. Mais pas encore."',
      rw: 'Alice Mukamana yahuye n\'umupira w\'amaguru w\'abagore mu Rwanda. Nka mutware wa Kigali Queens n\'u w\'u Rwanda, w\'imyaka 27, y\'ibyangombwa byinshi cyane by\'amahitamo.\n\n"Nahatangiye, hari abakobwa bagera gatanu bagenda neza mu gihugu cyose," yibuka. "None hari irushanwa ryuzuye, amashuri, n\'abakobwa bemera ko bashobora kubaho biva muri iki kibuga. Ibi n\'ibyo nkunda cyane."\n\nMu biganiro byinshi, Mukamana yavuze ku buyobozi bwe kuva mu ishuri rya Musanze kugeza ku buyobozi bw\'igihugu, n\'aho atari yiyamamo gukina mu mahanga — byaba buri kanya.\n\n"Nahawe amahirwe yo guva," yemera. "Ariko nafite inshingano hano. Irushanwa rikura, kandi nshaka kuba mu bandi bahubwaho iby\'agaciro. Igihe kizira cyageze, nzaba nahuye. Ariko ntabwo bingana."',
    },
    image: ph('3621108', 1600, 900),
    imageAlt: 'Portrait of a female football captain',
    category: 'interviews', sport: 'football',
    author: 'Claudine Uwase', authorAvatar: ph('1239291', 100, 100),
    publishedAt: '2026-07-07T09:00:00Z', readTime: 6,
    featured: false, trending: false, breaking: false,
    tags: ['interview', 'alice-mukamana', 'captain', 'leadership'],
    views: 7210,
  },
  {
    id: 'n8', slug: 'sponsor-deal-announced',
    title: {
      en: 'Major Sponsor Signs Multi-Year Deal to Back Women\'s League',
      fr: 'Un Sponsor Majeur Signe un Accord Pluriannuel pour Soutenir la Ligue Féminine',
      rw: 'Umuterankungu Mukuru Yasabye Amasezerano y\'Imyaka Myinshi yo Gufasha Irushanwa ry\'Abagore',
    },
    excerpt: {
      en: 'The landmark partnership will fund prize money, equipment, and a national broadcast package.',
      fr: 'Le partenariat historique financera les prix, l\'équipement et un package de diffusion nationale.',
      rw: 'Iki bufatanya kiz\'iby\'agaciro kizashyigikira ibihembo, ibikoresho, n\'iby\'amakuru y\'igihugu.',
    },
    body: {
      en: 'ZT Media and the Rwanda Women\'s Sports Federation have announced a landmark multi-year sponsorship agreement with a leading telecommunications company, in what is being described as the largest commercial deal in the history of women\'s sport in Rwanda.\n\nThe agreement, valued at over 300 million Rwandan francs across three years, will fund increased prize money across all sports, equipment grants for grassroots clubs, and a national television broadcast package that will see matches televised weekly for the first time.\n\n"This is a transformative moment," said federation president Beatrice Mukasine. "For the first time, our athletes will compete for prize money that reflects their talent and dedication. And the broadcast deal means millions of Rwandans can follow the league from home."',
      fr: 'ZT Media et la Fédération Rwandaise des Sports Féminins ont annoncé un accord de sponsoring pluriannuel historique avec une entreprise de télécommunications de premier plan, dans ce qui est décrit comme la plus grande transaction commerciale de l\'histoire du sport féminin au Rwanda.\n\nL\'accord, évalué à plus de 300 millions de francs rwandais sur trois ans, financera l\'augmentation des prix dans tous les sports, des subventions d\'équipement pour les clubs de base, et un package de diffusion télévisée nationale qui permettra de téléviser des matchs chaque semaine pour la première fois.\n\n"C\'est un moment transformateur", a déclaré la présidente de la fédération Beatrice Mukasine. "Pour la première fois, nos athlètes concourront pour des prix qui reflètent leur talent et leur dévouement. Et l\'accord de diffusion signifie que des millions de Rwandais peuvent suivre la ligue depuis chez eux."',
      rw: 'ZT Media n\'Ishyirahamwe ry\'Imikino y\'Abagore mu Rwanda byatangajeho amasezerano y\'imyaka myinshi y\'umuterankungu n\'ikigo cy\'itumanaho, mu buvanze bw\'agaciro karenze mu mateka y\'imikino y\'abagore mu Rwanda.\n\nAmasezerano, y\'agaciro k\'amafaranga 300 milioni y\'u Rwanda mu myaka itatu, azashyigikira ibihembo byinshi mu mikino yose, ibikoresho by\'amakipe y\'imyitozo, n\'amakuru y\'imiryango y\'igihugu azatumira imikino ikorwa buri cyumweru ku nshuro ya mbere.\n\n"Iki ni ikibanza cy\'agaciro," Beatrice Mukasine, umutware w\'ishyirahamwe, yagize atyo. "Ku nshuro ya mbere, abakinnyi bacu bazahatanira ibihembo by\'agaciro k\'ubuhanga n\'ubwitabwaho. Kandi amasezerano y\'amakuru bizatuma abanyarwanda miriyoni bakurikirane irushanwa bava mu ngo zabo."',
    },
    image: ph('3184465', 1600, 900),
    imageAlt: 'Sponsorship signing ceremony',
    category: 'sponsorship', sport: 'football',
    author: 'Mugisha Nshimiyimana', authorAvatar: ph('1681010', 100, 100),
    publishedAt: '2026-07-06T14:00:00Z', readTime: 3,
    featured: false, trending: false, breaking: false,
    tags: ['sponsorship', 'federation', 'broadcast', 'partnership'],
    views: 6340,
  },
];

const logoSquare = (text: string, color: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><rect width='120' height='120' rx='24' fill='${color}'/><text x='60' y='76' font-family='Arial' font-size='44' font-weight='bold' fill='white' text-anchor='middle'>${text}</text></svg>`
  )}`;

export const teams: Team[] = [
  {
    id: 't1', slug: 'kigali-queens', name: 'Kigali Queens', shortName: 'KGQ', sport: 'football',
    city: 'Kigali', founded: 2015, stadium: 'Amahoro Stadium', coach: 'Eric Nshuti',
    primaryColor: '#F4B400', logo: logoSquare('KQ', '#F4B400'), logoText: 'KQ',
    description: {
      en: 'Kigali Queens are the most decorated women\'s football club in Rwanda, with five league titles and two cup victories. Founded in 2015, the club has become a trailblazer for the women\'s game, pioneering youth development and professional standards.',
      fr: 'Kigali Queens est le club de football féminin le plus titré du Rwanda, avec cinq titres de championnat et deux victoires en coupe. Fondé en 2015, le club est devenu un pionnier du football féminin, inaugurant le développement des jeunes et les standards professionnels.',
      rw: 'Kigali Queens ni ikipe y\'umupira w\'amaguru y\'abagore ifite ibihembo byinshi mu Rwanda, ifite ibihembo bitanu by\'irushanwa n\'iby\'igikombe bitatu. Yatangiye mu 2015, ikaba yarahaye umupira w\'abagore agaciro, ibumbaye urubyiruko n\'uburyo bw\'imyitozo.',
    },
    achievements: ['League Champions 2017, 2019, 2021, 2023, 2025', 'Cup Winners 2018, 2024', 'Super Cup 2023'],
  },
  {
    id: 't2', slug: 'as-kigali-women', name: 'AS Kigali Women', shortName: 'ASK', sport: 'football',
    city: 'Kigali', founded: 2012, stadium: 'Kigali Pele Stadium', coach: 'Jean Baptiste Kayumba',
    primaryColor: '#3b82f6', logo: logoSquare('AS', '#3b82f6'), logoText: 'AS',
    description: {
      en: 'AS Kigali Women are the traditional rivals of Kigali Queens and a perennial contender for honours. Known for their attacking philosophy, they have produced several national team players.',
      fr: 'AS Kigali Women sont les rivales traditionnelles de Kigali Queens et une prétendante perpétuelle aux honneurs. Connues pour leur philosophie offensive, elles ont produit plusieurs joueuses de l\'équipe nationale.',
      rw: 'AS Kigali Women ni abakinnyi ba Kigali Queens mu mikino yose kandi bakaba bakomeye cyane mu gutuma ibihembo. Baziwe ku buryo bw\'ibitego, bimaze guhanga abakinnyi benshi b\'igihugu.',
    },
    achievements: ['League Champions 2016, 2018, 2020', 'Cup Winners 2017, 2022'],
  },
  {
    id: 't3', slug: 'muhanga-women', name: 'Muhanga Women', shortName: 'MUH', sport: 'football',
    city: 'Muhanga', founded: 2018, stadium: 'Muhanga Stadium', coach: 'Solange Tuyisenge',
    primaryColor: '#22c55e', logo: logoSquare('MU', '#22c55e'), logoText: 'MU',
    description: {
      en: 'Muhanga Women represent the Southern Province with pride and have rapidly risen through the ranks to establish themselves as a competitive top-flight side.',
      fr: 'Muhanga Women représentent la Province du Sud avec fierté et ont rapidement gravi les échelons pour s\'établir comme une équipe compétitive de première division.',
      rw: 'Muhanga Women batura mu Ntara y\'Amajyepfo y\'agaciro kandi byo byose byabatumire bahitamwo gukora mu makipe y\'icyiciro cya mbere.',
    },
    achievements: ['Promoted to top flight 2020', 'Cup Semifinalists 2023'],
  },
  {
    id: 't4', slug: 'patriots-women-basketball', name: 'Patriots Women', shortName: 'PAT', sport: 'basketball',
    city: 'Kigali', founded: 2014, stadium: 'Petit Stade', coach: 'Dieudonné Bizimana',
    primaryColor: '#f97316', logo: logoSquare('PW', '#f97316'), logoText: 'PW',
    description: {
      en: 'Patriots Women are the defending basketball league champions and the most successful franchise in the competition\'s history with four titles.',
      fr: 'Patriots Women sont les championnes en titre de la ligue de basketball et la franchise la plus titrée de l\'histoire de la compétition avec quatre titres.',
      rw: 'Patriots Women ni abanyamabanga b\'ibyiciro by\'umupira w\'amaguru w\'ibibando n\'ikipe y\'ibihembo byinshi mu mateka y\'irushanwa, ifite ibihembo bine.',
    },
    achievements: ['League Champions 2021, 2022, 2023, 2025', 'Cup Winners 2024'],
  },
  {
    id: 't5', slug: 'apr-volleyball-queens', name: 'APR Volleyball Queens', shortName: 'APR', sport: 'volleyball',
    city: 'Kigali', founded: 2010, stadium: 'Kigali Arena', coach: 'Patrick Mazimaka',
    primaryColor: '#ef4444', logo: logoSquare('AP', '#ef4444'), logoText: 'AP',
    description: {
      en: 'APR Volleyball Queens are chasing an historic third consecutive title and are widely regarded as the strongest women\'s volleyball program in East Africa.',
      fr: 'APR Volleyball Queens poursuivent un troisième titre consécutif historique et sont largement considérées comme le programme de volleyball féminin le plus fort d\'Afrique de l\'Est.',
      rw: 'APR Volleyball Queens bagerageza kwatsinda igihembo cya gatatu k\'umunani gato kandi bakaba bazwi nk\'urubyiruko rw\'abagore rw\'ibibando rw\'agaciro karenze mu karere k\'iburasirazuba bwa Afurika.',
    },
    achievements: ['League Champions 2024, 2025 (seeking 2026 three-peat)', 'Cup Winners 2023, 2025'],
  },
  {
    id: 't6', slug: 'police-handball', name: 'Police Handball', shortName: 'POL', sport: 'handball',
    city: 'Kigali', founded: 2008, stadium: 'Kigali Arena', coach: 'Alfred Rwaribiwugugu',
    primaryColor: '#a855f7', logo: logoSquare('PH', '#a855f7'), logoText: 'PH',
    description: {
      en: 'Police Handball are the top-seeded side in the national cup and have been a consistent force in the women\'s handball league for over a decade.',
      fr: 'Police Handball est l\'équipe la mieux classée de la coupe nationale et a été une force constante de la ligue de handball féminin pendant plus d\'une décennie.',
      rw: 'Police Handball ni ikipe y\'icyiciro cya mbere mu igikombe cy\'igihugu kandi ikaba yari ikipe ikomeye mu irushanwa ry\'abagore ry\'ibibando mu myaka irenze icumi.',
    },
    achievements: ['League Champions 2022, 2024', 'Cup Winners 2021, 2023'],
  },
];

export const players: Player[] = [
  {
    id: 'p1', slug: 'alice-mukamana', name: 'Alice Mukamana', teamId: 't1', teamName: 'Kigali Queens',
    sport: 'football', position: 'Midfielder / Captain', shirtNumber: 8, nationality: 'Rwanda', flag: '🇷🇼',
    age: 27, height: '1.68m', photo: ph('733872', 600, 600),
    bio: {
      en: 'Alice Mukamana is the captain of Kigali Queens and the Rwanda women\'s national team. A commanding midfielder known for her leadership and vision, she has been the beating heart of every team she has played for since making her senior debut at 17.',
      fr: 'Alice Mukamana est la capitaine de Kigali Queens et de l\'équipe nationale féminine du Rwanda. Milieu de terrain de commandement connue pour son leadership et sa vision, elle a été le cœur battant de chaque équipe pour laquelle elle a joué depuis ses débuts seniors à 17 ans.',
      rw: 'Alice Mukamana ni umutware wa Kigali Queens n\'u w\'u Rwanda w\'abagore. Ni umukinnyi w\'ibangamiwe w\'umutima w\'ikipe buri yahuye kuva yatangiye gukina n\'abakuru ku myaka 17.',
    },
    achievements: ['5x League Champion', '2x Cup Winner', 'National Team Captain', 'League MVP 2023'],
    stats: [
      { label: { en: 'Appearances', fr: 'Apparitions', rw: 'Imikino' }, value: '142' },
      { label: { en: 'Goals', fr: 'Buts', rw: 'Ibitego' }, value: '38' },
      { label: { en: 'Assists', fr: 'Passes Décisives', rw: 'Ubufasha' }, value: '52' },
      { label: { en: 'Trophies', fr: 'Trophées', rw: 'Ibihembo' }, value: '7' },
    ],
    social: [{ platform: 'twitter', handle: '@alice_mukamana' }, { platform: 'instagram', handle: '@alice.mukamana' }],
    featured: true,
  },
  {
    id: 'p2', slug: 'nadia-uwase', name: 'Nadia Uwase', teamId: 't1', teamName: 'Kigali Queens',
    sport: 'football', position: 'Striker', shirtNumber: 9, nationality: 'Rwanda', flag: '🇷🇼',
    age: 24, height: '1.72m', photo: ph('434840', 600, 600),
    bio: {
      en: 'Nadia Uwase is the league\'s most prolific striker, having netted 67 goals across three seasons. Newly signed by Kigali Queens, her pace and finishing make her one of the most feared forwards in East Africa.',
      fr: 'Nadia Uwase est la buteuse la plus prolifique de la ligue, ayant marqué 67 buts en trois saisons. Récemment signée par Kigali Queens, sa vitesse et sa finition font d\'elle l\'une des attaquantes les plus redoutées d\'Afrique de l\'Est.',
      rw: 'Nadia Uwase ni umukinnyi w\'ibitego byinshi mu makipe yose, atuye ibitego 67 mu myaka itatu. Yasezwe na Kigali Queens ku nshuro ya mbere, umuvuduko n\'ubumenyi bwe bwo gutuma ibitego bimutuma aba umwe mu bakinnyi batsindwa n\'amakipe y\'iburasirazuba bwa Afurika.',
    },
    achievements: ['3x League Top Scorer', '67 goals in 3 seasons', 'New signing 2026'],
    stats: [
      { label: { en: 'Appearances', fr: 'Apparitions', rw: 'Imikino' }, value: '89' },
      { label: { en: 'Goals', fr: 'Buts', rw: 'Ibitego' }, value: '67' },
      { label: { en: 'Assists', fr: 'Passes Décisives', rw: 'Ubufasha' }, value: '24' },
      { label: { en: 'Goals per game', fr: 'Buts par match', rw: 'Ibitego ku mukino' }, value: '0.75' },
    ],
    social: [{ platform: 'instagram', handle: '@nadia.uwase' }],
    featured: true,
  },
  {
    id: 'p3', slug: 'sylvie-iradukunda', name: 'Sylvie Iradukunda', teamId: 't5', teamName: 'APR Volleyball Queens',
    sport: 'volleyball', position: 'Opposite Hitter', shirtNumber: 7, nationality: 'Rwanda', flag: '🇷🇼',
    age: 23, height: '1.82m', photo: ph('3621111', 600, 600),
    bio: {
      en: 'Sylvie Iradukunda is the leading scorer of the women\'s volleyball league and the attacking fulcrum of the APR dynasty. Her thunderous spikes and competitive fire have made her a fan favourite.',
      fr: 'Sylvie Iradukunda est la meilleure marqueuse de la ligue de volleyball féminin et l\'axe offensif de la dynastie APR. Ses smashs puissants et son esprit de compétition en font une favorite des fans.',
      rw: 'Sylvie Iradukunda ni umukinnyi w\'ibitego byinshi mu makipe y\'abagore y\'ibibando kandi akaba we ubuhanga bwa APR. Ibitego bye by\'umuvuduko n\'umutima we wo guhangana bimutuma abafana bamukunda.',
    },
    achievements: ['League MVP 2025', '2x League Champion', 'Leading Scorer 2025-26'],
    stats: [
      { label: { en: 'Matches', fr: 'Matchs', rw: 'Imikino' }, value: '78' },
      { label: { en: 'Points', fr: 'Points', rw: 'Ibitego' }, value: '1,247' },
      { label: { en: 'Spikes', fr: 'Smashs', rw: 'Imanuka' }, value: '892' },
      { label: { en: 'Blocks', fr: 'Contres', rw: 'Ibikingi' }, value: '134' },
    ],
    social: [{ platform: 'instagram', handle: '@sylvie.iradukunda' }],
    featured: true,
  },
  {
    id: 'p4', slug: 'salima-nyiraneza', name: 'Salima Nyiraneza', teamId: '', teamName: 'Individual',
    sport: 'athletics', position: 'Distance Runner (5000m / 10000m)', shirtNumber: 0, nationality: 'Rwanda', flag: '🇷🇼',
    age: 21, height: '1.65m', photo: ph('4498293', 600, 600),
    bio: {
      en: 'Salima Nyiraneza is a history-making distance runner who shattered the Rwandan national 5000m record at just 21 years old. Hailing from Musanze, she represents the bright future of Rwandan athletics on the world stage.',
      fr: 'Salima Nyiranezana est une coureuse de fond qui a fait l\'histoire en pulvérisant le record national rwandais du 5000m à seulement 21 ans. Originaire de Musanze, elle représente l\'avenir radieux de l\'athlétisme rwandais sur la scène mondiale.',
      rw: 'Salima Nyiranezana ni umukinnyi w\'ibyiza by\'umubiri w\'amateka waguze agaciro k\'igihugu cy\'u Rwanda mu 5000m ku myaka 21 gusa. Uva i Musanze, ahagarariye ejo hazaza h\'ibyiza by\'umubiri by\'u Rwanda ku rwego rw\'isi.',
    },
    achievements: ['National Record Holder 5000m (14:52.31)', 'Kigali International Meet Champion 2026'],
    stats: [
      { label: { en: '5000m PB', fr: '5000m RP', rw: '5000m' }, value: '14:52.31' },
      { label: { en: '10000m PB', fr: '10000m RP', rw: '10000m' }, value: '31:44.09' },
      { label: { en: 'Races', fr: 'Courses', rw: 'Imikino' }, value: '23' },
      { label: { en: 'Wins', fr: 'Victoires', rw: 'Ibyo yatsindiye' }, value: '15' },
    ],
    social: [{ platform: 'twitter', handle: '@salima_runs' }],
    featured: true,
  },
];

export const matches: Match[] = [
  {
    id: 'm1', sport: 'football', homeTeamId: 't1', homeTeamName: 'Kigali Queens', homeTeamLogo: logoSquare('KQ', '#F4B400'),
    awayTeamId: 't2', awayTeamName: 'AS Kigali Women', awayTeamLogo: logoSquare('AS', '#3b82f6'),
    homeScore: 2, awayScore: 1, date: '2026-07-13', time: '15:00', venue: 'Amahoro Stadium',
    status: 'finished', league: 'Women\'s Football League', matchweek: 24,
    events: [
      { minute: 34, type: 'goal', team: 'away', player: 'Nadia Uwase' },
      { minute: 58, type: 'goal', team: 'home', player: 'Grace Ingabire' },
      { minute: 90, type: 'goal', team: 'home', player: 'Alice Mukamana', detail: 'Header from corner' },
      { minute: 90, type: 'mvp', team: 'home', player: 'Alice Mukamana' },
    ],
    mvp: 'Alice Mukamana',
  },
  {
    id: 'm2', sport: 'basketball', homeTeamId: 't4', homeTeamName: 'Patriots Women', homeTeamLogo: logoSquare('PW', '#f97316'),
    awayTeamId: 't1', awayTeamName: 'Eastern Eagles', awayTeamLogo: logoSquare('EE', '#10b981'),
    homeScore: 78, awayScore: 65, date: '2026-07-12', time: '14:00', venue: 'Petit Stade',
    status: 'finished', league: 'Women\'s Basketball League', matchweek: 1,
  },
  {
    id: 'm3', sport: 'volleyball', homeTeamId: 't5', homeTeamName: 'APR Volleyball Queens', homeTeamLogo: logoSquare('AP', '#ef4444'),
    awayTeamId: 't1', awayTeamName: 'RRA Volleyball', awayTeamLogo: logoSquare('RR', '#6366f1'),
    homeScore: 3, awayScore: 1, date: '2026-07-11', time: '18:00', venue: 'Kigali Arena',
    status: 'finished', league: 'Women\'s Volleyball League', matchweek: 15,
  },
  {
    id: 'm4', sport: 'handball', homeTeamId: 't6', homeTeamName: 'Police Handball', homeTeamLogo: logoSquare('PH', '#a855f7'),
    awayTeamId: 't1', awayTeamName: 'Muhanga Women', awayTeamLogo: logoSquare('MU', '#22c55e'),
    homeScore: 28, awayScore: 19, date: '2026-07-10', time: '16:00', venue: 'Kigali Arena',
    status: 'finished', league: 'Women\'s Handball Cup', matchweek: 0,
  },
  {
    id: 'm5', sport: 'football', homeTeamId: 't3', homeTeamName: 'Muhanga Women', homeTeamLogo: logoSquare('MU', '#22c55e'),
    awayTeamId: 't1', awayTeamName: 'Kigali Queens', awayTeamLogo: logoSquare('KQ', '#F4B400'),
    homeScore: null, awayScore: null, date: '2026-07-20', time: '15:00', venue: 'Muhanga Stadium',
    status: 'upcoming', league: 'Women\'s Football League', matchweek: 25,
  },
  {
    id: 'm6', sport: 'basketball', homeTeamId: 't1', homeTeamName: 'Eastern Eagles', homeTeamLogo: logoSquare('EE', '#10b981'),
    awayTeamId: 't4', awayTeamName: 'Patriots Women', awayTeamLogo: logoSquare('PW', '#f97316'),
    homeScore: null, awayScore: null, date: '2026-07-19', time: '14:00', venue: 'Petit Stade',
    status: 'upcoming', league: 'Women\'s Basketball League', matchweek: 2,
  },
  {
    id: 'm7', sport: 'volleyball', homeTeamId: 't5', homeTeamName: 'APR Volleyball Queens', homeTeamLogo: logoSquare('AP', '#ef4444'),
    awayTeamId: 't1', awayTeamName: 'INATEK Women', awayTeamLogo: logoSquare('IN', '#0ea5e9'),
    homeScore: null, awayScore: null, date: '2026-07-18', time: '18:00', venue: 'Kigali Arena',
    status: 'upcoming', league: 'Women\'s Volleyball League Playoffs', matchweek: 0,
  },
  {
    id: 'm8', sport: 'handball', homeTeamId: 't6', homeTeamName: 'Police Handball', homeTeamLogo: logoSquare('PH', '#a855f7'),
    awayTeamId: 't1', awayTeamName: 'APR Handball', awayTeamLogo: logoSquare('AH', '#f59e0b'),
    homeScore: null, awayScore: null, date: '2026-07-21', time: '16:00', venue: 'Kigali Arena',
    status: 'upcoming', league: 'Women\'s Handball Cup Semifinal', matchweek: 0,
  },
];

export const standings: Record<string, StandingRow[]> = {
  football: [
    { position: 1, teamId: 't1', teamName: 'Kigali Queens', teamLogo: logoSquare('KQ', '#F4B400'), played: 24, won: 21, drawn: 2, lost: 1, goalsFor: 72, goalsAgainst: 14, goalDifference: 58, points: 65, form: ['W', 'W', 'W', 'W', 'D'] },
    { position: 2, teamId: 't2', teamName: 'AS Kigali Women', teamLogo: logoSquare('AS', '#3b82f6'), played: 24, won: 18, drawn: 3, lost: 3, goalsFor: 61, goalsAgainst: 21, goalDifference: 40, points: 57, form: ['W', 'L', 'W', 'W', 'W'] },
    { position: 3, teamId: 't3', teamName: 'Muhanga Women', teamLogo: logoSquare('MU', '#22c55e'), played: 24, won: 13, drawn: 5, lost: 6, goalsFor: 44, goalsAgainst: 30, goalDifference: 14, points: 44, form: ['W', 'D', 'W', 'L', 'W'] },
    { position: 4, teamId: 't1', teamName: 'Ruhango WFC', teamLogo: logoSquare('RU', '#ec4899'), played: 24, won: 11, drawn: 4, lost: 9, goalsFor: 38, goalsAgainst: 32, goalDifference: 6, points: 37, form: ['L', 'W', 'D', 'W', 'L'] },
    { position: 5, teamId: 't1', teamName: 'Nyanza WFC', teamLogo: logoSquare('NY', '#8b5cf6'), played: 24, won: 9, drawn: 3, lost: 12, goalsFor: 29, goalsAgainst: 41, goalDifference: -12, points: 30, form: ['L', 'L', 'W', 'L', 'W'] },
    { position: 6, teamId: 't1', teamName: 'Rubavu Queens', teamLogo: logoSquare('RB', '#14b8a6'), played: 24, won: 6, drawn: 2, lost: 16, goalsFor: 22, goalsAgainst: 54, goalDifference: -32, points: 20, form: ['L', 'L', 'L', 'W', 'L'] },
  ],
  basketball: [
    { position: 1, teamId: 't4', teamName: 'Patriots Women', teamLogo: logoSquare('PW', '#f97316'), played: 1, won: 1, drawn: 0, lost: 0, goalsFor: 78, goalsAgainst: 65, goalDifference: 13, points: 2, form: ['W'] },
    { position: 2, teamId: 't1', teamName: 'Regal WBBC', teamLogo: logoSquare('RG', '#06b6d4'), played: 1, won: 1, drawn: 0, lost: 0, goalsFor: 72, goalsAgainst: 60, goalDifference: 12, points: 2, form: ['W'] },
    { position: 3, teamId: 't1', teamName: 'RP-IPRC WBBC', teamLogo: logoSquare('RP', '#84cc16'), played: 1, won: 0, drawn: 0, lost: 1, goalsFor: 60, goalsAgainst: 72, goalDifference: -12, points: 0, form: ['L'] },
    { position: 4, teamId: 't1', teamName: 'Eastern Eagles', teamLogo: logoSquare('EE', '#10b981'), played: 1, won: 0, drawn: 0, lost: 1, goalsFor: 65, goalsAgainst: 78, goalDifference: -13, points: 0, form: ['L'] },
  ],
};

export const socialPosts: SocialPost[] = [
  { id: 'so1', platform: 'twitter', author: 'ZT Media', handle: '@ztmedia_rw', avatar: ph('1239291', 80, 80), content: 'WHAT. A. FINAL. 🏆 Kigali Queens snatch victory from the jaws of defeat with a stoppage-time winner from captain Alice Mukamana! An unforgettable night at Amahoro Stadium. #RWomensFootball', likes: 3420, comments: 187, shares: 890, timestamp: '2h ago', category: 'match' },
  { id: 'so2', platform: 'instagram', author: 'Kigali Queens', handle: '@kigaliqueensfc', avatar: ph('733872', 80, 80), content: 'Champions again. Champions always. Thank you to the 18,000 who made Amahoro shake tonight. This is for you. 🏆💛', image: ph('114296', 600, 600), likes: 8920, comments: 432, shares: 210, timestamp: '5h ago', category: 'official' },
  { id: 'so3', platform: 'twitter', author: 'Nadia Uwase', handle: '@nadia_uwase9', avatar: ph('434840', 80, 80), content: 'Proud to announce I\'ve joined @kigaliqueensfc. A new chapter, a new challenge. Let\'s make history together. 💛⚽ #KigaliQueens', likes: 5670, comments: 312, shares: 1450, timestamp: '1d ago', category: 'latest' },
  { id: 'so4', platform: 'youtube', author: 'ZT Media Sports', handle: 'ZT Media Sports', avatar: ph('1681010', 80, 80), content: 'FULL HIGHLIGHTS: Kigali Queens 2-1 AS Kigali Women | Championship Final 2026. All the drama, all the emotion.', image: ph('274506', 600, 340), likes: 12400, comments: 890, shares: 2100, timestamp: '6h ago', category: 'match' },
  { id: 'so5', platform: 'instagram', author: 'Salima Nyiraneza', handle: '@salima_runs', avatar: ph('4498293', 80, 80), content: '14:52.31. A new national record. A dream come true. Thank you Kigali, thank you Rwanda. 🇷🇼🏃‍♀️ The journey continues.', image: ph('4498293', 600, 600), likes: 6780, comments: 234, shares: 567, timestamp: '2d ago', category: 'latest' },
  { id: 'so6', platform: 'facebook', author: 'Rwanda Women\'s Sports Federation', handle: 'RWSF', avatar: ph('3184465', 80, 80), content: 'Historic sponsorship deal announced today. 300 million RWF over three years to transform women\'s sport in Rwanda. This is just the beginning. 💛', likes: 4560, comments: 189, shares: 780, timestamp: '3d ago', category: 'official' },
];

export const sponsors: Sponsor[] = [
  { id: 'sp1', name: 'RwandaTel', tier: 'platinum', logoText: 'RT', website: '#' },
  { id: 'sp2', name: 'Bank of Kigali', tier: 'platinum', logoText: 'BK', website: '#' },
  { id: 'sp3', name: 'Bralirwa', tier: 'gold', logoText: 'BR', website: '#' },
  { id: 'sp4', name: 'MTN Rwanda', tier: 'gold', logoText: 'MTN', website: '#' },
  { id: 'sp5', name: 'Inyange Industries', tier: 'gold', logoText: 'IN', website: '#' },
  { id: 'sp6', name: 'Radio 10', tier: 'silver', logoText: 'R10', website: '#' },
  { id: 'sp7', name: 'KBS', tier: 'silver', logoText: 'KBS', website: '#' },
  { id: 'sp8', name: 'Cimerwa', tier: 'silver', logoText: 'CM', website: '#' },
];

export const navigation: NavigationItem[] = [
  { label: { en: 'Home', fr: 'Accueil', rw: 'Ahabanza' }, href: '/' },
  {
    label: { en: 'Sports', fr: 'Sports', rw: 'Imikino' }, href: '/sports',
    children: sports.map(s => ({ label: s.name, href: `/sports/${s.slug}` })),
  },
  { label: { en: 'News', fr: 'Actualités', rw: 'Amakuru' }, href: '/news' },
  { label: { en: 'Fixtures', fr: 'Calendrier', rw: 'Igenabihe' }, href: '/fixtures' },
  { label: { en: 'Standings', fr: 'Classements', rw: 'Ibyiringiro' }, href: '/standings' },
  { label: { en: 'Teams', fr: 'Équipes', rw: 'Amakipe' }, href: '/teams' },
  { label: { en: 'Players', fr: 'Joueuses', rw: 'Abakinnyi' }, href: '/players' },
  { label: { en: 'About', fr: 'À Propos', rw: 'Ibyerekeye' }, href: '/about' },
];

export const trendingNews = news.filter(n => n.trending);
export const featuredNews = news.filter(n => n.featured);
export const breakingNews = news.filter(n => n.breaking);
export const latestResults = matches.filter(m => m.status === 'finished');
export const upcomingFixtures = matches.filter(m => m.status === 'upcoming');
export const featuredPlayers = players.filter(p => p.featured);
