const CITIES = ['Lagos','Abuja','Port Harcourt','Kano','Ibadan','Enugu','Benin City','Kaduna','Owerri','Warri'];
const SORTED = [...CITIES].sort((a,b) => b.length - a.length);

function parse(raw) {
  const trimmed = raw.trim();
  if (/near me/i.test(trimmed)) {
    return { cleanQuery: trimmed.replace(/near me/gi,'').trim(), city: '__NEARME__' };
  }
  for (const city of SORTED) {
    const escaped = city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const withPrep = new RegExp('\\b(?:in|at|near|around)\\s+' + escaped + '\\b', 'i');
    const standalone = new RegExp('(?:^|[\\s,])' + escaped + '(?:[\\s,]|$)', 'i');
    if (withPrep.test(trimmed) || standalone.test(trimmed)) {
      const clean = trimmed.replace(withPrep, '').replace(standalone, ' ').trim().replace(/\s+/g, ' ');
      return { cleanQuery: clean, city };
    }
  }
  return { cleanQuery: trimmed, city: '' };
}

const tests = [
  'hotel in Lagos',
  'plumber in Benin City',
  'restaurants near me',
  'banks in Abuja',
  'mechanic in Kano',
  'hotel lagos',
  'schools in Port Harcourt',
];
tests.forEach(t => console.log(`"${t}" → q="${parse(t).cleanQuery}" city="${parse(t).city}"`));
