--
-- PostgreSQL database dump
--

\restrict DCPx9nsTMak1lONfWDFjl9zz6MsyxBoIgczINVA3DkGekmxjIDOeAcokc03coXm

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

--
-- Data for Name: admin_users; Type: TABLE DATA; Schema: public; Owner: -
--

SET SESSION AUTHORIZATION DEFAULT;

ALTER TABLE public.admin_users DISABLE TRIGGER ALL;

COPY public.admin_users (id, email, name, role, password_hash, is_active, created_at, updated_at) FROM stdin;
11d4754f-5f2f-4b04-9b84-18f961ace194	admin@zetalentmedia.com	ZeTalent Admin	super_admin	$2a$12$Th/Ye/bRLXalfc.AJi76U.ZSezgPup20P1xrK3/SalsJEecqppxUm	t	2026-07-15 16:21:55.975052+02	2026-07-15 16:21:55.975052+02
\.


ALTER TABLE public.admin_users ENABLE TRIGGER ALL;

--
-- Data for Name: contact_messages; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.contact_messages DISABLE TRIGGER ALL;

COPY public.contact_messages (id, name, email, subject, body, status, created_at) FROM stdin;
\.


ALTER TABLE public.contact_messages ENABLE TRIGGER ALL;

--
-- Data for Name: sports; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.sports DISABLE TRIGGER ALL;

COPY public.sports (id, slug, name, icon, color, team_count, sort_order, is_active, created_at, updated_at) FROM stdin;
93895e8c-23d4-42c6-b21b-85136be9c5f0	football	Football	Circle	#22c55e	10	0	t	2026-07-15 20:36:36.799123+02	2026-07-16 00:38:41.552223+02
\.


ALTER TABLE public.sports ENABLE TRIGGER ALL;

--
-- Data for Name: leagues; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.leagues DISABLE TRIGGER ALL;

COPY public.leagues (id, sport_id, slug, name, season, is_active, created_at) FROM stdin;
\.


ALTER TABLE public.leagues ENABLE TRIGGER ALL;

--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.teams DISABLE TRIGGER ALL;

COPY public.teams (id, sport_id, slug, name, short_name, city, founded, stadium, coach, primary_color, logo_url, description, achievements, is_active, created_at, updated_at) FROM stdin;
96279409-97a7-41ac-88bb-11b88a5da012	93895e8c-23d4-42c6-b21b-85136be9c5f0	rayon-sport	Rayon Sport	RSFC	Nyanzza	2009	Huye Stadium	Eric Nshuti	#2900f5	http://localhost:4000/uploads/1784215434409-b40vic4szlk.jpg	Rayon Sports Football Club is an association football club from Nyanza, Southern province, Rwanda, now based in Kigali. The team currently competes	[]	t	2026-07-16 15:16:06.774861+02	2026-07-16 17:23:56.026731+02
4611dcd2-1360-44e3-ab96-23d936ec808e	93895e8c-23d4-42c6-b21b-85136be9c5f0	a-kigali-queens	A kigali Queens	AKFC	Kigali	2017	Amahoro Stadium	Nshimiyiman Eric	#f50000	http://localhost:4000/uploads/1784215719079-nmb6sywjtk.png	A.S. Kigali Football Club is a Rwandan football club from Kigali. They play their home games at Kigali Stadium located in Nyamirambo. Established in 1999, the team plays in the Rwandan Premier League. AS Kigali has won the Rwandan Cup two times and the Rwandan Super Cup two times	[]	t	2026-07-16 17:28:55.249981+02	2026-07-16 17:28:55.249981+02
\.


ALTER TABLE public.teams ENABLE TRIGGER ALL;

--
-- Data for Name: matches; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.matches DISABLE TRIGGER ALL;

COPY public.matches (id, sport_id, league_id, home_team_id, away_team_id, home_team_name, away_team_name, home_team_logo, away_team_logo, home_score, away_score, match_date, match_time, venue, status, league_name, matchweek, mvp, created_at, updated_at) FROM stdin;
1cfc52fa-617f-48c5-93c2-25bcb3b0a16e	93895e8c-23d4-42c6-b21b-85136be9c5f0	\N	4611dcd2-1360-44e3-ab96-23d936ec808e	96279409-97a7-41ac-88bb-11b88a5da012	A kigali Queens	Rayon Sport	http://localhost:4000/uploads/1784215719079-nmb6sywjtk.png	http://localhost:4000/uploads/1784215434409-b40vic4szlk.jpg	\N	\N	2026-07-17	15:00	Amahoro  Stadium	upcoming	Women's Football Legue	1	\N	2026-07-16 17:29:38.477691+02	2026-07-16 17:29:38.477691+02
\.


ALTER TABLE public.matches ENABLE TRIGGER ALL;

--
-- Data for Name: match_events; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.match_events DISABLE TRIGGER ALL;

COPY public.match_events (id, match_id, minute, event_type, team_side, player_name, detail, created_at) FROM stdin;
\.


