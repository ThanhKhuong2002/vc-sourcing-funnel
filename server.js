import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const root = process.cwd();
const sources = JSON.parse(await readFile(join(root, 'config', 'sources.json'), 'utf8'));
const seed = [
  { name: 'Polyborg AI', source: 'Iterative - Companies', score: 87, stage: 'Winter 2026', sector: 'Industrial automation', signal: 'Makes industrial automation accessible to small manufacturers.' },
  { name: 'Moneta AI', source: 'Iterative - Companies', score: 83, stage: 'Winter 2026', sector: 'Fintech / credit', signal: 'AI credit analyst for corporate lenders.' },
  { name: 'Pixo', source: 'Iterative - Companies', score: 76, stage: 'Winter 2026', sector: 'Generative video', signal: 'AI agent for long-form video creation.' },
  { name: 'Antigravity Kit', source: 'Unikorn - AI and automation', score: 74, stage: 'Unknown', sector: 'Developer tools', signal: 'AI Agent Capability Expansion Toolkit with public community engagement.' },
  { name: 'ClaudeKit', source: 'Unikorn - AI and automation', score: 69, stage: 'Unknown', sector: 'AI automation', signal: 'AI development and marketing teams automation.' },
  { name: '3LOQ', source: 'Plug and Play APAC - Startup directory', score: 63, stage: 'Unknown', sector: 'Fintech', signal: 'Behavioral-intelligence solutions for BFSI.' }
];

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function memo(company) {
  return {
    outreach: `Hi ${company.name} team - we found your work through ${company.source}. We invest in early-stage technology companies and would welcome a brief conversation about customer traction, the commercial model, and your next milestones.`,
    memo: `Thesis: ${company.sector} may be a strong fit if it delivers a repeatable workflow advantage.\nWhy now: The source signal suggests active market relevance.\nEvidence: ${company.signal}\nKey diligence: team, traction, retention, buyer, competition, capital needs, and data/privacy posture.\nPreliminary view: research before any investment decision.`
  };
}

async function scan(sourceId) {
  const source = sources.find((item) => item.id === sourceId && item.enabled);
  if (!source) throw new Error('Unknown or disabled source.');
  // Fetch is intentionally bounded: this confirms availability only. Add a tested
  // per-source parser before relying on automated extraction in production.
  const response = await fetch(source.url, { headers: { 'User-Agent': 'VC-Sourcing-Funnel/0.1 (public research)' }, signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`Source responded with HTTP ${response.status}.`);
  const html = await response.text();
  const records = seed.filter((company) => company.source === source.name);
  return { source: source.name, fetchedAt: new Date().toISOString(), charactersRead: html.length, records };
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/api/sources') return json(res, 200, sources);
    if (url.pathname === '/api/companies') return json(res, 200, seed.map((company) => ({ ...company, ...memo(company) })));
    if (url.pathname === '/api/scan' && req.method === 'POST') {
      const body = await new Promise((resolve, reject) => { let data = ''; req.on('data', (chunk) => data += chunk); req.on('end', () => resolve(JSON.parse(data || '{}'))); req.on('error', reject); });
      return json(res, 200, await scan(body.sourceId));
    }
    const path = url.pathname === '/' ? join(root, 'public', 'index.html') : join(root, 'public', url.pathname);
    const content = await readFile(path);
    const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };
    res.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream' });
    res.end(content);
  } catch (error) {
    json(res, error instanceof SyntaxError ? 400 : 500, { error: error.message || 'Unexpected error' });
  }
});

server.listen(process.env.PORT || 3000, () => console.log('VC Sourcing Funnel listening on http://localhost:3000'));
