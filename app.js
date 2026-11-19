'use strict';
/* ===================== constantes ===================== */
const TYPES=["Appartement","Villa","Maison","Local commercial","Bureau","Plateau de bureaux","Terrain","Entrepôt / dépôt","Immeuble","Usine","Riad","Autre"];
const TXS=["Vente","Location","Pas-de-porte"];
const STATUS=["À vérifier","Vérifié","Vendu / loué","Rejeté"];
const NATURES=["Offre","Transaction","Expertise","Estimation agence"];
const SOURCES=["Visite terrain","Agence / courtier","Particulier","Avito","Mubawab","Yakeey","Agenz","Autre site","SAX","Collègue"];
const STATES=["Neuf","Bon état","Moyen","À rénover","En construction","Gros œuvre"];
const STANDINGS=["Économique","Moyen standing","Haut standing","Luxe"];
const LAND_TYPES=["Terrain","Villa","Maison"];
const TCOL={"Appartement":"#2f6fdf","Villa":"#2f9e5f","Maison":"#7a9e2f","Local commercial":"#d9772f","Bureau":"#8a4fd1","Plateau de bureaux":"#b04fd1","Terrain":"#a3742c","Entrepôt / dépôt":"#5b6770","Usine":"#5b6770","Immeuble":"#c0392b","Riad":"#d1a12f","Autre":"#888"};
const CITIES=[["Casablanca",33.573,-7.59,12.5],["Dar Bouazza",33.52,-7.81,8],["Bouskoura",33.45,-7.65,7],["Nouaceur",33.37,-7.58,6],["Mohammedia",33.687,-7.383,9],["Berrechid",33.265,-7.587,6],["Settat",33.0,-7.62,7],["El Jadida",33.25,-8.5,8],["Rabat",34.0,-6.84,8],["Salé",34.045,-6.8,7],["Témara",33.92,-6.91,7],["Kénitra",34.26,-6.58,9],["Marrakech",31.63,-8.0,15],["Béni Mellal",32.337,-6.36,8],["Fès",34.03,-5.0,12],["Meknès",33.89,-5.55,10],["Tanger",35.76,-5.83,12],["Agadir",30.42,-9.58,12],["Oujda",34.68,-1.91,10]];
const PAGE_CARDS=60,PAGE_ROWS=200;

