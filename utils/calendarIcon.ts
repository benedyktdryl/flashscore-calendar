/** Calendar / check icons (Heroicons-style, MIT — https://heroicons.com) */

const SVG_CLASS = 'wcl-icon_WGKvC wcl-matchRowIcon_HmASY fsc-calendar-icon__svg';

export function calendarIconSvg(): string {
  return `<svg fill="currentColor" viewBox="0 0 20 20" width="14" height="14" aria-hidden="true" class="${SVG_CLASS}"><path fill-rule="evenodd" d="M5.5 2a1 1 0 0 0-1 1v1h-1A2.5 2.5 0 0 0 1 6.5v10A2.5 2.5 0 0 0 3.5 19h13a2.5 2.5 0 0 0 2.5-2.5v-10A2.5 2.5 0 0 0 16.5 4H15V3a1 1 0 1 0-2 0v1H7V3a1 1 0 0 0-2 0v1H3.5A.5.5 0 0 0 3 5.5v.5h14v-.5A.5.5 0 0 0 16.5 4H15v1h-2V3a1 1 0 1 0-2 0v2H7V3a1 1 0 1 0-2 0v2H3.5c-.28 0-.5.22-.5.5v10c0 .28.22.5.5.5h13c.28 0 .5-.22.5-.5v-10c0-.28-.22-.5-.5-.5H5.5V4h1v1h2V4h4v1h2V4h1v1h1.5ZM3 8h14v8.5c0 .28-.22.5-.5.5h-13a.5.5 0 0 1-.5-.5V8Z" clip-rule="evenodd"/></svg>`;
}

export function checkIconSvg(): string {
  return `<svg fill="currentColor" viewBox="0 0 20 20" width="14" height="14" aria-hidden="true" class="${SVG_CLASS}"><path fill-rule="evenodd" d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.25 7.25a1 1 0 0 1-1.414 0l-3.25-3.25a1 1 0 1 1 1.414-1.414l2.543 2.542 6.543-6.543a1 1 0 0 1 1.414 0Z" clip-rule="evenodd"/></svg>`;
}
