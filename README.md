# ОСЬМИНОГ — сайт лиги

Публикация: https://siptoplov.github.io/osminog-10/

- Корень репозитория — собранный статический сайт для GitHub Pages (`.nojekyll`).
- `source/` — исходники (Next.js 16, TypeScript, Tailwind). Сборка под этот адрес:

```bash
cd source
npm install
NEXT_PUBLIC_BASE_PATH=/osminog-10 NEXT_PUBLIC_SITE_URL=https://siptoplov.github.io/osminog-10 npm run build
# результат — папка out/
```

Формы заявок на GitHub Pages работают в запасном режиме (текст для Direct): серверной части на Pages нет. Приём заявок через Telegram-бота — `source/public/api/apply.php` (для обычного хостинга с PHP) или `source/netlify/functions/apply.mts` (для Netlify).

Предыдущая версия сайта сохранена в теге `backup-old-site-2026-11-05`.
