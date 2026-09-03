/* Rota 27 v0.14 DEV — Operação & Gestão Local
 * Camada incremental carregada após o app v0.13.
 * Mantém a produção intacta enquanto a branch feature é validada.
 */
(function () {
  'use strict';

  const V14_VERSION = '0.14-dev.1';
  const V14_CATALOG_BACKUP_KEY = 'rota27_catalog_backup_v014';
  const V14_RESTORE_BACKUP_KEY = 'rota27_backup_before_restore_v014';
  const V14_APP_ID = 'rota27-comandas';

  let historyPeriod = 'today';
  let historySearch = '';
  let parsedImport = null;
  let importRejected = [];

  const original = {
    renderHistory: typeof renderHistory === 'function' ? renderHistory : null,
    renderMenu: typeof renderMenu === 'function' ? renderMenu : null,
    renderProducts: typeof renderProducts === 'function' ? renderProducts : null,
    renderPaymentConfirmation: typeof renderPaymentConfirmation === 'function' ? renderPaymentConfirmation : null,
    openCloseSheet: typeof openCloseSheet === 'function' ? openCloseSheet : null,
    finalizeCommand: typeof finalizeCommand === 'function' ? finalizeCommand : null,
  };

  function byId(id) { return document.getElementById(id); }

  function normText(value) {
    return String(value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLocaleLowerCase('pt-BR');
  }

  function productKey(name) {
    return normText(name).replace(/\s+/g, ' ');
  }

  function safeHtml(value) {
    if (typeof escapeHtml === 'function') return escapeHtml(String(value ?? ''));
    return String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  }

  function moneyValue(value) {
    if (typeof money === 'function') return money(Number(value || 0));
    return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function fmtDateTime(ts) {
    const d = new Date(Number(ts || 0));
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  function formatFileDate(d = new Date()) {
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
  }

  function csvEscape(value, delimiter = ';') {
    const s = String(value ?? '');
    return /["\r\n;,\t]/.test(s) || s.includes(delimiter)
      ? `"${s.replace(/"/g, '""')}"`
      : s;
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

  function notify(message) {
    if (typeof showToast === 'function') showToast(message, false);
  }

  function itemSnapshot(command, id) {
    const meta = command?.itemMeta?.[id];
    if (meta) {
      return {
        id,
        name: String(meta.name || 'Produto'),
        cat: String(meta.cat || meta.category || 'Outros'),
        price: Number(meta.price || 0),
        emoji: String(meta.emoji || '🍽️')
      };
    }
    const current = Array.isArray(state?.catalog) ? state.catalog.find(p => String(p.id) === String(id)) : null;
    if (current) return current;
    return { id, name: 'Produto removido', cat: 'Outros', price: 0, emoji: '🍽️' };
  }

  function recordTotal(command) {
    if (Number.isFinite(Number(command?.total))) return Number(command.total);
    if (typeof commandTotal === 'function') return Number(commandTotal(command) || 0);
    return Object.entries(command?.items || {}).reduce((sum, [id, qty]) => {
      const p = itemSnapshot(command, id);
      return sum + Number(qty || 0) * Number(p.price || 0);
    }, 0);
  }

  function recordItems(command) {
    return Object.entries(command?.items || {})
      .filter(([, qty]) => Number(qty) > 0)
      .map(([id, qty]) => ({ product: itemSnapshot(command, id), qty: Number(qty) }));
  }

  function commandDisplay(command) {
    if (typeof commandLabel === 'function') return commandLabel(command);
    return [command?.table, command?.customer].filter(Boolean).join(' • ') || 'Comanda';
  }

  function startOfToday() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }

  function periodStart(period) {
    if (period === 'all') return 0;
    const today = startOfToday();
    if (period === 'today') return today;
    const days = period === '7d' ? 7 : 30;
    return today - (days - 1) * 86400000;
  }

  function filteredHistory() {
    const cutoff = periodStart(historyPeriod);
    const q = normText(historySearch);
    return (Array.isArray(state?.history) ? state.history : [])
      .filter(h => Number(h.closedAt || 0) >= cutoff)
      .filter(h => {
        if (!q) return true;
        const products = recordItems(h).map(x => x.product.name).join(' ');
        const hay = normText([
          commandDisplay(h), h.table, h.customer, h.paymentMethod, products
        ].filter(Boolean).join(' '));
        return hay.includes(q);
      })
      .sort((a, b) => Number(b.closedAt || 0) - Number(a.closedAt || 0));
  }

  function analytics(rows) {
    const result = {
      revenue: 0,
      commands: rows.length,
      units: 0,
      avgTicket: 0,
      products: new Map(),
      categories: new Map()
    };

    rows.forEach(h => {
      result.revenue += recordTotal(h);
      recordItems(h).forEach(({ product, qty }) => {
        result.units += qty;
        const pKey = product.name;
        const prevP = result.products.get(pKey) || { name: product.name, qty: 0, revenue: 0 };
        prevP.qty += qty;
        prevP.revenue += qty * Number(product.price || 0);
        result.products.set(pKey, prevP);

        const cKey = product.cat || 'Outros';
        const prevC = result.categories.get(cKey) || { name: cKey, qty: 0, revenue: 0 };
        prevC.qty += qty;
        prevC.revenue += qty * Number(product.price || 0);
        result.categories.set(cKey, prevC);
      });
    });

    result.avgTicket = result.commands ? result.revenue / result.commands : 0;
    return result;
  }

  function periodLabel() {
    return ({ today: 'Hoje', '7d': 'Últimos 7 dias', '30d': 'Últimos 30 dias', all: 'Todo o histórico' })[historyPeriod] || 'Hoje';
  }

  function metricCard(label, value, hint) {
    return `<div class="v14-metric"><small>${safeHtml(label)}</small><strong>${safeHtml(value)}</strong>${hint ? `<span>${safeHtml(hint)}</span>` : ''}</div>`;
  }

  function renderRankList(targetId, rows, valueKey, formatter, emptyText) {
    const target = byId(targetId);
    if (!target) return;
    if (!rows.length) {
      target.innerHTML = `<div class="v14-mini-empty">${safeHtml(emptyText)}</div>`;
      return;
    }
    const max = Math.max(...rows.map(r => Number(r[valueKey] || 0)), 1);
    target.innerHTML = rows.map((row, i) => {
      const pct = Math.max(6, Math.round((Number(row[valueKey] || 0) / max) * 100));
      return `<div class="v14-rank-row">
        <div class="v14-rank-line"><strong>${i + 1}. ${safeHtml(row.name)}</strong><span>${safeHtml(formatter(row))}</span></div>
        <div class="v14-bar"><i style="width:${pct}%"></i></div>
      </div>`;
    }).join('');
  }

  function enhanceHistoryScreen() {
    const screen = byId('screenHistory');
    if (!screen || byId('v14HistoryToolbar')) return;

    screen.innerHTML = `
      <div class="section-head v14-history-head">
        <div><h2>Histórico & resultados</h2><p>Vendas fechadas e visão rápida deste aparelho.</p></div>
        <span class="badge" id="historyCount">0</span>
      </div>

      <div id="v14HistoryToolbar" class="v14-history-toolbar">
        <div class="v14-periods" role="group" aria-label="Período do histórico">
          <button data-period="today" class="active">Hoje</button>
          <button data-period="7d">7 dias</button>
          <button data-period="30d">30 dias</button>
          <button data-period="all">Todos</button>
        </div>
        <label class="v14-search"><span>⌕</span><input id="v14HistorySearch" type="search" placeholder="Cliente, mesa, produto..." autocomplete="off" /></label>
      </div>

      <div id="v14Metrics" class="v14-metrics"></div>

      <div class="v14-actions">
        <button class="secondary" onclick="v14ExportSalesCsv()">⇩ Exportar vendas CSV</button>
        <button class="secondary" onclick="v14OpenBackupSheet()">☁ Backup / Restaurar</button>
      </div>

      <div class="v14-panels">
        <section class="v14-panel">
          <div class="v14-panel-head"><div><strong>Produtos mais vendidos</strong><small id="v14ProductsPeriod"></small></div></div>
          <div id="v14TopProducts"></div>
        </section>
        <section class="v14-panel">
          <div class="v14-panel-head"><div><strong>Vendas por categoria</strong><small id="v14CategoriesPeriod"></small></div></div>
          <div id="v14TopCategories"></div>
        </section>
      </div>

      <div class="v14-list-head"><strong>Comandas fechadas</strong><small id="v14HistoryResultText"></small></div>
      <div id="historyList"></div>
      <div id="historyEmpty" class="empty" style="display:none">
        <div class="icon">🧾</div><h3>Nenhuma venda encontrada</h3>
        <p>Altere o período ou a busca para ver outros resultados.</p>
      </div>`;

    screen.querySelectorAll('[data-period]').forEach(btn => {
      btn.addEventListener('click', () => {
        historyPeriod = btn.dataset.period || 'today';
        screen.querySelectorAll('[data-period]').forEach(x => x.classList.toggle('active', x === btn));
        enhancedRenderHistory();
      });
    });

    const search = byId('v14HistorySearch');
    search.addEventListener('input', () => {
      historySearch = search.value;
      enhancedRenderHistory();
    });
  }

  function enhancedRenderHistory() {
    enhanceHistoryScreen();
    const rows = filteredHistory();
    const a = analytics(rows);
    const metrics = byId('v14Metrics');
    if (!metrics) return;

    metrics.innerHTML = [
      metricCard('Faturamento', moneyValue(a.revenue), periodLabel()),
      metricCard('Comandas', String(a.commands), a.commands === 1 ? 'conta fechada' : 'contas fechadas'),
      metricCard('Ticket médio', moneyValue(a.avgTicket), 'por comanda'),
      metricCard('Itens vendidos', String(a.units), 'unidades')
    ].join('');

    byId('historyCount').textContent = rows.length;
    byId('historyEmpty').style.display = rows.length ? 'none' : 'block';
    byId('v14HistoryResultText').textContent = `${rows.length} ${rows.length === 1 ? 'resultado' : 'resultados'} • ${periodLabel()}`;
    byId('v14ProductsPeriod').textContent = periodLabel();
    byId('v14CategoriesPeriod').textContent = periodLabel();

    const products = [...a.products.values()].sort((x, y) => y.qty - x.qty || y.revenue - x.revenue).slice(0, 7);
    const categories = [...a.categories.values()].sort((x, y) => y.revenue - x.revenue).slice(0, 7);
    renderRankList('v14TopProducts', products, 'qty', r => `${r.qty} un. • ${moneyValue(r.revenue)}`, 'Sem itens vendidos neste período.');
    renderRankList('v14TopCategories', categories, 'revenue', r => `${moneyValue(r.revenue)} • ${r.qty} un.`, 'Sem categorias vendidas neste período.');

    const list = byId('historyList');
    list.innerHTML = '';
    rows.forEach(h => {
      const d = new Date(Number(h.closedAt || 0));
      const itemCount = recordItems(h).reduce((sum, x) => sum + x.qty, 0);
      const method = h.paymentMethod ? ` • ${h.paymentMethod}` : '';
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'history-item v14-history-item';
      el.onclick = () => openHistoryDetail(h.id, h.closedAt);
      el.innerHTML = `<div class="history-top">
        <div><h4>${safeHtml(commandDisplay(h))}</h4><p>${itemCount} ${itemCount === 1 ? 'item' : 'itens'} • ${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}${safeHtml(method)}</p></div>
        <div class="money">${safeHtml(moneyValue(recordTotal(h)))}</div>
      </div><div class="v14-history-open">Ver detalhes ›</div>`;
      list.appendChild(el);
    });
  }

  function createSheets() {
    if (!byId('v14HistoryDetailWrap')) {
      document.body.insertAdjacentHTML('beforeend', `
        <div class="sheet-wrap" id="v14HistoryDetailWrap" onclick="outsideClose(event,'v14HistoryDetailWrap')">
          <div class="sheet">
            <div class="handle"></div>
            <h3>Detalhes da comanda</h3>
            <p class="desc" id="v14HistoryDetailSubtitle"></p>
            <div id="v14HistoryDetailBody"></div>
            <div class="sheet-actions"><button class="primary" style="grid-column:1/-1" onclick="closeSheet('v14HistoryDetailWrap')">Concluir</button></div>
          </div>
        </div>`);
    }

    if (!byId('v14BackupWrap')) {
      document.body.insertAdjacentHTML('beforeend', `
        <div class="sheet-wrap" id="v14BackupWrap" onclick="outsideClose(event,'v14BackupWrap')">
          <div class="sheet">
            <div class="handle"></div>
            <h3>Backup & restauração</h3>
            <p class="desc">Proteja os dados locais deste aparelho antes de trocas, testes ou manutenção.</p>
            <div class="v14-info-card"><strong>O backup inclui</strong><span>Comandas abertas, histórico, cardápio, categorias e fila do WhatsApp. O token secreto do dispositivo não é exportado.</span></div>
            <div class="v14-stack-actions">
              <button class="primary" onclick="v14DownloadBackup()">⇩ Baixar backup JSON</button>
              <button class="secondary" onclick="document.getElementById('v14RestoreFile').click()">⇧ Restaurar de arquivo</button>
            </div>
            <input id="v14RestoreFile" type="file" accept="application/json,.json" hidden />
            <div id="v14BackupStatus" class="v14-status-note">Nenhum arquivo selecionado.</div>
            <div class="sheet-actions"><button class="secondary" style="grid-column:1/-1" onclick="closeSheet('v14BackupWrap')">Fechar</button></div>
          </div>
        </div>`);
      byId('v14RestoreFile').addEventListener('change', handleRestoreFile);
    }

    if (!byId('v14ImportWrap')) {
      document.body.insertAdjacentHTML('beforeend', `
        <div class="sheet-wrap" id="v14ImportWrap" onclick="outsideClose(event,'v14ImportWrap')">
          <div class="sheet v14-import-sheet">
            <div class="handle"></div>
            <h3>Importar produtos</h3>
            <p class="desc">CSV ou TXT com nome, categoria, preço, emoji e ativo. Nada é gravado antes da sua confirmação.</p>

            <div class="v14-template-actions">
              <button class="secondary" onclick="v14DownloadCatalogModel('csv')">Modelo CSV</button>
              <button class="secondary" onclick="v14DownloadCatalogModel('txt')">Modelo TXT</button>
              <button class="secondary" onclick="v14ExportCatalogCsv()">Exportar atual</button>
            </div>

            <div class="field">
              <label>Arquivo CSV ou TXT</label>
              <input id="v14ImportFile" type="file" accept=".csv,.txt,text/csv,text/plain" />
            </div>
            <div class="field">
              <label>Como tratar produtos que já existem?</label>
              <select id="v14ImportMode">
                <option value="add">Adicionar somente novos</option>
                <option value="upsert">Adicionar novos e atualizar existentes</option>
                <option value="replace">Substituir o cardápio atual</option>
              </select>
              <small class="field-help">A opção “Substituir” cria um backup automático do cardápio atual antes de aplicar.</small>
            </div>

            <div id="v14ImportSummary" class="v14-import-summary">Selecione um arquivo para iniciar a validação.</div>
            <div id="v14ImportPreview" class="v14-import-preview"></div>
            <div class="v14-template-actions v14-import-secondary-actions">
              <button id="v14RejectedBtn" class="secondary" onclick="v14DownloadRejected()" disabled>Baixar erros</button>
              <button id="v14UndoImportBtn" class="secondary" onclick="v14UndoCatalogImport()">↶ Desfazer última importação</button>
            </div>

            <div class="sheet-actions">
              <button class="secondary" onclick="closeSheet('v14ImportWrap')">Cancelar</button>
              <button id="v14ApplyImportBtn" class="primary" onclick="v14ApplyCatalogImport()" disabled>Aplicar importação</button>
            </div>
          </div>
        </div>`);
      byId('v14ImportFile').addEventListener('change', handleCatalogFile);
      byId('v14ImportMode').addEventListener('change', renderImportPreview);
    }
  }

  function openHistoryDetail(id, closedAt) {
    const rec = (state.history || []).find(h => String(h.id) === String(id) && String(h.closedAt) === String(closedAt))
      || (state.history || []).find(h => String(h.id) === String(id));
    if (!rec) return;

    const items = recordItems(rec);
    byId('v14HistoryDetailSubtitle').textContent = `${commandDisplay(rec)} • fechada em ${fmtDateTime(rec.closedAt)}`;
    const rows = items.map(({ product, qty }) => `
      <div class="v14-detail-item">
        <div><strong>${safeHtml(product.name)}</strong><small>${safeHtml(product.cat || 'Outros')} • ${qty} × ${safeHtml(moneyValue(product.price))}</small></div>
        <b>${safeHtml(moneyValue(qty * Number(product.price || 0)))}</b>
      </div>`).join('');

    byId('v14HistoryDetailBody').innerHTML = `
      <div class="v14-detail-meta">
        <div><small>Cliente</small><strong>${safeHtml(rec.customer || 'Não informado')}</strong></div>
        <div><small>Mesa / local</small><strong>${safeHtml(rec.table || 'Não informado')}</strong></div>
        <div><small>Pagamento</small><strong>${safeHtml(rec.paymentMethod || 'Não informado')}</strong></div>
        <div><small>Fechamento</small><strong>${safeHtml(fmtDateTime(rec.closedAt))}</strong></div>
      </div>
      <div class="v14-detail-list">${rows || '<div class="v14-mini-empty">Nenhum item registrado.</div>'}</div>
      <div class="v14-detail-total"><span>Total da comanda</span><strong>${safeHtml(moneyValue(recordTotal(rec)))}</strong></div>`;
    byId('v14HistoryDetailWrap').classList.add('open');
  }

  function enhancePayment() {
    const wrap = byId('closeWrap');
    if (!wrap || byId('v14PaymentMethod')) return;
    const confirmBtn = byId('paymentConfirmBtn');
    if (!confirmBtn) return;
    confirmBtn.insertAdjacentHTML('beforebegin', `
      <div class="field v14-payment-field">
        <label>Forma de pagamento</label>
        <select id="v14PaymentMethod">
          <option value="">Selecione...</option>
          <option value="Pix">Pix</option>
          <option value="Dinheiro">Dinheiro</option>
          <option value="Crédito">Cartão de crédito</option>
          <option value="Débito">Cartão de débito</option>
          <option value="Outro">Outro</option>
        </select>
      </div>`);
    byId('v14PaymentMethod').addEventListener('change', () => renderPaymentConfirmation());
  }

  function patchedRenderPaymentConfirmation() {
    if (original.renderPaymentConfirmation) original.renderPaymentConfirmation();
    const method = byId('v14PaymentMethod')?.value || '';
    const finalBtn = byId('finalizeBtn');
    if (finalBtn) finalBtn.disabled = !paymentConfirmed || !method;
    const note = byId('closeWrap')?.querySelector('.closed-note');
    if (note) note.textContent = !method
      ? 'Selecione a forma de pagamento e confirme o recebimento para liberar o fechamento.'
      : 'O fechamento só é liberado depois da confirmação do pagamento.';
  }

  function patchedOpenCloseSheet() {
    const result = original.openCloseSheet ? original.openCloseSheet() : undefined;
    const select = byId('v14PaymentMethod');
    if (select && byId('closeWrap')?.classList.contains('open')) {
      select.value = '';
      patchedRenderPaymentConfirmation();
    }
    return result;
  }

  function patchedFinalizeCommand() {
    const method = byId('v14PaymentMethod')?.value || '';
    if (!method) {
      notify('Selecione a forma de pagamento antes de fechar a conta.');
      return;
    }
    if (!paymentConfirmed) {
      notify('Confirme o recebimento do pagamento antes de fechar a conta.');
      return;
    }
    const idx = state.commands.findIndex(c => c.id === activeCommandId);
    if (idx < 0) return;
    const c = state.commands[idx];
    state.history.unshift({
      ...c,
      closedAt: Date.now(),
      paymentConfirmedAt: Date.now(),
      paymentMethod: method,
      total: recordTotal(c)
    });
    state.commands.splice(idx, 1);
    save();
    closeSheet('closeWrap');
    activeCommandId = null;
    showScreen('commands');
    notify('Conta fechada com sucesso.');
  }

  function enhanceMenu() {
    const screen = byId('screenMenu');
    if (!screen || byId('v14CatalogTools')) return;
    const head = screen.querySelector('.section-head');
    if (!head) return;
    head.insertAdjacentHTML('afterend', `
      <div id="v14CatalogTools" class="v14-catalog-tools">
        <div><strong>Gestão do cardápio</strong><small>Importe, exporte ou atualize muitos produtos de uma vez.</small></div>
        <div class="v14-catalog-tool-actions">
          <button class="secondary" onclick="v14OpenImportSheet()">⇅ Importar</button>
          <button class="secondary" onclick="v14ExportCatalogCsv()">⇩ Exportar</button>
        </div>
      </div>`);
  }

  function patchedRenderMenu() {
    if (original.renderMenu) original.renderMenu();
    enhanceMenu();
  }

  function frequentProducts(limit = 6) {
    const counts = new Map();
    const recentHistory = [...(state.history || [])]
      .sort((a, b) => Number(b.closedAt || 0) - Number(a.closedAt || 0))
      .slice(0, 30);
    recentHistory.forEach(h => {
      Object.entries(h.items || {}).forEach(([id, qty]) => {
        const p = itemSnapshot(h, id);
        const current = (state.catalog || []).find(x => productKey(x.name) === productKey(p.name) && x.active !== false && (typeof isCategoryActive !== 'function' || isCategoryActive(x.cat)));
        if (!current) return;
        counts.set(current.id, (counts.get(current.id) || 0) + Number(qty || 0));
      });
    });
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => state.catalog.find(p => p.id === id))
      .filter(Boolean)
      .slice(0, limit);
  }

  function ensureQuickProductsContainer() {
    const grid = byId('productGrid');
    if (!grid || byId('v14QuickProducts')) return;
    grid.insertAdjacentHTML('beforebegin', `<div id="v14QuickProducts" class="v14-quick-products" style="display:none"></div>`);
  }

  function renderQuickProducts() {
    ensureQuickProductsContainer();
    const box = byId('v14QuickProducts');
    if (!box) return;
    const search = byId('searchProduct')?.value.trim() || '';
    const shouldShow = activeCategory === 'Todos' && !search;
    const products = shouldShow ? frequentProducts() : [];
    if (!products.length) {
      box.style.display = 'none';
      box.innerHTML = '';
      return;
    }
    box.style.display = 'block';
    box.innerHTML = `<div class="v14-quick-title"><strong>⚡ Mais lançados</strong><small>Atalhos com base nas vendas recentes</small></div>
      <div class="v14-quick-row">${products.map(p => `<button type="button" onclick="addProduct('${String(p.id).replace(/'/g, "\\'")}')"><span>${safeHtml(p.emoji || '🍽️')}</span><b>${safeHtml(p.name)}</b><small>${safeHtml(moneyValue(p.price))}</small></button>`).join('')}</div>`;
  }

  function patchedRenderProducts() {
    if (original.renderProducts) original.renderProducts();
    renderQuickProducts();
  }

  function exportSalesCsv() {
    const rows = window.Rota27V02563Operational?.filteredHistoryRows?.() || filteredHistory();
    if (!rows.length) {
      notify('Não há vendas no filtro atual para exportar.');
      return;
    }
    const header = [
      'data_fechamento','hora_fechamento','comanda','mesa_local','cliente','forma_pagamento',
      'produto','categoria','quantidade','preco_unitario','subtotal','total_comanda'
    ];
    const lines = [header.join(';')];
    rows.forEach(h => {
      const d = new Date(Number(h.closedAt || 0));
      const total = recordTotal(h);
      const items = recordItems(h);
      if (!items.length) {
        items.push({ product: {name:'',cat:'',price:0}, qty:0 });
      }
      items.forEach(({ product, qty }) => {
        lines.push([
          d.toLocaleDateString('pt-BR'),
          d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),
          commandDisplay(h), h.table || '', h.customer || '', h.paymentMethod || '',
          product.name, product.cat || '', qty,
          Number(product.price || 0).toFixed(2).replace('.', ','),
          (qty * Number(product.price || 0)).toFixed(2).replace('.', ','),
          Number(total || 0).toFixed(2).replace('.', ',')
        ].map(v => csvEscape(v)).join(';'));
      });
    });
    const period = window.Rota27V02563Operational?.historyLabel?.().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || historyPeriod;
    downloadText(`rota27-vendas-${period}-${formatFileDate()}.csv`, '\uFEFF' + lines.join('\r\n'), 'text/csv;charset=utf-8');
    notify('Arquivo CSV de vendas gerado.');
  }

  function backupPayload() {
    return {
      app: V14_APP_ID,
      schema: 1,
      version: V14_VERSION,
      exportedAt: new Date().toISOString(),
      security: { deviceTokenIncluded: false },
      state: JSON.parse(JSON.stringify(state)),
      whatsappConfig: { functionUrl: String(waConfig?.functionUrl || '') }
    };
  }

  function downloadBackup() {
    const payload = backupPayload();
    downloadText(`rota27-backup-${formatFileDate()}.json`, JSON.stringify(payload, null, 2), 'application/json;charset=utf-8');
    const st = byId('v14BackupStatus');
    if (st) st.textContent = `Backup gerado em ${new Date().toLocaleString('pt-BR')}.`;
    notify('Backup JSON gerado com sucesso.');
  }

  function validateBackupPayload(data) {
    if (!data || typeof data !== 'object') return 'Arquivo JSON inválido.';
    if (data.app !== V14_APP_ID) return 'Este arquivo não parece ser um backup do Rota 27.';
    if (!data.state || typeof data.state !== 'object') return 'Backup sem estado do aplicativo.';
    if (!Array.isArray(data.state.commands) || !Array.isArray(data.state.history) || !Array.isArray(data.state.catalog)) {
      return 'Backup incompleto: comandas, histórico ou cardápio ausentes.';
    }
    return '';
  }

  async function handleRestoreFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const status = byId('v14BackupStatus');
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const error = validateBackupPayload(data);
      if (error) throw new Error(error);

      const summary = `${data.state.commands.length} comandas abertas, ${data.state.history.length} fechadas e ${data.state.catalog.length} produtos`;
      status.textContent = `Backup válido: ${summary}.`;
      if (!window.confirm(`Restaurar este backup?\n\n${summary}\n\nOs dados atuais deste aparelho serão substituídos, mas criaremos uma cópia automática antes.`)) {
        event.target.value = '';
        return;
      }

      localStorage.setItem(V14_RESTORE_BACKUP_KEY, JSON.stringify(backupPayload()));
      state = migrateState(JSON.parse(JSON.stringify(data.state)));
      save();

      if (data.whatsappConfig?.functionUrl) {
        waConfig = { ...waConfig, functionUrl: String(data.whatsappConfig.functionUrl || '').trim() };
        localStorage.setItem(WA_CONFIG_STORAGE, JSON.stringify(waConfig));
      }

      status.textContent = `Restauração concluída em ${new Date().toLocaleString('pt-BR')}.`;
      closeSheet('v14BackupWrap');
      showScreen('commands');
      patchedRenderMenu();
      notify('Backup restaurado com sucesso.');
    } catch (err) {
      status.textContent = `Falha: ${err?.message || 'arquivo inválido'}`;
      notify('Não foi possível restaurar esse backup.');
    } finally {
      event.target.value = '';
    }
  }

  function catalogRows() {
    return (state.catalog || []).map(p => ({
      nome: p.name,
      categoria: p.cat,
      preco: Number(p.price || 0),
      emoji: p.emoji || '🍽️',
      ativo: p.active !== false
    }));
  }

  function exportCatalogCsv() {
    const lines = ['nome;categoria;preco;emoji;ativo'];
    catalogRows().forEach(p => lines.push([
      p.nome, p.categoria, p.preco.toFixed(2).replace('.', ','), p.emoji, p.ativo ? 'sim' : 'não'
    ].map(v => csvEscape(v)).join(';')));
    downloadText(`rota27-cardapio-${formatFileDate()}.csv`, '\uFEFF' + lines.join('\r\n'), 'text/csv;charset=utf-8');
    notify('Cardápio exportado em CSV.');
  }

  function downloadCatalogModel(kind) {
    const rows = [
      ['nome','categoria','preco','emoji','ativo'],
      ['Cerveja Rota 27 Pilsen 500ml','Cervejas','18,00','🍺','sim'],
      ['IPA Capixaba 500ml','Cervejas','24,00','🍺','sim'],
      ['Queijo Temperado 250g','Queijos','35,00','🧀','sim'],
      ['Água Mineral 500ml','Bebidas','5,00','💧','sim']
    ];
    const content = rows.map(r => r.map(v => csvEscape(v)).join(';')).join('\r\n');
    downloadText(`rota27-modelo-cardapio.${kind === 'txt' ? 'txt' : 'csv'}`, '\uFEFF' + content, kind === 'txt' ? 'text/plain;charset=utf-8' : 'text/csv;charset=utf-8');
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

  function headerScore(row) {
    const known = new Set(['nome','name','produto','categoria','cat','preco','preço','price','emoji','icone','ícone','ativo','active']);
    return row.reduce((n, v) => n + (known.has(normText(v)) ? 1 : 0), 0);
  }

  function detectDelimiter(text) {
    const first = text.replace(/^\uFEFF/, '').split(/\r?\n/).find(x => x.trim()) || '';
    const candidates = ['\t',';',','];
    let best = { delimiter: ';', score: -1, cols: 0 };
    candidates.forEach(delimiter => {
      const row = parseDelimited(first, delimiter)[0] || [];
      const score = headerScore(row) * 10 + Math.min(row.length, 8);
      if (score > best.score) best = { delimiter, score, cols: row.length };
    });
    return best.delimiter;
  }

  function mapHeader(name) {
    const n = normText(name);
    if (['nome','name','produto'].includes(n)) return 'nome';
    if (['categoria','cat'].includes(n)) return 'categoria';
    if (['preco','price'].includes(n)) return 'preco';
    if (['emoji','icone'].includes(n)) return 'emoji';
    if (['ativo','active'].includes(n)) return 'ativo';
    return '';
  }

  function parseActive(value) {
    const n = normText(value);
    if (['sim','s','true','1','ativo','yes','y'].includes(n)) return true;
    if (['nao','n','false','0','inativo','no'].includes(n)) return false;
    if (!n) return true;
    return null;
  }

  function parseCatalogText(text) {
    const clean = String(text || '').replace(/^\uFEFF/, '');
    const delimiter = detectDelimiter(clean);
    const rows = parseDelimited(clean, delimiter);
    const rejected = [];
    if (!rows.length) return { delimiter, products: [], rejected: [{ line: 1, reason: 'Arquivo vazio', raw: '' }] };

    const firstMapped = rows[0].map(mapHeader);
    const hasHeader = firstMapped.filter(Boolean).length >= 2;
    const positions = {};
    if (hasHeader) firstMapped.forEach((key, i) => { if (key && positions[key] === undefined) positions[key] = i; });
    else Object.assign(positions, { nome: 0, categoria: 1, preco: 2, emoji: 3, ativo: 4 });

    if (positions.nome === undefined || positions.categoria === undefined || positions.preco === undefined) {
      return { delimiter, products: [], rejected: [{ line: 1, reason: 'Cabeçalho precisa conter nome, categoria e preço', raw: rows[0].join(delimiter) }] };
    }

    const products = [];
    const seen = new Set();
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
    return { delimiter, products, rejected };
  }

  async function handleCatalogFile(event) {
    const file = event.target.files?.[0];
    parsedImport = null;
    importRejected = [];
    byId('v14ApplyImportBtn').disabled = true;
    if (!file) { renderImportPreview(); return; }
    try {
      const text = await file.text();
      parsedImport = parseCatalogText(text);
      importRejected = [...parsedImport.rejected];
      renderImportPreview();
    } catch (err) {
      byId('v14ImportSummary').textContent = `Falha ao ler o arquivo: ${err?.message || 'erro desconhecido'}`;
    }
  }

  function classifyImport() {
    if (!parsedImport) return { rows: [], created: 0, updated: 0, ignored: 0, rejected: importRejected.length };
    const mode = byId('v14ImportMode')?.value || 'add';
    const existing = new Map((state.catalog || []).map(p => [productKey(p.name), p]));
    let created = 0, updated = 0, ignored = 0;
    const rows = parsedImport.products.map(p => {
      const found = existing.get(productKey(p.nome));
      let status;
      if (mode === 'replace') { status = found ? 'manter ID / atualizar' : 'novo'; found ? updated++ : created++; }
      else if (found && mode === 'add') { status = 'ignorado — já existe'; ignored++; }
      else if (found) { status = 'atualizar'; updated++; }
      else { status = 'novo'; created++; }
      return { ...p, found, status };
    });
    return { rows, created, updated, ignored, rejected: importRejected.length };
  }

  function renderImportPreview() {
    const summary = byId('v14ImportSummary');
    const preview = byId('v14ImportPreview');
    const apply = byId('v14ApplyImportBtn');
    const rejectedBtn = byId('v14RejectedBtn');
    if (!summary || !preview || !apply) return;
    const c = classifyImport();
    rejectedBtn.disabled = !importRejected.length;
    if (!parsedImport) {
      summary.textContent = 'Selecione um arquivo para iniciar a validação.';
      preview.innerHTML = '';
      apply.disabled = true;
      return;
    }
    summary.innerHTML = `<strong>${parsedImport.products.length} válidos</strong> • ${c.created} novos • ${c.updated} atualizações • ${c.ignored} ignorados • <span class="${c.rejected ? 'v14-error-text' : ''}">${c.rejected} rejeitados</span>`;
    const visible = c.rows.slice(0, 30);
    preview.innerHTML = visible.length ? `<div class="v14-preview-table">
      <div class="v14-preview-row head"><span>Produto</span><span>Categoria</span><span>Preço</span><span>Ação</span></div>
      ${visible.map(r => `<div class="v14-preview-row"><span><b>${safeHtml(r.emoji)}</b> ${safeHtml(r.nome)}</span><span>${safeHtml(r.categoria)}</span><span>${safeHtml(moneyValue(r.preco))}</span><span>${safeHtml(r.status)}</span></div>`).join('')}
    </div>${c.rows.length > visible.length ? `<small class="v14-more-note">+ ${c.rows.length - visible.length} linhas válidas não exibidas na prévia.</small>` : ''}` : '<div class="v14-mini-empty">Nenhum produto válido encontrado.</div>';
    apply.disabled = !parsedImport.products.length;
  }

  function saveCatalogBackup(reason) {
    const payload = {
      savedAt: new Date().toISOString(), reason,
      catalog: JSON.parse(JSON.stringify(state.catalog || [])),
      categories: JSON.parse(JSON.stringify(state.categories || [])),
      categoryStatus: JSON.parse(JSON.stringify(state.categoryStatus || {}))
    };
    localStorage.setItem(V14_CATALOG_BACKUP_KEY, JSON.stringify(payload));
  }

  function makeProductId(seed) {
    const base = normText(seed).replace(/[^a-z0-9]+/g, '').slice(0, 8) || 'prod';
    return `imp_${base}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`;
  }

  function applyCatalogImport() {
    if (!parsedImport?.products?.length) return;
    const mode = byId('v14ImportMode')?.value || 'add';
    const classified = classifyImport();
    const destructive = mode === 'replace';
    const msg = destructive
      ? `Substituir o cardápio atual pelos ${parsedImport.products.length} produtos válidos do arquivo?\n\nSerá criado um backup automático antes.`
      : `Aplicar importação?\n\n${classified.created} novos • ${classified.updated} atualizações • ${classified.ignored} ignorados.`;
    if (!window.confirm(msg)) return;

    saveCatalogBackup(`import-${mode}`);
    const existingMap = new Map((state.catalog || []).map(p => [productKey(p.name), p]));
    let nextCatalog;

    if (mode === 'replace') {
      nextCatalog = parsedImport.products.map(row => {
        const existing = existingMap.get(productKey(row.nome));
        return {
          id: existing?.id || makeProductId(row.nome),
          name: row.nome,
          cat: row.categoria,
          price: row.preco,
          emoji: row.emoji,
          active: row.ativo
        };
      });
    } else {
      nextCatalog = JSON.parse(JSON.stringify(state.catalog || []));
      const nextMap = new Map(nextCatalog.map(p => [productKey(p.name), p]));
      parsedImport.products.forEach(row => {
        const existing = nextMap.get(productKey(row.nome));
        if (existing && mode === 'add') return;
        if (existing) {
          Object.assign(existing, { name: row.nome, cat: row.categoria, price: row.preco, emoji: row.emoji, active: row.ativo });
        } else {
          const created = { id: makeProductId(row.nome), name: row.nome, cat: row.categoria, price: row.preco, emoji: row.emoji, active: row.ativo };
          nextCatalog.push(created);
          nextMap.set(productKey(created.name), created);
        }
      });
    }

    state.catalog = nextCatalog;
    const importedCats = parsedImport.products.map(p => p.categoria);
    const cats = [...new Set([...(mode === 'replace' ? [] : (state.categories || [])), ...state.catalog.map(p => p.cat), ...importedCats].map(x => String(x || '').trim()).filter(Boolean))];
    const oldStatus = state.categoryStatus || {};
    state.categories = cats;
    state.categoryStatus = Object.fromEntries(cats.map(cat => [cat, typeof oldStatus[cat] === 'boolean' ? oldStatus[cat] : true]));
    save();

    closeSheet('v14ImportWrap');
    parsedImport = null;
    importRejected = [];
    const file = byId('v14ImportFile'); if (file) file.value = '';
    patchedRenderMenu();
    if (activeCommandId) renderSale();
    notify(`Importação concluída: ${state.catalog.length} produtos no cardápio.`);
  }

  function undoCatalogImport() {
    const raw = localStorage.getItem(V14_CATALOG_BACKUP_KEY);
    if (!raw) { notify('Não há backup de importação disponível neste aparelho.'); return; }
    let data;
    try { data = JSON.parse(raw); } catch { notify('O backup da última importação está inválido.'); return; }
    if (!window.confirm(`Restaurar o cardápio salvo antes da última importação?\n\nBackup de ${new Date(data.savedAt).toLocaleString('pt-BR')}.`)) return;
    state.catalog = Array.isArray(data.catalog) ? data.catalog : state.catalog;
    state.categories = Array.isArray(data.categories) ? data.categories : state.categories;
    state.categoryStatus = data.categoryStatus && typeof data.categoryStatus === 'object' ? data.categoryStatus : state.categoryStatus;
    save();
    closeSheet('v14ImportWrap');
    patchedRenderMenu();
    if (activeCommandId) renderSale();
    notify('Cardápio anterior restaurado.');
  }

  function downloadRejected() {
    if (!importRejected.length) { notify('Nenhuma linha rejeitada nesta importação.'); return; }
    const lines = ['linha;motivo;conteudo'];
    importRejected.forEach(r => lines.push([r.line, r.reason, r.raw].map(v => csvEscape(v)).join(';')));
    downloadText(`rota27-importacao-erros-${formatFileDate()}.csv`, '\uFEFF' + lines.join('\r\n'), 'text/csv;charset=utf-8');
  }

  function openImportSheet() {
    createSheets();
    parsedImport = null;
    importRejected = [];
    const file = byId('v14ImportFile'); if (file) file.value = '';
    byId('v14ImportMode').value = 'add';
    renderImportPreview();
    const undo = byId('v14UndoImportBtn');
    if (undo) undo.disabled = !localStorage.getItem(V14_CATALOG_BACKUP_KEY);
    byId('v14ImportWrap').classList.add('open');
  }

  function openBackupSheet() {
    createSheets();
    byId('v14BackupWrap').classList.add('open');
  }

  function installOverrides() {
    enhanceHistoryScreen();
    enhanceMenu();
    enhancePayment();
    createSheets();
    ensureQuickProductsContainer();
    renderHistory = enhancedRenderHistory;
    renderMenu = patchedRenderMenu;
    renderProducts = patchedRenderProducts;
    renderPaymentConfirmation = patchedRenderPaymentConfirmation;
    openCloseSheet = patchedOpenCloseSheet;
    finalizeCommand = patchedFinalizeCommand;

    window.v14OpenHistoryDetail = openHistoryDetail;
    window.v14ExportSalesCsv = exportSalesCsv;
    window.v14OpenBackupSheet = openBackupSheet;
    window.v14DownloadBackup = downloadBackup;
    window.v14OpenImportSheet = openImportSheet;
    window.v14ExportCatalogCsv = exportCatalogCsv;
    window.v14DownloadCatalogModel = downloadCatalogModel;
    window.v14ApplyCatalogImport = applyCatalogImport;
    window.v14UndoCatalogImport = undoCatalogImport;
    window.v14DownloadRejected = downloadRejected;

    if (byId('screenHistory')?.classList.contains('active')) enhancedRenderHistory();
    if (byId('screenMenu')?.classList.contains('active')) patchedRenderMenu();
  }

  function init() {
    try {
      installOverrides();
      console.info(`[Rota27] v0.14 DEV carregada (${V14_VERSION}).`);
    } catch (err) {
      console.error('[Rota27] Falha ao inicializar camada v0.14:', err);
      notify('A camada v0.14 encontrou um erro de inicialização.');
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
