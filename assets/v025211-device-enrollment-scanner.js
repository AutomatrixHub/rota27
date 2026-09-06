/* Rota 27 v0.25.211 — leitor de QR para vínculo de aparelhos */
(function(){
  'use strict';
  if(window.Rota27V025211EnrollmentScanner)return;
  let stream=null,timer=null,detector=null;
  const byId=id=>document.getElementById(id);
  function setStatus(text,kind=''){
    const el=byId('v025211JoinStatus');
    if(el){el.className='v025211-status '+kind;el.textContent=text||'';}
  }
  function injectStyle(){
    if(byId('v025211ScannerStyle'))return;
    const style=document.createElement('style');style.id='v025211ScannerStyle';
    style.textContent='.v025211-scan-btn{width:100%;min-height:46px;margin:0 0 10px;border:1px solid #9fbea9;border-radius:12px;background:#edf6ee;color:#244d35;font-weight:900;font-size:13px}.v025211-scanner{display:none;margin:10px 0;padding:10px;border:1px solid #d9c7a7;border-radius:14px;background:#1d1b18}.v025211-scanner.open{display:block}.v025211-scanner video{display:block;width:100%;max-height:320px;object-fit:cover;border-radius:10px;background:#000}.v025211-scanner-actions{display:flex;justify-content:flex-end;margin-top:8px}.v025211-scanner-actions button{min-height:36px;border:1px solid #d7c5a8;border-radius:9px;background:#fff9f0;font-weight:800}';
    document.head.appendChild(style);
  }
  function parseInvite(raw){
    try{
      const url=new URL(String(raw||''),location.href);
      if(url.origin!==location.origin)return null;
      const params=new URLSearchParams(String(url.hash||'').replace(/^#/,''));
      const enrollmentId=String(params.get('r27-enroll')||'').trim();
      const qrSecret=String(params.get('r27-secret')||'').trim();
      if(!enrollmentId||!qrSecret)return null;
      return {enrollmentId,qrSecret};
    }catch{return null;}
  }
  function stopScanner(){
    clearInterval(timer);timer=null;
    try{stream?.getTracks?.().forEach(track=>track.stop());}catch{}
    stream=null;detector=null;
    byId('v025211Scanner')?.classList.remove('open');
    const video=byId('v025211ScannerVideo');if(video)video.srcObject=null;
  }
  async function scanFrame(){
    const video=byId('v025211ScannerVideo');
    if(!detector||!video||video.readyState<2)return;
    try{
      const codes=await detector.detect(video);
      const hit=codes.find(code=>parseInvite(code.rawValue));
      if(!hit)return;
      const invite=parseInvite(hit.rawValue);if(!invite)return;
      stopScanner();setStatus('QR Code reconhecido. Validando convite…','wait');
      await window.Rota27V025211Enrollment?.claim?.(invite);
    }catch(error){console.warn('[Rota27 vínculo] leitura QR:',error);}
  }
  async function startScanner(){
    if(!navigator.mediaDevices?.getUserMedia){setStatus('A câmera não está disponível neste navegador. Use o código de 8 dígitos ou a câmera do sistema.','error');return;}
    if(!('BarcodeDetector' in window)){setStatus('Este navegador não possui leitor de QR integrado. Use a câmera do sistema para apontar ao QR ou digite o código de 8 dígitos.','error');return;}
    stopScanner();
    try{
      detector=new BarcodeDetector({formats:['qr_code']});
      stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});
      const video=byId('v025211ScannerVideo');if(!video)throw new Error('Visualização da câmera não disponível.');
      video.srcObject=stream;await video.play();
      byId('v025211Scanner')?.classList.add('open');setStatus('Aponte a câmera para o QR Code do gerente.','wait');
      timer=setInterval(scanFrame,250);
    }catch(error){stopScanner();setStatus(error?.name==='NotAllowedError'?'Permissão da câmera negada. Libere a câmera ou use o código de 8 dígitos.':'Não foi possível iniciar a câmera. Use o código de 8 dígitos ou a câmera do sistema.','error');}
  }
  function install(){
    injectStyle();
    const card=byId('v025211JoinGate')?.querySelector('.v025211-join-card');
    if(!card||byId('v025211ScanQr'))return false;
    const field=card.querySelector('.v025211-field');
    const button=document.createElement('button');button.type='button';button.id='v025211ScanQr';button.className='v025211-scan-btn';button.textContent='📷 Ler QR Code';
    const scanner=document.createElement('div');scanner.id='v025211Scanner';scanner.className='v025211-scanner';scanner.innerHTML='<video id="v025211ScannerVideo" playsinline muted></video><div class="v025211-scanner-actions"><button type="button" id="v025211StopScanner">Fechar câmera</button></div>';
    field?.insertAdjacentElement('beforebegin',button);button.insertAdjacentElement('afterend',scanner);
    button.addEventListener('click',startScanner);byId('v025211StopScanner')?.addEventListener('click',stopScanner);
    return true;
  }
  function start(){
    if(install())return;
    const observer=new MutationObserver(()=>{if(install())observer.disconnect();});observer.observe(document.body,{childList:true,subtree:true});
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState!=='visible')stopScanner();});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  window.Rota27V025211EnrollmentScanner={start:startScanner,stop:stopScanner,install};
})();
