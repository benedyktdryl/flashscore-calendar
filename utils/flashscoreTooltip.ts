const TOOLTIP_ID = 'fsc-calendar-tooltip';
const TOOLTIP_CLASS = 'fsc-calendar-tooltip';

let activeAnchor: HTMLElement | null = null;

function getOrCreateTooltip(): HTMLDivElement {
  const existing = document.getElementById(TOOLTIP_ID);
  if (existing instanceof HTMLDivElement) return existing;

  const tip = document.createElement('div');
  tip.id = TOOLTIP_ID;
  tip.className = TOOLTIP_CLASS;
  tip.setAttribute('role', 'tooltip');
  document.body.append(tip);
  return tip;
}

function positionTooltip(anchor: HTMLElement, tip: HTMLDivElement): void {
  const rect = anchor.getBoundingClientRect();
  tip.style.left = `${rect.left + rect.width / 2}px`;
  tip.style.top = `${rect.top}px`;
}

function onScrollOrResize(): void {
  if (!activeAnchor) return;
  const tip = document.getElementById(TOOLTIP_ID);
  if (tip instanceof HTMLDivElement && tip.dataset.visible === 'true') {
    positionTooltip(activeAnchor, tip);
  }
}

function showTooltip(anchor: HTMLElement, text: string): void {
  const tip = getOrCreateTooltip();
  activeAnchor = anchor;
  tip.textContent = text;
  positionTooltip(anchor, tip);
  tip.dataset.visible = 'true';
}

function hideTooltip(): void {
  activeAnchor = null;
  const tip = document.getElementById(TOOLTIP_ID);
  if (tip) tip.dataset.visible = 'false';
}

if (typeof window !== 'undefined') {
  window.addEventListener('scroll', onScrollOrResize, true);
  window.addEventListener('resize', onScrollOrResize);
}

/** Tooltip anchored to the icon (FlashScore grid breaks global Tooltip positioning). */
export function bindFlashscoreTooltip(element: HTMLElement, text: string): void {
  element.removeAttribute('title');
  element.dataset.fscTooltip = text;

  element.addEventListener('mouseenter', () => {
    showTooltip(element, element.dataset.fscTooltip ?? text);
  });

  element.addEventListener('mouseleave', hideTooltip);

  element.addEventListener('focus', () => {
    showTooltip(element, element.dataset.fscTooltip ?? text);
  });

  element.addEventListener('blur', hideTooltip);
}

export function updateFlashscoreTooltip(element: HTMLElement, text: string): void {
  element.removeAttribute('title');
  element.dataset.fscTooltip = text;

  const tip = document.getElementById(TOOLTIP_ID);
  if (tip?.dataset.visible === 'true') {
    tip.textContent = text;
    positionTooltip(element, tip as HTMLDivElement);
  }
}
