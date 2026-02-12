
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
};

export const numberToWords = (num: number): string => {
  if (num === 0) return 'ZERO ONLY';
  
  const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
  const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  const nToWords = (n: number): string => {
    if ((n = Math.floor(n)) < 0) return '';
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? '-' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + 'hundred ' + (n % 100 !== 0 ? 'and ' + nToWords(n % 100) : '');
    if (n < 100000) return nToWords(Math.floor(n / 1000)) + 'thousand ' + (n % 1000 !== 0 ? nToWords(n % 1000) : '');
    if (n < 10000000) return nToWords(Math.floor(n / 100000)) + 'lakh ' + (n % 100000 !== 0 ? nToWords(n % 100000) : '');
    return nToWords(Math.floor(n / 10000000)) + 'crore ' + (n % 10000000 !== 0 ? nToWords(n % 10000000) : '');
  };

  const str = nToWords(num);
  return (str.charAt(0).toUpperCase() + str.slice(1)).trim() + ' ONLY';
};
