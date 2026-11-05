# Lelay Store, Ink & Crafts

React + Vite website na may order form, admin dashboard, at email sa customer kapag ready na ang order.
Supabase ang database, Vercel ang hosting, Gmail ang nagpapadala ng email.

## Mga page

| Link | Para kanino | Ano ito |
|---|---|---|
| `/` | Customer | Home, price list, mga tips, contact |
| `/order` | Customer | Order form (may live na estimate ng presyo) |
| `/admin/login` | Admin | Login |
| `/admin` | Admin | Orders dashboard at Cover page editor |

## Setup (isang beses lang)

### 1. Supabase
1. Gumawa ng project sa supabase.com.
2. **Authentication → Users → Add user**: gawin ang account ng admin (email at password). Gamitin ito sa `/admin/login`.
3. **Authentication → Sign In / Providers → Email**: i-ON ang "Allow new users to sign up" (kailangan para gumana ang Sign up sa `/admin/login`). Kahit sino ay makakagawa ng account, pero wala silang makikita hangga't hindi sila inaaprubahan sa **Admin → Admins** tab (o nasa `admins` table).
4. Buksan ang `supabase/schema.sql`. Palitan ang `YOUR_ADMIN_EMAIL@example.com` ng email ng admin (lowercase). Kopyahin lahat sa **SQL Editor → New query → Run**.
5. I-run din ang `supabase/update-2-uploads-signup.sql` (SQL Editor). Ito ang gumagawa ng private `order-files` bucket (100 MB limit) at ng mga bagong column.
   > Ang Supabase **Free plan ay 50 MB lang** kada file. Para sa 100 MB, mag-Pro plan, tapos **Storage → Settings → Global file size limit** = 100 MB.
6. **Project Settings → API**: kunin ang Project URL, `anon` key, at `service_role` key.

### 2. Gmail (para sa email)
1. Sa Google account na magpapadala ng email, i-on ang **2-Step Verification**.
2. Pumunta sa myaccount.google.com/apppasswords, gumawa ng App Password (16 characters). Ito ang `GMAIL_APP_PASSWORD`. Hindi ito ang normal na password ng Gmail.

### 3. Vercel
Sa **Project Settings → Environment Variables**, idagdag ang mga ito (tingnan ang `.env.example`):

| Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | Project URL |
| `VITE_SUPABASE_ANON_KEY` | anon key |
| `SUPABASE_URL` | Project URL (pareho) |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key |
| `GMAIL_USER` | Gmail address na magpapadala |
| `GMAIL_APP_PASSWORD` | 16-character app password |
| `STORE_NOTIFY_EMAIL` | (optional) saan darating ang "New order" alert. Default: `GMAIL_USER` |
| `STORE_ADDRESS` | (optional) address ng shop, lalabas sa email |
| `STORE_HOURS` | (optional) oras ng shop, lalabas sa email |

Pagkatapos magdagdag ng variables, mag-**Redeploy**.

> Ang `SUPABASE_SERVICE_ROLE_KEY` ay secret. Huwag lagyan ng `VITE_` at huwag i-commit.

## Patakbuhin sa computer

```bash
npm install
cp .env.example .env     # ilagay ang VITE_SUPABASE_URL at VITE_SUPABASE_ANON_KEY
npm run dev
```

Gumagana na ang order form, dashboard at cover editor. Ang **email button** ay `api/notify.js`, na tumatakbo lang sa Vercel.
Para subukan ito sa computer, ilagay ang lahat ng variables sa `.env` at patakbuhin ang `npx vercel dev` (sa halip na `npm run dev`).

## Paano gamitin ang dashboard

Status ng order: **Pending → Ongoing → Ready for pickup → Finished**.

- **Start (ongoing)**: sinimulan na ang trabaho.
- **Ready for pickup + email**: nagpapadala ng email sa customer (presyo, discount, total, at optional na message), tapos nagiging "Ready".
- **Discount %**: ilagay bago pindutin ang email. Ang total ay kinukwenta ng database.
- **Resend email**: kapag nagbago ang discount pagkatapos mag-email.
- **Finish**: kapag kinuha na ng customer.
- **Delete** at **Delete all finished**: pambura para hindi mapuno ang Supabase. Lumalabas ang paalala kapag may finished orders.
- Ang **Cover page** tab ay para baguhin ang headline, description, "New offer" banner, at ang tatlong kahon sa home page.

Optional: sa dulo ng `supabase/schema.sql` may naka-comment na SQL para awtomatikong burahin ang finished orders pagkalipas ng 7 araw.

## Mga papalitan

- **Presyo at produkto:** `src/data/products.js` (sabay na magbabago ang price list at ang order form).
- **Contact details:** `src/components/Contact.jsx`.
- **Kulay at font:** `:root` sa taas ng `src/styles.css`.
- **Logo:** `public/logo.jpg` at `public/favicon.png`.

## Istruktura

```
api/notify.js          "ready for pickup" email sa customer (admin lang)
api/order-received.js  "natanggap namin ang order" email sa customer + alert sa shop
api/_email.js          laman ng email
supabase/schema.sql    tables at security rules
src/pages/             Home, Order
src/admin/             Login, Orders dashboard, Cover editor
src/lib/               Supabase client, cover settings
vercel.json            para gumana ang /order at /admin sa Vercel
```
