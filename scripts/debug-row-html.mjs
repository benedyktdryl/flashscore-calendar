#!/usr/bin/env node
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto('https://www.flashscore.pl/', { waitUntil: 'domcontentloaded', timeout: 90_000 });
await page.waitForTimeout(8_000);

const html = await page.evaluate(() => {
  const row = document.querySelector('.event__match.event__match--scheduled');
  return row?.outerHTML ?? 'none';
});

console.log(html);
await browser.close();
