#!/usr/bin/env node
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto('https://www.flashscore.pl/', { waitUntil: 'domcontentloaded', timeout: 90_000 });
await page.waitForTimeout(8_000);

const result = await page.evaluate(() => {
  const parseDayMonth = (text) => {
    const m = text.match(/(\d{1,2})\s*[/.,-]\s*(\d{1,2})/);
    return m ? { day: Number(m[1]), month: Number(m[2]) } : null;
  };
  const pageDate = (() => {
    for (const el of document.querySelectorAll('button')) {
      const dm = parseDayMonth(el.textContent || '');
      if (dm)
        return `${new Date().getFullYear()}-${String(dm.month).padStart(2, '0')}-${String(dm.day).padStart(2, '0')}`;
    }
    return null;
  })();

  let parsed = 0;
  for (const row of document.querySelectorAll('.event__match.event__match--scheduled')) {
    const time = (row.querySelector('.event__time')?.textContent || '').trim();
    if (!/^\d{1,2}:\d{2}$/.test(time)) continue;
    const link = row.querySelector('a.eventRowLink');
    const label = link?.getAttribute('aria-label') || '';
    const parts = label.split(/\s+-\s+/);
    if (parts.length >= 2 && pageDate) parsed += 1;
  }
  return { pageDate, parsed };
});

console.log('Would inject:', result);
await browser.close();
process.exit(result.parsed > 0 ? 0 : 1);