ALTER TABLE public.match_events ENABLE TRIGGER ALL;

--
-- Data for Name: news_articles; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.news_articles DISABLE TRIGGER ALL;

COPY public.news_articles (id, slug, category, sport_slug, author, author_avatar, image_url, image_alt, published_at, read_time, is_featured, is_trending, is_breaking, status, tags, views, created_at, updated_at) FROM stdin;
cc97d353-eaa7-4fec-9f72-24bebad91fa2	argentine-yasezereye-u-bwongereza-igera-ku-mukino-wa-nyuma-w-igikombe-cy-isi-1784206160460	match-reports	football	Jean Aime	\N	https://www.kinyamupira.com/admin/uploads/content/content_6a587f2a304a8_1784184618.jpg	\N	2026-07-16 14:49:20.473331+02	3	f	t	t	published	[]	13	2026-07-16 14:49:20.473331+02	2026-07-16 19:58:24.142152+02
\.


ALTER TABLE public.news_articles ENABLE TRIGGER ALL;

--
-- Data for Name: news_translations; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.news_translations DISABLE TRIGGER ALL;

COPY public.news_translations (id, article_id, locale, title, excerpt, body, created_at) FROM stdin;
f5c86598-ca55-4de7-8e9c-0748b503b87e	cc97d353-eaa7-4fec-9f72-24bebad91fa2	en				2026-07-16 14:49:20.473331+02
b8e2bc8d-2684-4769-a992-584c6dee8253	cc97d353-eaa7-4fec-9f72-24bebad91fa2	fr				2026-07-16 14:49:20.473331+02
414d5a4d-4c63-49b0-ad45-a6723c5cfe9b	cc97d353-eaa7-4fec-9f72-24bebad91fa2	rw	Argentine yasezereye u Bwongereza igera ku mukino wa nyuma w'Igikombe cy'Isi	Argentine yasezereye u Bwongereza	\n![arigentina kur final](https://www.kinyamupira.com/admin/uploads/content/content_6a587f2a3021a_1784184618.jpg)\n\nIkipe y'Igihugu ya Argentine yakatishije itike yo gukina umukino wa nyuma w'Igikombe cy'Isi nyuma yo gusezerera u Bwongereza ibutsinze ibitego 2-1 muri 1/2.\nIyi ntsinzi yabonetse mu minota ya nyuma y'umukino ku buhanga bwa Lionel Messi watanze imipira yavuyemo ibitego byombi.\n\n‎\n\nUku gusezererwa gushyize iherezo ku nzozi z'u Bwongereza bwashakaga igikombe buheruka mu 1966, bukazahatanira umwanya wa gatatu n'u Bufaransa.\n‎U Bwongereza butozwa na Thomas Tuchel ni bwo bwabanje gufungura amazamu ku munota wa 55 binyuze kuri Anthony Gordon wahawe umupira mwiza na Morgan Rogers.\n‎\n\n![](https://www.kinyamupira.com/admin/uploads/content_6a587f2a300c0_1784184618.jpg)\n\nIbyishimo by'Abongereza byarangiye habura iminota itanu ngo umukino urangire ubwo Enzo Fernandez yishyuraga iki gitego ku ishoti rikomeye yatereye inyuma y'urubuga rw'amahina.‎\n\nKu munota wa 92 Lautaro Martinez yashyizemo agashinguracumu, atsindisha umutwe umupira wari uhinduwe na Messi, ahita aha intsinzi igihugu cye.‎\nMbere y'uko Argentine yishyura u Bwongereza bwari bwokejwe igitutu bikomeye kuko Alexis Mac Allister yateye amashoti abiri akubita ku giti cy'izamu.\n\n\n![](https://www.kinyamupira.com/admin/uploads/content/content_6a587f2a302cc_1784184618.jpg)\n‎\n\nUmutoza Thomas Tuchel yashyizwe mu majwi kuba yatumye ikipe ye isatirwa cyane ubwo yakuraga mu kibuga rutahizamu Gordon akinjiza myugariro Ezri Konsa na Dan Burn kugira ngo yugarire.\nUku gusubira inyuma k'u Bwongereza kwatumye Argentine ibona umwanya uhagije wo kotsa igitutu izamu rya Jordan Pickford kugeza ibonye ibitego bibiri.\n‎Iyi ntsinzi yahesheje Argentine amahirwe yo gushaka kwisubiza igikombe yegukanye mu 2022, aho izahura na Espagne mu mukino wa nyuma. Uyu mukino wa nyuma uzahuza Lionel Messi w'imyaka 39 ukomeje kwandika amateka ndetse n'abakinnyi bakiri bato ba Espagne barimo Lamine Yamal.	2026-07-16 14:49:20.473331+02
\.


ALTER TABLE public.news_translations ENABLE TRIGGER ALL;

--
-- Data for Name: newsletter_subscribers; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.newsletter_subscribers DISABLE TRIGGER ALL;

COPY public.newsletter_subscribers (id, email, is_active, source, subscribed_at) FROM stdin;
\.


ALTER TABLE public.newsletter_subscribers ENABLE TRIGGER ALL;

--
-- Data for Name: page_views; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.page_views DISABLE TRIGGER ALL;

COPY public.page_views (id, path, viewed_at) FROM stdin;
1	/admin/dashboard	2026-07-16 21:07:51.188351+02
2	/admin/dashboard	2026-07-16 21:07:51.232087+02
3	/	2026-07-16 21:07:52.229187+02
4	/	2026-07-16 21:07:52.538594+02
5	/admin/dashboard	2026-07-16 21:08:23.432679+02
6	/admin/dashboard	2026-07-16 21:08:23.555422+02
\.


ALTER TABLE public.page_views ENABLE TRIGGER ALL;

--
-- Data for Name: players; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.players DISABLE TRIGGER ALL;

COPY public.players (id, team_id, sport_id, slug, name, "position", shirt_number, nationality, flag, age, height, photo_url, bio, achievements, stats, social_links, is_featured, created_at, updated_at) FROM stdin;
0c08802c-492a-49b6-a1af-4f396190db16	96279409-97a7-41ac-88bb-11b88a5da012	93895e8c-23d4-42c6-b21b-85136be9c5f0	alice-mukamana-1784212320948	Alice Mukamana	Midfilieder	17	Rwanda	🇷🇼	20	1.68	https://www.kinyamupira.com/admin/uploads/content_6a587f2a300c0_1784184618.jpg	rayon sport women players Alice Mukamana is the captain of Kigali Queens and the Rwanda women's national team. A commanding midfielder known for her leadership and vision, she has been the beating heart of every team she has played for since making her senior debut at 17.	["Rwanda Premier League Champion 2023", "Top Scorer APL 2022/23", "Best Player of the Month - March 2024"]	[{"label": "Goals", "value": "38"}, {"label": "Appearances", "value": "102"}, {"label": "Assists", "value": "87"}]	[{"handle": "https://x.com/I_Am_The_ICT", "platform": "twitter"}, {"handle": "https://www.instagram.com/spinfashion_/", "platform": "instagram"}]	t	2026-07-16 15:18:35.013159+02	2026-07-16 16:32:01.052026+02
\.


ALTER TABLE public.players ENABLE TRIGGER ALL;

--
-- Data for Name: social_posts; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.social_posts DISABLE TRIGGER ALL;

COPY public.social_posts (id, platform, author, handle, avatar_url, content, image_url, likes, comments, shares, category, posted_at, created_at, tweet_url) FROM stdin;
7c19a00e-d330-4f87-9e36-50a0f1798a0b	twitter	Zetalent Media	@zetalent	https://x.com/zetalent	Rwanda national volleyball teams head coach Frédéric Guérin has named a 20-player women’s national team pre-selection squad for the upcoming 2026 African Nations Championship. &mdash; Zetalent Media (@zetalent)	https://pbs.twimg.com/media/HNLZc1WXQAA7aW8?format=jpg&name=small	0	0	0	latest	2026-07-16 20:10:41.284939+02	2026-07-16 20:10:41.284939+02	\N
\.


ALTER TABLE public.social_posts ENABLE TRIGGER ALL;

--
-- Data for Name: sponsors; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.sponsors DISABLE TRIGGER ALL;

COPY public.sponsors (id, name, tier, logo_text, logo_url, website, sort_order, is_active, created_at) FROM stdin;
\.


ALTER TABLE public.sponsors ENABLE TRIGGER ALL;

--
-- Data for Name: standings; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.standings DISABLE TRIGGER ALL;

COPY public.standings (id, sport_id, league_id, team_id, "position", team_name, team_logo, played, won, drawn, lost, goals_for, goals_against, goal_difference, points, form, season, created_at) FROM stdin;
00d00693-0714-4790-ad7e-d0789fa897f9	93895e8c-23d4-42c6-b21b-85136be9c5f0	\N	4611dcd2-1360-44e3-ab96-23d936ec808e	1	A kigali Queens	http://localhost:4000/uploads/1784215719079-nmb6sywjtk.png	0	0	0	0	0	0	0	0	[]	\N	2026-07-16 17:35:26.225736+02
5d28a437-3a66-444b-8faa-b89c7fff3a51	93895e8c-23d4-42c6-b21b-85136be9c5f0	\N	96279409-97a7-41ac-88bb-11b88a5da012	2	Rayon Sport	http://localhost:4000/uploads/1784215434409-b40vic4szlk.jpg	0	0	0	0	0	0	0	0	[]	\N	2026-07-16 17:35:33.320237+02
\.


ALTER TABLE public.standings ENABLE TRIGGER ALL;

--
-- Name: page_views_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.page_views_id_seq', 6, true);


--
-- PostgreSQL database dump complete
--

\unrestrict DCPx9nsTMak1lONfWDFjl9zz6MsyxBoIgczINVA3DkGekmxjIDOeAcokc03coXm

