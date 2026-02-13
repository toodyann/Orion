// Допоміжні функції
export function getContactColor(name) {
  const baseColors = [
    '#FF6B6B', // red
    '#4ECDC4', // teal
    '#45B7D1', // blue
    '#FFA07A', // light salmon
    '#98D8C8', // mint
    '#F7DC6F', // yellow
    '#BB8FCE', // purple
    '#85C1E9', // light blue
    '#FF9F43', // orange
    '#6FCF97'  // green
  ];

  if (!name) return baseColors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  const idx1 = Math.abs(hash) % baseColors.length;
  const idx2 = Math.abs((hash >> 3)) % baseColors.length;
  const c1 = baseColors[idx1];
  const c2 = baseColors[idx2];
  return `linear-gradient(135deg, ${c1}, ${c2})`;
}

export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function formatMessageDateTime(date, time) {
  const dateObj = new Date(date + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const msgDate = new Date(dateObj);
  msgDate.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((today - msgDate) / (1000 * 60 * 60 * 24));

  let dateLabel;
  if (diffDays === 0) {
    dateLabel = 'Сьогодні';
  } else if (diffDays === 1) {
    dateLabel = 'Вчора';
  } else {
    dateLabel = new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'long' }).format(dateObj);
  }

  return `${dateLabel} о ${time}`;
}

export function insertAtCursor(input, text) {
  const start = input.selectionStart || 0;
  const end = input.selectionEnd || 0;
  const value = input.value || '';
  input.value = value.slice(0, start) + text + value.slice(end);
  const pos = start + text.length;
  input.setSelectionRange(pos, pos);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

export function applyFontSize(size) {
  const root = document.documentElement;
  switch (size) {
    case 'small':
      root.style.setProperty('--font-size-base', '13px');
      break;
    case 'large':
      root.style.setProperty('--font-size-base', '17px');
      break;
    default:
      root.style.setProperty('--font-size-base', '15px');
  }
}
