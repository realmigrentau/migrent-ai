import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] });
const p = await b.newPage();
const backend = [];
p.on('response', r => { if (r.url().includes('onrender.com')) backend.push(`${r.status()} ${r.url().slice(0, 90)}`); });
// simulate the real funnel: land on home, click the hero search CTA
await p.goto('https://migrent.vercel.app/', { waitUntil: 'networkidle2', timeout: 90000 });
await p.evaluate(() => { const a = [...document.querySelectorAll('a')].find(a => /Search rooms up to/.test(a.textContent)); a?.click(); });
await new Promise(r => setTimeout(r, 6000));
const url = p.url();
const state = await p.evaluate(() => ({
  onSignin: /sign in/i.test(document.querySelector('h1')?.textContent || ''),
  hasSearchUI: !!document.querySelector('input, select') && /filter|price|city|room|result|listing/i.test(document.body.innerText),
  snippet: document.body.innerText.replace(/\s+/g, ' ').slice(0, 180),
}));
console.log('Landed on:', url);
console.log('Redirected to signin:', state.onSignin ? 'YES (bad)' : 'no (good)');
console.log('Search UI rendered:', state.hasSearchUI ? 'yes' : 'NO');
console.log('Backend calls:', [...new Set(backend)].filter(x => /listings|search/.test(x)).join(' | ') || '(none logged)');
console.log('Page snippet:', state.snippet);
await b.close();
