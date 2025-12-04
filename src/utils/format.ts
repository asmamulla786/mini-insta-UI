export const formatDateTime = (value?: string | Date) => {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toLocaleString();
};

