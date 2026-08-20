/* Rota 27 v0.14 DEV.2.1 — hotfix de UX da unificação de categorias
 * Mantém a ação "Desfazer última unificação" visível mesmo depois que
 * o par duplicado deixa de existir na tela.
 */
(function () {
  'use strict';

  const HOTFIX_VERSION = '0.14-dev.2.1';
  const CATEGORY_MERGE_BACKUP_KEY = 'rota27_category_merge_backup_v014';
  const CARD_ID = 'v14d21UndoMergeCard';

  if (window.__ROTA27_DEV21_UNDO_HOTFIX__) return;
  window.__ROTA27_DEV21_UNDO_HOTFIX__ = true;

  function byId(id) { return document.getElementById(id); }

  function notify(message) {
    if (typeof showToast === 'function') showToast(message, false);
  }

  function parseBackup() {
    const raw = localStorage.getItem(CATEGORY_MERGE_BACKUP_KEY);
    if (!raw) return null;
    try {
      const data = JSON.parse(raw);
      if (!Array.isArray(data.catalog) || !Array.isArray(data.categories) || !data.categoryStatus || typeof data.categoryStatus !== 'object') return null;
      return data;
    } catch {
      return null;
    }
  }

  function backupLabel(data) {
    if (!data?.savedAt) return 'Backup da última unificação disponível.';
    const d = new Date(data.savedAt);
    if (Number.isNaN(d.getTime())) return 'Backup da última unificação disponível.';
    return `Backup criado em ${d.toLocaleString('pt-BR')}.`;
  }

  function restoreLastMerge() {
    const data = parseBackup();
    if (!data) {
      localStorage.removeItem(CATEGORY_MERGE_BACKUP_KEY);
      renderUndoCard();
      notify('Não há uma unificação válida para desfazer.');
      return;
    }

    if (!window.confirm('Desfazer a última unificação de categorias?\n\nO cardápio e as categorias voltarão exatamente ao estado anterior à unificação. As comandas históricas não serão alteradas.')) return;

    state.catalog = JSON.parse(JSON.stringify(data.catalog));
    state.categories = JSON.parse(JSON.stringify(data.categories));
    state.categoryStatus = JSON.parse(JSON.stringify(data.categoryStatus));
    if (typeof save === 'function') save();
    localStorage.removeItem(CATEGORY_MERGE_BACKUP_KEY);

    if (typeof renderCategoryManager === 'function') renderCategoryManager();
    if (typeof renderMenu === 'function') renderMenu();
    if (typeof activeCommandId !== 'undefined' && activeCommandId && typeof renderSale === 'function') renderSale();
    notify('Última unificação de categorias desfeita.');
  }

  function renderUndoCard() {
    const screen = byId('screenCategories');
    if (!screen) return;

    byId(CARD_ID)?.remove();
    const data = parseBackup();
    if (!data) return;

    const panel = document.createElement('div');
    panel.id = CARD_ID;
    panel.className = 'v14d2-hygiene-card';
    panel.innerHTML = `
      <div class="v14d2-hygiene-head">
        <div>
          <strong>↶ Última unificação pode ser desfeita</strong>
          <small>${backupLabel(data)} Esta opção permanece disponível mesmo que não existam mais categorias semelhantes.</small>
        </div>
        <button type="button" class="secondary" id="v14d21UndoMergeBtn">Desfazer última unificação</button>
      </div>`;

    const hygiene = byId('v14d2CategoryHygiene');
    const note = screen.querySelector('.category-manager-screen-note');
    const list = screen.querySelector('.category-list');
    if (hygiene) hygiene.insertAdjacentElement('afterend', panel);
    else if (note) note.insertAdjacentElement('afterend', panel);
    else if (list) list.insertAdjacentElement('beforebegin', panel);
    else screen.insertAdjacentElement('afterbegin', panel);

    byId('v14d21UndoMergeBtn')?.addEventListener('click', restoreLastMerge);
  }

  function patchCategoryRenderer() {
    if (typeof renderCategoryManager !== 'function') return;
    const previous = renderCategoryManager;
    renderCategoryManager = function () {
      previous();
      renderUndoCard();
    };
  }

  function updateBadge() {
    const badge = byId('v14VersionBadge');
    if (badge) badge.textContent = 'v0.14 DEV.2.1';
    document.title = document.title.replace(/v0\.14 DEV(?:\.\d+(?:\.\d+)?)?/i, 'v0.14 DEV.2.1');
  }

  function init() {
    patchCategoryRenderer();
    updateBadge();
    if (byId('screenCategories')?.classList.contains('active')) renderUndoCard();
    console.info(`[Rota27] hotfix de desfazer unificação carregado (${HOTFIX_VERSION}).`);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
