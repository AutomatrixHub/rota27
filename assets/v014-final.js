/* Rota 27 v0.14 — identidade e backup da release final */
(function () {
  'use strict';

  const RELEASE_VERSION = '0.14';
  const APP_ID = 'rota27-comandas';

  function byId(id) { return document.getElementById(id); }

  function formatFileDate(d = new Date()) {
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
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

  function finalBackupPayload() {
    const whatsappFunctionUrl = typeof waConfig !== 'undefined' ? String(waConfig?.functionUrl || '') : '';
    return {
      app: APP_ID,
      schema: 1,
      version: RELEASE_VERSION,
      exportedAt: new Date().toISOString(),
      security: { deviceTokenIncluded: false },
      state: JSON.parse(JSON.stringify(state)),
      whatsappConfig: { functionUrl: whatsappFunctionUrl }
    };
  }

  function downloadFinalBackup() {
    try {
      const payload = finalBackupPayload();
      downloadText(`rota27-backup-${RELEASE_VERSION}-${formatFileDate()}.json`, JSON.stringify(payload, null, 2), 'application/json;charset=utf-8');
      const status = byId('v14BackupStatus');
      if (status) status.textContent = `Backup v${RELEASE_VERSION} gerado em ${new Date().toLocaleString('pt-BR')}.`;
      notify('Backup JSON da v0.14 gerado com sucesso.');
    } catch (err) {
      console.error('[Rota27 v0.14] Falha ao gerar backup:', err);
      notify('Não foi possível gerar o backup da v0.14.');
    }
  }

  function applyReleaseIdentity() {
    window.ROTA27_RELEASE_VERSION = RELEASE_VERSION;
    const badge = byId('v14VersionBadge');
    if (badge) badge.textContent = 'v0.14';
    document.title = 'Rota 27 Bodega • Comandas v0.14';
    window.v14DownloadBackup = downloadFinalBackup;
  }

  function init() {
    applyReleaseIdentity();
    console.info(`[Rota27] release final carregada (${RELEASE_VERSION}).`);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
