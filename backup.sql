--
-- PostgreSQL database dump
--

\restrict UvIEpiMW82lwwGocOPph2FuSsufbhpNc1ETHjvjgWi2Yr5xnDNBOZNGlnMGlgZu

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    name text NOT NULL,
    role text DEFAULT 'editor'::text,
    password_hash text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT admin_users_role_check CHECK ((role = ANY (ARRAY['super_admin'::text, 'admin'::text, 'editor'::text])))
);


--
-- Name: contact_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    subject text DEFAULT ''::text,
    body text NOT NULL,
    status text DEFAULT 'unread'::text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT contact_messages_status_check CHECK ((status = ANY (ARRAY['unread'::text, 'read'::text, 'archived'::text])))
);


--
-- Name: leagues; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leagues (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sport_id uuid,
    slug text NOT NULL,
    name text NOT NULL,
    season text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: match_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.match_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    match_id uuid,
    minute integer NOT NULL,
    event_type text NOT NULL,
    team_side text NOT NULL,
    player_name text NOT NULL,
    detail text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT match_events_event_type_check CHECK ((event_type = ANY (ARRAY['goal'::text, 'yellow'::text, 'red'::text, 'sub'::text, 'mvp'::text]))),
    CONSTRAINT match_events_team_side_check CHECK ((team_side = ANY (ARRAY['home'::text, 'away'::text])))
);


--
-- Name: matches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.matches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sport_id uuid,
    league_id uuid,
    home_team_id uuid,
    away_team_id uuid,
    home_team_name text NOT NULL,
    away_team_name text NOT NULL,
    home_team_logo text,
    away_team_logo text,
    home_score integer,
    away_score integer,
    match_date date NOT NULL,
    match_time text,
    venue text,
    status text DEFAULT 'upcoming'::text,
    league_name text,
    matchweek integer DEFAULT 0,
    mvp text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT matches_status_check CHECK ((status = ANY (ARRAY['upcoming'::text, 'live'::text, 'finished'::text])))
);


--
-- Name: news_articles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.news_articles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    category text NOT NULL,
    sport_slug text,
    author text NOT NULL,
    author_avatar text,
    image_url text,
    image_alt text,
    published_at timestamp with time zone DEFAULT now(),
    read_time integer DEFAULT 3,
    is_featured boolean DEFAULT false,
    is_trending boolean DEFAULT false,
    is_breaking boolean DEFAULT false,
    status text DEFAULT 'published'::text,
    tags jsonb DEFAULT '[]'::jsonb,
    views integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT news_articles_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'scheduled'::text, 'published'::text])))
);


--
-- Name: news_translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.news_translations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    article_id uuid,
    locale text NOT NULL,
    title text NOT NULL,
    excerpt text NOT NULL,
    body text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT news_translations_locale_check CHECK ((locale = ANY (ARRAY['en'::text, 'fr'::text, 'rw'::text])))
);


--
-- Name: newsletter_subscribers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.newsletter_subscribers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    is_active boolean DEFAULT true,
    source text DEFAULT 'website'::text,
    subscribed_at timestamp with time zone DEFAULT now(),
    CONSTRAINT newsletter_subscribers_source_check CHECK ((source = ANY (ARRAY['website'::text, 'social'::text])))
);


