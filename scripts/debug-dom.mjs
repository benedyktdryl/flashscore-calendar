#!/usr/bin/env node
/**
 * Run: node scripts/debug-dom.mjs
 * Requires: npx playwright install chromium (once)
 */
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto('https://www.flashscore.pl/', { waitUntil: 'domcontentloaded', timeout: 90_000 });
await page.waitForTimeout(8_000);

const info = await page.evaluate(() => {
  const teamLink = [...document.querySelectorAll('a')].find((a) =>
    (a.textContent || '').includes('Aston Villa'),
  );
  const mount = teamLink?.closest('[id^="g_"]') ?? teamLink?.closest('.event__match') ?? teamLink?.parentElement;
  return {
    url: location.href,
    eventMatch: document.querySelectorAll('.event__match').length,
    gRows: document.querySelectorAll('[id^="g_"]').length,
    teamLinkHtml: teamLink?.outerHTML?.slice(0, 400),
    mountHtml: mount?.outerHTML?.slice(0, 800),
    mountTag: mount?.tagName,
    mountId: mount?.id,
    mountClass: mount?.className,
    dateButtons: [...document.querySelectorAll('button, [role="combobox"]')]
      .filter((el) => /\d{1,2}\/\d{1,2}/.test(el.textContent || ''))
      .slice(0, 3)
      .map((el) => ({ tag: el.tagName, text: el.textContent?.trim(), class: el.className })),
    hrefMatchLinks: [...document.querySelectorAll('a[href*="/mecz/"]')].length,
    teamDashLinks: [...document.querySelectorAll('a')].filter((a) => {
      const t = (a.textContent || '').trim();
      return /^.+ - .+$/.test(t) && t.length < 70 && !t.includes(':');
    }).length,
  };
});

console.log(JSON.stringify(info, null, 2));
await browser.close();
