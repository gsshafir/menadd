# Ежемесячный отчёт menadd.com

Отдельный Cloudflare Worker собирает данные Cloudflare Web Analytics за прошлый календарный месяц в часовом поясе `Europe/London` и отправляет русскоязычный отчёт через Resend. Worker деплоится отдельно от Cloudflare Pages и не участвует в сборке сайта.

## Расписание

Cron `0 6 1 * *` запускает Worker первого числа каждого месяца в 06:00 UTC. Ручной вызов:

```text
GET https://<worker-url>/run?key=<TRIGGER_KEY>&month=YYYY-MM
```

Например, для сентября 2026 года укажите `month=2026-09`. Неверный ключ возвращает HTTP 403, неверный или отсутствующий месяц — HTTP 400.

## Настройки

Обычные настройки находятся в `wrangler.toml`. Чтобы поменять получателя, измените `REPORT_TO` и снова выполните деплой из этой папки:

```powershell
..\..\node_modules\.bin\wrangler.CMD deploy
```

Секреты никогда не должны попадать в файлы. Создавайте и обновляйте их только интерактивной командой `wrangler secret put`:

```powershell
..\..\node_modules\.bin\wrangler.CMD secret put CF_API_TOKEN
..\..\node_modules\.bin\wrangler.CMD secret put RESEND_API_KEY
..\..\node_modules\.bin\wrangler.CMD secret put TRIGGER_KEY
```

- `CF_API_TOKEN` — токен Cloudflare с правом `Account Analytics: Read`.
- `RESEND_API_KEY` — API-ключ Resend для подтверждённого домена отправителя.
- `TRIGGER_KEY` — длинная случайная строка для ручного URL.

`.dev.vars` игнорируется Git и предназначен только для локальной отладки, но рабочие секреты в него записывать не следует.

Перед сбором Worker через GraphQL introspection проверяет используемые поля, включая `avg.sampleInterval`. В письме отдельно показаны оценка Cloudflare и число реально прочитанных записей (`count / sampleInterval`).

День исключается как аномальный, только если в нём не менее трёх реальных записей и все записи имеют одну страну, один браузер и ОС, а referer пуст. Отдельный блок предупреждает, если одна такая комбинация охватывает не менее 80% визитов месяца.

Отчёт содержит топ-10 ненулевых строк каждого рейтинга. Страницы `/financing-terms/`, `/carta/`, `/assessment/`, `/assessment/structure/` вынесены в отдельный блок и показываются даже с нулевыми значениями. `linkedin.com` выделяется жирным, если входит в топ источников.

## Проверка

```powershell
node --check src/index.js
node --test test/*.test.js
```

Перед каждым коммитом проверьте `git diff` и убедитесь, что в изменениях нет значений секретов.