--
-- Name: page_views; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.page_views (
    id bigint NOT NULL,
    path text NOT NULL,
    viewed_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: page_views_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.page_views_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: page_views_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.page_views_id_seq OWNED BY public.page_views.id;


--
-- Name: players; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.players (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    team_id uuid,
    sport_id uuid,
    slug text NOT NULL,
    name text NOT NULL,
    "position" text,
    shirt_number integer,
    nationality text,
    flag text,
    age integer,
    height text,
    photo_url text,
    bio text,
    achievements jsonb DEFAULT '[]'::jsonb,
    stats jsonb DEFAULT '[]'::jsonb,
    social_links jsonb DEFAULT '[]'::jsonb,
    is_featured boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: social_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.social_posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    platform text NOT NULL,
    author text NOT NULL,
    handle text,
    avatar_url text,
    content text NOT NULL,
    image_url text,
    likes integer DEFAULT 0,
    comments integer DEFAULT 0,
    shares integer DEFAULT 0,
    category text DEFAULT 'latest'::text,
    posted_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    tweet_url text,
    CONSTRAINT social_posts_category_check CHECK ((category = ANY (ARRAY['latest'::text, 'fan'::text, 'match'::text, 'official'::text]))),
    CONSTRAINT social_posts_platform_check CHECK ((platform = ANY (ARRAY['twitter'::text, 'instagram'::text, 'facebook'::text, 'youtube'::text, 'tiktok'::text])))
);


--
-- Name: sponsors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sponsors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    tier text DEFAULT 'silver'::text,
    logo_text text,
    logo_url text,
    website text,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT sponsors_tier_check CHECK ((tier = ANY (ARRAY['platinum'::text, 'gold'::text, 'silver'::text])))
);


