// Утиліти для форматування валют
// Використовуємо статичне форматування для уникнення hydration помилок

export function formatCurrency(
  amount: number,
  currency: string = 'UAH'
): string {
  // Статичне форматування для UAH
  if (currency === 'UAH') {
    return `${amount.toFixed(2).replace('.', ',')} ₴`;
  }
  
  // Для інших валют використовуємо Intl (тільки на клієнті)
  if (typeof window !== 'undefined') {
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
  
  // Fallback для SSR
  return `${amount.toFixed(2)} ${currency}`;
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('uk-UA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

