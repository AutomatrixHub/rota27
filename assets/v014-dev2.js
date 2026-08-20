/* Rota 27 v0.14 DEV.2 — higiene inteligente de categorias
 * Complementa a camada dev.1 sem alterar a produção v0.13.
 */
(function () {
  'use strict';

  const DEV2_VERSION = '0.14-dev.2';
  const CATALOG_BACKUP_KEY = 'rota27_catalog_backup_v014';
  const CATEGORY_MERGE_BACKUP_KEY = 'rota27_category_merge_backup_v014';

  let smartImport = null;
  let smartRejected = [];
  let categoryPlan = new Map();
  let categoryChoices = new Map();
  let originalOpenImportSheet = null;
  let originalRenderCategoryManager = null;

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

  function singularKey(value) {
    const n = norm(value);
    if (n.length <= 4) return n;
    if (n.endsWith('ais') && n.length > 5) return n.slice(0, -3) + 'al';
    if (n.endsWith('eis') && n.length > 5) return n.slice(0, -3) + 'el';
    if (n.endsWith('ois') && n.length > 5) return n.slice(0, -3) + 'ol';
    if (n.endsWith('s') && !n.endsWith('ss')) return n.slice(0, -1);
    return n;
  }

  function productKey(value) {
    return norm(value);
  }

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
        d[i][j] = Math.min(
          d[i - 1][j] + 1,
          d[i][j - 1] + 1,
          d[i - 1][j - 1] + cost
        );
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
      ...((state && Array.isArray(state.categories)) ? state.categories : []),
      ...((state && Array.isArray(state.catalog)) ? state.catalog.map(p => p.cat) : [])
    ].map(x => String(x || '').trim()).filter(Boolean))];
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
        categoryPlan.set(key, {
          raw,
          kind: 'suggested',
          target: fuzzy[0].name,
          options,
          reason: uniqueBest ? 'nome muito semelhante' : 'mais de uma categoria semelhante'
        });
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
    if (!plan) return String(raw || 'Outros').trim() || 'Outros';
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

  function headerScore(row) {
    return row.reduce((sum, value) => sum + (mapHeader(value) ? 1 : 0), 0);
  }

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
      const nome = String(row[positions.nome] ?? '').trim().replace(/\s+/g, ' ');
      const categoria = String(row[positions.categoria] ?? '').trim().replace(/\s+/g, ' ') || 'Outros';
      const rawPrice = String(row[positions.preco] ?? '').trim();
      const preco = typeof parsePrice === 'function' ? parsePrice(rawPrice) : Number(rawPrice.replace(',','.'));
      const emoji = String(row[positions.emoji] ?? '').trim() || '🍽️';
      const ativo = parseActive(row[positions.ativo] ?? 'sim');
      const raw = row.join(delimiter);
      if (!nome) { rejected.push({ line, reason: 'Nome vazio', raw }); continue; }
      if (!Number.isFinite(preco) || preco < 0) { rejected.push({ line, reason: 'Preço inválido', raw }); continue; }
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
    return `<div class="v14d2-category-review">
      <div class="v14d2-review-head"><strong>⚠ Revisar categorias semelhantes</strong><small>Escolha a categoria existente ou confirme que deseja criar uma nova.</small></div>
      ${suggested.map(([key, plan]) => {
        const current = categoryChoices.get(key) || plan.target;
        const options = [...new Set(plan.options || [plan.target])];
        return `<label class="v14d2-category-choice"><span><b>${safeHtml(plan.raw)}</b><small>${safeHtml(plan.reason)}</small></span><select data-v14d2-cat="${safeHtml(key)}">${options.map(name => `<option value="${safeHtml(name)}"${current === name ? ' selected' : ''}>Usar “${safeHtml(name)}”</option>`).join('')}<option value="__NEW__"${current === '__NEW__' ? ' selected' : ''}>Criar nova “${safeHtml(plan.raw)}”</option></select></label>`;
      }).join('')}
    </div>`;
  }

  function renderSmartPreview() {
    const summary = byId('v14ImportSummary');
    const preview = byId('v14ImportPreview');
    const apply = byId('v14ApplyImportBtn');
    const rejectedBtn = byId('v14RejectedBtn');
    if (!summary || !preview || !apply) return;
    rejectedBtn.disabled = !smartRejected.length;

    if (!smartImport) {
      summary.textContent = 'Selecione um arquivo para iniciar a validação inteligente.';
      preview.innerHTML = '';
      apply.disabled = true;
      return;
    }

    const c = classifyProducts();
    const cats = categoryStats();
    summary.innerHTML = `<strong>${smartImport.products.length} válidos</strong> • ${c.created} novos • ${c.updated} atualizações • ${c.ignored} ignorados • <span class="${smartRejected.length ? 'v14-error-text' : ''}">${smartRejected.length} rejeitados</span><br><small>${cats.total} categorias analisadas • ${cats.reused} reaproveitadas automaticamente • ${cats.suggested} para revisão • ${cats.created} novas</small>`;

    const visible = c.rows.slice(0, 30);
    preview.innerHTML = `${renderCategoryReviewBlock()}${visible.length ? `<div class="v14-preview-table">
      <div class="v14-preview-row head"><span>Produto</span><span>Categoria</span><span>Preço</span><span>Ação</span></div>
      ${visible.map(r => {
        const changed = norm(r.categoria) !== norm(r.resolvedCategory);
        return `<div class="v14-preview-row"><span><b>${safeHtml(r.emoji)}</b> ${safeHtml(r.nome)}</span><span>${safeHtml(r.categoria)}${changed ? `<small class="v14d2-map"> → ${safeHtml(r.resolvedCategory)}</small>` : ''}</span><span>${safeHtml(moneyValue(r.preco))}</span><span>${safeHtml(r.status)}</span></div>`;
      }).join('')}
    </div>${c.rows.length > visible.length ? `<small class="v14-more-note">+ ${c.rows.length - visible.length} linhas válidas não exibidas na prévia.</small>` : ''}` : '<div class="v14-mini-empty">Nenhum produto válido encontrado.</div>'}`;

    preview.querySelectorAll('select[data-v14d2-cat]').forEach(select => {
      select.addEventListener('change', () => {
        categoryChoices.set(select.dataset.v14d2Cat, select.value);
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
    if (!file) { renderSmartPreview(); return; }
    try {
      const text = await file.text();
      smartImport = parseCatalog(text);
      smartRejected = [...smartImport.rejected];
      buildCategoryPlan(smartImport.products);
      renderSmartPreview();
    } catch (err) {
      byId('v14ImportSummary').textContent = `Falha ao ler o arquivo: ${err?.message || 'erro desconhecido'}`;
    }
  }

  function saveCatalogBackup(reason) {
    localStorage.setItem(CATALOG_BACKUP_KEY, JSON.stringify({
      savedAt: new Date().toISOString(),
      reason,
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
    const mode = byId('v14ImportMode')?.value || 'add';
    const classified = classifyProducts();
    const cats = categoryStats();
    const msg = mode === 'replace'
      ? `Substituir o cardápio atual pelos ${smartImport.products.length} produtos válidos?\n\nCategorias: ${cats.reused} reaproveitadas • ${cats.suggested} revisadas • ${cats.created} novas.\n\nSerá criado um backup automático antes.`
      : `Aplicar importação?\n\n${classified.created} novos • ${classified.updated} atualizações • ${classified.ignored} ignorados.\nCategorias: ${cats.reused} reaproveitadas • ${cats.suggested} revisadas • ${cats.created} novas.`;
    if (!window.confirm(msg)) return;

    saveCatalogBackup(`import-dev2-${mode}`);
    const existingMap = new Map((state.catalog || []).map(p => [productKey(p.name), p]));
    let nextCatalog;

    if (mode === 'replace') {
      nextCatalog = smartImport.products.map(row => {
        const existing = existingMap.get(productKey(row.nome));
        return {
          id: existing?.id || makeProductId(row.nome),
          name: row.nome,
          cat: resolvedCategory(row.categoria),
          price: row.preco,
          emoji: row.emoji,
          active: row.ativo
        };
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
    const catsList = [...new Set([...previousCategories, ...state.catalog.map(p => p.cat)].map(x => String(x || '').trim()).filter(Boolean))];
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
    notify(`Importação inteligente concluída: ${state.catalog.length} produtos no cardápio.`);
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
    if (desc && !byId('v14d2ImportHint')) {
      desc.insertAdjacentHTML('afterend', '<div id="v14d2ImportHint" class="v14d2-import-hint"><strong>Proteção contra categorias duplicadas ativa.</strong><span>Variações de caixa, acentos, singular/plural e erros simples de digitação são detectados antes da gravação.</span></div>');
    }

    let file = byId('v14ImportFile');
    if (file && file.dataset.dev2Bound !== '1') {
      const clone = file.cloneNode(true);
      clone.dataset.dev2Bound = '1';
      file.replaceWith(clone);
      file = clone;
      file.addEventListener('change', handleSmartCatalogFile);
    }

    let mode = byId('v14ImportMode');
    if (mode && mode.dataset.dev2Bound !== '1') {
      const clone = mode.cloneNode(true);
      clone.dataset.dev2Bound = '1';
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
        if (norm(a) === norm(b)) {
          pairs.push({ a, b, reason: 'mesmo nome após normalização', score: 3 });
          continue;
        }
        if (singularKey(a) === singularKey(b)) {
          pairs.push({ a, b, reason: 'singular/plural provável', score: 2 });
          continue;
        }
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
    const raw = localStorage.getItem(CATEGORY_MERGE_BACKUP_KEY);
    if (!raw) { notify('Não há unificação de categoria para desfazer.'); return; }
    let data;
    try { data = JSON.parse(raw); } catch { notify('Backup da unificação inválido.'); return; }
    if (!window.confirm(`Desfazer a última unificação de categorias?\n\nBackup de ${new Date(data.savedAt).toLocaleString('pt-BR')}.`)) return;
    if (Array.isArray(data.catalog)) state.catalog = data.catalog;
    if (Array.isArray(data.categories)) state.categories = data.categories;
    if (data.categoryStatus && typeof data.categoryStatus === 'object') state.categoryStatus = data.categoryStatus;
    save();
    localStorage.removeItem(CATEGORY_MERGE_BACKUP_KEY);
    if (typeof renderCategoryManager === 'function') renderCategoryManager();
    if (typeof renderMenu === 'function') renderMenu();
    if (typeof activeCommandId !== 'undefined' && activeCommandId && typeof renderSale === 'function') renderSale();
    notify('Última unificação desfeita.');
  }

  function renderCategoryHygienePanel() {
    const screen = byId('screenCategories');
    if (!screen) return;
    const old = byId('v14d2CategoryHygiene');
    if (old) old.remove();
    const pairs = probableCategoryPairs();
    if (!pairs.length) return;

    const anchor = screen.querySelector('.category-manager-screen-note') || screen.querySelector('.category-list');
    const html = `<div id="v14d2CategoryHygiene" class="v14d2-hygiene-card">
      <div class="v14d2-hygiene-head"><div><strong>🧹 Categorias semelhantes encontradas</strong><small>Nada será unido automaticamente. Escolha qual nome deseja manter.</small></div>${localStorage.getItem(CATEGORY_MERGE_BACKUP_KEY) ? '<button type="button" class="secondary v14d2-undo-merge">↶ Desfazer última</button>' : ''}</div>
      <div class="v14d2-hygiene-list">${pairs.map((p, index) => `<div class="v14d2-hygiene-row" data-pair="${index}"><div><b>${safeHtml(p.a)} ↔ ${safeHtml(p.b)}</b><small>${safeHtml(p.reason)}</small></div><div class="v14d2-hygiene-actions"><button type="button" data-keep="a">Manter “${safeHtml(p.a)}”</button><button type="button" data-keep="b">Manter “${safeHtml(p.b)}”</button></div></div>`).join('')}</div>
    </div>`;
    if (anchor) anchor.insertAdjacentHTML(anchor.classList.contains('category-list') ? 'beforebegin' : 'afterend', html);
    else screen.insertAdjacentHTML('afterbegin', html);

    const panel = byId('v14d2CategoryHygiene');
    panel?.querySelector('.v14d2-undo-merge')?.addEventListener('click', undoCategoryMerge);
    panel?.querySelectorAll('.v14d2-hygiene-row').forEach(row => {
      const pair = pairs[Number(row.dataset.pair)];
      row.querySelectorAll('button[data-keep]').forEach(btn => btn.addEventListener('click', () => {
        if (btn.dataset.keep === 'a') mergeCategory(pair.a, pair.b);
        else mergeCategory(pair.b, pair.a);
      }));
    });
  }

  function installCategoryManagerPatch() {
    if (typeof renderCategoryManager !== 'function' || originalRenderCategoryManager) return;
    originalRenderCategoryManager = renderCategoryManager;
    renderCategoryManager = function () {
      originalRenderCategoryManager();
      renderCategoryHygienePanel();
    };
    if (byId('screenCategories')?.classList.contains('active')) renderCategoryHygienePanel();
  }

  function installImportPatch() {
    originalOpenImportSheet = window.v14OpenImportSheet;
    window.v14OpenImportSheet = function () {
      if (typeof originalOpenImportSheet === 'function') originalOpenImportSheet();
      prepareSmartImportSheet();
    };
    window.v14ApplyCatalogImport = applySmartCatalogImport;
    window.v14DownloadRejected = downloadSmartRejected;
  }

  function updateDevBadge() {
    const badge = byId('v14VersionBadge');
    if (badge) badge.textContent = 'v0.14 DEV.2';
    document.title = document.title.replace(/v0\.14 DEV(?:\.\d+)?/i, 'v0.14 DEV.2');
  }

  function init() {
    try {
      installImportPatch();
      installCategoryManagerPatch();
      updateDevBadge();
      console.info(`[Rota27] higiene de categorias carregada (${DEV2_VERSION}).`);
    } catch (err) {
      console.error('[Rota27] Falha ao inicializar v0.14 DEV.2:', err);
      notify('A camada de proteção de categorias encontrou um erro de inicialização.');
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
