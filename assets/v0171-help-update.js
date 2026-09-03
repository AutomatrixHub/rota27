/* Rota 27 v0.17.1 — atualização da Ajuda com clientes e WhatsApp bidirecional */
(function(){
  'use strict';

  const VERSION='0.17.1';
  const OVERLAY_ID='r27HelpOverlay';

  function normalize(text){
    return String(text||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  }

  function setSearch(section){
    if(!section)return;
    const title=section.querySelector('summary strong')?.textContent||'';
    const summary=section.querySelector('summary small')?.textContent||'';
    const body=section.querySelector('.r27-help-section-body')?.textContent||'';
    section.dataset.search=normalize(`${title} ${summary} ${body}`);
  }

  function makeSection({id,icon,title,summary,body}){
    const details=document.createElement('details');
    details.className='r27-help-section';
    details.id=`r27-help-${id}`;
    details.innerHTML=`
      <summary>
        <span class="r27-help-section-icon" aria-hidden="true">${icon}</span>
        <span><strong>${title}</strong><small>${summary}</small></span>
        <span class="r27-help-chevron" aria-hidden="true">⌄</span>
      </summary>
      <div class="r27-help-section-body">${body}</div>`;
    setSearch(details);
    return details;
  }

  function replaceWhatsapp(section){
    if(!section)return;
    const small=section.querySelector('summary small');
    if(small)small.textContent='Cliente, consentimento, mensagens compactas, fila local e respostas.';
    const body=section.querySelector('.r27-help-section-body');
    if(body)body.innerHTML=`
      <h4>Atualizações da comanda para o cliente</h4>
      <p>Quando o cliente autoriza o envio, o Rota 27 manda pelo WhatsApp apenas as <strong>alterações novas</strong> da comanda e o <strong>total atual</strong>.</p>
      <ul>
        <li>o consentimento continua sendo específico de cada comanda;</li>
        <li>o cadastro do cliente nunca ativa o consentimento automaticamente;</li>
        <li>os lançamentos são agrupados em blocos de até <strong>5 alterações por mensagem</strong>;</li>
        <li>os modelos atuais mostram <b>Comanda: Mesa/Parklet/Balcão</b>, sem o prefixo antigo “Item: +”;</li>
        <li>remoções aparecem claramente como <b>REMOVIDO: 1x Produto - R$ ...</b>;</li>
        <li>a fila de WhatsApp é local por aparelho e não entra na sincronização multidispositivo.</li>
      </ul>

      <div class="r27-help-example">
        <span class="r27-help-example-label">Exemplo</span>
        <strong>O cliente recebeu 5 novos lançamentos.</strong>
        <p>A mensagem mostra os 5 itens daquela atualização e o total atual. Se depois for removido um item, ele recebe uma nova mensagem curta somente com a remoção e o novo total.</p>
      </div>

      <h4>Se o cliente responder</h4>
      <p>Ao usar <strong>Responder</strong> em uma mensagem da comanda, a resposta é identificada pela mensagem original e encaminhada ao WhatsApp do gerente/responsável configurado.</p>
      <p>O gerente recebe a comanda, o nome do cliente, o número do cliente e o conteúdo recebido. Texto e respostas interativas são encaminhados; para mídia, o sistema informa o tipo recebido, como áudio, imagem ou documento.</p>

      <div class="r27-help-warn"><strong>Se não houver internet, o envio espera conexão.</strong> Não repita lançamentos nem apague dados do navegador para tentar “forçar” o WhatsApp.</div>`;
    setSearch(section);
  }

  function ensureChip(container,id,label){
    if(!container||container.querySelector(`[data-help-target="${id}"]`))return;
    const button=document.createElement('button');
    button.type='button';
    button.className='r27-help-chip';
    button.dataset.helpTarget=id;
    button.textContent=label;
    button.addEventListener('click',()=>{
      const section=document.getElementById(`r27-help-${id}`);
      if(!section)return;
      const input=document.getElementById('r27HelpSearch');
      if(input){input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));}
      section.hidden=false;section.open=true;section.scrollIntoView({behavior:'smooth',block:'start'});
    });
    container.appendChild(button);
  }

  function addScenario(list,question,answer,tag,icon='?'){
    if(!list||[...list.querySelectorAll('summary')].some(s=>s.textContent.trim()===question))return;
    const details=document.createElement('details');
    details.dataset.level='normal';
    details.innerHTML=`<summary data-r27-enhanced="1"><span class="r27-scenario-icon" aria-hidden="true">${icon}</span><span class="r27-scenario-copy"><span class="r27-scenario-title">${question}</span><span class="r27-scenario-tag">${tag}</span></span><span class="r27-scenario-chevron" aria-hidden="true">›</span></summary><p>${answer}</p>`;
    list.appendChild(details);
  }

  function enhance(){
    const overlay=document.getElementById(OVERLAY_ID);
    if(!overlay||overlay.dataset.r27V0171Help==='1')return false;
    overlay.dataset.r27V0171Help='1';

    const intro=overlay.querySelector('.r27-help-intro p');
    if(intro)intro.innerHTML='Use os atalhos ou pesquise palavras como <b>cliente</b>, <b>gerente</b>, <b>WhatsApp</b>, <b>resposta</b>, <b>sincronização</b>, <b>cancelar</b> ou <b>backup</b>.';

    const whatsapp=overlay.querySelector('#r27-help-whatsapp');
    replaceWhatsapp(whatsapp);

    const clientes=makeSection({
      id:'clientes',icon:'☺',title:'Clientes e autocomplete',
      summary:'Cadastro, importação, criação automática e uso nas comandas.',
      body:`
        <h4>Cadastro compartilhado de clientes</h4>
        <p>O Rota 27 mantém uma lista de clientes com nome, WhatsApp e observação. Esse cadastro ajuda a abrir comandas mais rápido e evita redigitar os mesmos dados.</p>
        <ul>
          <li><strong>Cadastro manual:</strong> crie ou edite um cliente no Cardápio.</li>
          <li><strong>Criação automática:</strong> ao abrir uma comanda com nome + WhatsApp válido, o cliente pode ser incorporado ao cadastro.</li>
          <li><strong>Importação:</strong> arquivos TXT/CSV passam por validação e prévia antes de serem adotados.</li>
          <li><strong>Exportação:</strong> a lista pode ser exportada em CSV.</li>
          <li><strong>Autocomplete:</strong> ao digitar nome ou telefone em Nova comanda/Editar comanda, o sistema sugere clientes conhecidos.</li>
        </ul>
        <div class="r27-help-example"><span class="r27-help-example-label">Exemplo</span><strong>Kiko já está cadastrado.</strong><p>Ao começar a digitar “Kiko” em Nova comanda, selecione a sugestão. O WhatsApp cadastrado é preenchido junto, mas o consentimento para mensagens continua dependendo daquela comanda.</p></div>
        <div class="r27-help-tip"><strong>Na lista de comandas:</strong> quando existe cliente identificado, o nome aparece como informação principal e Mesa/Parklet/Balcão fica abaixo.</div>`
    });

    const gerente=makeSection({
      id:'whatsapp-gerente',icon:'◆',title:'WhatsApp do gerente',
      summary:'Cópia automática dos lançamentos e configuração compartilhada.',
      body:`
        <p>O gerente/responsável pode receber uma cópia agrupada das alterações feitas nas comandas.</p>
        <ul>
          <li>a configuração fica em <strong>Cardápio → WhatsApp do gerente</strong>;</li>
          <li>nome, número e opção <strong>Receber lançamentos</strong> são sincronizados entre os aparelhos;</li>
          <li>cada aparelho mantém sua própria fila de envio para evitar duplicidade;</li>
          <li>adições, remoções e correções são agrupadas antes do envio;</li>
          <li>o sistema evita enviar duas cópias quando gerente e cliente são o mesmo número naquela operação.</li>
        </ul>
        <div class="r27-help-warn"><strong>O aparelho que fez o lançamento precisa estar com a integração de WhatsApp configurada.</strong> Se estiver offline, o envio fica pendente e tenta novamente depois.</div>`
    });

    const respostas=makeSection({
      id:'respostas-clientes',icon:'↩',title:'Respostas dos clientes',
      summary:'O que acontece quando o cliente responde uma mensagem da comanda.',
      body:`
        <p>Quando o cliente usa <strong>Responder</strong> em uma mensagem enviada pelo Rota 27, o backend associa a resposta à mensagem original, identifica a comanda e encaminha a informação ao gerente configurado.</p>
        <ol class="r27-help-steps">
          <li><span>1</span><div><strong>Cliente responde</strong><p>Ex.: “Pode trazer mais uma IPA, por favor.”</p></div></li>
          <li><span>2</span><div><strong>Rota 27 identifica a origem</strong><p>A resposta é vinculada à mensagem original e à comanda correspondente.</p></div></li>
          <li><span>3</span><div><strong>Gerente recebe</strong><p>A mensagem mostra comanda, cliente, WhatsApp e conteúdo recebido.</p></div></li>
        </ol>
        <div class="r27-help-tip"><strong>Sem duplicidade:</strong> o backend registra o ID da mensagem recebida e ignora retries já processados.</div>
        <div class="r27-help-warn"><strong>Importante:</strong> para a correlação segura, o cliente deve responder à mensagem da comanda usando o recurso “Responder” do WhatsApp.</div>`
    });

    const anchor=whatsapp||overlay.querySelector('#r27-help-painel');
    const parent=anchor?.parentElement;
    if(parent&&!document.getElementById(clientes.id))parent.insertBefore(clientes,anchor);
    if(parent&&!document.getElementById(gerente.id))anchor?.insertAdjacentElement('afterend',gerente);
    if(parent&&!document.getElementById(respostas.id))gerente.insertAdjacentElement('afterend',respostas);

    const sync=overlay.querySelector('#r27-help-sync .r27-help-section-body');
    if(sync&&!sync.querySelector('[data-r27-v0171-sync]')){
      const extra=document.createElement('div');
      extra.dataset.r27V0171Sync='1';
      extra.innerHTML=`<h4>O que também sincroniza agora</h4><ul><li>cadastro e edição de clientes;</li><li>exclusão de clientes;</li><li>configuração do WhatsApp do gerente.</li></ul><p>As filas de WhatsApp do cliente e do gerente continuam <strong>locais em cada aparelho</strong> e não são sincronizadas, justamente para evitar envio duplicado.</p>`;
      sync.appendChild(extra);setSearch(sync.closest('.r27-help-section'));
    }

    const scenarios=overlay.querySelector('#r27-help-se-acontecer .r27-help-scenarios');
    addScenario(scenarios,'O cliente respondeu a mensagem da comanda.','Se ele usou <b>Responder</b> na mensagem do Rota 27, a resposta é encaminhada ao gerente com cliente e comanda identificados.','Resposta do cliente','↩');
    addScenario(scenarios,'O gerente não recebeu a cópia do lançamento.','Confirme se <b>Receber lançamentos</b> está ativo, se o número do gerente está correto, se este aparelho está com WhatsApp configurado e se há internet.','WhatsApp do gerente','◆');
    addScenario(scenarios,'O cliente não apareceu no autocomplete.','Confira se ele está cadastrado com nome válido. Se for um cliente novo, complete nome + WhatsApp na comanda ou cadastre manualmente.','Clientes','☺');

    const chips=overlay.querySelector('.r27-help-chips');
    ensureChip(chips,'clientes','Clientes');
    ensureChip(chips,'whatsapp','WhatsApp');
    ensureChip(chips,'whatsapp-gerente','Gerente');
    ensureChip(chips,'respostas-clientes','Respostas');


    overlay.querySelectorAll('.r27-help-section').forEach(setSearch);
    return true;
  }

  function start(){
    if(enhance())return;
    const observer=new MutationObserver(()=>{if(enhance())observer.disconnect();});
    observer.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(enhance,200);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
