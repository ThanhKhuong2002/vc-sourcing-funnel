const state = { companies: [], selected: null };
const $ = (selector) => document.querySelector(selector);

function escape(text) {
  return text.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

function render() {
  const min = Number($('#threshold').value);
  $('#thresholdValue').value = min;
  const visible = state.companies.filter((company) => company.score >= min);
  if (!visible.includes(state.selected)) state.selected = visible[0] || null;
  $('#companies').innerHTML = visible.length ? visible.map((company) => `<button class="company ${company === state.selected ? 'selected' : ''}" data-name="${escape(company.name)}"><span><strong>${escape(company.name)}</strong><small>${escape(company.sector)} · ${escape(company.stage)}</small></span><b>${company.score}</b></button>`).join('') : '<p>No companies meet this threshold.</p>';
  $('#companies').querySelectorAll('button').forEach((button) => button.addEventListener('click', () => { state.selected = state.companies.find((company) => company.name === button.dataset.name); render(); }));
  $('#detail').innerHTML = state.selected ? `<h2>${escape(state.selected.name)}</h2><dl><div><dt>Score</dt><dd>${state.selected.score}/100</dd></div><div><dt>Source</dt><dd>${escape(state.selected.source)}</dd></div><div><dt>Signal</dt><dd>${escape(state.selected.signal)}</dd></div></dl><h3>Outreach draft</h3><p>${escape(state.selected.outreach)}</p><h3>Preliminary investment memo</h3><pre>${escape(state.selected.memo)}</pre>` : '<h2>No qualifying startup</h2>';
}

async function boot() {
  const [sources, companies] = await Promise.all([fetch('/api/sources').then((r) => r.json()), fetch('/api/companies').then((r) => r.json())]);
  $('#source').innerHTML = sources.filter((source) => source.enabled).map((source) => `<option value="${source.id}">${escape(source.name)}</option>`).join('');
  state.companies = companies;
  render();
  $('#status').textContent = `Loaded ${companies.length} tested seed records. No outreach has been sent.`;
}

$('#threshold').addEventListener('input', render);
$('#scan').addEventListener('click', async () => {
  $('#scan').disabled = true;
  $('#status').textContent = 'Checking the approved public source...';
  try {
    const response = await fetch('/api/scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sourceId: $('#source').value }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    $('#status').textContent = `${result.source} checked at ${new Date(result.fetchedAt).toLocaleString()}; ${result.records.length} reviewed seed records available. Production parsing requires a tested source adapter.`;
  } catch (error) {
    $('#status').textContent = `Scan failed: ${error.message}`;
  } finally { $('#scan').disabled = false; }
});

boot().catch((error) => { $('#status').textContent = `Unable to load: ${error.message}`; });
