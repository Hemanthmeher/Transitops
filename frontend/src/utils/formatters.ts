export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatWeight(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1)}t`;
  }
  return `${kg.toLocaleString()} kg`;
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | null | undefined): string {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatStatus(status: string): string {
  return status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export function getStatusColor(status: string): string {
  const lower = status.toLowerCase();
  if (lower.includes('available') || lower.includes('completed') || lower.includes('success')) return 'success';
  if (lower.includes('trip') || lower.includes('progress') || lower.includes('info')) return 'info';
  if (lower.includes('shop') || lower.includes('pending') || lower.includes('warning')) return 'warning';
  if (lower.includes('retired') || lower.includes('expired') || lower.includes('suspended') || lower.includes('cancelled') || lower.includes('danger')) return 'danger';
  return 'neutral';
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}
