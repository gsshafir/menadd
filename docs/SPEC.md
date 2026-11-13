# MENADD: спецификация пересборки сайта

Nov 12, 2026 · @Gennady

Это единственный источник правды для пересборки menadd.com. Английские тексты вставляются дословно. Чего в документе нет, Codex не придумывает, а спрашивает.

## 1. Принятые решения

Всё в этой таблице зафиксировано. Codex не пересматривает эти решения и не предлагает альтернативы.

| Вопрос | Решение |
| --- | --- |
| Задача сайта | Приводить квалифицированные заявки от фаундеров и инвесторов. Сайт не продаёт пакет услуг |
| Позиционирование | Личная практика Gennady Shafir. Чётко про опыт и ситуации, ничего про форму сделки |
| Домен и бренд | menadd.com остаётся. В шапке «MENADD · Gennady Shafir». MENADD это имя сайта и библиотеки |
| Язык | Только английский, британская орфография (modelled, recapitalisation), как в статьях |
| Голос | Первое лицо, «I». «We» только в значении «я и ты». Нигде «our team», «MENADD helps» |
| Первая строка | I read the cap table before I read the plan. |
| Секторы | Не называем. Критерий отбора: команда и продукт |
| Цены, ставки, доля, число компаний | Не публикуем нигде |
| Главное действие | Одна кнопка «Start a conversation». Она ведёт на анкету. Календарь показывается только после отправки анкеты |
| Фильтр входящих | Блок «Where I fit» на главной и анкета. Платные разовые заказы не отсекаем. Отсекаем работу только за success fee. Доля вместе с оплатой допустима и желательна, публично это не обсуждается |
| Кейсы | Четыре обезличенных кейса и одна карточка-паттерн по term sheets. Без юрисдикций, названий и точных сумм. Порядок величины допустим |
| Занятость | Сайт исходит из того, что время есть. Работодатель не упоминается |
| Локация | «UAE, London and Luxembourg» везде, где указано, где работает Геннадий |
| Что не трогаем | Тексты статей, URL библиотеки, механизм подписки Diligence Notes |

Ещё четыре решения, принятые после двух внешних разборов:

- **Главный сценарий: рекомендация.** Ссылку на сайт пересылают в мессенджере вместе с LinkedIn. Человек приходит тёплым, открывает с телефона и за минуту проверяет, кто автор. Поэтому макет проектируется от 375 px, превью ссылки показывает фото и имя, а в анкете есть поле «Introduced by».
- **Structure check остаётся в меню.** Это единственный шаг для тех, кто не готов писать.
- **Почта.** Заявки уходят через Resend. Копия каждой заявки хранится в Cloudflare KV 30 дней на случай сбоя доставки.
- **Отправка анкеты требует JavaScript.** Иначе не работают Turnstile и сохранение введённых данных при ошибке. Без JavaScript посетитель видит email.

Логика одной строкой: посетитель пришёл из LinkedIn, DM или по рекомендации. За 20 секунд он видит, кто автор, узнаёт свою ситуацию и оставляет заявку. Форму сотрудничества предлагает Геннадий после звонка.

## 2. Архитектура

Три новые страницы, одна переписана целиком, остальные правятся точечно.

| URL | Страница | Что делаем | В меню |
| --- | --- | --- | --- |
| / | Home | Переписать целиком, раздел 4 | Логотип |
| /work/ | Work | Новая. Заменяет /financing-terms/, раздел 5 | Да |
| /investors/ | For investors | Новая, раздел 6 | Да |
| /start/ | Start a conversation | Новая, анкета, раздел 7 | Кнопка |
| /start/thanks/ | Thank you | Новая, noindex, раздел 7 | Нет |
| /about/ | About | Точечные правки, раздел 8 | Да |
| /library/ и всё под ней | Library | Не трогаем, кроме блока в конце статей | Да |
| /assessment/structure/ | Structure check | Остаётся, пункт меню. Результат ведёт на /start/ | Да |
| /assessment/ | Investor readiness | Остаётся, из меню убрать | Нет |
| /carta/ | Cap table migration | Остаётся, noindex, из меню убрать | Нет |
| /notes/ | Diligence Notes | Страницы нет, 301 на /library/ остаётся. Ссылка «Diligence Notes» в футере ведёт на /library/#subscribe | Футер |
| /privacy/ | Privacy | Дописать абзац про анкету | Футер |

**Шапка.** Одинаковая на всех страницах, включая статьи. Слева словесный знак «MENADD» и рядом мельче «Gennady Shafir». Справа: Work · For investors · Library · Structure check · About и кнопка «Start a conversation». На мобильном, до 768 px, шапка одной строкой высотой не больше 64 px. Слева знак MENADD, под ним мелко «Gennady Shafir». Справа текстовая кнопка «Menu» и главная кнопка «Start a conversation». Меню открывается панелью на всю ширину прямо под шапкой, поверх контента: Work, For investors, Library, Structure check, About, без пустых строк. Закрывается повторным нажатием, клавишей Escape и при выборе пункта. Системный треугольник details не используется. Если строка не помещается на 360 px, уменьшается горизонтальный отступ кнопки, а не её подпись.

**Футер.** Одинаковый на всех страницах:

- Строка: MENADD. Written by Gennady Shafir. Built from the diligence backwards.
- Ссылки: Library · Structure check · Diligence Notes (ведёт на /library/#subscribe) · LinkedIn · Privacy · gennady@menadd.com
- Оговорка, один раз: General information, not legal, tax or investment advice.
- Copyright 2026 MENADD

**Редиректы.** Файл `_redirects` для Cloudflare Pages: `/financing-terms/` → `/work/`, код 301. Все внутренние ссылки на /financing-terms/, включая ссылки внутри статей и блок в конце статей, заменить на /work/.

**Календарь.** Ссылка на Google Calendar остаётся только на /start/thanks/. С About, Carta, Assessment и всех остальных страниц её убрать и заменить ссылкой на /start/.

## 3. Правила текста

Эти правила действуют на все страницы, кроме текстов статей.

1. Первое лицо. «I», «my». Нигде «we» и «our» в значении фирмы, «the team», «MENADD helps», «MENADD provides». «We» допустимо только там, где оно значит «я и ты», как в текстах этой спецификации.
2. Короткие предложения. Короткие абзацы, не больше трёх предложений.
3. Никаких длинных тире. Никаких предложений, начинающихся с «Most».
4. Запрещённые слова: unlock, empower, leverage, seamless, journey, passionate, world-class, tailored, holistic, solutions, cutting-edge, game-changing.
5. Заголовки и концовки блоков это утверждения, не вопросы.
6. Оговорки про юристов и «not advice»: одна строка в футере и один абзац на Work. Все остальные повторы удалить.
7. Не публикуем: цены, ставки, долю, число компаний, слова fractional, available, hire, retainer.
8. Цифры и факты только те, что есть в этом документе. Новые не добавлять.
9. Подписи кнопок фиксированы: главная «Start a conversation», вторичная «Read the library».
10. Тексты из разделов 4–8 вставляются дословно. Если текст не помещается в макет, меняется макет, а не текст.

## 4. Главная

Одиннадцать блоков в этом порядке. Порядок не менять: сначала кто, потом ситуации, потом доказательства, потом фильтр, потом действие.

**Title:** Gennady Shafir | Finance, Ownership and Structure | MENADD

**Meta description:** CFO and board advisor working between the UAE, London and Luxembourg. I work with founders and investors on the finance, ownership and structure questions that decide whether a round closes.

### Блок 1. Первый экран

Две колонки на десктопе: текст слева, фото справа. На мобильном фото под подзаголовком, над кнопками.

**Надстрочник:** Gennady Shafir. CFO and board advisor. UAE, London and Luxembourg.

**H1:** I read the cap table before I read the plan.

**Подзаголовок:** I work with founders and investors on the questions that decide whether a round closes and what the founders keep after it. Finance, ownership, control and cross-border structure. UAE, MENA and Europe, and the routes between them through ADGM, DIFC and Luxembourg.

**Кнопки:** Start a conversation (ведёт на /start/) · Read the library (ведёт на /library/)

### Блок 2. Полоса с цифрами

Три колонки, крупная цифра и подпись под ней.

| Цифра | Подпись |
| --- | --- |
| $50M+ | Annual revenue, 200+ people. B2B e-commerce. CEO and co-founder. |
| $100M+ | Valuation at Series B, 30+ countries. 3D-printing hardware. COO and CFO. |
| $10M+ | Raised. Deep-tech energy, MENA and the EU. CFO. |

### Блок 3. Ситуации

**H2:** When people call me

Пять карточек. Каждая карточка целиком кликабельна.

**A term sheet is on the table.** The headline valuation is the easy part. I model what the terms do to ownership, control and the next round, before you sign. → /work/#financing

**The company has outgrown its finance.** Revenue is real. Cash planning, reporting and investor conversations still sit with the founder. You need a senior operator in the team, and a full-time CFO is a year away. → /work/#finance

**The structure will not survive diligence.** The round closes into the wrong entity. The IP sits somewhere else. Equity was promised and never issued. By the time this shows up in diligence, it is already expensive. → /work/#structure

**The company is crossing a border.** Into ADGM or DIFC, under a Luxembourg holding or a BVI holdco. The structure has to work for banking, for tax and for the next investor at the same time. → /work/#border

**You are an investor.** A portfolio company is growing faster than its finance and governance. You want someone on the operating side who reports the way an investor expects. → /investors/

### Блок 4. Кейсы

**H2:** Four structures. Four closed rounds.

**Вводная строка:** None of these companies had a growth problem. Each had a structure an investor could not fund.

Четыре карточки, сетка 2×2 на десктопе, и пятая карточка на всю ширину под ними.

**IP in several jurisdictions, investors wanted one owner.** An early-stage industrial technology company. Its patents were spread across several jurisdictions. Investors would not fund a company that did not hold its core asset in one place. I consolidated the portfolio into a single holding entity in the jurisdiction the investors required and aligned the documents with their terms. The round closed.

**No founder vesting, no decisions.** The founders held their equity outright. Every important question turned into a deadlock, and the investors saw it. I led the introduction of founder vesting. Once the founders were bound to the company on the same terms, the deadlock broke. The Series A closed.

**From grants to venture capital.** A technology company had lived on public grants for years and could not raise venture capital. The structure was built for grant compliance, not for investors. I ran the relocation of the headquarters and the restructuring of the group around a new holding. A seven-figure round closed.

**A company that could not continue where it was.** The existing structure had no way forward. I ran the wind-down and the rebuild of the business in a new entity in another region. It has since closed four rounds.

Пятая карточка, на всю ширину под сеткой. Это не отдельный кейс, а повторяющийся паттерн, поэтому она оформлена иначе: тот же стиль, но без рамки и с надстрочником «Across many term sheets».

**And the term sheets.** In the term sheets I have worked on, the valuation was rarely the problem. The same four clauses were. Veto rights wider than the investor's stake. Board seats that move control before the ownership does. Down-round protection that lands entirely on the founders. Drag-along that lets someone else decide when the company is sold. I model what each clause costs and put a number next to it, so the founders negotiate the clause and not the headline.

**Подпись под сеткой:** Details are withheld to protect the companies. I can go through them on a call.

### Блок 5. Экспонат

График «Founders' combined ownership», спецификация в разделе 9.

**Подпись:** Six ordinary decisions. Founders go from 100% to 16.5% in three years. Synthetic numbers, real mechanics.

**Ссылка:** Read the full scenario → /library/ownership/how-founders-lose-a-company-in-three-years/

### Блок 6. Почему структура

**H2:** Why I start with structure

I have been on the operating side of a transaction that did not close. The business was working. The corporate structure could not take the investment.

Since then I look at the same four things first, in every company. Who owns what. Who can block what. Which entity holds the value. Where the cash is.

Structure is not admin. It is strategy.

### Блок 7. Как устроена работа

**H2:** How the work takes shape

It depends on the company. Sometimes it is one defined piece of work around a financing decision. Sometimes it is a seat in the team or on the board. We work that out after the first conversation, once I have seen the company.

I work alongside your counsel. I do not replace them.

### Блок 8. Фильтр

**H2:** Where I fit

Две колонки.

**A fit.** A team that can build and a product that exists. Revenue or committed capital. A decision with a date on it.

**Not a fit.** An idea that needs a financial model to raise on. A request for investor introductions alone. Work paid only if the round closes.

### Блок 9. Библиотека

**H2:** From the library

**Вводная строка:** MENADD is where I write this down. Built from the diligence backwards.

Три карточки статей, заголовок и описание берутся из самих статей:

1. How Founders Lose a Company in Three Years
2. Which Entity a Round Actually Closes Into
3. The UAE Raise Is a Trust Process

**Ссылка:** All articles → /library/

**Строка для тех, кто не готов писать:** Not ready to talk. Run the structure check first. → /assessment/structure/

### Блок 10. Финальный призыв

**H2:** Tell me what is in front of you.

**Текст:** A short form, two minutes. I read every enquiry myself. If I am not the right person, I will say so.

**Кнопка:** Start a conversation

### Блок 11. Подписка

Существующий компонент Diligence Notes без изменений.

**Что удалить с текущей главной:** hero «Understand what your next round changes», блок «When to work with MENADD», блок «Checks you can run before a conversation», сетку «Library Sections», блок «Why built from the diligence backwards».

## 5. Страница Work

Заменяет /financing-terms/ и втрое короче неё. Четыре ситуации с якорями, потом как начинается работа.

**URL:** /work/

**Title:** Work | Financing, Finance, Structure | MENADD

**Meta description:** Four situations I work on with founders: a financing decision, a finance function the company has outgrown, a structure ahead of diligence, a move across borders.

**H1:** What I work on

**Вводный абзац:** Four situations bring founders to me. The work starts with the documents and the numbers. It ends with a decision you can defend to an investor.

### Якорь #financing

**H2:** A financing decision

A term sheet, a new convertible, a bridge, a down round. The terms look reasonable one by one. Their combined effect shows up two rounds later.

I bring the cap table, the existing instruments and the proposed terms into one model. It shows ownership round by round, issued and fully diluted. A control map sets out board seats, voting thresholds and the decisions that need investor consent. Exit distributions show who receives what at several sale values, under the preference terms in the documents.

You end up with an editable model, a short memo with the points to negotiate, and a walkthrough.

### Якорь #finance

**H2:** Finance the company has outgrown

The founder still runs cash in a spreadsheet. Investors ask for numbers the company cannot produce quickly. The next raise depends on both.

I build cash reporting from the bank accounts, a runway figure you can rely on, and the metrics an investor will recalculate anyway. Then board and investor reporting. Then the raise itself: the model, the data room, the diligence answers.

This is ongoing work inside the team, not a report.

### Якорь #structure

**H2:** Structure ahead of diligence

Operational is not the same as investable. A structure built for licensing, banking and invoicing rarely answers an investor's questions.

I review which entity the round closes into, where the intellectual property sits, who employs the team and signs the contracts, how cash moves between entities, and what equity was promised but never issued. I define what has to change and run the change with your counsel and corporate services providers.

The objective is to find the gaps before an investor does.

### Якорь #border

**H2:** A move across borders

A holding in ADGM, DIFC, Luxembourg or the BVI. A headquarters that moves. Assets that have to follow it.

The structure has to work for banking, for tax and for the next investor at the same time. I design it from the capital stack backwards and coordinate the advisers in each jurisdiction until it is in place.

### Блок «Как начинается работа»

**H2:** How it starts

1. A short form. You tell me the company, the decision and the deadline.
2. A call. Thirty minutes. I ask most of the questions.
3. A written scope. What I will do, by when, and the fee. Work starts when the scope is agreed.
4. A first piece of work with a defined end. What follows depends on what we both see.

### Блок «Фиксированный формат»

**H2:** One fixed-scope option: Financing Terms Review

For a company with a reliable ownership record. It covers one proposed term sheet, up to three existing convertible instruments, one option-pool arrangement, one subsequent financing scenario and three exit values.

You receive an editable model, a commercial issues memo, a map of documented control terms and open legal questions, and a 30-minute walkthrough. The fixed fee and delivery date are confirmed before you commit.

### Абзац об ограничениях, один на странице

I provide financial and commercial analysis and run the process. Legal drafting, opinions and filings stay with counsel. Nothing here promises a financing, a valuation or an investor introduction.

### Финальный призыв

**H2:** Tell me what is in front of you.

**Кнопка:** Start a conversation

**Further reading:** три ссылки, как на текущей странице: How Founders Lose a Company in Three Years · Valuation Makes Headlines. Control Shifts Quietly. · Which Entity a Round Actually Closes Into.

## 6. Страница For investors

Короткая страница для фондов, family offices и акселераторов. Один экран текста и кнопка.

**URL:** /investors/

**Title:** For Investors | Finance and Governance in Portfolio Companies | MENADD

**Meta description:** For funds and family offices: an operating CFO and board advisor for portfolio companies that are growing faster than their finance and governance.

**H1:** For investors

**Вводный абзац:** A portfolio company is growing faster than its finance and governance. The founder is capable. The numbers and the structure are behind the business. I take the operating side.

### Когда это нужно

**H2:** When it makes sense

- Before a follow-on round, when the cap table and the instruments need to reconcile to signed documents.
- After a round, when reporting obligations start and the company has no one to meet them.
- When the structure blocks the next investment: the wrong entity, IP in the wrong place, equity promised and never issued.
- When the board and the founder read the same numbers differently.
- Before you invest, when you want the structure and the ownership record checked by someone who has run a company.

### Что я делаю в компании

**H2:** What I do inside the company

Cash reporting built from the bank accounts. A runway figure the board can rely on. A cap table that matches the documents. Board and investor reporting on a fixed rhythm. Structural fixes ahead of the next round, run with counsel.

I work with the founder, not above the founder. The company gets a senior finance operator. You get reporting you do not have to rebuild.

### Почему я

**H2:** Where this comes from

I have been CEO, COO and CFO in venture-backed companies. I have done diligence work on both sides of the table. I have seen a transaction fail on structure while the business was working.

### Финальный призыв

**H2:** Introduce me to the founder, or send me the situation.

**Кнопка:** Start a conversation (ведёт на /start/?type=investor, в анкете сразу выбран вариант Investor)

## 7. Страница Start a conversation

Единственная точка входа. Анкета отправляется письмом Геннадию, после отправки посетитель видит страницу с календарём.

**URL:** /start/

**Title:** Start a Conversation | MENADD

**Meta description:** A short form, two minutes. Tell me the company, the decision and the deadline.

**H1:** Start a conversation

**Вводный абзац:** A short form, two minutes. I read every enquiry myself. If I am not the right person, I will say so.

### Поля

| Поле | Тип | Варианты | Обязательное |
| --- | --- | --- | --- |
| I am | Переключатель | A founder · An investor · Someone else | Да |
| Name | Текст |  | Да |
| Email | Email |  | Да |
| Company and website | Текст |  | Да |
| Your role | Текст |  | Нет |
| Stage | Список | Pre-seed · Seed · Series A · Series B or later · Not raising | Да, для founder |
| Capital raised to date | Список | None · Under $1M · $1M to $5M · $5M to $20M · Over $20M | Да, для founder |
| Revenue, last 12 months | Список | None yet · Under $1M · $1M to $5M · Over $5M | Да, для founder |
| What is in front of you, and by when | Многострочный текст |  | Да |
| Entities and jurisdictions today | Текст |  | Нет |
| What you are looking for | Список | A defined review · An ongoing finance role · A board seat · Not sure yet | Нет |
| Introduced by | Текст | Имя того, кто порекомендовал | Нет |

Для варианта «An investor» поля Stage, Capital raised и Revenue скрываются. Вместо них два поля: «Fund or firm» (обязательное) и «The portfolio company and what it needs» (многострочное, обязательное).

Параметр `?type=investor` в адресе заранее выбирает вариант «An investor».

**Строка под формой:** Please leave confidential documents out. We agree a channel for those after the first call.

**Строка о данных:** I use these answers only to reply to you. See Privacy.

**Строка для тех, кто пришёл по рекомендации:** Introduced by someone? Email me at gennady@menadd.com and mention their name.

**Без JavaScript:** вместо формы показывается строка «This form needs JavaScript. Email me at gennady@menadd.com instead.»

**Кнопка отправки:** Send

### Страница после отправки

**URL:** /start/thanks/, `noindex`

**H1:** Received.

**Текст:** I read every enquiry myself and reply by email. If the timing is tight, book a slot now.

**Кнопка:** Book a call (ссылка на существующий Google Calendar: https://calendar.app.google/NHdtM4bGDWJgMDi16)

**Ссылка:** Back to the library

### Техника

1. Сайт статический, Astro на Cloudflare Pages. Анкета отправляется через fetch на Pages Function `/api/enquiry`. При любой ошибке введённые данные остаются на странице.
2. Функция проверяет поля и токен Turnstile, сохраняет заявку в Cloudflare KV со сроком жизни 30 дней и отправляет письмо через Resend на gennady@menadd.com. При успехе страница переходит на /start/thanks/.
3. Если письмо не ушло, заявка уже лежит в KV, а посетитель видит успех. Ошибка доставки пишется в лог функции без содержимого заявки.
4. Тема письма: `[MENADD] {founder|investor|other} · {Company} · {Stage} · raised {Capital} · revenue {Revenue} · intro: {Introduced by}`. По теме заявку можно оценить, не открывая письмо.
5. Reply-To письма равен email посетителя.
6. Защита от спама: скрытое поле-ловушка, Cloudflare Turnstile, ограничение частоты отправок с одного IP.
7. Ключи Resend и Turnstile хранятся в переменных окружения Cloudflare Pages и не попадают в репозиторий. Codex даёт пошаговую инструкцию: аккаунт Resend, DNS-записи домена, ключи.
8. Обязательные поля проверяются и в браузере, и в функции. Ошибка показывается рядом с полем.
9. Автоматических отказов нет. Все заявки доходят до почты, решение принимает Геннадий.
10. На этапе аудита Codex подтверждает, что Resend и KV ложатся на репозиторий. Если в существующей инфраструктуре есть путь проще, он предлагает его до начала этапа 3.

**Решения после аудита:**

- Функция `functions/api/enquiry.ts`. Turnstile и Resend вызываются обычным fetch, без SDK и новых зависимостей. Образец вызова Resend есть в workers/monthly-report.
- Отдельный KV binding `ENQUIRIES`. `SUBSCRIBERS` для заявок не использовать. Ключи ограничения частоты хранятся в `ENQUIRIES` с TTL один час.
- Письмо: From `MENADD Enquiries <enquiries@menadd.com>`, To `gennady@menadd.com`, Reply-To равен email посетителя. Домен menadd.com уже подтверждён в Resend, на нём работает месячный отчёт.
- Секрет `RESEND_API_KEY` нужно отдельно добавить в Cloudflare Pages. Секрет Worker'а туда не переходит.

## 8. Остальные страницы

Точечные правки. Всё, что здесь не названо, остаётся как есть.

### About

- Вверху добавить фото, квадратная версия, слева от первого абзаца.
- Первый абзац заменить на: «I am Gennady Shafir, a CFO and board advisor working between the UAE, London and Luxembourg. MENADD is where I write down what I have learned.»
- Разделы Track record, Board Work, Why this site exists, Focus оставить дословно.
- Удалить строку «Seats are taken on a fee, equity or combined basis.» Форму сделки сайт не объявляет.
- Раздел Contact: убрать ссылку на календарь. Оставить email и LinkedIn, добавить кнопку «Start a conversation».

Новый блок в конце страницы, перед Contact. Его копируют те, кто рекомендует Геннадия:

**H2:** Introducing me to someone

**Вводная строка:** A short version you can copy.

**Текст:** Gennady Shafir is a CFO and board advisor working between the UAE, London and Luxembourg. He has been CEO, COO and CFO in venture-backed companies, including a B2B e-commerce business built to over $50M in annual revenue and a hardware company scaled through a Series B at a valuation above $100M. He works with founders and investors on finance, ownership and cross-border structure, usually before a financing round. menadd.com

### Library и разделы библиотеки

Без изменений. Меняется только шапка и футер.

### Статьи

Тексты статей не трогать. Заменить только блок в конце каждой статьи, который сейчас называется «What do these terms mean for your company?»:

**H2:** If this is your situation

**Текст:** Tell me what is in front of you. A short form, two minutes. I read every enquiry myself.

**Кнопка:** Start a conversation

Строка автора под заголовком статьи остаётся: «By Gennady Shafir, CFO and Board Advisor».

### Structure check (/assessment/structure/)

Остаётся в меню как вход для тех, кто не готов писать. На экране результата заменить текущий призыв на кнопку «Start a conversation» со ссылкой на /start/. Заменить «talk to us» и любое «we» на первое лицо.

### Investor readiness (/assessment/)

Убрать из меню. Страница остаётся доступной по ссылке из раздела Cash & Finance и из исходной статьи. Заменить «talk to us instead» на «tell me about it instead» со ссылкой на /start/. Убрать ссылку на календарь.

### Cap table migration (/carta/)

Убрать из меню, оставить `noindex`. Заменить «MENADD reconstructs», «MENADD does» и подобное на первое лицо. Кнопку «Book a readiness call» заменить на «Start a conversation» со ссылкой на /start/.

### Privacy

Добавить абзац: «Enquiry form. I use the information you send only to review and reply to your enquiry. It is processed by the service providers that deliver the form and the email, kept for up to 30 days as a delivery backup, and is not added to a mailing list.»

## 9. Дизайн

Стиль не ломаем: сдержанный редакционный сериф подходит к регистру investor memo. Добавляем автора, акцент, сетку и экспонаты.

**Телефон первым.** Главный сценарий: ссылку переслали в мессенджере и открыли с телефона. Каждый блок сначала проектируется на 375 px, потом расширяется до десктопа. На телефоне первый экран показывает имя, первую строку, фото и кнопку без прокрутки.

**Мобильные правила после проверки этапа 2:**

- Первый экран на телефоне: сверху строка с фото 96×120 px слева и надстрочником справа в три строки. Ниже H1 34–36 px, подзаголовок 17 px, две кнопки рядом по половине ширины. На видимой области 375×640 px кнопки видны целиком без прокрутки.
- Горизонтальный отступ шапки равен отступу контента на всех страницах.
- Стили hover применяются только внутри `@media (hover: hover)`, чтобы после касания рамки не залипали.
- У карточек ситуаций после заголовка стоит стрелка «→» цветом акцента: это показывает, что карточка ведёт дальше.
- Кейсы не в рамках. Они разделены тонкими линиями, заголовки кейсов без точки в конце. Так кейсы отличаются от карточек ситуаций, и страница не превращается в столбик одинаковых коробок.

### Токены

| Токен | Значение | Где используется |
| --- | --- | --- |
| Фон | Текущий светлый фон сайта, не менять | Все страницы |
| Текст | #171717, как сейчас | Основной текст, заголовки |
| Вторичный текст | #5F5B53 | Подписи, надстрочники, мета |
| Линии | #E4E1DA | Разделители, рамки карточек |
| Акцент | #1E3A5F | Ссылки, цифры в полосе, выделенная серия на графике |
| Акцент при наведении | #152B47 | Hover у ссылок |
| Главная кнопка | Фон #171717, текст светлый | «Start a conversation» |
| Вторичная кнопка | Прозрачный фон, рамка #171717 | «Read the library» |

**Шрифты.** Без веб-шрифтов. Заголовки и основной текст: текущий системный сериф (ui-serif, Georgia). Меню, кнопки, надстрочники, цифры, подписи к графикам: системный гротеск (system-ui).

**Сетка.** Главная, Work, For investors, Start: контейнер до 1120 px, 12 колонок. Статьи и About: текущая узкая колонка до 680 px. Отступы между блоками главной: 96 px на десктопе, 56 px на мобильном.

**Кнопки.** Высота 44 px минимум, скругление 4 px. Любой призыв к действию это кнопка, а не строка текста.

**Карточки.** Рамка 1 px цветом линий, без теней. При наведении рамка темнеет до #171717. Карточка ситуации кликабельна целиком.

### Фото

- Первый экран: вертикальный кадр 4:5, плотная обрезка по голове и плечам. Колонка фото занимает 5 из 12 колонок.
- About: квадрат 1:1, 240 px.
- Astro Image, форматы AVIF и WebP, ширины 480, 800, 1200. На первом экране `loading=eager` и `fetchpriority=high`.
- Alt: «Gennady Shafir».
- Никаких фильтров, рамок, круглых масок и декоративных подложек.

### Экспонаты

Два графика на реальных цифрах из статьи «How Founders Lose a Company in Three Years». Рисуются как инлайн SVG без библиотек, с текстовой альтернативой.

**Экспонат 1. Founders' combined ownership.** Ступенчатая линия, пять точек. Стоит на главной, блок 5.

| Этап | Доля фаундеров |
| --- | --- |
| Year 0. The split | 100% |
| Year 1. Pre-seed | 85.0% |
| Year 1. Seed | 59.5% |
| Year 2. Series A | 40.5% |
| Year 3. Recapitalisation | 16.5% |

Последняя точка выделена акцентом и подписана крупно. Ось Y от 0 до 100%.

**Экспонат 2. Who owns the company after the recapitalisation.** Одна горизонтальная полоса на 100%, восемь сегментов. Стоит на Work в блоке #financing.

| Держатель | Доля |
| --- | --- |
| Recap investor | 50.8% |
| Bridge note | 10.2% |
| Founder 1 | 9.9% |
| Seed VC | 7.9% |
| Series A lead | 7.0% |
| Founder 2 | 6.6% |
| ESOP | 4.7% |
| Angels | 2.9% |

Два сегмента фаундеров выделены акцентом, остальные в оттенках серого. Подпись: «The emergency lender now holds more of the company than either founder. Synthetic numbers, real mechanics.»

Других графиков, иконок, иллюстраций и стоковых фото на сайте нет.

### OG-картинки

- Для каждой статьи JPEG-картинка 1200×630 размером меньше 200 KB генерируется при сборке: название раздела, заголовок статьи, внизу «Gennady Shafir · MENADD». Светлый фон, сериф, без фото.
- Для Home, Work, For investors, About, Start: одна общая JPEG-картинка 1200×630 размером меньше 200 KB. Слева фото, справа имя «Gennady Shafir», строка «CFO and board advisor» и первая строка «I read the cap table before I read the plan.» Получатель ссылки в WhatsApp или LinkedIn должен понять, кто это, не открывая сайт. og:title главной: «Gennady Shafir | CFO and Board Advisor».

### Чего не делаем

Анимации при прокрутке, градиенты, тени, слайдеры, иконки, логотипы клиентов, счётчики, всплывающие окна, чат-виджеты, тёмная тема.

## 10. Техника

Стек остаётся: Astro, Cloudflare Pages. Новых зависимостей по минимуму.

**SEO**

- Title и meta description для Home, Work, For investors, Start берутся из разделов 4–7. У остальных страниц остаются текущие.
- У каждой страницы canonical на собственный URL со слешем в конце.
- `noindex`: /carta/, /start/thanks/.
- Sitemap пересобрать: добавить /work/, /investors/, /start/, убрать /financing-terms/.
- На странице один H1. Иерархия заголовков без пропусков.

**Разметка**

- Home и About: JSON-LD типа Person. Поля: name «Gennady Shafir», jobTitle «CFO and Board Advisor», url сайта, sameAs со ссылкой на LinkedIn.
- Статьи: JSON-LD типа Article с автором, датой и заголовком, если его ещё нет.

**Аналитика**

- Cloudflare Web Analytics уже включена через панель Cloudflare: по ней работает месячный отчёт из workers/monthly-report. В код ничего не добавлять.
- Два числа, ради которых всё делается: просмотры /start/ и просмотры /start/thanks/ (это число отправленных анкет). Клики по календарю не отслеживаются, звонки видны в самом календаре.

**Производительность и доступность**

- Lighthouse на мобильном: Performance от 95, Accessibility от 95.
- Никакого клиентского JavaScript, кроме переключателя полей и отправки анкеты, мобильного меню, Turnstile и существующих калькуляторов.
- Контраст текста от 4.5:1. Видимый фокус на всех интерактивных элементах. Форма проходится с клавиатуры, у каждого поля есть label.
- Проверка на ширинах 375, 768, 1280 и 1440 px. Горизонтальной прокрутки нет нигде.

## 11. Порядок сборки и приёмка

Восемь этапов, один промпт на этап. Следующий этап запускается только после проверки предыдущего. Так ошибка не размножается по всему сайту.

**Общая вводная для каждого промпта.** Вставлять в начало:

> You are rebuilding menadd.com (Astro, Cloudflare Pages) according to the attached specification. Use the English copy verbatim. Do not rewrite, shorten or improve it. Do not edit article bodies under /library/. Do not add copy, numbers, sections, icons or dependencies that are not in the specification. If something is missing or conflicts with the existing code, stop and ask. At the end, list every file you changed and anything you could not do.

| Этап | Что делает Codex | Разделы | Как проверить |
| --- | --- | --- | --- |
| 0. Аудит | Ничего не меняет. Описывает структуру репозитория: layout, компоненты шапки и футера, токены стилей, как сделана подписка, где лежат статьи, есть ли аналитика, какой каталог и какая ветка актуальны, есть ли незакоммиченные изменения, существует ли /notes/, где живут Functions и KV |  | Отчёт прочитан, сюрпризов нет |
| 1. Каркас | Токены, кнопки, карточки, единая шапка и футер на всех страницах | 2, 9 | Меню одинаковое на Home, About, статье, Carta |
| 2. Главная | Одиннадцать блоков с текстом и фото | 4, 9 | Сверка с разделом 4 слово в слово |
| 3. Анкета | /start/, /start/thanks/, Pages Function, Turnstile, Resend, копия в KV. Даёт инструкцию по аккаунту Resend, DNS и ключам | 7 | Тестовая заявка пришла на почту с правильной темой |
| 4. Work | /work/, редирект с /financing-terms/, замена внутренних ссылок | 5, 2 | Старый URL отдаёт 301 |
| 5. For investors | /investors/ | 6 | Кнопка открывает анкету с выбранным Investor |
| 6. Точечные правки | About, блок в конце статей, оба Assessment, Carta, Privacy | 8, 3 | Поиск по сайту не находит «our», «MENADD helps» и «we» в значении фирмы вне статей |
| 7. Экспонаты и OG | Два графика, OG-картинки | 9 | Ссылка на статью в LinkedIn показывает свою картинку |
| 8. Проверка | SEO, разметка, sitemap, Lighthouse, ширины экрана | 10 | Чек-лист ниже закрыт |

### Чек-лист приёмки

- [ ] На первом экране главной видны имя, фото, первая строка и кнопка, без прокрутки на 1280 px и на 375 px
- [ ] Тексты Home, Work, For investors, Start совпадают со спецификацией дословно
- [ ] Шапка и футер одинаковые на всех страницах
- [ ] «Start a conversation» есть в шапке каждой страницы и ведёт на /start/
- [ ] Ссылка на календарь есть только на /start/thanks/
- [ ] Анкета проходится с клавиатуры, ошибки показываются у полей, данные при ошибке не теряются, без JavaScript виден email
- [ ] Тестовая заявка founder и тестовая заявка investor пришли на почту и легли в KV. Имя из поля «Introduced by» видно в теме письма
- [ ] /financing-terms/ отдаёт 301 на /work/, битых внутренних ссылок нет
- [ ] Вне статей нет «our» и «we» в значении фирмы, длинных тире, цен, слов fractional и retainer
- [ ] Тексты статей не изменились: diff по папке со статьями пустой, кроме блока в конце
- [ ] /carta/ и /start/thanks/ закрыты от индексации, sitemap обновлён
- [ ] У каждой статьи своя OG-картинка. Ссылка на главную в WhatsApp и LinkedIn показывает фото и имя
- [ ] Lighthouse на мобильном: Performance от 95, Accessibility от 95
- [ ] Нет горизонтальной прокрутки на 375, 768, 1280, 1440 px

### Накопленные правки для этапа 8

Мелочи, найденные при проверке этапов. Они не ломают сайт и исправляются одним заходом на этапе 8.

- [ ] Главная, мобильная версия: под кнопкой финального блока две линии-разделителя подряд с пустым местом между ними. Оставить одну.
- [ ] Главная, блок подписки: слишком большие пустые отступы между формой, строкой «New material goes to this list…» и футером. Сократить примерно вдвое.
- [ ] Проверить зависимости: в package.json нет новых пакетов относительно main. Единственное допустимое изменение — `publicHoistPattern: sharp` в pnpm-workspace.yaml.
- [ ] Заменить ключ Resend у месячного отчёта (workers/monthly-report) на новый. Старый ключ засвечен, после замены Геннадий отзывает его в Resend.
- [ ] Главная, десктоп: блок «And the term sheets» сдвинут вправо примерно на 40 px относительно сетки кейсов. Левый край выровнять по кейсам, сверху поставить такую же тонкую линию, как между кейсами.
- [ ] Главная, полоса с цифрами: подпись под $10M+ заменить на «Raised. Deep-tech energy, MENA and the EU. CFO.» Слова «with licensing» убрать.
- [ ] Главная, подзаголовок первого экрана: последнее предложение заменить на «UAE, MENA and Europe, and the routes between them through ADGM, DIFC and Luxembourg.»
- [ ] Главная, надстрочник первого экрана: «UAE.» заменить на «UAE, London and Luxembourg.» На мобильном это по-прежнему третья строка. About: первый абзац и абзац «Introducing me to someone» привести к той же формулировке, вместо «based in Abu Dhabi» и «based in the UAE».
- [ ] Главная, блок «Where I fit», колонка «Not a fit»: текст заменить на «An idea that needs a financial model to raise on. A request for investor introductions alone. Work paid only if the round closes.»
- [ ] Главная, карточка «The company is crossing a border»: первое предложение заменить на «Into ADGM or DIFC, under a Luxembourg holding or a BVI holdco.»
- [ ] Страница 404: ссылку «Run the assessment» заменить на «Run the structure check» со ссылкой на /assessment/structure/.
- [ ] Work, блок #border: первое предложение заменить на «A holding in ADGM, DIFC, Luxembourg or the BVI.» Так он совпадает с карточкой на главной.
- [ ] Главная, график «Founders' combined ownership», мобильная версия: подписи оси X налезают друг на друга. Ниже 768 px показывать короткие подписи в одну строку: Split · Pre-seed · Seed · Series A · Recap. Полные подписи с годом оставить на десктопе.
- [ ] Главная, заголовок графика: на телефоне он занимает три строки крупным шрифтом. Оформить его так же, как заголовок графика на Work, тем же размером. Апостроф заменить на типографский: Founders’.

### Правки после запуска

- [ ] График «Founders’ combined ownership»: подписи оси X вынести из SVG в HTML под графиком. Две строки на точку: название стадии (system-ui, 14 px) и год (12 px, вторичный цвет). Ниже 768 px строка с годом скрыта. Контейнер графика не шире 720 px. Заголовок графика того же размера, что на Work. Подписи не налезают друг на друга на 375, 768, 1280 и 1440 px.
- [ ] For investors, десктоп: убрать две колонки. Страница одноколоночная, как Work: H1, вводный абзац, затем разделы в ширину чтения до 720 px.

## 12. Что нужно от тебя до старта

Четыре действия. Все остальные решения приняты и записаны выше.

| Что | Когда |
| --- | --- |
| Фото утверждено: присланный кадр. Codex обрезает тёмную кромку по краю и использует его как есть | Готово |
| Аккаунт Resend, DNS-записи домена и ключи Turnstile. Codex даст пошаговую инструкцию | До этапа 3 |
| Кейсы прочитаны и подтверждены | Готово |
| LinkedIn: заголовок, фото и блок About привести к первому экрану сайта. Рекомендатель отправляет обе ссылки, они должны рассказывать одну историю | Сразу после запуска |

**Про фото.** Кадр подходит по тону: спокойный, без корпоративной постановки. Два замечания. На фоне читается Дубай, поэтому на главной стоит «UAE», а в спецификации задана плотная обрезка по плечам. И картинка выглядит сильно обработанной: кожа и фон слишком гладкие. Для сайта, который продаёт доверие к человеку, живой кадр сработает лучше, если он есть.

**После запуска.** Контентный долг остаётся прежним: разделы Structure & Jurisdiction и MENA Process держатся на одной статье каждый. Следующие четыре статьи идут туда. В эту пересборку они не входят.

## 13. Промпты для Codex

Девять промптов, по одному на этап. Каждый запускается в новой сессии Codex, чтобы контекст был чистым. Спецификация лежит в репозитории как `docs/SPEC.md`, фото как `src/assets/gennady-shafir.jpg`.

### Подготовка. Один раз, до этапа 0

В настольном Codex прикрепить к сообщению файл спецификации и фото, затем отправить этот промпт. После него оба файла лежат в репозитории, и прикреплять их заново не нужно.

```
I have attached two files: the site specification and a portrait photo.

1. Save the specification into the repository as docs/SPEC.md. If it is a .docx, convert it to Markdown and keep every heading, table, code block and all English copy exactly as written. Do not summarise or shorten anything.
2. Save the photo as src/assets/gennady-shafir.jpg at full resolution.
3. Commit both files to main with the message "Add rebuild spec and portrait".
4. Do not change anything else. Confirm the two paths and the size of each file.
```

### Вводная, вставляется в начало каждого промпта

```
You are rebuilding menadd.com (Astro, Cloudflare Pages). The single source of truth is docs/SPEC.md. Read it before doing anything.

Rules:
- Work on the branch `rebuild`. Never commit to main. At the end of every stage from Stage 1 on, push `rebuild` to the remote so Cloudflare Pages builds a preview, and give me the preview URL.
- Use the English copy from the spec verbatim. Do not rewrite, shorten or improve it.
- Do not edit article bodies under /library/.
- Do not add copy, numbers, sections, icons or dependencies that are not in the spec.
- Do only the stage named below. Do not start the next stage.
- If something is missing or conflicts with the existing code, stop and ask.
- When done: list every file you changed, anything you could not do, and how to check the result.
```

### Этап 0. Аудит

```
Stage 0: audit. Do not change any files.

Report:
1. Which directory and branch hold the live site. Any uncommitted changes.
2. The layout, header and footer components and which pages use which.
3. Where style tokens live (colours, fonts, spacing).
4. How the Diligence Notes subscription works. Where Pages Functions and KV bindings live.
5. Where article content lives and how the block at the end of each article is rendered.
6. Whether /notes/ exists and what links to it.
7. Whether any analytics is installed.
8. Whether the Resend plus KV plan in section 7 fits this repository. If there is a simpler path, propose it.
9. Everything in the spec that conflicts with the code or cannot be built as written.

End with a numbered list of questions for me.
```

### Этап 1. Каркас

```
Stage 1: global frame. Spec sections 2 and 9.

Create the branch `rebuild` from main. Implement the design tokens, buttons and cards from section 9. Implement one header and one footer from section 2 and apply them to every page, including articles, /carta/ and both assessment pages. Add the _redirects file. Do not change page copy yet. Links to pages that do not exist yet are fine.
```

### Этап 2. Главная

```
Stage 2: home page. Spec sections 4 and 9.

Rebuild the home page with the blocks from section 4 in the given order. Leave block 5 (the chart) out for now, it is added in stage 7. Use src/assets/gennady-shafir.jpg, cropped as the spec says, trimming the dark edge of the image. Design from 375 px up. On 375 px and on 1280 px the first screen must show the name, the first line, the photo and the button without scrolling. Remove the old home sections listed at the end of section 4.
```

### Этап 3. Анкета

```
Stage 3: enquiry form. Spec section 7.

Build /start/, /start/thanks/ and the Pages Function /api/enquiry exactly as section 7 says: fields, investor variant, ?type=investor, Introduced by, fetch submission, Turnstile, honeypot, rate limit, KV copy with a 30-day TTL, email through Resend, subject line format, noscript fallback.

Before writing code, give me step-by-step instructions for what I must set up by hand: the Resend account, the DNS records for menadd.com, the Turnstile site, and the exact names of the environment variables and KV binding to add in Cloudflare Pages. Wait for me to confirm they are in place. After building, tell me how to send a test founder enquiry and a test investor enquiry on the preview URL.
```

### Этап 4. Work

```
Stage 4: Work page. Spec sections 5 and 2.

Build /work/ with the copy and anchors from section 5. Remove the /financing-terms/ page, confirm the 301 redirect to /work/ works, and replace every internal link to /financing-terms/ across the site, including links inside articles. Leave the chart in the #financing block out for now, it is added in stage 7.
```

### Этап 5. For investors

```
Stage 5: investors page. Spec section 6.

Build /investors/ with the copy from section 6. The button links to /start/?type=investor and the form opens with Investor selected.
```

### Этап 6. Точечные правки

```
Stage 6: edits to existing pages. Spec sections 8 and 3.

Apply the edits from section 8 to About, the block at the end of every article, both assessment pages, /carta/ and Privacy. Then apply the text rules from section 3 to every page except article bodies. Finish by searching the built site for: "MENADD helps", "MENADD provides", "our team", "talk to us", the calendar URL, em dashes outside articles. Report every remaining hit.
```

### Этап 7. Экспонаты и OG

```
Stage 7: charts and link previews. Spec section 9.

Build the two charts as inline SVG from the data tables in section 9, with text alternatives. Place chart 1 in home block 5 with its caption and link. Place chart 2 in the #financing block on /work/. Generate a per-article OG image at build time and the shared OG image with the photo for Home, Work, For investors, About and Start. Tell me how to preview the OG images.
```

### Этап 8. Проверка

```
Stage 8: QA. Spec sections 10 and 11.

Implement the SEO, structured data, sitemap and analytics items from section 10 that are not done yet. Then go through the acceptance checklist in section 11 item by item and report pass or fail for each, with evidence. Fix every failure and report again. Run a diff on the article content folder against main and confirm only the end-of-article block changed. Do not merge into main.
```
