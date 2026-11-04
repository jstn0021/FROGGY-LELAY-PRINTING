# Tinta Printing (React + Vite)

Website para sa isang printing shop. Sample lang ang mga presyo at contact details.

## Patakbuhin

Kailangan ng Node.js 18 o mas bago.

```bash
npm install
npm run dev
```

Buksan ang link na lalabas sa terminal (karaniwan `http://localhost:5173`).

Para sa production build:

```bash
npm run build     # lalabas sa dist/
npm run preview   # subukan ang build
```

## Istruktura

```
src/
  main.jsx            entry point
  App.jsx             pinagsama-samang sections
  styles.css          lahat ng styles (colors at fonts nasa :root sa taas)
  data/products.js    mga produkto at presyo (dito mag-edit)
  utils/format.js     peso() formatter
  components/
    Header, Hero, Services, Estimator, FilePrep, Steps, Contact, Footer
    SectionHead       maliit na reusable heading
```

## Mga papalitan

- **Presyo at produkto:** `src/data/products.js`. Sabay na magbabago ang service cards at ang quote estimator.
- **Pangalan ng shop:** `Header.jsx`, `Footer.jsx`, `Estimator.jsx` (sa summary text) at `index.html` (title).
- **Contact details:** `src/components/Contact.jsx`.
- **Kulay:** mga `--accent`, `--c`, `--m`, `--y` sa `:root` ng `src/styles.css`. May light at dark na bersyon.
