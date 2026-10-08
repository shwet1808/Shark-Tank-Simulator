const fs = require('fs');
const path = require('path');
const dir = path.join(process.cwd(), 'pitches');
if (!fs.existsSync(dir)) fs.mkdirSync(dir);

const template = (id, name, cat, ind, p, t, m, rev, v) => `1. Startup Name & Industry: ${name} - ${ind}
2. Tagline & One-Liner: Revolutionizing ${ind}
3. Problem Statement: ${p}
4. Target Market Size (TAM/SAM): ${m}
5. Product Solution & Competitive Moat: Proprietary tech and network effects.
6. Traction & Current Metrics: ${t}
7. Business Model & Monetization: Subscription
8. Unit Economics (CAC, LTV, Margins, Burn Rate): CAC $10, LTV $50, 70% Margin.
9. Founding Team Background: Ex-FAANG engineers.
10. Financial Ask: $${v} for 10%
11. Expected Outcome Category: ${cat}`;

const cats = ['Category A (Best Deal)', 'Category B (Normal Deal / Counter-Offer)', 'Category C (No Deal / Rejected)'];
for(let i=1; i<=15; i++) {
  const catIdx = Math.floor((i-1)/5);
  const cat = cats[catIdx];
  const name = 'Startup' + i;
  let rev = catIdx === 0 ? '1M ARR' : catIdx === 1 ? '100K ARR' : 'Pre-revenue';
  let ask = catIdx === 0 ? '1,000,000' : catIdx === 1 ? '250,000' : '5,000,000';
  fs.writeFileSync(path.join(dir, `pitch_${i}.txt`), template(i, name, cat, 'SaaS', 'Inefficiency', rev, '10B TAM', rev, ask));
}
console.log('Created 15 pitches');
