export type AgeBand = 
  | 'newborn-18m' 
  | '18m-3y' 
  | '2-5y' 
  | '3-6y' 
  | '4-7y' 
  | '5-8y' 
  | '6-9y' 
  | '7-10y' 
  | '8-11y' 
  | '9-12y' 
  | '10-early-teens' 
  | 'preteens-older-teens';

export function calculateAgeInMonths(years: number, months: number): number {
  return years * 12 + months;
}

export function calculateAgeFromBirthday(birthday: string): { years: number; months: number; totalMonths: number } {
  const birthDate = new Date(birthday);
  const today = new Date();
  
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  const totalMonths = years * 12 + months;
  
  return { years, months, totalMonths };
}

export function categorizeAgeBand(ageInMonths: number): AgeBand {
  if (ageInMonths < 18) return 'newborn-18m';
  if (ageInMonths < 36) return '18m-3y';
  if (ageInMonths < 60) return '2-5y';
  if (ageInMonths < 72) return '3-6y';
  if (ageInMonths < 84) return '4-7y';
  if (ageInMonths < 96) return '5-8y';
  if (ageInMonths < 108) return '6-9y';
  if (ageInMonths < 120) return '7-10y';
  if (ageInMonths < 132) return '8-11y';
  if (ageInMonths < 144) return '9-12y';
  if (ageInMonths < 156) return '10-early-teens';
  return 'preteens-older-teens';
}

export function getAgeBandLabel(ageBand: string): string {
  const labels: Record<string, string> = {
    'newborn-18m': 'Newborn to 18 months',
    '18m-3y': '18 months to 3 years',
    '2-5y': '2 to 5 years',
    '3-6y': '3 to 6 years',
    '4-7y': '4 to 7 years',
    '5-8y': '5 to 8 years',
    '6-9y': '6 to 9 years',
    '7-10y': '7 to 10 years',
    '8-11y': '8 to 11 years',
    '9-12y': '9 to 12 years',
    '10-early-teens': '10 to Early Teens',
    'preteens-older-teens': 'Pre-teens to Older Teens',
  };
  return labels[ageBand] || ageBand;
}
