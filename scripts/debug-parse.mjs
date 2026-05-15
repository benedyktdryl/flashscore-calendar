#!/usr/bin/env node
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto('https://www.flashscore.pl/', { waitUntil: 'domcontentloaded', timeout: 90_000 });
await page.waitForTimeout(8_000);

const info = await page.evaluate(() => {
  const parseDayMonth = (text) => {
    const match = text.match(/(\d{1,2})\s*[/.,-]\s*(\d{1,2})/);
    return match ? { day: Number(match[1]), month: Number(match[2]) } : null;
  };
  const readPageDate = () => {
    const buttons = document.querySelectorAll('button, [role="combobox"]');
    for (const el of buttons) {
      const text = (el.textContent || '').trim();
      if (!/(\d{1,2}\s*[/.,-]\s*\d{1,2})/.test(text)) continue;
      const dm = parseDayMonth(text);
      if (dm) return `${new Date().getFullYear()}-${String(dm.month).padStart(2, '0')}-${String(dm.day).padStart(2, '0')}`;
    }
    return null;
  };

  const pageDate = readPageDate();
  const rows = document.querySelectorAll('.event__match');
  const samples = [];

  for (const row of [...rows].slice(0, 5)) {
    const timeEl = row.querySelector('.event__time');
    const home = row.querySelector('.event__participant--home');
    const away = row.querySelector('.event__participant--away');
    const time = (timeEl?.textContent || '').trim();
    samples.push({
      id: row.id,
      class: row.className,
      time,
      timeOk: /^\d{1,2}:\d{2}$/.test(time),
      home: (home?.textContent || '').trim(),
      away: (away?.textContent || '').trim(),
      html: row.outerHTML.slice(0, 600),
    });
  }

  const scheduled = [...rows].filter((row) => {
    const time = (row.querySelector('.event__time')?.textContent || '').trim();
    return /^\d{1,2}:\d{2}$/.test(time);
  }).length;

  return { pageDate, totalRows: rows.length, scheduled, samples };
});

console.log(JSON.stringify(info, null, 2));
await browser.close();
