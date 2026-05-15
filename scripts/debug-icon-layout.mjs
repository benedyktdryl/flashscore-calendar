#!/usr/bin/env node
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto('https://www.flashscore.pl/', { waitUntil: 'domcontentloaded', timeout: 90_000 });
await page.waitForTimeout(8_000);

const info = await page.evaluate(() => {
  const row = document.querySelector('.event__match--scheduled');
  const tv = row?.querySelector('.event__icon--tv');
  const audio = row?.querySelector('.event__icon--audio');
  const preview = row?.querySelector('.icon--preview');
  const live = row?.querySelector('.liveBetWrapper');

  const describe = (el) => {
    if (!el) return null;
    const s = getComputedStyle(el);
    return {
      tag: el.tagName,
      class: el.className,
      gridArea: s.gridArea,
      gridColumn: s.gridColumn,
      order: s.order,
      color: s.color,
      parentClass: el.parentElement?.className,
    };
  };

  const rowStyle = row ? getComputedStyle(row) : null;
  return {
    rowDisplay: rowStyle?.display,
    rowGrid: rowStyle?.gridTemplateAreas?.slice(0, 200),
    tv: describe(tv),
    audio: describe(audio),
    preview: describe(preview),
    live: describe(live),
    tvParentChildren: tv?.parentElement
      ? [...tv.parentElement.children].map((c) => c.className?.slice?.(0, 60) || c.tagName)
      : [],
  };
});

console.log(JSON.stringify(info, null, 2));
await browser.close();
