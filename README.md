# ARK – Síla & Fyzio (arksf.cz)

Web postavený v [Astru](https://docs.astro.build): obsah je v datových souborech, vzhled v tokenech a komponentách. Výsledkem jsou obyčejné statické stránky (`/`, `/spoluprace.html`, `/o-nas.html`, `/kontakt.html`, `/rezervace.html`, `/vop.html`), které hostuje GitHub Pages.

## Spuštění na počítači

Potřebuješ [Node.js](https://nodejs.org) 20 nebo novější.

```
npm install        # jednou, stáhne závislosti
npm run dev        # vývojový server na http://localhost:4321, změny se ukazují hned
npm run build      # kontrola tokenů + sestavení do složky dist/
npm run preview    # prohlédnout si sestavený web z dist/
```

## Zveřejnění

Každý push do větve `main` web sám sestaví a zveřejní (GitHub Actions, `.github/workflows/deploy.yml`). Průběh je v záložce **Actions** na GitHubu. Když sestavení selže (třeba kvůli chybě v datech), zůstává online předchozí verze.

Jednorázové nastavení: v repozitáři **Settings → Pages → Build and deployment → Source** musí být **GitHub Actions**.

## Kde co je

```
src/
  data/          OBSAH: texty, ceny, tým, kontakty, pravidla (JSON)
  assets/team/   fotky týmu (originály, web si z nich udělá menší verze)
  styles/
    tokens.css   VZHLED: barvy, písma, velikosti, mezery, zaoblení, stíny, animace
    base.css     základní styly stránky (písmo, nadpisy, kontejner, animace při rolování)
  components/    stavební bloky (tlačítko, navigace, patička, karty...)
    home/        sekce hlavní stránky
    booking/     části stránky Rezervace
    legal/       části obchodních podmínek
  layouts/Base.astro   hlavička stránky (titulek, popis, písma, sdílení)
  pages/         jednotlivé stránky: index.astro, rezervace.astro, vop.astro
  lib/content.ts načítá a kontroluje data
public/          soubory, které jdou na web beze změny (favicon, CNAME, robots.txt)
scripts/lint-tokens.mjs  kontrola, že komponenty používají tokeny
```

### Úprava obsahu (nejčastější)

Všechno se mění v `src/data/`, ne v komponentách:

| Co | Soubor |
|---|---|
| Ceny, položky ceníku, základní informace | `pricing.json` (cena je číslo, např. `1600`; web ji vypíše jako „1 600 Kč“) |
| Pravidla: storno 24 h, 4,3 týdne, náhrady do 3 měsíců, max. 5 náhrad, max. osob ve skupině, platnost VOP | `rules.json` (propíše se na hlavní stránku i do obchodních podmínek) |
| Tým: jména, role, štítky, medailonky, fotky | `team.json` (fotka = název souboru v `src/assets/team/`) |
| Adresa, e-mail, otevírací doba, Instagram, odkazy na Fyzion, Formspree | `site.json` |
| Texty sekcí hlavní stránky | `home.json` |
| Stránka Rezervace | `booking.json` |
| Obchodní podmínky | `terms.json` |
| Menu a odkazy v patičce | `nav.json` |
| Fotky na webu (hlavní, služby, prostor, kontakt) | `photos.json` + soubory v `src/assets/photos/` (prázdné = zástupný rámeček) |
| Recenze na hlavní stránce | `reviews.json` (`items`: jméno, text, hvězdy 1–5, zdroj, datum; `googleUrl` = odkaz „Všechny recenze na Googlu“). Bez recenzí se sekce neukáže. |
| Texty podstránek Spolupráce, O nás, Kontakt | `pages.json` |
| Instagram (aktuality) | `site.json` → `instagramFeed`: adresa JSON feedu (např. Behold.so). Příspěvky se stáhnou při sestavení webu; bez feedu sekce ukáže jen odkaz na profil. |

V textech lze použít zástupné značky z `rules.json`, např. `{cancelHours}` nebo `{weeksPerMonth}`, a odkazy ve tvaru `[text odkazu](vop.html)`. Když v datech něco chybí nebo má špatný tvar (cena jako text, neznámá ikona, neznámá značka), `npm run build` skončí chybou s popisem, kde je problém, a nic se nezveřejní.

**Nový člen týmu:** fotku (na výšku, cca 900 × 1090 px) ulož do `src/assets/team/`, v `team.json` zkopíruj jeden blok, změň `id` (malými písmeny bez diakritiky), texty a `photo`. Volitelně `photoPosition` (např. `"center 15%"`) posune výřez fotky.

### Úprava vzhledu

- Tokeny v `src/styles/tokens.css` mají **dvě vrstvy**:
  1. **Primitivy**: paleta a škály bez významu (`--violet-600`, `--coral-400`, `--size-16`, `--space-24`…). Pro jiný web stačí změnit tuhle vrstvu (barvy, písma).
  2. **Sémantika**: role, které používají komponenty (`--color-text`, `--color-text-muted`, `--color-brand`, `--color-surface-inverse`, `--text-base`, `--text-h2`, `--radius-lg`, `--shadow-md`, `--space-section`…).
- Komponenty používají **jen sémantické tokeny**, plus škálu mezer `--space-4` … `--space-120` (po 4 px). `npm run lint:tokens` (spouští se i při `npm run build`) ohlásí surovou hodnotu (barva, velikost písma, mezera…), primitivum použité v komponentě i neexistující token. Rozměry konkrétního prvku (šířka, výška) mohou zůstat v komponentě.
- Škály: písmo `xs` 12 · `sm` 14 · `base` 16 · `lg` 18 · `xl` 20 · `2xl` 24 · `3xl` 32 + fluidní `h1` a `h2`; zaoblení `sm` 8 (tlačítka, inputy) · `md` 12 (dlaždice) · `lg` 16 (karty) · `xl` 24 (modální okna, velké panely); stíny `sm` · `md` · `lg` · `xl`.
- Korálová `--color-accent` (#FF6B6B) je barva značky: tlačítka, štítky, akcenty. Text na korálové je vždy tmavý (`--color-text-on-accent`, kontrast 6,9 : 1); bílý text na korálové má jen 2,8 : 1, proto se nepoužívá.
- Zlomy pro mobil a tablet jsou tři: 1024, 900 a 768 px (vypsané v hlavičce `tokens.css`).
- Ikony jsou v `src/components/icons.ts` (čárové ikony 24 × 24, např. z [Lucide](https://lucide.dev)); používají se `<Icon name="..." />`.
- Tlačítka vždy přes `<Button>`: varianty `primary` (plná fialová, jako jediná má světelný přejezd), `secondary` (fialový obrys), `soft` (světle fialová), `accent` (korálová s tmavým textem); velikosti `sm` 40 · `md` 48 · `lg` 56 px; `block` (celá šířka) a `blockOnMobile` (celá šířka pod 768 px).
- Štítek (pilulka) přes `<Badge>`: `tone="light" | "dark"`, volitelně `dot` (pulzující tečka).

### Nová sekce na hlavní stránce

1. Texty přidej do `src/data/home.json` (nový klíč, např. `"faq": { ... }`).
2. Vytvoř `src/components/home/Faq.astro`. Jako vzor poslouží `Services.astro`: data načti z `../../lib/content`, nahoru dej `<SectionHeader>`, styly piš do `<style>` v té samé komponentě (platí jen pro ni) a jen s tokeny.
3. Vlož `<Faq />` na požadované místo v `src/pages/index.astro`. Pokud má být v menu, doplň ji do `src/data/nav.json` (`sections` a `headerSections` / `footerSections`) a dej sekci stejné `id`.

### Nová stránka

1. Vytvoř `src/pages/nazev.astro` podle `vop.astro`: obal `<Base title="..." description="..." path="/nazev.html">`, pod tím `<Navbar variant="back" />`, obsah a `<Footer variant="page" />`. Stránka bude na adrese `/nazev.html`.
2. Adresu přidej do seznamu v `src/pages/sitemap.xml.ts`.
3. Odkaz na ni přidej do `src/data/nav.json` (např. `clientLinks`).

## Náhled se zástupnými prvky

`PUBLIC_PREVIEW=1 npm run build` (nebo `PUBLIC_PREVIEW=1 npm run dev`) ukáže ukázkové recenze a dlaždice Instagramu, aby šlo posoudit rozložení. Běžný build (a živý web) je nikdy neukáže.

## Dobré vědět

- Formulář odesílá přes Formspree (adresa v `site.json`), rezervace a klientská zóna jsou na Fyzionu (`arksf.fyzion.cz`).
- Patička je na všech stránkách stejná (`<Footer />`). Odkazy na sekce si sama přizpůsobí: na hlavní stránce `#sekce`, jinde `index.html#sekce`. Seznam je v `nav.json` (`footerSections`).
- Doména `arksf.cz` je v `public/CNAME`.
