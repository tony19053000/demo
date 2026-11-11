// Three complete sets, each with one feature and three compact products.
// Adjacent columns also share the stage during continuous transitions.
export const findsColumns = [
  { kind: 'feature', ids: [90], tone: 'peach' },
  { kind: 'stack', ids: [103, 45, 173] },
  { kind: 'feature', ids: [78], tone: 'blue' },
  { kind: 'stack', ids: [8, 27, 140] },
  { kind: 'feature', ids: [174], tone: 'sage' },
  { kind: 'stack', ids: [93, 4, 143] },
];
export const maxReelPosition = findsColumns.length - 2;
export const findsViews = Array.from({ length: maxReelPosition + 1 }, (_, index) => findsColumns.slice(index, index + 2));
export const clampView = value => Math.max(0, Math.min(maxReelPosition, Number(value) || 0));
export const reelPosition = (scrollLeft, maximum) => maximum > 0 ? clampView(scrollLeft / maximum * maxReelPosition) : 0;
export const reelOffset = (view, maximum) => clampView(view) / maxReelPosition * Math.max(0, maximum);
