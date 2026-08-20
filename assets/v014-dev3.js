/* Rota 27 v0.14 DEV.3 — hardening e consolidação
 * Substitui as camadas DEV.2 + hotfix no preview, mantendo a v0.13 de produção intacta.
 */
(function () {
  'use strict';

  const DEV3_VERSION = '0.14-dev.3';
  const CATALOG_BACKUP_KEY = 'rota27_catalog_backup_v014';
  const CATEGORY_MERGE_BACKUP_KEY = 'rota27_category_merge_backup_v014';
  const RESTORE_BACKUP_KEY = 'rota27_backup_before_restore_v014';
  const APP_ID = 'rota27-comandas';
  const MAX_IMPORT_BYTES = 2 * 1024 * 1024;
  const MAX_IMPORT_ROWS = 5000;
  const MAX_BACKUP_BYTES = 8 * 1024 * 1024;
  const MAX_PRODUCTS = 10000;
  const MAX_COMMANDS = 5000;
  const MAX_HISTORY = 50000;

  let smartImport = null;
  let smartRejected = [];
  let categoryPlan = new Map();
  let categoryChoices = new Map();
  let originalOpenImportSheet = null;
  let originalRenderCategoryManager = null;
  let originalOpenBackupSheet = null;

  function byId(id) { return document.getElementById(id); }

  function norm(value) {
    return String(value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('pt-BR')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
      .replace(/\s+/g, ' ');
  }

  function cleanText(value) {
    return String(value ?? '')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
      .trim()
      .replace(/\s+/g, ' ');
  }

  function singularKey(value) {
    const n = norm(value);
    if (n.length <= 4) return n;
    if (n.endsWith('ais') && n.length > 5) return n.slice(0, -3) + 'al';
    if (n.endsWith('eis') && n.length > 5) return n.slice(0, -3) + 'el';
    if (n.endsWith('ois') && n.length > 5) return n.slice(0, -3) + 'ol';
    if (n.endsWith('s') && !n.endsWith('ss')) return n.slice(0, -1);
    return n;
  }

  function productKey(value) { return norm(value); }

  function safeHtml(value) {
    if (typeof escapeHtml === 'function') return escapeHtml(String(value ?? ''));
    return String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  }

  function csvEscape(value) {
    const s = String(value ?? '');
    return /["\r\n;,\t]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }

  function moneyValue(value) {
    if (typeof money === 'function') return money(Number(value || 0));
    return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function notify(message) {
    if (typeof showToast === 'function') showToast(message, false);
  }

  function downloadText(filename, content, type = 'text/plain;charset=utf-8') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function formatFileDate(d = new Date()) {
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
  }

  function damerauLevenshtein(a, b) {
    a = norm(a); b = norm(b);
    const al = a.length, bl = b.length;
    if (!al) return bl;
    if (!bl) return al;
    const d = Array.from({ length: al + 1 }, () => Array(bl + 1).fill(0));
    for (let i = 0; i <= al; i++) d[i][0] = i;
    for (let j = 0; j <= bl; j++) d[0][j] = j;
    for (let i = 1; i <= al; i++) {
      for (let j = 1; j <= bl; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
          d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
        }
      }
    }
    return d[al][bl];
  }

  function fuzzyCandidates(raw, candidates) {
    const n = norm(raw);
    if (n.length < 4) return [];
    return candidates
      .map(name => {
        const nn = norm(name);
        const distance = damerauLevenshtein(n, nn);
        const similarity = 1 - distance / Math.max(n.length, nn.length, 1);
        return { name, distance, similarity };
      })
      .filter(x => x.distance <= (n.length >= 9 ? 2 : 1) || x.similarity >= 0.84)
      .sort((a, b) => a.distance - b.distance || b.similarity - a.similarity || a.name.localeCompare(b.name, 'pt-BR'))
      .slice(0, 3);
  }

  function currentCategories() {
    return [...new Set([
      ...(Array.isArray(state?.categories) ? state.categories : []),
      ...(Array.isArray(state?.catalog) ? state.catalog.map(p => p.cat) : [])
    ].map(x => cleanText(x)).filter(Boolean))];
  }

  function buildCategoryPlan(products) {
    categoryPlan = new Map();
    categoryChoices = new Map();
    const candidates = currentCategories();
    const rawCategories = [...new Map(products.map(p => [norm(p.categoria), p.categoria])).values()];

    rawCategories.forEach(raw => {
      const key = norm(raw);
      const exact = candidates.filter(c => norm(c) === key);
      if (exact.length) {
        categoryPlan.set(key, { raw, kind: 'reused', target: exact[0], reason: 'equivalência exata' });
        return;
      }

      const singular = candidates.filter(c => singularKey(c) === singularKey(raw));
      if (singular.length === 1) {
        categoryPlan.set(key, { raw, kind: 'reused', target: singular[0], reason: 'singular/plural equivalente' });
        return;
      }

      const fuzzy = fuzzyCandidates(raw, candidates);
      if (fuzzy.length) {
        const uniqueBest = fuzzy.length === 1 || fuzzy[0].distance < fuzzy[1].distance || fuzzy[0].similarity > fuzzy[1].similarity + 0.08;
        const options = fuzzy.map(x => x.name);
        categoryPlan.set(key, { raw, kind: 'suggested', target: fuzzy[0].name, options, reason: uniqueBest ? 'nome muito semelhante' : 'mais de uma categoria semelhante' });
        categoryChoices.set(key, fuzzy[0].name);
        return;
      }

      categoryPlan.set(key, { raw, kind: 'new', target: raw, reason: 'nova categoria' });
      candidates.push(raw);
    });
  }

  function resolvedCategory(raw) {
    const key = norm(raw);
    const plan = categoryPlan.get(key);
    if (!plan) return cleanText(raw) || 'Outros';
    if (plan.kind === 'suggested') {
      const chosen = categoryChoices.get(key) || plan.target;
      return chosen === '__NEW__' ? plan.raw : chosen;
    }
    return plan.target;
  }

  function categoryStats() {
    let reused = 0, suggested = 0, created = 0;
    categoryPlan.forEach((plan, key) => {
      if (plan.kind === 'reused') reused++;
      else if (plan.kind === 'suggested') {
        if ((categoryChoices.get(key) || plan.target) === '__NEW__') created++;
        else suggested++;
      } else created++;
    });
    return { reused, suggested, created, total: categoryPlan.size };
  }

  function parseDelimited(text, delimiter) {
    const rows = [];
    let row = [], field = '', inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (inQuotes) {
        if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
        else if (ch === '"') inQuotes = false;
        else field += ch;
      } else {
        if (ch === '"') inQuotes = true;
        else if (ch === delimiter) { row.push(field); field = ''; }
        else if (ch === '\n') { row.push(field.replace(/\r$/, '')); rows.push(row); row = []; field = ''; }
        else field += ch;
      }
      if (rows.length > MAX_IMPORT_ROWS + 1) throw new Error(`Arquivo excede o limite de ${MAX_IMPORT_ROWS} produtos por importação.`);
    }
    if (field.length || row.length) { row.push(field.replace(/\r$/, '')); rows.push(row); }
    return rows.filter(r => r.some(v => String(v).trim() !== ''));
  }

  function mapHeader(name) {
    const n = norm(name);
    if (['nome','name','produto'].includes(n)) return 'nome';
    if (['categoria','cat'].includes(n)) return 'categoria';
    if (['preco','price'].includes(n)) return 'preco';
    if (['emoji','icone'].includes(n)) return 'emoji';
    if (['ativo','active'].includes(n)) return 'ativo';
    return '';
  }

  function headerScore(row) { return row.reduce((sum, value) => sum + (mapHeader(value) ? 1 : 0), 0); }

  function detectDelimiter(text) {
    const first = text.replace(/^\uFEFF/, '').split(/\r?\n/).find(x => x.trim()) || '';
    const candidates = ['\t',';',','];
    let best = { delimiter: ';', score: -1 };
    candidates.forEach(delimiter => {
      const row = parseDelimited(first, delimiter)[0] || [];
      const score = headerScore(row) * 10 + Math.min(row.length, 8);
      if (score > best.score) best = { delimiter, score };
    });
    return best.delimiter;
  }

  function parseActive(value) {
    const n = norm(value);
    if (['sim','s','true','1','ativo','yes','y'].includes(n)) return true;
    if (['nao','n','false','0','inativo','no'].includes(n)) return false;
    if (!n) return true;
    return null;
  }

  function parseCatalog(text) {
    const clean = String(text || '').replace(/^\uFEFF/, '');
    const delimiter = detectDelimiter(clean);
    const rows = parseDelimited(clean, delimiter);
    const rejected = [];
    if (!rows.length) return { products: [], rejected: [{ line: 1, reason: 'Arquivo vazio', raw: '' }] };
    if (rows.length > MAX_IMPORT_ROWS + 1) throw new Error(`Arquivo excede o limite de ${MAX_IMPORT_ROWS} produtos por importação.`);

    const mapped = rows[0].map(mapHeader);
    const hasHeader = mapped.filter(Boolean).length >= 2;
    const positions = {};
    if (hasHeader) mapped.forEach((key, i) => { if (key && positions[key] === undefined) positions[key] = i; });
    else Object.assign(positions, { nome: 0, categoria: 1, preco: 2, emoji: 3, ativo: 4 });

    if (positions.nome === undefined || positions.categoria === undefined || positions.preco === undefined) {
      return { products: [], rejected: [{ line: 1, reason: 'Cabeçalho precisa conter nome, categoria e preço', raw: rows[0].join(delimiter) }] };
    }

    const seen = new Set();
    const products = [];
    const start = hasHeader ? 1 : 0;
    for (let i = start; i < rows.length; i++) {
      const row = rows[i];
      const line = i + 1;
      const nome = cleanText(row[positions.nome] ?? '');
      const categoria = cleanText(row[positions.categoria] ?? '') || 'Outros';
      const rawPrice = cleanText(row[positions.preco] ?? '');
      const preco = typeof parsePrice === 'function' ? parsePrice(rawPrice) : Number(rawPrice.replace(',','.'));
      const emoji = cleanText(row[positions.emoji] ?? '') || '🍽️';
      const ativo = parseActive(row[positions.ativo] ?? 'sim');
      const raw = row.join(delimiter);

      if (!nome) { rejected.push({ line, reason: 'Nome vazio', raw }); continue; }
      if (nome.length > 160) { rejected.push({ line, reason: 'Nome excede 160 caracteres', raw }); continue; }
      if (categoria.length > 80) { rejected.push({ line, reason: 'Categoria excede 80 caracteres', raw }); continue; }
      if (emoji.length > 24) { rejected.push({ line, reason: 'Emoji/ícone excede o tamanho permitido', raw }); continue; }
      if (!Number.isFinite(preco) || preco < 0 || preco > 10000000) { rejected.push({ line, reason: 'Preço inválido ou fora do limite', raw }); continue; }
      if (ativo === null) { rejected.push({ line, reason: 'Valor inválido na coluna ativo', raw }); continue; }
      const key = productKey(nome);
      if (seen.has(key)) { rejected.push({ line, reason: 'Produto duplicado dentro do arquivo', raw }); continue; }
      seen.add(key);
      products.push({ line, nome, categoria, preco, emoji, ativo, raw });
    }
    return { products, rejected };
  }

  function classifyProducts() {
    if (!smartImport) return { rows: [], created: 0, updated: 0, ignored: 0 };
    const mode = byId('v14ImportMode')?.value || 'add';
    const existing = new Map((state.catalog || []).map(p => [productKey(p.name), p]));
    let created = 0, updated = 0, ignored = 0;
    const rows = smartImport.products.map(p => {
      const found = existing.get(productKey(p.nome));
      let status;
      if (mode === 'replace') { status = found ? 'manter ID / atualizar' : 'novo'; found ? updated++ : created++; }
      else if (found && mode === 'add') { status = 'ignorado — já existe'; ignored++; }
      else if (found) { status = 'atualizar'; updated++; }
      else { status = 'novo'; created++; }
      return { ...p, found, status, resolvedCategory: resolvedCategory(p.categoria) };
    });
    return { rows, created, updated, ignored };
  }

  function renderCategoryReviewBlock() {
    const suggested = [...categoryPlan.entries()].filter(([, p]) => p.kind === 'suggested');
    if (!suggested.length) return '';
    return `<div class="v14d3-category-review">
      <div class="v14d3-review-head"><strong>⚠ Revisar categorias semelhantes</strong><small>Escolha a categoria existente ou confirme que deseja criar uma nova.</small></div>
      ${suggested.map(([key, plan]) => {
        const current = categoryChoices.get(key) || plan.target;
        const options = [...new Set(plan.options || [plan.target])];
        return `<label class="v14d3-category-choice"><span><b>${safeHtml(plan.raw)}</b><small>${safeHtml(plan.reason)}</small></span><select data-v14d3-cat="${safeHtml(key)}">${options.map(name => `<option value="${safeHtml(name)}"${current === name ? ' selected' : ''}>Usar “${safeHtml(name)}”</option>`).join('')}<option value="__NEW__"${current === '__NEW__' ? ' selected' : ''}>Criar nova “${safeHtml(plan.raw)}”</option></select></label>`;
      }).join('')}
    </div>`;
  }

  function renderSmartPreview() {
    const summary = byId('v14ImportSummary');
    const preview = byId('v14ImportPreview');
    const apply = byId('v14ApplyImportBtn');
    const rejectedBtn = byId('v14RejectedBtn');
    if (!summary || !preview || !apply) return;
    if (rejectedBtn) rejectedBtn.disabled = !smartRejected.length;

    if (!smartImport) {
      summary.textContent = 'Selecione um arquivo para iniciar a validação inteligente.';
      preview.innerHTML = '';
      apply.disabled = true;
      return;
    }

    const c = classifyProducts();
    const cats = categoryStats();
    summary.innerHTML = `<strong>${smartImport.products.length} válidos</strong> • ${c.created} novos • ${c.updated} atualizações • ${c.ignored} ignorados • <span class="${smartRejected.length ? 'v14-error-text' : ''}">${smartRejected.length} rejeitados</span><br><small>${cats.total} categorias analisadas • ${cats.reused} reaproveitadas automaticamente • ${cats.suggested} para revisão • ${cats.created} novas</small>`;

    const visible = c.rows.slice(0, 40);
    preview.innerHTML = `${renderCategoryReviewBlock()}${visible.length ? `<div class="v14-preview-table">
      <div class="v14-preview-row head"><span>Produto</span><span>Categoria</span><span>Preço</span><span>Ação</span></div>
      ${visible.map(r => {
        const changed = norm(r.categoria) !== norm(r.resolvedCategory);
        return `<div class="v14-preview-row"><span><b>${safeHtml(r.emoji)}</b> ${safeHtml(r.nome)}</span><span>${safeHtml(r.categoria)}${changed ? `<small class="v14d3-map"> → ${safeHtml(r.resolvedCategory)}</small>` : ''}</span><span>${safeHtml(moneyValue(r.preco))}</span><span>${safeHtml(r.status)}</span></div>`;
      }).join('')}
    </div>${c.rows.length > visible.length ? `<small class="v14-more-note">+ ${c.rows.length - visible.length} linhas válidas não exibidas na prévia.</small>` : ''}` : '<div class="v14-mini-empty">Nenhum produto válido encontrado.</div>'}`;

    preview.querySelectorAll('select[data-v14d3-cat]').forEach(select => {
      select.addEventListener('change', () => {
        categoryChoices.set(select.dataset.v14d3Cat, select.value);
        renderSmartPreview();
      });
    });
    apply.disabled = !smartImport.products.length;
  }

  async function handleSmartCatalogFile(event) {
    const file = event.target.files?.[0];
    smartImport = null;
    smartRejected = [];
    categoryPlan = new Map();
    categoryChoices = new Map();
    const summary = byId('v14ImportSummary');
    if (!file) { renderSmartPreview(); return; }
    if (file.size > MAX_IMPORT_BYTES) {
      if (summary) summary.textContent = `Arquivo muito grande. Limite: ${(MAX_IMPORT_BYTES / 1024 / 1024).toFixed(0)} MB.`;
      notify('Importação bloqueada: arquivo acima do limite de segurança.');
      return;
    }
    if (!/\.(csv|txt)$/i.test(file.name || '')) {
      if (summary) summary.textContent = 'Formato não suportado. Use um arquivo .CSV ou .TXT.';
      notify('Selecione um arquivo CSV ou TXT.');
      return;
    }
    try {
      const text = await file.text();
      smartImport = parseCatalog(text);
      smartRejected = [...smartImport.rejected];
      buildCategoryPlan(smartImport.products);
      renderSmartPreview();
    } catch (err) {
      if (summary) summary.textContent = `Falha ao ler o arquivo: ${err?.message || 'erro desconhecido'}`;
      notify('O arquivo não passou pela validação de segurança.');
    }
  }

  function saveCatalogBackup(reason) {
    localStorage.setItem(CATALOG_BACKUP_KEY, JSON.stringify({
      savedAt: new Date().toISOString(), reason,
      catalog: JSON.parse(JSON.stringify(state.catalog || [])),
      categories: JSON.parse(JSON.stringify(state.categories || [])),
      categoryStatus: JSON.parse(JSON.stringify(state.categoryStatus || {}))
    }));
  }

  function makeProductId(seed) {
    const base = norm(seed).replace(/[^a-z0-9]+/g, '').slice(0, 8) || 'prod';
    return `imp_${base}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`;
  }

  function applySmartCatalogImport() {
    if (!smartImport?.products?.length) return;
    if (smartImport.products.length > MAX_PRODUCTS) { notify('Importação excede o limite de produtos do app.'); return; }
    const mode = byId('v14ImportMode')?.value || 'add';
    const classified = classifyProducts();
    const cats = categoryStats();
    const projected = mode === 'replace' ? smartImport.products.length : state.catalog.length + classified.created;
    if (projected > MAX_PRODUCTS) { notify(`A importação ultrapassaria o limite de ${MAX_PRODUCTS} produtos.`); return; }

    const msg = mode === 'replace'
      ? `Substituir o cardápio atual pelos ${smartImport.products.length} produtos válidos?\n\nCategorias: ${cats.reused} reaproveitadas • ${cats.suggested} revisadas • ${cats.created} novas.\n\nSerá criado um backup automático antes.`
      : `Aplicar importação?\n\n${classified.created} novos • ${classified.updated} atualizações • ${classified.ignored} ignorados.\nCategorias: ${cats.reused} reaproveitadas • ${cats.suggested} revisadas • ${cats.created} novas.`;
    if (!window.confirm(msg)) return;

    saveCatalogBackup(`import-dev3-${mode}`);
    const existingMap = new Map((state.catalog || []).map(p => [productKey(p.name), p]));
    let nextCatalog;

    if (mode === 'replace') {
      nextCatalog = smartImport.products.map(row => {
        const existing = existingMap.get(productKey(row.nome));
        return { id: existing?.id || makeProductId(row.nome), name: row.nome, cat: resolvedCategory(row.categoria), price: row.preco, emoji: row.emoji, active: row.ativo };
      });
    } else {
      nextCatalog = JSON.parse(JSON.stringify(state.catalog || []));
      const nextMap = new Map(nextCatalog.map(p => [productKey(p.name), p]));
      smartImport.products.forEach(row => {
        const existing = nextMap.get(productKey(row.nome));
        if (existing && mode === 'add') return;
        const cat = resolvedCategory(row.categoria);
        if (existing) Object.assign(existing, { name: row.nome, cat, price: row.preco, emoji: row.emoji, active: row.ativo });
        else {
          const created = { id: makeProductId(row.nome), name: row.nome, cat, price: row.preco, emoji: row.emoji, active: row.ativo };
          nextCatalog.push(created);
          nextMap.set(productKey(created.name), created);
        }
      });
    }

    state.catalog = nextCatalog;
    const previousCategories = mode === 'replace' ? [] : (state.categories || []);
    const catsList = [...new Set([...previousCategories, ...state.catalog.map(p => p.cat)].map(cleanText).filter(Boolean))];
    const oldStatus = state.categoryStatus || {};
    state.categories = catsList;
    state.categoryStatus = Object.fromEntries(catsList.map(cat => [cat, typeof oldStatus[cat] === 'boolean' ? oldStatus[cat] : true]));
    save();

    closeSheet('v14ImportWrap');
    smartImport = null;
    smartRejected = [];
    const file = byId('v14ImportFile'); if (file) file.value = '';
    if (typeof renderMenu === 'function') renderMenu();
    if (typeof activeCommandId !== 'undefined' && activeCommandId && typeof renderSale === 'function') renderSale();
    notify(`Importação concluída: ${state.catalog.length} produtos no cardápio.`);
  }

  function downloadSmartRejected() {
    if (!smartRejected.length) { notify('Nenhuma linha rejeitada nesta importação.'); return; }
    const lines = ['linha;motivo;conteudo'];
    smartRejected.forEach(r => lines.push([r.line, r.reason, r.raw].map(csvEscape).join(';')));
    downloadText(`rota27-importacao-erros-${formatFileDate()}.csv`, '\uFEFF' + lines.join('\r\n'), 'text/csv;charset=utf-8');
  }

  function prepareSmartImportSheet() {
    smartImport = null;
    smartRejected = [];
    categoryPlan = new Map();
    categoryChoices = new Map();
    const wrap = byId('v14ImportWrap');
    if (!wrap) return;

    const desc = wrap.querySelector('.desc');
    if (desc && !byId('v14d3ImportHint')) {
      desc.insertAdjacentHTML('afterend', `<div id="v14d3ImportHint" class="v14d3-import-hint"><strong>Validação reforçada ativa.</strong><span>Detectamos categorias semelhantes, duplicados e arquivos malformados antes da gravação. Limite por importação: ${MAX_IMPORT_ROWS} produtos / ${MAX_IMPORT_BYTES / 1024 / 1024} MB.</span></div>`);
    }

    let file = byId('v14ImportFile');
    if (file && file.dataset.dev3Bound !== '1') {
      const clone = file.cloneNode(true);
      clone.dataset.dev3Bound = '1';
      file.replaceWith(clone);
      file = clone;
      file.addEventListener('change', handleSmartCatalogFile);
    }

    let mode = byId('v14ImportMode');
    if (mode && mode.dataset.dev3Bound !== '1') {
      const clone = mode.cloneNode(true);
      clone.dataset.dev3Bound = '1';
      mode.replaceWith(clone);
      mode = clone;
      mode.addEventListener('change', renderSmartPreview);
    }

    if (file) file.value = '';
    if (mode) mode.value = 'add';
    renderSmartPreview();
  }

  function probableCategoryPairs() {
    const cats = currentCategories();
    const pairs = [];
    for (let i = 0; i < cats.length; i++) {
      for (let j = i + 1; j < cats.length; j++) {
        const a = cats[i], b = cats[j];
        if (norm(a) === norm(b)) { pairs.push({ a, b, reason: 'mesmo nome após normalização', score: 3 }); continue; }
        if (singularKey(a) === singularKey(b)) { pairs.push({ a, b, reason: 'singular/plural provável', score: 2 }); continue; }
        const dist = damerauLevenshtein(a, b);
        const maxLen = Math.max(norm(a).length, norm(b).length);
        if (maxLen >= 5 && dist <= 1) pairs.push({ a, b, reason: 'diferença de apenas uma letra', score: 1 });
      }
    }
    return pairs.sort((x, y) => y.score - x.score || x.a.localeCompare(y.a, 'pt-BR')).slice(0, 8);
  }

  function saveCategoryMergeBackup() {
    localStorage.setItem(CATEGORY_MERGE_BACKUP_KEY, JSON.stringify({
      savedAt: new Date().toISOString(),
      catalog: JSON.parse(JSON.stringify(state.catalog || [])),
      categories: JSON.parse(JSON.stringify(state.categories || [])),
      categoryStatus: JSON.parse(JSON.stringify(state.categoryStatus || {}))
    }));
  }

  function parseMergeBackup() {
    const raw = localStorage.getItem(CATEGORY_MERGE_BACKUP_KEY);
    if (!raw) return null;
    try {
      const data = JSON.parse(raw);
      if (!Array.isArray(data.catalog) || !Array.isArray(data.categories) || !data.categoryStatus || typeof data.categoryStatus !== 'object') return null;
      return data;
    } catch { return null; }
  }

  function mergeCategory(keep, remove) {
    if (!keep || !remove || keep === remove) return;
    const affected = (state.catalog || []).filter(p => p.cat === remove).length;
    if (!window.confirm(`Unificar “${remove}” em “${keep}”?\n\n${affected} ${affected === 1 ? 'produto será movido' : 'produtos serão movidos'}. Comandas antigas não serão alteradas.`)) return;
    saveCategoryMergeBackup();
    state.catalog.forEach(p => { if (p.cat === remove) p.cat = keep; });
    state.categories = [...new Set((state.categories || []).map(c => c === remove ? keep : c))];
    if (!state.categories.includes(keep)) state.categories.push(keep);
    const oldStatus = state.categoryStatus || {};
    const keepStatus = typeof oldStatus[keep] === 'boolean' ? oldStatus[keep] : (typeof oldStatus[remove] === 'boolean' ? oldStatus[remove] : true);
    state.categoryStatus = { ...oldStatus, [keep]: keepStatus };
    delete state.categoryStatus[remove];
    save();
    if (typeof renderCategoryManager === 'function') renderCategoryManager();
    if (typeof renderMenu === 'function') renderMenu();
    if (typeof activeCommandId !== 'undefined' && activeCommandId && typeof renderSale === 'function') renderSale();
    notify(`Categorias unificadas em “${keep}”.`);
  }

  function undoCategoryMerge() {
    const data = parseMergeBackup();
    if (!data) {
      localStorage.removeItem(CATEGORY_MERGE_BACKUP_KEY);
      if (typeof renderCategoryManager === 'function') renderCategoryManager();
      notify('Não há uma unificação válida para desfazer.');
      return;
    }
    if (!window.confirm('Desfazer a última unificação de categorias?\n\nO cardápio e as categorias voltarão ao estado anterior. Comandas históricas não serão alteradas.')) return;
    state.catalog = JSON.parse(JSON.stringify(data.catalog));
    state.categories = JSON.parse(JSON.stringify(data.categories));
    state.categoryStatus = JSON.parse(JSON.stringify(data.categoryStatus));
    save();
    localStorage.removeItem(CATEGORY_MERGE_BACKUP_KEY);
    if (typeof renderCategoryManager === 'function') renderCategoryManager();
    if (typeof renderMenu === 'function') renderMenu();
    if (typeof activeCommandId !== 'undefined' && activeCommandId && typeof renderSale === 'function') renderSale();
    notify('Última unificação de categorias desfeita.');
  }

  function renderCategoryHygienePanels() {
    const screen = byId('screenCategories');
    if (!screen) return;
    byId('v14d3CategoryHygiene')?.remove();
    byId('v14d3UndoMergeCard')?.remove();

    const anchor = screen.querySelector('.category-manager-screen-note') || screen.querySelector('.category-list');
    const pairs = probableCategoryPairs();
    if (pairs.length) {
      const panel = document.createElement('div');
      panel.id = 'v14d3CategoryHygiene';
      panel.className = 'v14d3-hygiene-card';
      panel.innerHTML = `<div class="v14d3-hygiene-head"><div><strong>🧹 Categorias semelhantes encontradas</strong><small>Nada será unido automaticamente. Escolha qual nome deseja manter.</small></div></div><div class="v14d3-hygiene-list">${pairs.map((p, index) => `<div class="v14d3-hygiene-row" data-pair="${index}"><div><b>${safeHtml(p.a)} ↔ ${safeHtml(p.b)}</b><small>${safeHtml(p.reason)}</small></div><div class="v14d3-hygiene-actions"><button type="button" data-keep="a">Manter “${safeHtml(p.a)}”</button><button type="button" data-keep="b">Manter “${safeHtml(p.b)}”</button></div></div>`).join('')}</div>`;
      if (anchor) anchor.insertAdjacentElement(anchor.classList.contains('category-list') ? 'beforebegin' : 'afterend', panel);
      else screen.insertAdjacentElement('afterbegin', panel);
      panel.querySelectorAll('.v14d3-hygiene-row').forEach(row => {
        const pair = pairs[Number(row.dataset.pair)];
        row.querySelectorAll('button[data-keep]').forEach(btn => btn.addEventListener('click', () => btn.dataset.keep === 'a' ? mergeCategory(pair.a, pair.b) : mergeCategory(pair.b, pair.a)));
      });
    }

    const backup = parseMergeBackup();
    if (backup) {
      const undo = document.createElement('div');
      undo.id = 'v14d3UndoMergeCard';
      undo.className = 'v14d3-hygiene-card v14d3-undo-card';
      const d = new Date(backup.savedAt);
      const when = Number.isNaN(d.getTime()) ? 'Backup disponível.' : `Backup criado em ${d.toLocaleString('pt-BR')}.`;
      undo.innerHTML = `<div class="v14d3-hygiene-head"><div><strong>↶ Última unificação pode ser desfeita</strong><small>${safeHtml(when)} Esta opção permanece disponível mesmo quando não há mais duplicidades visíveis.</small></div><button type="button" class="secondary" id="v14d3UndoMergeBtn">Desfazer última unificação</button></div>`;
      const hygiene = byId('v14d3CategoryHygiene');
      if (hygiene) hygiene.insertAdjacentElement('afterend', undo);
      else if (anchor) anchor.insertAdjacentElement(anchor.classList.contains('category-list') ? 'beforebegin' : 'afterend', undo);
      else screen.insertAdjacentElement('afterbegin', undo);
      byId('v14d3UndoMergeBtn')?.addEventListener('click', undoCategoryMerge);
    }
  }

  function backupPayloadCurrent() {
    return {
      app: APP_ID,
      schema: 1,
      version: DEV3_VERSION,
      exportedAt: new Date().toISOString(),
      security: { deviceTokenIncluded: false },
      state: JSON.parse(JSON.stringify(state)),
      whatsappConfig: { functionUrl: typeof waConfig !== 'undefined' ? String(waConfig?.functionUrl || '') : '' }
    };
  }

  function validateStateSnapshot(snapshot) {
    const errors = [], warnings = [];
    if (!snapshot || typeof snapshot !== 'object') return { errors: ['Estado ausente ou inválido.'], warnings, stats: {} };
    const commands = Array.isArray(snapshot.commands) ? snapshot.commands : null;
    const history = Array.isArray(snapshot.history) ? snapshot.history : null;
    const catalog = Array.isArray(snapshot.catalog) ? snapshot.catalog : null;
    if (!commands) errors.push('Lista de comandas abertas ausente.');
    if (!history) errors.push('Histórico ausente.');
    if (!catalog) errors.push('Cardápio ausente.');
    if (errors.length) return { errors, warnings, stats: {} };
    if (commands.length > MAX_COMMANDS) errors.push(`Comandas abertas acima do limite (${MAX_COMMANDS}).`);
    if (history.length > MAX_HISTORY) errors.push(`Histórico acima do limite (${MAX_HISTORY}).`);
    if (catalog.length > MAX_PRODUCTS) errors.push(`Cardápio acima do limite (${MAX_PRODUCTS}).`);

    const ids = new Set();
    const names = new Set();
    catalog.forEach((p, i) => {
      if (!p || typeof p !== 'object') { errors.push(`Produto ${i + 1} inválido.`); return; }
      const id = cleanText(p.id);
      const name = cleanText(p.name);
      const cat = cleanText(p.cat);
      const price = Number(p.price);
      if (!id) errors.push(`Produto ${i + 1} sem ID.`);
      else if (ids.has(id)) errors.push(`ID de produto duplicado: ${id}.`);
      else ids.add(id);
      if (!name) errors.push(`Produto ${i + 1} sem nome.`);
      if (!cat) errors.push(`Produto ${i + 1} sem categoria.`);
      if (!Number.isFinite(price) || price < 0) errors.push(`Produto “${name || i + 1}” com preço inválido.`);
      const nk = productKey(name);
      if (nk && names.has(nk)) warnings.push(`Nome de produto repetido: ${name}.`);
      else if (nk) names.add(nk);
    });

    [...commands, ...history].forEach((c, i) => {
      if (!c || typeof c !== 'object') { errors.push(`Comanda ${i + 1} inválida.`); return; }
      if (c.items != null && (typeof c.items !== 'object' || Array.isArray(c.items))) errors.push(`Comanda ${i + 1} possui itens inválidos.`);
    });

    return { errors, warnings, stats: { commands: commands.length, history: history.length, products: catalog.length, categories: Array.isArray(snapshot.categories) ? snapshot.categories.length : 0 } };
  }

  function validateBackupData(data) {
    const errors = [], warnings = [];
    if (!data || typeof data !== 'object') return { errors: ['Arquivo JSON inválido.'], warnings, stats: {} };
    if (data.app !== APP_ID) errors.push('O arquivo não pertence ao Rota 27.');
    const stateCheck = validateStateSnapshot(data.state);
    errors.push(...stateCheck.errors);
    warnings.push(...stateCheck.warnings);
    if (data.whatsappConfig?.deviceToken) warnings.push('O arquivo contém um token de dispositivo; ele será ignorado por segurança.');
    return { errors, warnings, stats: stateCheck.stats };
  }

  function localDiagnostics() {
    const check = validateStateSnapshot(state);
    const outbox = Array.isArray(state?.whatsappOutbox) ? state.whatsappOutbox.length : 0;
    const waReady = typeof isWhatsappConfigured === 'function'
      ? !!isWhatsappConfigured()
      : !!(typeof waConfig !== 'undefined' && waConfig?.functionUrl && waConfig?.deviceToken);
    const bytes = new Blob([JSON.stringify(state || {})]).size;
    return { ...check, outbox, waReady, bytes };
  }

  function renderDiagnostics() {
    const wrap = byId('v14BackupWrap');
    if (!wrap) return;
    let card = byId('v14d3Diagnostics');
    if (!card) {
      card = document.createElement('div');
      card.id = 'v14d3Diagnostics';
      card.className = 'v14d3-diagnostics';
      const info = wrap.querySelector('.v14-info-card');
      if (info) info.insertAdjacentElement('afterend', card);
      else wrap.querySelector('.sheet')?.insertAdjacentElement('afterbegin', card);
    }
    const d = localDiagnostics();
    const ok = !d.errors.length;
    card.innerHTML = `<div class="v14d3-diag-head"><strong>${ok ? '✓ Integridade local OK' : '⚠ Verificar dados locais'}</strong><span class="${ok ? 'ok' : 'warn'}">${ok ? 'Saudável' : `${d.errors.length} alerta(s)`}</span></div><div class="v14d3-diag-grid"><div><small>Produtos</small><b>${d.stats.products || 0}</b></div><div><small>Abertas</small><b>${d.stats.commands || 0}</b></div><div><small>Histórico</small><b>${d.stats.history || 0}</b></div><div><small>WhatsApp</small><b>${d.waReady ? 'Configurado' : 'Pendente'}</b></div><div><small>Fila WA</small><b>${d.outbox}</b></div><div><small>Dados locais</small><b>${(d.bytes / 1024).toFixed(1)} KB</b></div></div>${d.errors.length ? `<small class="v14d3-diag-note">${safeHtml(d.errors.slice(0, 3).join(' • '))}</small>` : ''}`;
  }

  async function handleHardenedRestoreFile(event) {
    const file = event.target.files?.[0];
    const status = byId('v14BackupStatus');
    if (!file) return;
    if (file.size > MAX_BACKUP_BYTES) {
      if (status) status.textContent = `Falha: backup acima do limite de ${MAX_BACKUP_BYTES / 1024 / 1024} MB.`;
      notify('Backup bloqueado por tamanho excessivo.');
      event.target.value = '';
      return;
    }
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const check = validateBackupData(data);
      if (check.errors.length) throw new Error(check.errors.slice(0, 4).join(' • '));
      const s = check.stats;
      const warningText = check.warnings.length ? `\n\nAvisos:\n- ${check.warnings.slice(0, 4).join('\n- ')}` : '';
      const summary = `${s.commands || 0} comandas abertas, ${s.history || 0} fechadas, ${s.products || 0} produtos e ${s.categories || 0} categorias`;
      if (status) status.textContent = `Backup válido: ${summary}.`;
      if (!window.confirm(`Restaurar este backup?\n\n${summary}.${warningText}\n\nOs dados atuais serão copiados automaticamente antes da restauração. O token do dispositivo atual será preservado.`)) return;

      localStorage.setItem(RESTORE_BACKUP_KEY, JSON.stringify(backupPayloadCurrent()));
      state = migrateState(JSON.parse(JSON.stringify(data.state)));
      save();
      if (data.whatsappConfig?.functionUrl && typeof waConfig !== 'undefined') {
        waConfig = { ...waConfig, functionUrl: String(data.whatsappConfig.functionUrl || '').trim().replace(/\/+$/,'') };
        if (typeof WA_CONFIG_STORAGE !== 'undefined') localStorage.setItem(WA_CONFIG_STORAGE, JSON.stringify(waConfig));
      }
      if (status) status.textContent = `Restauração concluída em ${new Date().toLocaleString('pt-BR')}.`;
      renderDiagnostics();
      closeSheet('v14BackupWrap');
      showScreen('commands');
      if (typeof renderMenu === 'function') renderMenu();
      notify('Backup restaurado e validado com sucesso.');
    } catch (err) {
      if (status) status.textContent = `Falha: ${err?.message || 'arquivo inválido'}`;
      notify('Não foi possível restaurar esse backup.');
    } finally {
      event.target.value = '';
    }
  }

  function prepareBackupSheet() {
    const wrap = byId('v14BackupWrap');
    if (!wrap) return;
    renderDiagnostics();
    let input = byId('v14RestoreFile');
    if (input && input.dataset.dev3Bound !== '1') {
      const clone = input.cloneNode(true);
      clone.dataset.dev3Bound = '1';
      input.replaceWith(clone);
      input = clone;
      input.addEventListener('change', handleHardenedRestoreFile);
    }
  }

  function patchCategoryManager() {
    if (typeof renderCategoryManager !== 'function' || originalRenderCategoryManager) return;
    originalRenderCategoryManager = renderCategoryManager;
    renderCategoryManager = function () {
      originalRenderCategoryManager();
      renderCategoryHygienePanels();
    };
    if (byId('screenCategories')?.classList.contains('active')) renderCategoryHygienePanels();
  }

  function patchImport() {
    originalOpenImportSheet = window.v14OpenImportSheet;
    window.v14OpenImportSheet = function () {
      if (typeof originalOpenImportSheet === 'function') originalOpenImportSheet();
      prepareSmartImportSheet();
    };
    window.v14ApplyCatalogImport = applySmartCatalogImport;
    window.v14DownloadRejected = downloadSmartRejected;
  }

  function patchBackup() {
    originalOpenBackupSheet = window.v14OpenBackupSheet;
    window.v14OpenBackupSheet = function () {
      if (typeof originalOpenBackupSheet === 'function') originalOpenBackupSheet();
      prepareBackupSheet();
    };
    if (byId('v14BackupWrap')?.classList.contains('open')) prepareBackupSheet();
  }

  function updateDevBadge() {
    const badge = byId('v14VersionBadge');
    if (badge) badge.textContent = 'v0.14 DEV.3';
    document.title = document.title.replace(/v0\.14 DEV(?:\.\d+(?:\.\d+)?)?/i, 'v0.14 DEV.3');
  }

  function init() {
    try {
      patchImport();
      patchCategoryManager();
      patchBackup();
      updateDevBadge();
      console.info(`[Rota27] hardening carregado (${DEV3_VERSION}).`);
    } catch (err) {
      console.error('[Rota27] Falha ao inicializar DEV.3:', err);
      notify('A camada de hardening encontrou um erro de inicialização.');
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
