# ARK – Síla & Fyzio (arksf.cz): pravidla pro Clauda

Statický web v Astru, hostovaný na GitHub Pages. Strukturu projektu (kde je obsah, tokeny, komponenty, jak přidat sekci nebo stránku) popisuje [README.md](README.md): přečti ho před první změnou. Tady jsou jen pravidla, jak na webu pracovat.

## Obsah, vzhled a struktura zvlášť

- **Obsah jen v `src/data/*.json`.** Texty, ceny, tým, kontakty a pravidla nikdy nepiš přímo do komponent. Údaj, který je na víc místech (cena, storno, počet náhrad), existuje jednou a čte se z dat.
- **Vzhled jen přes tokeny ze `src/styles/tokens.css`.** Komponenty používají `var(--...)`, žádné surové barvy, velikosti písma, mezery, zaoblení ani stíny. Chybí hodnota? Nejdřív přidej token, pak ho použij.
- **Komponenty znovu, ne kopie.** Než vytvoříš nový blok, podívej se, jestli už neexistuje (`Button`, `SectionHeader`, karty...). Tlačítko je vždy `<Button>`. Styly patří do `<style>` v komponentě, které se týkají.
- **Nestav na rozbité struktuře.** Když úprava narazí na něco, co je postavené špatně (zkopírovaný blok, údaj natvrdo, hodnota mimo tokeny), oprav nejdřív strukturu, pak dělej úpravu.

## Vzhled se mění jen záměrně

- Úklid, refaktoring nebo oprava nesmí změnit, jak web vypadá. Pokud změní, je to chyba.
- Změna designu se dělá vědomě a řekne se předem, co se změní a kde.

## Kvalita

- **Nejdřív mobil.** Většina návštěvníků přijde z telefonu. Každou změnu zkontroluj na šířce 390 px a na desktopu (1440 px), plus na zlomech 768, 900 a 1024 px.
- **Ovladatelnost:** klikací prvky jsou skutečná tlačítka nebo odkazy (jdou z klávesnice), nové dotykové cíle mají aspoň 44 px, obsah je vidět i bez JavaScriptu.
- **Obrázky** jako soubory přes `astro:assets` (zmenšené verze, `width`/`height`, lazy loading pod prvním zobrazením), nikdy vložené do HTML.
- Každá stránka má vlastní `<title>` a popis (přes `Base.astro`).

## Postup práce

1. Pracuj na vlastní větvi, ne přímo v `main`. **`main` je živý web:** každý push do něj se během pár minut zveřejní.
2. Před commitem spusť `npm run build`. Kontroluje tokeny i data a při chybě nic nesestaví.
3. Malé commity s jasnou zprávou, co a proč.
4. Změnu do `main` dostaň přes pull request. Po sloučení zkontroluj, že běh v záložce **Actions** prošel a že živý web vypadá správně.

## Nesahat bez důvodu

- `public/CNAME` (doména) a `.github/workflows/deploy.yml` (zveřejňování).
- Adresa formuláře Formspree a odkazy na Fyzion v `src/data/site.json`.
- Do repozitáře nikdy nepatří hesla, klíče ani tokeny služeb.

## Dokumentace

README a tento soubor popisují, jak to je teď. Když změníš strukturu (nový datový soubor, nová komponenta, jiný postup), uprav README ve stejném commitu. Žádná historie ani zápis toho, co se zkoušelo. Obsah webu je česky.