/* ===================== utilitaires ===================== */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const fmt=n=>(n==null||!isFinite(n))?"—":Math.round(n).toLocaleString("fr-FR");
const fmtS=n=>(n==null||!isFinite(n))?"—":(Math.round(n*100)/100).toLocaleString("fr-FR");
const plain=n=>(n==null||!isFinite(n))?"":(Math.round(n*100)/100).toLocaleString("fr-FR");
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function h(tag,attrs,...kids){const e=document.createElement(tag);if(attrs)for(const k in attrs){const v=attrs[k];if(v==null||v===false)continue;if(k==="class")e.className=v;else if(k==="text")e.textContent=v;else if(k.startsWith("on"))e[k]=v;else if(k==="style")e.style.cssText=v;else e.setAttribute(k,v===true?"":v)}for(const c of kids.flat()){if(c==null||c===false||c==="")continue;e.append(c.nodeType?c:document.createTextNode(String(c)))}return e}
const LS={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("show");clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove("show"),2600)}
function toNum(s){s=String(s??"").replace(/[\s  ']/g,"");s=s.replace(/[.,](?=\d{3}(\D|$))/g,"");return parseFloat(s.replace(",","."))}
function numIn(v){const n=toNum(v);return isFinite(n)?n:null}
function hash(str){let h=5381;for(let i=0;i<str.length;i++)h=((h<<5)+h+str.charCodeAt(i))>>>0;return h.toString(36)}
function distM(a,b){return Math.hypot((a[0]-b[0])*111000,(a[1]-b[1])*111000*Math.cos(a[0]*Math.PI/180))}
function dmsToDec(s){const m=s.match(/(\d+)°(\d+)'([\d.]+)"([NSEW])/);if(!m)return null;let v=+m[1]+m[2]/60+m[3]/3600;return /[SW]/.test(m[4])?-v:v}
function coordsFrom(text){text=String(text||"");const d=text.match(/(\d+°\d+'[\d.]+"[NS])\s*(\d+°\d+'[\d.]+"[EW])/);if(d)return [dmsToDec(d[1]),dmsToDec(d[2])];const m=text.match(/(-?\d{1,2}[.,]\d{3,})\s*[, ]\s*(-?\d{1,2}[.,]\d{3,})/);if(m){const a=+m[1].replace(",","."),b=+m[2].replace(",",".");if(a>20&&a<37&&b<0&&b>-18)return [a,b]}return null}
function gpsStr(g){return g?(+g[0].toFixed(7))+", "+(+g[1].toFixed(7)):""}
function gpsOf(c){const g=coordsFrom(c?.gps||"");return g&&g[0]!==0?g:null}
function guessCity(g){if(!g)return "";let best=null;for(const [n,la,lo,r] of CITIES){const d=distM(g,[la,lo])/1000;if(d<=r&&(!best||d<best[1]))best=[n,d]}return best?best[0]:""}
function ppmOf(c){return c&&c.price>0&&c.surface>0?c.price/c.surface:null}
function unitSuf(tx){return tx==="Location"?"DH/m²/mois":"DH/m²"}
function priceSuf(tx){return tx==="Location"?" DH / mois":" DH"}
function satUrl(g){return "https://www.google.com/maps/place/"+g[0]+","+g[1]+"/@"+g[0]+","+g[1]+",180m/data=!3m1!1e3"}
function ageMonths(c){if(!c.date)return null;const d=new Date(c.date);if(isNaN(d))return null;return (Date.now()-d)/2.63e9}
function isOld(c){const a=ageMonths(c);return a!=null&&a>S.valid}
function stats(vals){const v=vals.filter(x=>x!=null&&isFinite(x)).sort((a,b)=>a-b);const n=v.length;if(!n)return null;const mean=v.reduce((a,b)=>a+b,0)/n;const q=p=>{const i=(n-1)*p,lo=Math.floor(i),hi=Math.ceil(i);return v[lo]+(v[hi]-v[lo])*(i-lo)};const sd=n>1?Math.sqrt(v.reduce((a,b)=>a+(b-mean)**2,0)/(n-1)):0;return {n,min:v[0],max:v[n-1],mean,med:q(.5),q1:q(.25),q3:q(.75),sd,cv:mean?sd/mean:0}}
function statusClass(s){return s==="Vérifié"?"st-ok":s==="À vérifier"?"st-warn":s==="Rejeté"?"st-bad":"st-old"}
function fillSelect(sel,opts,first){sel.length=0;if(first!==undefined)sel.add(new Option(first,""));opts.forEach(o=>sel.add(new Option(o,o)))}
function ensureOpt(sel,v){if(v&&![...sel.options].some(o=>o.value===v))sel.add(new Option(v,v))}
function basisDefault(type){return LAND_TYPES.includes(type)?"terrain":"bati"}
function basisOf(c){return c.basis||basisDefault(c.type)}

/* ===================== état ===================== */
const CFG=window.VT_CONFIG||{};
let items=[],etudes=[],online=false,loaded=false,sampleCap=null,sampleImg=false;
let S={cm:.5,cc:.33,ct:.3,valid:12,nego:10};
let view=LS.get("mc_view","list"),shown=0;
let sel=new Set(LS.get("mc_sel",[]));
let etude=LS.get("mc_etude",null)||newEtude();
function saveSel(){LS.set("mc_sel",[...sel])}
function saveEtudeDraft(){LS.set("mc_etude",etude)}
function newEtude(){return {id:"e"+Date.now().toString(36),dossier:"",type:"",tx:"Vente",surface:null,address:"",gps:"",nego:null,retenu:null,adj:{},createdAt:Date.now()}}
function saveCache(){}
function loadCache(){}
function errMsg(e,fallback){const c=e?.code||"";
  if(c==="permission-denied")return "Action non autorisée pour ton compte.";
  if(c==="unavailable"||c==="network"||c==="auth/network-request-failed")return "Pas de connexion internet : réessaie dès que le réseau revient.";
  if(c==="offline"||c==="unauthenticated")return "Session terminée : reconnecte-toi.";
  if(c==="resource-exhausted")return "Limite du jour atteinte sur le serveur : réessaie plus tard.";
  if(c==="too-big")return "Photo trop lourde, même réduite.";
  return fallback||"Échec de l’enregistrement, réessaie."}

/* ===================== utilisateur et droits ===================== */
const ME={uid:null,email:"",name:"",role:null,modules:[],expires:null};
const ROLE_LBL={owner:"Propriétaire",collab:"Collaborateur",reader:"Lecteur"};
function isOwner(){return ME.role==="owner"}
function canAdd(){return isOwner()||ME.role==="collab"}
function canEditItem(c){return !!c&&(isOwner()||(ME.role==="collab"&&c.createdBy===ME.uid))}
function canDelete(){return isOwner()}
function canExport(){return isOwner()||ME.modules.includes("export")}
function applyRoleUi(){
  ["#addBtn","#pasteBtn","#mPaste"].forEach(s=>{const e=$(s);if(e)e.hidden=!canAdd()});
  ["#importBtn","#csvBtn","#mRestore"].forEach(s=>{const e=$(s);if(e)e.hidden=!isOwner()});
  ["#exportBtn","#kmlExport","#mBackup"].forEach(s=>{const e=$(s);if(e)e.hidden=!canExport()});
  $("#modAdmin").hidden=!isOwner();if(!isOwner()&&curMod==="admin")showMod("temoins");
  $("#modVisites").hidden=!!ME.role&&!canVisites();if(!canVisites()&&curMod==="visites")showMod("temoins");
  $("#setSave").hidden=!!ME.role&&!isOwner();$("#setRO").hidden=!ME.role||isOwner();
  $("#acctMail").textContent=ME.email?(ME.email+(ME.role?" · "+ROLE_LBL[ME.role]:"")):"";$("#mLogout").hidden=!ME.uid;
}

/* ===================== Firebase ===================== */
let auth=null,fdb=null,unsubs=[];
const PUB={},PRIV={};let mergeT=null,syncMeta={fromCache:true,hasPendingWrites:false};
const ITEM_KEYS=["date","tx","type","price","surface","sMain","sMezz","sCave","sTerr","sLand","basis","avance","loyer","city","district","address","gps","floor","rooms","state","standing","age","nature","status","source","link","code","dossier","notes","photos","createdAt","updatedAt"];
const NUMKEYS=new Set(["price","surface","sMain","sMezz","sCave","sTerr","sLand","avance","loyer","age","createdAt","updatedAt"]);
function initFirebase(){
  if(!window.firebase||!CFG.firebase||!CFG.firebase.apiKey)return false;
  firebase.initializeApp(CFG.firebase);auth=firebase.auth();fdb=firebase.firestore();
  try{fdb.settings({ignoreUndefinedProperties:true,cacheSizeBytes:200*1048576,merge:true})}catch(e){}
  return true}
async function enablePersist(){try{await fdb.enablePersistence({synchronizeTabs:true})}catch(e){}}
const tCol=()=>fdb.collection("temoins"),pCol=()=>fdb.collection("temoins_priv"),phCol=()=>fdb.collection("photos");
function cleanId(id){id=String(id||"").replace(/\//g,"_").trim().slice(0,140);if(!id||id==="."||id===".."||/^__.*__$/.test(id))id="c"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);return id}
function refStr(n){return "T-"+String(n).padStart(4,"0")}
function refNum(r){const m=/^T-(\d+)$/.exec(r||"");return m?+m[1]:0}

/* coordonnées privées : téléphones et nom du contact retirés des observations partagées */
const PHONE1=/(?:\+|00)?212[\s.\-]?(?:\(0\)|0)?[\s.\-]?[5-8](?:[\s.\-]?\d){8}/g,PHONE2=/(^|[^\d.,])0[5-8](?:[\s.\-]?\d){8}(?!\d)/g;
const NAME_STOP=new Set(["agence","immo","immobilier","immobiliere","immobilière","promoteur","syndic","gardien","propriétaire","proprietaire","courtier","samsar","contact","bureau","societe","société"]);
function maskNotes(t,name){t=String(t||"").replace(PHONE1,"[tél. privé]").replace(PHONE2,"$1[tél. privé]");
  const words=String(name||"").replace(/\b(m|mr|mme|mlle|monsieur|madame|si|sidi|lalla)\b\.?/gi," ").split(/[\s\/,;]+/).filter(w=>w.length>=4&&!/\d/.test(w)&&!NAME_STOP.has(w.toLowerCase()));
  const full=String(name||"").trim();const pats=[full,...words].filter(w=>w.length>=4).map(w=>w.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"));
  if(pats.length)t=t.replace(new RegExp("(?:"+pats.join("|")+")","gi"),"[contact privé]");
  return t}
function normItem(o){const x={};
  ITEM_KEYS.forEach(k=>{let v=o[k];
    if(k==="photos"){x.photos=Array.isArray(v)?v.filter(p=>p&&p.id&&!p.url).map(p=>({id:String(p.id),t:String(p.t||"")})):[];return}
    if(NUMKEYS.has(k)){const n=typeof v==="number"?v:numIn(v);x[k]=n!=null&&isFinite(n)?n:null;return}
    x[k]=v==null?"":String(v)});
  return x}
function splitItem(o,base){
  const createdBy=base?.createdBy||ME.uid,x=normItem(o);
  const pub={...x,notes:maskNotes(x.notes,o.contactName),createdBy,byName:base?base.byName||"":ME.name,ref:base?.ref||o.ref||""};
  const priv={contactName:String(o.contactName||""),contactTel:String(o.contactTel||""),notes:x.notes,createdBy};
  return {pub,priv}}
function rebuild(){items=Object.keys(PUB).map(id=>{const p=PUB[id],q=PRIV[id];
  return q?{...p,id,contactName:q.contactName||"",contactTel:q.contactTel||"",notes:q.notes!=null&&q.notes!==""?q.notes:(p.notes||"")}:{...p,id,contactName:"",contactTel:""}})}
let refsChecked=false;
function scheduleRender(){clearTimeout(mergeT);mergeT=setTimeout(()=>{rebuild();loaded=true;render();
  if(!refsChecked&&!syncMeta.fromCache&&online){refsChecked=true;(isOwner()?ensureCounter():Promise.resolve()).then(fixRefs)}updateAcct();if($("#view").open&&viewing){const c=items.find(x=>x.id===viewing.id);if(c)viewing=c}if($("#etude").open)renderEtude();if(curMod==="admin")renderAdmin()},60)}
function stopListen(){unsubs.forEach(u=>{try{u()}catch(e){}});unsubs=[];stopAdmin();stopVisites()}
function listenErr(e){if(e?.code==="permission-denied"){toast("Accès refusé par le serveur : reconnecte-toi.");$("#status").textContent="Ton accès a changé : recharge la page."}else $("#status").textContent="Connexion interrompue : les données affichées viennent de cet appareil."}
function listen(){
  stopListen();Object.keys(PUB).forEach(k=>delete PUB[k]);Object.keys(PRIV).forEach(k=>delete PRIV[k]);
  unsubs.push(tCol().onSnapshot({includeMetadataChanges:true},s=>{
    s.docChanges().forEach(ch=>{if(ch.type==="removed")delete PUB[ch.doc.id];else PUB[ch.doc.id]=ch.doc.data()});
    syncMeta={fromCache:s.metadata.fromCache,hasPendingWrites:s.metadata.hasPendingWrites};scheduleRender()},listenErr));
  if(canAdd()){const q=isOwner()?pCol():pCol().where("createdBy","==",ME.uid);
    unsubs.push(q.onSnapshot(s=>{s.docChanges().forEach(ch=>{if(ch.type==="removed")delete PRIV[ch.doc.id];else PRIV[ch.doc.id]=ch.doc.data()});scheduleRender()},()=>{}))}
  unsubs.push(fdb.collection("etudes").where("createdBy","==",ME.uid).onSnapshot(s=>{etudes=s.docs.map(d=>({...d.data(),id:d.id}));if($("#etudesDlg").open)renderEtudes()},()=>{}));
  listenVisites();
  unsubs.push(fdb.doc("config/settings").onSnapshot(d=>{if(d.exists){const x=d.data();for(const k in S)if(x[k]!=null&&isFinite(+x[k]))S[k]=+x[k];scheduleRender()}},()=>{}));
}
/* écriture : attend le serveur s'il répond vite, sinon reste en file d'attente sur l'appareil */
async function commitSoft(p){
  const r=await Promise.race([p.then(()=>"ok"),new Promise(res=>setTimeout(()=>res("queued"),navigator.onLine?10000:700))]);
  if(r==="queued")p.catch(e=>toast(errMsg(e,"Un enregistrement fait hors ligne a été refusé par le serveur.")));
  return r}
async function assignRef(id){
  const cRef=fdb.doc("counters/temoins"),tRef=tCol().doc(id);
  return fdb.runTransaction(async t=>{const c=await t.get(cRef),d=await t.get(tRef);if(!c.exists||!d.exists||d.data().ref)return;
    const n=(c.data().n||0)+1;t.update(cRef,{n});t.update(tRef,{ref:refStr(n)})})}
async function ensureCounter(){try{const c=await fdb.doc("counters/temoins").get();if(c.exists)return;
  const mx=Math.max(0,...items.map(x=>refNum(x.ref)));await fdb.doc("counters/temoins").set({n:mx})}catch(e){}}
async function fixRefs(){if(!canAdd()||!navigator.onLine)return;const mine=items.filter(x=>!x.ref&&(isOwner()||x.createdBy===ME.uid)).slice(0,25);
  for(const x of mine){try{await assignRef(x.id)}catch(e){return}}}
async function reserveRefs(k){const cRef=fdb.doc("counters/temoins");
  return fdb.runTransaction(async t=>{const c=await t.get(cRef);const n=c.exists?(c.data().n||0):Math.max(0,...items.map(x=>refNum(x.ref)));
    if(c.exists)t.update(cRef,{n:n+k});else t.set(cRef,{n:n+k});return n})}
const store={
  async bulk(list,onProg){if(!isOwner())throw {code:"permission-denied"};if(!navigator.onLine)throw {code:"network"};
    const need=list.filter(o=>!o.ref);if(need.length){const start=await reserveRefs(need.length);need.forEach((o,i)=>o.ref=refStr(start+i+1))}
    let done=0;for(let i=0;i<list.length;i+=200){const ch=list.slice(i,i+200),b=fdb.batch();
      ch.forEach(o=>{o.id=cleanId(o.id);const {pub,priv}=splitItem(o,null);b.set(tCol().doc(o.id),pub);b.set(pCol().doc(o.id),priv)});
      await b.commit();done+=ch.length;onProg&&onProg(done)}
    return done},
  async saveEtude(doc){return commitSoft(fdb.collection("etudes").doc(doc.id).set({...JSON.parse(JSON.stringify(doc)),createdBy:doc.createdBy||ME.uid}))},
  async deleteEtude(id){return commitSoft(fdb.collection("etudes").doc(id).delete())},
  async saveSettings(s){if(!isOwner())throw {code:"permission-denied"};const o={};["cm","cc","ct","valid","nego"].forEach(k=>o[k]=+s[k]);return commitSoft(fdb.doc("config/settings").set(o))},
  async uploadPhoto(blob,temoin){const data=await blobData(blob);if(data.length>990000)throw {code:"too-big"};
    const ref=phCol().doc();await commitSoft(ref.set({data,createdBy:ME.uid,temoin:temoin||"",createdAt:Date.now()}));IMG[ref.id]=data;return ref.id}
};
function blobData(b){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(b)})}
async function saveItem(o){
  if(!online)throw {code:"offline"};
  const base=items.find(x=>x.id===o.id)||null;
  if(base?!canEditItem(base):!canAdd())throw {code:"permission-denied"};
  if(!base)o.id=cleanId(o.id);
  const {pub,priv}=splitItem(o,base),b=fdb.batch();
  b.set(tCol().doc(o.id),pub);b.set(pCol().doc(o.id),priv);
  const r=await commitSoft(b.commit());
  if(!base&&!pub.ref&&navigator.onLine)assignRef(o.id).catch(()=>{});
  return r}
async function deleteItem(id){
  if(!online)throw {code:"offline"};if(!canDelete())throw {code:"permission-denied"};
  const c=items.find(x=>x.id===id),b=fdb.batch();
  b.delete(tCol().doc(id));b.delete(pCol().doc(id));
  (c?.photos||[]).forEach(p=>{b.delete(phCol().doc(p.id));if(p.t&&p.t!==p.id)b.delete(phCol().doc(p.t))});
  const r=await commitSoft(b.commit());sel.delete(id);saveSel();return r}

/* photos : enregistrées dans la base (image réduite), gardées en mémoire et sur l'appareil */
const IMG={},BLANK="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
function photoUrl(p,thumb){const id=thumb?(p.t||p.id):p.id;return IMG[id]||BLANK}
let imgQ=[],imgActive=0;
function queueImg(img){const id=img.dataset.pid;if(!id||img.dataset.h)return;if(IMG[id]){img.src=IMG[id];img.dataset.h="1";return}if(!fdb||!online)return;img.dataset.h="q";imgQ.push(img);pumpImg()}
async function getPhoto(id){const ref=phCol().doc(id);let d=null;try{d=await ref.get({source:"cache"})}catch(e){}if(!d||!d.exists)d=await ref.get();if(!d.exists)throw {code:"missing"};return d.data().data}
function pumpImg(){while(imgActive<4&&imgQ.length){const img=imgQ.shift(),id=img.dataset.pid;imgActive++;
  (IMG[id]?Promise.resolve(IMG[id]):getPhoto(id).then(u=>IMG[id]=u))
    .then(u=>{img.src=u;img.dataset.h="1"}).catch(()=>{img.dataset.h="";img.alt="Photo indisponible"}).finally(()=>{imgActive--;pumpImg()})}}
function hydrateAll(){$$("img[data-pid]").forEach(queueImg)}
new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes){if(n.nodeType!==1)continue;if(n.matches?.("img[data-pid]"))queueImg(n);n.querySelectorAll?.("img[data-pid]").forEach(queueImg)}}).observe(document.documentElement,{childList:true,subtree:true});
/* ===================== construction statique ===================== */
function buildStatic(){
  TYPES.forEach(t=>$("#fType").add(new Option(t,t)));TXS.forEach(t=>$("#fTx").add(new Option(t,t)));
  STATUS.forEach(t=>$("#fStatus").add(new Option(t,t)));NATURES.forEach(t=>$("#fNature").add(new Option(t,t)));
  fillSelect($("#f_type"),TYPES);fillSelect($("#f_nature"),NATURES,"—");fillSelect($("#f_status"),STATUS,"—");
  fillSelect($("#f_state"),STATES,"—");fillSelect($("#f_standing"),STANDINGS,"—");fillSelect($("#f_source"),SOURCES,"—");
  fillSelect($("#e_type"),TYPES,"Tous types");fillSelect($("#e_tx"),TXS);
  TXS.forEach(t=>$("#txSeg").append(h("button",{type:"button","data-v":t,text:t})));
}

/* ===================== filtres et rendu ===================== */
const FIDS=["fType","fTx","fStatus","fNature","fCity","fDistrict","fPmin","fPmax","fSmin","fSmax","fUmin","fUmax","fSince","near"];
function activeFilters(){let n=FIDS.filter(i=>$("#"+i).value.trim()).length;if($("#fPhotos").checked)n++;if($("#fRecent").checked)n++;return n}
function filtered(){
  const q=$("#q").value.trim().toLowerCase();
  const ft=$("#fType").value,fx=$("#fTx").value,fs=$("#fStatus").value,fn=$("#fNature").value,fc=$("#fCity").value,fd=$("#fDistrict").value.trim().toLowerCase();
  const pmin=numIn($("#fPmin").value),pmax=numIn($("#fPmax").value),smin=numIn($("#fSmin").value),smax=numIn($("#fSmax").value),umin=numIn($("#fUmin").value),umax=numIn($("#fUmax").value);
  const since=$("#fSince").value,ph=$("#fPhotos").checked,rec=$("#fRecent").checked;
  let r=items.filter(c=>{
    if(ft&&c.type!==ft)return false;if(fx&&c.tx!==fx)return false;
    if(fs==="__none"?!!c.status:(fs&&c.status!==fs))return false;
    if(fn&&c.nature!==fn)return false;if(fc&&c.city!==fc)return false;
    if(fd&&!(c.district||"").toLowerCase().includes(fd))return false;
    if(pmin!=null&&!(c.price>=pmin))return false;if(pmax!=null&&!(c.price<=pmax))return false;
    if(smin!=null&&!(c.surface>=smin))return false;if(smax!=null&&!(c.surface<=smax))return false;
    const u=ppmOf(c);if(umin!=null&&!(u>=umin))return false;if(umax!=null&&!(u<=umax))return false;
    if(since&&!(c.date&&c.date>=since))return false;
    if(ph&&!(c.photos&&c.photos.length))return false;
    if(rec&&isOld(c))return false;
    if(q&&![c.district,c.address,c.city,c.contactName,c.contactTel,c.notes,c.type,c.ref,c.code,c.dossier,c.floor,c.source].join(" ").toLowerCase().includes(q))return false;
    return true;
  });
  const nv=$("#near").value.trim(),center=nv?coordsFrom(nv):null,rad=+$("#radius").value;
  items.forEach(c=>delete c._d);
  if(nv&&!center)setInfo("Coordonnées non reconnues : écris par exemple 33.5734, -7.6480");
  if(center){r=r.map(c=>{const g=gpsOf(c);c._d=g?distM(center,g):null;return c}).filter(c=>c._d!=null&&c._d<=rad).sort((a,b)=>a._d-b._d);
    setInfo(r.length+" comparable(s) à moins de "+(rad>=1000?rad/1000+" km":rad+" m")+" du point, du plus proche au plus loin.");return r}
  if(!nv)setInfo("");
  const [k,dir]=$("#sort").value.split("-"),sg=dir==="asc"?1:-1;
  const val=c=>k==="ppm"?ppmOf(c):k==="price"?c.price:k==="surface"?c.surface:null;
  r.sort((a,b)=>{
    if(k==="date")return sg*((a.date||"").localeCompare(b.date||"")||(a.createdAt||0)-(b.createdAt||0));
    const va=val(a),vb=val(b);if(va==null&&vb==null)return 0;if(va==null)return 1;if(vb==null)return -1;return sg*(va-vb);
  });
  return r;
}
function setInfo(t){const i=$("#info");i.textContent=t;i.hidden=!t}
function render(){
  const cities=[...new Set(items.map(c=>c.city).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"fr"));
  const cur=$("#fCity").value;$("#fCity").length=1;cities.forEach(c=>$("#fCity").add(new Option(c,c)));$("#fCity").value=cities.includes(cur)?cur:"";
  $("#cities").replaceChildren(...cities.map(c=>h("option",{value:c})));
  const dists=[...new Set(items.map(c=>c.district).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"fr"));
  $("#districts").replaceChildren(...dists.map(c=>h("option",{value:c})));
  const nf=activeFilters();$("#fCount").textContent=nf;$("#fCount").hidden=!nf;
  $("#count").textContent=items.length?fmt(items.length)+" témoins":(loaded?"Aucun comparable":"Chargement…");
  const r=filtered();
  renderKpis(r);
  $$("#views button").forEach(b=>b.classList.toggle("on",b.dataset.v===view));
  $("#list").hidden=view!=="list";$("#tblWrap").hidden=view!=="table";$("#mapWrap").hidden=view!=="map";$("#kpis").hidden=view==="map"&&window.innerWidth<700;
  if(view==="list")renderCards(r);else if(view==="table")renderTable(r);else{$("#moreBtn").hidden=true;drawMap(r)}
  renderTray();
}
function renderKpis(r){
  const K=$("#kpis");K.innerHTML="";
  const tile=(k,v,s,color)=>K.append(h("div",{class:"kpi"},h("div",{class:"k"},color?h("i",{style:"background:"+color}):null,k),h("div",{class:"v"},v),s?h("div",{class:"s",text:s}):null));
  tile("Affichés",fmt(r.length),r.length!==items.length?"sur "+fmt(items.length)+" au total":"tous les comparables");
  const css=getComputedStyle(document.documentElement);
  [["Vente","Vente · médiane","--sale"],["Location","Location · médiane","--rent"],["Pas-de-porte","Pas-de-porte · médiane","--pdp"]].forEach(([tx,lbl,c])=>{
    const st=stats(r.filter(x=>x.tx===tx&&x.status!=="Rejeté").map(ppmOf));
    if(!st&&tx==="Pas-de-porte")return;
    const v=h("span",null,st?fmt(st.med):"—",h("small",{text:" "+unitSuf(tx)}));
    tile(lbl,v,st?fmt(st.min)+" – "+fmt(st.max)+" · "+st.n+" fiches":"aucune fiche",css.getPropertyValue(c).trim());
  });
  const ver=r.filter(c=>c.status==="Vérifié").length,av=r.filter(c=>c.status==="À vérifier").length;
  tile("Vérifiés",fmt(ver),av?fmt(av)+" à vérifier":"");
}
function chipsFor(c){
  const w=h("div",{class:"chips"},h("span",{class:"chip tx-"+(c.tx||"Vente"),text:c.tx||"Vente"}),h("span",{class:"chip",text:c.type||"—"}));
  if(c.status)w.append(h("span",{class:"chip "+statusClass(c.status),text:c.status}));
  if(c.nature&&c.nature!=="Offre")w.append(h("span",{class:"chip",text:c.nature}));
  if(isOld(c))w.append(h("span",{class:"chip st-old",text:"Ancien"}));
  return w;
}
function surfLine(c){
  const u=ppmOf(c);const parts=[];
  if(c.surface)parts.push(h("span",null,fmtS(c.surface)+" m²"+(basisOf(c)==="terrain"&&c.sLand?" terrain":(c.sMezz||c.sCave||c.sTerr?" pond.":""))));
  if(u)parts.push(h("b",{text:" · "+fmt(u)+" "+unitSuf(c.tx)}));
  return h("div",{class:"ppm"},parts.length?parts:"Surface non renseignée");
}
function renderCards(r){
  const L=$("#list");L.innerHTML="";
  if(!r.length){L.append(h("div",{class:"empty",text:items.length?"Aucun comparable ne correspond à ces critères.":(loaded?"Aucun comparable pour l’instant. Appuie sur « + Nouveau » ou « Coller une note » pour enregistrer le premier.":"Chargement de tes comparables…")}));$("#moreBtn").hidden=true;return}
  const n=Math.min(r.length,Math.max(shown,PAGE_CARDS));shown=n;
  r.slice(0,n).forEach(c=>{
    const on=sel.has(c.id);
    const ph=h("div",{class:"ph",onclick:()=>openView(c)});
    if(c.photos?.length){ph.append(h("img",{src:photoUrl(c.photos[0],1),"data-pid":c.photos[0].t||c.photos[0].id,alt:"",loading:"lazy"}));if(c.photos.length>1)ph.append(h("span",{class:"n",text:c.photos.length+" photos"}))}
    else ph.append(h("span",{text:"Pas de photo"}));
    const cb=h("input",{type:"checkbox","aria-label":"Sélectionner pour l’étude"});cb.checked=on;cb.onchange=()=>toggleSel(c.id);
    const bd=h("div",{class:"bd"},chipsFor(c),
      c._d!=null?h("div",{class:"dist",text:"à "+(c._d>=1000?(c._d/1000).toFixed(2).replace(".",",")+" km":Math.round(c._d)+" m")}):null,
      h("div",{class:"price"},fmt(c.price),h("small",{text:priceSuf(c.tx)})),
      surfLine(c),
      h("div",{class:"loc",text:[c.district,c.city].filter(Boolean).join(", ")||c.address||"Emplacement non renseigné"}),
      h("div",{class:"meta",text:[c.date?new Date(c.date).toLocaleDateString("fr-FR"):"Sans date",c.floor,c.source,c.ref,c.code?"Code "+c.code:""].filter(Boolean).join(" · ")}),
      h("div",{class:"acts"},h("button",{class:"btn sm",type:"button",text:"Fiche",onclick:()=>openView(c)}),canEditItem(c)?h("button",{class:"btn sm",type:"button",text:"Modifier",onclick:()=>openForm(c)}):null,
        gpsOf(c)?h("button",{class:"btn sm",type:"button",text:"Sur la carte",onclick:()=>showOnMap(c)}):null));
    L.append(h("article",{class:"card"+(on?" sel":"")},h("label",{class:"pick"},cb,"Étude"),ph,bd));
  });
  $("#moreBtn").hidden=n>=r.length;$("#moreBtn").textContent="Afficher plus ("+fmt(r.length-n)+" restants)";
}
const COLS=[["","",""],["date","Date",""],["","Opération",""],["","Type",""],["","Localisation",""],["surface","Surface","r"],["price","Prix","r"],["ppm","Prix/m²","r"],["","Statut",""],["","Source",""],["","Tél.",""]];
function renderTable(r,noMore){
  const T=$("#tbl");T.innerHTML="";
  const [sk,sd]=$("#sort").value.split("-");const near=r.some(c=>c._d!=null);
  const hr=h("tr");COLS.forEach(([k,l,cl])=>{const th=h("th",{class:cl,"data-k":k},l);if(k&&k===sk)th.append(h("span",{class:"ar",text:sd==="asc"?"▲":"▼"}));
    if(k)th.onclick=()=>{$("#sort").value=k+"-"+(sk===k&&sd==="desc"?"asc":"desc");shown=0;render()};hr.append(th)});
  if(near)hr.append(h("th",{class:"r","data-k":""},"Distance"));
  T.append(h("thead",null,hr));
  const tb=h("tbody");
  if(!r.length)tb.append(h("tr",null,h("td",{colspan:COLS.length+1,style:"text-align:center;color:var(--muted);padding:30px",text:"Aucun comparable ne correspond à ces critères."})));
  const n=noMore?r.length:Math.min(r.length,Math.max(shown,PAGE_ROWS));if(!noMore)shown=n;
  r.slice(0,n).forEach(c=>{
    const cb=h("input",{type:"checkbox","aria-label":"Sélectionner"});cb.checked=sel.has(c.id);cb.onclick=e=>e.stopPropagation();cb.onchange=()=>toggleSel(c.id);
    const u=ppmOf(c);
    const tr=h("tr",{class:sel.has(c.id)?"sel":"",onclick:()=>openView(c)},
      h("td",null,cb),h("td",{class:"num",text:c.date?new Date(c.date).toLocaleDateString("fr-FR"):"—"}),
      h("td",null,h("span",{class:"chip tx-"+(c.tx||"Vente"),text:c.tx||"Vente"})),h("td",{text:c.type||"—"}),
      h("td",{class:"wrap",text:[c.district,c.city].filter(Boolean).join(", ")||c.address||"—"}),
      h("td",{class:"num r",text:c.surface?fmtS(c.surface):"—"}),h("td",{class:"num r",text:fmt(c.price)}),
      h("td",{class:"num r",text:u?fmt(u):"—"}),
      h("td",null,c.status?h("span",{class:"chip "+statusClass(c.status),text:c.status}):"",isOld(c)?h("span",{class:"chip st-old",text:"Ancien",style:"margin-left:4px"}):""),
      h("td",{text:c.source||"—"}),h("td",{class:"num",text:c.contactTel||""}));
    if(near)tr.append(h("td",{class:"num r",text:c._d!=null?Math.round(c._d)+" m":""}));
    tb.append(tr);
  });
  T.append(tb);
  $("#moreBtn").hidden=n>=r.length;$("#moreBtn").textContent="Afficher plus ("+fmt(r.length-n)+" restants)";
}
$("#moreBtn").onclick=()=>{shown+=view==="table"?PAGE_ROWS:PAGE_CARDS;render()};
["#q","#sort","#radius",...FIDS.map(i=>"#"+i),"#fPhotos","#fRecent"].forEach(s=>$(s).addEventListener("input",()=>{shown=0;if(view==="map")mv=null;render()}));
$("#fBtn").onclick=()=>{const f=$("#filters");f.hidden=!f.hidden;$("#fBtn").setAttribute("aria-expanded",String(!f.hidden))};
$("#fReset").onclick=()=>{FIDS.forEach(i=>$("#"+i).value="");$("#fPhotos").checked=false;$("#fRecent").checked=false;$("#sort").value="date-desc";shown=0;mv=null;render()};
$$("#views button").forEach(b=>b.onclick=()=>{view=b.dataset.v;LS.set("mc_view",view);shown=0;if(view==="map")mv=null;render()});

/* ===================== sélection ===================== */
function toggleSel(id){if(sel.has(id))sel.delete(id);else sel.add(id);saveSel();render();if($("#etude").open)renderEtude()}
function renderTray(){
  const cs=items.filter(c=>sel.has(c.id));
  $("#tray").hidden=!cs.length;if(!cs.length)return;
  const tx=etude.tx||"Vente";const st=stats(cs.filter(c=>c.tx===tx).map(ppmOf));
  $("#trayTxt").replaceChildren(h("b",{text:cs.length}),cs.length>1?" comparables sélectionnés":" comparable sélectionné",st?h("span",null," · médiane "+tx.toLowerCase()+" ",h("b",{text:fmt(st.med)})," "+unitSuf(tx)):"");
}
$("#trayClear").onclick=()=>{sel.clear();saveSel();render()};
$("#traySel").onclick=()=>{view="table";LS.set("mc_view",view);render();const r=items.filter(c=>sel.has(c.id));renderTable(r,true);setInfo("Sélection affichée : "+r.length+" comparables. Change un filtre ou la recherche pour revenir à la liste complète.")};
$("#trayEtude").onclick=()=>openEtude();

/* ===================== fiche : consultation ===================== */
let viewing=null;
function openView(c){
  viewing=c;
  $("#vTitle").textContent=[c.type,c.tx,[c.district,c.city].filter(Boolean).join(", ")].filter(Boolean).join(" · ");
  $("#vEdit").hidden=!canEditItem(c);$("#vSel").textContent=sel.has(c.id)?"Retirer de l’étude":"Ajouter à l’étude";
  const B=$("#vBody");B.innerHTML="";
  const dl=rows=>{const d=h("dl",{class:"dl"});rows.filter(r=>r[1]!=null&&r[1]!==""&&r[1]!=="—").forEach(([k,v])=>d.append(h("dt",{text:k}),h("dd",null,v)));return d};
  const u=ppmOf(c);
  const sdet=[c.sMain?"principale "+fmtS(c.sMain):"",c.sMezz?"mezzanine "+fmtS(c.sMezz):"",c.sCave?"cave "+fmtS(c.sCave):"",c.sTerr?"terrasse "+fmtS(c.sTerr):"",c.sLand?"terrain "+fmtS(c.sLand):""].filter(Boolean).join(" · ");
  const g=gpsOf(c);
  const tel=c.contactTel?h("span",null,h("span",{class:"num",text:c.contactTel}),h("button",{class:"btn sm copy",type:"button",text:"Copier",onclick:e=>copyText(c.contactTel,e.target)})):null;
  B.append(h("div",{class:"vgrid"},
    h("section",null,h("h3",{class:"vh",text:"Prix et surfaces"}),dl([
      [c.tx==="Location"?"Loyer":c.tx==="Pas-de-porte"?"Pas-de-porte":"Prix",h("span",{class:"num",text:fmt(c.price)+priceSuf(c.tx)})],
      ["Prix au m²",u?h("span",{class:"num",text:fmt(u)+" "+unitSuf(c.tx)}):null],
      ["Surface retenue",c.surface?h("span",{class:"num",text:fmtS(c.surface)+" m² ("+(basisOf(c)==="terrain"?"terrain":"bâti pondéré")+")"}):null],
      ["Détail",sdet],
      ["Avance",c.avance?h("span",{class:"num",text:fmt(c.avance)+" DH"}):null],
      [c.tx==="Vente"?"Loyer actuel":"Loyer mensuel",c.loyer?h("span",{class:"num",text:fmt(c.loyer)+" DH / mois"}):null]])),
    h("section",null,h("h3",{class:"vh",text:"Localisation"}),dl([
      ["Ville",c.city],["Quartier",c.district],["Adresse",c.address],["Étage",c.floor],
      ["GPS",g?h("span",null,h("span",{class:"num",text:gpsStr(g)}),h("a",{class:"btn sm copy",href:"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(gpsStr(g).replace(/\s/g,"")),target:"_blank",rel:"noopener",text:"Google Maps"}),h("a",{class:"btn sm copy",href:"https://www.google.com/maps/dir/?api=1&destination="+g[0]+","+g[1],target:"_blank",rel:"noopener",text:"Itinéraire"}),h("button",{class:"btn sm copy",type:"button",text:"Sur la carte",onclick:()=>{$("#view").close();showOnMap(c)}})):null]])),
    h("section",null,h("h3",{class:"vh",text:"Bien"}),dl([["Pièces",c.rooms],["État",c.state],["Standing",c.standing],["Âge",c.age?c.age+" ans":null]])),
    h("section",null,h("h3",{class:"vh",text:"Source et suivi"}),dl([
      ["Nature",c.nature],["Statut",c.status?h("span",{class:"chip "+statusClass(c.status),text:c.status}):null],["Canal",c.source],["Contact",c.contactName],["Téléphone",tel],
      ["Annonce",c.link?h("a",{href:c.link,target:"_blank",rel:"noopener",text:"Ouvrir l’annonce"}):null],
      ["Référence",c.ref?h("b",{class:"num",text:c.ref}):null],["Code externe",c.code],["Dossier",c.dossier],["Ajouté par",c.byName],
      ["Relevé le",c.date?new Date(c.date).toLocaleDateString("fr-FR")+(isOld(c)?" (ancien)":""):"Sans date"],
      ["Modifié le",c.updatedAt?new Date(c.updatedAt).toLocaleDateString("fr-FR"):null]]))));
  if(c.notes)B.append(h("section",null,h("h3",{class:"vh",text:"Observations"}),h("p",{class:"pre",text:c.notes})));
  if(c.photos?.length)B.append(h("section",null,h("h3",{class:"vh",text:"Photos"}),h("div",{class:"gallery"},c.photos.map(p=>h("img",{src:photoUrl(p),"data-pid":p.id,alt:"",loading:"lazy"})))));
  if(!$("#view").open)$("#view").showModal();
}
$("#vEdit").onclick=()=>{$("#view").close();openForm(viewing)};
function summaryText(c){const txl=c.tx==="Location"?"à louer":c.tx==="Pas-de-porte"?"en pas-de-porte":"à vendre";
  const ml=LAND_TYPES.includes(c.type)?"construit":(c.type==="Local commercial"?"RDC":"surface");
  const sp=[c.sMain?ml+" "+fmtS(c.sMain)+" m²":"",c.sMezz?"mezzanine "+fmtS(c.sMezz)+" m²":"",c.sCave?"sous-sol "+fmtS(c.sCave)+" m²":"",c.sTerr?"terrasse "+fmtS(c.sTerr)+" m²":"",c.sLand?"terrain "+fmtS(c.sLand)+" m²":""].filter(Boolean);
  const surf=sp.length?sp.join(" + "):(c.surface?"surface "+fmtS(c.surface)+" m²":"");const u=ppmOf(c);
  const pr=c.price?(c.tx==="Location"?"loyer "+fmt(c.price)+" DH/mois":"prix "+fmt(c.price)+" DH")+(u?" (≈ "+fmt(u)+" "+unitSuf(c.tx)+")":""):"prix non communiqué";
  return [(c.type||"Bien")+" "+txl,[c.district,c.city||"Casablanca"].filter(Boolean).join(", "),surf,c.floor,pr,c.loyer?"loyer "+fmt(c.loyer)+" DH/mois":"",c.avance?"avance "+fmt(c.avance)+" DH":"",(c.contactName||c.contactTel)?"contact "+[c.contactName,c.contactTel].filter(Boolean).join(" "):"",gpsOf(c)?"GPS "+gpsStr(gpsOf(c)):"",c.link].filter(Boolean).join(" – ")}
$("#vCopy").onclick=e=>copyText(summaryText(viewing),e.target);
$("#vSel").onclick=()=>{toggleSel(viewing.id);$("#vSel").textContent=sel.has(viewing.id)?"Retirer de l’étude":"Ajouter à l’étude"};
$("#vNear").onclick=()=>{const g=gpsOf(viewing);if(!g){toast("Cette fiche n’a pas de position GPS.");return}
  $("#view").close();if($("#etude").open)$("#etude").close();FIDS.forEach(i=>$("#"+i).value="");$("#near").value=gpsStr(g);$("#radius").value="1000";$("#fType").value=viewing.type||"";$("#fTx").value=viewing.tx||"";
  $("#filters").hidden=false;shown=0;mv=null;render();window.scrollTo({top:0})};
async function copyText(t,btn){try{await navigator.clipboard.writeText(t);if(btn){const o=btn.textContent;btn.textContent="Copié";setTimeout(()=>btn.textContent=o,1500)}}catch(e){toast("Copie impossible ici : sélectionne le numéro à la main.")}}

/* ===================== fiche : saisie ===================== */
let editing=null,tx="Vente",basis="bati",basisTouched=false,photos=[],lastEdited="price",shot=null,delArmed=false,dupOk=false;
const TXT=["type","nature","status","date","city","district","address","gps","floor","rooms","state","standing","source","contactName","contactTel","link","code","dossier","notes"];
const NUMS=["sMain","sMezz","sCave","sTerr","sLand","price","avance","loyer","age"];
function setTx(v){tx=v;$$("#txSeg button").forEach(b=>b.classList.toggle("on",b.dataset.v===v));
  $("#priceLbl").textContent=v==="Location"?"Loyer mensuel":v==="Pas-de-porte"?"Montant du pas-de-porte":"Prix demandé";
  $("#ppmLbl").textContent=v==="Location"?"Loyer au m² / mois":"Prix au m²";
  $("#avanceL").hidden=v!=="Location";$("#loyerL").hidden=v==="Location";
  $("#loyerLbl").textContent=v==="Vente"?"Loyer actuel si occupé":"Loyer mensuel";
  updCalc()}
function setBasis(v){basis=v;$$("#basisSeg button").forEach(b=>b.classList.toggle("on",b.dataset.v===v));updCalc(true)}
$("#txSeg").addEventListener("click",e=>{const b=e.target.closest("button");if(b)setTx(b.dataset.v)});
$("#basisSeg").addEventListener("click",e=>{const b=e.target.closest("button");if(b){basisTouched=true;setBasis(b.dataset.v)}});
$("#f_type").onchange=()=>{if(!basisTouched)setBasis(basisDefault($("#f_type").value))};
function fv(k){return numIn($("#f_"+k).value)}
function pondere(){const m=fv("sMain"),z=fv("sMezz"),c=fv("sCave"),t=fv("sTerr");if(m==null&&z==null&&c==null&&t==null)return null;return Math.round(((m||0)+S.cm*(z||0)+S.cc*(c||0)+S.ct*(t||0))*100)/100}
function retained(){const p=pondere(),l=fv("sLand");return basis==="terrain"?(l??p):(p??l)}
function updCalc(fromSurface){
  const p=pondere(),l=fv("sLand"),r=retained();
  const parts=[];
  if(p!=null){const det=[fv("sMain")?plain(fv("sMain")):"",fv("sMezz")?plain(fv("sMezz"))+" × "+plain(S.cm):"",fv("sCave")?plain(fv("sCave"))+" × "+plain(S.cc):"",fv("sTerr")?plain(fv("sTerr"))+" × "+plain(S.ct):""].filter(Boolean).join(" + ");parts.push("Bâti pondéré : "+fmtS(p)+" m² ("+det+")")}
  if(l!=null)parts.push("Terrain : "+fmtS(l)+" m²");
  $("#surfCalc").replaceChildren(parts.length?h("span",null,parts.join(" · "),h("br"),h("b",{text:"Surface retenue pour le prix au m² : "+(r!=null?fmtS(r)+" m²":"—")})):"Renseigne au moins une surface.");
  if(fromSurface){if(lastEdited==="ppm"&&fv("ppm")!=null&&r)$("#f_price").value=plain(Math.round(fv("ppm")*r));else if(fv("price")!=null&&r)$("#f_ppm").value=plain(Math.round(fv("price")/r))}
  const pr=fv("price");
  $("#priceCalc").textContent=pr!=null?(fmt(pr)+priceSuf(tx)+(r?" · "+fmt(pr/r)+" "+unitSuf(tx):"")+(tx==="Location"&&fv("avance")?" · avance "+fmt(fv("avance"))+" DH":"")+(tx!=="Location"&&fv("loyer")?" · loyer "+fmt(fv("loyer"))+" DH/mois":"")):"Indique le prix total ou le prix au m².";
  const g=coordsFrom($("#f_gps").value);const a=$("#gpsCheck");a.hidden=!g;if(g)a.href=satUrl(g);
}
["sMain","sMezz","sCave","sTerr","sLand"].forEach(k=>$("#f_"+k).addEventListener("input",()=>updCalc(true)));
$("#f_price").addEventListener("input",()=>{lastEdited="price";const r=retained(),p=fv("price");$("#f_ppm").value=p!=null&&r?plain(Math.round(p/r)):"";updCalc()});
$("#f_ppm").addEventListener("input",()=>{lastEdited="ppm";const r=retained(),u=fv("ppm");if(u!=null&&r)$("#f_price").value=plain(Math.round(u*r));updCalc()});
["avance","loyer"].forEach(k=>$("#f_"+k).addEventListener("input",()=>updCalc()));
$("#f_gps").addEventListener("input",()=>{const g=coordsFrom($("#f_gps").value);if(g&&!$("#f_city").value.trim()){const c=guessCity(g);if(c)$("#f_city").value=c}updCalc()});
NUMS.concat(["ppm"]).forEach(k=>$("#f_"+k).addEventListener("blur",e=>{const n=numIn(e.target.value);if(n!=null)e.target.value=plain(n)}));

function openForm(c,preset){
  editing=c||null;delArmed=false;dupOk=false;$("#dupBox").hidden=true;$("#delBtn").classList.remove("arm");$("#delBtn").textContent="Supprimer";$("#saveBtn").textContent="Enregistrer";
  $("#dlgTitle").textContent=c?"Modifier le comparable":"Nouveau comparable";
  TXT.forEach(k=>{const e=$("#f_"+k);if(e.tagName==="SELECT")ensureOpt(e,c?.[k]);e.value=c?.[k]??""});
  NUMS.forEach(k=>$("#f_"+k).value=c?.[k]!=null?plain(c[k]):"");
  if(c&&[c.sMain,c.sMezz,c.sCave,c.sTerr,c.sLand].every(v=>v==null)&&c.surface){if(basisOf(c)==="terrain")$("#f_sLand").value=plain(c.surface);else $("#f_sMain").value=plain(c.surface)}
  if(!c){$("#f_date").value=new Date().toISOString().slice(0,10);$("#f_type").value="Appartement";$("#f_nature").value="Offre";$("#f_status").value="À vérifier"}
  if(!$("#f_type").value)$("#f_type").value="Autre";
  basisTouched=!!c?.basis;basis=c?basisOf(c):basisDefault($("#f_type").value);$$("#basisSeg button").forEach(b=>b.classList.toggle("on",b.dataset.v===basis));
  photos=c?.photos?[...c.photos]:[];renderThumbs();
  lastEdited="price";setTx(c?.tx||"Vente");
  const r=retained();$("#f_ppm").value=c?.price&&r?plain(Math.round(c.price/r)):"";updCalc();
  $("#qText").value=preset||"";$("#qStatus").textContent="";clearShot();
  $("#delBtn").hidden=!c||!canDelete();$("#photoBtn").disabled=$("#camBtn").disabled=!online;
  $("#dlg").showModal();$("#dlg").scrollTop=0;
  if(!c)setTimeout(()=>$("#qText").focus(),50);
}
$("#addBtn").onclick=()=>openForm();$("#pasteBtn").onclick=()=>openForm();
$$("[data-close]").forEach(b=>b.onclick=()=>b.closest("dialog").close());
$("#form").addEventListener("submit",e=>e.preventDefault());

function readForm(){
  const o={id:editing?.id||("c"+Date.now().toString(36)+Math.random().toString(36).slice(2,6)),tx,basis,photos,createdAt:editing?.createdAt||Date.now(),updatedAt:Date.now()};
  TXT.forEach(k=>o[k]=$("#f_"+k).value.trim());
  NUMS.forEach(k=>o[k]=fv(k));
  const g=coordsFrom(o.gps);if(g)o.gps=gpsStr(g);
  o.price=o.price!=null?Math.round(o.price):null;
  o.surface=retained();
  if(o.tx==="Location")o.loyer=null;else o.avance=null;
  return o;
}
function findDupes(o){const g=gpsOf(o);if(!g)return [];return items.filter(x=>{if(x.id===o.id||x.tx!==o.tx)return false;const k=gpsOf(x);if(!k||distM(g,k)>40)return false;
  return (o.price&&x.price&&Math.abs(x.price-o.price)/o.price<.03)||(o.surface&&x.surface&&Math.abs(x.surface-o.surface)/o.surface<.05)})}
$("#saveBtn").onclick=async()=>{
  const o=readForm();
  if(!o.price&&!o.surface){toast("Indique au moins une surface ou un prix.");return}
  if(!editing&&!dupOk){const d=findDupes(o);if(d.length){const x=d[0];
    $("#dupBox").replaceChildren("Ressemble à une fiche existante : ",h("b",{text:(x.type||"")+" "+fmtS(x.surface)+" m² · "+fmt(x.price)+priceSuf(x.tx)}),(x.date?" du "+new Date(x.date).toLocaleDateString("fr-FR"):"")+". Appuie sur « Enregistrer quand même » si c’est un autre bien.");
    $("#dupBox").hidden=false;$("#saveBtn").textContent="Enregistrer quand même";dupOk=true;return}}
  $("#saveBtn").disabled=true;
  try{const st=await saveItem(o);$("#dlg").close();toast(st==="queued"?"Enregistré sur l’appareil : envoi au retour du réseau.":"Témoin enregistré")}
  catch(e){toast(errMsg(e))}
  $("#saveBtn").disabled=false;$("#saveBtn").textContent="Enregistrer";
};
$("#delBtn").onclick=async()=>{
  if(!editing)return;
  if(!delArmed){delArmed=true;$("#delBtn").classList.add("arm");$("#delBtn").textContent="Confirmer la suppression";clearTimeout($("#delBtn")._t);$("#delBtn")._t=setTimeout(()=>{delArmed=false;$("#delBtn").classList.remove("arm");$("#delBtn").textContent="Supprimer"},5000);return}
  try{await deleteItem(editing.id);$("#dlg").close();toast("Témoin supprimé")}catch(e){toast(errMsg(e,"Échec de la suppression."))}
};

/* photos */
function renderThumbs(){
  const T=$("#thumbs");T.innerHTML="";
  photos.forEach((p,i)=>T.append(h("div",{class:"th"},h("img",{src:photoUrl(p,1),"data-pid":p.t||p.id,alt:""}),
    h("button",{type:"button",class:"star"+(i===0?" on":""),title:i===0?"Photo principale":"Choisir comme photo principale",text:"★",onclick:()=>{photos.unshift(photos.splice(i,1)[0]);renderThumbs()}}),
    h("button",{type:"button",class:"x",title:"Retirer",text:"×",onclick:()=>{photos.splice(i,1);renderThumbs()}}))));
}
$("#photoBtn").onclick=()=>$("#photoInput").click();
function shrink(file,max=1600){return new Promise((res,rej)=>{const img=new Image();img.onload=()=>{const s=Math.min(1,max/Math.max(img.width,img.height));
  const cv=document.createElement("canvas");cv.width=Math.round(img.width*s);cv.height=Math.round(img.height*s);cv.getContext("2d").drawImage(img,0,0,cv.width,cv.height);
  cv.toBlob(b=>b?res(b):rej(),"image/jpeg",.82);URL.revokeObjectURL(img.src)};img.onerror=rej;img.src=URL.createObjectURL(file)})}
/* ===================== lecture automatique d’une note ===================== */
const NUMRE="(\\d[\\d\\s.,]*\\d|\\d)";
const UNITRE="(mdh|m\\s*dh|millions?\\s*(?:de\\s*)?(?:dh|dirhams?)|m[ei]l+[iy]?ons?|mlyon|mlion|millions?|مليون|dhs?|dirhams?|mad)?";
function amt(n,u){let v=toNum(n);if(!isFinite(v))return null;u=(u||"").trim();
  if(/^(mdh|m\s*dh|millions?\s*(de\s*)?(dh|dirham))/.test(u))return {v:v*1e6};
  if(/^(m[ei]l+[iy]?on|mlyon|mlion|مليون)/.test(u))return {v:v*1e4,note:"« "+n.trim()+" "+u+" » lu en millions de centimes."};
  if(/^millions?/.test(u)){if(v<20&&!Number.isInteger(v))return {v:v*1e6,note:"« "+n.trim()+" "+u+" » lu en millions de DH (à vérifier).",flag:1};return {v:v*1e4,note:"« "+n.trim()+" "+u+" » lu en millions de centimes."}}
  return {v,dh:/^(dh|dirham|mad)/.test(u)}}
function smartParse(raw){
  const src=String(raw||"");const out={notes:[]};
  const g=coordsFrom(src);if(g)out.gps=gpsStr(g);
  const tels=[...new Set((src.match(/(?:\+212\s?|\b0)[5-8](?:[\s.-]?\d){8}\b/g)||[]).map(x=>x.replace(/[\s.-]/g,"").replace(/^\+212/,"0")))];
  if(tels.length)out.contactTel=tels.map(t=>t.replace(/(\d{4})(\d{2})(\d{2})(\d{2})/,"$1 $2 $3 $4")).join(" / ");
  const link=(src.match(/https?:\/\/\S+/)||[""])[0];if(link)out.link=link;
  let t=" "+src.toLowerCase().replace(/https?:\/\/\S+/g," ").replace(/[’`]/g,"'")+" ";
  t=t.replace(/(\d+°\d+'[\d.]+"[ns])\s*(\d+°\d+'[\d.]+"[ew])/g," ").replace(/-?\d{1,2}[.,]\d{4,}\s*[, ]\s*-?\d{1,2}[.,]\d{4,}/g," ").replace(/(?:\+212\s?|\b0)[5-8](?:[\s.-]?\d){8}\b/g," ").replace(/\s+/g," ");
  const T=[[/\bvilla|demi[- ]villa/,"Villa"],[/\bimmeuble\b/,"Immeuble"],[/\bplateau/,"Plateau de bureaux"],[/\bbureaux?\b/,"Bureau"],[/\bstudio|\bappart|\bapp\b|\bapprt|\bduplex|شقة/,"Appartement"],[/\blocal\b|\blocaux\b|\bmagasin|\bcommerce\b|\bboutique|\bmahal\b|محل/,"Local commercial"],[/\bd[ée]p[ôo]t|\bhangar|\bentrep[ôo]t/,"Entrepôt / dépôt"],[/\busine\b/,"Usine"],[/\bmaison\b|\bdar\b|دار /,"Maison"],[/\briad\b/,"Riad"],[/\bterrain|\blot\b|\bparcelle|\bferme\b|\bhectare|أرض|بقعة/,"Terrain"]];
  out.type=(T.find(([r])=>r.test(t))||[])[1]||null;
  const sar=/\b(sarout|sarrout|sarot|saroute|pas[- ]de[- ]porte|hlaou?ane|hlawan|droit au bail|fonds? de commerce)\b|ساروت/.test(t);
  const rent=/(à|a)\s*lou(er|é|e)\b|\blou(er|é)\b|\blocation\b|par\s*mois|\/\s*mois|\bmensuel|\bkra\b|\bkira\b|lkra|للكراء|كراء/.test(t);
  const sale=/vendre|\bvente\b|\bvendu\b|\bbi3\b|lbi3|للبيع/.test(t);
  out.tx=sar?"Pas-de-porte":(rent&&!sale?"Location":"Vente");
  const lab=w=>{w=(w||"").replace(/[^a-zàâçéèêëîïôûùüÿœ-]/g,"");if(/^(mzz|mezz|mezan|mz$)/.test(w))return "sMezz";if(/^(cave|sous|ss$|soussol)/.test(w))return "sCave";if(/^(terrass|terass|trs$)/.test(w))return "sTerr";if(/^(terrain|tn$|tf$|lot$|parcelle|ha$)/.test(w))return "sLand";if(/^(rdc|habitable|construit|bâti|bati|couvert|plancher|utile|sh$|sc$|sca$)/.test(w))return "sMain";return null};
  const toks=[];const re=/(\d+(?:[.,]\d+)?)\s*(m²|m2|mètres?\s*carr[ée]s?|metres?|mtr|m)(?![a-zà-ÿ0-9²])/g;let m;const used=new Set();
  while((m=re.exec(t))){
    const pre=t.slice(0,m.index).replace(/\s+$/,""),bPos=pre.lastIndexOf(" ")+1,bWord=pre.slice(bPos);
    const rest=t.slice(m.index+m[0].length),lead=rest.length-rest.replace(/^\s+/,"").length,aPos=m.index+m[0].length+lead,aWord=rest.trim().split(" ")[0];
    toks.push({v:toNum(m[1]),bPos,bL:lab(bWord),aPos,aL:lab(aWord),k:null})}
  toks.forEach((x,i)=>{const nx=toks[i+1];
    if(x.bL&&!used.has(x.bPos)){x.k=x.bL;used.add(x.bPos)}
    else if(x.aL&&!(nx&&nx.bPos===x.aPos&&!nx.aL)){x.k=x.aL;used.add(x.aPos)}});
  const hm=t.match(/(\d+(?:[.,]\d+)?)\s*(ha|hectares?)\b/);if(hm)out.sLand=toNum(hm[1])*10000;
  const landish=LAND_TYPES.includes(out.type);
  toks.forEach(x=>{if(!(x.v>0))return;const k=x.k||(landish?(out.sLand==null?"sLand":(out.sMain==null?"sMain":null)):(out.sMain==null?"sMain":null));if(k&&out[k]==null)out[k]=x.v});
  const cm=t.match(/(?:construit|b[âa]ti|couvert)\s*:?\s*(\d+(?:[.,]\d+)?)/);if(cm&&out.sMain==null)out.sMain=toNum(cm[1]);
  const tm=t.match(/(?:terrain|superficie terrain)\s*:?\s*(\d+(?:[.,]\d+)?)/);if(tm&&out.sLand==null)out.sLand=toNum(tm[1]);
  const sm=t.match(/(?:superficie|surface|sup)\s*:?\s*(\d+(?:[.,]\d+)?)/);if(sm&&out.sMain==null&&out.sLand==null){if(landish)out.sLand=toNum(sm[1]);else out.sMain=toNum(sm[1])}
  const per=t.match(new RegExp(NUMRE+"\\s*(?:dhs?|dirhams?)?\\s*(?:\\/\\s*m(?:²|2)?|le\\s*m(?:²|2|ètre|etre)?|par\\s*m(?:²|2|ètre|etre)?)(?![a-z])"));
  if(per)out.ppm=toNum(per[1]);
  const sarm=t.match(new RegExp("(?:sarout|sarrout|sarot|saroute|pas[- ]de[- ]porte|hlaou?ane|hlawan|droit au bail|ساروت)\\s*(?:prix|de|:)?\\s*:?\\s*"+NUMRE+"\\s*"+UNITRE));
  let sarV=null;if(sarm){const a=amt(sarm[1],sarm[2]);if(a){sarV=a.v;if(a.note)out.notes.push(a.note)}}
  const mon=t.match(new RegExp(NUMRE+"\\s*(?:dhs?|dirhams?)?\\s*(?:\\/\\s*mois|par\\s*mois|mois\\b|mensuel)"));
  const monV=mon?toNum(mon[1]):null;
  const av=t.match(new RegExp(NUMRE+"\\s*(?:dhs?|dirhams?)?\\s*(?:d'|de\\s*)?(?:avance|caution|garantie)"));
  let avV=av?toNum(av[1]):null;
  if(avV==null){const a2=t.match(new RegExp("(?:avance|caution|garantie)\\s*:?\\s*(?:de\\s*)?"+NUMRE+"\\s*(?:dhs?)?(?!\\s*(?:\\/\\s*mois|par\\s*mois|mois))"));if(a2)avV=toNum(a2[1])}
  if(avV!=null&&monV!=null&&avV===monV)avV=null;
  const mill=t.match(new RegExp(NUMRE+"\\s*(mdh|m\\s*dh|millions?\\s*(?:de\\s*)?(?:dh|dirhams?)|m[ei]l+[iy]?ons?|mlyon|mlion|millions?|مليون)"));
  const prixm=t.match(new RegExp("(?:prix|pr|valeur|total|demand[ée]|ثمن)\\s*:?\\s*(?:de\\s*)?"+NUMRE+"\\s*"+UNITRE));
  if(out.tx==="Pas-de-porte"){
    if(sarV==null&&mill){const a=amt(mill[1],mill[2]);sarV=a.v;if(a.note)out.notes.push(a.note)}
    out.price=sarV;if(monV!=null)out.loyer=monV;
  }else if(out.tx==="Location"){
    out.price=monV??(prixm?toNum(prixm[1]):null);if(avV!=null)out.avance=avV;
  }else{
    let v=null;
    if(mill){const a=amt(mill[1],mill[2]);v=a.v;if(a.note)out.notes.push(a.note);if(a.flag)out.flag=1}
    else if(prixm&&!(per&&prixm.index<=per.index+per[0].length&&per.index<=prixm.index+prixm[0].length)){const a=amt(prixm[1],prixm[2]);if(a&&a.v){
      if(a.v<50000&&!/^m/.test(prixm[2]||"")){out.ppm=out.ppm??a.v;out.notes.push("Montant "+fmt(a.v)+" trop bas pour un prix total : lu comme prix au m² (à vérifier).")}
      else v=a.v}}
    else{const big=[...t.matchAll(new RegExp(NUMRE+"\\s*(dhs?|dirhams?|mad)\\b","g"))].map(x=>toNum(x[1])).filter(x=>x>=50000&&x!==avV);if(big.length)v=Math.max(...big)}
    out.price=v;if(monV!=null)out.loyer=monV;
  }
  const fl=t.match(/\b(rdc|rez[- ]de[- ]chauss[ée]e)\b/)?"RDC":(t.match(/\b(\d{1,2})\s*(?:er|ère|eme|ème|e|è)\s*(?:étage|etage|et\b)/)?.[1]);
  if(fl)out.floor=fl==="RDC"?"RDC":fl+(fl==="1"?"er":"e")+" étage";else if(/sous[- ]sol/.test(t)&&!out.sCave)out.floor="Sous-sol";
  const ch=t.match(/(\d)\s*(?:ch\b|chambres?|chbr)/),sa=t.match(/(\d)?\s*salons?\b/),sdb=t.match(/(\d)\s*(?:sdb|salles? de bains?)/);
  const rooms=[ch?ch[1]+" ch":"",sa?(sa[1]||"1")+" salon":"",sdb?sdb[1]+" sdb":""].filter(Boolean).join(" + ");if(rooms)out.rooms=rooms;
  if(/\bneuf\b|jamais habit/.test(t))out.state="Neuf";else if(/[àa] r[ée]nover|v[ée]tuste/.test(t))out.state="À rénover";
  if(/haut standing/.test(t))out.standing="Haut standing";else if(/moyen standing/.test(t))out.standing="Moyen standing";else if(/[ée]conomique/.test(t))out.standing="Économique";
  if(out.gps){const c=guessCity(coordsFrom(out.gps));if(c)out.city=c}
  if(out.ppm)out.notes.unshift("Prix demandé : "+fmt(out.ppm)+" DH/m².");
  if(/vendu/.test(t))out.notes.push("Signalé vendu.");
  return out;
}
function applyParsed(p,src,label){
  const filled=[];
  const setV=(k,v,name)=>{if(v==null||v==="")return;const e=$("#f_"+k);if(!e)return;if(e.tagName==="SELECT")ensureOpt(e,v);e.value=typeof v==="number"?plain(v):v;filled.push(name)};
  if(p.tx&&TXS.includes(p.tx)){setTx(p.tx);filled.push("opération")}
  if(p.type&&TYPES.includes(p.type)){$("#f_type").value=p.type;filled.push("type");if(!basisTouched){basis=basisDefault(p.type);$$("#basisSeg button").forEach(b=>b.classList.toggle("on",b.dataset.v===basis))}}
  setV("sMain",p.sMain,"surface");setV("sMezz",p.sMezz,"mezzanine");setV("sCave",p.sCave,"cave");setV("sTerr",p.sTerr,"terrasse");setV("sLand",p.sLand,"terrain");
  if(p.price!=null){setV("price",Math.round(p.price),"prix");lastEdited="price";const r=retained();$("#f_ppm").value=r?plain(Math.round(p.price/r)):""}
  else if(p.ppm!=null){$("#f_ppm").value=plain(p.ppm);lastEdited="ppm";const r=retained();if(r)$("#f_price").value=plain(Math.round(p.ppm*r));filled.push("prix au m²")}
  setV("avance",p.avance,"avance");setV("loyer",p.loyer,"loyer");
  setV("contactTel",p.contactTel,"téléphone");setV("gps",p.gps,"GPS");
  if(!$("#f_city").value.trim())setV("city",p.city,"ville");
  setV("district",p.district,"quartier");setV("address",p.address,"adresse");setV("floor",p.floor,"étage");setV("rooms",p.rooms,"pièces");
  if(p.state&&STATES.includes(p.state))setV("state",p.state,"état");if(p.standing&&STANDINGS.includes(p.standing))setV("standing",p.standing,"standing");
  setV("link",p.link,"lien");setV("contactName",p.contactName,"contact");
  if(src){const cur=$("#f_notes").value.trim();const add=[...(p.notes||[]),"Note d’origine : "+src.replace(/\s*\n\s*/g," ; ")].join(" ");if(!cur.includes(src.slice(0,40)))$("#f_notes").value=(cur?cur+"\n":"")+add}
  updCalc();
  $("#qStatus").textContent=filled.length?label+" : "+[...new Set(filled)].join(", ")+". Vérifie la fiche avant d’enregistrer."+(p.flag?" Attention : un montant est à vérifier.":""):"Rien n’a été reconnu dans ce texte. Remplis la fiche à la main ou essaie l’analyse avec Claude.";
}
$("#qFill").onclick=()=>{const s=$("#qText").value.trim();if(!s){toast("Colle d’abord une note.");return}applyParsed(smartParse(s),s,"Rempli automatiquement")};
const AI_PROMPT=`Tu aides un constateur immobilier au Maroc à enregistrer un témoin de marché (comparable) à partir d'une note de terrain, d'une observation ou d'une annonce (texte et/ou capture d'écran). La note peut mélanger français, darija et arabe.
Règles :
- "mellion", "mlyon", "مليون" = millions de centimes : 56 mellion = 560 000 DH. "1,2 MDH" = 1 200 000 DH.
- "sarout", "pas-de-porte", "hlaouane", "ساروت" : opération "Pas-de-porte" ; le loyer mensuel éventuel va dans "loyer".
- "à louer", "loué", "par mois", "كراء" : opération "Location" ; "price" = loyer mensuel ; l'avance ou la caution va dans "avance".
- Sépare les surfaces : sMain = principale (RDC, habitable, construite), sMezz = mezzanine, sCave = cave ou sous-sol, sTerr = terrasse, sLand = terrain. Hectares convertis en m².
- Si seul un prix au m² est donné, mets-le dans "ppm" et laisse "price" à null.
- Ne devine rien : null ou "" quand l'information est absente.
Réponds uniquement avec un objet JSON de cette forme :
{"tx":"Vente|Location|Pas-de-porte","type":"${TYPES.join("|")}","sMain":null,"sMezz":null,"sCave":null,"sTerr":null,"sLand":null,"price":null,"ppm":null,"avance":null,"loyer":null,"contactName":"","contactTel":"","gps":"lat, lng ou vide","city":"","district":"","address":"","floor":"","rooms":"","state":"${STATES.join("|")} ou vide","standing":"${STANDINGS.join("|")} ou vide","link":"","notes":["remarques utiles en français : titre, négociation, occupation, équipements…"]}`;
$("#qAI").onclick=async()=>{
  const s=$("#qText").value.trim();if(!s&&!shot){toast("Colle une note ou joins une capture.");return}
  if(!sampleCap){toast("L’analyse avec Claude n’est pas disponible ici.");return}
  const b=$("#qAI");b.disabled=true;$("#qStatus").textContent="Claude lit la note…";
  try{const opts={modelTier:shot?"default":"quick"};if(shot)opts.images=[shot];
    const r=await sampleCap.json(AI_PROMPT+"\n\nTexte :\n"+(s||"(voir la capture jointe)"),opts);
    if(!r||typeof r!=="object")throw {code:"invalid_json"};
    const num=v=>{const n=typeof v==="number"?v:numIn(v);return n!=null&&n>0?n:null};
    const gg=coordsFrom(String(r.gps||""));
    const p={tx:r.tx,type:r.type,sMain:num(r.sMain),sMezz:num(r.sMezz),sCave:num(r.sCave),sTerr:num(r.sTerr),sLand:num(r.sLand),price:num(r.price),ppm:num(r.ppm),avance:num(r.avance),loyer:num(r.loyer),
      contactName:String(r.contactName||""),contactTel:String(r.contactTel||""),gps:gg?gpsStr(gg):"",city:String(r.city||"")||(gg?guessCity(gg):""),district:String(r.district||""),address:String(r.address||""),
      floor:String(r.floor||""),rooms:String(r.rooms||""),state:String(r.state||""),standing:String(r.standing||""),link:String(r.link||""),notes:Array.isArray(r.notes)?r.notes.map(String):(r.notes?[String(r.notes)]:[])};
    if(p.ppm)p.notes.unshift("Prix demandé : "+fmt(p.ppm)+" DH/m².");
    applyParsed(p,s||"(capture d’annonce)","Rempli par Claude");
  }catch(e){const c=e?.code;$("#qStatus").textContent=c==="not_granted"?"Analyse refusée : utilise « Remplir la fiche ».":c==="rate_limited"?"Trop de demandes : réessaie dans un moment.":c==="invalid_json"?"Réponse illisible : réessaie ou remplis à la main.":c==="images_unavailable"||c==="image_rejected"?"Cette capture n’a pas pu être lue.":"Analyse impossible pour le moment : utilise « Remplir la fiche »."}
  b.disabled=false;
};
function clearShot(){shot=null;$("#shotRow").hidden=true;$("#shotImg").removeAttribute("src")}
async function setShot(file){if(!sampleImg){toast("Les captures ne peuvent pas être analysées ici.");return}try{shot=await shrink(file,1800);$("#shotImg").src=URL.createObjectURL(shot);$("#shotRow").hidden=false;$("#qStatus").textContent="Capture jointe : appuie sur « Analyser avec Claude »."}catch(e){toast("Image illisible.")}}
$("#qShot").onclick=()=>$("#shotInput").click();
$("#shotInput").onchange=e=>{const f=e.target.files[0];e.target.value="";if(f)setShot(f)};
$("#shotDel").onclick=clearShot;
$("#qText").addEventListener("paste",e=>{const f=[...(e.clipboardData?.files||[])].find(x=>x.type.startsWith("image/"));if(f){e.preventDefault();setShot(f)}});

/* ===================== étude de marché ===================== */
function isOffer(c){return !c.nature||c.nature==="Offre"||c.nature==="Estimation agence"}
function homog(c){const u=ppmOf(c);if(u==null)return null;const nego=(etude.nego??S.nego)||0;const adj=+(etude.adj[c.id]||0);return u*(isOffer(c)?1-nego/100:1)*(1+adj/100)}
function openEtude(){
  ["dossier","address","gps"].forEach(k=>$("#e_"+k).value=etude[k]||"");
  $("#e_type").value=etude.type||"";$("#e_tx").value=etude.tx||"Vente";$("#e_surface").value=etude.surface!=null?plain(etude.surface):"";
  $("#e_nego").value=plain(etude.nego??S.nego);$("#e_retenu").value=etude.retenu!=null?plain(etude.retenu):"";
  renderEtude();if(!$("#etude").open)$("#etude").showModal();
}
function readEtude(){
  etude.dossier=$("#e_dossier").value.trim();etude.type=$("#e_type").value;etude.tx=$("#e_tx").value;etude.surface=numIn($("#e_surface").value);
  etude.address=$("#e_address").value.trim();const g=coordsFrom($("#e_gps").value);etude.gps=g?gpsStr(g):$("#e_gps").value.trim();
  etude.nego=numIn($("#e_nego").value);etude.retenu=numIn($("#e_retenu").value);saveEtudeDraft();
}
function etudeResult(){
  const cs=items.filter(c=>sel.has(c.id)),subj=coordsFrom(etude.gps);
  const rows=cs.map(c=>{const g=gpsOf(c);return {c,d:subj&&g?distM(subj,g):null,u:ppmOf(c),hu:homog(c),on:c.tx===etude.tx}}).sort((a,b)=>(a.d??1e12)-(b.d??1e12));
  const st=stats(rows.filter(r=>r.on).map(r=>r.hu));
  const ret=etude.retenu??(st?Math.round(st.med):null);
  const val=ret&&etude.surface?Math.round(ret*etude.surface/1000)*1000:null;
  return {rows,st,ret,val};
}
function renderEtude(){
  {const g=coordsFrom(etude.gps),a=$("#eSat");a.hidden=!g;if(g)a.href=satUrl(g)}
  const {rows,st,ret,val}=etudeResult();const tx=etude.tx;
  const T=$("#eTbl");T.innerHTML="";
  T.append(h("thead",null,h("tr",null,...["Comparable","Distance","Surface","Prix","Prix/m²","Nature","Négo.","Ajustement %","Homogénéisé",""].map((l,i)=>h("th",{class:(i>=1&&i<=4)||i===8?"r":"","data-k":""},l)))));
  const tb=h("tbody");
  if(!rows.length)tb.append(h("tr",null,h("td",{colspan:10,style:"white-space:normal;color:var(--muted);padding:18px",text:"Aucun comparable sélectionné. Coche « Étude » sur les fiches (cartes ou tableau), ou utilise « Chercher des comparables autour du bien »."})));
  rows.forEach(({c,d,u,hu,on})=>{
    const inp=h("input",{class:"adj",inputmode:"decimal",value:etude.adj[c.id]!=null?String(etude.adj[c.id]):"","aria-label":"Ajustement en %",placeholder:"0"});
    inp.onclick=e=>e.stopPropagation();
    inp.onchange=()=>{const v=numIn(inp.value);if(v==null)delete etude.adj[c.id];else etude.adj[c.id]=v;saveEtudeDraft();renderEtude()};
    const rm=h("button",{class:"btn sm ghost",type:"button",title:"Retirer de l’étude",text:"✕",onclick:e=>{e.stopPropagation();toggleSel(c.id)}});
    tb.append(h("tr",{class:on?"":"off",onclick:()=>openView(c)},
      h("td",{class:"wrap"},h("b",{text:c.type||"—"}),h("br"),h("span",{class:"meta",text:([c.district,c.city].filter(Boolean).join(", ")||c.address||"—")+(on?"":" · "+c.tx+" (hors calcul)")})),
      h("td",{class:"num r",text:d!=null?(d>=1000?(d/1000).toFixed(2).replace(".",",")+" km":Math.round(d)+" m"):"—"}),
      h("td",{class:"num r",text:fmtS(c.surface)}),h("td",{class:"num r",text:fmt(c.price)}),h("td",{class:"num r",text:fmt(u)}),
      h("td",{text:c.nature||"Offre"}),h("td",{class:"num",text:isOffer(c)?"−"+plain((etude.nego??S.nego)||0)+" %":"—"}),
      h("td",null,inp),h("td",{class:"num r"},h("b",{text:fmt(hu)})),h("td",null,rm)));
  });
  T.append(tb);
  $("#eHint").textContent="Négo. : abattement appliqué aux offres (pas aux transactions ni aux expertises). Ajustement : écart de localisation, d’état, d’étage ou de surface par rapport au bien évalué, en + ou en −.";
  const E=$("#eStats");E.innerHTML="";const us=unitSuf(tx);
  const k=(l,v,s,hl)=>E.append(h("div",{class:"kpi"+(hl?" hl":"")},h("div",{class:"k",text:l}),h("div",{class:"v"},v,h("small",{text:" "+us})),s?h("div",{class:"s",text:s}):null));
  if(st){k("Médiane",fmt(st.med),st.n+" comparables",true);k("Moyenne",fmt(st.mean),"écart-type "+fmt(st.sd));k("Minimum",fmt(st.min));k("Maximum",fmt(st.max));
    E.append(h("div",{class:"kpi"},h("div",{class:"k",text:"Dispersion"}),h("div",{class:"v",text:Math.round(st.cv*100)+" %"}),h("div",{class:"s",text:st.cv>.25?"forte : revois la sélection":st.cv>.15?"moyenne":"faible : sélection homogène"})))}
  else E.append(h("p",{class:"note",text:"Les statistiques s’affichent dès qu’un comparable de même opération ("+tx+") avec prix et surface est sélectionné."}));
  $("#eRetLbl").textContent=tx==="Location"?"Loyer unitaire retenu":"Valeur unitaire retenue";
  $("#e_retenu").placeholder=st?"médiane : "+fmt(st.med):"médiane par défaut";
  const V=$("#eValue");V.innerHTML="";
  V.append(h("div",{class:"kpi hl"},h("div",{class:"k",text:tx==="Location"?"Valeur locative estimée":tx==="Pas-de-porte"?"Pas-de-porte estimé":"Valeur vénale estimée"}),
    h("div",{class:"v"},val?fmt(val):"—",h("small",{text:tx==="Location"?" DH / mois":" DH"})),
    h("div",{class:"s",text:val?fmt(ret)+" "+us+" × "+fmtS(etude.surface)+" m² (arrondi au millier)":"Indique la surface du bien évalué."})));
}
["e_dossier","e_type","e_tx","e_surface","e_address","e_gps","e_nego","e_retenu"].forEach(i=>$("#"+i).addEventListener("input",()=>{readEtude();renderEtude();renderTray()}));
$("#eSearch").onclick=()=>{readEtude();const g=coordsFrom(etude.gps);if(!g){toast("Indique d’abord la position GPS du bien évalué.");return}
  $("#etude").close();FIDS.forEach(i=>$("#"+i).value="");$("#near").value=gpsStr(g);$("#radius").value="1000";$("#fType").value=etude.type||"";$("#fTx").value=etude.tx||"";
  $("#filters").hidden=false;if(view==="list"){view="table";LS.set("mc_view",view)}shown=0;mv=null;render();window.scrollTo({top:0});toast("Coche les comparables à retenir, puis rouvre « Étude de marché ».")};
let eNewArmed=false;
$("#eNew").onclick=()=>{if(!eNewArmed&&sel.size){eNewArmed=true;$("#eNew").textContent="Vider la sélection et recommencer ?";setTimeout(()=>{eNewArmed=false;$("#eNew").textContent="Nouvelle étude"},5000);return}
  eNewArmed=false;$("#eNew").textContent="Nouvelle étude";etude=newEtude();sel.clear();saveSel();saveEtudeDraft();openEtude();render()};
$("#eSave").onclick=async()=>{readEtude();const {rows,st,ret,val}=etudeResult();
  const doc={...etude,comps:rows.map(r=>r.c.id),stats:st,valeurUnitaire:ret,valeur:val,updatedAt:Date.now()};
  try{if(!online)throw {code:"offline"};await store.saveEtude(doc);etudes=etudes.filter(x=>x.id!==doc.id);etudes.push(doc);saveCache();toast("Étude enregistrée")}
  catch(e){toast(errMsg(e,"Échec de l’enregistrement de l’étude."))}};
$("#eCsv").onclick=async()=>{readEtude();const {rows,st,ret,val}=etudeResult();
  const head=["Code","Type","Opération","Quartier / ville","Adresse","GPS","Distance (m)","Surface (m²)","Prix (DH)","Prix/m²","Nature","Ajustement %","Prix/m² homogénéisé","Retenu","Date","Canal","Téléphone"];
  const e=v=>{v=v==null?"":String(v);return /[";\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
  const body=rows.map(({c,d,u,hu,on})=>[c.ref||c.code||"",c.type,c.tx,[c.district,c.city].filter(Boolean).join(", "),c.address,c.gps,d!=null?Math.round(d):"",c.surface,c.price,u?Math.round(u):"",c.nature||"Offre",etude.adj[c.id]||0,hu?Math.round(hu):"",on?"oui":"non",c.date,c.source,c.contactTel].map(e).join(";"));
  const lines=[["Étude de marché",etude.dossier].map(e).join(";"),["Bien évalué",etude.type,etude.tx,etude.address,etude.gps,etude.surface?etude.surface+" m²":""].map(e).join(";"),"",head.join(";"),...body,"",
    ["Médiane",st?Math.round(st.med):""].join(";"),["Moyenne",st?Math.round(st.mean):""].join(";"),["Minimum",st?Math.round(st.min):""].join(";"),["Maximum",st?Math.round(st.max):""].join(";"),["Abattement négociation %",(etude.nego??S.nego)].join(";"),["Valeur unitaire retenue",ret??""].join(";"),["Valeur estimée (DH)",val??""].join(";")];
  await saveFile("etude_"+(etude.dossier||"marche").replace(/[^\w-]+/g,"-")+".csv","﻿"+lines.join("\r\n"))};
$("#eHtml").onclick=async()=>{readEtude();const {rows,st,ret,val}=etudeResult();const us=unitSuf(etude.tx);
  const tr=rows.map(({c,d,u,hu,on},i)=>`<tr${on?"":' class="off"'}><td>${i+1}</td><td>${esc(c.type)}<br><small>${esc([c.district,c.city].filter(Boolean).join(", ")||c.address||"")}</small></td><td>${d!=null?Math.round(d)+" m":"—"}</td><td class="r">${esc(fmtS(c.surface))}</td><td class="r">${esc(fmt(c.price))}</td><td class="r">${esc(fmt(u))}</td><td>${esc(c.nature||"Offre")}</td><td class="r">${esc(String(etude.adj[c.id]||0))} %</td><td class="r"><b>${esc(fmt(hu))}</b></td><td>${esc(c.date?new Date(c.date).toLocaleDateString("fr-FR"):"")}</td><td>${esc(c.ref||c.code||"")}</td></tr>`).join("");
  const html=`<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Étude de marché ${esc(etude.dossier)}</title><style>body{font:13px/1.45 Arial,Helvetica,sans-serif;color:#13242a;max-width:1000px;margin:28px auto;padding:0 18px}h1{font-size:20px;margin:0 0 4px}h2{font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:#0d5c63;border-bottom:1px solid #cfd8da;padding-bottom:4px;margin:22px 0 8px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #cfd8da;padding:5px 7px;text-align:left;vertical-align:top}th{background:#eef3f3;font-size:11px;text-transform:uppercase}td.r,th.r{text-align:right}tr.off td{color:#999}small{color:#5a6a6f}.kv td:first-child{width:260px;color:#5a6a6f}.big{font-size:16px;font-weight:bold}@media print{body{margin:0}}</style></head><body>
<h1>Étude de marché${etude.dossier?" · dossier "+esc(etude.dossier):""}</h1><div><small>Établie le ${new Date().toLocaleDateString("fr-FR")}</small></div>
<h2>Bien évalué</h2><table class="kv"><tr><td>Type</td><td>${esc(etude.type||"—")}</td></tr><tr><td>Opération</td><td>${esc(etude.tx)}</td></tr><tr><td>Adresse</td><td>${esc(etude.address||"—")}</td></tr><tr><td>Position GPS</td><td>${esc(etude.gps||"—")}</td></tr><tr><td>Surface retenue</td><td>${etude.surface?esc(fmtS(etude.surface))+" m²":"—"}</td></tr></table>
<h2>Comparables</h2><table><thead><tr><th>#</th><th>Bien</th><th>Distance</th><th class="r">Surface m²</th><th class="r">Prix DH</th><th class="r">${us}</th><th>Nature</th><th class="r">Ajust.</th><th class="r">Homogénéisé</th><th>Date</th><th>Code</th></tr></thead><tbody>${tr}</tbody></table>
<p><small>Abattement de négociation appliqué aux offres : ${esc(plain((etude.nego??S.nego)||0))} %.</small></p>
<h2>Synthèse</h2><table class="kv"><tr><td>Nombre de comparables retenus</td><td>${st?st.n:0}</td></tr><tr><td>Médiane</td><td>${st?esc(fmt(st.med))+" "+us:"—"}</td></tr><tr><td>Moyenne</td><td>${st?esc(fmt(st.mean))+" "+us:"—"}</td></tr><tr><td>Fourchette</td><td>${st?esc(fmt(st.min))+" – "+esc(fmt(st.max))+" "+us:"—"}</td></tr><tr><td>Valeur unitaire retenue</td><td class="big">${ret?esc(fmt(ret))+" "+us:"—"}</td></tr><tr><td>${etude.tx==="Location"?"Valeur locative estimée":"Valeur estimée"}</td><td class="big">${val?esc(fmt(val))+(etude.tx==="Location"?" DH / mois":" DH"):"—"}</td></tr></table>
</body></html>`;
  await saveFile("etude_"+(etude.dossier||"marche").replace(/[^\w-]+/g,"-")+".html",html)};

$("#mEtudes").onclick=()=>{closeMenu();renderEtudes();$("#etudesDlg").showModal()};
function renderEtudes(){
  const B=$("#etudesBody");B.innerHTML="";
  const list=[...etudes].sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
  if(!list.length){B.append(h("p",{class:"note",text:"Aucune étude enregistrée. Sélectionne des comparables, ouvre « Étude de marché » puis appuie sur « Enregistrer l’étude »."}));return}
  list.forEach(x=>{let armed=false;const del=h("button",{class:"btn sm bad",type:"button",text:"Supprimer"});
    del.onclick=async()=>{if(!armed){armed=true;del.classList.add("arm");del.textContent="Confirmer";return}try{if(!online)throw {code:"offline"};await store.deleteEtude(x.id);etudes=etudes.filter(e=>e.id!==x.id);saveCache();renderEtudes()}catch(e){toast(errMsg(e,"Échec de la suppression."))}};
    B.append(h("div",{class:"kpi",style:"display:flex;gap:10px;align-items:center;flex-wrap:wrap"},
      h("div",{style:"flex:1 1 220px;min-width:0"},h("b",{text:(x.dossier?"Dossier "+x.dossier:"Étude sans n°")+" · "+[x.type,x.tx].filter(Boolean).join(" ")}),h("div",{class:"meta",text:[(x.comps||[]).length+" comparables",x.valeur?fmt(x.valeur)+" DH":"",x.updatedAt?new Date(x.updatedAt).toLocaleDateString("fr-FR"):""].filter(Boolean).join(" · ")})),
      h("button",{class:"btn sm pri",type:"button",text:"Ouvrir",onclick:()=>{etude={...newEtude(),...x,adj:x.adj||{}};sel=new Set(x.comps||[]);saveSel();saveEtudeDraft();$("#etudesDlg").close();render();openEtude()}}),del))});
}

/* ===================== réglages ===================== */
$("#mSettings").onclick=()=>{closeMenu();["cm","cc","ct","valid","nego"].forEach(k=>$("#s_"+k).value=plain(S[k]));$("#setNote").textContent="";$("#setDlg").showModal()};
$("#setSave").onclick=async()=>{const n={};for(const k of ["cm","cc","ct","valid","nego"]){const v=numIn($("#s_"+k).value);if(v==null||v<0){$("#setNote").textContent="Valeur invalide : utilise des nombres positifs.";return}n[k]=v}
  try{if(!online)throw {code:"offline"};await store.saveSettings({...S,...n});Object.assign(S,n);saveCache();$("#setDlg").close();toast("Réglages enregistrés");render()}catch(e){$("#setNote").textContent=errMsg(e)}};

/* ===================== menu ===================== */
function closeMenu(){$("#menu").hidden=true;$("#menuBtn").setAttribute("aria-expanded","false")}
$("#menuBtn").onclick=e=>{e.stopPropagation();const m=$("#menu");m.hidden=!m.hidden;$("#menuBtn").setAttribute("aria-expanded",String(!m.hidden))};
document.addEventListener("click",e=>{if(!e.target.closest(".menuwrap"))closeMenu()});
$("#mPaste").onclick=()=>{closeMenu();openForm()};

/* ===================== export ===================== */
$("#exportBtn").onclick=async()=>{closeMenu();
  const r=filtered();if(!r.length){toast("Rien à exporter.");return}
  const head=["Date","Opération","Type","Prix (DH)","Surface retenue (m²)","Prix/m²","Principale","Mezzanine","Cave","Terrasse","Terrain","Avance","Loyer","Ville","Quartier","Adresse","GPS","Étage","Pièces","État","Standing","Nature","Statut","Canal","Contact","Téléphone","Code","Dossier","Lien","Observations","Photos"];
  const e=v=>{v=v==null?"":String(v);return /[";\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
  const lines=[head.join(";")].concat(r.map(c=>[c.date,c.tx,c.type,c.price,c.surface,ppmOf(c)?Math.round(ppmOf(c)):"",c.sMain,c.sMezz,c.sCave,c.sTerr,c.sLand,c.avance,c.loyer,c.city,c.district,c.address,c.gps,c.floor,c.rooms,c.state,c.standing,c.nature,c.status,c.source,c.contactName,c.contactTel,c.code,c.dossier,c.link,c.notes,(c.photos||[]).length].map(e).join(";")));
  await saveFile("comparables_"+new Date().toISOString().slice(0,10)+".csv","﻿"+lines.join("\r\n"))};

/* ===================== import My Maps (KML) ===================== */
let pending=[];
const FOLDER_TYPE={"appartement":"Appartement","studio":"Appartement","local commercial":"Local commercial","local":"Local commercial","bureaux":"Bureau","bureau":"Bureau","terrain":"Terrain","maison":"Maison","usine":"Usine","villa":"Villa","immeuble":"Immeuble","riad":"Riad","plateau":"Plateau de bureaux"};
function field(lines,keys){for(const l of lines){const m=l.match(/^\s*\*?\s*([^:]{1,30}?)\s*\.?\s*:\s*(.*)$/);if(m&&keys.some(k=>k.test(m[1].trim())))return m[2].trim()}return ""}
function num(str){const low=(str||"").toLowerCase();
  if(/\d\s*(m\s*dh|mdh)/.test(low)){const m=low.match(/\d+([.,]\d+)?/);return m?{v:Math.round(parseFloat(m[0].replace(",","."))*1e6),flag:false}:null}
  if(/\d\s*(million|mlyon|melyon)/.test(low)){const m=low.match(/\d+([.,]\d+)?/);return m?{v:Math.round(parseFloat(m[0].replace(",","."))*1e4),flag:false,note:"« "+str.trim()+" » lu en millions de centimes"}:null}
  const multi=(low.match(/\d[\d\s.,']*\d|\d/g)||[]).filter(x=>x.replace(/\D/g,"").length>=3).length>1;
  const m=low.replace(/,(?=\d{3}\b)/g,".").match(/\d[\d\s.,']*/);if(!m)return null;let raw=m[0].trim().replace(/[\s']/g,"").replace(/[.,]$/,"");
  const groups=raw.split(".");let flag=false;
  if(groups.length>1&&groups.slice(1).some(g=>g.length!==3)){ if(groups.length===2&&groups[1].length<3){return {v:parseFloat(raw.replace(",",".")),flag:false}} flag=true }
  return {v:parseInt(raw.replace(/[.,]/g,""),10),flag:flag||multi}}
function surfaceOf(str){let t=(str||"").toLowerCase().replace(/(\d)\.(\d{3})\b/g,"$1$2").replace(",",".");const m=t.match(/\d+(\.\d+)?/);if(!m)return null;let v=parseFloat(m[0]);if(/\d\s*(ha\b|hectare)/.test(t))v=v*10000;return v}
function parsePlacemark(folder,desc,coords){
  const lines=desc.split(/\n/).map(x=>x.trim()).filter(Boolean);
  const head=(lines[0]||"").toLowerCase();
  const fk=folder.trim().toLowerCase();
  let type=FOLDER_TYPE[fk]||Object.entries(FOLDER_TYPE).find(([k])=>fk.includes(k))?.[1]||"Autre";
  const city=field(lines,[/^ville$/i]); const district=field(lines,[/^quartiers?$/i]);
  const contact=field(lines,[/^contacte?$/i]);
  const floor=[field(lines,[/^[ée]?tage$/i,/^tage$/i]),field(lines,[/^n[bv]\s*[ée]?t?age$/i,/^nb tage$/i,/^r\+$/i])].filter(Boolean).join(" · nb étages ");
  const ch=field(lines,[/^ch(ambres?)?$/i]),sal=field(lines,[/^salon$/i]),sdb=field(lines,[/^sdb$/i]);
  const rooms=[ch&&ch+" ch",sal&&sal+" salon",sdb&&sdb+" sdb"].filter(Boolean).join(", ");
  const link=(desc.match(/https?:\/\/\S+/)||[""])[0];
  const code=(desc.match(/code\s*(?:t[ée]moins?)?\s*:?\s*(\d{5,6})/i)||[])[1]||"";
  let surface=null;
  const tryF=keys=>{if(surface==null)surface=surfaceOf(field(lines,keys))};
  if(type==="Villa"||type==="Maison"){tryF([/^surface terrain$/i]);tryF([/^surface\.?$/i]);tryF([/^construit$/i])}
  else{tryF([/^surface\.?$/i,/^app surface$/i]);tryF([/^surface rdc$/i,/^superficie rdc$/i,/^rdc$/i]);tryF([/^superficie$/i,/^surface terrain$/i]);tryF([/^construit$/i])}
  let ll=null;const c=(coords||"").split(",");if(c.length>=2&&!isNaN(+c[0])&&!isNaN(+c[1]))ll=(+c[1]).toFixed(6)+", "+(+c[0]).toFixed(6);
  const pV=field(lines,[/^prix\s*vente$/i]),pL=field(lines,[/^prix\s*location$/i]),pG=field(lines,[/^prix\.?$/i]);
  const offers=[];
  function mk(str,txHint){if(!str)return;const n=num(str);if(!n||!n.v)return;const low=str.toLowerCase();
    const perMonth=/mois/.test(low);const perM2=!perMonth&&/(\/|:|par|le)\s*m\s*(2|²)?\b|\/\s*m²/.test(low);
    let tx=txHint||(perMonth?"Location":(head.includes("louer")&&!head.includes("vendre")?"Location":"Vente"));
    let price=perM2?(surface?Math.round(n.v*surface):null):n.v;
    let flag=n.flag;
    if(price&&surface){const r=price/surface;if(tx==="Vente"&&(r<(type==="Terrain"?50:1000)||r>100000))flag=true;if(tx==="Location"&&(r<5||r>1000))flag=true}
    offers.push({tx,price,flag,perM2:perM2?n.v:null,note:n.note})}
  mk(pV,"Vente");mk(pL,"Location");if(!pV&&!pL)mk(pG,null);else if(pG&&!(pV&&pL))mk(pG,pV?"Location":"Vente");
  if(!offers.length)offers.push({tx:head.includes("louer")&&!head.includes("vendre")?"Location":"Vente",price:null});
  const baseNotes="Importé de My Maps (calque « "+folder.trim()+" »)."+(code?" Code Tinsa "+code+".":"");
  const original="\nTexte d’origine :\n"+desc.slice(0,1500);
  return offers.map((o,i)=>({
    id:"mm-"+hash(folder+"|"+coords+"|"+desc)+(offers.length>1?"-"+i:""),
    tx:o.tx,type,price:o.price,surface,city,district,address:"",gps:ll||"",floor,rooms,state:"",source:"",contactName:"",contactTel:contact,link,code,
    notes:baseNotes+(o.perM2?" Prix demandé : "+o.perM2.toLocaleString("fr-FR")+" DH/m².":"")+(o.note?" Prix "+o.note+".":"")+(o.flag?" Prix ou surface à vérifier (valeur inhabituelle).":"")+(o.perM2&&!surface?" Surface inconnue : prix total non calculé.":"")+original,
    date:"",photos:[],createdAt:Date.now(),updatedAt:Date.now()
  }));
}
function parseKML(text){
  const d=new DOMParser().parseFromString(text,"text/xml");
  if(d.querySelector("parsererror"))throw new Error("bad");
  const out=[];
  d.querySelectorAll("Placemark").forEach(p=>{
    const folder=p.parentElement?.querySelector(":scope > name")?.textContent||"";
    const raw=p.querySelector("description")?.textContent||"";
    const desc=raw.replace(/<br\s*\/?>/gi,"\n").replace(/<[^>]+>/g,"").replace(/&nbsp;/g," ").trim();
    const coords=(p.querySelector("Point coordinates")||p.querySelector("coordinates"))?.textContent.trim()||"";
    if(!desc)return;
    parsePlacemark(folder,desc,coords).forEach(x=>out.push(x));
  });
  return out;
}
function showImport(title,lines,byType,foot){
  const B=$("#impBody");B.innerHTML="";B.append(h("p",{text:title,style:"margin:0"}),h("ul",{style:"margin:0"},lines.map(([k,v])=>h("li",{text:k+" : "+v}))),h("p",{class:"note",style:"margin:0",text:Object.entries(byType).map(([k,v])=>k+" "+v).join(" · ")}),h("p",{class:"note",style:"margin:0",text:foot}));
  $("#impGo").disabled=!pending.length;$("#impGo").textContent="Importer "+pending.length+" comparables";$("#impProg").textContent="";$("#imp").showModal();
}
$("#importBtn").onclick=()=>{closeMenu();if(!online){toast("Connecte-toi pour importer.");return}$("#kmlInput").click()};
$("#kmlInput").onchange=async e=>{
  const f=e.target.files[0];e.target.value="";if(!f)return;
  if(/\.kmz$/i.test(f.name)){toast("Choisis l’export « .KML » (pas KMZ) dans My Maps.");return}
  let all;try{all=parseKML(await f.text())}catch(err){toast("Fichier KML illisible.");return}
  const have=new Set(items.map(x=>x.id));
  const sig=new Set(items.map(x=>(x.gps||"").split(",").map(v=>(+v).toFixed(4)).join(",")+"|"+(x.price||"")+"|"+x.tx));
  const dupe=[],empty=[];pending=[];
  for(const x of all){
    const s=(x.gps||"").split(",").map(v=>(+v).toFixed(4)).join(",")+"|"+(x.price||"")+"|"+x.tx;
    if(have.has(x.id)||(x.gps&&x.price&&sig.has(s))){dupe.push(x);continue}
    if(!x.price&&!x.surface){empty.push(x);continue}
    pending.push(x);sig.add(s);have.add(x.id);
  }
  const byType={};pending.forEach(x=>byType[x.type]=(byType[x.type]||0)+1);
  showImport(f.name+" : "+all.length+" fiches lues.",[["À importer",pending.length],["Déjà dans l’application (ignorés)",dupe.length],["Sans prix ni surface (ignorés)",empty.length]],byType,"Le texte d’origine de chaque fiche est conservé dans les observations.");
};
/* ===================== import CSV (Google Maps « À visiter ») ===================== */
function parseCSV(t){const rows=[];let row=[],f="",q=false;for(let i=0;i<t.length;i++){const c=t[i];if(q){if(c=='"'){if(t[i+1]=='"'){f+='"';i++}else q=false}else f+=c}else if(c=='"')q=true;else if(c==','){row.push(f);f=""}else if(c=='\n'){row.push(f);rows.push(row);row=[];f=""}else if(c!='\r')f+=c}if(f||row.length){row.push(f);rows.push(row)}return rows}
$("#csvBtn").onclick=()=>{closeMenu();if(!online){toast("Connecte-toi pour importer.");return}$("#csvInput").click()};
$("#csvInput").onchange=async e=>{
  const f=e.target.files[0];e.target.value="";if(!f)return;
  let rows;try{rows=parseCSV(await f.text())}catch(err){toast("Fichier CSV illisible.");return}
  const head=rows.shift().map(x=>x.trim().toLowerCase());
  const ci=n=>head.indexOf(n);
  const iT=ci("titre"),iN=ci("note"),iLa=ci("lat"),iLo=ci("lng");
  if(iN<0){toast("Colonne « note » introuvable dans le CSV.");return}
  const ex=items.map(x=>{const g=gpsOf(x);return g?{g,p:x.price}:null}).filter(Boolean);
  const kept=[];const dupe=[],empty=[],near=[];
  rows.forEach((r,k)=>{const title=(r[iT]||"").trim(),note=(r[iN]||"").trim();if(!title&&!note)return;
    const g=(iLa>=0&&r[iLa]&&r[iLo])?[+r[iLa],+r[iLo]]:(coordsFrom(title)||coordsFrom(note));
    const P=smartParse(note+" "+(coordsFrom(title)?"":title));
    const type=P.type||"Autre";const surface=LAND_TYPES.includes(type)?(P.sLand??P.sMain):(P.sMain??P.sLand);
    let price=P.price;if(price==null&&P.ppm&&surface)price=Math.round(P.ppm*surface);
    if(!price&&!surface){empty.push(k);return}
    if(g){if(ex.some(x=>distM(g,x.g)<=30&&x.p&&x.p===price)){dupe.push(k);return}
      if(kept.some(x=>x.g&&distM(g,x.g)<=10&&x.note===note)){dupe.push(k);return}}
    const close=g&&ex.some(x=>distM(g,x.g)<=30);if(close)near.push(k);
    const id="av-"+hash(title+"|"+note);
    const notes=["Importé de Google Maps (À visiter).",...P.notes,close?"Proche d’un comparable existant (à vérifier).":"","Note d’origine : "+note.replace(/\s*\n\s*/g," ; ")].filter(Boolean).join(" ");
    kept.push({g,note,doc:{id,tx:P.tx,type,price,surface,sMain:P.sMain??null,sLand:P.sLand??null,sMezz:P.sMezz??null,sCave:P.sCave??null,loyer:P.loyer??null,avance:P.avance??null,city:g?guessCity(g):"",district:"",address:coordsFrom(title)?"":title,gps:g?gpsStr(g):"",floor:P.floor||"",rooms:P.rooms||"",state:"",source:"",contactName:"",contactTel:P.contactTel||"",link:P.link||"",notes,date:"",status:"À vérifier",nature:"Offre",photos:[],createdAt:Date.now()+k,updatedAt:Date.now()+k}})});
  const have=new Set(items.map(x=>x.id));pending=kept.map(x=>x.doc).filter(d=>!have.has(d.id)||(dupe.push(1),false));
  const byType={};pending.forEach(x=>byType[x.type]=(byType[x.type]||0)+1);
  showImport(f.name+" : "+rows.length+" lignes lues.",[["À importer",pending.length],["… dont proches d’un comparable existant (prix différent)",near.length],["Déjà dans l’application ou en double (ignorés)",dupe.length],["Sans prix ni surface dans la note (ignorés)",empty.length]],byType,"La note d’origine est conservée dans les observations de chaque fiche.");
};

/* ===================== carte satellite (Leaflet) ===================== */
let map=null,ptsLayer=null,ovLayer=null,mv=null,lastMapR=[],markers=[],meLayer=null;
const ESRI="https://server.arcgisonline.com/ArcGIS/rest/services/";
function kfmt(v){return v>=1000?(Math.round(v/100)/10).toString().replace(".",",")+"k":Math.round(v)+""}
function initMap(){
  if(map||!window.L)return;
  map=L.map("map",{preferCanvas:true,zoomControl:true}).setView([33.573,-7.59],12);
  const o={maxZoom:20,maxNativeZoom:19};
  const sat=L.tileLayer(ESRI+"World_Imagery/MapServer/tile/{z}/{y}/{x}",{...o,attribution:"Imagerie © Esri, Maxar, Earthstar Geographics"});
  const roads=L.tileLayer(ESRI+"Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}",o);
  const names=L.tileLayer(ESRI+"Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",o);
  const hyb=L.layerGroup([sat,roads,names]);
  const plan=L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"© OpenStreetMap"});
  const bases={hyb,sat,plan};(bases[LS.get("mc_base","hyb")]||hyb).addTo(map);
  L.control.layers({"Satellite + rues":hyb,"Satellite seul":sat,"Plan":plan},null,{position:"topright"}).addTo(map);
  map.on("baselayerchange",e=>LS.set("mc_base",e.layer===sat?"sat":e.layer===plan?"plan":"hyb"));
  L.control.scale({imperial:false}).addTo(map);
  ovLayer=L.layerGroup().addTo(map);ptsLayer=L.layerGroup().addTo(map);meLayer=L.layerGroup().addTo(map);
  const Ctl=L.Control.extend({onAdd(){const d=L.DomUtil.create("div","leaflet-bar mc-ctl");
    const a=L.DomUtil.create("a","",d);a.href="#";a.title="Ma position";a.setAttribute("role","button");a.innerHTML='<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="3.2" fill="currentColor"/><circle cx="9" cy="9" r="6.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M9 0v3M9 15v3M0 9h3M15 9h3" stroke="currentColor" stroke-width="1.6"/></svg>';
    a.onclick=ev=>{ev.preventDefault();locateMe()};
    const b=L.DomUtil.create("a","",d);b.href="#";b.title="Tout voir";b.setAttribute("role","button");b.textContent="⤢";b.onclick=ev=>{ev.preventDefault();mv=null;drawMap(lastMapR)};
    L.DomEvent.disableClickPropagation(d);return d}});
  new Ctl({position:"topleft"}).addTo(map);
  map.on("click",e=>mapClickPopup(e.latlng));
  map.on("zoomend",updLabels);
}
function updLabels(){if(!map)return;const lbl=map.getZoom()>=15;markers.forEach(({m,c})=>{const has=!!m.getTooltip();if(lbl&&!has){const u=ppmOf(c);if(u)m.bindTooltip(kfmt(u)+(c.tx==="Location"?"/mois":""),{permanent:true,direction:"right",offset:[8,0],className:"mc-tip"})}else if(!lbl&&has)m.unbindTooltip()})}
function drawMap(r){
  lastMapR=r;initMap();
  if(!map){$("#mlegend").textContent="Carte indisponible : vérifie la connexion internet puis recharge la page.";return}
  setTimeout(()=>map.invalidateSize(),60);
  ptsLayer.clearLayers();ovLayer.clearLayers();markers=[];
  const css=getComputedStyle(document.documentElement),brand=css.getPropertyValue("--brand").trim()||"#0d5c63",rent=css.getPropertyValue("--rent").trim()||"#a8650f";
  const nv=$("#near").value.trim(),center=nv?coordsFrom(nv):null,rad=+$("#radius").value;
  const pts=r.map(c=>({c,g:gpsOf(c)})).filter(p=>p.g);
  pts.forEach(({c,g})=>{
    if(sel.has(c.id))L.circleMarker(g,{radius:12,color:brand,weight:3,fill:false,interactive:false}).addTo(ptsLayer);
    const m=L.circleMarker(g,{radius:7,color:"#ffffff",weight:1.5,fillColor:TCOL[c.type]||"#888888",fillOpacity:.95}).addTo(ptsLayer);
    m.bindPopup(()=>popupFor(c),{maxWidth:300});markers.push({m,c})});
  updLabels();
  if(center){L.circle(center,{radius:rad,color:rent,weight:2,dashArray:"6 6",fill:false,interactive:false}).addTo(ovLayer);L.circleMarker(center,{radius:6,color:"#ffffff",weight:2,fillColor:rent,fillOpacity:1,interactive:false}).addTo(ovLayer)}
  const subj=coordsFrom(etude.gps);if(subj&&sel.size)L.marker(subj,{icon:L.divIcon({className:"mc-subj",iconSize:[16,16]}),title:"Bien évalué",keyboard:false}).addTo(ovLayer);
  if(!mv){if(center)map.fitBounds(L.latLng(center).toBounds(rad*2.3));else if(pts.length)map.fitBounds(L.latLngBounds(pts.map(p=>p.g)),{padding:[30,30],maxZoom:17});mv=true}
  const lg=$("#mlegend");lg.innerHTML="";
  lg.append(h("span",{class:"meta",text:pts.length+" sur la carte"+(r.length>pts.length?" ("+(r.length-pts.length)+" sans GPS)":"")+" · touche la carte pour un point précis"}));
  [...new Set(pts.map(p=>p.c.type))].forEach(t=>lg.append(h("span",null,h("i",{style:"background:"+(TCOL[t]||"#888")}),t)));
}
function popupFor(c){const g=gpsOf(c);
  return h("div",{class:"mc-pop"},h("div",{style:"font-weight:600",text:(c.type||"")+" · "+c.tx}),h("div",{class:"price"},fmt(c.price),h("small",{text:priceSuf(c.tx)})),surfLine(c),
    h("div",{class:"meta",text:[[c.district,c.city].filter(Boolean).join(", "),c.contactTel,c._d!=null?"à "+Math.round(c._d)+" m":""].filter(Boolean).join(" · ")}),
    h("div",{class:"acts"},h("button",{class:"btn sm",type:"button",text:"Fiche",onclick:()=>openView(c)}),
      h("button",{class:"btn sm",type:"button",text:sel.has(c.id)?"Retirer de l’étude":"Ajouter à l’étude",onclick:()=>{toggleSel(c.id)}}),
      g?h("a",{class:"btn sm",target:"_blank",rel:"noopener",href:"https://www.google.com/maps/dir/?api=1&destination="+g[0]+","+g[1],text:"Itinéraire"}):null))}
function mapClickPopup(ll){const g=[+ll.lat.toFixed(6),+ll.lng.toFixed(6)],s=gpsStr(g);
  const el=h("div",{class:"mc-pop"},h("div",{class:"num",text:s}),h("div",{class:"acts"},
    canAdd()?h("button",{class:"btn sm pri",type:"button",text:"Nouveau témoin ici",onclick:()=>{map.closePopup();openForm();$("#f_gps").value=s;$("#f_gps").dispatchEvent(new Event("input"))}}):null,
    h("button",{class:"btn sm",type:"button",text:"Comparables autour",onclick:()=>{map.closePopup();$("#near").value=s;if(!$("#radius").value)$("#radius").value="500";$("#filters").hidden=false;shown=0;mv=null;render()}}),
    canVisites()?h("button",{class:"btn sm",type:"button",text:"Fiche de visite ici",onclick:()=>{map.closePopup();openVisite(null,{gps:s});autoPlace()}}):null,
    h("button",{class:"btn sm",type:"button",text:"Copier",onclick:e=>copyText(s,e.target)})));
  L.popup({maxWidth:300}).setLatLng(ll).setContent(el).openOn(map)}
function showOnMap(c){const g=gpsOf(c);if(!g){toast("Cette fiche n’a pas de position GPS.");return}
  view="map";LS.set("mc_view",view);mv=true;render();map.setView(g,18);const f=markers.find(x=>x.c.id===c.id);if(f)setTimeout(()=>f.m.openPopup(),250);window.scrollTo({top:0})}
function getPos(){return new Promise((res,rej)=>{if(!navigator.geolocation){rej({code:"geo"});return}
  navigator.geolocation.getCurrentPosition(p=>res([p.coords.latitude,p.coords.longitude,p.coords.accuracy]),e=>rej({code:"geo",reason:e.code}),{enableHighAccuracy:true,timeout:20000,maximumAge:20000})})}
function geoErr(e){toast(e?.reason===1?"Localisation refusée : autorise la position pour ce site dans le navigateur.":"Position introuvable : active le GPS puis réessaie.")}
async function locateMe(){try{const [la,lo,acc]=await getPos();meLayer.clearLayers();
  L.circle([la,lo],{radius:acc||20,color:"#2f6fdf",weight:1,fillOpacity:.12,interactive:false}).addTo(meLayer);
  L.circleMarker([la,lo],{radius:7,color:"#ffffff",weight:2,fillColor:"#2f6fdf",fillOpacity:1}).addTo(meLayer).bindPopup(()=>{const s=gpsStr([+la.toFixed(6),+lo.toFixed(6)]);return h("div",{class:"mc-pop"},h("b",{text:"Ma position"}),h("div",{class:"num",text:s+" (± "+Math.round(acc||0)+" m)"}),h("div",{class:"acts"},canAdd()?h("button",{class:"btn sm pri",type:"button",text:"Nouveau témoin ici",onclick:()=>{map.closePopup();openForm();$("#f_gps").value=s;$("#f_gps").dispatchEvent(new Event("input"))}}):null,h("button",{class:"btn sm",type:"button",text:"Comparables autour",onclick:()=>{map.closePopup();$("#near").value=s;$("#filters").hidden=false;shown=0;mv=null;render()}})))});
  map.setView([la,lo],Math.max(map.getZoom(),17))}catch(e){geoErr(e)}}
window.addEventListener("resize",()=>{if(map)map.invalidateSize()});
$("#kmlExport").onclick=async()=>{closeMenu();const r=filtered().filter(c=>gpsOf(c));if(!r.length){toast("Rien à exporter.");return}
  const byT={};r.forEach(c=>(byT[c.type||"Autre"]=byT[c.type||"Autre"]||[]).push(c));
  const kml='<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>Valtera – Témoins</name>'+Object.entries(byT).map(([t,cs])=>'<Folder><name>'+esc(t)+'</name>'+cs.map(c=>{const g=gpsOf(c);return '<Placemark><name>'+esc((c.tx!=="Vente"?c.tx+" ":"")+fmt(c.price)+" DH · "+(c.surface?fmtS(c.surface)+" m²":""))+'</name><description>'+esc(summaryText(c)+(c.notes?" | "+c.notes:""))+'</description><Point><coordinates>'+g[1]+','+g[0]+',0</coordinates></Point></Placemark>'}).join("")+'</Folder>').join("")+'</Document></kml>';
  await saveFile("valtera_temoins_"+new Date().toISOString().slice(0,10)+".kml",kml)};
/* ===================== modules ===================== */
let curMod="temoins";
const MOD_SOON={dossiers:"Dossiers",ia:"Assistant IA"};
function showMod(m){
  if(MOD_SOON[m]){toast("« "+MOD_SOON[m]+" » arrive dans une prochaine version de Valtera.");return}
  if(m==="admin"&&!isOwner())m="temoins";
  if(m==="visites"&&!canVisites())m="temoins";
  curMod=m;$$("#mods button").forEach(b=>b.classList.toggle("on",b.dataset.m===m));
  $("#temoinsView").hidden=m!=="temoins";$("#adminView").hidden=m!=="admin";$("#visitesView").hidden=m!=="visites";
  ["#addBtn","#pasteBtn","#tray"].forEach(s=>$(s).classList.toggle("mod-off",m!=="temoins"));
  if(m==="admin"){listenAdmin();renderAdmin()}
  if(m==="visites"){listenVisites();renderVisites()}
  if(m==="temoins"&&view==="map"&&map)setTimeout(()=>map.invalidateSize(),60);
  window.scrollTo({top:0})}
$("#mods").addEventListener("click",e=>{const b=e.target.closest("button[data-m]");if(b)showMod(b.dataset.m)});

/* ===================== administration (propriétaire) ===================== */
let USERS={},INVITES={},admUnsubs=[];
function stopAdmin(){admUnsubs.forEach(u=>{try{u()}catch(e){}});admUnsubs=[]}
function listenAdmin(){if(!isOwner()||!fdb||admUnsubs.length)return;
  admUnsubs.push(fdb.collection("users").onSnapshot(s=>{USERS={};s.docs.forEach(d=>USERS[d.id]=d.data());if(curMod==="admin")renderAdmin()},e=>toast(errMsg(e,"Comptes indisponibles."))));
  admUnsubs.push(fdb.collection("invites").onSnapshot(s=>{INVITES={};s.docs.forEach(d=>INVITES[d.id]=d.data());if(curMod==="admin")renderAdmin()},()=>{}))}
const tsMs=v=>v==null?null:typeof v==="number"?v:v.toMillis?v.toMillis():null;
const dateFr=ms=>ms?new Date(ms).toLocaleDateString("fr-FR"):"";
function expTs(v){if(!v)return null;const d=new Date(v+"T23:59:59");return isNaN(d)?null:firebase.firestore.Timestamp.fromDate(d)}
function isoDay(ms){if(!ms)return "";const d=new Date(ms);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function appLink(){return location.origin+location.pathname.replace(/index\.html$/,"")}
function accRows(){
  const rows=Object.entries(USERS).map(([uid,u])=>({uid,email:u.email||"",name:u.name||"",role:u.role,modules:u.modules||[],expires:tsMs(u.expires),active:u.active!==false,lastSeen:tsMs(u.lastSeen),joined:true}));
  const known=new Set(rows.map(r=>r.email.toLowerCase()));
  Object.entries(INVITES).forEach(([em,i])=>{if(!known.has(em))rows.push({uid:null,email:em,name:"",role:i.role,modules:i.modules||[],expires:tsMs(i.expires),active:true,lastSeen:null,joined:false})});
  const ord={owner:0,collab:1,reader:2};return rows.sort((a,b)=>(ord[a.role]??3)-(ord[b.role]??3)||a.email.localeCompare(b.email))}
function stateOf(r){if(r.role==="owner")return ["Propriétaire","st-ok"];if(!r.joined)return ["Invité, pas encore connecté","st-warn"];if(!r.active)return ["Suspendu","st-bad"];if(r.expires&&r.expires<Date.now())return ["Expiré","st-old"];return ["Actif","st-ok"]}
function renderAdmin(){
  if(!isOwner())return;
  const rows=accRows(),T=$("#admTbl");T.innerHTML="";
  const byUid={};items.forEach(c=>{if(c.createdBy)byUid[c.createdBy]=(byUid[c.createdBy]||0)+1});
  $("#admCount").textContent=rows.length?rows.length+" compte"+(rows.length>1?"s":""):"";
  T.append(h("thead",null,h("tr",null,...["Personne","Rôle","Accès","Jusqu’au","État","Témoins ajoutés","Dernière visite",""].map(l=>h("th",{"data-k":""},l)))));
  const tb=h("tbody");
  if(!rows.length)tb.append(h("tr",null,h("td",{colspan:8,style:"white-space:normal;color:var(--muted);padding:18px",text:"Aucun compte pour l’instant."})));
  rows.forEach(r=>{const [st,cl]=stateOf(r);
    const acts=r.role==="owner"?h("span",{class:"meta",text:"—"}):h("div",{class:"acts",style:"padding:0;flex-wrap:nowrap"},
      h("button",{class:"btn sm",type:"button",text:"Modifier",onclick:()=>openUser(r)}),
      r.joined?h("button",{class:"btn sm",type:"button",text:r.active?"Suspendre":"Réactiver",onclick:e=>toggleActive(r,e.target)}):null);
    tb.append(h("tr",{style:"cursor:default"},
      h("td",{class:"wrap"},h("b",{text:r.name||r.email}),r.name?h("div",{class:"meta",text:r.email}):null),
      h("td",{text:ROLE_LBL[r.role]||r.role||"—"}),
      h("td",{class:"wrap",text:r.role==="owner"?"Tout":["Témoins",r.modules.includes("visites")&&r.role==="collab"?"Visites":"",r.modules.includes("export")?"export":""].filter(Boolean).join(" + ")}),
      h("td",{class:"num",text:r.role==="owner"?"—":(r.expires?dateFr(r.expires):"Sans limite")}),
      h("td",null,h("span",{class:"chip "+cl,text:st})),
      h("td",{class:"num r",text:r.uid?fmt(byUid[r.uid]||0):"—"}),
      h("td",{class:"num",text:r.lastSeen?dateFr(r.lastSeen):"—"}),
      h("td",null,acts)))});
  T.append(tb);
}
async function toggleActive(r,btn){btn.disabled=true;
  try{await commitSoft(fdb.doc("users/"+r.uid).update({active:!r.active}));toast(r.active?"Accès suspendu":"Accès réactivé")}catch(e){toast(errMsg(e))}btn.disabled=false}
$("#invForm").addEventListener("submit",async e=>{e.preventDefault();
  const email=$("#i_email").value.trim().toLowerCase();
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){$("#invNote").textContent="Adresse e-mail invalide.";return}
  if(email===ME.email){$("#invNote").textContent="C’est ton propre compte.";return}
  const mods=["temoins"].concat($("#i_m_visites").checked?["visites"]:[],$("#i_m_export").checked?["export"]:[]);
  const inv={email,role:$("#i_role").value,modules:mods,expires:expTs($("#i_expires").value),invitedAt:Date.now()};
  $("#invBtn").disabled=true;
  try{await commitSoft(fdb.doc("invites/"+email).set(inv));
    const link=appLink();
    $("#invNote").replaceChildren("Invitation enregistrée pour ",h("b",{text:email}),". Envoie-lui le lien de Valtera ; il se connecte avec ce compte Google : ",h("span",{class:"num",text:link})," ",h("button",{class:"btn sm",type:"button",text:"Copier le lien",onclick:ev=>copyText(link,ev.target)}));
    $("#i_email").value="";$("#i_expires").value="";$("#i_m_export").checked=false;$("#i_m_visites").checked=false}
  catch(err){$("#invNote").textContent=errMsg(err,"Invitation non enregistrée.")}
  $("#invBtn").disabled=false});
let uEdit=null,uDelArmed=false;
function openUser(r){uEdit=r;uDelArmed=false;$("#uDel").classList.remove("arm");$("#uDel").textContent="Retirer l’accès";
  $("#uTitle").textContent=r.name||r.email;$("#uMail").textContent=r.email+(r.joined?"":" · invitation en attente");
  $("#u_role").value=r.role==="reader"?"reader":"collab";$("#u_export").checked=r.modules.includes("export");$("#u_visites").checked=r.modules.includes("visites");
  $("#u_expires").value=isoDay(r.expires);$("#u_active").checked=r.active;$("#u_activeL").hidden=!r.joined;$("#uNote").textContent="";
  $("#uDlg").showModal()}
$("#uSave").onclick=async()=>{const r=uEdit;if(!r)return;
  const upd={role:$("#u_role").value,modules:["temoins"].concat($("#u_visites").checked?["visites"]:[],$("#u_export").checked?["export"]:[]),expires:expTs($("#u_expires").value)};
  $("#uSave").disabled=true;
  try{const b=fdb.batch();
    if(r.uid)b.update(fdb.doc("users/"+r.uid),{...upd,active:$("#u_active").checked});
    if(INVITES[r.email]||!r.uid)b.set(fdb.doc("invites/"+r.email),{...(INVITES[r.email]||{email:r.email,invitedAt:Date.now()}),...upd});
    await commitSoft(b.commit());$("#uDlg").close();toast("Accès mis à jour")}
  catch(e){$("#uNote").textContent=errMsg(e)}
  $("#uSave").disabled=false};
$("#uDel").onclick=async()=>{const r=uEdit;if(!r)return;
  if(!uDelArmed){uDelArmed=true;$("#uDel").classList.add("arm");$("#uDel").textContent="Confirmer : retirer l’accès";return}
  try{const b=fdb.batch();if(r.uid)b.delete(fdb.doc("users/"+r.uid));b.delete(fdb.doc("invites/"+r.email));await commitSoft(b.commit());$("#uDlg").close();toast("Accès retiré. Ses témoins restent dans Valtera.")}
  catch(e){$("#uNote").textContent=errMsg(e)}};
/* ===================== module Fiches de visite ===================== */
let visites=[],visEditing=null,visPhotos=[],visRefs=[],visDelArmed=false,visQ="",visUnsub=null;
function canVisites(){return isOwner()||(ME.modules.includes("visites")&&ME.role==="collab")}
const CH={on:["Oui","Non"],bmf:["B","M","F"]};
const TYPO_SUB={"Maison":["Unifamiliale","Multifamiliale"],"Villa":["Isolée","En bande","Jumelée"],"Local commercial":["Avec accès rue","Sans accès rue"]};
const VIS_SECTIONS=[
 {t:"Dossier et adresse",f:[["dossier","Numéro du dossier"],["date","Date de la visite","date"],["visiteur","Visiteur"],["contact","Contact (personne rencontrée)"],["contactTel","Téléphone du contact","tel"],
   ["gps","Coordonnées","gps"],["ville","Ville"],["quartier","Quartier"],["commune","Municipalité / Commune"],["rue","Rue","text",2],["residence","Résidence"],["num","N°"],["ilot","Îlot"],["porte","Porte"],["etage","Étage"],["codePostal","Code postal"],
   ["orientation","Orientation","chips",["Nord","Sud","Est","Ouest","Nord-Est","Nord-Ouest","Sud-Est","Sud-Ouest"]]]},
 {t:"Typologie",f:[["typo","Type de bien","chips",["Maison","Appartement","Villa","Local commercial","Usine","Autre"]],["typoSub","Précision","chips",[]],["resType","Résidence","chips",["Principale","Secondaire"]]]},
 {t:"Construction",f:[["nLog","N. logements","num"],["nLc","N. locaux commerciaux","num"],["nBureaux","N. bureaux","num"],["nAsc","N. ascenseurs","num"],["nEtages","N. étages","num"],["garage","Garage"],["ssol","Sous-sol"],
   ["hsp","HSP (LC et usine)","chips",["Inf","Sup"]],["terrasse","Terrasse","chips",["Accessible","Non accessible"]]]},
 {t:"Aménagements extérieurs",f:[["jardin","Jardin","chips",CH.on],["piscine","Piscine","chips",CH.on],["tsport","Terrain de sport","chips",CH.on],["cloturee","Clôturée","chips",CH.on],
   ["clim","Chauffage / clim","chips",CH.on],["chauffeEau","Chauffe-eau","chips",["Gaz","Électrique","Non"]],["incendie","Sécurité incendie","chips",["Pré-installation","Oui","Non"]]]},
 {t:"Équipement du quartier",note:"B bon · M moyen · F faible",f:[["eqCommercial","Commercial","chips",CH.bmf],["eqLoisirs","Loisirs","chips",CH.bmf],["eqScolaire","Scolaire","chips",CH.bmf],["eqSante","Santé","chips",CH.bmf],["eqSportif","Sportif","chips",CH.bmf],
   ["eqReligieux","Religieux","chips",["Suffisant","Insuffisant"]],["eqBus","Bus","chips",CH.on]]},
 {t:"Description",f:[["chambres","Nbre de chambres","num"],["sdb","Nbre de SDB / WC","num"],["piecesExt","Pièces extérieures","num"],["piecesTot","Pièces totales","num"],["sConst","Surface construite (m²)","num"],["sTerrain","Surface terrain (m²)","num"],
   ["occupation","Usager","chips",["Propriétaire","Locataire","Inoccupé"]],["age","Âge du bien (ans)","num"],["renov","Dernière rénovation"]]},
 {t:"Qualité constructive",rooms:true,f:[["docs","Documents en possession lors de la visite","multi",["CP","PC","P. autorisé","Autre"]],["docsAutre","Autre document"]]},
 {t:"Valeur et références",refs:true,f:[["valeur","Valeur du bien estimée (DH)","num"]]},
 {t:"Remarques",f:[["remarques","Remarques","area",null,3]]}
];
const VIS_FIELDS=VIS_SECTIONS.flatMap(s=>s.f);
const ROOM_DEF=["Séjour","Chambres","Cuisine","SDB / WC"];
const visCol=()=>fdb.collection("visites");
function visRefStr(n){return "V-"+String(n).padStart(4,"0")}

/* ---------- données ---------- */
function listenVisites(){if(visUnsub||!canVisites()||!fdb)return;
  const q=isOwner()?visCol():visCol().where("createdBy","==",ME.uid);
  visUnsub=q.onSnapshot(s=>{visites=s.docs.map(d=>({...d.data(),id:d.id}));if(curMod==="visites")renderVisites();if(!s.metadata.fromCache){if(isOwner())ensureVisCounter().then(fixVisRefs);else fixVisRefs()}},e=>toast(errMsg(e,"Fiches de visite indisponibles.")))}
function stopVisites(){if(visUnsub){try{visUnsub()}catch(e){}visUnsub=null}}
let visCounterOk=false;
async function ensureVisCounter(){if(visCounterOk||!isOwner())return;visCounterOk=true;try{const c=await fdb.doc("counters/visites").get();if(!c.exists)await fdb.doc("counters/visites").set({n:Math.max(0,...visites.map(v=>+((v.ref||"").slice(2))||0))})}catch(e){visCounterOk=false}}
let visFixing=false;
async function fixVisRefs(){if(visFixing||!navigator.onLine)return;visFixing=true;try{for(const v of visites.filter(v=>!v.ref&&v.createdBy===ME.uid).slice(0,10))await assignVisRef(v.id)}catch(e){}visFixing=false}
async function assignVisRef(id){const cRef=fdb.doc("counters/visites"),vRef=visCol().doc(id);
  return fdb.runTransaction(async t=>{const c=await t.get(cRef),d=await t.get(vRef);if(!d.exists||d.data().ref)return;
    if(!c.exists){if(!isOwner())return;t.set(cRef,{n:1});t.update(vRef,{ref:visRefStr(1)});return}
    const n=(c.data().n||0)+1;t.update(cRef,{n});t.update(vRef,{ref:visRefStr(n)})})}

/* ---------- liste ---------- */
function visTitle(v){return [v.typo,v.typoSub].filter(Boolean).join(" · ")||"Bien à préciser"}
function visAddr(v){return [[v.residence,v.num&&("N° "+v.num),v.rue].filter(Boolean).join(", "),[v.quartier,v.ville].filter(Boolean).join(", ")].filter(Boolean).join(" – ")}
function renderVisites(){
  const L=$("#visList");L.innerHTML="";const q=visQ.trim().toLowerCase();
  const r=visites.filter(v=>!q||[v.ref,v.dossier,v.ville,v.quartier,v.rue,v.residence,v.typo,v.contact,v.visiteur,v.remarques].join(" ").toLowerCase().includes(q))
    .sort((a,b)=>(b.date||"").localeCompare(a.date||"")||(b.createdAt||0)-(a.createdAt||0));
  $("#visCount").textContent=visites.length?visites.length+" fiche"+(visites.length>1?"s":""):"";
  if(!r.length){L.append(h("div",{class:"empty"},h("b",{text:visites.length?"Aucune fiche ne correspond.":"Aucune fiche de visite pour l’instant."}),h("p",{class:"meta",text:visites.length?"Change la recherche.":"Sur place, appuie sur « + Nouvelle fiche » : la date, le visiteur, la position GPS, la ville et le quartier se remplissent tout seuls, et Valtera propose les témoins proches comme éléments de référence."})));return}
  r.forEach(v=>{const done=v.status==="terminee";
    L.append(h("article",{class:"vcard",onclick:()=>openVisite(v)},
      h("div",{class:"vtop"},h("span",{class:"num vref",text:v.ref||"V-…"}),h("span",{class:"chip "+(done?"st-ok":"st-warn"),text:done?"Terminée":"Brouillon"}),v.dossier?h("span",{class:"meta",text:"Dossier "+v.dossier}):null),
      h("div",{class:"vt",text:visTitle(v)}),
      h("div",{class:"meta",text:visAddr(v)||"Adresse à compléter"}),
      h("div",{class:"meta",text:[v.date?new Date(v.date).toLocaleDateString("fr-FR"):"",v.visiteur,v.valeur?fmt(v.valeur)+" DH":"",(v.refs||[]).length?(v.refs.length+" référence"+(v.refs.length>1?"s":"")):""].filter(Boolean).join(" · ")})))})}
$("#visSearch").addEventListener("input",e=>{visQ=e.target.value;renderVisites()});

/* ---------- formulaire ---------- */
function chipsEl(key,opts,multi){const d=h("div",{class:"chips","data-k":key,role:"group"});
  opts.forEach(o=>d.append(h("button",{type:"button","data-v":o,"aria-pressed":"false",text:o,onclick:e=>{const b=e.currentTarget,on=b.getAttribute("aria-pressed")!=="true";
    if(!multi)d.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed","false"));b.setAttribute("aria-pressed",on?"true":"false");if(key==="typo")updTypoSub()}})));return d}
function buildVisForm(){
  const B=$("#visBody");B.innerHTML="";
  VIS_SECTIONS.forEach(s=>{const fs=h("fieldset",null,h("legend",{text:s.t}));if(s.note)fs.append(h("p",{class:"note",text:s.note}));
    const g=h("div",{class:"fgrid"});
    s.f.forEach(([k,l,type="text",opts,span])=>{
      if(type==="chips"||type==="multi"){g.append(h("div",{class:"fchips s-all"},h("span",{class:"lbl",text:l}),chipsEl(k,opts||[],type==="multi")));return}
      if(type==="gps"){g.append(h("label",{class:"s2"},l,h("div",{class:"gpsrow"},h("input",{id:"v_gps",inputmode:"decimal",placeholder:"33.5731, -7.5898",autocomplete:"off"}),h("button",{class:"btn sm",type:"button",id:"vGpsMe",text:"Ma position",onclick:visGpsMe}))));return}
      if(type==="area"){g.append(h("label",{class:"s-all"},l,h("textarea",{id:"v_"+k,rows:span||3})));return}
      g.append(h("label",{class:span===2?"s2":null},l,h("input",{id:"v_"+k,type:type==="num"?"text":type,inputmode:type==="num"?"decimal":null,autocomplete:"off"})))});
    fs.append(g);
    if(s.rooms){fs.insertBefore(h("div",{class:"rooms"},h("div",{class:"tblwrap flat"},h("table",{class:"t",id:"vRooms"})),h("button",{class:"btn sm",type:"button",text:"+ Ajouter une pièce",onclick:()=>{addRoom({});}})),g)}
    if(s.refs){fs.append(h("div",{class:"refs"},h("div",{class:"refhead"},h("b",{text:"Éléments de référence"}),h("span",{class:"meta",id:"vRefInfo"})),
      h("div",{class:"tblwrap flat"},h("table",{class:"t",id:"vRefTbl"})),
      h("div",{class:"acts",style:"padding:0"},h("button",{class:"btn sm",type:"button",text:"Proposer les témoins proches",onclick:proposeRefs}),h("button",{class:"btn sm",type:"button",text:"Ajouter par référence (T-…)",onclick:addRefByCode})),
      h("div",{id:"vRefPick"})))}
    B.append(fs)});
  B.append(h("fieldset",null,h("legend",{text:"Photos"}),h("div",{class:"thumbs",id:"vThumbs"}),h("div",{class:"acts",style:"padding:0"},
    h("button",{class:"btn sm",type:"button",id:"vCamBtn",text:"Prendre une photo",onclick:()=>$("#vCamIn").click()}),h("button",{class:"btn sm",type:"button",id:"vPhotoBtn",text:"+ Ajouter des photos",onclick:()=>$("#vPhotoIn").click()}))));
}
function setChips(k,v){const d=$('#visBody .chips[data-k="'+k+'"]');if(!d)return;const vals=Array.isArray(v)?v:[v];d.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",vals.includes(b.dataset.v)?"true":"false"))}
function getChips(k,multi){const d=$('#visBody .chips[data-k="'+k+'"]');if(!d)return multi?[]:"";const on=[...d.querySelectorAll('button[aria-pressed="true"]')].map(b=>b.dataset.v);return multi?on:(on[0]||"")}
function updTypoSub(keep){const t=getChips("typo"),d=$('#visBody .chips[data-k="typoSub"]'),cur=keep??getChips("typoSub");d.innerHTML="";
  const opts=TYPO_SUB[t]||[];d.closest(".fchips").hidden=!opts.length;
  opts.forEach(o=>d.append(h("button",{type:"button","data-v":o,"aria-pressed":o===cur?"true":"false",text:o,onclick:e=>{const b=e.currentTarget,on=b.getAttribute("aria-pressed")!=="true";d.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed","false"));b.setAttribute("aria-pressed",on?"true":"false")}})))}
function addRoom(r){const T=$("#vRooms");if(!T.tHead)T.append(h("thead",null,h("tr",null,...["Pièce","Revêtement sol","Murs","Plafond","Menuiserie int.",""].map(l=>h("th",{"data-k":""},l)))),h("tbody"));
  const tr=h("tr",{style:"cursor:default"},...["piece","sol","murs","plafond","menuiserie"].map(k=>h("td",null,h("input",{"data-r":k,value:r[k]||"","aria-label":k}))),
    h("td",null,h("button",{class:"btn sm",type:"button",text:"✕","aria-label":"Retirer la pièce",onclick:()=>tr.remove()})));T.tBodies[0].append(tr)}
function readRooms(){return [...$$("#vRooms tbody tr")].map(tr=>{const o={};tr.querySelectorAll("input").forEach(i=>o[i.dataset.r]=i.value.trim());return o}).filter(o=>Object.values(o).some(Boolean))}
function openVisite(v,preset){
  if(!canVisites()){toast(errMsg({code:"permission-denied"}));return}
  visEditing=v||null;visDelArmed=false;$("#visDel").classList.remove("arm");$("#visDel").textContent="Supprimer";
  buildVisForm();const d=v||{date:new Date().toISOString().slice(0,10),visiteur:ME.name,pieces:ROOM_DEF.map(p=>({piece:p})),...(preset||{})};
  VIS_FIELDS.forEach(([k,l,type])=>{if(type==="chips"||type==="multi"){if(k!=="typoSub")setChips(k,d[k]||(type==="multi"?[]:""));return}const e=$("#v_"+k);if(e)e.value=d[k]!=null?(type==="num"?plain(d[k]):d[k]):""});
  updTypoSub(d.typoSub||"");(d.pieces||[]).forEach(addRoom);if(!(d.pieces||[]).length)ROOM_DEF.forEach(p=>addRoom({piece:p}));
  visPhotos=[...(d.photos||[])];renderVisThumbs();visRefs=[...(d.refs||[])];renderRefs();$("#vRefPick").innerHTML="";
  $("#visTitle").textContent=v?(v.ref||"Fiche de visite")+(v.dossier?" · dossier "+v.dossier:""):"Nouvelle fiche de visite";
  $("#visDone").checked=d.status==="terminee";$("#visDel").hidden=!v||!isOwner();$("#visPrint").hidden=$("#visTemoin").hidden=!v;$("#visNote").textContent="";
  $("#visDlg").showModal();$("#visDlg").scrollTop=0;
  if(!v&&!d.gps)visGpsMe(true);
}
function readVisite(){
  const o={};VIS_FIELDS.forEach(([k,l,type])=>{if(type==="chips")o[k]=getChips(k);else if(type==="multi")o[k]=getChips(k,true);else{const e=$("#v_"+k);if(!e)return;const val=e.value.trim();o[k]=type==="num"?(val===""?null:numIn(val)):val}});
  o.gps=$("#v_gps").value.trim();const g=coordsFrom(o.gps);if(g)o.gps=gpsStr(g);
  o.pieces=readRooms();o.refs=[...visRefs];o.photos=[...visPhotos];o.status=$("#visDone").checked?"terminee":"brouillon";return o}
$("#visSave").onclick=async()=>{const o=readVisite(),base=visEditing,b=$("#visSave");
  if(o.gps&&!coordsFrom(o.gps)){$("#visNote").textContent="Coordonnées illisibles : écris « latitude, longitude »."; return}
  const id=base?.id||("v"+Date.now().toString(36)+Math.random().toString(36).slice(2,6));
  const doc={...o,ref:base?.ref||"",createdBy:base?.createdBy||ME.uid,byName:base?base.byName||"":ME.name,createdAt:base?.createdAt||Date.now(),updatedAt:Date.now()};
  b.disabled=true;
  try{const st=await commitSoft(visCol().doc(id).set(JSON.parse(JSON.stringify(doc))));if(!doc.ref&&navigator.onLine)assignVisRef(id).catch(()=>{});
    $("#visDlg").close();toast(st==="queued"?"Fiche enregistrée sur l’appareil : envoi au retour du réseau.":"Fiche de visite enregistrée")}
  catch(e){$("#visNote").textContent=errMsg(e)}
  b.disabled=false};
$("#visDel").onclick=async()=>{if(!visEditing||!isOwner())return;
  if(!visDelArmed){visDelArmed=true;$("#visDel").classList.add("arm");$("#visDel").textContent="Confirmer la suppression";return}
  try{const b=fdb.batch();b.delete(visCol().doc(visEditing.id));(visEditing.photos||[]).forEach(p=>{b.delete(phCol().doc(p.id));if(p.t&&p.t!==p.id)b.delete(phCol().doc(p.t))});await commitSoft(b.commit());$("#visDlg").close();toast("Fiche supprimée")}
  catch(e){$("#visNote").textContent=errMsg(e)}};
$("#visAdd").onclick=()=>openVisite(null);

/* ---------- remplissage automatique : position, ville, quartier ---------- */
async function visGpsMe(silent){const b=$("#vGpsMe");if(!b)return;b.disabled=true;b.textContent="Recherche…";
  try{const [la,lo,acc]=await getPos();if(!$("#visDlg").open)return;$("#v_gps").value=gpsStr([+la.toFixed(6),+lo.toFixed(6)]);autoPlace();if(silent!==true)toast("Position enregistrée (± "+Math.round(acc||0)+" m)")}
  catch(e){if(silent!==true)geoErr(e)}
  b.disabled=false;b.textContent="Ma position"}
function nearest(g,maxM){return items.map(c=>({c,g:gpsOf(c)})).filter(x=>x.g).map(x=>({c:x.c,d:distM(g,x.g)})).filter(x=>x.d<=maxM).sort((a,b)=>a.d-b.d)}
function autoPlace(){const g=coordsFrom($("#v_gps").value);if(!g)return;const n=nearest(g,900);
  const pick=k=>{const cnt={};n.slice(0,15).forEach(x=>{const v=(x.c[k]||"").trim();if(v)cnt[v]=(cnt[v]||0)+1});return Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0]?.[0]||""};
  if(!$("#v_ville").value){const v=pick("city");if(v)$("#v_ville").value=v}
  if(!$("#v_quartier").value){const v=pick("district");if(v)$("#v_quartier").value=v}}
$("#visBody").addEventListener("change",e=>{if(e.target.id==="v_gps")autoPlace()});

/* ---------- éléments de référence (témoins) ---------- */
const TYPO_TO_TYPE={"Maison":["Maison","Villa"],"Appartement":["Appartement"],"Villa":["Villa","Maison"],"Local commercial":["Local commercial"],"Usine":["Usine","Entrepôt / dépôt"]};
function refOrigin(c){const s=(c.source+" "+c.nature+" "+c.contactName).toLowerCase();return /agence|agenz|mubawab|avito|sax|immo/.test(s)?"Ag. immob":"Particulier"}
function renderRefs(){const T=$("#vRefTbl");T.innerHTML="";const g=coordsFrom($("#v_gps")?.value||"");
  $("#vRefInfo").textContent=visRefs.length?visRefs.length+" témoin"+(visRefs.length>1?"s":""):"Aucun pour l’instant";
  if(!visRefs.length)return;
  T.append(h("thead",null,h("tr",null,...["Réf.","Typologie","Prix","Tél","Adresse","Origine",""].map(l=>h("th",{"data-k":""},l)))));
  const tb=h("tbody");visRefs.forEach(id=>{const c=items.find(x=>x.id===id);
    if(!c){tb.append(h("tr",{style:"cursor:default"},h("td",{colspan:6,class:"meta",text:"Témoin introuvable (supprimé ?)"}),h("td",null,h("button",{class:"btn sm",type:"button",text:"✕",onclick:()=>{visRefs=visRefs.filter(x=>x!==id);renderRefs()}}))));return}
    const cg=gpsOf(c),d=g&&cg?distM(g,cg):null;
    tb.append(h("tr",{style:"cursor:default"},h("td",{class:"num",text:c.ref||"—"}),h("td",{text:[c.type,c.tx!=="Vente"?c.tx:""].filter(Boolean).join(" · ")}),
      h("td",{class:"num",text:fmt(c.price)+priceSuf(c.tx)}),h("td",{class:"num",text:c.contactTel||"—"}),
      h("td",{class:"wrap",text:[c.address,c.district,c.city].filter(Boolean).join(", ")+(d!=null?" · à "+Math.round(d)+" m":"")}),h("td",{text:refOrigin(c)}),
      h("td",null,h("button",{class:"btn sm",type:"button",text:"✕","aria-label":"Retirer",onclick:()=>{visRefs=visRefs.filter(x=>x!==id);renderRefs()}}))))});
  T.append(tb)}
function proposeRefs(){const P=$("#vRefPick");P.innerHTML="";const g=coordsFrom($("#v_gps").value);
  if(!g){P.append(h("p",{class:"note",text:"Ajoute d’abord les coordonnées (bouton « Ma position »)."}));return}
  const types=TYPO_TO_TYPE[getChips("typo")]||null;
  let n=nearest(g,1500).filter(x=>!visRefs.includes(x.c.id));if(types)n=n.filter(x=>types.includes(x.c.type));n=n.slice(0,12);
  if(!n.length){P.append(h("p",{class:"note",text:"Aucun témoin"+(types?" de ce type":"")+" à moins de 1,5 km."}));return}
  P.append(h("p",{class:"note",text:"Témoins à moins de 1,5 km"+(types?" ("+types.join(", ")+")":"")+". Touche pour ajouter."}));
  const box=h("div",{class:"refpick"});
  n.forEach(({c,d})=>box.append(h("button",{type:"button",class:"refopt",onclick:e=>{visRefs.push(c.id);e.currentTarget.remove();renderRefs()}},
    h("b",{class:"num",text:(c.ref||"")+" · "+fmt(c.price)+priceSuf(c.tx)}),h("span",{class:"meta",text:[c.type,c.surface?plain(c.surface)+" m²":"",Math.round(d)+" m"].filter(Boolean).join(" · ")}))));
  P.append(box)}
function addRefByCode(){const P=$("#vRefPick");P.innerHTML="";const inp=h("input",{placeholder:"T-0123",style:"max-width:140px"});
  const go=()=>{const v=inp.value.trim().toUpperCase().replace(/^T-?(\d+)$/,(m,d)=>"T-"+d.padStart(4,"0"));const c=items.find(x=>(x.ref||"").toUpperCase()===v);
    if(!c){toast("Aucun témoin "+v+".");return}if(!visRefs.includes(c.id))visRefs.push(c.id);renderRefs();P.innerHTML=""};
  inp.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();go()}});
  P.append(h("div",{class:"gpsrow"},inp,h("button",{class:"btn sm pri",type:"button",text:"Ajouter",onclick:go})));inp.focus()}

/* ---------- photos ---------- */
function renderVisThumbs(){const T=$("#vThumbs");T.innerHTML="";
  visPhotos.forEach((p,i)=>T.append(h("div",{class:"th"},h("img",{"data-pid":p.t||p.id,src:photoUrl(p,1),alt:"Photo "+(i+1)}),h("button",{type:"button",class:"x","aria-label":"Retirer la photo",text:"✕",onclick:()=>{visPhotos.splice(i,1);renderVisThumbs()}}))));
  if(!visPhotos.length)T.append(h("span",{class:"meta",text:"Aucune photo."}))}
async function visAddPhotos(e){const files=[...e.target.files];e.target.value="";if(!files.length)return;
  $("#vPhotoBtn").disabled=$("#vCamBtn").disabled=true;
  for(const f of files){try{const big=await fitPhoto(f,[[1600,.8],[1280,.74],[1024,.68]]),small=await fitPhoto(f,[[480,.72]]);
    const tag="visite:"+(visEditing?.id||"");const id=await store.uploadPhoto(big,tag),t=await store.uploadPhoto(small,tag);visPhotos.push({id,t});renderVisThumbs()}
    catch(err){toast(errMsg(err,"Une photo n’a pas pu être envoyée."))}}
  $("#vPhotoBtn").disabled=$("#vCamBtn").disabled=false}
$("#vPhotoIn").onchange=visAddPhotos;$("#vCamIn").onchange=visAddPhotos;

/* ---------- impression / PDF, texte, témoin ---------- */
function visText(v){const L=[];L.push("FICHE DE VISITE "+(v.ref||"")+(v.dossier?" – Dossier "+v.dossier:""));
  L.push("Date : "+(v.date?new Date(v.date).toLocaleDateString("fr-FR"):"")+" · Visiteur : "+(v.visiteur||""));
  VIS_SECTIONS.forEach(s=>{const parts=s.f.map(([k,l])=>{const x=v[k];if(x==null||x===""||(Array.isArray(x)&&!x.length))return null;if(k==="dossier"||k==="date"||k==="visiteur")return null;return l+" : "+(Array.isArray(x)?x.join(", "):typeof x==="number"?plain(x):x)}).filter(Boolean);
    if(s.rooms&&(v.pieces||[]).length)parts.unshift(...v.pieces.map(p=>[p.piece,[p.sol,p.murs,p.plafond,p.menuiserie].filter(Boolean).join(" / ")].filter(Boolean).join(" : ")));
    if(s.refs&&(v.refs||[]).length)parts.push("Références : "+v.refs.map(id=>{const c=items.find(x=>x.id===id);return c?(c.ref||"")+" "+(c.type||"")+" "+fmt(c.price)+priceSuf(c.tx):""}).filter(Boolean).join(" ; "));
    if(parts.length){L.push("");L.push(s.t.toUpperCase());parts.forEach(p=>L.push("- "+p))}});
  return L.join("\n")}
function printVisite(v){const A=$("#printArea");A.innerHTML="";
  const cell=(l,x)=>h("div",{class:"pc"},h("span",{class:"pl",text:l}),h("span",{class:"pv",text:x==null||x===""?"":Array.isArray(x)?x.join(", "):typeof x==="number"?plain(x):String(x)}));
  A.append(h("div",{class:"ph"},h("div",null,h("div",{class:"pbrand",text:"Valtera"}),h("h1",{text:"Fiche de visite"})),h("div",{class:"pref"},h("b",{class:"num",text:v.ref||""}),h("div",{text:v.dossier?"Dossier "+v.dossier:""}))));
  VIS_SECTIONS.forEach(s=>{const sec=h("section",{class:"ps"},h("h2",{text:s.t}));const g=h("div",{class:"pg"});
    s.f.forEach(([k,l,type])=>{if(k==="typoSub"&&!v.typoSub)return;g.append(cell(l,k==="date"&&v.date?new Date(v.date).toLocaleDateString("fr-FR"):v[k]))});sec.append(g);
    if(s.rooms){const t=h("table",{class:"pt"},h("tr",null,...["Pièce","Revêtement sol","Murs","Plafond","Menuiserie int."].map(x=>h("th",{text:x}))));(v.pieces||[]).forEach(p=>t.append(h("tr",null,...["piece","sol","murs","plafond","menuiserie"].map(k=>h("td",{text:p[k]||""})))));sec.insertBefore(t,g)}
    if(s.refs){const t=h("table",{class:"pt"},h("tr",null,...["Réf.","Typologie","Prix","Tél","Adresse","Origine"].map(x=>h("th",{text:x}))));
      (v.refs||[]).forEach(id=>{const c=items.find(x=>x.id===id);if(c)t.append(h("tr",null,h("td",{text:c.ref||""}),h("td",{text:c.type||""}),h("td",{text:fmt(c.price)+priceSuf(c.tx)}),h("td",{text:c.contactTel||""}),h("td",{text:[c.address,c.district,c.city].filter(Boolean).join(", ")}),h("td",{text:refOrigin(c)})))});sec.append(h("h3",{text:"Éléments de référence"}),t)}
    A.append(sec)});
  A.append(h("div",{class:"psign"},h("div",null,"Signature visiteur : ",h("b",{text:v.visiteur||""})),h("div",{class:"meta",text:"Édité le "+new Date().toLocaleDateString("fr-FR")+" avec Valtera"})));
  document.body.classList.add("printing");setTimeout(()=>{window.print();setTimeout(()=>document.body.classList.remove("printing"),400)},60)}
$("#visPrint").onclick=()=>{if(visEditing)printVisite({...visEditing,...readVisite()})};
$("#visCopy").onclick=e=>copyText(visText({...(visEditing||{}),...readVisite()}),e.target);
$("#visTemoin").onclick=()=>{const v={...(visEditing||{}),...readVisite()};$("#visDlg").close();openForm();
  const map={"Maison":"Maison","Appartement":"Appartement","Villa":"Villa","Local commercial":"Local commercial","Usine":"Usine"};const t=map[v.typo]||"Autre";
  ensureOpt($("#f_type"),t);$("#f_type").value=t;$("#f_type").dispatchEvent(new Event("change"));
  const set=(id,x)=>{const e=$("#"+id);if(e&&x!=null&&x!==""){e.value=x;e.dispatchEvent(new Event("input"))}};
  set("f_sMain",v.sConst!=null?plain(v.sConst):"");set("f_sLand",v.sTerrain!=null?plain(v.sTerrain):"");set("f_price",v.valeur!=null?plain(v.valeur):"");
  set("f_gps",v.gps);set("f_city",v.ville);set("f_district",v.quartier);set("f_address",[v.residence,v.num&&("N° "+v.num),v.rue].filter(Boolean).join(", "));
  set("f_dossier",v.dossier);set("f_date",v.date);set("f_floor",v.etage);set("f_age",v.age!=null?plain(v.age):"");set("f_rooms",v.piecesTot!=null?plain(v.piecesTot):"");
  ensureOpt($("#f_nature"),"Expertise");$("#f_nature").value="Expertise";set("f_source","Fiche de visite "+(v.ref||""));set("f_code",v.ref||"");
  set("f_notes","Valeur estimée lors de la visite "+(v.ref||"")+(v.remarques?" – "+v.remarques:""));updCalc()};
/* ===================== fichiers, photos, GPS ===================== */
async function saveFile(name,data){
  const type=name.endsWith(".csv")?"text/csv;charset=utf-8":name.endsWith(".json")?"application/json":name.endsWith(".kml")?"application/vnd.google-earth.kml+xml":"text/html;charset=utf-8";
  const blob=data instanceof Blob?data:new Blob([data],{type});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.append(a);a.click();
  setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},3000);toast("Fichier téléchargé : "+name)}
function shrinkQ(file,max,q){return new Promise((res,rej)=>{const img=new Image();img.onload=()=>{const s=Math.min(1,max/Math.max(img.width,img.height));
  const cv=document.createElement("canvas");cv.width=Math.round(img.width*s);cv.height=Math.round(img.height*s);cv.getContext("2d").drawImage(img,0,0,cv.width,cv.height);
  cv.toBlob(b=>b?res(b):rej({code:"img"}),"image/jpeg",q);URL.revokeObjectURL(img.src)};img.onerror=()=>rej({code:"img"});img.src=URL.createObjectURL(file)})}
async function fitPhoto(file,steps){for(const [m,q] of steps){const b=await shrinkQ(file,m,q);if(b.size*1.37<900000)return b}throw {code:"too-big"}}
async function addPhotos(e){
  const files=[...e.target.files];e.target.value="";if(!files.length)return;
  if(!online){toast("Connecte-toi pour ajouter des photos.");return}
  $("#photoBtn").disabled=$("#camBtn").disabled=true;const lbl=$("#photoBtn").textContent;$("#photoBtn").textContent="Envoi…";
  for(const f of files){try{const big=await fitPhoto(f,[[1600,.8],[1280,.74],[1024,.68]]),small=await fitPhoto(f,[[480,.72]]);
    const tid=editing?.id||"";const id=await store.uploadPhoto(big,tid),t=await store.uploadPhoto(small,tid);photos.push({id,t});renderThumbs()}
    catch(err){toast(errMsg(err,"Une photo n’a pas pu être envoyée."))}}
  $("#photoBtn").disabled=$("#camBtn").disabled=false;$("#photoBtn").textContent=lbl}
$("#photoInput").onchange=addPhotos;$("#camInput").onchange=addPhotos;
$("#camBtn").onclick=()=>$("#camInput").click();
$("#gpsMe").onclick=async()=>{const b=$("#gpsMe");b.disabled=true;b.textContent="Recherche…";
  try{const [la,lo,acc]=await getPos();$("#f_gps").value=gpsStr([+la.toFixed(6),+lo.toFixed(6)]);$("#f_gps").dispatchEvent(new Event("input"));toast("Position enregistrée (± "+Math.round(acc||0)+" m)")}catch(e){geoErr(e)}
  b.disabled=false;b.textContent="Ma position"};
$("#nearMe").onclick=async()=>{const b=$("#nearMe");b.disabled=true;
  try{const [la,lo]=await getPos();$("#near").value=gpsStr([+la.toFixed(6),+lo.toFixed(6)]);shown=0;mv=null;render()}catch(e){geoErr(e)}b.disabled=false};

/* ===================== sauvegarde et import JSON ===================== */
$("#mBackup").onclick=()=>{closeMenu();if(!canExport())return;if(!items.length){toast("Rien à sauvegarder.");return}
  saveFile("valtera_temoins_"+new Date().toISOString().slice(0,10)+".json",JSON.stringify({app:"Valtera",version:2,date:new Date().toISOString(),items:items.map(({_d,...x})=>x),etudes},null,1))};
$("#mRestore").onclick=()=>{closeMenu();if(!isOwner())return;if(!online){toast("Connecte-toi pour importer.");return}$("#jsonInput").click()};
$("#jsonInput").onchange=async e=>{const f=e.target.files[0];e.target.value="";if(!f)return;let arr;
  try{const j=JSON.parse(await f.text());arr=Array.isArray(j)?j:(j.items||j.comparables||[])}catch(err){toast("Fichier JSON illisible.");return}
  const have=new Set(items.map(x=>x.id));const dupe=[],bad=[];pending=[];
  for(let x of arr){if(x&&x.data&&x.id&&!x.tx)x={...x.data,id:x.id};
    if(!x||!x.id){bad.push(x);continue}const id=cleanId(x.id);if(have.has(id)){dupe.push(x);continue}
    const {_d,createdBy,byName,...y}=x;y.id=id;y.photos=(y.photos||[]).filter(p=>p&&p.id&&!p.url);pending.push(y);have.add(id)}
  const byType={};pending.forEach(x=>byType[x.type]=(byType[x.type]||0)+1);
  showImport(f.name+" : "+arr.length+" fiches lues.",[["À importer",pending.length],["Déjà dans Valtera (ignorées)",dupe.length],["Illisibles (ignorées)",bad.length]],byType,"Chaque témoin reçoit une référence Valtera (T-0001, T-0002…) dans l’ordre des dates de relevé. Les téléphones restent privés.")};
$("#impGo").onclick=async()=>{if(!pending.length)return;if(!isOwner()){toast(errMsg({code:"permission-denied"}));return}
  $("#impGo").disabled=true;let done=0;
  pending.sort((a,b)=>(a.date||"9999").localeCompare(b.date||"9999")||(a.createdAt||0)-(b.createdAt||0));
  try{done=await store.bulk(pending,n=>{done=n;$("#impProg").textContent=n+" / "+pending.length+" importés"});
    $("#impProg").textContent="Terminé : "+done+" importés.";toast(done+" témoins importés");pending=[]}
  catch(e){pending=pending.slice(done);$("#impProg").textContent=(done?done+" importés, ":"")+errMsg(e,"Échec de l’import.")+" Appuie encore pour importer le reste.";$("#impGo").disabled=false;$("#impGo").textContent="Importer "+pending.length+" témoins"}};

/* ===================== connexion ===================== */
function showGate(mode,msg){const g=$("#gate");g.hidden=false;
  $("#loginBtn").hidden=mode!=="login";$("#switchBtn").hidden=mode!=="denied";$("#gateWait").hidden=mode!=="wait";
  $("#gateMsg").textContent=msg||(mode==="config"?"Valtera n’est pas encore relié à son serveur (config.js).":"")}
function hideGate(){$("#gate").hidden=true}
function updateAcct(){
  const off=!navigator.onLine||syncMeta.fromCache,pend=syncMeta.hasPendingWrites;
  $("#onlineDot").className="dot "+(!online?"off":pend?"wait":off?"off":"on");
  $("#onlineDot").title=!online?"Non connecté":pend?"Envoi en attente":off?"Hors ligne : données de cet appareil":"Synchronisé";
  $("#authBar").hidden=!(online&&loaded&&(off||pend))||!$("#gate").hidden;
  $("#authTxt").textContent=pend?"Des ajouts attendent le réseau : ils partiront automatiquement.":"Hors ligne : tu consultes les données enregistrées sur cet appareil. Tes ajouts partiront au retour du réseau."}
window.addEventListener("online",updateAcct);window.addEventListener("offline",updateAcct);
function connErr(e){const c=e?.code||"";
  const m=c==="auth/popup-closed-by-user"||c==="auth/cancelled-popup-request"?"Fenêtre de connexion fermée : réessaie.":c==="auth/popup-blocked"?"Autorise les fenêtres pop-up pour ce site, puis réessaie.":c==="auth/unauthorized-domain"?"Ce site n’est pas autorisé dans Firebase (domaines autorisés).":c==="auth/network-request-failed"?"Pas de connexion internet.":errMsg(e,"Connexion impossible pour le moment.");
  if(!$("#gate").hidden)$("#gateMsg").textContent=m;toast(m)}
async function doLogin(){const b=$("#loginBtn");b.disabled=true;$("#gateMsg").textContent="";
  const p=new firebase.auth.GoogleAuthProvider();p.setCustomParameters({prompt:"select_account"});
  try{await auth.signInWithPopup(p)}
  catch(e){if(e?.code==="auth/popup-blocked"||e?.code==="auth/operation-not-supported-in-this-environment"){try{await auth.signInWithRedirect(p);return}catch(e2){connErr(e2)}}else connErr(e)}
  b.disabled=false}
$("#loginBtn").onclick=doLogin;
$("#switchBtn").onclick=()=>logout();
async function logout(){stopListen();online=false;ME.uid=null;ME.role=null;
  try{localStorage.removeItem("vt_me");localStorage.removeItem("mc_sel");localStorage.removeItem("mc_etude")}catch(e){}
  try{await auth.signOut()}catch(e){}
  try{await fdb.terminate();await fdb.clearPersistence()}catch(e){}
  location.reload()}
$("#mLogout").onclick=()=>{closeMenu();logout()};
const IN_APP=(()=>{try{if(document.referrer.startsWith("android-app://"))sessionStorage.setItem("vt_app","1");return sessionStorage.getItem("vt_app")==="1"}catch(e){return false}})();
$("#mApk").hidden=$("#gateApk").hidden=IN_APP;$("#mApk").onclick=()=>{closeMenu();location.href="download/valtera.apk"};
async function resolveAccess(u){
  ME.uid=u.uid;ME.email=(u.email||"").toLowerCase();ME.name=u.displayName||ME.email;
  let d=null;const uref=fdb.doc("users/"+u.uid);
  try{const s=await uref.get();d=s.exists?s.data():null}
  catch(e){const c=LS.get("vt_me",null);if(c&&c.uid===u.uid)d=c;else throw e}
  if(!d){
    if(!navigator.onLine){showGate("denied","La première connexion demande internet : réessaie avec du réseau.");return}
    let inv=null;try{const s=await fdb.doc("invites/"+ME.email).get();inv=s.exists?s.data():null}catch(e){}
    const base={email:ME.email,name:ME.name,active:true,createdAt:Date.now(),lastSeen:Date.now()};
    try{
      if(inv){d={...base,role:inv.role,modules:inv.modules||[],expires:inv.expires??null};await uref.set(d)}
      else{d={...base,role:"owner",modules:["temoins","export"],expires:null};await uref.set(d)}
    }catch(e){if(e?.code==="permission-denied"){showGate("denied","Le compte "+ME.email+" n’a pas accès à Valtera. Demande une invitation à l’administrateur, puis reconnecte-toi.");return}throw e}
  }
  const exp=tsMs(d.expires);
  if(d.role!=="owner"&&d.active===false){showGate("denied","Ton accès à Valtera est suspendu. Contacte l’administrateur.");return}
  if(d.role!=="owner"&&exp&&exp<Date.now()){showGate("denied","Ton accès à Valtera a pris fin le "+dateFr(exp)+". Contacte l’administrateur.");return}
  ME.role=d.role;ME.modules=d.modules||[];ME.expires=exp;
  LS.set("vt_me",{uid:u.uid,email:ME.email,role:d.role,modules:ME.modules,expires:exp,active:d.active!==false});
  uref.update({lastSeen:Date.now(),name:ME.name}).catch(()=>{});
  online=true;hideGate();applyRoleUi();listen();updateAcct();
  if(exp&&exp-Date.now()<7*864e5)toast("Ton accès prend fin le "+dateFr(exp)+".");
}
async function boot(){
  buildStatic();applyRoleUi();render();
  if("serviceWorker" in navigator&&location.protocol==="https:")navigator.serviceWorker.register("sw.js").catch(()=>{});
  if(!initFirebase()){showGate("config");return}
  await enablePersist();
  showGate("wait","Ouverture de Valtera…");
  auth.onAuthStateChanged(async u=>{
    if(!u){stopListen();online=false;ME.uid=null;ME.role=null;applyRoleUi();showGate("login");return}
    showGate("wait","Vérification de ton accès…");
    try{await resolveAccess(u)}catch(e){showGate("denied",errMsg(e,"Vérification impossible pour le moment : réessaie."))}
  });
  auth.getRedirectResult().catch(connErr);
}
boot();
