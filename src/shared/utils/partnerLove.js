export function loveLine(item) {
  if (item.kind === 'expression') return `${item.expressionEmoji || '♡'} ${item.expressionLabel || 'Sent you love'}`;
  if (item.kind === 'text') return `“${item.note}”`;
  return `Promised: ${item.labels.join(' · ')}`;
}
export function loveHeadline(items, fallbackName) {
  const name = items[0]?.partnerName || fallbackName;
  return items.length === 1 ? `${name} sent you love today` : `${name} sent you love ${items.length} times today`;
}
export function loveIcon(item) {
  if (item.kind === 'expression') return item.expressionEmoji || '♡';
  if (item.kind === 'text') return '💌';
  return '🤝';
}
export function timeAgo(iso, now = Date.now()) {
  if (!iso) return '';
  const mins = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
}
export function replyText(item) {
  if (item.replyNote) return item.replyNote;
  return item.replyHeart ? 'You loved this ♡' : '';
}
