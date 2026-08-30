import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const EDGE_VERSION = "rota27-birthday-greeting-v1";
const TEMPLATE_NAME = "aniversario_cliente_rota27_v1";
const TEMPLATE_LANG = "pt_BR";
const CAMPAIGN = "birthday_greeting_v1";
const STORE_ID_DEFAULT = "rota27-bodega";
const TIME_ZONE = "America/Sao_Paulo";
const SEND_HOUR = 9;
const SEND_MINUTE = 30;
const ROTA27_WABA_ID = "2184585049047021";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-rota27-device-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
function json(status:number, body:unknown){ return new Response(JSON.stringify(body),{status,headers:jsonHeaders}); }
function clean(v:unknown,max=500){ return String(v??"").replace(/\u0000/g,"").replace(/[\r\n\t]+/g," ").replace(/\s{2,}/g," ").trim().slice(0,max); }
function digits(v:unknown){ return String(v??"").replace(/\D/g,""); }
function normalizePhone(v:unknown){ let d=digits(v).replace(/^0+/,""); if(d.length===10||d.length===11)d=`55${d}`; return d; }
function validPhone(v:string){ return v.length>=12&&v.length<=15; }
function safeEqual(a:string,b:string){ const ea=new TextEncoder().encode(a),eb=new TextEncoder().encode(b); if(ea.length!==eb.length)return false; let diff=0; for(let i=0;i<ea.length;i++)diff|=ea[i]^eb[i]; return diff===0; }
function boolField(v:unknown){ return v===true; }
function wabaId(){ return clean(Deno.env.get("WHATSAPP_BUSINESS_ACCOUNT_ID")||Deno.env.get("WHATSAPP_WABA_ID")||Deno.env.get("WABA_ID")||ROTA27_WABA_ID,120); }

