/* Rota 27 v0.14 RC.2 — identidade da candidata */
(function () {
  'use strict';

  const RC_VERSION = '0.14-rc.2';
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

  function rcBackupPayload() {
    const whatsappFunctionUrl = typeof waConfig !== 'undefined' ? String(waConfig?.functionUrl || '') : '';
    return {
      app: APP_ID,
      schema: 1,
      version: RC_VERSION,
      exportedAt: new Date().toISOString(),
      security: { deviceTokenIncluded: false },
      state: JSON.parse(JSON.stringify(state)),
      whatsappConfig: { functionUrl: whatsappFunctionUrl }
    };
  }

  function downloadRcBackup() {
    try {
      const payload = rcBackupPayload();
      downloadText(`rota27-backup-${RC_VERSION}-${formatFileDate()}.json`, JSON.stringify(payload, null, 2), 'application/json;charset=utf-8');
      const status = byId('v14BackupStatus');
      if (status) status.textContent = `Backup ${RC_VERSION} gerado em ${new Date().toLocaleString('pt-BR')}.`;
      notify('Backup JSON da candidata gerado com sucesso.');
    } catch (err) {
      console.error('[Rota27 RC.2] Falha ao gerar backup:', err);
      notify('Não foi possível gerar o backup da candidata.');
    }
  }

  function applyRcIdentity() {
    window.ROTA27_RELEASE_VERSION = RC_VERSION;
    const badge = byId('v14VersionBadge');
    if (badge) badge.textContent = 'v0.14 RC.2';
    document.title = 'Rota 27 Bodega • Comandas v0.14 RC.2';
    window.v14DownloadBackup = downloadRcBackup;
  }

  function init() {
    applyRcIdentity();
    console.info(`[Rota27] release candidate carregada (${RC_VERSION}).`);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