--
-- Name: sports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    icon text DEFAULT 'Trophy'::text,
    color text DEFAULT '#F4B400'::text,
    team_count integer DEFAULT 0,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: standings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.standings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sport_id uuid,
    league_id uuid,
    team_id uuid,
    "position" integer NOT NULL,
    team_name text NOT NULL,
    team_logo text,
    played integer DEFAULT 0,
    won integer DEFAULT 0,
    drawn integer DEFAULT 0,
    lost integer DEFAULT 0,
    goals_for integer DEFAULT 0,
    goals_against integer DEFAULT 0,
    goal_difference integer DEFAULT 0,
    points integer DEFAULT 0,
    form jsonb DEFAULT '[]'::jsonb,
    season text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: teams; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teams (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sport_id uuid,
    slug text NOT NULL,
    name text NOT NULL,
    short_name text,
    city text,
    founded integer,
    stadium text,
    coach text,
    primary_color text DEFAULT '#F4B400'::text,
    logo_url text,
    description text,
    achievements jsonb DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: page_views id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_views ALTER COLUMN id SET DEFAULT nextval('public.page_views_id_seq'::regclass);


--
-- Data for Name: admin_users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_users (id, email, name, role, password_hash, is_active, created_at, updated_at) FROM stdin;
11d4754f-5f2f-4b04-9b84-18f961ace194	admin@zetalentmedia.com	ZeTalent Admin	super_admin	$2a$12$Th/Ye/bRLXalfc.AJi76U.ZSezgPup20P1xrK3/SalsJEecqppxUm	t	2026-07-15 16:21:55.975052+02	2026-07-15 16:21:55.975052+02
\.


--
-- Data for Name: contact_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contact_messages (id, name, email, subject, body, status, created_at) FROM stdin;
\.


--
-- Data for Name: leagues; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.leagues (id, sport_id, slug, name, season, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: match_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.match_events (id, match_id, minute, event_type, team_side, player_name, detail, created_at) FROM stdin;
\.


--
-- Data for Name: matches; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.matches (id, sport_id, league_id, home_team_id, away_team_id, home_team_name, away_team_name, home_team_logo, away_team_logo, home_score, away_score, match_date, match_time, venue, status, league_name, matchweek, mvp, created_at, updated_at) FROM stdin;
1cfc52fa-617f-48c5-93c2-25bcb3b0a16e	93895e8c-23d4-42c6-b21b-85136be9c5f0	\N	4611dcd2-1360-44e3-ab96-23d936ec808e	96279409-97a7-41ac-88bb-11b88a5da012	A kigali Queens	Rayon Sport	http://localhost:4000/uploads/1784215719079-nmb6sywjtk.png	http://localhost:4000/uploads/1784215434409-b40vic4szlk.jpg	\N	\N	2026-07-17	15:00	Amahoro  Stadium	upcoming	Women's Football Legue	1	\N	2026-07-16 17:29:38.477691+02	2026-07-16 17:29:38.477691+02
\.


--
-- Data for Name: news_articles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.news_articles (id, slug, category, sport_slug, author, author_avatar, image_url, image_alt, published_at, read_time, is_featured, is_trending, is_breaking, status, tags, views, created_at, updated_at) FROM stdin;
cc97d353-eaa7-4fec-9f72-24bebad91fa2	argentine-yasezereye-u-bwongereza-igera-ku-mukino-wa-nyuma-w-igikombe-cy-isi-1784206160460	match-reports	football	Jean Aime	\N	https://www.kinyamupira.com/admin/uploads/content/content_6a587f2a304a8_1784184618.jpg	\N	2026-07-16 14:49:20.473331+02	3	f	t	t	published	[]	13	2026-07-16 14:49:20.473331+02	2026-07-16 19:58:24.142152+02
\.


--
-- Data for Name: news_translations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.news_translations (id, article_id, locale, title, excerpt, body, created_at) FROM stdin;
f5c86598-ca55-4de7-8e9c-0748b503b87e	cc97d353-eaa7-4fec-9f72-24bebad91fa2	en				2026-07-16 14:49:20.473331+02
b8e2bc8d-2684-4769-a992-584c6dee8253	cc97d353-eaa7-4fec-9f72-24bebad91fa2	fr				2026-07-16 14:49:20.473331+02
414d5a4d-4c63-49b0-ad45-a6723c5cfe9b	cc97d353-eaa7-4fec-9f72-24bebad91fa2	rw	Argentine yasezereye u Bwongereza igera ku mukino wa nyuma w'Igikombe cy'Isi	Argentine yasezereye u Bwongereza	\n![arigentina kur final](https://www.kinyamupira.com/admin/uploads/content/content_6a587f2a3021a_1784184618.jpg)\n\nIkipe y'Igihugu ya Argentine yakatishije itike yo gukina umukino wa nyuma w'Igikombe cy'Isi nyuma yo gusezerera u Bwongereza ibutsinze ibitego 2-1 muri 1/2.\nIyi ntsinzi yabonetse mu minota ya nyuma y'umukino ku buhanga bwa Lionel Messi watanze imipira yavuyemo ibitego byombi.\n\n‎\n\nUku gusezererwa gushyize iherezo ku nzozi z'u Bwongereza bwashakaga igikombe buheruka mu 1966, bukazahatanira umwanya wa gatatu n'u Bufaransa.\n‎U Bwongereza butozwa na Thomas Tuchel ni bwo bwabanje gufungura amazamu ku munota wa 55 binyuze kuri Anthony Gordon wahawe umupira mwiza na Morgan Rogers.\n‎\n\n![](https://www.kinyamupira.com/admin/uploads/content_6a587f2a300c0_1784184618.jpg)\n\nIbyishimo by'Abongereza byarangiye habura iminota itanu ngo umukino urangire ubwo Enzo Fernandez yishyuraga iki gitego ku ishoti rikomeye yatereye inyuma y'urubuga rw'amahina.‎\n\nKu munota wa 92 Lautaro Martinez yashyizemo agashinguracumu, atsindisha umutwe umupira wari uhinduwe na Messi, ahita aha intsinzi igihugu cye.‎\nMbere y'uko Argentine yishyura u Bwongereza bwari bwokejwe igitutu bikomeye kuko Alexis Mac Allister yateye amashoti abiri akubita ku giti cy'izamu.\n\n\n![](https://www.kinyamupira.com/admin/uploads/content/content_6a587f2a302cc_1784184618.jpg)\n‎\n\nUmutoza Thomas Tuchel yashyizwe mu majwi kuba yatumye ikipe ye isatirwa cyane ubwo yakuraga mu kibuga rutahizamu Gordon akinjiza myugariro Ezri Konsa na Dan Burn kugira ngo yugarire.\nUku gusubira inyuma k'u Bwongereza kwatumye Argentine ibona umwanya uhagije wo kotsa igitutu izamu rya Jordan Pickford kugeza ibonye ibitego bibiri.\n‎Iyi ntsinzi yahesheje Argentine amahirwe yo gushaka kwisubiza igikombe yegukanye mu 2022, aho izahura na Espagne mu mukino wa nyuma. Uyu mukino wa nyuma uzahuza Lionel Messi w'imyaka 39 ukomeje kwandika amateka ndetse n'abakinnyi bakiri bato ba Espagne barimo Lamine Yamal.	2026-07-16 14:49:20.473331+02
\.


--
-- Data for Name: newsletter_subscribers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.newsletter_subscribers (id, email, is_active, source, subscribed_at) FROM stdin;
\.


--
-- Data for Name: page_views; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.page_views (id, path, viewed_at) FROM stdin;
1	/admin/dashboard	2026-07-16 21:07:51.188351+02
2	/admin/dashboard	2026-07-16 21:07:51.232087+02
3	/	2026-07-16 21:07:52.229187+02
4	/	2026-07-16 21:07:52.538594+02
5	/admin/dashboard	2026-07-16 21:08:23.432679+02
6	/admin/dashboard	2026-07-16 21:08:23.555422+02
\.


--
-- Data for Name: players; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.players (id, team_id, sport_id, slug, name, "position", shirt_number, nationality, flag, age, height, photo_url, bio, achievements, stats, social_links, is_featured, created_at, updated_at) FROM stdin;
0c08802c-492a-49b6-a1af-4f396190db16	96279409-97a7-41ac-88bb-11b88a5da012	93895e8c-23d4-42c6-b21b-85136be9c5f0	alice-mukamana-1784212320948	Alice Mukamana	Midfilieder	17	Rwanda	🇷🇼	20	1.68	https://www.kinyamupira.com/admin/uploads/content_6a587f2a300c0_1784184618.jpg	rayon sport women players Alice Mukamana is the captain of Kigali Queens and the Rwanda women's national team. A commanding midfielder known for her leadership and vision, she has been the beating heart of every team she has played for since making her senior debut at 17.	["Rwanda Premier League Champion 2023", "Top Scorer APL 2022/23", "Best Player of the Month - March 2024"]	[{"label": "Goals", "value": "38"}, {"label": "Appearances", "value": "102"}, {"label": "Assists", "value": "87"}]	[{"handle": "https://x.com/I_Am_The_ICT", "platform": "twitter"}, {"handle": "https://www.instagram.com/spinfashion_/", "platform": "instagram"}]	t	2026-07-16 15:18:35.013159+02	2026-07-16 16:32:01.052026+02
\.


--
-- Data for Name: social_posts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.social_posts (id, platform, author, handle, avatar_url, content, image_url, likes, comments, shares, category, posted_at, created_at, tweet_url) FROM stdin;
7c19a00e-d330-4f87-9e36-50a0f1798a0b	twitter	Zetalent Media	@zetalent	https://x.com/zetalent	Rwanda national volleyball teams head coach Frédéric Guérin has named a 20-player women’s national team pre-selection squad for the upcoming 2026 African Nations Championship. &mdash; Zetalent Media (@zetalent)	https://pbs.twimg.com/media/HNLZc1WXQAA7aW8?format=jpg&name=small	0	0	0	latest	2026-07-16 20:10:41.284939+02	2026-07-16 20:10:41.284939+02	\N
\.


--
-- Data for Name: sponsors; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sponsors (id, name, tier, logo_text, logo_url, website, sort_order, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: sports; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sports (id, slug, name, icon, color, team_count, sort_order, is_active, created_at, updated_at) FROM stdin;
93895e8c-23d4-42c6-b21b-85136be9c5f0	football	Football	Circle	#22c55e	10	0	t	2026-07-15 20:36:36.799123+02	2026-07-16 00:38:41.552223+02
\.


--
-- Data for Name: standings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.standings (id, sport_id, league_id, team_id, "position", team_name, team_logo, played, won, drawn, lost, goals_for, goals_against, goal_difference, points, form, season, created_at) FROM stdin;
00d00693-0714-4790-ad7e-d0789fa897f9	93895e8c-23d4-42c6-b21b-85136be9c5f0	\N	4611dcd2-1360-44e3-ab96-23d936ec808e	1	A kigali Queens	http://localhost:4000/uploads/1784215719079-nmb6sywjtk.png	0	0	0	0	0	0	0	0	[]	\N	2026-07-16 17:35:26.225736+02
5d28a437-3a66-444b-8faa-b89c7fff3a51	93895e8c-23d4-42c6-b21b-85136be9c5f0	\N	96279409-97a7-41ac-88bb-11b88a5da012	2	Rayon Sport	http://localhost:4000/uploads/1784215434409-b40vic4szlk.jpg	0	0	0	0	0	0	0	0	[]	\N	2026-07-16 17:35:33.320237+02
\.


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.teams (id, sport_id, slug, name, short_name, city, founded, stadium, coach, primary_color, logo_url, description, achievements, is_active, created_at, updated_at) FROM stdin;
96279409-97a7-41ac-88bb-11b88a5da012	93895e8c-23d4-42c6-b21b-85136be9c5f0	rayon-sport	Rayon Sport	RSFC	Nyanzza	2009	Huye Stadium	Eric Nshuti	#2900f5	http://localhost:4000/uploads/1784215434409-b40vic4szlk.jpg	Rayon Sports Football Club is an association football club from Nyanza, Southern province, Rwanda, now based in Kigali. The team currently competes	[]	t	2026-07-16 15:16:06.774861+02	2026-07-16 17:23:56.026731+02
4611dcd2-1360-44e3-ab96-23d936ec808e	93895e8c-23d4-42c6-b21b-85136be9c5f0	a-kigali-queens	A kigali Queens	AKFC	Kigali	2017	Amahoro Stadium	Nshimiyiman Eric	#f50000	http://localhost:4000/uploads/1784215719079-nmb6sywjtk.png	A.S. Kigali Football Club is a Rwandan football club from Kigali. They play their home games at Kigali Stadium located in Nyamirambo. Established in 1999, the team plays in the Rwandan Premier League. AS Kigali has won the Rwandan Cup two times and the Rwandan Super Cup two times	[]	t	2026-07-16 17:28:55.249981+02	2026-07-16 17:28:55.249981+02
\.


--
-- Name: page_views_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.page_views_id_seq', 6, true);


--
-- Name: admin_users admin_users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_email_key UNIQUE (email);


--
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- Name: contact_messages contact_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_messages
    ADD CONSTRAINT contact_messages_pkey PRIMARY KEY (id);


--
-- Name: leagues leagues_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leagues
    ADD CONSTRAINT leagues_pkey PRIMARY KEY (id);


--
-- Name: leagues leagues_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leagues
    ADD CONSTRAINT leagues_slug_key UNIQUE (slug);


--
-- Name: match_events match_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_events
    ADD CONSTRAINT match_events_pkey PRIMARY KEY (id);


--
-- Name: matches matches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_pkey PRIMARY KEY (id);


--
-- Name: news_articles news_articles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news_articles
    ADD CONSTRAINT news_articles_pkey PRIMARY KEY (id);


--
-- Name: news_articles news_articles_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news_articles
    ADD CONSTRAINT news_articles_slug_key UNIQUE (slug);


--
-- Name: news_translations news_translations_article_id_locale_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news_translations
    ADD CONSTRAINT news_translations_article_id_locale_key UNIQUE (article_id, locale);


--
-- Name: news_translations news_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news_translations
    ADD CONSTRAINT news_translations_pkey PRIMARY KEY (id);


--
-- Name: newsletter_subscribers newsletter_subscribers_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_email_key UNIQUE (email);


--
-- Name: newsletter_subscribers newsletter_subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_pkey PRIMARY KEY (id);


--
-- Name: page_views page_views_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_views
    ADD CONSTRAINT page_views_pkey PRIMARY KEY (id);


--
-- Name: players players_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_pkey PRIMARY KEY (id);


--
-- Name: players players_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_slug_key UNIQUE (slug);


--
-- Name: social_posts social_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.social_posts
    ADD CONSTRAINT social_posts_pkey PRIMARY KEY (id);


--
-- Name: sponsors sponsors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sponsors
    ADD CONSTRAINT sponsors_pkey PRIMARY KEY (id);


--
-- Name: sports sports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sports
    ADD CONSTRAINT sports_pkey PRIMARY KEY (id);


--
-- Name: sports sports_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sports
    ADD CONSTRAINT sports_slug_key UNIQUE (slug);


--
-- Name: standings standings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.standings
    ADD CONSTRAINT standings_pkey PRIMARY KEY (id);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: teams teams_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_slug_key UNIQUE (slug);


--
-- Name: idx_admin_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_users_email ON public.admin_users USING btree (email);


--
-- Name: idx_contact_messages_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contact_messages_status ON public.contact_messages USING btree (status);


--
-- Name: idx_match_events_match; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_match_events_match ON public.match_events USING btree (match_id);


--
-- Name: idx_matches_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_matches_date ON public.matches USING btree (match_date);


--
-- Name: idx_matches_sport; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_matches_sport ON public.matches USING btree (sport_id);


--
-- Name: idx_matches_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_matches_status ON public.matches USING btree (status);


--
-- Name: idx_news_articles_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_news_articles_category ON public.news_articles USING btree (category);


--
-- Name: idx_news_articles_published; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_news_articles_published ON public.news_articles USING btree (published_at DESC);


--
-- Name: idx_news_articles_sport; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_news_articles_sport ON public.news_articles USING btree (sport_slug);


--
-- Name: idx_news_translations_article; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_news_translations_article ON public.news_translations USING btree (article_id);


--
-- Name: idx_players_sport; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_players_sport ON public.players USING btree (sport_id);


--
-- Name: idx_players_team; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_players_team ON public.players USING btree (team_id);


--
-- Name: idx_standings_league; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_standings_league ON public.standings USING btree (league_id);


--
-- Name: idx_standings_sport; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_standings_sport ON public.standings USING btree (sport_id);


--
-- Name: idx_teams_sport; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_teams_sport ON public.teams USING btree (sport_id);


--
-- Name: leagues leagues_sport_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leagues
    ADD CONSTRAINT leagues_sport_id_fkey FOREIGN KEY (sport_id) REFERENCES public.sports(id) ON DELETE CASCADE;


--
-- Name: match_events match_events_match_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_events
    ADD CONSTRAINT match_events_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id) ON DELETE CASCADE;


--
-- Name: matches matches_away_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_away_team_id_fkey FOREIGN KEY (away_team_id) REFERENCES public.teams(id) ON DELETE SET NULL;


--
-- Name: matches matches_home_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_home_team_id_fkey FOREIGN KEY (home_team_id) REFERENCES public.teams(id) ON DELETE SET NULL;


--
-- Name: matches matches_league_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_league_id_fkey FOREIGN KEY (league_id) REFERENCES public.leagues(id) ON DELETE SET NULL;


--
-- Name: matches matches_sport_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_sport_id_fkey FOREIGN KEY (sport_id) REFERENCES public.sports(id) ON DELETE CASCADE;


--
-- Name: news_translations news_translations_article_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news_translations
    ADD CONSTRAINT news_translations_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.news_articles(id) ON DELETE CASCADE;


--
-- Name: players players_sport_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_sport_id_fkey FOREIGN KEY (sport_id) REFERENCES public.sports(id) ON DELETE CASCADE;


--
-- Name: players players_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE SET NULL;


--
-- Name: standings standings_league_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.standings
    ADD CONSTRAINT standings_league_id_fkey FOREIGN KEY (league_id) REFERENCES public.leagues(id) ON DELETE CASCADE;


--
-- Name: standings standings_sport_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.standings
    ADD CONSTRAINT standings_sport_id_fkey FOREIGN KEY (sport_id) REFERENCES public.sports(id) ON DELETE CASCADE;


--
-- Name: standings standings_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.standings
    ADD CONSTRAINT standings_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- Name: teams teams_sport_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_sport_id_fkey FOREIGN KEY (sport_id) REFERENCES public.sports(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict UvIEpiMW82lwwGocOPph2FuSsufbhpNc1ETHjvjgWi2Yr5xnDNBOZNGlnMGlgZu