function localNow(){
  const parts = new Intl.DateTimeFormat("en-CA",{timeZone:TIME_ZONE,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(new Date());
  const pick=(type:string)=>Number(parts.find(p=>p.type===type)?.value||0);
  const year=pick("year"),month=pick("month"),day=pick("day"),hour=pick("hour"),minute=pick("minute");
  return {year,month,day,hour,minute,date:`${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`};
}
function birthParts(value:unknown){
  const raw=clean(value,20),m=raw.match(/^(\d{4})-(\d{2})-(\d{2})$/); if(!m)return null;
  const y=Number(m[1]),month=Number(m[2]),day=Number(m[3]),dt=new Date(Date.UTC(y,month-1,day));
  if(y<1900||dt.getUTCFullYear()!==y||dt.getUTCMonth()!==month-1||dt.getUTCDate()!==day)return null;
  return {year:y,month,day};
}
function deliveryOf(row:any){
  const raw=clean(row?.payload?.delivery?.status||"",40).toLowerCase();
  if(["sent","delivered","read","failed"].includes(raw))return raw;
  if(row?.status==="failed")return "failed";
  if(row?.status==="processing")return "processing";
  if(row?.status==="sent")return "accepted_meta";
  return clean(row?.status||"unknown",40).toLowerCase()||"unknown";
}

async function graphJson(url:string,accessToken:string,init:RequestInit={}){
  const response=await fetch(url,{...init,headers:{Authorization:`Bearer ${accessToken}`,"Content-Type":"application/json",...(init.headers||{})}});
  const data=await response.json().catch(()=>({}));
  if(!response.ok){const err=data?.error||{},message=clean(err.message||`Meta HTTP ${response.status}`,600),details=clean(err?.error_data?.details||"",900);const e:any=new Error(details?`${message} | ${details}`:message);e.metaCode=err.code||null;e.metaSubcode=err.error_subcode||null;throw e;}
  return data;
}
async function getTemplate(accessToken:string,waba:string,graphVersion:string){
  const url=`https://graph.facebook.com/${encodeURIComponent(graphVersion)}/${encodeURIComponent(waba)}/message_templates?name=${encodeURIComponent(TEMPLATE_NAME)}&limit=100`;
  const data=await graphJson(url,accessToken),row=Array.isArray(data?.data)?data.data.find((x:any)=>clean(x?.name,160)===TEMPLATE_NAME):null;
  return row?{found:true,status:clean(row.status||"UNKNOWN",60),category:clean(row.category||"",60)||null,id:clean(row.id||"",120)||null,language:clean(row.language||TEMPLATE_LANG,30)}:{found:false,status:"NOT_SUBMITTED",category:null,id:null,language:TEMPLATE_LANG};
}
async function submitTemplate(accessToken:string,waba:string,graphVersion:string){
  const existing=await getTemplate(accessToken,waba,graphVersion); if(existing.found)return{existing:true,...existing};
  const text="Olá, {{1}}! A equipe da Rota 27 Bodega deseja a você um feliz aniversário, com muita saúde, alegria e bons momentos. Parabéns pelo seu dia!";
  const payload={name:TEMPLATE_NAME,language:TEMPLATE_LANG,category:"MARKETING",components:[{type:"BODY",text,example:{body_text:[["Marcos"]]}},{type:"FOOTER",text:"Rota 27 Bodega • Jardim Camburi"}]};
  const url=`https://graph.facebook.com/${encodeURIComponent(graphVersion)}/${encodeURIComponent(waba)}/message_templates`;
  const data=await graphJson(url,accessToken,{method:"POST",body:JSON.stringify(payload)});
  return{existing:false,found:true,status:clean(data?.status||"PENDING",60),category:"MARKETING",id:clean(data?.id||"",120)||null,language:TEMPLATE_LANG};
}

Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS")return new Response("ok",{headers:corsHeaders});
  if(req.method!=="POST")return json(405,{ok:false,error:"Método não permitido."});
  let body:any={};try{body=await req.json();}catch{return json(400,{ok:false,error:"JSON inválido."});}
  const action=clean(body?.action||"status",50),storeId=clean(body?.storeId||Deno.env.get("ROTA27_SYNC_STORE_ID")||STORE_ID_DEFAULT,80)||STORE_ID_DEFAULT;
  const configuredDeviceToken=Deno.env.get("ROTA27_DEVICE_TOKEN")||"",receivedDeviceToken=req.headers.get("x-rota27-device-token")||"";
  const deviceAuthorized=configuredDeviceToken.length>=16&&safeEqual(receivedDeviceToken,configuredDeviceToken);
  const supabaseUrl=Deno.env.get("SUPABASE_URL")||"",serviceRoleKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"",accessToken=Deno.env.get("WHATSAPP_ACCESS_TOKEN")||"",phoneNumberId=Deno.env.get("WHATSAPP_PHONE_NUMBER_ID")||"",graphVersion=Deno.env.get("META_GRAPH_VERSION")||"",waba=wabaId();
  if(!supabaseUrl||!serviceRoleKey||!accessToken||!phoneNumberId||!graphVersion||!waba)return json(500,{ok:false,error:"Backend incompleto para parabéns de aniversário.",edgeVersion:EDGE_VERSION});
  const db=createClient(supabaseUrl,serviceRoleKey,{auth:{persistSession:false,autoRefreshToken:false}});

  async function latestClients(){
    const{data,error}=await db.from("rota27_sync_events").select("seq,entity_id,payload").eq("store_id",storeId).eq("event_type","client_upsert").order("seq",{ascending:true}).limit(5000);
    if(error)throw new Error(`Falha ao ler clientes: ${error.message}`);
    const map=new Map<string,any>();
    for(const row of data||[]){const c=row?.payload?.client;if(!c||typeof c!=="object")continue;const id=clean(c.id||row.entity_id,160);if(!id)continue;const old=map.get(id)||{},next={...old,...c,id};for(const key of ["birthDate","relationshipMarketingOptIn","relationshipMarketingOptInAt","relationshipMarketingOptOutAt","relationshipMarketingConsentSource"])if(c[key]===undefined&&old[key]!==undefined)next[key]=old[key];map.set(id,next);}
    return[...map.values()];
  }
  function normalizedAudience(rows:any[]){const local=localNow();return rows.map((c:any)=>{const birth=birthParts(c.birthDate),phone=normalizePhone(c.whatsappPhone||c.phone||"");return{id:clean(c.id,160),name:clean(c.name||"Cliente",120)||"Cliente",phone,birthDate:clean(c.birthDate||"",20),birthdayToday:!!birth&&birth.month===local.month&&birth.day===local.day,marketingOptIn:boolField(c.relationshipMarketingOptIn),optInAt:Math.max(0,Number(c.relationshipMarketingOptInAt||0))};});}
  async function todayLogs(year:number){const prefix=`${CAMPAIGN}::${year}::`;const{data,error}=await db.from("whatsapp_message_log").select("event_id,status,wa_message_id,last_error,sent_at,updated_at,customer_name,phone,payload,attempts").like("event_id",`${prefix}%`).order("updated_at",{ascending:false}).limit(1000);if(error)throw new Error(`Falha ao ler parabéns enviados: ${error.message}`);return data||[];}
  async function sendOne(target:any,year:number){
    const eventId=`${CAMPAIGN}::${year}::${target.id}`,nowIso=new Date().toISOString();
    const{data:existing,error:existingError}=await db.from("whatsapp_message_log").select("status,wa_message_id,attempts").eq("event_id",eventId).limit(1).maybeSingle();if(existingError)throw new Error(existingError.message);
    if(existing?.status==="sent")return{clientId:target.id,status:"duplicate_skipped",messageId:existing.wa_message_id||null};
    const payloadLog={campaign:CAMPAIGN,clientId:target.id,birthDate:target.birthDate,birthdayYear:year,template:TEMPLATE_NAME,edgeVersion:EDGE_VERSION,consentBasis:"explicit_relationship_marketing_opt_in",optInAt:target.optInAt||null,scheduledLocalTime:"09:30",timeZone:TIME_ZONE};
    await db.from("whatsapp_message_log").upsert({event_id:eventId,command_id:`birthday::${target.id}`,phone:target.phone,customer_name:target.name,command_label:"Parabéns de aniversário",payload:payloadLog,status:"processing",attempts:Number(existing?.attempts||0)+1,last_error:null,updated_at:nowIso},{onConflict:"event_id"});
    const endpoint=`https://graph.facebook.com/${encodeURIComponent(graphVersion)}/${encodeURIComponent(phoneNumberId)}/messages`;
    const metaPayload={messaging_product:"whatsapp",recipient_type:"individual",to:target.phone,type:"template",template:{name:TEMPLATE_NAME,language:{code:TEMPLATE_LANG},components:[{type:"body",parameters:[{type:"text",text:target.name}]}]}};
    try{const metaData=await graphJson(endpoint,accessToken,{method:"POST",body:JSON.stringify(metaPayload)}),messageId=Array.isArray(metaData?.messages)&&metaData.messages.length?clean(metaData.messages[0]?.id,300):"";await db.from("whatsapp_message_log").upsert({event_id:eventId,command_id:`birthday::${target.id}`,phone:target.phone,customer_name:target.name,command_label:"Parabéns de aniversário",payload:payloadLog,status:"sent",wa_message_id:messageId||null,last_error:null,sent_at:new Date().toISOString(),updated_at:new Date().toISOString()},{onConflict:"event_id"});return{clientId:target.id,status:"sent",messageId:messageId||null};}
    catch(error:any){const errorText=clean(error?.message||"Falha ao enviar parabéns.",1000);await db.from("whatsapp_message_log").upsert({event_id:eventId,command_id:`birthday::${target.id}`,phone:target.phone,customer_name:target.name,command_label:"Parabéns de aniversário",payload:payloadLog,status:"failed",last_error:errorText,updated_at:new Date().toISOString()},{onConflict:"event_id"});return{clientId:target.id,status:"failed",error:errorText};}
  }

  if(action==="bootstrap_template"){
    try{const template=await submitTemplate(accessToken,waba,graphVersion);return json(200,{ok:true,edgeVersion:EDGE_VERSION,templateName:TEMPLATE_NAME,template});}
    catch(error:any){return json(502,{ok:false,error:clean(error?.message||"Falha ao preparar template de aniversário.",1200),metaCode:error?.metaCode||null,metaSubcode:error?.metaSubcode||null,edgeVersion:EDGE_VERSION});}
  }

  if(action==="status"){
    if(!deviceAuthorized)return json(401,{ok:false,error:"Dispositivo não autorizado."});
    const local=localNow(),clients=normalizedAudience(await latestClients()),birthdays=clients.filter(c=>c.birthdayToday),eligible=birthdays.filter(c=>c.marketingOptIn&&validPhone(c.phone)),logs=await todayLogs(local.year),byClient=new Map(logs.map((r:any)=>[clean(r?.payload?.clientId||String(r.event_id||"").split("::").pop(),160),r]));
    let template:any,templateError:string|null=null;try{template=await getTemplate(accessToken,waba,graphVersion);}catch(error){template={found:false,status:"ERROR"};templateError=clean(error instanceof Error?error.message:"Falha ao consultar template.",900);}
    return json(200,{ok:true,edgeVersion:EDGE_VERSION,templateName:TEMPLATE_NAME,template,templateError,schedule:{localTime:"09:30",timeZone:TIME_ZONE},counts:{birthdaysToday:birthdays.length,authorized:eligible.length,sent:logs.filter((r:any)=>r.status==="sent").length,failed:logs.filter((r:any)=>r.status==="failed").length},rows:birthdays.map(c=>{const r=byClient.get(c.id);return{clientId:c.id,name:c.name,hasPhone:validPhone(c.phone),marketingOptIn:c.marketingOptIn,status:r?deliveryOf(r):(c.marketingOptIn&&validPhone(c.phone)?"scheduled":"not_eligible"),sentAt:r?.sent_at||null,lastError:clean(r?.last_error||"",900)||null};})});
  }

  if(action==="send_client"){
    if(!deviceAuthorized)return json(401,{ok:false,error:"Dispositivo não autorizado."});
    const local=localNow(),clientId=clean(body?.clientId,160),clients=normalizedAudience(await latestClients()),target=clients.find(c=>c.id===clientId&&c.birthdayToday&&c.marketingOptIn&&validPhone(c.phone));if(!target)return json(409,{ok:false,error:"Cliente não elegível: aniversário, WhatsApp e autorização são obrigatórios."});
    const template=await getTemplate(accessToken,waba,graphVersion);if(String(template.status||"").toUpperCase()!=="APPROVED")return json(409,{ok:false,error:`Template ainda não aprovado pela Meta (${template.status||"desconhecido"}).`,template});
    const result=await sendOne(target,local.year);return json(200,{ok:true,edgeVersion:EDGE_VERSION,result});
  }

  if(action!=="run_due")return json(400,{ok:false,error:"Ação não suportada."});
  const local=localNow();
  const inAutomaticWindow=local.hour===SEND_HOUR&&local.minute>=SEND_MINUTE&&local.minute<=45;
  if(!inAutomaticWindow)return json(200,{ok:true,edgeVersion:EDGE_VERSION,skipped:true,reason:"outside_automatic_window",local});
  let template:any;try{template=await getTemplate(accessToken,waba,graphVersion);}catch(error){return json(502,{ok:false,error:clean(error instanceof Error?error.message:"Falha ao consultar template.",900),edgeVersion:EDGE_VERSION});}
  if(String(template.status||"").toUpperCase()!=="APPROVED")return json(200,{ok:true,edgeVersion:EDGE_VERSION,skipped:true,reason:"template_not_approved",template});
  const clients=normalizedAudience(await latestClients()),targets=clients.filter(c=>c.birthdayToday&&c.marketingOptIn&&validPhone(c.phone)).slice(0,100),results:any[]=[];
  for(const target of targets)results.push(await sendOne(target,local.year));
  return json(200,{ok:true,edgeVersion:EDGE_VERSION,templateName:TEMPLATE_NAME,localDate:local.date,sent:results.filter(r=>r.status==="sent").length,failed:results.filter(r=>r.status==="failed").length,duplicates:results.filter(r=>r.status==="duplicate_skipped").length,eligible:targets.length});
});
