export function loveLine(item) {
  if (item.kind === 'expression') return `${item.expressionEmoji || '♡'} ${item.expressionLabel || 'Sent you love'}`;
  if (item.kind === 'text') return `“${item.note}”`;
  return `Promised: ${item.labels.join(' · ')}`;
}
export function loveHeadline(items, fallbackName) {
  const name = items[0]?.partnerName || fallbackName;
  return items.length === 1 ? `${name} sent you love today` : `${name} sent you love ${items.length} times today`;
}
