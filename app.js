'use strict';
/* ===================== constantes ===================== */
const TYPES=["Appartement","Villa","Maison","Local commercial","Bureau","Plateau de bureaux","Terrain","Entrepôt / dépôt","Immeuble","Usine","Riad","Autre"];
const TXS=["Vente","Location","Pas-de-porte"];
const STATUS=["À vérifier","Vérifié","Vendu / loué","Rejeté"];
const NATURES=["Offre","Transaction","Expertise","Estimation agence"];
const SOURCES=["Conservation foncière","Visite terrain","Agence / courtier","Particulier","Avito","Mubawab","Yakeey","Agenz","Autre site","SAX","Collègue"];
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
/* hectares, ares, centiares → m² (1 ha = 10 000 m², 1 a = 100 m², 1 ca = 1 m²) */
const HA_W={un:1,une:1,deux:2,trois:3,quatre:4,cinq:5,six:6,sept:7,huit:8,neuf:9,dix:10,"واحد":1,"جوج":2,"زوج":2,"اثنين":2,"ثلاثة":3,"ثلاث":3,"تلاتة":3,"تلات":3,"ربعة":4,"أربعة":4,"اربعة":4,"خمسة":5,"خمس":5,"عشرة":10};
const HA_NUM="(\\d+(?:[.,]\\d+)?|une?(?![a-zà-ÿ])|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|واحد|جوج|زوج|اثنين|ثلاثة|ثلاث|تلاتة|تلات|ربعة|أربعة|اربعة|خمسة|خمس|عشرة)";
const HA_D="(\\d+(?:[.,]\\d+)?)",HA_SEP="[\\s,;]*(?:et\\s+|و\\s*|\\+\\s*|&\\s*)?";
const HA_U="(ha(?![a-zà-ÿ0-9])\\.?|hect(?:are)?s?(?![a-zà-ÿ])\\.?|(?:ال)?هكتار(?:ين|ات|ا)?)";
const HA_A="(?:ares?(?![a-zà-ÿ])|a(?=\\s*(?:\\d|$|[,;.)\\/-]|et\\s))|آرا?ت?|آر)";
const HA_CA="(?:ca(?![a-zà-ÿ])|centiares?(?![a-zà-ÿ])|سنتيارا?ت?|سونتيار)";
const HA_M2="(m²|m2|m[èe]tres?(?:\\s*carr[ée]s?)?|m(?![a-zà-ÿ0-9])|(?:ال)?مترا?ت?(?:\\s*مربعا?)?|م²|م2|م(?![ء-ي]))";
function haRes(field){return [
  new RegExp("(?<![a-zà-ÿ0-9.,])(?:"+HA_NUM+"\\s*)?(demi[- ]?|نصف?\\s*|ربع\\s*)?"+HA_U+"(\\s*(?:et\\s*demie?|و\\s*نصف?))?(?:"+HA_SEP+HA_D+"\\s*"+HA_A+")?(?:"+HA_SEP+HA_D+"\\s*"+HA_CA+")?(?:[\\s,]*(et\\s+|و\\s*|\\+\\s*|&\\s*)?(\\d{1,3}(?:[\\s.]\\d{3})+|\\d+(?:[.,]\\d+)?)\\s*"+HA_M2+(field?"?":"")+")?","gd"),
  new RegExp("(?<![a-zà-ÿ0-9.,])"+HA_D+"\\s*"+HA_A+"\\s*(?:et\\s*|و\\s*)?"+HA_D+"\\s*"+HA_CA+"|(?<![a-zà-ÿ0-9.,])"+HA_D+"\\s*(?:ares?(?![a-zà-ÿ])|آرات?)"+(field?"|(?<![a-zà-ÿ0-9.,])"+HA_D+"\\s*a(?![a-zà-ÿ])":""),"gd")]}
const HA_RES=[haRes(false),haRes(true)];
/* t en minuscules ; renvoie le texte où chaque contenance est remplacée par « N m² » + la liste des conversions */
function haConv(t,field){const conv=[],[r1,r2]=HA_RES[field?1:0];
  const run=(re,fn)=>{let o="",last=0,m;re.lastIndex=0;while((m=re.exec(t))){const r=fn(m);if(!r)continue;
    o+=t.slice(last,m.index)+" \u0001";conv.push({src:t.slice(m.index,r.end).trim().replace(/(?:[\s,;+&]|\bet|و)+$/,""),v:r.v});o+=String(Math.round(r.v*100)/100)+" m² ";last=r.end;re.lastIndex=Math.max(re.lastIndex,r.end)}
    t=o+t.slice(last)};
  run(r1,m=>{const [all,n,pre,u,dem,ar,ca,cn,mn]=m,bare=n==null,end0=m.index+all.length;
    if(bare){if(!/^(?:hectares?|(?:ال)?هكتار)/.test(u)&&!/هكتارين$/.test(u))return null;if(/^ال/.test(u))return null;
      if(/(?:\/|\bpar|\ble|\bl'|\bd'|\bdu|\bau|\bchaque|\bdh|كل|لل|درهم|مليون)\s*$/.test(t.slice(Math.max(0,m.index-14),m.index)))return null}
    let ha=bare?1:(HA_W[n]!=null?HA_W[n]:toNum(n));if(/ين$/.test(u))ha=bare?2:ha*2;if(pre)ha*=/^ربع/.test(pre)?.25:.5;if(dem)ha+=.5;
    if(!(ha>0))return null;let v=ha*1e4+(ar?toNum(ar)*100:0)+(ca?toNum(ca):0),end=end0;
    if(mn!=null){const mv=toNum(mn),cut=m.indices[cn!=null?7:8][0];
      if(!field&&(cn==null&&(mv>=1e4||/^\s*(?:de\s+|d')?(?:construit|couvert|b[âa]ti|habitable|plancher|rdc|mezz|soussol|cave|terrass|[ée]tage|niveau|bureau|local|magasin|hangar)/.test(t.slice(end0,end0+24)))))end=cut;
      else v+=mv}
    return {v,end}});
  run(r2,m=>{const g=m.slice(1).map(x=>x==null?null:toNum(x));let v=0;
    if(g[0]!=null)v=g[0]*100+g[1];else if(g[2]!=null)v=g[2]*100;else if(g[3]!=null)v=g[3]*100;return v>0?{v,end:m.index+m[0].length}:null});
  const pos=[];t=t.replace(/\u0001/g,(x,i)=>{pos.push(i-pos.length);return ""});
  return {t,conv,pos}}
/* champ de surface : « 1 ha 50 a », « 1 ha + 5000 », « 15 a », « 2 هكتار », « 350 m² » → m² */
function surfIn(v){const s=String(v??"").trim();if(!s)return null;if(!/[a-zà-ÿء-ي+]/i.test(s))return numIn(s);
  const r=haConv(" "+s.toLowerCase().replace(/[’`]/g,"'")+" ",true);
  const rest=r.t.replace(/m²|m2|m[èe]tres?(?:\s*carr[ée]s?)?|(?:ال)?مترا?ت?(?:\s*مربعا?)?|م²|م2/g," ");
  const ns=[...rest.matchAll(/\d{1,3}(?:[\s.]\d{3})+(?:,\d+)?|\d+(?:[.,]\d+)?/g)].map(x=>toNum(x[0])).filter(x=>isFinite(x));
  if(!ns.length)return null;return Math.round(ns.reduce((a,b)=>a+b,0)*100)/100}
const SURF_KEYS=new Set(["sMain","sMezz","sCave","sTerr","sLand","surface","sConst","sTerrain","sTerr2","sBati"]);
function haTxt(v){if(!(v>=1e4))return "";const ha=Math.floor(v/1e4),a=Math.floor((v-ha*1e4)/100),ca=Math.round(v-ha*1e4-a*100);
  return ha+" ha"+(a?" "+a+" a":"")+(ca?" "+ca+" ca":"")}

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
let S={cm:.5,cc:.5,ct:.3,valid:12,nego:10};
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
const ITEM_KEYS=["region","province","commune","cp","niveaux","bati","facades","vue","orient","envCom","envUrb","ascenseur","parking","verifiedBy","verifiedAt","tf","date","tx","type","price","surface","sMain","sMezz","sCave","sTerr","sLand","basis","avance","loyer","city","district","address","gps","floor","rooms","state","standing","age","nature","status","source","link","code","dossier","notes","photos","createdAt","updatedAt"];
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
const PHONE1=/(?:\+|00)?212[\s.\-]?(?:\(0\)|0)?[\s.\-]?[5-8](?:[\s.\-]?\d){8}/g,PHONE2=/(^|[^\d.,])0[5-8](?:[\s.\-]?\d){7,8}(?!\d)/g,PHONE3=/((?:contact|t[ée]l[ée]?phone|t[ée]l|gsm|whatsapp|num[ée]ro)\s*:?\s*)(?:\+?212|0)[\d\s.\-]{6,13}\d/gi;
const NAME_STOP=new Set(["agence","immo","immobilier","immobiliere","immobilière","promoteur","syndic","gardien","propriétaire","proprietaire","courtier","samsar","contact","bureau","societe","société"]);
function maskNotes(t,name){t=String(t||"").replace(PHONE3,"$1[tél. privé]").replace(PHONE1,"[tél. privé]").replace(PHONE2,"$1[tél. privé]");
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
  const pub={...x,notes:maskNotes(maskNotes(maskNotes(x.notes,o.contactName),o.vendeur),o.acheteur),createdBy,byName:base?base.byName||"":ME.name,ref:base?.ref||o.ref||""};
  const priv={contactName:String(o.contactName||""),contactTel:String(o.contactTel||""),vendeur:String(o.vendeur||""),acheteur:String(o.acheteur||""),notes:x.notes,createdBy};
  return {pub,priv}}
function rebuild(){items=Object.keys(PUB).map(id=>{const p=PUB[id],q=PRIV[id];
  return q?{...p,id,contactName:q.contactName||"",contactTel:q.contactTel||"",vendeur:q.vendeur||"",acheteur:q.acheteur||"",notes:q.notes!=null&&q.notes!==""?q.notes:(p.notes||"")}:{...p,id,contactName:"",contactTel:""}})}
let refsChecked=false;
function scheduleRender(){clearTimeout(mergeT);mergeT=setTimeout(()=>{rebuild();loaded=true;render();
  if(!refsChecked&&!syncMeta.fromCache&&online){refsChecked=true;(isOwner()?ensureCounter():Promise.resolve()).then(fixRefs);if(isOwner())migrateSousSol()}updateAcct();if($("#view").open&&viewing){const c=items.find(x=>x.id===viewing.id);if(c)viewing=c}if($("#etude").open)renderEtude();if(curMod==="admin")renderAdmin()},60)}
function stopListen(){unsubs.forEach(u=>{try{u()}catch(e){}});unsubs=[];stopAdmin();stopVisites()}
function listenErr(e){if(e?.code==="permission-denied"){toast("Accès refusé par le serveur : reconnecte-toi.");$("#status").textContent="Ton accès a changé : recharge la page."}else $("#status").textContent="Connexion interrompue : les données affichées viennent de cet appareil."}
function listen(){
  stopListen();Object.keys(PUB).forEach(k=>delete PUB[k]);Object.keys(PRIV).forEach(k=>delete PRIV[k]);
  const tq=isOwner()||ME.temScope!=="own"?tCol():tCol().where("createdBy","==",ME.uid);
  unsubs.push(tq.onSnapshot({includeMetadataChanges:true},s=>{
    s.docChanges().forEach(ch=>{if(ch.type==="removed")delete PUB[ch.doc.id];else PUB[ch.doc.id]=ch.doc.data()});
    syncMeta={fromCache:s.metadata.fromCache,hasPendingWrites:s.metadata.hasPendingWrites};scheduleRender()},listenErr));
  if(canAdd()){const q=isOwner()?pCol():pCol().where("createdBy","==",ME.uid);
    unsubs.push(q.onSnapshot(s=>{s.docChanges().forEach(ch=>{if(ch.type==="removed")delete PRIV[ch.doc.id];else PRIV[ch.doc.id]=ch.doc.data()});scheduleRender()},()=>{}))}
  unsubs.push(fdb.collection("etudes").where("createdBy","==",ME.uid).onSnapshot(s=>{etudes=s.docs.map(d=>({...d.data(),id:d.id}));if($("#etudesDlg").open)renderEtudes()},()=>{}));
  listenVisites();
  unsubs.push(fdb.doc("config/settings").onSnapshot(d=>{if(d.exists){const x=d.data();for(const k in S)if(x[k]!=null&&isFinite(+x[k]))S[k]=+x[k];scheduleRender()}},()=>{}));
}
/* une seule fois : le sous-sol compte pour moitié, comme la mezzanine ; recalcule la surface pondérée des anciens témoins */
let migSS=false;
async function migrateSousSol(){if(migSS||!isOwner()||!online)return;migSS=true;
  try{const ref=fdb.doc("config/settings"),d=await ref.get({source:"server"}),x=d.exists?d.data():{};if(x.v2)return;
    const old=x.cc!=null&&isFinite(+x.cc)?+x.cc:.33,cc=old===.33?.5:old,cm=x.cm!=null?+x.cm:S.cm,ct=x.ct!=null?+x.ct:S.ct;S.cc=cc;
    const f=(c,k)=>Math.round(((c.sMain||0)+cm*(c.sMezz||0)+k*(c.sCave||0)+ct*(c.sTerr||0))*100)/100;
    const b=fdb.batch();let n=0;
    items.forEach(c=>{if(!(c.sCave>0)||!(c.surface>0)||basisOf(c)==="terrain"||cc===old)return;if(Math.abs(f(c,old)-c.surface)<.02){b.update(tCol().doc(c.id),{surface:f(c,cc)});n++}});
    b.set(ref,{cm,cc,ct,valid:x.valid!=null?+x.valid:S.valid,nego:x.nego!=null?+x.nego:S.nego,v2:1});
    await b.commit();if(n)toast(n+" témoin"+(n>1?"s":"")+" avec sous-sol recalculé"+(n>1?"s":"")+" : sous-sol compté à 50 %.")}
  catch(e){migSS=false}}
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
  async saveSettings(s){if(!isOwner())throw {code:"permission-denied"};const o={};["cm","cc","ct","valid","nego"].forEach(k=>o[k]=+s[k]);o.v2=1;return commitSoft(fdb.doc("config/settings").set(o))},
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
  fillSelect($("#f_state"),STATES,"—");fillSelect($("#f_standing"),STANDINGS,"—");fillSelect($("#fStanding"),STANDINGS,"Tous");fillSelect($("#fState"),STATES,"Tous");fillSelect($("#f_source"),SOURCES,"—");
  fillSelect($("#e_type"),TYPES,"Tous types");fillSelect($("#e_tx"),TXS);
  TXS.forEach(t=>$("#txSeg").append(h("button",{type:"button","data-v":t,text:t})));
}

/* ===================== filtres et rendu ===================== */
const FIDS=["fLmin","fLmax","fAmin","fAmax","fUntil","fStanding","fState","fFacades","fBy","fType","fTx","fStatus","fNature","fCity","fDistrict","fPmin","fPmax","fSmin","fSmax","fUmin","fUmax","fSince","near"];
function activeFilters(){let n=FIDS.filter(i=>$("#"+i).value.trim()).length;if($("#fPhotos").checked)n++;if($("#fRecent").checked)n++;return n}
function filtered(){
  const q=$("#q").value.trim().toLowerCase();
  const ft=$("#fType").value,fx=$("#fTx").value,fs=$("#fStatus").value,fn=$("#fNature").value,fc=$("#fCity").value,fd=$("#fDistrict").value.trim().toLowerCase();
  const pmin=numIn($("#fPmin").value),pmax=numIn($("#fPmax").value),smin=surfIn($("#fSmin").value),smax=surfIn($("#fSmax").value),umin=numIn($("#fUmin").value),umax=numIn($("#fUmax").value);
  const lmin=surfIn($("#fLmin").value),lmax=surfIn($("#fLmax").value),amin=numIn($("#fAmin").value),amax=numIn($("#fAmax").value),until=$("#fUntil").value,fst=$("#fStanding").value,fet=$("#fState").value,ffa=$("#fFacades").value;
  const fby=$("#fBy").value,since=$("#fSince").value,ph=$("#fPhotos").checked,rec=$("#fRecent").checked;
  let r=items.filter(c=>{
    if(natView==="tr"&&c.nature!=="Transaction")return false;if(natView==="off"&&c.nature==="Transaction")return false;
    if(fby&&c.createdBy!==fby)return false;if(ft&&c.type!==ft)return false;if(fx&&c.tx!==fx)return false;
    if(fs==="__none"?!!c.status:(fs&&c.status!==fs))return false;
    if(fn&&c.nature!==fn)return false;if(fc&&c.city!==fc)return false;
    if(fd&&!(c.district||"").toLowerCase().includes(fd))return false;
    if(pmin!=null&&!(c.price>=pmin))return false;if(pmax!=null&&!(c.price<=pmax))return false;
    if(smin!=null&&!(c.surface>=smin))return false;if(smax!=null&&!(c.surface<=smax))return false;
    const u=ppmOf(c);if(umin!=null&&!(u>=umin))return false;if(umax!=null&&!(u<=umax))return false;
    if(since&&!(c.date&&c.date>=since))return false;if(until&&!(c.date&&c.date<=until))return false;
    if(lmin!=null&&!(c.sLand>=lmin))return false;if(lmax!=null&&!(c.sLand<=lmax))return false;
    if(amin!=null&&!(c.age>=amin))return false;if(amax!=null&&!(c.age<=amax))return false;
    if(fst&&c.standing!==fst)return false;if(fet&&c.state!==fet)return false;if(ffa&&c.facades!==ffa)return false;
    if(zone&&!inZone(gpsOf(c)))return false;
    if(ph&&!(c.photos&&c.photos.length))return false;
    if(rec&&isOld(c))return false;
    if(q&&![c.commune,c.province,c.niveaux,c.facades,c.vue,c.tf,c.vendeur,c.acheteur,c.district,c.address,c.city,c.contactName,c.contactTel,c.notes,c.type,c.ref,c.code,c.dossier,c.floor,c.source].join(" ").toLowerCase().includes(q))return false;
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
  $("#count").textContent=items.length?fmt(items.length)+(items.length>1?" témoins":" témoin"):(loaded?"Aucun témoin":"Chargement…");setNb("#nbTem",items.length);
  const r=filtered();
  renderKpis(r);
  $$("#views button").forEach(b=>b.classList.toggle("on",b.dataset.v===view));
  $("#list").hidden=view!=="list";$("#tblWrap").hidden=view!=="table";$("#mapWrap").hidden=view!=="map";$("#kpis").hidden=view==="map"&&window.innerWidth<700;
  fillAuthorSel("#fBy",items);natCounts();zoneUi(r.length);syncTabs();if(view==="list")renderCards(r);else if(view==="table")renderTable(r);else{$("#moreBtn").hidden=true;drawMap(r)}
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
  if(c.surface){const land=basisOf(c)==="terrain"&&c.sLand,mix=!land&&(c.sMezz||c.sCave||c.sTerr),real=mix?(c.sMain||0)+(c.sMezz||0)+(c.sCave||0)+(c.sTerr||0):0;
    parts.push(h("span",null,mix?fmtS(real)+" m² réels · "+fmtS(c.surface)+" m² pond.":fmtS(c.surface)+" m²"+(land?" terrain":"")+(c.surface>=1e4?" ("+haTxt(c.surface)+")":"")))}
  if(u)parts.push(h("b",{text:" · "+fmt(u)+" "+unitSuf(c.tx)}));
  return h("div",{class:"ppm"},parts.length?parts:"Surface non renseignée");
}
function renderCards(r){
  const L=$("#list");L.innerHTML="";
  if(!r.length){L.append(h("div",{class:"empty",text:items.length?"Aucun témoin ne correspond à ces critères.":(loaded?"Aucun témoin pour l’instant. Appuie sur « Nouveau témoin » ou colle une note pour enregistrer le premier.":"Chargement de tes témoins…")}));$("#moreBtn").hidden=true;return}
  const n=Math.min(r.length,Math.max(shown,PAGE_CARDS));shown=n;
  r.slice(0,n).forEach(c=>{
    const on=sel.has(c.id),g=gpsOf(c),tx=c.tx||"Vente";
    const ph=h("div",{class:"ph"});
    if(c.photos?.length){ph.append(h("img",{src:photoUrl(c.photos[0],1),"data-pid":c.photos[0].t||c.photos[0].id,alt:"",loading:"lazy"}));if(c.photos.length>1)ph.append(h("span",{class:"n"},ic("camera",14),String(c.photos.length)))}
    else if(g)ph.append(satThumb(g));
    else ph.append(h("div",{class:"noph"},ic("building",30),h("span",{text:c.type||"Sans photo"})));
    ph.append(h("span",{class:"txb tx-"+tx,text:tx}));
    const cb=h("input",{type:"checkbox","aria-label":"Ajouter à l’étude de marché"});cb.checked=on;cb.onchange=()=>toggleSel(c.id);
    const pick=h("label",{class:"pick",title:"Ajouter à l’étude de marché"},cb,ic("check",16));
    const loc=[c.district,c.city].filter(Boolean).join(", ")||c.address||"Emplacement non renseigné";
    const bd=h("div",{class:"bd"},
      h("div",{class:"top"},h("div",{class:"pills"},c.nature==="Transaction"?h("span",{class:"pill st-tr",text:"Transaction"}):null,c.status?h("span",{class:"pill "+statusClass(c.status),text:c.status}):h("span",{class:"pill",text:"Sans statut"}),isOld(c)?h("span",{class:"pill st-old",text:"Ancien"}):null),pick),
      h("div",{class:"date",text:[c.date?(c.nature==="Transaction"?"Vendu le ":"")+new Date(c.date).toLocaleDateString("fr-FR"):"Sans date",c.nature&&c.nature!=="Offre"&&c.nature!=="Transaction"?c.nature:"",c.source,c.createdBy&&c.createdBy!==ME.uid?"par "+(c.byName||"un membre"):""].filter(Boolean).join(" · ")}),
      h("div",{class:"kv"},h("span",{class:"k",text:"Réf."}),h("span",{class:"v num",text:c.ref||"—"}),h("span",{class:"sub",text:[c.type||"Type non renseigné",c.floor,c.niveaux?"imm. "+c.niveaux:"",c.facades==="Angle"?"angle":"",c.tf?"TF "+c.tf:""].filter(Boolean).join(" · ")})),
      h("div",{class:"price"},fmt(c.price),h("small",{text:priceSuf(c.tx)})),
      surfLine(c),
      c._d!=null?h("div",{class:"dist"},ic("pin",14),"à "+(c._d>=1000?(c._d/1000).toFixed(2).replace(".",",")+" km":Math.round(c._d)+" m")):null,
      h("div",{class:"kv loc"},h("span",{class:"k",text:"Localisation"}),h("span",{class:"v",text:loc})),
      h("div",{class:"acts"},canEditItem(c)?h("button",{class:"btn sm",type:"button",onclick:e=>{e.stopPropagation();openForm(c)}},ic("edit",14),"Modifier"):null,
        g?h("button",{class:"btn sm",type:"button",onclick:e=>{e.stopPropagation();showOnMap(c)}},ic("pin",14),"Carte"):null));
    L.append(h("article",{class:"card"+(on?" sel":""),tabindex:"0","aria-label":[tx,c.type,c.ref,loc].filter(Boolean).join(", "),
      onclick:e=>{if(e.target.closest("button,label,input,a"))return;openView(c)},onkeydown:e=>{if(e.key==="Enter"&&e.target===e.currentTarget)openView(c)}},ph,bd));
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
  $("#vEdit").hidden=!canEditItem(c);$("#vVerify").hidden=!canEditItem(c)||c.status==="Vérifié";$("#vSel").textContent=sel.has(c.id)?"Retirer de l’étude":"Ajouter à l’étude";
  const B=$("#vBody");B.innerHTML="";
  const dl=rows=>{const d=h("dl",{class:"dl"});rows.filter(r=>r[1]!=null&&r[1]!==""&&r[1]!=="—").forEach(([k,v])=>d.append(h("dt",{text:k}),h("dd",null,v)));return d};
  const u=ppmOf(c);
  const sdet=[c.sMain?"principale "+fmtS(c.sMain):"",c.sMezz?"mezzanine "+fmtS(c.sMezz):"",c.sCave?"cave "+fmtS(c.sCave):"",c.sTerr?"terrasse "+fmtS(c.sTerr):"",c.sLand?"terrain "+fmtS(c.sLand)+(c.sLand>=1e4?" ("+haTxt(c.sLand)+")":""):""].filter(Boolean).join(" · ");
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
      ["Ville",c.city],["Quartier",c.district],["Commune",c.commune],["Province",c.province],["Région",c.region],["Code postal",c.cp],["Adresse",c.address],["Étage",c.floor],
      ["GPS",g?h("span",null,h("span",{class:"num",text:gpsStr(g)}),h("a",{class:"btn sm copy",href:"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(gpsStr(g).replace(/\s/g,"")),target:"_blank",rel:"noopener",text:"Google Maps"}),h("a",{class:"btn sm copy",href:"https://www.google.com/maps/dir/?api=1&destination="+g[0]+","+g[1],target:"_blank",rel:"noopener",text:"Itinéraire"}),h("button",{class:"btn sm copy",type:"button",text:"Sur la carte",onclick:()=>{$("#view").close();showOnMap(c)}})):null]])),
    h("section",null,h("h3",{class:"vh",text:"Bien"}),dl([["Immeuble",c.bati],["Niveaux",c.niveaux],["Façades",c.facades],["Donne sur",c.vue],["Orientation",c.orient],["Env. commercial",c.envCom],["Env. urbain",c.envUrb],["Ascenseur",c.ascenseur],["Parking",c.parking],["Pièces",c.rooms],["État",c.state],["Standing",c.standing],["Âge",c.age?c.age+" ans":null]])),
    h("section",null,h("h3",{class:"vh",text:"Source et suivi"}),dl([
      ["Nature",c.nature],["Titre foncier",c.tf?h("b",{class:"num",text:c.tf}):null],["Vendeur",c.vendeur],["Acheteur",c.acheteur],["Statut",c.status?h("span",{class:"chip "+statusClass(c.status),text:c.status}):null],["Canal",c.source],["Contact",c.contactName],["Téléphone",tel],
      ["Annonce",c.link?h("a",{href:c.link,target:"_blank",rel:"noopener",text:"Ouvrir l’annonce"}):null],
      ["Référence",c.ref?h("b",{class:"num",text:c.ref}):null],["Code externe",c.code],["Dossier",c.dossier],["Ajouté par",c.byName],["Vérifié par",c.verifiedBy?c.verifiedBy+(c.verifiedAt?" le "+new Date(c.verifiedAt).toLocaleDateString("fr-FR"):""):null],
      [c.nature==="Transaction"?"Vendu le":"Relevé le",c.date?new Date(c.date).toLocaleDateString("fr-FR")+(isOld(c)?" (ancien)":""):"Sans date"],
      ["Modifié le",c.updatedAt?new Date(c.updatedAt).toLocaleDateString("fr-FR"):null]]))));
  if(c.notes)B.append(h("section",null,h("h3",{class:"vh",text:"Observations"}),h("p",{class:"pre",text:c.notes})));
  if(c.photos?.length)B.append(h("section",null,h("h3",{class:"vh",text:"Photos"}),h("div",{class:"gallery"},c.photos.map(p=>h("img",{src:photoUrl(p),"data-pid":p.id,alt:"",loading:"lazy"})))));
  if(!$("#view").open)$("#view").showModal();
}
$("#vEdit").onclick=()=>{$("#view").close();openForm(viewing)};
$("#vVerify").onclick=async e=>{const c=viewing;if(!c)return;const b=e.currentTarget;b.disabled=true;
  try{const st=await saveItem({...c,status:"Vérifié",verifiedBy:ME.name||ME.email||"",verifiedAt:new Date().toISOString().slice(0,10),updatedAt:Date.now()});$("#view").close();toast(st==="queued"?"Vérification enregistrée sur l’appareil : envoi au retour du réseau.":"Témoin marqué vérifié")}
  catch(er){toast(errMsg(er,"Impossible de marquer ce témoin comme vérifié."))}b.disabled=false};
function summaryText(c){const txl=c.tx==="Location"?"à louer":c.tx==="Pas-de-porte"?"en pas-de-porte":"à vendre";
  const ml=LAND_TYPES.includes(c.type)?"construit":(c.type==="Local commercial"?"RDC":"surface");
  const sp=[c.sMain?ml+" "+fmtS(c.sMain)+" m²":"",c.sMezz?"mezzanine "+fmtS(c.sMezz)+" m²":"",c.sCave?"sous-sol "+fmtS(c.sCave)+" m²":"",c.sTerr?"terrasse "+fmtS(c.sTerr)+" m²":"",c.sLand?"terrain "+fmtS(c.sLand)+" m²"+(c.sLand>=1e4?" ("+haTxt(c.sLand)+")":""):""].filter(Boolean);
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
const TXT=["region","province","commune","cp","niveaux","bati","facades","vue","orient","envCom","envUrb","ascenseur","parking","tf","vendeur","acheteur","type","nature","status","date","city","district","address","gps","floor","rooms","state","standing","source","contactName","contactTel","link","code","dossier","notes"];
const NUMS=["sMain","sMezz","sCave","sTerr","sLand","price","avance","loyer","age"];
function setTx(v){tx=v;$$("#txSeg button").forEach(b=>b.classList.toggle("on",b.dataset.v===v));
  $("#priceLbl").textContent=v==="Location"?"Loyer mensuel":v==="Pas-de-porte"?"Montant du pas-de-porte":"Prix demandé";
  $("#ppmLbl").textContent=v==="Location"?"Loyer au m² / mois":"Prix au m²";if(typeof updTrans==="function")updTrans();
  $("#avanceL").hidden=v!=="Location";$("#loyerL").hidden=v==="Location";
  $("#loyerLbl").textContent=v==="Vente"?"Loyer actuel si occupé":"Loyer mensuel";
  updCalc()}
function setBasis(v){basis=v;$$("#basisSeg button").forEach(b=>b.classList.toggle("on",b.dataset.v===v));updCalc(true)}
$("#txSeg").addEventListener("click",e=>{const b=e.target.closest("button");if(b)setTx(b.dataset.v)});
$("#basisSeg").addEventListener("click",e=>{const b=e.target.closest("button");if(b){basisTouched=true;setBasis(b.dataset.v)}});
$("#f_type").onchange=()=>{if(!basisTouched)setBasis(basisDefault($("#f_type").value))};
function fv(k){const e=$("#f_"+k);if(SURF_KEYS.has(k))return surfIn(e.value);if(PRICE_KEYS.has(k)&&/[a-zà-ÿء-ي]/i.test(e.value)){const r=priceIn(e.value);return r?r.v:null}return numIn(e.value)}
function pondere(){const m=fv("sMain"),z=fv("sMezz"),c=fv("sCave"),t=fv("sTerr");if(m==null&&z==null&&c==null&&t==null)return null;return Math.round(((m||0)+S.cm*(z||0)+S.cc*(c||0)+S.ct*(t||0))*100)/100}
function retained(){const p=pondere(),l=fv("sLand");return basis==="terrain"?(l??p):(p??l)}
function updCalc(fromSurface){
  const p=pondere(),l=fv("sLand"),r=retained();
  const parts=[];
  if(p!=null){const det=[fv("sMain")?plain(fv("sMain")):"",fv("sMezz")?plain(fv("sMezz"))+" × "+plain(S.cm):"",fv("sCave")?plain(fv("sCave"))+" × "+plain(S.cc):"",fv("sTerr")?plain(fv("sTerr"))+" × "+plain(S.ct):""].filter(Boolean).join(" + ");parts.push("Bâti pondéré : "+fmtS(p)+" m² ("+det+")")}
  const rl=["sMain","sMezz","sCave","sTerr"].map(fv).filter(v=>v!=null);if(rl.length>1)parts.unshift("Surface réelle : "+fmtS(rl.reduce((a,b)=>a+b,0))+" m²");
  if(l!=null)parts.push("Terrain : "+fmtS(l)+" m²"+(l>=1e4?" ("+haTxt(l)+")":""));
  $("#surfCalc").replaceChildren(parts.length?h("span",null,parts.join(" · "),h("br"),h("b",{text:"Surface retenue pour le prix au m² : "+(r!=null?fmtS(r)+" m²":"—")})):"Renseigne au moins une surface.");
  if(fromSurface){if(lastEdited==="ppm"&&fv("ppm")!=null&&r)$("#f_price").value=plain(Math.round(fv("ppm")*r));else if(fv("price")!=null&&r)$("#f_ppm").value=plain(Math.round(fv("price")/r))}
  const pr=fv("price");
  $("#priceCalc").textContent=pr!=null?(fmt(pr)+priceSuf(tx)+(r?" · "+fmt(pr/r)+" "+unitSuf(tx):"")+(tx==="Location"&&fv("avance")?" · avance "+fmt(fv("avance"))+" DH":"")+(tx!=="Location"&&fv("loyer")?" · loyer "+fmt(fv("loyer"))+" DH/mois":"")):"Indique le prix total ou le prix au m².";
  const u0=pr!=null&&r?pr/r:null;
  if(u0&&basis!=="terrain"&&p!=null&&(fv("sMezz")||fv("sCave")||fv("sTerr"))){const L=[["sMain","Principale",1],["sMezz","Mezzanine",S.cm],["sCave","Sous-sol",S.cc],["sTerr","Terrasse",S.ct]].filter(([k])=>fv(k));
    $("#priceCalc").append(h("br"),h("small",{text:L.map(([k,n,cf])=>n+" "+fmtS(fv(k))+" m² × "+fmt(u0*cf)+" = "+fmt(fv(k)*u0*cf)).join(" · ")}))}
  const g=coordsFrom($("#f_gps").value);const a=$("#gpsCheck");a.hidden=!g;if(g)a.href=satUrl(g);
}
["sMain","sMezz","sCave","sTerr","sLand"].forEach(k=>$("#f_"+k).addEventListener("input",()=>updCalc(true)));
$("#f_price").addEventListener("input",()=>{lastEdited="price";const r=retained(),p=fv("price");$("#f_ppm").value=p!=null&&r?plain(Math.round(p/r)):"";updCalc()});
$("#f_ppm").addEventListener("input",()=>{lastEdited="ppm";const r=retained(),u=fv("ppm");if(u!=null&&r)$("#f_price").value=plain(Math.round(u*r));updCalc()});
["avance","loyer"].forEach(k=>$("#f_"+k).addEventListener("input",()=>updCalc()));
$("#f_gps").addEventListener("input",()=>{const g=coordsFrom($("#f_gps").value);if(g&&!$("#f_city").value.trim()){const c=guessCity(g);if(c)$("#f_city").value=c}updCalc()});
NUMS.concat(["ppm"]).forEach(k=>$("#f_"+k).addEventListener("blur",e=>{const raw=e.target.value,sf=SURF_KEYS.has(k);if((k==="price"||k==="ppm")&&/[a-zà-ÿء-ي\/]/i.test(raw)&&priceSmart(k,raw))return;const n=sf?surfIn(raw):numIn(raw);if(k==="price"&&n!=null&&n>=200000&&tx==="Location"){setTx("Vente");toast(fmt(n)+" DH sans « /mois » : prix total → Vente")}if(n!=null){e.target.value=plain(n);if(sf&&/[a-zء-ي+]/i.test(raw)&&!/^\s*[\d\s.,]+\s*(?:m²|m2|m)?\s*$/i.test(raw)){toast("« "+raw.trim()+" » = "+fmtS(n)+" m²");updCalc(true)}}}));

function openForm(c,preset){
  editing=c||null;delArmed=false;dupOk=false;$("#dupBox").hidden=true;$("#delBtn").classList.remove("arm");$("#delBtn").textContent="Supprimer";$("#saveBtn").textContent="Enregistrer";
  $("#dlgTitle").textContent=c?"Modifier le témoin":"Nouveau témoin";
  TXT.forEach(k=>{const e=$("#f_"+k);if(e.tagName==="SELECT")ensureOpt(e,c?.[k]);e.value=c?.[k]??""});
  NUMS.forEach(k=>$("#f_"+k).value=c?.[k]!=null?plain(c[k]):"");
  if(c&&[c.sMain,c.sMezz,c.sCave,c.sTerr,c.sLand].every(v=>v==null)&&c.surface){if(basisOf(c)==="terrain")$("#f_sLand").value=plain(c.surface);else $("#f_sMain").value=plain(c.surface)}
  if(!c){$("#f_date").value=new Date().toISOString().slice(0,10);$("#f_type").value="Appartement";$("#f_nature").value="Offre";$("#f_status").value="À vérifier"}
  if(!$("#f_type").value)$("#f_type").value="Autre";
  basisTouched=!!c?.basis;basis=c?basisOf(c):basisDefault($("#f_type").value);$$("#basisSeg button").forEach(b=>b.classList.toggle("on",b.dataset.v===basis));
  photos=c?.photos?[...c.photos]:[];renderThumbs();
  if(!c&&natView==="tr"){$("#f_nature").value="Transaction";ensureOpt($("#f_source"),"Conservation foncière");$("#f_source").value="Conservation foncière";$("#f_status").value="Vérifié";$("#f_date").value="";$("#dlgTitle").textContent="Nouvelle transaction"}
  lastEdited="price";setTx(c?.tx||"Vente");updTrans();
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
  o.verifiedBy=editing?.verifiedBy||"";o.verifiedAt=editing?.verifiedAt||"";
  if(o.status==="Vérifié"&&(!editing||editing.status!=="Vérifié"||!o.verifiedBy)){o.verifiedBy=ME.name||ME.email||"";o.verifiedAt=new Date().toISOString().slice(0,10)}
  if(o.status!=="Vérifié"){o.verifiedBy="";o.verifiedAt=""}
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
const NUMRE="(?<![a-zà-ÿ0-9²])(\\d{1,4}(?:[\\s.,]\\d{3}(?!\\d))+(?:[.,]\\d+)?|\\d+(?:[.,]\\d+)?)";
const UNITRE="(mdh|m\\s*dh|millions?\\s*(?:de\\s*)?(?:dh|dirhams?)|m[ei]l+[iy]?ons?|mlyon|mlion|millions?|مليون|dhs?|dirhams?|mad|درهم|دراهم)?";
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
  t=t.replace(/(\d+(?:[.,]\d+)?)\s*(?:k|mille|alf|ألف|الف|آلاف)(?![a-zà-ÿء-ي])/g,(x,n)=>" "+Math.round(toNum(n)*1000)+" ")
    .replace(/rez[- ]?de[- ]?chauss[ée]+e?s?|\br\.d\.c\b\.?|الطابق الأرضي|(?:أ|ا)رضي(?![ء-ي])/g," rdc ")
    .replace(/\b(?:sous?[- ]?|sur-?|su)p[ae]nte?s?\b|(?:ال)?(?:سو|صو)ب(?:و|ا)نت/g," mezz ")
    .replace(/sous[- ]?sols?|\bs\s*\/\s*sol\b|\bs-sol\b|\bss[- ]sol\b|\bssol\b|الطابق السفلي|تحت (?:أ|ا)رضي|تحت الأرض|قبو/g," soussol ")
    .replace(/(?:ال)?ميزانين|ميزانيل|(?:ال)?سدة/g," mezz ")
    .replace(/\s+/g," ");
  const HAC=haConv(t,false);t=HAC.t;HAC.conv.forEach(c=>out.notes.push("« "+c.src+" » converti en "+fmtS(c.v)+" m²."));
  const T=[[/\bvilla|demi[- ]villa|فيلا/,"Villa"],[/\bimmeuble\b/,"Immeuble"],[/\bplateau/,"Plateau de bureaux"],[/\bbureaux?\b/,"Bureau"],[/\bstudio|\bappart|\bapp\b|\bapprt|\bduplex|شقة/,"Appartement"],[/\blocal\b|\blocaux\b|\bmagasin|\bcommerce\b|\bboutique|\bmahal\b|محل/,"Local commercial"],[/\bd[ée]p[ôo]t|\bhangar|\bentrep[ôo]t/,"Entrepôt / dépôt"],[/\busine\b/,"Usine"],[/\bmaison\b|\bdar\b|دار /,"Maison"],[/\briad\b/,"Riad"],[/\bterrain|\blot\b|\bparcelle|\bferme\b|\bhectare|أرض|ارض|إرض|بقعة|بقعه|فلاحي/,"Terrain"]];
  out.type=(T.find(([r])=>r.test(t))||[])[1]||null;if(!out.type&&HAC.conv.length)out.type="Terrain";
  const sar=/\b(sarout|sarrout|sarot|saroute|pas[- ]de[- ]porte|hlaou?ane|hlawan|droit au bail|fonds? de commerce)\b|ساروت/.test(t);
  const rent=/(à|a)\s*lou(er|é|e)\b|\blou(er|é)\b|\blocation\b|\bloyer\b|par\s*mois|\/\s*mois|\bmensuel|\bkra\b|\bkira\b|lkra|للكراء|كراء/.test(t);
  const sale=/vendre|\bvente\b|\bvendue?s?\b|\bbi3\b|lbi3|للبيع/.test(t);
  out.tx=sar?"Pas-de-porte":(rent&&!sale?"Location":"Vente");
  /* surfaces : chaque nombre (avec m² ou collé à un mot de niveau) reçoit le mot de niveau le plus proche */
  const LAB=[["sMezz",/^(mez|mzz|mzn$|mz$)/],["sCave",/^(cave|soussol|sous$|ss$|soubassement|sbt$)/],["sTerr",/^(terrass|terass|trs$)/],["sLand",/^(terrain|tn$|tf$|lot$|parcelle|assiette)/],["sMain",/^(rdc|habitable|construit|bâti|bati|plancher|utile|sh$|sc$|sca$|shon$|principal|plain$)/],["tot",/^(total|totale|globale?)$/]];
  const lab=w=>{w=(w||"").replace(/[^a-zàâçéèêëîïôûùüÿœ]/g,"");if(!w)return null;const f=LAB.find(([,r])=>r.test(w));return f?f[0]:null};
  const WD=[...t.matchAll(/[a-zàâçéèêëîïôûùüÿœ]+/g)].map(x=>{const s=x.index,e=s+x[0].length,aft=t.slice(e),bf=t.slice(Math.max(0,s-14),s);
    return {s,e,k:lab(x[0]),colon:/^\s*:/.test(aft),drop:/^\s*:?\s*(?:oui|non)\b/.test(aft)||/(?:\bsans|\bpas\s*de|\bnon|\baucune?|[ée]tage\s*:?|niveau\s*:?)\s*$/.test(bf)}}).filter(w=>w.k&&!w.drop);
  const STOP=/^(dhs?|mdh|mad|dirhams?|درهم|دراهم|mois|ans?$|ch$|chambres?|pi[eè]ces?|niveaux?|[ée]tages?|fa[cç]ades?|places?|m[ei]l+[iy]?ons?|millions?|mlyon|mlion|مليون|km|cm|ml|unit|bureaux?|ascenseurs?|salles?|sdb|salons?|appart|magasins?|locaux|portes?|%|x$|×)/;
  const CN=[];const nre=new RegExp(NUMRE+"\\s*(m²|m2|m[èe]tres?\\s*carr[ée]s?|m[èe]tres?|mtr|m(?![a-zà-ÿ0-9²])|(?:ال)?مترا?ت?(?:\\s*مربعا?)?|أمتار|م²|م2)?","g");let m;
  while((m=nre.exec(t))){const v=toNum(m[1]);if(!(v>0))continue;const s=m.index,strong=!!m[2],e=strong?s+m[0].length:s+m[1].length,pv=t.slice(Math.max(0,s-24),s);
    if(!strong){const nx=(t.slice(e).match(/^\s*([^\s\d]+)/)||[])[1]||"";
      if(v<10||v>=100000||STOP.test(nx)||/^[\/x×*]/.test(nx)||/[x×*+]\s*$/.test(pv.slice(-3))||(v>=1950&&v<2100&&/(?:\ben|ann[ée]e|depuis|date)\s*$/.test(pv)))continue}
    CN.push({v,s,e,strong,k:null,sub:/\bdont\b[^;]*$/.test(pv),dont:strong&&/^\s*dont\b/.test(t.slice(e))})}
  const FILL=/^\s*(?:(?:de|d'|en|au|du|des|la|le|l'|à|a|pour|sur)\s*)?$/;
  const PR=[];WD.forEach((w,wi)=>CN.forEach((c,ci)=>{let d,bef;
    if(w.e<=c.s){d=c.s-w.e;bef=0}else if(c.e<=w.s){d=w.s-c.e;bef=1}else return;
    const a=bef?c.e:w.e,b=bef?w.s:c.s,mid=t.slice(a,b);
    if(bef?(w.colon||!FILL.test(mid)):(d>28||/;/.test(mid)))return;
    if(CN.some(o=>o!==c&&o.s>=a&&o.e<=b))return;
    PR.push({d,bef,wi,ci})}));
  PR.sort((x,y)=>x.d-y.d||x.bef-y.bef);
  const match=f=>{const got=new Map(),wU=new Set();PR.forEach(p=>{if(!f(p)||got.has(p.ci)||wU.has(p.wi))return;got.set(p.ci,WD[p.wi].k);wU.add(p.wi)});return got};
  const best=[match(()=>1),match(p=>!p.bef),match(p=>p.bef)].reduce((x,y)=>y.size>x.size?y:x);
  best.forEach((k,ci)=>CN[ci].k=k);
  CN.forEach(x=>{if(!x.k&&x.dont)x.k="tot"});
  const landish=LAND_TYPES.includes(out.type);
  CN.forEach(x=>{if(HAC.pos.includes(x.s)&&(!x.k||(x.k==="sMain"&&landish)))x.k="sLand"});let tot=null;
  CN.forEach(x=>{if(x.k==="tot"){if(tot==null)tot=x.v}else if(x.k&&out[x.k]==null)out[x.k]=x.v});
  CN.forEach(x=>{if(x.k||!x.strong||x.sub)return;const k=landish?(out.sLand==null?"sLand":(out.sMain==null?"sMain":null)):(out.sMain==null?"sMain":null);if(k&&out[k]==null)out[k]=x.v});
  if(tot!=null&&out.sMain==null&&out.sLand==null){const oth=(out.sMezz||0)+(out.sCave||0)+(out.sTerr||0);
    if(!oth){if(landish)out.sLand=tot;else out.sMain=tot}
    else if(tot>oth){out.sMain=Math.round((tot-oth)*100)/100;out.notes.push("Surface principale déduite : total "+fmt(tot)+" m² moins les autres niveaux (à vérifier).")}}
  const cm=t.match(/(?:construit|b[âa]ti|couvert)\s*:?\s*(\d+(?:[.,]\d+)?)/);if(cm&&out.sMain==null)out.sMain=toNum(cm[1]);
  const tm=t.match(/(?:terrain|superficie terrain)\s*:?\s*(\d+(?:[.,]\d+)?)/);if(tm&&out.sLand==null)out.sLand=toNum(tm[1]);
  const sm=t.match(/(?:superficie|surface|sup)\s*:?\s*(\d+(?:[.,]\d+)?)/);if(sm&&out.sMain==null&&out.sLand==null){if(landish)out.sLand=toNum(sm[1]);else out.sMain=toNum(sm[1])}
  const per=t.match(new RegExp(NUMRE+"\\s*(?:dhs?|dirhams?|درهم|دراهم)?\\s*(?:\\/\\s*m(?:²|2)?|le\\s*m(?:²|2|ètre|etre)?|par\\s*m(?:²|2|ètre|etre)?|(?:ف|ل)?(?:ال|ل)متر)(?![a-z])"));
  if(per)out.ppm=toNum(per[1]);
  else{const pu=t.match(new RegExp("(?:prix\\s*(?:unitaire|unit\\.?|au\\s*m(?:²|2|ètre|etre)?|du\\s*m(?:²|2|ètre|etre)?|par\\s*m(?:²|2)?|m(?:²|2))|\\bp\\.\\s?u\\b\\.?|\\bpu\\b|ثمن\\s*(?:ديال\\s*)?(?:ال|ل)متر)\\s*[:=]?\\s*(?:de\\s*)?"+NUMRE));if(pu)out.ppm=toNum(pu[1])}
  let pha=null;if(!per&&out.ppm==null){const hp=t.match(new RegExp(NUMRE+"\\s*"+UNITRE+"\\s*(?:\\/\\s*(?:ha|hectares?)(?![a-z])|(?:le|par|l'|du|au|chaque)\\s*hectares?|(?:ف|ل)?(?:ال|ل)هكتار)"));
    if(hp){const a=amt(hp[1],hp[2]);if(a&&a.v){pha={i:hp.index,e:hp.index+hp[0].length};out.ppm=Math.round(a.v/1e4*100)/100;out.notes.push("Prix au hectare "+fmt(a.v)+" DH/ha : soit "+fmt(out.ppm)+" DH/m²."+(a.note?" "+a.note:""))}}}
  const tP=pha?t.slice(0,pha.i)+" ".repeat(pha.e-pha.i)+t.slice(pha.e):t;
  const sarm=t.match(new RegExp("(?:sarout|sarrout|sarot|saroute|pas[- ]de[- ]porte|hlaou?ane|hlawan|droit au bail|ساروت)\\s*(?:prix|de|:)?\\s*:?\\s*"+NUMRE+"\\s*"+UNITRE));
  let sarV=null;if(sarm){const a=amt(sarm[1],sarm[2]);if(a){sarV=a.v;if(a.note)out.notes.push(a.note)}}
  const mon=t.match(new RegExp(NUMRE+"\\s*(?:dhs?|dirhams?|درهم|دراهم)?\\s*(?:\\/\\s*mois|par\\s*mois|(?:le|au|chaque|f|fi|l)?\\s*mois\\b|mensuel(?:le)?s?|(?:ف|ل)?(?:ال|ل)شهر|شهريا|f\\s*(?:l|el)?\\s*chh?ar|l\\s*chh?ar)"));
  const monV=mon?toNum(mon[1]):null;
  if(out.tx==="Vente"&&!sale&&!sar&&monV!=null&&monV>=300){out.tx="Location";out.notes.push("Montant par mois ("+fmt(monV)+" DH) : lu comme une location.")}
  const av=t.match(new RegExp(NUMRE+"\\s*(?:dhs?|dirhams?)?\\s*(?:d'|de\\s*)?(?:avance|caution|garantie)"));
  let avV=av?toNum(av[1]):null;
  if(avV==null){const a2=t.match(new RegExp("(?:avance|caution|garantie)\\s*:?\\s*(?:de\\s*)?"+NUMRE+"\\s*(?:dhs?)?(?!\\s*(?:\\/\\s*mois|par\\s*mois|mois))"));if(a2)avV=toNum(a2[1])}
  if(avV!=null&&monV!=null&&avV===monV)avV=null;
  const mill=tP.match(new RegExp(NUMRE+"\\s*(mdh|m\\s*dh|millions?\\s*(?:de\\s*)?(?:dh|dirhams?)|m[ei]l+[iy]?ons?|mlyon|mlion|millions?|مليون)"));
  const prixm=tP.match(new RegExp("(?:prix|pr|valeur|total|demand[ée]|ثمن)\\s*:?\\s*(?:de\\s*)?"+NUMRE+"\\s*"+UNITRE));
  if(out.tx==="Pas-de-porte"){
    if(sarV==null&&mill){const a=amt(mill[1],mill[2]);sarV=a.v;if(a.note)out.notes.push(a.note)}
    out.price=sarV;if(monV!=null)out.loyer=monV;
  }else if(out.tx==="Location"){
    out.price=monV??(prixm?toNum(prixm[1]):null)??((m=>m?toNum(m[1]):null)(t.match(new RegExp("(?:loyer|kra|kira|كراء)\\s*:?\\s*(?:de\\s*)?"+NUMRE))));if(avV!=null)out.avance=avV;
  }else{
    let v=null;
    if(mill){const a=amt(mill[1],mill[2]);v=a.v;if(MILL_U.test(mill[2].trim())&&toNum(mill[1])<10){v=toNum(mill[1])*1e6;out.notes.push("« "+mill[1]+" "+mill[2]+" » lu comme "+fmt(v)+" DH (vente, à vérifier).");out.flag=1}else{if(a.note)out.notes.push(a.note);if(a.flag)out.flag=1}}
    else if(prixm&&!(per&&prixm.index<=per.index+per[0].length&&per.index<=prixm.index+prixm[0].length)){const a=amt(prixm[1],prixm[2]);if(a&&a.v){
      if(a.v<50000&&!/^m/.test(prixm[2]||"")){out.ppm=out.ppm??a.v;out.notes.push("Montant "+fmt(a.v)+" trop bas pour un prix total : lu comme prix au m² (à vérifier).")}
      else v=a.v}}
    else{const big=[...tP.matchAll(new RegExp(NUMRE+"\\s*(dhs?|dirhams?|mad)\\b","g"))].map(x=>toNum(x[1])).filter(x=>x>=50000&&x!==avV);if(big.length)v=Math.max(...big)}
    out.price=v;if(monV!=null&&monV>=300)out.loyer=monV;
  }
  const fl=t.match(/\b(rdc|rez[- ]de[- ]chauss[ée]e)\b/)?"RDC":(t.match(/\b(\d{1,2})\s*(?:er|ère|eme|ème|e|è)\s*(?:étage|etage|et\b)/)?.[1]);
  if(fl)out.floor=fl==="RDC"?"RDC":fl+(fl==="1"?"er":"e")+" étage";else if(/\bsoussol\b/.test(t)&&!out.sCave)out.floor="Sous-sol";
  const ch=t.match(/(\d)\s*(?:ch\b|chambres?|chbr)/),sa=t.match(/(\d)?\s*salons?\b/),sdb=t.match(/(\d)\s*(?:sdb|salles? de bains?)/);
  const rooms=[ch?ch[1]+" ch":"",sa?(sa[1]||"1")+" salon":"",sdb?sdb[1]+" sdb":""].filter(Boolean).join(" + ");if(rooms)out.rooms=rooms;
  if(/\bneuf\b|jamais habit/.test(t))out.state="Neuf";else if(/[àa] r[ée]nover|v[ée]tuste/.test(t))out.state="À rénover";
  if(/haut standing/.test(t))out.standing="Haut standing";else if(/moyen standing/.test(t))out.standing="Moyen standing";else if(/[ée]conomique/.test(t))out.standing="Économique";
  if(out.gps){const c=guessCity(coordsFrom(out.gps));if(c)out.city=c}
  /* fiches écrites « Étiquette : valeur » (Ville :, Quartier :, Contact :, Etage :, Ch :, Balcon :…) */
  const LBL=re=>{const m=src.match(re);return m?m[1].trim():""},EMPTY=v=>!v||/^[-–—_.\s?]*$/.test(v);
  const cap=v=>v.toLowerCase().replace(/(^|[\s'’-])([a-zà-ÿ])/g,(x,a,b)=>a+b.toUpperCase());
  const vil=LBL(/(?:^|\n|;)[ \t]*villes?[ \t]*:[ \t]*([^\n;]*)/i);if(!EMPTY(vil))out.city=cap(vil);
  const qua=LBL(/(?:^|\n|;)[ \t]*(?:quartiers?|hay|secteur)[ \t]*:[ \t]*([^\n;]*)/i);if(!EMPTY(qua))out.district=cap(qua);
  const adr=LBL(/(?:^|\n|;)[ \t]*(?:adresse|rue)[ \t]*:[ \t]*([^\n;]*)/i);if(!EMPTY(adr))out.address=adr;
  const ctc=src.match(/(?:contact|t[ée]l[ée]?phone|t[ée]l|gsm|whatsapp|num[ée]ro)[ \t]*:?[ \t]*((?:\+?212|0)[\d \t.\-]{6,13}\d)/i);
  if(ctc&&!out.contactTel){const d=ctc[1].replace(/[\s.\-]/g,"").replace(/^\+?212/,"0");
    if(d.length===10)out.contactTel=d.replace(/(\d{4})(\d{2})(\d{2})(\d{2})/,"$1 $2 $3 $4");
    else if(d.length>=8&&d.length<10){out.contactTel=d;out.notes.push("Numéro de contact incomplet ("+d.length+" chiffres) : à vérifier.")}}
  const eta=LBL(/(?:^|\n|;)[ \t]*[ée]tage[ \t]*:[ \t]*([^\n;]*)/i);
  const fm=eta.match(/^(?:(rdc|rez[- ]de[- ]chauss[ée]e|r\s*\+?\s*0)|(\d+)\s*(?:er|ère|re|e|ème|eme|è)?)\s*(?:[ée]tage)?\s*\.?$/i);
  if(fm)out.floor=fm[1]?"RDC":(fm[2]==="0"?"RDC":fm[2]==="1"?"1er étage":fm[2]+"e étage");
  const nbe=LBL(/(?:^|\n|;)[ \t]*(?:nb|nombre)\.?[ \t]*(?:d['’][ \t]*)?[ée]tages?[ \t]*:[ \t]*([^\n;]*)/i)||(fm?"":eta),rpl=nbe.match(/r\s*\??\s*\+\s*(\d+)/i);
  if(rpl)out.niveaux="R+"+rpl[1];
  const cnt=re=>{const v=LBL(re);const n=v.match(/^(\d+)/);return n?+n[1]:null};
  const nCh=cnt(/(?:^|\n|;)[ \t]*(?:ch|chambres?|chbr)[ \t]*:[ \t]*([^\n;]*)/i),nSa=cnt(/(?:^|\n|;)[ \t]*salons?[ \t]*:[ \t]*([^\n;]*)/i),nSdb=cnt(/(?:^|\n|;)[ \t]*(?:sdb|salles? de bains?)[ \t]*:[ \t]*([^\n;]*)/i);
  if(nCh!=null||nSa!=null||nSdb!=null)out.rooms=[nCh!=null?nCh+" ch":"",nSa?nSa+" salon":"",nSdb?nSdb+" sdb":""].filter(Boolean).join(" + ");
  const yn=(re,lab)=>{const v=LBL(re).toLowerCase();if(/^(non|no|sans|0)\b/.test(v))return "sans "+lab;if(/^(oui|yes|avec|\d)/.test(v))return "avec "+lab;return ""};
  const eq=[yn(/(?:^|\n|;)[ \t]*balcons?[ \t]*:[ \t]*([^\n;]*)/i,"balcon"),yn(/(?:^|\n|;)[ \t]*(?:parking|garage)[ \t]*:[ \t]*([^\n;]*)/i,"parking"),yn(/(?:^|\n|;)[ \t]*ascenseurs?[ \t]*:[ \t]*([^\n;]*)/i,"ascenseur")].filter(Boolean);
  if(eq.length)out.notes.push(eq.join(", ").replace(/^./,x=>x.toUpperCase())+".");
  const cour=t.match(/(\d+(?:[.,]\d+)?)\s*(?:m²|m2|m)?\s*(?:de\s*)?cour\b/);if(cour)out.notes.push("Cour : "+cour[1]+" m² (non comptée dans la surface).");
  if(/(?:^|\n)[ \t]*angle\b/i.test(src)||/\b(?:à|a|en|d['’])\s*l['’]?angle\b|\bangle\s+(?:rue|bd|boulevard|avenue|av)\b/i.test(src))out.facades="Angle";
  if(!out.niveaux){const rr=t.match(/\br\s*\+\s*(\d{1,2})\b/);if(rr)out.niveaux="R+"+rr[1]}
  const ynv=re=>{const v=LBL(re).toLowerCase();return /^(non|no|sans|0)\b/.test(v)?"Non":/^(oui|yes|avec|\d)/.test(v)?"Oui":""};
  const pkv=ynv(/(?:^|\n|;)[ \t]*(?:parking|garage)[ \t]*:[ \t]*([^\n;]*)/i),asv=ynv(/(?:^|\n|;)[ \t]*ascenseurs?[ \t]*:[ \t]*([^\n;]*)/i);if(pkv)out.parking=pkv;if(asv)out.ascenseur=asv;
  const tfv=LBL(/(?:^|\n|;)[ \t]*(?:t\.?\s?f\.?|titre(?:\s+foncier)?|r[ée]quisition)[ \t]*(?:n[°o]\.?)?[ \t]*:[ \t]*([^\n;]*)/i);if(!EMPTY(tfv))out.tf=tfv.toUpperCase().replace(/\s+/g," ");
  const ven=LBL(/(?:^|\n|;)[ \t]*vendeurs?[ \t]*:[ \t]*([^\n;]*)/i),ach=LBL(/(?:^|\n|;)[ \t]*(?:acheteurs?|acqu[ée]reurs?)[ \t]*:[ \t]*([^\n;]*)/i);
  if(!EMPTY(ven))out.vendeur=ven;if(!EMPTY(ach))out.acheteur=ach;
  const dv=LBL(/(?:^|\n|;)[ \t]*date[ \t]*(?:de[ \t]*(?:la[ \t]*)?|d['’][ \t]*)?(?:vente|acte|achat|transaction|mutation|inscription)[ \t]*:[ \t]*([^\n;]*)/i),dm=dv.match(/(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})|(\d{4})-(\d{2})-(\d{2})/);
  if(dm)out.date=dm[4]?dm[4]+"-"+dm[5]+"-"+dm[6]:(dm[3].length===2?"20"+dm[3]:dm[3])+"-"+dm[2].padStart(2,"0")+"-"+dm[1].padStart(2,"0");
  if(out.tf||out.vendeur||out.acheteur||/conservation fonci|ancfcc|titre foncier/.test(t)){out.nature="Transaction";out.tx="Vente"}
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
  setV("niveaux",p.niveaux,"niveaux");setV("facades",p.facades,"façades");setV("parking",p.parking,"parking");setV("ascenseur",p.ascenseur,"ascenseur");setV("tf",p.tf,"titre foncier");setV("vendeur",p.vendeur,"vendeur");setV("acheteur",p.acheteur,"acheteur");setV("date",p.date,"date");
  if(p.nature==="Transaction"){$("#f_nature").value="Transaction";filled.push("transaction");if(!$("#f_source").value){ensureOpt($("#f_source"),"Conservation foncière");$("#f_source").value="Conservation foncière"}}updTrans();
  if(src){const cur=$("#f_notes").value.trim();const add=[...(p.notes||[]),"Note d’origine : "+src.replace(/\s*\n\s*/g," ; ")].join(" ");if(!cur.includes(src.slice(0,40)))$("#f_notes").value=(cur?cur+"\n":"")+add}
  updCalc();if(coordsFrom($("#f_gps").value))temGeocode();
  $("#qStatus").textContent=filled.length?label+" : "+[...new Set(filled)].join(", ")+". Vérifie la fiche avant d’enregistrer."+(p.flag?" Attention : un montant est à vérifier.":""):"Rien n’a été reconnu dans ce texte. Remplis la fiche à la main ou essaie l’analyse avec Claude.";
}
$("#qFill").onclick=()=>{const s=$("#qText").value.trim();if(!s){toast("Colle d’abord une note.");return}applyParsed(smartParse(s),s,"Rempli automatiquement")};
const AI_PROMPT=`Tu aides un constateur immobilier au Maroc à enregistrer un témoin de marché (comparable) à partir d'une note de terrain, d'une observation ou d'une annonce (texte et/ou capture d'écran). La note peut mélanger français, darija et arabe.
Règles :
- "mellion", "mlyon", "مليون" = millions de centimes : 56 mellion = 560 000 DH. "1,2 MDH" = 1 200 000 DH.
- "sarout", "pas-de-porte", "hlaouane", "ساروت" : opération "Pas-de-porte" ; le loyer mensuel éventuel va dans "loyer".
- "à louer", "loué", "par mois", "كراء" : opération "Location" ; "price" = loyer mensuel ; l'avance ou la caution va dans "avance".
- Sépare les surfaces : sMain = principale (RDC, habitable, construite), sMezz = mezzanine ou soupente, sCave = cave ou sous-sol, sTerr = terrasse, sLand = terrain. Hectares convertis en m².
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
  const head=["Date","Opération","Type","Prix (DH)","Surface retenue (m²)","Prix/m²","Principale","Mezzanine","Cave","Terrasse","Terrain","Avance","Loyer","Ville","Quartier","Adresse","GPS","Étage","Pièces","État","Standing","Nature","Statut","Canal","Contact","Téléphone","Code","Dossier","Lien","Observations","Photos","Titre foncier","Vendeur","Acheteur","Commune","Province","Région","Code postal","Immeuble","Niveaux","Façades","Donne sur","Orientation","Env. commercial","Env. urbain","Ascenseur","Parking","Vérifié par","Vérifié le"];
  const e=v=>{v=v==null?"":String(v);return /[";\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
  const lines=[head.join(";")].concat(r.map(c=>[c.date,c.tx,c.type,c.price,c.surface,ppmOf(c)?Math.round(ppmOf(c)):"",c.sMain,c.sMezz,c.sCave,c.sTerr,c.sLand,c.avance,c.loyer,c.city,c.district,c.address,c.gps,c.floor,c.rooms,c.state,c.standing,c.nature,c.status,c.source,c.contactName,c.contactTel,c.code,c.dossier,c.link,c.notes,(c.photos||[]).length,c.tf,c.vendeur,c.acheteur,c.commune,c.province,c.region,c.cp,c.bati,c.niveaux,c.facades,c.vue,c.orient,c.envCom,c.envUrb,c.ascenseur,c.parking,c.verifiedBy,c.verifiedAt].map(e).join(";")));
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
/* noms des rues et boulevards seuls : on garde le texte (et son contour clair) des tuiles « transport » d'Esri
   et on efface le tracé coloré des routes */
function streetLabels(){const Lb=L.GridLayer.extend({createTile(c,done){const cv=document.createElement("canvas");cv.width=cv.height=256;const im=new Image();im.crossOrigin="anonymous";
  im.onload=()=>{try{const x=cv.getContext("2d");x.drawImage(im,0,0);const id=x.getImageData(0,0,256,256),d=id.data,N=256,t=new Uint8Array(N*N),hl=new Uint8Array(N*N);
    for(let i=0;i<N*N;i++){const r=d[i*4],g=d[i*4+1],b=d[i*4+2],mx=Math.max(r,g,b);if(d[i*4+3]>90&&mx<105&&mx-Math.min(r,g,b)<45)t[i]=1}
    for(let y=0;y<N;y++)for(let xx=0;xx<N;xx++){if(!t[y*N+xx])continue;for(let dy=-2;dy<=2;dy++){const yy=y+dy;if(yy<0||yy>=N)continue;for(let dx=-2;dx<=2;dx++){const x2=xx+dx;if(x2>=0&&x2<N)hl[yy*N+x2]=1}}}
    for(let i=0;i<N*N;i++){if(t[i])continue;if(hl[i]&&Math.min(d[i*4],d[i*4+1],d[i*4+2])>170){d[i*4]=d[i*4+1]=d[i*4+2]=255;continue}d[i*4+3]=0}
    x.putImageData(id,0,0)}catch(e){}done(null,cv)};
  im.onerror=()=>done(null,cv);im.src=ESRI+"Reference/World_Transportation/MapServer/tile/"+c.z+"/"+c.y+"/"+c.x;return cv}});
  return new Lb({maxZoom:20,maxNativeZoom:19,zIndex:4})}
function initMap(){
  if(map||!window.L)return;
  map=L.map("map",{preferCanvas:true,zoomControl:true}).setView([33.573,-7.59],12);
  const o={maxZoom:20,maxNativeZoom:19};
  const imagery=()=>L.tileLayer(ESRI+"World_Imagery/MapServer/tile/{z}/{y}/{x}",{...o,zIndex:1,attribution:"Imagerie © Esri, Maxar, Earthstar Geographics"});
  const sat=imagery();
  /* noms des villes, quartiers, rues et boulevards : texte seul, sans le tracé coloré des routes */
  const names=L.tileLayer(ESRI+"Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",{...o,zIndex:3});
  const hyb=L.layerGroup([imagery(),names,streetLabels()]);
  const plan=L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,zIndex:1,attribution:"© OpenStreetMap"});
  const bases={hyb,sat,plan};(bases[LS.get("vt_base","hyb")]||hyb).addTo(map);
  L.control.layers({"Satellite + noms":hyb,"Satellite seul":sat,"Plan":plan},null,{position:"topright",autoZIndex:false}).addTo(map);
  map.on("baselayerchange",e=>{const k=e.layer===hyb?"hyb":e.layer===sat?"sat":e.layer===plan?"plan":null;if(k)LS.set("vt_base",k)});
  L.control.scale({imperial:false}).addTo(map);
  ovLayer=L.layerGroup().addTo(map);ptsLayer=L.layerGroup().addTo(map);meLayer=L.layerGroup().addTo(map);
  const Ctl=L.Control.extend({onAdd(){const d=L.DomUtil.create("div","leaflet-bar mc-ctl");
    const a=L.DomUtil.create("a","",d);a.href="#";a.title="Ma position";a.setAttribute("role","button");a.innerHTML='<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="3.2" fill="currentColor"/><circle cx="9" cy="9" r="6.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M9 0v3M9 15v3M0 9h3M15 9h3" stroke="currentColor" stroke-width="1.6"/></svg>';
    a.onclick=ev=>{ev.preventDefault();locateMe()};
    const b=L.DomUtil.create("a","",d);b.href="#";b.title="Tout voir";b.setAttribute("role","button");b.textContent="⤢";b.onclick=ev=>{ev.preventDefault();mv=null;drawMap(lastMapR)};
    L.DomEvent.disableClickPropagation(d);return d}});
  new Ctl({position:"topleft"}).addTo(map);addZoneCtl();
  /* appui long (doigt ou souris) : menu du point ; un simple toucher ne fait rien */
  {const el=map.getContainer();let t=null,st=null,supp=0,last=0;const cancel=()=>{clearTimeout(t);t=null};
    const onMarker=pt=>markers.some(({m})=>map.latLngToContainerPoint(m.getLatLng()).distanceTo(pt)<14);
    const fire=(ll)=>{last=Date.now();supp=Date.now()+900;try{navigator.vibrate&&navigator.vibrate(25)}catch(_){}mapClickPopup(ll)};
    el.addEventListener("pointerdown",e=>{cancel();if(!e.isPrimary||e.button>0||e.target.closest(".leaflet-control,.leaflet-popup"))return;
      const pt=map.mouseEventToContainerPoint(e);if(onMarker(pt))return;st=[e.clientX,e.clientY];const ll=map.containerPointToLatLng(pt);t=setTimeout(()=>{t=null;fire(ll)},550)});
    el.addEventListener("pointermove",e=>{if(t&&st&&Math.hypot(e.clientX-st[0],e.clientY-st[1])>9)cancel()});
    ["pointerup","pointercancel"].forEach(ev=>el.addEventListener(ev,cancel));
    el.addEventListener("click",e=>{if(Date.now()<supp&&!e.target.closest(".leaflet-popup,.leaflet-control")){e.stopPropagation();e.preventDefault()}},true);
    map.on("contextmenu",e=>{cancel();if(Date.now()-last<1500)return;if(onMarker(e.containerPoint))return;fire(e.latlng)});
    map.on("movestart zoomstart",cancel)}
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
  drawZone();
  const subj=coordsFrom(etude.gps);if(subj&&sel.size)L.marker(subj,{icon:L.divIcon({className:"mc-subj",iconSize:[16,16]}),title:"Bien évalué",keyboard:false}).addTo(ovLayer);
  if(!mv){if(zone&&!zMode)map.fitBounds(zoneBounds(),{padding:[24,24]});else if(center)map.fitBounds(L.latLng(center).toBounds(rad*2.3));else if(pts.length)map.fitBounds(L.latLngBounds(pts.map(p=>p.g)),{padding:[30,30],maxZoom:17});mv=true}
  const lg=$("#mlegend");lg.innerHTML="";
  lg.append(h("span",{class:"meta",text:pts.length+" sur la carte"+(r.length>pts.length?" ("+(r.length-pts.length)+" sans GPS)":"")+" · appui long sur la carte : nouveau témoin, fiche de visite ou comparables autour"}));
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
    canVisites()?h("button",{class:"btn sm",type:"button",text:"Fiche de visite ici",onclick:()=>{map.closePopup();chooseKind({gps:s})}}):null,
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
  if(m==="carte"){m="temoins";if(view!=="map"){view="map";LS.set("mc_view",view);shown=0;mv=null}}
  else if(m==="temoins"&&curMod==="temoins"&&view==="map"&&isPhone()){view="list";LS.set("mc_view",view);shown=0}
  if(MOD_SOON[m]){toast("« "+MOD_SOON[m]+" » arrive dans une prochaine version de Valtera.");return}
  if(m==="admin"&&!isOwner())m="temoins";
  if(m==="visites"&&!canVisites())m="temoins";
  curMod=m;syncTabs();if(m==="temoins"&&loaded)render();
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
  const rows=Object.entries(USERS).map(([uid,u])=>({uid,email:u.email||"",name:u.name||"",role:u.role,modules:u.modules||[],expires:tsMs(u.expires),active:u.active!==false,lastSeen:tsMs(u.lastSeen),joined:true,visScope:u.visScope||"own",temScope:u.temScope||"all"}));
  const known=new Set(rows.map(r=>r.email.toLowerCase()));
  Object.entries(INVITES).forEach(([em,i])=>{if(!known.has(em))rows.push({uid:null,email:em,name:"",role:i.role,modules:i.modules||[],expires:tsMs(i.expires),active:true,lastSeen:null,joined:false,visScope:i.visScope||"own",temScope:i.temScope||"all"})});
  const ord={owner:0,collab:1,reader:2};return rows.sort((a,b)=>(ord[a.role]??3)-(ord[b.role]??3)||a.email.localeCompare(b.email))}
function stateOf(r){if(r.role==="owner")return ["Propriétaire","st-ok"];if(!r.joined)return ["Invité, pas encore connecté","st-warn"];if(!r.active)return ["Suspendu","st-bad"];if(r.expires&&r.expires<Date.now())return ["Expiré","st-old"];return ["Actif","st-ok"]}
function renderAdmin(){
  if(!isOwner())return;
  const rows=accRows(),T=$("#admTbl");T.innerHTML="";
  const byUid={},byUidV={};items.forEach(c=>{if(c.createdBy)byUid[c.createdBy]=(byUid[c.createdBy]||0)+1});visites.forEach(v=>{if(v.createdBy)byUidV[v.createdBy]=(byUidV[v.createdBy]||0)+1});
  $("#admCount").textContent=rows.length?rows.length+" compte"+(rows.length>1?"s":""):"";
  T.append(h("thead",null,h("tr",null,...["Personne","Rôle","Accès","Jusqu’au","État","Témoins","Fiches","Dernière visite",""].map(l=>h("th",{"data-k":""},l)))));
  const tb=h("tbody");
  if(!rows.length)tb.append(h("tr",null,h("td",{colspan:9,style:"white-space:normal;color:var(--muted);padding:18px",text:"Aucun compte pour l’instant."})));
  rows.forEach(r=>{const [st,cl]=stateOf(r);
    const acts=r.role==="owner"?h("span",{class:"meta",text:"—"}):h("div",{class:"acts",style:"padding:0;flex-wrap:nowrap"},
      r.uid?h("button",{class:"btn sm",type:"button",text:"Voir son travail",onclick:()=>showWork(r)}):null,
      h("button",{class:"btn sm",type:"button",text:"Modifier",onclick:()=>openUser(r)}),
      r.joined?h("button",{class:"btn sm",type:"button",text:r.active?"Suspendre":"Réactiver",onclick:e=>toggleActive(r,e.target)}):null);
    tb.append(h("tr",{style:"cursor:default"},
      h("td",{class:"wrap"},h("b",{text:r.name||r.email}),r.name?h("div",{class:"meta",text:r.email}):null),
      h("td",{text:ROLE_LBL[r.role]||r.role||"—"}),
      h("td",{class:"wrap",text:accessTxt(r)}),
      h("td",{class:"num",text:r.role==="owner"?"—":(r.expires?dateFr(r.expires):"Sans limite")}),
      h("td",null,h("span",{class:"chip "+cl,text:st})),
      h("td",{class:"num r",text:r.uid?fmt(byUid[r.uid]||0):"—"}),
      h("td",{class:"num r",text:r.uid?fmt(byUidV[r.uid]||0):"—"}),
      h("td",{class:"num",text:r.lastSeen?dateFr(r.lastSeen):"—"}),
      h("td",null,acts)))});
  T.append(tb);
}
const VIS_LBL={own:"ne voit pas tes fiches",shared:"voit les fiches que tu partages",all:"voit toutes tes fiches"};
function accessTxt(r){if(r.role==="owner")return "Tout";const vis=r.modules.includes("visites")&&r.role==="collab";
  return [r.temScope==="own"?"Ses témoins seulement":"Tous les témoins",vis?"Visites ("+VIS_LBL[r.visScope||"own"]+")":"",r.modules.includes("export")?"export":""].filter(Boolean).join(" + ")}
/* voir ce qu'une personne a ajouté : filtre « Ajouté par » sur les témoins et sur les fiches */
function showWork(r){showMod("temoins");fillAuthorSel("#fBy",items);const e=$("#fBy");e.value=[...e.options].some(o=>o.value===r.uid)?r.uid:"";
  $("#filters").hidden=false;$("#fBtn").setAttribute("aria-expanded","true");shown=0;if(view==="map")mv=null;render();
  const vb=$("#visByF");if(vb){fillAuthorSel("#visByF",visites);vb.value=[...vb.options].some(o=>o.value===r.uid)?r.uid:""}
  toast("Témoins ajoutés par "+(r.name||r.email)+". Ses fiches : onglet Visites.")}
async function toggleActive(r,btn){btn.disabled=true;
  try{await commitSoft(fdb.doc("users/"+r.uid).update({active:!r.active}));toast(r.active?"Accès suspendu":"Accès réactivé")}catch(e){toast(errMsg(e))}btn.disabled=false}
$("#invForm").addEventListener("submit",async e=>{e.preventDefault();
  const email=$("#i_email").value.trim().toLowerCase();
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){$("#invNote").textContent="Adresse e-mail invalide.";return}
  if(email===ME.email){$("#invNote").textContent="C’est ton propre compte.";return}
  const mods=["temoins"].concat($("#i_m_visites").checked?["visites"]:[],$("#i_m_export").checked?["export"]:[]);
  const inv={email,role:$("#i_role").value,modules:mods,expires:expTs($("#i_expires").value),visScope:$("#i_visScope").value,temScope:$("#i_temScope").value,invitedAt:Date.now()};
  $("#invBtn").disabled=true;
  try{await commitSoft(fdb.doc("invites/"+email).set(inv));
    const link=appLink();
    $("#invNote").replaceChildren("Invitation enregistrée pour ",h("b",{text:email}),". Envoie-lui le lien de Valtera ; il se connecte avec ce compte Google : ",h("span",{class:"num",text:link})," ",h("button",{class:"btn sm",type:"button",text:"Copier le lien",onclick:ev=>copyText(link,ev.target)}));
    $("#i_email").value="";$("#i_expires").value="";$("#i_m_export").checked=false;$("#i_m_visites").checked=false;$("#i_visScope").value="own";$("#i_temScope").value="all"}
  catch(err){$("#invNote").textContent=errMsg(err,"Invitation non enregistrée.")}
  $("#invBtn").disabled=false});
let uEdit=null,uDelArmed=false;
function openUser(r){uEdit=r;uDelArmed=false;$("#uDel").classList.remove("arm");$("#uDel").textContent="Retirer l’accès";
  $("#uTitle").textContent=r.name||r.email;$("#uMail").textContent=r.email+(r.joined?"":" · invitation en attente");
  $("#u_role").value=r.role==="reader"?"reader":"collab";$("#u_export").checked=r.modules.includes("export");$("#u_visites").checked=r.modules.includes("visites");
  $("#u_visScope").value=r.visScope||"own";$("#u_temScope").value=r.temScope||"all";
  $("#u_expires").value=isoDay(r.expires);$("#u_active").checked=r.active;$("#u_activeL").hidden=!r.joined;$("#uNote").textContent="";
  $("#uDlg").showModal()}
$("#uSave").onclick=async()=>{const r=uEdit;if(!r)return;
  const upd={role:$("#u_role").value,modules:["temoins"].concat($("#u_visites").checked?["visites"]:[],$("#u_export").checked?["export"]:[]),expires:expTs($("#u_expires").value),visScope:$("#u_visScope").value,temScope:$("#u_temScope").value};
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
let visRO=false,visSrc={},visUnsubs=[];
let visites=[],visEditing=null,visPhotos=[],visRefs=[],visDelArmed=false,visQ="",visUnsub=null;
function canVisites(){return isOwner()||(ME.modules.includes("visites")&&ME.role==="collab")}
const CH={on:["Oui","Non"],bmf:["B","M","F"]};
const TYPO_SUB={"Maison":["Unifamiliale","Multifamiliale"],"Villa":["Isolée","En bande","Jumelée"],"Local commercial":["Avec accès rue","Sans accès rue"]};
const SEC_BIEN=[
 {t:"Dossier et adresse",f:[["dossier","Numéro du dossier"],["date","Date de la visite","date"],["visiteur","Visiteur"],["contact","Contact (personne rencontrée)"],["contactTel","Téléphone du contact","tel"],
   ["gps","Coordonnées","gps"],["ville","Ville"],["quartier","Quartier"],["commune","Municipalité / Commune"],["rue","Rue","text",2],["residence","Résidence"],["num","N°"],["ilot","Îlot"],["porte","Porte"],["etage","Étage"],["codePostal","Code postal"],
   ["orientation","Orientation","chips",["Nord","Sud","Est","Ouest","Nord-Est","Nord-Ouest","Sud-Est","Sud-Ouest"]]]},
 {t:"Typologie",f:[["typo","Type de bien","chips",["Maison","Appartement","Villa","Local commercial","Usine","Autre"]],["typoSub","Précision","chips",[]],["resType","Résidence","chips",["Principale","Secondaire"]]]},
 {t:"Construction",f:[["nLog","N. logements"],["nLc","N. locaux commerciaux"],["nBureaux","N. bureaux"],["nAsc","N. ascenseurs"],["nEtages","N. étages"],["garage","Garage"],["ssol","Sous-sol"],
   ["hsp","HSP (LC et usine)","chips",["Inf","Sup"]],["terrasse","Terrasse","chips",["Accessible","Non accessible"]]]},
 {t:"Aménagements extérieurs",f:[["jardin","Jardin","chips",CH.on],["piscine","Piscine","chips",CH.on],["tsport","Terrain de sport","chips",CH.on],["cloturee","Clôturée","chips",CH.on],
   ["clim","Chauffage / clim","chips",CH.on],["chauffeEau","Chauffe-eau","chips",["Gaz","Électrique","Non"]],["incendie","Sécurité incendie","chips",["Pré-installation","Oui","Non"]]]},
 {t:"Équipement du quartier",note:"B bon · M moyen · F faible",f:[["eqCommercial","Commercial","chips",CH.bmf],["eqLoisirs","Loisirs","chips",CH.bmf],["eqScolaire","Scolaire","chips",CH.bmf],["eqSante","Santé","chips",CH.bmf],["eqSportif","Sportif","chips",CH.bmf],
   ["eqReligieux","Religieux","chips",["Suffisant","Insuffisant"]],["eqBus","Bus","chips",CH.on]]},
 {t:"Description",f:[["chambres","Nbre de chambres"],["sdb","Nbre de SDB / WC"],["piecesExt","Pièces extérieures"],["piecesTot","Pièces totales"],["sConst","Surface construite (m²)","num"],["sTerrain","Surface terrain (m²)","num"],
   ["occupation","Usager","chips",["Propriétaire","Locataire","Inoccupé"]],["age","Âge du bien"],["renov","Dernière rénovation"]]},
 {t:"Qualité constructive",rooms:true,f:[["docs","Documents en possession lors de la visite","multi",["CP","PC","P. autorisé","Autre"]],["docsAutre","Autre document"]]},
 {t:"Valeur et références",refs:true,f:[["valeur","Valeur du bien estimée (DH)","num"]]},
 {t:"Remarques",f:[["remarques","Remarques","area",null,3]]}
];
const ORIENT=["Nord","Sud","Est","Ouest","Nord-Est","Nord-Ouest","Sud-Est","Sud-Ouest"];
const EQ_FIELDS=[["eqCommercial","Commercial","chips",CH.bmf],["eqLoisirs","Loisirs","chips",CH.bmf],["eqScolaire","Scolaire","chips",CH.bmf],["eqSante","Santé","chips",CH.bmf],["eqSportif","Sportif","chips",CH.bmf],["eqReligieux","Religieux","chips",["Suffisant","Insuffisant"]],["eqBus","Bus","chips",CH.on]];
const HEAD_COMMON=[["dossier","Numéro du dossier"],["date","Date de la visite","date"],["visiteur","Visiteur"],["contact","Contact (personne rencontrée)"],["contactTel","Téléphone du contact","tel"],
  ["gps","Coordonnées","gps"],["ville","Ville"],["quartier","Quartier"],["commune","Municipalité / Commune"],["rue","Rue","text",2],["num","N°"],["codePostal","Code postal"]];
const SEC_TERRAIN=[
 {t:"Dossier et adresse",f:[...HEAD_COMMON,["orientation","Orientation","chips",ORIENT]]},
 {t:"Destination",f:[["destination","Destination","multi",["Terrain agricole","Terrain constructible","Maison","Villa","Usine","Immeuble","TR agricole","Autre"]],["implantation","Implantation","chips",["Isolé","En bande","Jumelée"]],["zone","Zone","chips",["Zone urbaine","Zone rurale"]],
   ["sTerrain","Superficie du terrain (m²)","num"],["precision","Précision","area",null,2]]},
 {t:"Équipement du quartier",note:"B bon · M moyen · F faible",f:EQ_FIELDS},
 {t:"Viabilité",f:[["eau","Eau","multi",["Réseau général","Puits"]],["elec","Électricité","multi",["Public","Privé"]],["assain","Assainissement","multi",["Réseau général","FS"]],["voirie","Voirie","multi",["Goudronnée","Piste"]]]},
 {t:"Topographie du terrain",f:[["topo","Topographie","multi",["Terrain plat","Terrain en pente","Terrain en relief","Dénivelé important"]]]},
 {t:"Voie d’accès",f:[["acces","Voie d’accès","multi",["Goudronnée","Non goudronnée","Publique","Privée"]],["distance","Distance","text",null,2]]},
 {t:"Servitudes / charges urbanistiques",f:[["servitudes","Servitudes grevant le terrain","multi",["Ligne haute tension / Ligne électrique","Servitude de passage","Oued / Khatara","Voie d'aménagement","Voie ferrée","Autre"]],["servAutre","Autre servitude","text",null,2]]},
 {t:"Nuisances",f:[["nuisances","Nuisances","multi",["Nuisances sonores","Nuisance olfactive (décharge…)","Autre"]],["nuisAutre","Autre nuisance","text",null,2]]},
 {t:"Valeur et étude de marché",refs:true,f:[["valeur","Valeur du bien estimée (DH)","num"],["etude","Étude de marché & transactions","multi",["Étude de marché complète","Étude de marché incomplète","Témoins introduits dans la carte","Étude des transactions effectuée"]],["codesAutres","Autres codes témoins (SAX…)","text",null,2]]},
 {t:"Documents",f:[["docs","Documents disponibles lors de la visite","multi",["C.P","P.C","N.R","C. des charges","P. autorisé","Autre"]],["docsAutre","Autre document"]]},
 {t:"Constructions sur le terrain",f:[["constructions","Description (type – date de construction)","area",null,2]]},
 {t:"Remarques",f:[["remarques","Remarques","area",null,3]]}
];
const SEC_AVANC=[
 {t:"Dossier et adresse",f:[...HEAD_COMMON,["typeBien","Type de bien / projet","text",null,2]]},
 {t:"Avancement des travaux",lots:true,note:"Pour chaque sous-lot, mets le % d’avancement. Les % par lot (ou, à défaut, les budgets) servent à calculer l’avancement global.",f:[]},
 {t:"Remarques",f:[["remarques","Remarques","area",null,3]]}
];
const KINDS={bien:{label:"Fiche de visite",nouv:"Nouvelle fiche de visite",sec:SEC_BIEN},terrain:{label:"Fiche de visite : Terrain",nouv:"Nouvelle fiche de visite : Terrain",sec:SEC_TERRAIN},avancement:{label:"État d’avancement",nouv:"Nouvel état d’avancement",sec:SEC_AVANC}};
const LOTS_DEF=[["Gros œuvres",["Terrassement généraux","Assainissement","Fondations (Béton, voiles)","Béton en élévation","Maçonnerie","Enduits extérieurs","Enduits intérieurs","Etanchéité","Piscine"]],
  ["Revêtement",["Revêtement sol intérieur","Revêtement plafond","Revêtement Murs","Revêtement Piscine"]],["Menuiserie Aluminium",["Aluminium"]],
  ["Menuiserie Bois",["Portes","Placard et Meubles Sanitaires","Cuisine"]],["Menuiserie Métallique",["Portes et Portails extérieurs"]],["Peinture",["Peinture intérieur","Peinture extérieur"]],
  ["Electricité",["Tuyauterie","Câblage et Tableaux électriques","Appareillage et Lustrerie"]],["Plomberie",["Descentes et évacuation EP EU","Alimentation et tableaux de distribution","Mecanismes de sanitaires"]],
  ["Climatisation",["Préinstallations","Conduites et unité de Climatisation"]],["Divers",["Aménagements Extérieurs (Dallage, espace vert, mur de cloture etc)"]]];
let visKind="bien";
const kindOf=v=>KINDS[v?.kind]?v.kind:"bien";
const secsOf=k=>KINDS[k||visKind].sec;
const fieldsOf=k=>secsOf(k).flatMap(s=>s.f);

const VIS_PH={nEtages:"ex. R+3",nAsc:"ex. 2, 0 ou —",nBureaux:"ex. 4 ou —",age:"ex. 15 ans",distance:"ex. RN9 : 1 km – P3015 : 750 m",typeBien:"ex. Villa R+1 avec piscine",codesAutres:"ex. 111647 + 111648"};
const ROOM_DEF=["Séjour","Chambres","Cuisine","SDB / WC"];
const visCol=()=>fdb.collection("visites");
function visRefStr(n){return "V-"+String(n).padStart(4,"0")}

/* ---------- données ---------- */
function visMerge(){const m=new Map();["owner","mine"].forEach(k=>(visSrc[k]||[]).forEach(v=>m.set(v.id,v)));visites=[...m.values()];
  if(typeof setNb==="function")setNb("#nbVis",visites.length);if(curMod==="visites")renderVisites();if(curMod==="admin"&&typeof renderAdmin==="function")renderAdmin()}
/* le propriétaire voit toutes les fiches ; les autres voient les leurs, plus celles du propriétaire si l'accès le permet (vérifié par le serveur) */
function listenVisites(){if(visUnsub||!canVisites()||!fdb)return;
  const sub=(k,q,main)=>q.onSnapshot(s=>{visSrc[k]=s.docs.map(d=>({...d.data(),id:d.id}));visMerge();
    if(main&&!s.metadata.fromCache){if(isOwner())ensureVisCounter().then(fixVisRefs);else fixVisRefs()}},
    e=>{if(main)toast(errMsg(e,"Fiches de visite indisponibles."));else{delete visSrc[k];visMerge()}});
  visSrc={};visUnsubs=[sub("mine",isOwner()?visCol():visCol().where("createdBy","==",ME.uid),true)];
  visUnsub=()=>{visUnsubs.forEach(u=>{try{u()}catch(e){}});visUnsubs=[];visSrc={}};
  if(!isOwner()&&(ME.visScope==="all"||ME.visScope==="shared"))fdb.doc("config/owner").get().then(d=>{const ou=d.exists?d.data().uid:null;if(!ou||!visUnsub||ou===ME.uid)return;
    let q=visCol().where("createdBy","==",ou);if(ME.visScope==="shared")q=q.where("shared","==",true);visUnsubs.push(sub("owner",q,false))}).catch(()=>{})}
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
function visTitle(v){const k=kindOf(v);
  if(k==="terrain")return "Terrain"+((v.destination||[]).length?" · "+v.destination.join(", "):"")+(v.sTerrain?" · "+plain(v.sTerrain)+" m²":"");
  if(k==="avancement"){const r=avCalc(v.lots||[]);return "État d’avancement"+(v.typeBien?" · "+v.typeBien:"")+(r.global!=null?" · "+Math.round(r.global)+" %":"")}
  return [v.typo,v.typoSub].filter(Boolean).join(" · ")||"Bien à préciser"}
function visAddr(v){return [[v.residence,v.num&&("N° "+v.num),v.rue].filter(Boolean).join(", "),[v.quartier,v.ville].filter(Boolean).join(", ")].filter(Boolean).join(" – ")}
function renderVisites(){
  const L=$("#visList");L.innerHTML="";const q=visQ.trim().toLowerCase();
  fillAuthorSel("#visByF",visites);const kf=$("#visKindF").value,bf=$("#visByF").value;const r=visites.filter(v=>(!kf||kindOf(v)===kf)&&(!bf||v.createdBy===bf)&&(!q||[v.ref,v.dossier,v.ville,v.quartier,v.rue,v.residence,v.typo,v.typeBien,(v.destination||[]).join(" "),KINDS[kindOf(v)].label,v.contact,v.visiteur,v.remarques].join(" ").toLowerCase().includes(q)))
    .sort((a,b)=>(b.date||"").localeCompare(a.date||"")||(b.createdAt||0)-(a.createdAt||0));
  $("#visCount").textContent=visites.length?visites.length+" fiche"+(visites.length>1?"s":""):"";
  if(!r.length){L.append(h("div",{class:"empty"},h("b",{text:visites.length?"Aucune fiche ne correspond.":"Aucune fiche de visite pour l’instant."}),h("p",{class:"meta",text:visites.length?"Change la recherche.":"Sur place, appuie sur « + Nouvelle fiche » : la date, le visiteur, la position GPS, la ville et le quartier se remplissent tout seuls, et Valtera propose les témoins proches comme éléments de référence."})));return}
  r.forEach(v=>{const done=v.status==="terminee",k=kindOf(v),kl=k==="bien"?"Bâti":k==="terrain"?"Terrain":"Avancement";
    L.append(h("article",{class:"vcard",tabindex:"0",onclick:()=>openVisite(v),onkeydown:e=>{if(e.key==="Enter"&&e.target===e.currentTarget)openVisite(v)}},
      h("div",{class:"vk k-"+k},ic(k==="bien"?"building":k==="terrain"?"terrain":"crane",30),h("span",{text:kl})),
      h("div",{class:"vbd"},
        h("div",{class:"top"},h("div",{class:"pills"},h("span",{class:"pill "+(done?"st-ok":"st-warn"),text:done?"Terminée":"Brouillon"}),isOwner()&&v.shared?h("span",{class:"pill st-share",text:"Partagée"}):null,v.createdBy&&v.createdBy!==ME.uid?h("span",{class:"pill st-by",text:"par "+(v.byName||v.visiteur||"un membre")}):null),h("span",{class:"date",text:v.date?new Date(v.date).toLocaleDateString("fr-FR"):""})),
        h("div",{class:"kv"},h("span",{class:"k",text:"Réf."}),h("span",{class:"v num",text:v.ref||"V-…"})),
        h("div",{class:"vt",text:visTitle(v)}),
        v.dossier?h("div",{class:"meta",text:"Dossier "+v.dossier}):null,
        h("div",{class:"vloc"},ic("pin",14),h("span",{text:visAddr(v)||"Adresse à compléter"})),
        h("div",{class:"meta",text:[v.visiteur,v.valeur?fmt(v.valeur)+" DH":"",(v.refs||[]).length?(v.refs.length+" référence"+(v.refs.length>1?"s":"")):"",(v.plans||[]).length?(v.plans.length+" croquis"):""].filter(Boolean).join(" · ")}),
        h("div",{class:"acts"},h("button",{class:"btn sm",type:"button",onclick:e=>{e.stopPropagation();downloadVisitePdf(v,e.currentTarget)}},ic("download",14),"PDF")))))})}
$("#visSearch").addEventListener("input",e=>{visQ=e.target.value;renderVisites()});
$("#visKindF").addEventListener("change",renderVisites);$("#visByF").addEventListener("change",renderVisites);

/* ---------- formulaire ---------- */
function chipsEl(key,opts,multi){const d=h("div",{class:"chips","data-k":key,role:"group"});
  opts.forEach(o=>d.append(h("button",{type:"button","data-v":o,"aria-pressed":"false",text:o,onclick:e=>{const b=e.currentTarget,on=b.getAttribute("aria-pressed")!=="true";
    if(!multi)d.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed","false"));b.setAttribute("aria-pressed",on?"true":"false");if(key==="typo")updTypoSub()}})));return d}
function buildVisForm(){
  const B=$("#visBody");B.innerHTML="";
  secsOf().forEach(s=>{const fs=h("fieldset",null,h("legend",{text:s.t}));if(s.note)fs.append(h("p",{class:"note",text:s.note}));
    const g=h("div",{class:"fgrid"});
    s.f.forEach(([k,l,type="text",opts,span])=>{
      if(type==="chips"||type==="multi"){g.append(h("div",{class:"fchips s-all"},h("span",{class:"lbl",text:l}),chipsEl(k,opts||[],type==="multi")));return}
      if(type==="gps"){g.append(h("label",{class:"s2"},l,h("div",{class:"gpsrow"},h("input",{id:"v_gps",inputmode:"decimal",placeholder:"33.5731, -7.5898",autocomplete:"off"}),h("button",{class:"btn sm",type:"button",id:"vGpsMe",text:"Ma position",onclick:visGpsMe}),h("button",{class:"btn sm",type:"button",id:"vGpsPick",text:"Sur la carte",onclick:()=>visPickMap()})),
        h("div",{class:"geost"},h("span",{class:"note",id:"vGeoSt"}),h("button",{type:"button",class:"linkbtn",text:"Actualiser l’adresse",onclick:()=>visGeocode(true)}))));return}
      if(type==="area"){g.append(h("label",{class:"s-all"},l,h("textarea",{id:"v_"+k,rows:span||3})));return}
      g.append(h("label",{class:span===2?"s2":null},l,h("input",{id:"v_"+k,type:type==="num"?"text":type,inputmode:type==="num"?"decimal":null,autocomplete:"off",placeholder:VIS_PH[k]||null})))});
    fs.append(g);
    if(s.rooms){fs.insertBefore(h("div",{class:"rooms"},h("div",{class:"tblwrap flat"},h("table",{class:"t",id:"vRooms"})),h("button",{class:"btn sm",type:"button",text:"+ Ajouter une pièce",onclick:()=>{addRoom({});}})),g)}
    if(s.lots){fs.append(h("div",{class:"lots",id:"vLots"}),h("div",{class:"lotfoot"},h("button",{class:"btn sm",type:"button",text:"+ Ajouter un lot",onclick:()=>{addLot({lot:"",sous:[{n:""}]});updAv()}}),h("div",{class:"avglob",id:"vAvGlob"})))}
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
/* ---------- état d'avancement : lots et sous-lots ---------- */
const pctIn=x=>{const n=numIn(x);return n==null?null:Math.max(0,n)};
function avCalc(lots){const out=[];
  lots.forEach(lt=>{const ss=(lt.sous||[]).filter(x=>x.n||x.av!=null);if(!ss.length){out.push({av:null});return}
    const useW=ss.some(x=>x.pct>0),W=ss.map(x=>useW?(x.pct||0):1),sw=W.reduce((a,b)=>a+b,0);
    const any=ss.some(x=>x.av!=null);out.push({av:any&&sw?ss.reduce((a,x,i)=>a+W[i]*(x.av||0),0)/sw:null})});
  const ok=lots.map((lt,i)=>({lt,av:out[i].av})).filter(x=>x.av!=null);if(!ok.length)return {lots:out,global:null,basis:""};
  let basis="pct",w=ok.map(x=>x.lt.pct||0);if(!w.some(x=>x>0)){basis="budget";w=ok.map(x=>x.lt.budget||0)}if(!w.some(x=>x>0)){basis="egal";w=ok.map(()=>1)}
  const sw=w.reduce((a,b)=>a+b,0);return {lots:out,global:ok.reduce((a,x,i)=>a+w[i]*x.av,0)/sw,basis}}
function addLot(lt){const box=$("#vLots");
  const el=h("div",{class:"lot"});
  const head=h("div",{class:"lothead"},h("input",{class:"lotname",value:lt.lot||"",placeholder:"Nom du lot","aria-label":"Lot"}),
    h("label",{class:"mini"},"% du lot",h("input",{"data-f":"pct",inputmode:"decimal",value:lt.pct!=null?plain(lt.pct):"",placeholder:"—"})),
    h("label",{class:"mini"},"Budget (DH)",h("input",{"data-f":"budget",inputmode:"decimal",value:lt.budget!=null?plain(lt.budget):"",placeholder:"—"})),
    h("span",{class:"lotav num"}),h("button",{class:"btn sm",type:"button",text:"✕","aria-label":"Retirer le lot",onclick:()=>{el.remove();updAv()}}));
  const rows=h("div",{class:"sous"});
  el.append(head,rows,h("button",{class:"linkbtn",type:"button",text:"+ Sous-lot",onclick:()=>{addSous(rows,{});updAv()}}));
  (lt.sous&&lt.sous.length?lt.sous:[{}]).forEach(x=>addSous(rows,x));box.append(el)}
function addSous(rows,x){const r=h("div",{class:"srow"});
  const rng=h("input",{type:"range",min:0,max:100,step:5,value:x.av!=null?x.av:0,"aria-label":"Avancement"}),num=h("input",{class:"avn",inputmode:"decimal",value:x.av!=null?plain(x.av):"",placeholder:"%","aria-label":"Avancement en %"});
  rng.classList.toggle("unset",x.av==null);
  rng.addEventListener("input",()=>{num.value=rng.value;rng.classList.remove("unset");updAv()});num.addEventListener("input",()=>{const n=pctIn(num.value);if(n!=null){rng.value=Math.min(100,n);rng.classList.remove("unset")}else rng.classList.add("unset");updAv()});
  r.append(h("input",{class:"sname",value:x.n||"",placeholder:"Sous-lot","aria-label":"Sous-lot"}),h("label",{class:"mini"},"% sous-lot",h("input",{"data-f":"spct",inputmode:"decimal",value:x.pct!=null?plain(x.pct):"",placeholder:"—"})),
    h("div",{class:"avbox"},rng,num,h("span",{class:"meta",text:"%"})),h("button",{class:"btn sm",type:"button",text:"✕","aria-label":"Retirer le sous-lot",onclick:()=>{r.remove();updAv()}}));rows.append(r)}
function lotFromEl(el){return {lot:el.querySelector(".lotname").value.trim(),pct:pctIn(el.querySelector('[data-f="pct"]').value),budget:pctIn(el.querySelector('[data-f="budget"]').value),
  sous:[...el.querySelectorAll(".srow")].map(r=>({n:r.querySelector(".sname").value.trim(),pct:pctIn(r.querySelector('[data-f="spct"]').value),av:pctIn(r.querySelector(".avn").value)})).filter(x=>x.n||x.av!=null)}}
function readLots(){return [...$$("#vLots .lot")].map(lotFromEl).filter(l=>l.lot||l.sous.length)}
function updAv(){$$("#vLots .lot").forEach(el=>{const av=avCalc([lotFromEl(el)]).lots[0].av;el.querySelector(".lotav").textContent=av!=null?Math.round(av)+" %":"—"});
  const r=avCalc(readLots()),g=$("#vAvGlob");if(!g)return;g.replaceChildren(h("span",{class:"meta",text:"Avancement global"}),h("b",{class:"num",text:r.global!=null?Math.round(r.global)+" %":"—"}),
    h("span",{class:"meta",text:r.basis==="pct"?"pondéré par les % des lots":r.basis==="budget"?"pondéré par les budgets":r.basis==="egal"?"lots comptés à égalité (mets les % par lot ou les budgets pour pondérer)":""}))}
$("#visBody").addEventListener("input",e=>{if(e.target.closest("#vLots"))updAv()});

function openVisite(v,preset){
  if(!canVisites()){toast(errMsg({code:"permission-denied"}));return}
  visEditing=v||null;visDelArmed=false;$("#visDel").classList.remove("arm");$("#visDel").textContent="Supprimer";
  visKind=v?kindOf(v):(KINDS[preset?.kind]?preset.kind:"bien");
  buildVisForm();const d=v||{date:new Date().toISOString().slice(0,10),visiteur:ME.name,...(visKind==="bien"?{pieces:ROOM_DEF.map(p=>({piece:p}))}:{}),...(visKind==="avancement"?{lots:LOTS_DEF.map(([lot,ss])=>({lot,sous:ss.map(n=>({n}))}))}:{}),...(preset||{})};
  fieldsOf().forEach(([k,l,type])=>{if(type==="chips"||type==="multi"){if(k!=="typoSub")setChips(k,d[k]||(type==="multi"?[]:""));return}const e=$("#v_"+k);if(e)e.value=d[k]!=null?(type==="num"?plain(d[k]):d[k]):""});
  if(visKind==="bien"){updTypoSub(d.typoSub||"");(d.pieces||[]).forEach(addRoom);if(!(d.pieces||[]).length)ROOM_DEF.forEach(p=>addRoom({piece:p}))}
  if(visKind==="avancement"){(d.lots||[]).forEach(addLot);updAv()}
  visPhotos=[...(d.photos||[])];renderVisThumbs();visRefs=[...(d.refs||[])];renderRefs();const rp=$("#vRefPick");if(rp)rp.innerHTML="";
  $("#visTitle").textContent=v?(v.ref?v.ref+" · ":"")+KINDS[visKind].label+(v.dossier?" · dossier "+v.dossier:""):KINDS[visKind].nouv;
  $("#visDone").checked=d.status==="terminee";$("#visDel").hidden=!v||!isOwner();$("#visTemoin").hidden=!v||visKind==="avancement";$("#visNote").textContent="";
  $("#visShare").hidden=!canSharePdf();
  visRO=!!v&&!isOwner()&&v.createdBy!==ME.uid;
  if(visRO)$("#visBody").querySelectorAll("input,textarea,select,button").forEach(e=>e.disabled=true);
  $("#visSave").hidden=visRO;$("#visDoneL").hidden=visRO;if(visRO)$("#visTemoin").hidden=true;
  $("#visSharedL").hidden=!isOwner();$("#visShared").checked=!!d.shared;
  if(visRO){$("#visNote").textContent="Fiche de "+(v.byName||"l’équipe")+" : lecture seule.";$("#visSigHint").textContent=""}
  ckMount(d);
  updSigHint();
  $("#visDlg").showModal();$("#visDlg").scrollTop=0;
  if(!v&&!d.gps)visGpsMe(true);
}
function readVisite(){
  const o={kind:visKind};fieldsOf().forEach(([k,l,type])=>{if(type==="chips")o[k]=getChips(k);else if(type==="multi")o[k]=getChips(k,true);else{const e=$("#v_"+k);if(!e)return;const val=e.value.trim();o[k]=type==="num"?(val===""?null:(SURF_KEYS.has(k)?surfIn(val):numIn(val))):val}});
  o.gps=$("#v_gps").value.trim();const g=coordsFrom(o.gps);if(g)o.gps=gpsStr(g);
  if(visKind==="bien")o.pieces=readRooms();if(visKind==="avancement")o.lots=readLots();o.refs=[...visRefs];o.photos=[...visPhotos];o.plans=JSON.parse(JSON.stringify(visPlans||[]));o.status=$("#visDone").checked?"terminee":"brouillon";o.shared=isOwner()?$("#visShared").checked:!!visEditing?.shared;return o}
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
function chooseKind(preset){$("#kindDlg").showModal();$("#kindDlg").dataset.preset=JSON.stringify(preset||{})}
$$("#kindDlg .kindopt").forEach(b=>b.onclick=()=>{let p={};try{p=JSON.parse($("#kindDlg").dataset.preset||"{}")}catch(e){}$("#kindDlg").close();openVisite(null,{...p,kind:b.dataset.kind});if(p.gps)autoPlace()});
$("#visAdd").onclick=()=>chooseKind();

/* ---------- remplissage automatique : position, ville, quartier ---------- */
async function visGpsMe(silent){const b=$("#vGpsMe");if(!b)return;b.disabled=true;b.textContent="Recherche…";
  try{const [la,lo,acc]=await getPos();if(!$("#visDlg").open)return;$("#v_gps").value=gpsStr([+la.toFixed(6),+lo.toFixed(6)]);autoPlace();if(silent!==true)toast("Position enregistrée (± "+Math.round(acc||0)+" m)")}
  catch(e){if(silent!==true)geoErr(e)}
  b.disabled=false;b.textContent="Ma position"}
function nearest(g,maxM){return items.map(c=>({c,g:gpsOf(c)})).filter(x=>x.g).map(x=>({c:x.c,d:distM(g,x.g)})).filter(x=>x.d<=maxM).sort((a,b)=>a.d-b.d)}
function autoPlace(){const g=coordsFrom($("#v_gps").value);if(!g)return;const n=nearest(g,900);
  const pick=k=>{const cnt={};n.slice(0,15).forEach(x=>{const v=(x.c[k]||"").trim();if(v)cnt[v]=(cnt[v]||0)+1});return Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0]?.[0]||""};
  const put=(k,v)=>{const e=$("#v_"+k);if(v&&(!e.value.trim()||e.dataset.auto==="1")){e.value=v;e.dataset.auto="1"}};
  put("ville",pick("city"));put("quartier",pick("district"));visGeocode()}
$("#visBody").addEventListener("change",e=>{if(e.target.id==="v_gps")autoPlace()});

/* ---------- éléments de référence (témoins) ---------- */
const TYPO_TO_TYPE={"Maison":["Maison","Villa"],"Appartement":["Appartement"],"Villa":["Villa","Maison"],"Local commercial":["Local commercial"],"Usine":["Usine","Entrepôt / dépôt"]};
function refOrigin(c){const s=(c.source+" "+c.nature+" "+c.contactName).toLowerCase();return /agence|agenz|mubawab|avito|sax|immo/.test(s)?"Ag. immob":"Particulier"}
function renderRefs(){const T=$("#vRefTbl");if(!T)return;T.innerHTML="";const g=coordsFrom($("#v_gps")?.value||"");
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
  const types=visKind==="terrain"?["Terrain"]:visKind==="avancement"?null:(TYPO_TO_TYPE[getChips("typo")]||null);
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
function visText(v){const L=[],k=kindOf(v);L.push(KINDS[k].label.toUpperCase()+(v.dossier?" – Dossier "+v.dossier:""));
  L.push("Date : "+(v.date?new Date(v.date).toLocaleDateString("fr-FR"):"")+" · Visiteur : "+(v.visiteur||""));
  secsOf(k).forEach(s=>{const parts=s.f.map(([k,l])=>{const x=v[k];if(x==null||x===""||(Array.isArray(x)&&!x.length))return null;if(k==="dossier"||k==="date"||k==="visiteur")return null;return l+" : "+(Array.isArray(x)?x.join(", "):typeof x==="number"?plain(x):x)}).filter(Boolean);
    if(s.rooms&&(v.pieces||[]).length)parts.unshift(...v.pieces.map(p=>[p.piece,[p.sol,p.murs,p.plafond,p.menuiserie].filter(Boolean).join(" / ")].filter(Boolean).join(" : ")));
    if(s.lots&&(v.lots||[]).length){const r=avCalc(v.lots);v.lots.forEach((lt,i)=>parts.push(lt.lot+" : "+(r.lots[i].av!=null?Math.round(r.lots[i].av)+" %":"—")+" ("+lt.sous.filter(x=>x.n).map(x=>x.n+" "+(x.av!=null?x.av+" %":"—")).join(", ")+")"));if(r.global!=null)parts.push("Avancement global : "+Math.round(r.global)+" %")}
    if(s.refs&&(v.refs||[]).length)parts.push("Références : "+v.refs.map(id=>{const c=items.find(x=>x.id===id);return c?(c.ref||"")+" "+(c.type||"")+" "+fmt(c.price)+priceSuf(c.tx):""}).filter(Boolean).join(" ; "));
    if(parts.length){L.push("");L.push(s.t.toUpperCase());parts.forEach(p=>L.push("- "+p))}});
  return L.join("\n")}
function canSharePdf(){try{return !!navigator.canShare&&navigator.canShare({files:[new File([""],"a.pdf",{type:"application/pdf"})]})}catch(e){return false}}
const visCur=()=>({createdBy:ME.uid,...(visEditing||{}),...readVisite()});
$("#visPdf").onclick=e=>downloadVisitePdf(visCur(),e.currentTarget);
$("#visShare").onclick=e=>downloadVisitePdf(visCur(),e.currentTarget);
$("#visCopy").onclick=e=>copyText(visText({...(visEditing||{}),...readVisite()}),e.target);
$("#visTemoin").onclick=()=>{const v={...(visEditing||{}),...readVisite()};$("#visDlg").close();openForm();
  const map={"Maison":"Maison","Appartement":"Appartement","Villa":"Villa","Local commercial":"Local commercial","Usine":"Usine"};const t=kindOf(v)==="terrain"?"Terrain":(map[v.typo]||"Autre");
  ensureOpt($("#f_type"),t);$("#f_type").value=t;$("#f_type").dispatchEvent(new Event("change"));
  const set=(id,x)=>{const e=$("#"+id);if(e&&x!=null&&x!==""){e.value=x;e.dispatchEvent(new Event("input"))}};
  set("f_sMain",v.sConst!=null?plain(v.sConst):"");set("f_sLand",v.sTerrain!=null?plain(v.sTerrain):"");set("f_price",v.valeur!=null?plain(v.valeur):"");
  set("f_gps",v.gps);set("f_city",v.ville);set("f_district",v.quartier);set("f_address",[v.residence,v.num&&("N° "+v.num),v.rue].filter(Boolean).join(", "));
  set("f_dossier",v.dossier);set("f_date",v.date);set("f_floor",v.etage);set("f_age",numIn(v.age)!=null?plain(numIn(v.age)):"");set("f_rooms",v.piecesTot!=null?String(v.piecesTot):"");
  ensureOpt($("#f_nature"),"Expertise");$("#f_nature").value="Expertise";set("f_source","Fiche de visite "+(v.ref||""));set("f_code",v.ref||"");
  set("f_notes","Valeur estimée lors de la visite "+(v.ref||"")+(v.remarques?" – "+v.remarques:""));updCalc()};
/* ===================== adresse automatique à partir des coordonnées (OpenStreetMap) ===================== */
const GEO_CACHE={};
const HW_RE=/^(motorway|trunk|primary|secondary|tertiary|unclassified|residential|living_street|pedestrian|road)(_link)?$/;
const OVERPASS=["https://overpass.private.coffee/api/interpreter","https://overpass-api.de/api/interpreter","https://overpass.kumi.systems/api/interpreter"];
/* garde la partie en lettres latines quand un nom mélange arabe et français */
function latinName(s){s=String(s||"").trim();if(!/[؀-ۿ]/.test(s))return s;
  const lat=s.replace(/[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]+/g," ").replace(/^[\s\-–\/|,()]+|[\s\-–\/|,()]+$/g,"").replace(/\s*[\-–\/|]\s*$/,"").replace(/\s{2,}/g," ").trim();
  return /[A-Za-zÀ-ÿ]{3}/.test(lat)?lat:s}
function toXY(lat,lng,lat0){const k=111320;return [lng*k*Math.cos(lat0*Math.PI/180),lat*k]}
function distSeg(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],l=dx*dx+dy*dy;let t=l?((p[0]-a[0])*dx+(p[1]-a[1])*dy)/l:0;t=Math.max(0,Math.min(1,t));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)}
async function fetchJson(url,opt,ms=12000){const c=new AbortController(),tm=setTimeout(()=>c.abort(),ms);
  try{const r=await fetch(url,{...(opt||{}),signal:c.signal});if(!r.ok)throw {code:"http"+r.status};return await r.json()}finally{clearTimeout(tm)}}
const STREET_CACHE={},NOM_CACHE={};
async function nearStreets(lat,lng){const key=lat.toFixed(5)+","+lng.toFixed(5);if(STREET_CACHE[key])return STREET_CACHE[key];
  const q="[out:json][timeout:12];way(around:45,"+lat+","+lng+")[highway][name];out tags geom;";
  const j=await Promise.any(OVERPASS.map(u=>fetchJson(u+"?data="+encodeURIComponent(q),null,16000).then(x=>{if(!x||!Array.isArray(x.elements))throw 0;return x})));
  const p=toXY(lat,lng,lat),best={};
  j.elements.forEach(w=>{const t=w.tags||{};if(!HW_RE.test(t.highway||"")||!w.geometry||!w.geometry.length)return;
    const n=latinName(t["name:fr"]||t.name);if(!n)return;const pts=w.geometry.map(g=>toXY(g.lat,g.lon,lat));
    let d=pts.length===1?Math.hypot(p[0]-pts[0][0],p[1]-pts[0][1]):Infinity;for(let i=1;i<pts.length;i++)d=Math.min(d,distSeg(p,pts[i-1],pts[i]));
    const k=n.toLowerCase();if(!best[k]||d<best[k].d)best[k]={n,d}});
  return STREET_CACHE[key]=Object.values(best).sort((a,b)=>a.d-b.d)}
function streetLine(streets){if(!streets||!streets.length)return null;const [s1,s2]=streets;
  if(s2&&s1.d<=40&&s2.d<=30)return {rue:"Angle "+s1.n+" et "+s2.n,angle:true};if(s1.d<=45)return {rue:s1.n,angle:false};return null}
const ADMIN_RE=/^(arrondissement|préfecture|prefecture|pachalik|commune|province|cercle|caïdat|caidat)\b/i;
async function nomAddr(lat,lng){const key=lat.toFixed(5)+","+lng.toFixed(5);if(NOM_CACHE[key])return NOM_CACHE[key];
  const n=await fetchJson("https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=18&accept-language=fr&lat="+lat+"&lon="+lng,null,12000);
  const a=n?.address||{};const ville=latinName(a.city||a.town||a.village||"");
  const quartier=latinName([a.quarter,a.neighbourhood,a.suburb,a.city_district].find(x=>x&&!ADMIN_RE.test(x))||"");
  const commune=latinName([a.suburb,a.city_district,a.municipality,a.county].find(x=>x&&/^(arrondissement|commune)\b/i.test(x))||a.municipality||ville);
  const adm=v=>latinName(v||"").replace(/^(r[ée]gion|province|pr[ée]fecture(\s+d['’]arrondissements)?|pachalik|cercle)\s+(de\s+la\s+|de\s+l['’]|de\s+|d['’]\s*|du\s+|des\s+)?/i,"").trim();
  return NOM_CACHE[key]={rue:latinName(a.road||a.pedestrian||""),num:a.house_number||"",quartier,ville,commune,codePostal:a.postcode||"",region:adm(a.state),province:adm(a.state_district||a.county)}}
async function reverseAddr(lat,lng){const [nom,st]=await Promise.all([nomAddr(lat,lng).catch(()=>null),nearStreets(lat,lng).catch(()=>null)]);
  if(!nom&&!st)throw {code:"geo"};const sl=streetLine(st);return {...(nom||{}),rue:sl?.rue||nom?.rue||"",angle:!!sl?.angle}}

/* fiche de visite : remplit les champs vides ou déjà remplis automatiquement (jamais ce que tu as tapé toi-même) */
let geoSeq=0;
async function visGeocode(force){const g=coordsFrom($("#v_gps")?.value||"");const st=$("#vGeoSt");if(!g||!st)return;const seq=++geoSeq;
  if(!navigator.onLine){st.textContent="Hors ligne : l’adresse se complète à la main (ville et quartier proposés d’après les témoins proches).";return}
  st.textContent="Recherche de l’adresse…";
  const live=()=>seq===geoSeq&&$("#visDlg").open;
  const put=(k,v)=>{const e=$("#v_"+k);if(!e||!v)return;if(force||!e.value.trim()||e.dataset.auto==="1"){e.value=v;e.dataset.auto="1"}};
  let nom=null,sl=null,done=0;
  const msg=()=>{if(!live())return;const rue=$("#v_rue").value;
    st.textContent=sl?.angle?"Angle trouvé sur OpenStreetMap : "+sl.rue+". Vérifie sur place.":done<2?"Adresse trouvée"+(rue?" : "+rue:"")+". Recherche d’un angle de rues…":rue?"Rue trouvée sur OpenStreetMap : "+rue+". Vérifie sur place.":nom||sl?"Adresse partielle trouvée sur OpenStreetMap : complète la rue.":"Adresse introuvable pour ce point : complète à la main."};
  const pN=nomAddr(g[0],g[1]).then(r=>{nom=r;if(!live())return;if(!sl)put("rue",r.rue);put("num",r.num);put("quartier",r.quartier);put("ville",r.ville);put("commune",r.commune);put("codePostal",r.codePostal)}).catch(()=>{}).finally(()=>{done++;msg()});
  const pS=nearStreets(g[0],g[1]).then(r=>{sl=streetLine(r);if(live()&&sl)put("rue",sl.rue)}).catch(()=>{}).finally(()=>{done++;msg()});
  await Promise.all([pN,pS])}
$("#visBody").addEventListener("input",e=>{if(e.target.dataset&&e.target.dataset.auto)delete e.target.dataset.auto});

/* fiche témoin : complète l'adresse, le quartier et la ville s'ils sont vides */
/* témoin : ville, quartier et rue depuis les coordonnées, en deux temps (OpenStreetMap d'abord, les rues d'angle ensuite) ; ne remplace jamais ce qui est déjà écrit */
let temSeq=0;
async function temGeocode(){const g=coordsFrom($("#f_gps").value);if(!g||!navigator.onLine)return;const seq=++temSeq;
  const live=()=>seq===temSeq&&$("#dlg").open&&String(coordsFrom($("#f_gps").value))===String(g);let n=0,rue="";
  const put=(id,v)=>{const e=$(id);if(e&&v&&!e.value.trim()){e.value=v;e.dispatchEvent(new Event("input"));n++}};
  const city=v=>{if(v&&!$("#f_city").value.trim()){ensureOpt($("#f_city"),v);$("#f_city").value=v;$("#f_city").dispatchEvent(new Event("change"));n++}};
  try{const r=await nomAddr(g[0],g[1]);if(!live())return;put("#f_district",r.quartier);city(r.ville);put("#f_commune",r.commune);put("#f_province",r.province);put("#f_region",r.region);put("#f_cp",r.codePostal);if(r.rue){put("#f_address",r.rue);rue=r.rue}}catch(e){}
  if(n)toast("Ville et quartier complétés depuis OpenStreetMap");
  try{const sl=streetLine(await nearStreets(g[0],g[1]));if(!live()||!sl?.rue)return;const a=$("#f_address");
    if(!a.value.trim()||(rue&&a.value===rue&&sl.angle)){a.value=sl.rue;a.dispatchEvent(new Event("input"));toast("Adresse : "+sl.rue)}}catch(e){}}
/* ===================== signature du visiteur ===================== */
const SIG={};
async function getSignature(uid){uid=uid||ME.uid;if(!uid)return null;if(SIG[uid]!==undefined)return SIG[uid];
  const ref=fdb.doc("signatures/"+uid);let d=null;try{d=await ref.get({source:"cache"})}catch(e){}
  try{if(!d||!d.exists)d=await ref.get()}catch(e){}
  SIG[uid]=d&&d.exists?d.data().data||null:null;return SIG[uid]}
let sigCtx=null,sigDirty=false,sigDrawing=false,sigLast=null;
function sigCanvas(){return $("#sigPad")}
function sigReset(){const c=sigCanvas(),r=c.getBoundingClientRect(),dpr=window.devicePixelRatio||1;c.width=Math.round(r.width*dpr);c.height=Math.round(r.height*dpr);
  sigCtx=c.getContext("2d");sigCtx.setTransform(dpr,0,0,dpr,0,0);sigCtx.lineCap="round";sigCtx.lineJoin="round";sigCtx.strokeStyle="#14233a";sigCtx.lineWidth=2.4;sigDirty=false}
function sigPos(e){const r=sigCanvas().getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top]}
function sigInit(){const c=sigCanvas();
  c.addEventListener("pointerdown",e=>{e.preventDefault();c.setPointerCapture(e.pointerId);sigDrawing=true;sigLast=sigPos(e);sigCtx.beginPath();sigCtx.arc(sigLast[0],sigLast[1],1.1,0,7);sigCtx.fillStyle="#14233a";sigCtx.fill();sigDirty=true});
  c.addEventListener("pointermove",e=>{if(!sigDrawing)return;const p=sigPos(e);sigCtx.beginPath();sigCtx.moveTo(sigLast[0],sigLast[1]);
    const m=[(sigLast[0]+p[0])/2,(sigLast[1]+p[1])/2];sigCtx.quadraticCurveTo(sigLast[0],sigLast[1],m[0],m[1]);sigCtx.lineTo(p[0],p[1]);sigCtx.stroke();sigLast=p});
  ["pointerup","pointercancel"].forEach(t=>c.addEventListener(t,()=>{sigDrawing=false}))}
/* recadre l'image sur le tracé et rend le fond transparent */
function sigClean(src,fromPhoto){const w=src.width,h=src.height,ctx=src.getContext("2d"),img=ctx.getImageData(0,0,w,h),d=img.data;
  let x0=w,y0=h,x1=-1,y1=-1;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;let a=d[i+3];
    if(fromPhoto){const l=.3*d[i]+.59*d[i+1]+.11*d[i+2];a=l<120?255:l<170?Math.round((170-l)/50*255):0;d[i]=20;d[i+1]=35;d[i+2]=58;d[i+3]=a}
    if(a>40){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}}
  if(x1<0)return null;ctx.putImageData(img,0,0);
  const pad=6,cw=x1-x0+1+pad*2,ch=y1-y0+1+pad*2,s=Math.min(1,600/cw,220/ch),out=document.createElement("canvas");
  out.width=Math.round(cw*s);out.height=Math.round(ch*s);out.getContext("2d").drawImage(src,x0-pad,y0-pad,cw,ch,0,0,out.width,out.height);return out.toDataURL("image/png")}
async function openSignature(){if(!ME.uid)return;$("#sigNote").textContent="";$("#sigDlg").showModal();sigReset();
  const cur=await getSignature();$("#sigCur").hidden=!cur;if(cur)$("#sigCurImg").src=cur}
$("#sigClear").onclick=()=>{sigReset()};
$("#sigFile").onchange=async e=>{const f=e.target.files[0];e.target.value="";if(!f)return;
  const img=new Image();img.onload=()=>{const s=Math.min(1,1400/Math.max(img.width,img.height)),c=document.createElement("canvas");c.width=Math.round(img.width*s);c.height=Math.round(img.height*s);
    c.getContext("2d").drawImage(img,0,0,c.width,c.height);const data=sigClean(c,true);URL.revokeObjectURL(img.src);
    if(!data){$("#sigNote").textContent="Aucune signature trouvée sur la photo : prends-la sur une feuille blanche, bien éclairée.";return}
    saveSignature(data)};img.src=URL.createObjectURL(f)};
$("#sigImport").onclick=()=>$("#sigFile").click();
$("#sigSave").onclick=()=>{if(!sigDirty){$("#sigNote").textContent="Signe d’abord dans le cadre.";return}const data=sigClean(sigCanvas(),false);if(!data){$("#sigNote").textContent="Signe d’abord dans le cadre.";return}saveSignature(data)};
async function saveSignature(data){if(data.length>250000){$("#sigNote").textContent="Signature trop lourde : recommence plus simplement.";return}
  $("#sigSave").disabled=true;
  try{await commitSoft(fdb.doc("signatures/"+ME.uid).set({data,updatedAt:Date.now()}));SIG[ME.uid]=data;$("#sigCur").hidden=false;$("#sigCurImg").src=data;sigReset();toast("Signature enregistrée : elle sera ajoutée à tes fiches.");updSigHint()}
  catch(e){$("#sigNote").textContent=errMsg(e)}
  $("#sigSave").disabled=false}
$("#sigDel").onclick=async()=>{try{await commitSoft(fdb.doc("signatures/"+ME.uid).delete());SIG[ME.uid]=null;$("#sigCur").hidden=true;toast("Signature retirée");updSigHint()}catch(e){$("#sigNote").textContent=errMsg(e)}};
$("#mSig").onclick=()=>{closeMenu();openSignature()};
async function updSigHint(){const el=$("#visSigHint");if(!el)return;if(visRO){el.textContent="";return}const owner=visEditing?.createdBy||ME.uid;const s=await getSignature(owner);
  el.replaceChildren(s?"Signature ajoutée automatiquement au PDF.":"",s?"":h("button",{type:"button",class:"linkbtn",text:"Ajouter ma signature",onclick:openSignature}))}
sigInit();

/* ===================== fiche de visite en PDF (mise en page de la fiche papier) ===================== */
let pdfLibs=null;
function loadScript(src){return new Promise((res,rej)=>{const s=document.createElement("script");s.src=src;s.onload=res;s.onerror=()=>rej({code:"pdf-lib"});document.head.append(s)})}
function ensurePdf(){if(window.jspdf?.jsPDF?.API?.autoTable)return Promise.resolve();
  return pdfLibs||(pdfLibs=loadScript("vendor/jspdf/jspdf.umd.min.js").then(()=>loadScript("vendor/jspdf/jspdf.plugin.autotable.min.js")).catch(e=>{pdfLibs=null;throw e}))}
const pt=v=>String(v??"").replace(/²/g,"2").replace(/[’‘]/g,"'").replace(/[“”«»]/g,'"').replace(/ | /g," ");
async function pdfKit(){
  await ensurePdf();const {jsPDF}=window.jspdf;const doc=new jsPDF({unit:"mm",format:"a4"});
  const M=10,W=210-2*M,teal=[13,92,99],line=[150,160,165];
  const K={doc,M,W,teal,y:M};
  K.X=cond=>cond?"X":"";K.val=x=>x==null||x===""?"":typeof x==="number"?pt(plain(x)):pt(Array.isArray(x)?x.join(", "):x);
  const base={theme:"grid",margin:{left:M,right:M},tableWidth:W,styles:{font:"helvetica",fontSize:8,cellPadding:1,lineColor:line,lineWidth:.2,textColor:[20,30,35],valign:"middle",overflow:"linebreak"},
    headStyles:{fillColor:[234,241,241],textColor:[20,30,35],fontStyle:"bold",halign:"center"},bodyStyles:{minCellHeight:4.6}};
  K.title=t=>{if(K.y>287-14){doc.addPage();K.y=M}K.y+=3.4;doc.setFont("helvetica","bold");doc.setFontSize(10);doc.setTextColor(20,30,35);doc.text(pt(t),M,K.y);K.y+=1.2};
  const check=d=>{if(d.section!=="body"||!d.cell.raw||!d.cell.raw._check)return;const cx=d.cell.x+d.cell.width/2,cy=d.cell.y+d.cell.height/2,s=Math.min(1.25,d.cell.height/5.2);
    doc.setDrawColor(...teal);doc.setLineWidth(.55);doc.setLineCap("round");doc.setLineJoin("round");doc.lines([[1.25*s,1.35*s],[2.35*s,-2.9*s]],cx-1.75*s,cy+.05*s,[1,1],"S",false);doc.setLineWidth(.2)};
  K.tbl=o=>{const own=o.didDrawCell;doc.autoTable({...base,startY:K.y,...o,styles:{...base.styles,...(o.styles||{})},didDrawCell:d=>{check(d);if(own)own(d)}});K.y=doc.lastAutoTable.finalY};
  K.c=(t,o)=>({content:pt(t),...(o||{})});K.b=t=>K.c(t,{styles:{fontStyle:"bold"}});
  K.xc=t=>t==="X"?{content:"",_check:true}:K.c(t,{styles:{halign:"center",fontStyle:"bold",textColor:teal}});
  K.hc=t=>K.c(t,{styles:{halign:"center"}});
  K.head=t=>{doc.setFont("helvetica","bold");doc.setFontSize(16);doc.setTextColor(20,30,35);doc.text(pt(t),105,K.y+6,{align:"center"});K.y+=10};
  K.dateFr=v=>v.date?new Date(v.date+"T12:00:00").toLocaleDateString("fr-FR"):"";
  K.valeur=v=>{K.y+=2.5;K.tbl({body:[[K.c("Valeur du bien estimée :",{styles:{fontStyle:"bold",fillColor:[234,241,241]}}),K.c(v.valeur!=null&&v.valeur!==""?pt(fmt(v.valeur))+" DH":"",{styles:{fontStyle:"bold",fontSize:10}})]],columnStyles:{0:{cellWidth:60}}})};
  K.checks=(labels,on,o)=>K.tbl({head:[labels.map(l=>K.c(l))],body:[labels.map(l=>K.xc(K.X(on.includes(l))))],...(o||{})});
  K.equip=v=>{const {c,xc,X,tbl}=K;const eq=["eqCommercial","eqLoisirs","eqScolaire","eqSante","eqSportif"];
    tbl({styles:{fontSize:7.8,cellPadding:1},head:[[...["Commercial","Loisirs","Scolaire","Santé","Sportif"].map(t=>c(t,{colSpan:3})),c("Religieux",{colSpan:2}),c("Bus",{colSpan:2})]],
      body:[[...eq.flatMap(()=>["B","M","F"]),"SUF","INS","O","N"].map(t=>c(t,{styles:{halign:"center"}})),
        [...eq.flatMap(k=>["B","M","F"].map(o=>X(v[k]===o))),X(v.eqReligieux==="Suffisant"),X(v.eqReligieux==="Insuffisant"),X(v.eqBus==="Oui"),X(v.eqBus==="Non")].map(xc)]})};
  K.sign=async v=>{const sig=await getSignature(v.createdBy||ME.uid);if(K.y>287-31){doc.addPage();K.y=M}
    K.y+=2.5;K.tbl({head:[[K.c("Remarques :",{styles:{halign:"left"}}),K.c("Signature visiteur :",{styles:{halign:"left"}})]],body:[[K.c(K.val(v.remarques)),K.c(sig?"":pt(v.visiteur||""),{styles:{minCellHeight:22,valign:"bottom",fontSize:7.5,textColor:[90,100,105]}})]],
      columnStyles:{1:{cellWidth:62}},bodyStyles:{minCellHeight:22,valign:"top"},
      didDrawCell:d=>{if(d.section==="body"&&d.column.index===1&&sig){try{const p=doc.getImageProperties(sig),r=Math.min((d.cell.width-6)/p.width,(d.cell.height-9)/p.height),w=p.width*r,hh=p.height*r;
        doc.addImage(sig,"PNG",d.cell.x+(d.cell.width-w)/2,d.cell.y+2,w,hh);doc.setFontSize(7.5);doc.setTextColor(90,100,105);doc.text(pt(v.visiteur||""),d.cell.x+d.cell.width/2,d.cell.y+d.cell.height-2,{align:"center"})}catch(e){}}}})};
  K.head4=(v,third)=>{const {b,c,val,tbl}=K;tbl({body:[
    [b("Numéro du dossier"),c(val(v.dossier)),b("Ville :"),c(val(v.ville)),b("Rue :"),c(val(v.rue))],
    [b("Visiteur"),c(val(v.visiteur)),b("Quartier :"),c(val(v.quartier)),b("N° :"),c(val(v.num))],
    [b("Date de la visite"),c(K.dateFr(v)),b(third[0]),c(val(third[1])),b("Code postal :"),c(val(v.codePostal))],
    [b("Contact"),c([v.contact,v.contactTel].filter(Boolean).join(" – ")),b("Municipalité/Commune :"),c(val(v.commune)),b("Coordonnées :"),c(val(v.gps))]],
    columnStyles:{0:{cellWidth:28},1:{cellWidth:30},2:{cellWidth:34},3:{cellWidth:38},4:{cellWidth:24}}})};
  return K}
async function visitePdf(v){const k=kindOf(v);return k==="terrain"?terrainPdf(v):k==="avancement"?avancPdf(v):bienPdf(v)}
async function bienPdf(v){
  const K=await pdfKit(),{doc,M,teal}=K,X=K.X,val=K.val,c=K.c,b=K.b,xc=K.xc,title=K.title,tbl=K.tbl;
  K.head("Fiche De Visite :");
  tbl({body:[
    [b("Numéro du dossier"),c(val(v.dossier)),b("Ville :"),c(val(v.ville)),b("Rue :"),c(val(v.rue))],
    [b("Visiteur"),c(val(v.visiteur)),b("Quartier :"),c(val(v.quartier)),b("Code Postal :"),c(val(v.codePostal))],
    [b("Date de la visite"),c(K.dateFr(v)),b("Résidence :"),c(val(v.residence)),b("Ilot :"),c(val(v.ilot))],
    [b("Contact"),c([v.contact,v.contactTel].filter(Boolean).join(" – ")),b("N° :"),c(val(v.num)),b("Porte :"),c(val(v.porte))],
    ["","",b("Etage :"),c(val(v.etage)),b("Municipalité/Commune :"),c(val(v.commune))],
    ["","",b("Orientation :"),c(val(v.orientation)),"",""],
    ["","",b("Coordonnées :"),c(val(v.gps)),"",""]],
    columnStyles:{0:{cellWidth:28},1:{cellWidth:30},2:{cellWidth:23},3:{cellWidth:38},4:{cellWidth:35}}});
  // typologie
  title("Typologie :");const ty=v.typo,sub=v.typoSub;
  const grp=(name,subs)=>subs.map((s,i)=>X(ty===name&&(sub===s||(!sub&&i===0))));
  tbl({head:[[c("Maison",{colSpan:2}),c("Appt"),c("Villa",{colSpan:3}),c("Local commercial",{colSpan:2}),c("Usine")]],
    body:[[c("Unifamiliale"),c("Multifamiliale"),"",c("Isolée"),c("En bande"),c("Jumelée"),c("Avec accès rue"),c("Sans accès rue"),""].map(x=>typeof x==="string"?x:{...x,styles:{halign:"center"}}),
      [...grp("Maison",TYPO_SUB.Maison),X(ty==="Appartement"),...grp("Villa",TYPO_SUB.Villa),...grp("Local commercial",TYPO_SUB["Local commercial"]),X(ty==="Usine")].map(xc)]});
  if(ty==="Autre")tbl({body:[[b("Autre typologie"),c(val(v.typoSub)||"Autre")]]});
  K.y+=1.5;tbl({tableWidth:110,body:[[b("Rés. principale"),xc(X(v.resType==="Principale")),b("Rés. secondaire"),xc(X(v.resType==="Secondaire"))]],columnStyles:{1:{cellWidth:18},3:{cellWidth:18}}});
  // construction
  title("Construction :");
  tbl({head:[[c("N. Log"),c("N. Lc"),c("N. bureaux"),c("N. Asc"),c("N. Etages"),c("Garage"),c("S.sol"),c("HSP (LC et U)",{colSpan:2}),c("Terrasse",{colSpan:2})]],
    body:[["","","","","","","",c("Inf",{styles:{halign:"center"}}),c("Sup",{styles:{halign:"center"}}),c("Acc",{styles:{halign:"center"}}),c("Non Acc",{styles:{halign:"center"}})],
      [val(v.nLog),val(v.nLc),val(v.nBureaux),val(v.nAsc),val(v.nEtages),val(v.garage),val(v.ssol),X(v.hsp==="Inf"),X(v.hsp==="Sup"),X(v.terrasse==="Accessible"),X(v.terrasse==="Non accessible")].map(xc)]});
  // aménagements
  title("Aménagements extérieurs :");
  tbl({head:[[c("Jardin"),c("Piscine"),c("TR sport"),c("Clôturée"),c("Chauff/Clim",{colSpan:2}),c("Chauffe-eau",{colSpan:3}),c("Sécurité incendie",{colSpan:3})]],
    body:[["","","","",...["Oui","Non","Gaz","Élect","Non","Préin","Oui","Non"].map(t=>c(t,{styles:{halign:"center"}}))],
      [val(v.jardin),val(v.piscine),val(v.tsport),val(v.cloturee),X(v.clim==="Oui"),X(v.clim==="Non"),X(v.chauffeEau==="Gaz"),X(v.chauffeEau==="Électrique"),X(v.chauffeEau==="Non"),X(v.incendie==="Pré-installation"),X(v.incendie==="Oui"),X(v.incendie==="Non")].map(xc)]});
  // équipement quartier
  title("Équipement quartier :");K.equip(v);
  // description
  title("Description :");
  tbl({body:[
    [b("Nbre de chambres"),c(val(v.chambres)),b("Usager"),c("Propriétaire"),xc(X(v.occupation==="Propriétaire")),b("Âge du bien"),c(val(v.age))],
    [b("Nbre de SDB/WC"),c(val(v.sdb)),"",c("Locataire"),xc(X(v.occupation==="Locataire")),b("Date dern. rénovation"),c(val(v.renov))],
    [b("Nbre de pièces extérieures"),c(val(v.piecesExt)),"",c("Inoccupé"),xc(X(v.occupation==="Inoccupé")),b("Surface construite (m²)"),c(val(v.sConst))],
    [b("Nbre de pièces totales"),c(val(v.piecesTot)),"","","",b("Surface terrain (m²)"),c(val(v.sTerrain))]],
    columnStyles:{0:{cellWidth:40},1:{cellWidth:18},2:{cellWidth:18},4:{cellWidth:10},5:{cellWidth:40}}});
  // qualité constructive
  title("Qualité constructive :");const rooms=(v.pieces||[]).filter(r=>Object.values(r).some(Boolean)),docs=v.docs||[];
  const docRows=[["CP","CP"],["PC","PC"],["P. autorisé","P. autorisé"],["Autre","Autre"+(v.docsAutre?" : "+v.docsAutre:"")]];
  const n=Math.max(rooms.length,docRows.length,4),qb=[];
  for(let i=0;i<n;i++){const r=rooms[i]||{},d=docRows[i];qb.push([c(val(r.piece)),c(val(r.sol)),c(val(r.murs)),c(val(r.plafond)),c(val(r.menuiserie)),d?c(d[1]):"",d?xc(X(docs.includes(d[0]))):""])}
  tbl({head:[[c("Pièces"),c("Revêtements"),c("Murs"),c("Plafond"),c("Menuiserie intérieure"),c("Doc en possession lors de la visite",{colSpan:2})]],body:qb,columnStyles:{6:{cellWidth:10}}});
  // valeur
  K.y+=2.5;tbl({body:[[c("Valeur du bien estimée :",{styles:{fontStyle:"bold",fillColor:[234,241,241]}}),c(v.valeur!=null&&v.valeur!==""?pt(fmt(v.valeur))+" DH":"",{styles:{fontStyle:"bold",fontSize:10}})]],columnStyles:{0:{cellWidth:60}}});
  // références
  title("Éléments de références :");const refs=(v.refs||[]).map(id=>items.find(x=>x.id===id)).filter(Boolean);
  const rb=refs.map(r=>{const ag=refOrigin(r)==="Ag. immob";return [c([r.type,r.tx!=="Vente"?r.tx:"",r.surface?plain(r.surface)+" m²":"",r.price?fmt(r.price)+priceSuf(r.tx):"",r.ref?"("+r.ref+")":""].filter(Boolean).join(" · ")),c(val(r.contactTel)),c([r.address,r.district,r.city].filter(Boolean).join(", ")),xc(X(!ag)),xc(X(ag))]});
  while(rb.length<3)rb.push(["","","","",""]);
  tbl({head:[[c("Typologie"),c("Tél"),c("Adresse"),c("Particulier"),c("Ag. immob")]],body:rb,columnStyles:{0:{cellWidth:58},1:{cellWidth:27},3:{cellWidth:19},4:{cellWidth:19}}});
  await K.sign(v);return doc}
async function terrainPdf(v){
  const K=await pdfKit(),{doc}=K,X=K.X,val=K.val,c=K.c,b=K.b,xc=K.xc,hc=K.hc,title=K.title,tbl=K.tbl,on=k=>Array.isArray(v[k])?v[k]:(v[k]?[v[k]]:[]);
  K.head("Fiche de visite : Terrain");
  K.head4(v,["Orientation :",v.orientation]);
  title("Destination :");K.checks(["Terrain agricole","Terrain constructible","Maison","Villa","Usine","Immeuble","TR agricole","Autre"],on("destination"));
  K.y+=1.5;K.checks(["Isolé","En bande","Jumelée","Zone urbaine","Zone rurale"],[v.implantation,v.zone].filter(Boolean));
  const prec=[v.sTerrain!=null&&v.sTerrain!==""?"Superficie : "+plain(v.sTerrain)+" m²":"",v.precision?"Précision : "+v.precision:""].filter(Boolean).join("   ·   ");
  if(prec){K.y+=1.5;tbl({theme:"plain",body:[[c(prec,{styles:{cellPadding:{top:1,bottom:1,left:0,right:0}}})]]})}
  title("Équipement quartier :");K.equip(v);
  title("Viabilité :");
  tbl({head:[[c("Eau",{colSpan:2}),c("Électricité",{colSpan:2}),c("Assainissement",{colSpan:2}),c("Voirie",{colSpan:2})]],
    body:[["Réseau général","Puits","Public","Privé","Réseau général","FS","Goudronnée","Piste"].map(hc),
      [X(on("eau").includes("Réseau général")),X(on("eau").includes("Puits")),X(on("elec").includes("Public")),X(on("elec").includes("Privé")),X(on("assain").includes("Réseau général")),X(on("assain").includes("FS")),X(on("voirie").includes("Goudronnée")),X(on("voirie").includes("Piste"))].map(xc)]});
  title("Topographie du terrain :");K.checks(["Terrain plat","Terrain en pente","Terrain en relief","Dénivelé important"],on("topo"));
  title("Voie d'accès :");
  tbl({head:[["Goudronnée","Non goudronnée","Publique","Privée","Distance"].map(t=>c(t))],body:[[...["Goudronnée","Non goudronnée","Publique","Privée"].map(l=>xc(X(on("acces").includes(l)))),c(val(v.distance),{styles:{halign:"center"}})]],columnStyles:{4:{cellWidth:62}}});
  title("Servitudes / Charges urbanistiques grevant le terrain :");
  const sv=["Ligne haute tension / Ligne électrique","Servitude de passage","Oued / Khatara","Voie d'aménagement","Voie ferrée","Autre"];
  tbl({head:[sv.map(t=>c(t))],body:[sv.map(l=>xc(X(on("servitudes").includes(l)))),...(v.servAutre?[[c("Autre : "+v.servAutre,{colSpan:6})]]:[])]});
  title("Nuisances :");const nu=["Nuisances sonores","Nuisance olfactive (décharge…)","Autre"];
  tbl({head:[nu.map(t=>c(t))],body:[nu.map(l=>xc(X(on("nuisances").includes(l)))),...(v.nuisAutre?[[c("Autre : "+v.nuisAutre,{colSpan:3})]]:[])]});
  K.valeur(v);
  title("Étude de marché & transactions :");const et=["Étude de marché complète","Étude de marché incomplète","Témoins introduits dans la carte","Étude des transactions effectuée"];
  const byType={};(v.refs||[]).map(id=>items.find(x=>x.id===id)).filter(Boolean).forEach(r=>{(byType[r.type||"Autre"]=byType[r.type||"Autre"]||[]).push(r.ref||r.code||"")});
  const codeRows=Object.entries(byType).map(([t,cs])=>[c(t+" : "+cs.filter(Boolean).join(" + "),{colSpan:4})]);if(v.codesAutres)codeRows.push([c(v.codesAutres,{colSpan:4})]);
  tbl({head:[et.map(t=>c(t))],body:[et.map(l=>xc(X(on("etude").includes(l)))),[c("Codes témoins",{colSpan:4,styles:{fontStyle:"bold",fillColor:[234,241,241]}})],...(codeRows.length?codeRows:[[c("",{colSpan:4})]])]});
  title("Documents (✓ = disponible lors de la visite) :".replace("✓","coché"));const dc=["C.P","P.C","N.R","C. des charges","P. autorisé","Autre"];
  tbl({head:[dc.map(t=>c(t))],body:[dc.map(l=>xc(X(on("docs").includes(l)))),...(v.docsAutre?[[c("Autre : "+v.docsAutre,{colSpan:6})]]:[])]});
  title("Constructions sur le terrain :");tbl({body:[[c("Description (type – date de construction) : "+val(v.constructions))]]});
  await K.sign(v);return doc}
async function avancPdf(v){
  const K=await pdfKit(),{doc}=K,val=K.val,c=K.c,b=K.b,title=K.title,tbl=K.tbl;
  K.head("Fiche d'état d'avancement :");
  K.head4(v,["Type de bien :",v.typeBien]);
  title("Avancement des travaux :");
  const lots=(v.lots||[]).filter(l=>l.lot||(l.sous||[]).length),r=avCalc(lots),pc=x=>x==null||x===""?"":plain(x)+" %",body=[];
  lots.forEach((lt,i)=>{const ss=(lt.sous||[]).length?lt.sous:[{n:""}],n=ss.length,la=r.lots[i]?.av;
    ss.forEach((s,j)=>{const row=[];
      if(j===0)row.push(c(lt.lot+(la!=null?"\n("+Math.round(la)+" %)":""),{rowSpan:n,styles:{fontStyle:"bold",valign:"middle"}}));
      row.push(c(s.n));if(j===0)row.push(c(pc(lt.pct),{rowSpan:n,styles:{halign:"center",valign:"middle"}}));
      row.push(c(pc(s.pct),{styles:{halign:"center"}}));if(j===0)row.push(c(lt.budget!=null&&lt.budget!==""?pt(fmt(lt.budget))+" DH":"",{rowSpan:n,styles:{halign:"right",valign:"middle"}}));
      row.push(c(s.av!=null?plain(s.av)+" %":"",{styles:{halign:"center",fontStyle:"bold",textColor:K.teal}}));body.push(row)})});
  body.push([c("Avancement global",{colSpan:5,styles:{fontStyle:"bold",halign:"right",fillColor:[234,241,241]}}),c(r.global!=null?Math.round(r.global)+" %":"",{styles:{fontStyle:"bold",halign:"center",fontSize:10,fillColor:[234,241,241],textColor:K.teal}})]);
  tbl({head:[["Avancement Lots","Sous-lot","% par lot","% par sous-lot","Budget par lot","% Avancement"].map(t=>c(t))],body,styles:{fontSize:7.8},
    columnStyles:{0:{cellWidth:34},2:{cellWidth:17},3:{cellWidth:19},4:{cellWidth:28},5:{cellWidth:22}}});
  if(r.global!=null&&r.basis){doc.setFont("helvetica","normal");doc.setFontSize(7);doc.setTextColor(90,100,105);
    doc.text(pt(r.basis==="pct"?"Avancement global pondéré par les % des lots.":r.basis==="budget"?"Avancement global pondéré par les budgets des lots.":"Avancement global : lots comptés à égalité."),K.M,K.y+3.2);K.y+=3.5}
  await K.sign(v);return doc}
function visPdfName(v){const k=kindOf(v),p=k==="terrain"?"Fiche_de_visite_Terrain_":k==="avancement"?"Etat_d_avancement_":"Fiche_de_visite_";return (p+(v.dossier||v.date||new Date().toISOString().slice(0,10))).replace(/[^\w\-]+/g,"_")+".pdf"}
async function downloadVisitePdf(v,btn){const lbl=btn?.textContent;if(btn){btn.disabled=true;btn.textContent="Préparation…"}
  try{const doc=await visitePdf(v);await addPlansToPdf(doc,v);const blob=doc.output("blob"),name=visPdfName(v);
    const file=new File([blob],name,{type:"application/pdf"});
    if(btn?.dataset.share==="1"&&navigator.canShare?.({files:[file]})){try{await navigator.share({files:[file],title:name})}catch(e){}}
    else await saveFile(name,blob)}
  catch(e){toast(e?.code==="pdf-lib"?"Le module PDF n’a pas pu se charger : vérifie la connexion puis réessaie.":"PDF impossible pour le moment.")}
  if(btn){btn.disabled=false;btn.textContent=lbl}}
/* ===================== choisir un point sur la carte satellite ===================== */
let pickMap=null,pickRes=null,pickPts=null,lastPick=null,pickMeDot=null,pickAcc=null,pickWatch=null;
/* « Ma position » : point bleu (et précision) mis à jour tant que la carte est ouverte */
function showMe(la,lo,acc){if(!pickMap)return;const ll=[la,lo],rad=Math.max(5,Math.min(acc||25,500));
  if(!pickMeDot){pickAcc=L.circle(ll,{radius:rad,color:"#1d6fe0",weight:1,fillColor:"#1d6fe0",fillOpacity:.12,interactive:false}).addTo(pickMap);
    pickMeDot=L.circleMarker(ll,{radius:8,color:"#ffffff",weight:3,fillColor:"#1d6fe0",fillOpacity:1,interactive:false}).addTo(pickMap)}
  else{pickMeDot.setLatLng(ll);pickAcc.setLatLng(ll).setRadius(rad)}}
function stopPickWatch(){if(pickWatch!=null&&navigator.geolocation)navigator.geolocation.clearWatch(pickWatch);pickWatch=null}
function pickDone(v){stopPickWatch();const r=pickRes;pickRes=null;if($("#pickDlg").open)$("#pickDlg").close();if(r)r(v)}
function updPick(){if(!pickMap)return;const c=pickMap.getCenter();$("#pickTxt").textContent=gpsStr([+c.lat.toFixed(6),+c.lng.toFixed(6)])}
function pickOnMap(init){return new Promise(res=>{
  if(!window.L){toast("Carte indisponible : vérifie la connexion internet.");res(null);return}
  pickRes=res;$("#pickGo").value="";$("#pickDlg").showModal();
  if(!pickMap){pickMap=L.map("pickMap",{preferCanvas:true,zoomControl:true});const o={maxZoom:20,maxNativeZoom:19};
    L.tileLayer(ESRI+"World_Imagery/MapServer/tile/{z}/{y}/{x}",{...o,zIndex:1,attribution:"Imagerie © Esri, Maxar"}).addTo(pickMap);
    L.tileLayer(ESRI+"Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",{...o,zIndex:3}).addTo(pickMap);streetLabels().addTo(pickMap);
    L.control.scale({imperial:false}).addTo(pickMap);pickPts=L.layerGroup().addTo(pickMap);pickMap.on("move",updPick)}
  pickPts.clearLayers();items.forEach(c=>{const g=gpsOf(c);if(g)L.circleMarker(g,{radius:5,color:"#ffffff",weight:1,fillColor:TCOL[c.type]||"#888888",fillOpacity:.9,interactive:false}).addTo(pickPts)});
  const g0=coordsFrom(init||"");const g=g0||lastPick||[33.5731,-7.5898];
  setTimeout(()=>{pickMap.invalidateSize();pickMap.setView(g,g0?18:(lastPick?17:13));updPick()},60);
  stopPickWatch();let centered=!!g0;
  if(navigator.geolocation)try{pickWatch=navigator.geolocation.watchPosition(p=>{const c=p.coords;showMe(c.latitude,c.longitude,c.accuracy);
    if(!centered){centered=true;setTimeout(()=>pickMap.setView([c.latitude,c.longitude],18),80)}},()=>{},{enableHighAccuracy:true,maximumAge:15000,timeout:20000})}catch(e){}})}
$("#pickOk").onclick=()=>{const c=pickMap.getCenter(),g=[+c.lat.toFixed(6),+c.lng.toFixed(6)];lastPick=g;pickDone(g)};
$("#pickCancel").onclick=()=>pickDone(null);
$("#pickDlg").addEventListener("close",()=>{if(pickRes)pickDone(null)});
$("#pickMe").onclick=async()=>{const b=$("#pickMe");b.disabled=true;try{const [la,lo,acc]=await getPos();showMe(la,lo,acc);pickMap.setView([la,lo],18)}catch(e){geoErr(e)}b.disabled=false};
$("#pickGo").addEventListener("keydown",e=>{if(e.key!=="Enter")return;e.preventDefault();const g=coordsFrom(e.target.value);if(g)pickMap.setView(g,18);else toast("Coordonnées illisibles : écris « latitude, longitude ».")});
$("#pickGo").addEventListener("paste",()=>setTimeout(()=>{const g=coordsFrom($("#pickGo").value);if(g)pickMap.setView(g,18)},0));
/* bouton « Sur la carte » de la fiche témoin */
$("#gpsPick").onclick=async()=>{const g=await pickOnMap($("#f_gps").value);if(g){$("#f_gps").value=gpsStr(g);$("#f_gps").dispatchEvent(new Event("input"));toast("Point enregistré");temGeocode()}};
async function visPickMap(){const g=await pickOnMap($("#v_gps").value);if(g){$("#v_gps").value=gpsStr(g);autoPlace();toast("Point enregistré")}}
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
  try{const [la,lo,acc]=await getPos();$("#f_gps").value=gpsStr([+la.toFixed(6),+lo.toFixed(6)]);$("#f_gps").dispatchEvent(new Event("input"));toast("Position enregistrée (± "+Math.round(acc||0)+" m)");temGeocode()}catch(e){geoErr(e)}
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
let gateT=null;
function showGate(mode,msg){const g=$("#gate");g.hidden=false;clearTimeout(gateT);
  if(mode==="wait")gateT=setTimeout(()=>{if(g.hidden||$("#gateWait").hidden)return;$("#gateMsg").replaceChildren("L’ouverture prend plus de temps que prévu. ",h("button",{class:"linkbtn",type:"button",text:"Recharger",onclick:()=>location.reload()})," · ",h("button",{class:"linkbtn",type:"button",text:"Réparer l’application",onclick:()=>window.__vtReset&&window.__vtReset()}))},20000);
  $("#loginBtn").hidden=mode!=="login";$("#switchBtn").hidden=mode!=="denied";$("#gateWait").hidden=mode!=="wait";
  $("#gateMsg").textContent=msg||(mode==="config"?"Valtera n’est pas encore relié à son serveur (config.js).":"")}
function hideGate(){$("#gate").hidden=true}
function updateAcct(){setUser();
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
      if(inv){d={...base,role:inv.role,modules:inv.modules||[],expires:inv.expires??null,visScope:inv.visScope||"own",temScope:inv.temScope||"all"};await uref.set(d)}
      else{d={...base,role:"owner",modules:["temoins","export"],expires:null};await uref.set(d)}
    }catch(e){if(e?.code==="permission-denied"){showGate("denied","Le compte "+ME.email+" n’a pas accès à Valtera. Demande une invitation à l’administrateur, puis reconnecte-toi.");return}throw e}
  }
  const exp=tsMs(d.expires);
  if(d.role!=="owner"&&d.active===false){showGate("denied","Ton accès à Valtera est suspendu. Contacte l’administrateur.");return}
  if(d.role!=="owner"&&exp&&exp<Date.now()){showGate("denied","Ton accès à Valtera a pris fin le "+dateFr(exp)+". Contacte l’administrateur.");return}
  ME.role=d.role;ME.modules=d.modules||[];ME.expires=exp;ME.visScope=d.visScope||"own";ME.temScope=d.temScope||"all";
  LS.set("vt_me",{uid:u.uid,email:ME.email,role:d.role,modules:ME.modules,expires:exp,active:d.active!==false,visScope:ME.visScope,temScope:ME.temScope});
  if(d.role==="owner")fdb.doc("config/owner").set({uid:u.uid,name:ME.name}).catch(()=>{});
  uref.update({lastSeen:Date.now(),name:ME.name}).catch(()=>{});
  online=true;hideGate();applyRoleUi();agRole();listen();updateAcct();if(isOwner())listenAdmin();
  if(exp&&exp-Date.now()<7*864e5)toast("Ton accès prend fin le "+dateFr(exp)+".");
}
async function boot(){
  buildStatic();applyRoleUi();render();window.__vtBooted=true;
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

/* ===================== design v2 : icônes, onglets, vignettes satellite ===================== */
const ICONS={camera:'<path d="M4 8.6A1.6 1.6 0 0 1 5.6 7h2.1l1.5-2h5.6l1.5 2h2.1A1.6 1.6 0 0 1 20 8.6v9a1.6 1.6 0 0 1-1.6 1.6H5.6A1.6 1.6 0 0 1 4 17.6Z"/><circle cx="12" cy="12.8" r="3.3"/>',
  building:'<rect x="5" y="3.5" width="14" height="17" rx="1.6"/><path d="M9 7.5h2M13 7.5h2M9 11h2M13 11h2M9 14.5h2M13 14.5h2M10.5 20.5v-3h3v3"/>',
  terrain:'<path d="M3 19.5 9 9.5l4 6 3-4 5 8Z"/><circle cx="16.5" cy="6" r="2"/>',
  crane:'<path d="M4 20.5h16M7 20.5V8.5l5.5-4.5v16.5M12.5 7h8M18 7v4.5M16.6 11.5h2.8"/>',
  check:'<path d="m5.5 12.5 4.2 4.2L18.5 8"/>',pin:'<path d="M12 21s-6.5-5.9-6.5-11a6.5 6.5 0 0 1 13 0c0 5.1-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.4"/>',
  edit:'<path d="M4.5 19.5h4l10-10-4-4-10 10v4Z"/><path d="m13 7 4 4"/>',download:'<path d="M12 4.5v10.5m0 0-4-4m4 4 4-4M5 19.5h14"/>'};
function ic(name,size){const s=document.createElement("span");s.className="ic";const z=size||20;
  s.innerHTML='<svg width="'+z+'" height="'+z+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(ICONS[name]||"")+'</svg>';return s}
function satThumb(g){const z=18,n=2**z,x=(g[1]+180)/360*n,la=g[0]*Math.PI/180,y=(1-Math.log(Math.tan(la)+1/Math.cos(la))/Math.PI)/2*n;
  const tx=Math.floor(x),ty=Math.floor(y),x0=x-tx<.5?tx-1:tx,y0=y-ty<.5?ty-1:ty;
  const m=h("div",{class:"satm",style:"left:calc(50% - "+((x-x0)*256).toFixed(1)+"px);top:calc(50% - "+((y-y0)*256).toFixed(1)+"px)"});
  for(let j=0;j<2;j++)for(let i=0;i<2;i++)m.append(h("img",{src:"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/"+z+"/"+(y0+j)+"/"+(x0+i),alt:"",loading:"lazy",decoding:"async",draggable:"false",style:"left:"+(i*256)+"px;top:"+(j*256)+"px",onerror:function(){this.style.visibility="hidden"}}));
  return h("div",{class:"sat"},m,h("i",{class:"satpin"}),h("span",{class:"src",text:"Satellite"}))}
function isPhone(){return window.matchMedia("(max-width:759px)").matches}
function syncTabs(){const t=curMod==="temoins"&&view==="map"&&isPhone()?"carte":curMod;$$("#mods button[data-m]").forEach(b=>b.classList.toggle("on",b.dataset.m===t))}
function setNb(sel,n){const e=$(sel);if(!e)return;e.hidden=!n;e.textContent=n>999?(Math.round(n/100)/10).toString().replace(".",",")+" k":String(n)}
function setUser(){const nm=(ME&&(ME.name||ME.email))||"";const u=$("#uName"),a=$("#uAv");if(!u||!a)return;u.textContent=nm||"Mon compte";
  a.textContent=(nm.split(/[\s@._-]+/).filter(Boolean).slice(0,2).map(w=>w[0]).join("")||"·").toUpperCase()}
window.addEventListener("resize",()=>{clearTimeout(window.__vtRs);window.__vtRs=setTimeout(syncTabs,120)});

/* ===================== « Ajouté par » ===================== */
function authorName(uid,x){if(uid===ME.uid)return "Moi";return (typeof USERS!=="undefined"&&USERS[uid]&&USERS[uid].name)||x.byName||x.visiteur||"Sans nom"}
function fillAuthorSel(sel,list){const e=$(sel);if(!e)return;const m=new Map();list.forEach(x=>{if(x.createdBy&&!m.has(x.createdBy))m.set(x.createdBy,authorName(x.createdBy,x))});
  const others=[...m].filter(([u])=>u!==ME.uid).sort((a,b)=>a[1].localeCompare(b[1],"fr"));const cur=e.value;
  (e.closest("label")||e).hidden=!others.length;
  const opts=[["","Tout le monde"],...(m.has(ME.uid)?[[ME.uid,"Moi"]]:[]),...others];const sig=opts.map(o=>o.join("=")).join("|");
  if(e.dataset.sig!==sig){e.replaceChildren(...opts.map(([v,t])=>h("option",{value:v,text:t})));e.dataset.sig=sig}
  e.value=opts.some(o=>o[0]===cur)?cur:""}

$("#f_gps").addEventListener("change",()=>{if(coordsFrom($("#f_gps").value))temGeocode()});

/* ===================== transactions (Conservation foncière) ===================== */
var natView=(()=>{const v=LS.get("vt_nat","");return v==="tr"||v==="off"?v:""})();
function updTrans(){const tr=$("#f_nature").value==="Transaction";$("#trFs").hidden=!tr;$("#dateLbl").textContent=tr?"Date de la vente":"Date du relevé";
  if(tx==="Vente")$("#priceLbl").textContent=tr?"Prix de vente":"Prix demandé"}
function natUi(){$$("#natSeg button").forEach(b=>b.classList.toggle("on",b.dataset.v===natView));
  const lb=$("#addBtn span:last-child");if(lb)lb.textContent=natView==="tr"?"Nouvelle transaction":"Nouveau témoin"}
function setNat(v){natView=v;LS.set("vt_nat",v);natUi();shown=0;if(view==="map")mv=null;render()}
function natCounts(){const n=items.filter(c=>c.nature==="Transaction").length;const b=$("#natSeg [data-v=tr] .nb2");if(b){b.textContent=n?String(n):"";b.hidden=!n}}
$("#natSeg").addEventListener("click",e=>{const b=e.target.closest("button");if(b)setNat(b.dataset.v)});
$("#f_nature").addEventListener("change",updTrans);
natUi();

/* ===================== zone dessinée sur la carte (cercle, rectangle, contour libre) ===================== */
var zone=(()=>{const z=LS.get("vt_zone",null);return z&&((z.t==="c"&&Array.isArray(z.c)&&z.r>0)||(z.t==="p"&&Array.isArray(z.pts)&&z.pts.length>2))?z:null})(),zMode=null,zPts=[],zRt=null;
function inZone(g){if(!zone)return true;if(!g)return false;if(zone.t==="c")return distM(g,zone.c)<=zone.r;
  const p=zone.pts;let ins=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const [yi,xi]=p[i],[yj,xj]=p[j];if(((yi>g[0])!==(yj>g[0]))&&(g[1]<(xj-xi)*(g[0]-yi)/(yj-yi)+xi))ins=!ins}return ins}
function zoneBounds(){return zone.t==="c"?L.latLng(zone.c).toBounds(zone.r*2.2):L.latLngBounds(zone.pts)}
function drawZone(){if(!map)return;const col=getComputedStyle(document.documentElement).getPropertyValue("--brand").trim()||"#1d6fe0";
  const o={color:col,weight:2.5,dashArray:"8 6",fillColor:col,fillOpacity:.08,interactive:false};
  if(zone&&!zMode)(zone.t==="c"?L.circle(zone.c,{...o,radius:zone.r}):L.polygon(zone.pts,o)).addTo(ovLayer);
  if(zMode&&zPts.length){if(zPts.length>1)L.polyline(zPts,{color:col,weight:2.5,dashArray:"4 5",interactive:false}).addTo(ovLayer);
    zPts.forEach((p,i)=>L.circleMarker(p,{radius:i?5:7,color:"#ffffff",weight:2,fillColor:col,fillOpacity:1,interactive:false}).addTo(ovLayer))}}
function zoneCursor(){if(map)map.getContainer().classList.toggle("zdraw",!!zMode)}
function setZone(z){zone=z;LS.set("vt_zone",z);zMode=null;zPts=[];zoneCursor();shown=0;mv=null;render();
  if(z)toast("Zone appliquée à la liste et aux indicateurs")}
function startZone(m){if(view!=="map"){view="map";LS.set("mc_view",view);mv=true;render()}zMode=m;zPts=[];zoneCursor();zoneUi();if(lastMapR)drawMap(lastMapR);
  toast(m==="c"?"Touche le centre de la zone, puis règle le rayon.":m==="r"?"Touche deux coins opposés du rectangle.":"Touche les points du contour, puis « Terminer la zone » (ou touche le premier point).")}
function onZoneClick(e){if(!zMode)return;const p=[+e.latlng.lat.toFixed(6),+e.latlng.lng.toFixed(6)];
  if(zMode==="c"){setZone({t:"c",c:p,r:+$("#zoneR").value||500});return}
  if(zMode==="p"&&zPts.length>=3&&map.latLngToContainerPoint(zPts[0]).distanceTo(e.containerPoint)<18){setZone({t:"p",pts:zPts.slice()});return}
  zPts.push(p);
  if(zMode==="r"&&zPts.length===2){const [a,b]=zPts;setZone({t:"p",pts:[a,[a[0],b[1]],b,[b[0],a[1]]]});return}
  drawMap(lastMapR);zoneUi()}
function zoneUi(n){const b=$("#zoneBar");if(!b)return;const on=!!zone||!!zMode;b.hidden=!on;if(!on)return;
  $("#zoneRW").hidden=!(zMode==="c"||(!zMode&&zone&&zone.t==="c"));$("#zoneDone").hidden=!(zMode==="p"&&zPts.length>=3);$("#zoneMap").hidden=view==="map";
  if(zone&&zone.t==="c"&&!zMode){$("#zoneR").value=zone.r;$("#zoneRV").textContent=zone.r>=1000?(zone.r/1000).toString().replace(".",",")+" km":zone.r+" m"}
  $("#zoneTxt").textContent=zMode?(zMode==="c"?"Cercle : touche le centre sur la carte":zMode==="r"?"Rectangle : "+zPts.length+" coin sur 2":"Contour : "+zPts.length+" point"+(zPts.length>1?"s":"")+(zPts.length<3?" (3 au moins)":""))
    :"Zone dessinée"+(n!=null?" : "+n+" témoin"+(n>1?"s":""):"")}
function addZoneCtl(){const Z=L.Control.extend({onAdd(){const d=L.DomUtil.create("div","leaflet-bar mc-ctl zctl");
  [["c","Zone en cercle",'<circle cx="9" cy="9" r="6.3" fill="none" stroke="currentColor" stroke-width="1.7" stroke-dasharray="3 2"/><circle cx="9" cy="9" r="1.7" fill="currentColor"/>'],
   ["r","Zone en rectangle",'<rect x="2.5" y="4" width="13" height="10" rx="1" fill="none" stroke="currentColor" stroke-width="1.7" stroke-dasharray="3 2"/>'],
   ["p","Zone au contour libre",'<path d="M3 13.5 5 4l7 1.2 3.5 5.6-5.8 4.4Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" stroke-dasharray="3 2"/>']].forEach(([m,t,s])=>{
    const a=L.DomUtil.create("a","",d);a.href="#";a.title=t;a.setAttribute("role","button");a.setAttribute("aria-label",t);a.innerHTML='<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">'+s+'</svg>';
    a.onclick=ev=>{ev.preventDefault();startZone(m)}});
  L.DomEvent.disableClickPropagation(d);return d}});new Z({position:"topleft"}).addTo(map);map.on("click",onZoneClick)}
$("#zoneR").addEventListener("input",e=>{const r=+e.target.value;$("#zoneRV").textContent=r>=1000?(r/1000).toString().replace(".",",")+" km":r+" m";
  if(zone&&zone.t==="c"&&!zMode){zone={...zone,r};LS.set("vt_zone",zone);clearTimeout(zRt);zRt=setTimeout(()=>{shown=0;render()},180)}});
$("#zoneDone").onclick=()=>{if(zPts.length>=3)setZone({t:"p",pts:zPts.slice()})};
$("#zoneClear").onclick=()=>{zMode=null;zPts=[];setZone(null)};
$("#zoneMap").onclick=()=>{view="map";LS.set("mc_view",view);mv=null;shown=0;render();window.scrollTo({top:0})};
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&zMode){zMode=null;zPts=[];zoneCursor();zoneUi();if(lastMapR)drawMap(lastMapR)}});


/* ===================== croquis : plans cotés (murs, portes, fenêtres, escaliers, cotes, textes) ===================== */
/* Coordonnées en mètres, y vers le bas. Rendu SVG en pixels écran recalculé à chaque changement. */
var visPlans=[];
var CK={kp:true,kf:null,plan:null,idx:-1,ro:false,tool:"wall",s:50,tx:0,ty:0,ortho:90,snap:true,grid:true,dims:true,th:.2,
  doorW:.9,winW:1.2,txt:"Salon",cur:null,sel:null,hist:[],fut:[],ptrs:new Map(),drag:null,hov:null,ptA:null,lastDir:0,dirty:false,pinch:null};
const ckUid=()=>Math.random().toString(36).slice(2,9);
const ckR=v=>Math.round(v*1000)/1000;
const ckM=v=>(Math.round(v*100)/100).toFixed(2).replace(".",",");
const ckEsc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const ckItems=()=>CK.plan?CK.plan.items:[];
function ckFind(id){return ckItems().find(i=>i.id===id)}
function ckSegs(w){const p=w.pts,r=[];for(let i=0;i<p.length-1;i++)r.push([p[i],p[i+1]]);if(w.closed&&p.length>2)r.push([p[p.length-1],p[0]]);return r}
function ckArea(pts){let a=0;for(let i=0,j=pts.length-1;i<pts.length;j=i++)a+=(pts[j][0]+pts[i][0])*(pts[j][1]-pts[i][1]);return Math.abs(a/2)}
function ckCentroid(pts){let x=0,y=0,a=0;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const f=pts[j][0]*pts[i][1]-pts[i][0]*pts[j][1];a+=f;x+=(pts[j][0]+pts[i][0])*f;y+=(pts[j][1]+pts[i][1])*f}
  if(Math.abs(a)<1e-9){const n=pts.length;return [pts.reduce((s,p)=>s+p[0],0)/n,pts.reduce((s,p)=>s+p[1],0)/n]}a*=3;return [x/a,y/a]}
function ckDistSeg(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],L=dx*dx+dy*dy;let t=L?((p[0]-a[0])*dx+(p[1]-a[1])*dy)/L:0;t=Math.max(0,Math.min(1,t));const q=[a[0]+t*dx,a[1]+t*dy];return {d:Math.hypot(p[0]-q[0],p[1]-q[1]),t,q}}
/* ouverture (porte / fenêtre) : position sur le segment du mur */
function ckOpenGeo(o){const w=ckFind(o.wid);if(!w)return null;const sg=ckSegs(w)[o.si];if(!sg)return null;const [a,b]=sg,L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<.05)return null;
  const u=[(b[0]-a[0])/L,(b[1]-a[1])/L],n=[-u[1],u[0]],d=Math.max(o.w/2,Math.min(L-o.w/2,o.d));const c=[a[0]+u[0]*d,a[1]+u[1]*d];
  return {a,b,u,n,c,L,th:w.th||.2,p0:[c[0]-u[0]*o.w/2,c[1]-u[1]*o.w/2],p1:[c[0]+u[0]*o.w/2,c[1]+u[1]*o.w/2]}}
function ckInPoly(p,pts){let ins=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const [xi,yi]=pts[i],[xj,yj]=pts[j];if(((yi>p[1])!==(yj>p[1]))&&(p[0]<(xj-xi)*(p[1]-yi)/(yj-yi)+xi))ins=!ins}return ins}
function ckStairPts(st){const r=(st.r||0)*Math.PI/180,c=Math.cos(r),s=Math.sin(r),hw=st.w/2,hl=st.l/2;
  return [[-hw,-hl],[hw,-hl],[hw,hl],[-hw,hl]].map(([x,y])=>[st.x+x*c-y*s,st.y+x*s+y*c])}

/* ---------- rendu SVG ---------- */
function ckSvg(plan,V,o){o=o||{};const S=p=>[V.tx+p[0]*V.s,V.ty+p[1]*V.s],F=v=>v.toFixed(1),P=p=>{const q=S(p);return F(q[0])+","+F(q[1])};
  const ink=o.ink||"#1f2a37",brand=o.brand||"#1d6fe0",out=[];const items=plan.items||[];
  if(o.bg)out.push('<rect x="0" y="0" width="'+V.W+'" height="'+V.H+'" fill="'+o.bg+'"/>');
  if(o.grid){const steps=[[.5,"#eef1f5"],[1,"#e1e6ee"],[5,"#c9d1dc"]];
    steps.forEach(([st,col])=>{if(st*V.s<7)return;const x0=Math.floor(-V.tx/V.s/st)*st,x1=(V.W-V.tx)/V.s,y0=Math.floor(-V.ty/V.s/st)*st,y1=(V.H-V.ty)/V.s;let d="";
      for(let x=x0;x<=x1;x+=st){const X=F(V.tx+x*V.s);d+="M"+X+",0V"+V.H}for(let y=y0;y<=y1;y+=st){const Y=F(V.ty+y*V.s);d+="M0,"+Y+"H"+V.W}
      out.push('<path d="'+d+'" stroke="'+col+'" stroke-width="1" fill="none"/>')})}
  const selId=o.sel&&o.sel.id;
  /* murs et lignes */
  items.forEach(it=>{if((it.t!=="wall"&&it.t!=="line")||it.pts.length<2)return;const pts=it.pts.map(P).join(" ");const sel=it.id===selId;
    if(it.t==="wall"){const w=Math.max(1.5,(it.th||.2)*V.s);
      if(it.closed&&it.pts.length>2)out.push('<polygon points="'+pts+'" fill="'+(sel?"rgba(29,111,224,.06)":"rgba(31,42,55,.025)")+'" stroke="none"/>');
      out.push('<'+(it.closed?"polygon":"polyline")+' points="'+pts+'" fill="none" stroke="'+(sel?brand:ink)+'" stroke-width="'+F(w)+'" stroke-linejoin="miter" stroke-miterlimit="8" stroke-linecap="square"/>')}
    else out.push('<'+(it.closed?"polygon":"polyline")+' points="'+pts+'" fill="none" stroke="'+(sel?brand:"#5b6573")+'" stroke-width="1.6" stroke-dasharray="'+(it.dash?"6 4":"")+'"/>')});
  /* portes et fenêtres : on coupe le mur puis on dessine le symbole */
  items.forEach(it=>{if(it.t!=="door"&&it.t!=="win")return;const g=ckOpenGeo(it);if(!g)return;const sel=it.id===selId,col=sel?brand:ink;
    const cw=(g.th*V.s)+3,A=S(g.p0),B=S(g.p1),ang=Math.atan2(g.u[1],g.u[0])*180/Math.PI,len=it.w*V.s,C=S(g.c);
    out.push('<rect x="'+F(C[0]-len/2)+'" y="'+F(C[1]-cw/2)+'" width="'+F(len)+'" height="'+F(cw)+'" fill="'+(o.bg||"#ffffff")+'" transform="rotate('+F(ang)+' '+F(C[0])+' '+F(C[1])+')"/>');
    if(it.t==="win"){const n=g.n,t=g.th/2,q=(k,f)=>S([g.c[0]+g.u[0]*it.w/2*k+n[0]*t*f,g.c[1]+g.u[1]*it.w/2*k+n[1]*t*f]);
      [[1,1,-1,1],[1,-1,-1,-1],[1,0,-1,0]].forEach(([k1,f1,k2,f2])=>{const p1=q(k1,f1),p2=q(k2,f2);out.push('<line x1="'+F(p1[0])+'" y1="'+F(p1[1])+'" x2="'+F(p2[0])+'" y2="'+F(p2[1])+'" stroke="'+col+'" stroke-width="1.4"/>')});
      [[1],[-1]].forEach(([k])=>{const p1=q(k,1),p2=q(k,-1);out.push('<line x1="'+F(p1[0])+'" y1="'+F(p1[1])+'" x2="'+F(p2[0])+'" y2="'+F(p2[1])+'" stroke="'+col+'" stroke-width="1.4"/>')})}
    else{const sd=it.side?-1:1,hinge=it.flip?g.p1:g.p0,other=it.flip?g.p0:g.p1,leaf=[hinge[0]+g.n[0]*it.w*sd,hinge[1]+g.n[1]*it.w*sd];
      const H=S(hinge),Lf=S(leaf),O=S(other),r=it.w*V.s;const cr=(leaf[0]-hinge[0])*(other[1]-hinge[1])-(leaf[1]-hinge[1])*(other[0]-hinge[0]);
      out.push('<line x1="'+F(H[0])+'" y1="'+F(H[1])+'" x2="'+F(Lf[0])+'" y2="'+F(Lf[1])+'" stroke="'+col+'" stroke-width="2"/>');
      out.push('<path d="M'+F(Lf[0])+','+F(Lf[1])+' A'+F(r)+','+F(r)+' 0 0 '+(cr>0?1:0)+' '+F(O[0])+','+F(O[1])+'" fill="none" stroke="'+col+'" stroke-width="1" stroke-dasharray="4 3"/>')}});
  /* escaliers */
  items.forEach(it=>{if(it.t!=="stair")return;const c=ckStairPts(it),sel=it.id===selId,col=sel?brand:ink;out.push('<polygon points="'+c.map(P).join(" ")+'" fill="'+(o.bg||"#fff")+'" stroke="'+col+'" stroke-width="1.6"/>');
    const n=Math.max(2,it.n||12);for(let i=1;i<n;i++){const f=i/n,a=[c[0][0]+(c[3][0]-c[0][0])*f,c[0][1]+(c[3][1]-c[0][1])*f],b=[c[1][0]+(c[2][0]-c[1][0])*f,c[1][1]+(c[2][1]-c[1][1])*f];
      const A=S(a),B=S(b);out.push('<line x1="'+F(A[0])+'" y1="'+F(A[1])+'" x2="'+F(B[0])+'" y2="'+F(B[1])+'" stroke="'+col+'" stroke-width="1"/>')}
    const m0=[(c[0][0]+c[1][0])/2,(c[0][1]+c[1][1])/2],m1=[(c[3][0]+c[2][0])/2,(c[3][1]+c[2][1])/2],M0=S(m1),M1=S(m0);
    out.push('<line x1="'+F(M0[0])+'" y1="'+F(M0[1])+'" x2="'+F(M1[0])+'" y2="'+F(M1[1])+'" stroke="'+col+'" stroke-width="1.4" marker-end="url(#ckArr)"/>')});
  /* cotes automatiques des murs et surfaces */
  const fs=o.fs||12;
  if(o.dims!==false)items.forEach(it=>{if(it.t!=="wall"||it.pts.length<2)return;const cen=it.closed&&it.pts.length>2?ckCentroid(it.pts):null;
    ckSegs(it).forEach(([a,b])=>{const L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<.05)return;const u=[(b[0]-a[0])/L,(b[1]-a[1])/L];let n=[-u[1],u[0]];const m=[(a[0]+b[0])/2,(a[1]+b[1])/2];
      if(cen&&((cen[0]-m[0])*n[0]+(cen[1]-m[1])*n[1])>0)n=[-n[0],-n[1]];const off=(it.th||.2)/2+14/V.s,T=S([m[0]+n[0]*off,m[1]+n[1]*off]);let ang=Math.atan2(u[1],u[0])*180/Math.PI;if(ang>90)ang-=180;if(ang<-90)ang+=180;
      if(L*V.s<26)return;out.push('<text x="'+F(T[0])+'" y="'+F(T[1])+'" transform="rotate('+F(ang)+' '+F(T[0])+' '+F(T[1])+')" text-anchor="middle" dominant-baseline="middle" font-size="'+fs+'" font-weight="600" fill="'+(o.dimCol||"#c2410c")+'" class="ckdim">'+ckM(L)+'</text>')});
    if(cen){const A=ckArea(it.pts),inside=items.filter(t=>t.t==="text"&&ckInPoly([t.x,t.y],it.pts));if(inside.length<=1){const at=inside.length?[inside[0].x,inside[0].y]:cen,C=S(at),dy=inside.length?Math.max(9,Math.min(o.fs?o.fs*1.6:26,(inside[0].h||.3)*V.s))*.6+fs*.9:0;
      out.push('<text x="'+F(C[0])+'" y="'+F(C[1]+dy)+'" text-anchor="middle" dominant-baseline="middle" font-size="'+(fs-1)+'" font-style="italic" fill="#64748b" paint-order="stroke" stroke="'+(o.bg||"#fff")+'" stroke-width="3">'+ckM(A).replace(/,00$/,"")+' m²</text>')}}});
  /* cotes manuelles */
  if(!o.thumb)items.forEach(it=>{if(it.t!=="dim")return;const sel=it.id===selId,col=sel?brand:(o.dimCol||"#c2410c");const L=Math.hypot(it.b[0]-it.a[0],it.b[1]-it.a[1]);if(L<.01)return;
    const u=[(it.b[0]-it.a[0])/L,(it.b[1]-it.a[1])/L],n=[-u[1],u[0]],of=it.o||0,a=[it.a[0]+n[0]*of,it.a[1]+n[1]*of],b=[it.b[0]+n[0]*of,it.b[1]+n[1]*of],A=S(a),B=S(b),A0=S(it.a),B0=S(it.b);
    out.push('<line x1="'+F(A0[0])+'" y1="'+F(A0[1])+'" x2="'+F(A[0])+'" y2="'+F(A[1])+'" stroke="'+col+'" stroke-width=".8"/><line x1="'+F(B0[0])+'" y1="'+F(B0[1])+'" x2="'+F(B[0])+'" y2="'+F(B[1])+'" stroke="'+col+'" stroke-width=".8"/>');
    out.push('<line x1="'+F(A[0])+'" y1="'+F(A[1])+'" x2="'+F(B[0])+'" y2="'+F(B[1])+'" stroke="'+col+'" stroke-width="1.2" marker-start="url(#ckTick)" marker-end="url(#ckTick)"/>');
    let ang=Math.atan2(u[1],u[0])*180/Math.PI;if(ang>90)ang-=180;if(ang<-90)ang+=180;const T=[(A[0]+B[0])/2+n[0]*-8,(A[1]+B[1])/2+n[1]*-8];
    out.push('<text x="'+F(T[0])+'" y="'+F(T[1])+'" transform="rotate('+F(ang)+' '+F(T[0])+' '+F(T[1])+')" text-anchor="middle" dominant-baseline="middle" font-size="'+fs+'" font-weight="700" fill="'+col+'">'+ckM(L)+'</text>')});
  /* textes */
  items.forEach(it=>{if(it.t!=="text")return;const T=S([it.x,it.y]),sel=it.id===selId,sz=Math.max(9,Math.min(o.fs?o.fs*1.6:26,(it.h||.3)*V.s));
    out.push('<text x="'+F(T[0])+'" y="'+F(T[1])+'" text-anchor="middle" dominant-baseline="middle" font-size="'+F(sz)+'" font-weight="700" letter-spacing=".04em" fill="'+(sel?brand:"#334155")+'" paint-order="stroke" stroke="'+(o.bg||"#fff")+'" stroke-width="3">'+ckEsc(String(it.s||"").toUpperCase())+'</text>')});
  /* sélection : poignées */
  if(o.sel){const it=items.find(i=>i.id===o.sel.id);if(it&&(it.t==="wall"||it.t==="line"))it.pts.forEach((p,i)=>{const q=S(p);out.push('<circle cx="'+F(q[0])+'" cy="'+F(q[1])+'" r="'+(o.sel.v===i?8:6)+'" fill="#fff" stroke="'+brand+'" stroke-width="2"/>')});
    if(it&&(it.t==="wall"||it.t==="line")&&o.sel.seg!=null){const sg=ckSegs(it)[o.sel.seg];if(sg){const A=S(sg[0]),B=S(sg[1]);out.push('<line x1="'+F(A[0])+'" y1="'+F(A[1])+'" x2="'+F(B[0])+'" y2="'+F(B[1])+'" stroke="'+brand+'" stroke-width="4" stroke-opacity=".55"/>')}}}
  /* aperçu du segment en cours */
  if(o.prev){const [a,b]=o.prev,A=S(a),B=S(b),L=Math.hypot(b[0]-a[0],b[1]-a[1]);out.push('<line x1="'+F(A[0])+'" y1="'+F(A[1])+'" x2="'+F(B[0])+'" y2="'+F(B[1])+'" stroke="'+brand+'" stroke-width="2" stroke-dasharray="7 5"/>');
    out.push('<circle cx="'+F(B[0])+'" cy="'+F(B[1])+'" r="5" fill="'+brand+'"/>');const M=[(A[0]+B[0])/2,(A[1]+B[1])/2];
    out.push('<g><rect x="'+F(M[0]-30)+'" y="'+F(M[1]-24)+'" width="60" height="20" rx="10" fill="'+brand+'"/><text x="'+F(M[0])+'" y="'+F(M[1]-13.5)+'" text-anchor="middle" dominant-baseline="middle" font-size="12" font-weight="700" fill="#fff">'+ckM(L)+' m</text></g>')}
  if(o.pts)o.pts.forEach(p=>{const q=S(p);out.push('<circle cx="'+F(q[0])+'" cy="'+F(q[1])+'" r="5" fill="'+brand+'" stroke="#fff" stroke-width="2"/>')});
  if(o.snapMark){const q=S(o.snapMark);out.push('<rect x="'+F(q[0]-7)+'" y="'+F(q[1]-7)+'" width="14" height="14" fill="none" stroke="#16a34a" stroke-width="2"/>')}
  if(o.title){out.push('<text x="24" y="38" font-size="22" font-weight="700" fill="'+ink+'">'+ckEsc(o.title)+'</text>');if(o.sub)out.push('<text x="24" y="62" font-size="14" fill="#64748b">'+ckEsc(o.sub)+'</text>')}
  if(o.scaleBar){const m=o.scaleBar,x=24,y=V.H-28,w=m*V.s;out.push('<g stroke="'+ink+'" stroke-width="2"><line x1="'+x+'" y1="'+y+'" x2="'+F(x+w)+'" y2="'+y+'"/><line x1="'+x+'" y1="'+(y-6)+'" x2="'+x+'" y2="'+(y+6)+'"/><line x1="'+F(x+w)+'" y1="'+(y-6)+'" x2="'+F(x+w)+'" y2="'+(y+6)+'"/></g><text x="'+F(x+w+10)+'" y="'+(y+5)+'" font-size="14" fill="'+ink+'">'+m+' m</text>')}
  const defs='<defs><marker id="ckTick" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="9" markerHeight="9" orient="auto"><path d="M2,8 L8,2" stroke="'+(o.dimCol||"#c2410c")+'" stroke-width="1.6"/></marker><marker id="ckArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="'+ink+'"/></marker></defs>';
  return '<svg xmlns="http://www.w3.org/2000/svg" width="'+V.W+'" height="'+V.H+'" viewBox="0 0 '+V.W+' '+V.H+'" font-family="Inter,system-ui,sans-serif">'+defs+out.join("")+'</svg>'}

/* ---------- limites du dessin ---------- */
function ckBounds(plan){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;const add=(p,m)=>{m=m||0;x0=Math.min(x0,p[0]-m);y0=Math.min(y0,p[1]-m);x1=Math.max(x1,p[0]+m);y1=Math.max(y1,p[1]+m)};
  (plan.items||[]).forEach(it=>{if(it.pts)it.pts.forEach(p=>add(p,(it.th||.1)/2+.3));if(it.t==="stair")ckStairPts(it).forEach(p=>add(p));if(it.t==="text")add([it.x,it.y],1);if(it.t==="dim"){add(it.a,.6);add(it.b,.6)}});
  return x0>x1?null:[x0,y0,x1,y1]}
function ckPng(plan,maxW,meta){const b=ckBounds(plan);if(!b)return Promise.resolve(null);meta=meta||{};const pad=1,wm=b[2]-b[0]+pad*2,hm=b[3]-b[1]+pad*2;
  const W=Math.round(maxW||2000),top=40,bot=150,s=Math.min((W-80)/wm,(W*1.3-top-bot)/hm),H=Math.round(hm*s+top+bot);
  const V={W,H,s,tx:40+(W-80-wm*s)/2-(b[0]-pad)*s,ty:top-(b[1]-pad)*s};
  const fs=Math.round(Math.max(18,Math.min(30,s*.26)));let svg=ckSvg(plan,V,{bg:"#ffffff",fs});
  const sb=[1,2,5,10,20,50,100].find(m=>m*s>=140)||100,tot=(plan.items||[]).filter(x=>x.t==="wall"&&x.closed&&x.pts.length>2).reduce((a,x)=>a+ckArea(x.pts),0);
  const cw=Math.min(760,W*.46),cx=W-40-cw,cy=H-bot+22,ch=bot-44,ink="#1f2a37",lines=(meta.lines||[]).concat(tot?["Surface des pièces fermées : "+ckM(tot).replace(/,00$/,"")+" m²"]:[]);
  let cart='<g font-family="Inter,system-ui,sans-serif"><rect x="'+cx+'" y="'+cy+'" width="'+cw+'" height="'+ch+'" fill="#fff" stroke="'+ink+'" stroke-width="2"/><rect x="'+cx+'" y="'+cy+'" width="10" height="'+ch+'" fill="#1d6fe0"/>'+
    '<text x="'+(cx+28)+'" y="'+(cy+38)+'" font-size="30" font-weight="700" fill="'+ink+'">'+ckEsc(meta.title||plan.name||"Croquis")+'</text>'+
    lines.slice(0,2).map((l,k)=>'<text x="'+(cx+28)+'" y="'+(cy+70+k*26)+'" font-size="21" fill="'+(k?"#64748b":"#334155")+'">'+ckEsc(l)+'</text>').join("")+'</g>';
  const sx=40,sy=H-bot+60+ch/2-20,sw=sb*s;
  cart+='<g stroke="'+ink+'" stroke-width="2.5"><line x1="'+sx+'" y1="'+sy+'" x2="'+(sx+sw)+'" y2="'+sy+'"/><line x1="'+sx+'" y1="'+(sy-9)+'" x2="'+sx+'" y2="'+(sy+9)+'"/><line x1="'+(sx+sw/2)+'" y1="'+(sy-5)+'" x2="'+(sx+sw/2)+'" y2="'+(sy+5)+'"/><line x1="'+(sx+sw)+'" y1="'+(sy-9)+'" x2="'+(sx+sw)+'" y2="'+(sy+9)+'"/></g>'+
    '<text x="'+(sx+sw+14)+'" y="'+(sy+7)+'" font-size="21" font-family="Inter,system-ui,sans-serif" fill="'+ink+'">'+sb+' m</text><text x="'+sx+'" y="'+(sy-20)+'" font-size="17" font-family="Inter,system-ui,sans-serif" fill="#64748b">Échelle graphique · cotes en mètres</text>';
  svg=svg.replace("</svg>",cart+"</svg>");
  return new Promise(res=>{const im=new Image();im.onload=()=>{const c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,W,H);x.drawImage(im,0,0);res({url:c.toDataURL("image/png"),W,H,canvas:c})};
    im.onerror=()=>res(null);im.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg)})}
function ckMeta(name,v){v=v||{};const d=v.date?new Date(v.date).toLocaleDateString("fr-FR"):new Date().toLocaleDateString("fr-FR");
  return {title:"Croquis : "+(name||"plan"),lines:[[v.dossier?"Dossier "+v.dossier:"",v.ref||"",d].filter(Boolean).join(" · "),[v.visiteur?"Relevé par "+v.visiteur:"",[v.quartier,v.ville].filter(Boolean).join(", ")].filter(Boolean).join(" · ")].filter(Boolean)}}

/* ---------- éditeur ---------- */
const CK_TOOLS=[["select","Sélection / déplacer",'<path d="M5 3l12 6-5 1.6L10 16z"/><path d="M13 13l5 5"/>'],
  ["wall","Mur",'<path d="M3 17V7h14v10" stroke-width="3"/>'],["line","Ligne",'<path d="M3 17L17 3"/><circle cx="3" cy="17" r="1.6"/><circle cx="17" cy="3" r="1.6"/>'],
  ["rect","Pièce rectangle",'<rect x="3" y="5" width="14" height="10" stroke-width="2.6"/>'],
  ["door","Porte",'<path d="M3 17h4M7 17V5"/><path d="M7 5a12 12 0 0 1 10 12" stroke-dasharray="2 2"/><path d="M17 17h0"/>'],
  ["win","Fenêtre",'<rect x="2.5" y="8" width="15" height="4"/><path d="M2.5 10h15"/>'],
  ["stair","Escalier",'<rect x="5" y="2.5" width="10" height="15"/><path d="M5 6h10M5 9h10M5 12h10M5 15h10"/>'],
  ["dim","Cote",'<path d="M3 13h14M3 10v6M17 10v6"/><path d="M8 7h4" stroke-width="1.4"/>'],
  ["text","Texte",'<path d="M4 5h12M10 5v11"/>'],["erase","Gomme",'<path d="M3 15l7-7 5 5-4 4H7z"/><path d="M11 17h6"/>']];
function ckIcon(p){return '<svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>'}
function ckView(){const st=$("#ckStage").getBoundingClientRect();return {W:Math.max(50,Math.round(st.width)),H:Math.max(50,Math.round(st.height)),s:CK.s,tx:CK.tx,ty:CK.ty}}
function ckDraw(){if(!CK.plan)return;const V=ckView();const o={grid:CK.grid,dims:CK.dims,sel:CK.sel,bg:"#ffffff",brand:getComputedStyle(document.documentElement).getPropertyValue("--brand").trim()||"#1d6fe0"};
  if((CK.tool==="wall"||CK.tool==="line")&&CK.cur&&CK.hov){const last=CK.cur.pts[CK.cur.pts.length-1];if(last)o.prev=[last,CK.hov.p]}
  if((CK.tool==="dim"||CK.tool==="rect")&&CK.ptA){o.pts=[CK.ptA];if(CK.hov&&CK.tool==="dim")o.prev=[CK.ptA,CK.hov.p];
    if(CK.hov&&CK.tool==="rect"){const a=CK.ptA,b=CK.hov.p;o.tmpRect=[a,b]}}
  if(CK.hov&&CK.hov.snap)o.snapMark=CK.hov.p;
  let svg=ckSvg(CK.plan,V,o);
  if(o.tmpRect){const [a,b]=o.tmpRect,S=p=>[V.tx+p[0]*V.s,V.ty+p[1]*V.s],A=S(a),B=S(b);const w=Math.abs(b[0]-a[0]),hh=Math.abs(b[1]-a[1]);
    svg=svg.replace("</svg>",'<rect x="'+Math.min(A[0],B[0])+'" y="'+Math.min(A[1],B[1])+'" width="'+Math.abs(B[0]-A[0])+'" height="'+Math.abs(B[1]-A[1])+'" fill="rgba(29,111,224,.08)" stroke="'+o.brand+'" stroke-width="2" stroke-dasharray="7 5"/><text x="'+((A[0]+B[0])/2)+'" y="'+((A[1]+B[1])/2)+'" text-anchor="middle" font-size="13" font-weight="700" fill="'+o.brand+'">'+ckM(w)+' × '+ckM(hh)+'</text></svg>')}
  $("#ckSvg").outerHTML=svg.replace("<svg ",'<svg id="ckSvg" ');
  $("#ckZoom").textContent=Math.round(CK.s/50*100)+" %";
  const tot=ckItems().filter(i=>i.t==="wall"&&i.closed&&i.pts.length>2).reduce((s,i)=>s+ckArea(i.pts),0);$("#ckInfo").textContent=tot?"Surface des pièces fermées : "+ckM(tot).replace(/,00$/,"")+" m²":""}
function ckS2W(x,y){const r=$("#ckStage").getBoundingClientRect();return [(x-r.left-CK.tx)/CK.s,(y-r.top-CK.ty)/CK.s]}
function ckVerts(skip){const r=[];ckItems().forEach(it=>{if(it.pts)it.pts.forEach((p,i)=>{if(skip&&skip.id===it.id&&skip.v===i)return;r.push(p)});if(it.t==="dim"){r.push(it.a,it.b)}});return r}
function ckSnap(w,from,skip){let p=w.slice(),snap=false;
  if(CK.snap){let best=null,bd=14/CK.s;ckVerts(skip).forEach(v=>{const d=Math.hypot(v[0]-p[0],v[1]-p[1]);if(d<bd){bd=d;best=v}});if(best)return {p:best.slice(),snap:true}}
  if(from&&CK.ortho){const dx=p[0]-from[0],dy=p[1]-from[1];let L=Math.hypot(dx,dy),a=Math.atan2(dy,dx);const st=CK.ortho*Math.PI/180;a=Math.round(a/st)*st;if(CK.snap)L=Math.round(L/.05)*.05;p=[from[0]+Math.cos(a)*L,from[1]+Math.sin(a)*L]}
  else if(CK.snap)p=[Math.round(p[0]/.05)*.05,Math.round(p[1]/.05)*.05];
  return {p:p.map(ckR),snap}}
function ckHit(w){const tol=12/CK.s;let best=null;const cand=(d,lim,r)=>{if(d<lim&&(!best||d<best.d))best={d,r}};
  ckItems().forEach(it=>{
    if(it.t==="text")cand(Math.hypot(w[0]-it.x,w[1]-it.y)*.8,Math.max(tol,(it.h||.3)*1.2),{id:it.id});
    else if(it.t==="door"||it.t==="win"){const g=ckOpenGeo(it);if(g)cand(ckDistSeg(w,g.p0,g.p1).d*.7,Math.max(tol,g.th),{id:it.id})}
    else if(it.t==="stair"){const c=ckStairPts(it);let ins=false;for(let i=0,j=3;i<4;j=i++){const [xi,yi]=c[i],[xj,yj]=c[j];if(((yi>w[1])!==(yj>w[1]))&&(w[0]<(xj-xi)*(w[1]-yi)/(yj-yi)+xi))ins=!ins}if(ins)cand(tol*.9,tol,{id:it.id})}
    else if(it.t==="dim")cand(ckDistSeg(w,it.a,it.b).d,tol*1.5,{id:it.id});
    else if(it.t==="wall"||it.t==="line"){it.pts.forEach((p,i)=>cand(Math.hypot(w[0]-p[0],w[1]-p[1])*.6,tol,{id:it.id,v:i}));
      ckSegs(it).forEach((sg,i)=>cand(ckDistSeg(w,sg[0],sg[1]).d,tol+(it.th||.05)/2,{id:it.id,seg:i}))}});
  return best?best.r:null}
function ckPush(){CK.hist.push(JSON.stringify(CK.plan.items));if(CK.hist.length>80)CK.hist.shift();CK.fut=[];CK.dirty=true;ckDraft()}
function ckDraft(){try{LS.set("vt_ck_draft",{key:CK.key,plan:CK.plan,at:Date.now()})}catch(e){}}
function ckEndWall(){if(CK.cur){if(CK.cur.pts.length<2)CK.plan.items=ckItems().filter(i=>i!==CK.cur);CK.cur=null}CK.hov=null;ckPanel();ckDraw()}
function ckAddPoint(p){if(!CK.cur){ckPush();CK.cur={t:CK.tool==="line"?"line":"wall",id:ckUid(),pts:[p],closed:false,th:CK.tool==="line"?0:CK.th};CK.plan.items.push(CK.cur)}
  else{const st=CK.cur.pts[0],last=CK.cur.pts[CK.cur.pts.length-1];if(Math.hypot(p[0]-last[0],p[1]-last[1])<.01){ckEndWall();return}ckPush();
    if(CK.cur.pts.length>=3&&Math.hypot(p[0]-st[0],p[1]-st[1])<.01){CK.cur.closed=true;CK.cur=null;toast("Pièce fermée");ckPanel();ckDraw();return}
    CK.cur.pts.push(p);CK.lastDir=Math.atan2(p[1]-last[1],p[0]-last[0])}
  ckPanel();ckDraw()}
function ckDirNow(){if(CK.cur&&CK.hov){const l=CK.cur.pts[CK.cur.pts.length-1],p=CK.hov.p;if(Math.hypot(p[0]-l[0],p[1]-l[1])>.05)return -Math.atan2(p[1]-l[1],p[0]-l[0])*180/Math.PI}return -CK.lastDir*180/Math.PI}
function ckByLength(angDeg){const raw=($("#ckLen")?.value||"").trim(),pa=raw.match(/^@?\s*([\d.,]+)\s*[<∠]\s*(-?[\d.,]+)\s*$/);if(pa){$("#ckLen").value=pa[1];angDeg=toNum(pa[2])}
  const L=numIn($("#ckLen")?.value);if(!(L>0)){toast("Écris d’abord la longueur en mètres.");$("#ckLen")?.focus();return}
  if(!CK.cur){const lw=[...ckItems()].reverse().find(i=>(i.t==="wall"||i.t==="line")&&i.pts.length);const start=lw?lw.pts[lw.pts.length-1].slice():[0,0];ckAddPoint(start)}
  const last=CK.cur.pts[CK.cur.pts.length-1],a=-angDeg*Math.PI/180;ckAddPoint([ckR(last[0]+Math.cos(a)*L),ckR(last[1]+Math.sin(a)*L)]);CK.lastDir=a;
  const e=$("#ckLen");if(e){e.value="";e.focus()}ckFitIfOut()}
function ckFitIfOut(){const b=ckBounds(CK.plan);if(!b)return;const V=ckView(),S=p=>[CK.tx+p[0]*CK.s,CK.ty+p[1]*CK.s],A=S([b[0],b[1]]),B=S([b[2],b[3]]);if(A[0]<8||A[1]<8||B[0]>V.W-8||B[1]>V.H-8){const w=b[2]-b[0],hh=b[3]-b[1];CK.s=Math.max(4,Math.min(CK.s,(V.W-60)/Math.max(w,1),(V.H-60)/Math.max(hh,1)));CK.tx=V.W/2-(b[0]+w/2)*CK.s;CK.ty=V.H/2-(b[1]+hh/2)*CK.s;ckDraw()}}
function ckFit(){const b=ckBounds(CK.plan),V=ckView();if(!b){CK.s=50;CK.tx=V.W/2;CK.ty=V.H/2;ckDraw();return}const w=b[2]-b[0],hh=b[3]-b[1];
  CK.s=Math.max(4,Math.min(400,Math.min((V.W-60)/Math.max(w,1),(V.H-60)/Math.max(hh,1))));CK.tx=V.W/2-(b[0]+w/2)*CK.s;CK.ty=V.H/2-(b[1]+hh/2)*CK.s;ckDraw()}
function ckZoomAt(f,cx,cy){const r=$("#ckStage").getBoundingClientRect();const x=cx==null?r.width/2:cx-r.left,y=cy==null?r.height/2:cy-r.top;const ns=Math.max(4,Math.min(600,CK.s*f));
  CK.tx=x-(x-CK.tx)*ns/CK.s;CK.ty=y-(y-CK.ty)*ns/CK.s;CK.s=ns;ckDraw()}
function ckSetTool(t){if(CK.ro&&t!=="select")return;ckEndWall();CK.tool=t;CK.ptA=null;CK.sel=null;$$("#ckTools button").forEach(b=>b.classList.toggle("on",b.dataset.tool===t));ckPanel();ckDraw()}
function ckChips(arr,cur,attr){return arr.map(v=>'<button type="button" class="ckchip'+(Math.abs(v-cur)<1e-6?" on":"")+'" data-'+attr+'="'+v+'">'+ckM(v)+'</button>').join("")}
const CK_ROOMS=["Salon","Séjour","Chambre","Cuisine","SDB","WC","Hall","Couloir","Dégagement","Terrasse","Balcon","Cour","Jardin","Garage","Magasin","Mezzanine","Bureau","Réserve","Buanderie","Escalier"];
const CK_COARSE=typeof matchMedia==="function"&&matchMedia("(pointer:coarse)").matches;
function ckNum(id,label,val,ph,cls){return '<label class="cklen'+(cls?" "+cls:"")+'"><span>'+label+'</span><input id="'+id+'" class="ckn" inputmode="'+(CK_COARSE?"none":"decimal")+'" autocomplete="off"'+(val!=null?' value="'+ckEsc(val)+'" data-fresh="1"':'')+(ph?' placeholder="'+ckEsc(ph)+'"':'')+'></label>'}
function ckKp(){return CK.kp?'<div class="ckkp" role="group" aria-label="Pavé numérique">'+["7","8","9","4","5","6","1","2","3",",","0","⌫"].map(k=>'<button type="button" data-k="'+k+'"'+(k==="⌫"?' aria-label="Effacer"':'')+'>'+k+'</button>').join("")+'</div>':''}
function ckHead(t,txt,kp){return '<div class="ckcmd"><b>'+t+'</b><span>'+txt+'</span>'+(kp?'<button type="button" class="ckkpt'+(CK.kp?" on":"")+'" id="ckKpT" title="Pavé numérique" aria-label="Pavé numérique">123</button>':'')+'</div>'}
const CK_TH=[.07,.1,.15,.2,.25,.3,.4];
function ckPanel(){const P=$("#ckPanel");if(!P)return;let h="";const T=CK.tool;
  if(CK.ro){P.innerHTML=ckHead("LECTURE SEULE","Glisse pour te déplacer, pince ou molette pour zoomer.");return}
  if(T==="wall"||T==="line"){const n=CK.cur?CK.cur.pts.length:0;
    h=ckHead(T==="wall"?"MUR":"LIGNE",n?"Écris la longueur puis touche la direction, ou glisse sur le plan jusqu’au point suivant.":"Touche le point de départ, ou écris une longueur et une direction : le tracé part du dernier point.",1)+
      '<div class="ckwork"><div class="ckcol"><div class="ckins">'+ckNum("ckLen","Longueur (m)",null,"ex. 3,5")+ckNum("ckAng","Angle (°)",null,"libre","sm")+'</div>'+ckKp()+'</div>'+
      '<div class="ckpad" role="group" aria-label="Direction du segment">'+[[135,"↖"],[90,"↑"],[45,"↗"],[180,"←"],[null,"↵"],[0,"→"],[225,"↙"],[270,"↓"],[315,"↘"]].map(([a,s])=>a==null?'<button type="button" class="ckdir ckok" id="ckGo" title="Tracer : angle écrit, sinon même direction" aria-label="Tracer">'+s+'</button>':'<button type="button" class="ckdir" data-a="'+a+'" title="'+a+'°" aria-label="Direction '+a+'°">'+s+'</button>').join("")+'</div></div>'+
      '<div class="ckrow">'+(T==="wall"?'<label class="cksel"><span>Épaisseur</span><select id="ckTh">'+CK_TH.map(v=>'<option value="'+v+'"'+(Math.abs(v-CK.th)<1e-6?" selected":"")+'>'+ckM(v)+' m</option>').join("")+'</select></label>':'')+
      '<button type="button" class="btn sm" id="ckUndoPt"'+(n?"":" disabled")+'>Annuler le point</button><button type="button" class="btn sm" id="ckClose"'+(n>=3?"":" disabled")+'>Fermer la pièce</button><button type="button" class="btn sm pri" id="ckEnd"'+(n?"":" disabled")+'>Terminer</button></div>'}
  else if(T==="rect")h=ckHead("PIÈCE","Glisse d’un coin à l’autre sur le plan, ou écris les dimensions puis « Placer ».",1)+'<div class="ckwork"><div class="ckcol"><div class="ckins">'+ckNum("ckRw","Largeur (m)",null,"ex. 4")+ckNum("ckRl","Longueur (m)",null,"ex. 3,5")+'</div>'+ckKp()+'</div><div class="ckcol grow"><label class="cklen grow"><span>Nom de la pièce</span><input id="ckRn" placeholder="ex. Salon" list="ckRoomList" autocomplete="off"></label><div class="ckrow ckchips">'+["Salon","Chambre","Cuisine","SDB","Hall","Terrasse"].map(r=>'<button type="button" class="ckchip" data-rn="'+r+'">'+r+'</button>').join("")+'</div><button type="button" class="btn sm pri" id="ckRgo">Placer</button></div></div>';
  else if(T==="door"||T==="win"){const cur=T==="door"?CK.doorW:CK.winW,opts=T==="door"?[.7,.8,.9,1,1.2,1.4,1.6]:[.6,.8,1,1.2,1.5,2,2.4];
    h=ckHead(T==="door"?"PORTE":"FENÊTRE","Choisis la largeur, puis touche un mur pour la placer.")+'<div class="ckrow ckchips">'+ckChips(opts,cur,"w")+'</div><div class="ckrow">'+ckNum("ckOw","Autre largeur (m)",null,"ex. 0,85","sm")+'</div>'}
  else if(T==="stair")h=ckHead("ESCALIER","Touche le plan pour le placer, puis règle sa taille et son sens.");
  else if(T==="dim")h=ckHead("COTE",CK.ptA?"Touche le second point.":"Touche le premier point : il s’aimante sur les angles des murs.");
  else if(T==="text")h=ckHead("TEXTE","Choisis ou écris le texte, puis touche le plan à l’endroit voulu.")+'<div class="ckrow"><label class="cklen grow"><span>Texte</span><input id="ckTxt" value="'+ckEsc(CK.txt)+'" autocomplete="off"></label></div><div class="ckrow ckchips">'+CK_ROOMS.map(r=>'<button type="button" class="ckchip'+(r===CK.txt?" on":"")+'" data-room="'+ckEsc(r)+'">'+ckEsc(r)+'</button>').join("")+'</div>';
  else if(T==="erase")h=ckHead("GOMME","Touche un élément pour l’effacer (annulable).");
  else{const s=CK.sel&&ckFind(CK.sel.id);
    if(!s)h=ckHead("SÉLECTION","Touche un élément pour le modifier. Glisse pour te déplacer, pince ou molette pour zoomer.");
    else if(s.t==="wall"||s.t==="line"){const sg=CK.sel.seg!=null?ckSegs(s)[CK.sel.seg]:null,L=sg?Math.hypot(sg[1][0]-sg[0][0],sg[1][1]-sg[0][1]):0;
      h=ckHead(s.t==="wall"?"MUR":"LIGNE",sg?"Segment de "+ckM(L)+" m : écris la nouvelle longueur, la suite du tracé suit.":CK.sel.v!=null?"Glisse le point pour le déplacer.":"Touche un segment pour changer sa longueur.",!!sg)+
        (sg?'<div class="ckwork"><div class="ckcol"><div class="ckins">'+ckNum("ckSegL","Longueur (m)",ckM(L))+'</div>'+ckKp()+'</div><div class="ckcol"><button type="button" class="btn sm pri" id="ckSegGo">Appliquer</button></div></div>':'')+
        '<div class="ckrow">'+(s.t==="wall"?'<label class="cksel"><span>Épaisseur</span><select id="ckSelTh">'+CK_TH.map(v=>'<option value="'+v+'"'+(Math.abs(v-(s.th||.2))<1e-6?" selected":"")+'>'+ckM(v)+' m</option>').join("")+'</select></label>':'')+
        (s.pts.length>2?'<button type="button" class="btn sm" id="ckTogClose">'+(s.closed?"Ouvrir":"Fermer la pièce")+'</button>':'')+(s.closed?'':'<button type="button" class="btn sm" id="ckContinue">Continuer le tracé</button>')+'<button type="button" class="btn sm bad" id="ckDel">Supprimer</button></div>'}
    else if(s.t==="door"||s.t==="win"){const opts=s.t==="door"?[.7,.8,.9,1,1.2,1.4,1.6]:[.6,.8,1,1.2,1.5,2,2.4];
      h=ckHead(s.t==="door"?"PORTE":"FENÊTRE","Largeur "+ckM(s.w)+" m. Glisse-la le long du mur pour la déplacer.")+'<div class="ckrow ckchips">'+ckChips(opts,s.w,"sw")+'</div><div class="ckrow">'+(s.t==="door"?'<button type="button" class="btn sm" id="ckFlip">Inverser les gonds</button><button type="button" class="btn sm" id="ckSide">Ouvrir de l’autre côté</button>':'')+'<button type="button" class="btn sm" id="ckMoveL">◀ 10 cm</button><button type="button" class="btn sm" id="ckMoveR">10 cm ▶</button><button type="button" class="btn sm bad" id="ckDel">Supprimer</button></div>'}
    else if(s.t==="stair")h=ckHead("ESCALIER","Glisse pour le déplacer.",1)+'<div class="ckwork"><div class="ckcol"><div class="ckins">'+ckNum("ckSw","Largeur",ckM(s.w))+ckNum("ckSl","Longueur",ckM(s.l))+ckNum("ckSn","Marches",String(s.n||12),null,"sm")+'</div>'+ckKp()+'</div><div class="ckcol"><button type="button" class="btn sm pri" id="ckSgo">Appliquer</button><button type="button" class="btn sm" id="ckSrot">Tourner 90°</button><button type="button" class="btn sm bad" id="ckDel">Supprimer</button></div></div>';
    else if(s.t==="text")h=ckHead("TEXTE","Glisse pour le déplacer.")+'<div class="ckrow"><label class="cklen grow"><span>Texte</span><input id="ckTe" value="'+ckEsc(s.s)+'" autocomplete="off"></label><button type="button" class="btn sm" id="ckTs" aria-label="Plus petit">A−</button><button type="button" class="btn sm" id="ckTb" aria-label="Plus grand">A+</button><button type="button" class="btn sm bad" id="ckDel">Supprimer</button></div>';
    else if(s.t==="dim")h=ckHead("COTE",ckM(Math.hypot(s.b[0]-s.a[0],s.b[1]-s.a[1]))+" m")+'<div class="ckrow"><button type="button" class="btn sm" id="ckDo">Décaler la cote</button><button type="button" class="btn sm bad" id="ckDel">Supprimer</button></div>'}
  P.innerHTML=h;ckWirePanel()}
function ckWirePanel(){const on=(id,f)=>{const e=document.getElementById(id);if(e)e.onclick=f};
  const ins=$$("#ckPanel .ckn");if(ins.length){if(!ins.some(x=>x.id===CK.kf))CK.kf=ins[0].id;ins.forEach(x=>{x.classList.toggle("act",x.id===CK.kf);x.addEventListener("focus",()=>{if(!CK_COARSE)try{x.select()}catch(e){}CK.kf=x.id;ins.forEach(y=>y.classList.toggle("act",y===x))})})}
  $$("#ckPanel .ckkp button").forEach(b=>{b.addEventListener("pointerdown",e=>e.preventDefault());b.onclick=()=>{const t=document.getElementById(CK.kf)||ins[0];if(!t)return;const k=b.dataset.k;if(t.dataset.fresh==="1"){t.dataset.fresh="";if(k!=="⌫")t.value=""}
    if(k==="⌫")t.value=t.value.slice(0,-1);else if(k===","){if(!/[.,]/.test(t.value))t.value+=(t.value?"":"0")+","}else t.value+=k;t.dispatchEvent(new Event("input",{bubbles:true}))}});
  on("ckKpT",()=>{CK.kp=!CK.kp;try{LS.set("vt_ck_kp",CK.kp)}catch(e){}const keep=ins.map(x=>[x.id,x.value]);ckPanel();keep.forEach(([id,v])=>{const e=document.getElementById(id);if(e)e.value=v})});
  $$("#ckPanel [data-rn]").forEach(b=>b.onclick=()=>{$("#ckRn").value=b.dataset.rn});
  $$("#ckPanel .ckdir[data-a]").forEach(b=>b.onclick=()=>ckByLength(+b.dataset.a));
  on("ckGo",()=>{const a=numIn(($("#ckAng")||{}).value);ckByLength(a!=null?a:ckDirNow())});
  const len=$("#ckLen");if(len)len.onkeydown=e=>{const m={ArrowRight:0,ArrowUp:90,ArrowLeft:180,ArrowDown:270};if(e.key==="Enter"){e.preventDefault();const a=numIn(($("#ckAng")||{}).value);ckByLength(a!=null?a:ckDirNow())}else if(m[e.key]!=null){e.preventDefault();ckByLength(m[e.key])}};
  const th=$("#ckTh");if(th)th.onchange=()=>{CK.th=+th.value;if(CK.cur&&CK.cur.t==="wall"){CK.cur.th=CK.th;ckDraw()}};
  on("ckUndoPt",()=>{if(!CK.cur)return;ckPush();CK.cur.pts.pop();if(!CK.cur.pts.length){CK.plan.items=ckItems().filter(i=>i!==CK.cur);CK.cur=null}ckPanel();ckDraw()});
  on("ckClose",()=>{if(CK.cur&&CK.cur.pts.length>=3){ckPush();CK.cur.closed=true;CK.cur=null;ckPanel();ckDraw()}});on("ckEnd",ckEndWall);
  on("ckRgo",()=>{const w=numIn($("#ckRw").value),l=numIn($("#ckRl").value);if(!(w>0&&l>0)){toast("Écris la largeur et la longueur.");return}
    const V=ckView(),c=[(V.W/2-CK.tx)/CK.s,(V.H/2-CK.ty)/CK.s].map(v=>Math.round(v/.05)*.05);ckRect([c[0]-w/2,c[1]-l/2],[c[0]+w/2,c[1]+l/2],$("#ckRn").value.trim());ckFitIfOut()});
  $$("#ckPanel [data-w]").forEach(b=>b.onclick=()=>{if(CK.tool==="door")CK.doorW=+b.dataset.w;else CK.winW=+b.dataset.w;ckPanel()});
  const ow=$("#ckOw");if(ow)ow.oninput=()=>{const v=numIn(ow.value);if(v>=.3&&v<=6){if(CK.tool==="door")CK.doorW=v;else CK.winW=v;$$("#ckPanel [data-w]").forEach(b=>b.classList.toggle("on",Math.abs(+b.dataset.w-v)<1e-6))}};
  const tx=$("#ckTxt");if(tx)tx.oninput=()=>{CK.txt=tx.value};$$("#ckPanel [data-room]").forEach(b=>b.onclick=()=>{CK.txt=b.dataset.room;ckPanel()});
  const s=CK.sel&&ckFind(CK.sel.id);if(!s)return;
  on("ckDel",()=>{ckPush();CK.plan.items=ckItems().filter(i=>i.id!==s.id&&i.wid!==s.id);CK.sel=null;ckPanel();ckDraw()});
  on("ckSegGo",()=>{const L=numIn($("#ckSegL").value);if(!(L>0))return;ckPush();const i=CK.sel.seg,p=s.pts,a=p[i],j=(i+1)%p.length,b=p[j],L0=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L0<1e-6)return;
    const dx=(b[0]-a[0])/L0*(L-L0),dy=(b[1]-a[1])/L0*(L-L0);if(j===0){/* segment de fermeture : on déplace le premier point */p[0]=[ckR(p[0][0]+dx),ckR(p[0][1]+dy)]}else for(let k=j;k<p.length;k++)p[k]=[ckR(p[k][0]+dx),ckR(p[k][1]+dy)];ckPanel();ckDraw()});
  const st=$("#ckSelTh");if(st)st.onchange=()=>{ckPush();s.th=+st.value;ckDraw()};
  on("ckTogClose",()=>{ckPush();s.closed=!s.closed;ckPanel();ckDraw()});
  on("ckContinue",()=>{CK.tool=s.t==="line"?"line":"wall";$$("#ckTools button").forEach(b=>b.classList.toggle("on",b.dataset.tool===CK.tool));if(s.closed){toast("Pièce fermée : ouvre-la d’abord pour continuer.");return}CK.cur=s;CK.sel=null;ckPanel();ckDraw()});
  $$("#ckPanel [data-sw]").forEach(b=>b.onclick=()=>{ckPush();s.w=+b.dataset.sw;ckPanel();ckDraw()});
  on("ckFlip",()=>{ckPush();s.flip=s.flip?0:1;ckDraw()});on("ckSide",()=>{ckPush();s.side=s.side?0:1;ckDraw()});
  on("ckMoveL",()=>{ckPush();s.d=Math.max(s.w/2,s.d-.1);ckDraw()});on("ckMoveR",()=>{ckPush();s.d=s.d+.1;ckDraw()});
  on("ckSgo",()=>{const w=numIn($("#ckSw").value),l=numIn($("#ckSl").value),n=parseInt($("#ckSn").value,10);ckPush();if(w>0)s.w=w;if(l>0)s.l=l;if(n>1&&n<80)s.n=n;ckDraw()});
  on("ckSrot",()=>{ckPush();s.r=((s.r||0)+90)%360;ckDraw()});
  const te=$("#ckTe");if(te)te.onchange=()=>{ckPush();s.s=te.value;ckDraw()};on("ckTs",()=>{ckPush();s.h=Math.max(.15,(s.h||.35)-.05);ckDraw()});on("ckTb",()=>{ckPush();s.h=Math.min(1.5,(s.h||.35)+.05);ckDraw()});
  on("ckDo",()=>{ckPush();s.o=((s.o||0)+.3)>1.8?-.9:(s.o||0)+.3;ckDraw()})}
function ckRect(a,b,name){const x0=Math.min(a[0],b[0]),x1=Math.max(a[0],b[0]),y0=Math.min(a[1],b[1]),y1=Math.max(a[1],b[1]);if(x1-x0<.1||y1-y0<.1)return;ckPush();
  CK.plan.items.push({t:"wall",id:ckUid(),pts:[[x0,y0],[x1,y0],[x1,y1],[x0,y1]].map(p=>p.map(ckR)),closed:true,th:CK.th});
  if(name)CK.plan.items.push({t:"text",id:ckUid(),x:ckR((x0+x1)/2),y:ckR((y0+y1)/2),s:name,h:.3});ckPanel();ckDraw()}
function ckPlaceOpening(w){let best=null;ckItems().forEach(it=>{if(it.t!=="wall")return;ckSegs(it).forEach((sg,i)=>{const r=ckDistSeg(w,sg[0],sg[1]);if(r.d<Math.max(16/CK.s,(it.th||.2))&&(!best||r.d<best.d))best={d:r.d,it,i,t:r.t,L:Math.hypot(sg[1][0]-sg[0][0],sg[1][1]-sg[0][1])}})});
  if(!best){toast("Touche un mur pour placer "+(CK.tool==="door"?"la porte.":"la fenêtre."));return}const wd=CK.tool==="door"?CK.doorW:CK.winW;if(best.L<wd+.05){toast("Ce mur est trop court pour cette largeur.");return}
  ckPush();const o={t:CK.tool,id:ckUid(),wid:best.it.id,si:best.i,d:ckR(Math.max(wd/2,Math.min(best.L-wd/2,best.t*best.L))),w:wd};if(CK.tool==="door"){o.flip=0;o.side=0}CK.plan.items.push(o);CK.tool="select";CK.sel={id:o.id};
  $$("#ckTools button").forEach(b=>b.classList.toggle("on",b.dataset.tool==="select"));ckPanel();ckDraw()}
/* ---------- gestes ---------- */
function ckDown(e){if(e.target.closest&&e.target.closest(".ckzoom"))return;const st=$("#ckStage");st.setPointerCapture?.(e.pointerId);CK.ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(CK.ptrs.size===2){const [a,b]=[...CK.ptrs.values()];CK.pinch={d:Math.hypot(a.x-b.x,a.y-b.y),mx:(a.x+b.x)/2,my:(a.y+b.y)/2};CK.drag=null;return}
  const w=ckS2W(e.clientX,e.clientY);CK.drag={x0:e.clientX,y0:e.clientY,moved:false,w,btn:e.button};
  if(e.button===1||e.button===2){CK.drag.pan=true;return}
  if(CK.tool==="select"&&!CK.ro){const h=ckHit(w);if(h){CK.sel=h;CK.drag.obj=h;CK.drag.snap0=JSON.stringify(ckItems());ckPanel();ckDraw()}else CK.drag.pan=true}
  else if(CK.tool==="select"||CK.ro)CK.drag.pan=true;
  else if(CK.tool==="rect"||CK.tool==="dim"){if(!CK.ptA){CK.ptA=ckSnap(w).p;CK.drag.started=true;ckPanel()}}}
function ckMove(e){if(CK.ptrs.has(e.pointerId))CK.ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(CK.pinch&&CK.ptrs.size===2){const [a,b]=[...CK.ptrs.values()],d=Math.hypot(a.x-b.x,a.y-b.y),mx=(a.x+b.x)/2,my=(a.y+b.y)/2;CK.tx+=mx-CK.pinch.mx;CK.ty+=my-CK.pinch.my;ckZoomAt(d/CK.pinch.d,mx,my);CK.pinch={d,mx,my};return}
  const w=ckS2W(e.clientX,e.clientY),D=CK.drag;
  if(D){if(Math.hypot(e.clientX-D.x0,e.clientY-D.y0)>6)D.moved=true;
    if(D.pan){if(D.moved){CK.tx+=e.clientX-(D.lx??D.x0);CK.ty+=e.clientY-(D.ly??D.y0);D.lx=e.clientX;D.ly=e.clientY;ckDraw()}return}
    if(D.obj&&D.moved){const it=ckFind(D.obj.id);if(!it)return;if(!D.pushed){CK.hist.push(D.snap0);CK.fut=[];D.pushed=true;CK.dirty=true}
      if(D.obj.v!=null&&it.pts){const prev=it.pts[D.obj.v-1]||(it.closed?it.pts[it.pts.length-1]:null);it.pts[D.obj.v]=ckSnap(w,prev,{id:it.id,v:D.obj.v}).p}
      else if(it.t==="text"||it.t==="stair"){const dx=w[0]-D.w[0],dy=w[1]-D.w[1];it.x=ckR(it.x+dx);it.y=ckR(it.y+dy);D.w=w}
      else if((it.t==="door"||it.t==="win")){const g=ckOpenGeo(it);if(g){const r=ckDistSeg(w,g.a,g.b);it.d=ckR(r.t*g.L)}}
      else if(it.pts&&D.obj.seg!=null){const dx=w[0]-D.w[0],dy=w[1]-D.w[1];const sg=D.obj.seg,i=sg,j=(sg+1)%it.pts.length;[i,j].forEach(k=>it.pts[k]=[ckR(it.pts[k][0]+dx),ckR(it.pts[k][1]+dy)]);D.w=w}
      ckDraw();return}}
  if(CK.tool==="wall"||CK.tool==="line"){const last=CK.cur?CK.cur.pts[CK.cur.pts.length-1]:null;CK.hov=ckSnap(w,last);ckDraw()}
  else if((CK.tool==="dim"||CK.tool==="rect")&&CK.ptA){CK.hov=ckSnap(w,CK.tool==="dim"?CK.ptA:null);ckDraw()}}
function ckUp(e){if(!CK.ptrs.has(e.pointerId)&&!CK.pinch)return;CK.ptrs.delete(e.pointerId);if(CK.pinch){if(CK.ptrs.size<2)CK.pinch=null;CK.drag=null;return}
  const D=CK.drag;CK.drag=null;if(!D)return;const w=ckS2W(e.clientX,e.clientY);
  if(D.pan||D.obj){if(D.obj&&D.pushed){ckDraft();ckPanel()}return}
  if(CK.ro)return;
  if(CK.tool==="wall"||CK.tool==="line"){const last=CK.cur?CK.cur.pts[CK.cur.pts.length-1]:null;const p=ckSnap(w,last).p;
    if(CK.cur&&CK.cur.pts.length>=3){const s0=CK.cur.pts[0];if(Math.hypot(p[0]-s0[0],p[1]-s0[1])<14/CK.s){ckPush();CK.cur.closed=true;CK.cur=null;toast("Pièce fermée");ckPanel();ckDraw();return}}
    ckAddPoint(p);return}
  if(CK.tool==="rect"){if(CK.ptA&&(D.moved||!D.started)){ckRect(CK.ptA,ckSnap(w).p,"");CK.ptA=null;CK.hov=null;ckPanel();ckDraw()}return}
  if(CK.tool==="dim"){if(CK.ptA&&!D.started){const b=ckSnap(w,CK.ptA).p;if(Math.hypot(b[0]-CK.ptA[0],b[1]-CK.ptA[1])>.05){ckPush();CK.plan.items.push({t:"dim",id:ckUid(),a:CK.ptA,b,o:.5})}CK.ptA=null;CK.hov=null;ckPanel();ckDraw()}
    else if(CK.ptA&&D.started&&D.moved){const b=ckSnap(w,CK.ptA).p;ckPush();CK.plan.items.push({t:"dim",id:ckUid(),a:CK.ptA,b,o:.5});CK.ptA=null;CK.hov=null;ckPanel();ckDraw()}return}
  if(CK.tool==="door"||CK.tool==="win"){ckPlaceOpening(w);return}
  if(CK.tool==="stair"){ckPush();const p=ckSnap(w).p;const o={t:"stair",id:ckUid(),x:p[0],y:p[1],w:1,l:3,n:12,r:0};CK.plan.items.push(o);CK.tool="select";CK.sel={id:o.id};$$("#ckTools button").forEach(b=>b.classList.toggle("on",b.dataset.tool==="select"));ckPanel();ckDraw();return}
  if(CK.tool==="text"){const s=(($("#ckTxt")||{}).value||CK.txt||"").trim();if(!s){toast("Écris le texte d’abord.");return}ckPush();const p=ckSnap(w).p;CK.plan.items.push({t:"text",id:ckUid(),x:p[0],y:p[1],s,h:.3});ckDraw();return}
  if(CK.tool==="erase"){const h=ckHit(w);if(!h)return;ckPush();CK.plan.items=ckItems().filter(i=>i.id!==h.id&&i.wid!==h.id);if(CK.cur&&CK.cur.id===h.id)CK.cur=null;ckDraw()}}
/* ---------- ouverture, enregistrement ---------- */
function ckOpen(idx,ro){try{const k=LS.get("vt_ck_kp",null);CK.kp=k==null?CK_COARSE:!!k}catch(e){CK.kp=CK_COARSE}const base=idx>=0?visPlans[idx]:{id:ckUid(),name:visPlans.length?"Étage "+visPlans.length:"RDC",items:[]};
  CK.idx=idx;CK.ro=!!ro;CK.key=(visEditing?.id||"new")+"/"+base.id;CK.plan=JSON.parse(JSON.stringify(base));CK.hist=[];CK.fut=[];CK.cur=null;CK.sel=null;CK.ptA=null;CK.hov=null;CK.dirty=false;
  try{const d=LS.get("vt_ck_draft",null);if(!ro&&d&&d.key===CK.key&&d.plan&&d.at>(base.updatedAt||0)&&JSON.stringify(d.plan.items)!==JSON.stringify(base.items)){CK.plan=d.plan;CK.dirty=true;toast("Brouillon non enregistré récupéré")}}catch(e){}
  $("#ckName").value=CK.plan.name||"";$("#ckName").disabled=CK.ro;$("#ckSave").hidden=CK.ro;$("#ckClear").hidden=CK.ro;
  $("#ckDlg").showModal();CK.tool=CK.ro?"select":(CK.plan.items.length?"select":"wall");$$("#ckTools button").forEach(b=>{b.classList.toggle("on",b.dataset.tool===CK.tool);b.disabled=CK.ro&&b.dataset.tool!=="select"});
  ckSyncToggles();requestAnimationFrame(()=>{ckFit();ckPanel()})}
function ckSyncToggles(){$("#ckOrtho").textContent=CK.ortho?"Ortho "+CK.ortho+"°":"Angle libre";$("#ckOrtho").classList.toggle("on",!!CK.ortho);
  $("#ckSnapB").classList.toggle("on",CK.snap);$("#ckGridB").classList.toggle("on",CK.grid);$("#ckDimsB").classList.toggle("on",CK.dims)}
async function ckPersist(okMsg){
  if(visEditing?.id&&!visRO){try{const st=await commitSoft(visCol().doc(visEditing.id).update({plans:JSON.parse(JSON.stringify(visPlans)),updatedAt:Date.now()}));visEditing.plans=JSON.parse(JSON.stringify(visPlans));
      toast(st==="queued"?"Croquis enregistré sur l’appareil : envoi au retour du réseau.":okMsg);return true}catch(e){toast(errMsg(e,"Croquis gardé dans la fiche : enregistre la fiche."));return false}}
  toast("Croquis gardé dans la fiche : enregistre la fiche pour le garder.");return true}
async function ckSave(){if(!CK.plan||CK.ro)return;ckEndWall();CK.plan.name=$("#ckName").value.trim()||"Croquis";CK.plan.updatedAt=Date.now();
  const p=JSON.parse(JSON.stringify(CK.plan));if(CK.idx>=0)visPlans[CK.idx]=p;else{visPlans.push(p);CK.idx=visPlans.length-1}CK.dirty=false;renderCkList();
  try{LS.set("vt_ck_draft",null)}catch(e){}await ckPersist("Croquis enregistré")}
function ckDup(i){const s=visPlans[i];if(!s)return;const n=JSON.parse(JSON.stringify(s));n.id=ckUid();n.name=(s.name||"Croquis")+" (copie)";n.updatedAt=Date.now();
  const map={};n.items.forEach(it=>{const o=it.id;it.id=ckUid();map[o]=it.id});n.items.forEach(it=>{if(it.wid)it.wid=map[it.wid]||it.wid});visPlans.splice(i+1,0,n);renderCkList();ckPersist("Croquis dupliqué")}
function ckDelPlan(i,btn){if(btn.dataset.arm!=="1"){btn.dataset.arm="1";btn.textContent="Confirmer";btn.classList.add("arm");setTimeout(()=>{btn.dataset.arm="";btn.textContent="Supprimer";btn.classList.remove("arm")},3500);return}
  visPlans.splice(i,1);renderCkList();ckPersist("Croquis supprimé")}
function ckMount(d){const B=$("#visBody");if(!B)return;$("#ckFs")?.remove();
  B.append(h("fieldset",{id:"ckFs",class:"ckfs"},h("legend",{text:"Croquis et plans"}),
    h("p",{class:"note",text:"Dessine le plan coté du bien : murs, portes, fenêtres, escaliers et cotes. Les longueurs et les surfaces des pièces s’affichent toutes seules, et chaque croquis s’ajoute au PDF de la fiche."}),
    h("div",{class:"cklist",id:"ckList"}),h("div",null,h("button",{type:"button",class:"btn",id:"ckAdd",onclick:()=>ckOpen(-1,false),text:"+ Nouveau croquis"}))));
  visPlans=JSON.parse(JSON.stringify(d?.plans||[]));renderCkList()}
function renderCkList(){const L=$("#ckList");if(!L)return;L.innerHTML="";
  visPlans.forEach((p,i)=>{const n=(p.items||[]).filter(x=>x.t==="wall").length,area=(p.items||[]).filter(x=>x.t==="wall"&&x.closed&&x.pts.length>2).reduce((s,x)=>s+ckArea(x.pts),0);
    const card=h("button",{type:"button",class:"ckopen",onclick:()=>ckOpen(i,visRO)});const th=h("div",{class:"ckthumb"});
    const b=ckBounds(p);if(b){const W=220,H=150,pad=.6,s=Math.min((W-16)/(b[2]-b[0]+pad*2),(H-16)/(b[3]-b[1]+pad*2));th.innerHTML=ckSvg(p,{W,H,s,tx:W/2-((b[0]+b[2])/2)*s,ty:H/2-((b[1]+b[3])/2)*s},{bg:"#ffffff",dims:false,fs:9,thumb:1})}
    else th.textContent="Vide";
    card.append(th,h("b",{text:p.name||"Croquis"}),h("small",{text:(n?n+" mur"+(n>1?"s":""):"Aucun mur")+(area?" · "+ckM(area).replace(/,00$/,"")+" m²":"")}));
    L.append(h("div",{class:"ckcard"},card,visRO?null:h("div",{class:"ckacts"},h("button",{type:"button",class:"linkbtn",text:"Dupliquer",onclick:()=>ckDup(i)}),h("button",{type:"button",class:"linkbtn",text:"Supprimer",onclick:e=>ckDelPlan(i,e.currentTarget)}))))});
  const add=$("#ckAdd");if(add)add.hidden=visRO}
/* ---------- croquis dans le PDF de la fiche ---------- */
async function addPlansToPdf(doc,v){const ps=(v.plans||[]).filter(p=>(p.items||[]).length);for(const p of ps){
  const img=await ckPng(p,2000,ckMeta(p.name,v));if(!img)continue;
  const land=img.W>img.H;doc.addPage("a4",land?"landscape":"portrait");const pw=doc.internal.pageSize.getWidth(),ph=doc.internal.pageSize.getHeight(),m=10;
  const r=Math.min((pw-2*m)/img.W,(ph-2*m)/img.H),w=img.W*r,hh=img.H*r;doc.addImage(img.url,"PNG",(pw-w)/2,m,w,hh)}}
/* ---------- câblage ---------- */
(function(){const tb=$("#ckTools");if(!tb)return;tb.innerHTML=CK_TOOLS.map(([k,t,p])=>'<button type="button" data-tool="'+k+'" title="'+t+'" aria-label="'+t+'">'+ckIcon(p)+'<span>'+t.split(" ")[0]+'</span></button>').join("");
  $$("#ckTools button").forEach(b=>b.onclick=()=>ckSetTool(b.dataset.tool));
  const st=$("#ckStage");st.addEventListener("pointerdown",ckDown);st.addEventListener("pointermove",ckMove);st.addEventListener("pointerup",ckUp);st.addEventListener("pointercancel",e=>{CK.ptrs.delete(e.pointerId);CK.pinch=null;CK.drag=null});
  st.addEventListener("pointerleave",()=>{if(!CK.drag){CK.hov=null;ckDraw()}});st.addEventListener("contextmenu",e=>e.preventDefault());
  st.addEventListener("wheel",e=>{e.preventDefault();ckZoomAt(e.deltaY<0?1.15:1/1.15,e.clientX,e.clientY)},{passive:false});
  $("#ckZin").onclick=()=>ckZoomAt(1.25);$("#ckZout").onclick=()=>ckZoomAt(1/1.25);$("#ckFit").onclick=ckFit;
  $("#ckUndo").onclick=()=>{if(!CK.hist.length||CK.ro)return;CK.fut.push(JSON.stringify(CK.plan.items));CK.plan.items=JSON.parse(CK.hist.pop());CK.cur=null;CK.sel=null;CK.dirty=true;ckDraft();ckPanel();ckDraw()};
  $("#ckRedo").onclick=()=>{if(!CK.fut.length||CK.ro)return;CK.hist.push(JSON.stringify(CK.plan.items));CK.plan.items=JSON.parse(CK.fut.pop());CK.cur=null;CK.sel=null;CK.dirty=true;ckDraft();ckPanel();ckDraw()};
  let clr=false;$("#ckClear").onclick=e=>{if(!clr){clr=true;e.currentTarget.classList.add("arm");e.currentTarget.title="Toucher encore pour tout effacer";toast("Touche encore la corbeille pour tout effacer.");setTimeout(()=>{clr=false;$("#ckClear").classList.remove("arm")},3500);return}
    clr=false;$("#ckClear").classList.remove("arm");ckPush();CK.plan.items=[];CK.cur=null;CK.sel=null;ckPanel();ckDraw()};
  $("#ckOrtho").onclick=()=>{CK.ortho=CK.ortho===90?45:CK.ortho===45?0:90;ckSyncToggles()};$("#ckSnapB").onclick=()=>{CK.snap=!CK.snap;ckSyncToggles()};
  $("#ckGridB").onclick=()=>{CK.grid=!CK.grid;ckSyncToggles();ckDraw()};$("#ckDimsB").onclick=()=>{CK.dims=!CK.dims;ckSyncToggles();ckDraw()};
  $("#ckSave").onclick=ckSave;
  $("#ckPng").onclick=async()=>{if(!CK.plan)return;const img=await ckPng(CK.plan,2200,ckMeta($("#ckName").value||"plan",{...(visEditing||{}),...(typeof readVisite==="function"&&$("#visDlg").open?readVisite():{})}));if(!img){toast("Le croquis est vide.");return}
    const b=await new Promise(r=>img.canvas.toBlob(r,"image/png"));await saveFile("Croquis_"+(($("#ckName").value||"plan").replace(/[^\w-]+/g,"_"))+(visEditing?.dossier?"_"+visEditing.dossier:"")+".png",b)};
  $("#ckBack").onclick=()=>{if(CK.dirty&&!CK.ro){ckSave().then(()=>$("#ckDlg").close())}else $("#ckDlg").close()};
  $("#ckDlg").addEventListener("cancel",e=>{if(CK.cur){e.preventDefault();ckEndWall();return}if(CK.dirty&&!CK.ro){e.preventDefault();ckSave().then(()=>$("#ckDlg").close())}});
  window.addEventListener("resize",()=>{if($("#ckDlg").open)ckDraw()});
  if(typeof ResizeObserver==="function"){let last=null;new ResizeObserver(en=>{const r=en[0].contentRect;if(last&&$("#ckDlg").open&&CK.plan&&r.width&&r.height){CK.tx+=(r.width-last.w)/2;CK.ty+=(r.height-last.h)/2;ckDraw()}last={w:r.width,h:r.height}}).observe(st)}
  document.addEventListener("keydown",e=>{if(!$("#ckDlg").open)return;if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="z"){e.preventDefault();$(e.shiftKey?"#ckRedo":"#ckUndo").click()}
    else if(e.key==="Delete"&&CK.sel&&!/input|select|textarea/i.test(e.target.tagName)){$("#ckDel")?.click()}
    else if(/^[0-9.,]$/.test(e.key)&&!e.ctrlKey&&!e.metaKey&&!/input|select|textarea/i.test(e.target.tagName)){const l=$("#ckLen")||$("#ckSegL")||$("#ckRw");if(l){l.focus()}}});
})();

/* ===================== agenda Google → fiche de visite (propriétaire seulement) ===================== */
/* Lecture seule de l'agenda (calendar.readonly). Le jeton est demandé avec une 2e instance Firebase
   (« vtcal ») : la session Valtera ne change pas, même si on choisit un autre compte Google (ex. compte Tinsa). */
var AG={tok:null,exp:0,email:"",cal:"",cals:[],date:"",events:[],busy:false};
const AG_SCOPE="https://www.googleapis.com/auth/calendar.readonly";
const AG_API="https://www.googleapis.com/calendar/v3";
const AG_ENABLE="https://console.developers.google.com/apis/api/calendar-json.googleapis.com/overview?project="+((window.VT_CONFIG&&VT_CONFIG.firebase&&VT_CONFIG.firebase.messagingSenderId)||"");
function agLoad(){try{const s=JSON.parse(sessionStorage.getItem("vt_ag_tok")||"null");if(s&&s.exp>Date.now()+60000){AG.tok=s.tok;AG.exp=s.exp;AG.email=s.email||""}}catch(e){}
  try{AG.cal=LS.get("vt_ag_cal","")||"";if(!AG.email)AG.email=LS.get("vt_ag_hint","")||""}catch(e){}}
function agSaveTok(){try{sessionStorage.setItem("vt_ag_tok",JSON.stringify({tok:AG.tok,exp:AG.exp,email:AG.email}))}catch(e){}}
function agDateISO(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function agHM(d){return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0")}
/* ---------- lecture d'un rendez-vous ---------- */
function agLines(html){return String(html||"").replace(/<br\s*\/?>/gi,"\n").replace(/<\/(li|p|div|h\d)>/gi,"\n").replace(/<li[^>]*>/gi,"").replace(/<[^>]+>/g,"")
  .replace(/&nbsp;/g," ").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&amp;/g,"&")
  .split(/\n/).map(s=>s.replace(/[ \t ]+/g," ").trim()).filter(Boolean)}
const AG_PH=/(?:\+\s?212[\s.\-]*|\b0)[5-7](?:[\s.\-]*\d){8}\b/g;
function agTel(s){let d=String(s).replace(/\D/g,"");if(d.startsWith("212"))d="0"+d.slice(3);return d.length===10?d.replace(/(\d{2})(?=\d)/g,"$1 ").trim():s.trim()}
function agGps(t){const L=t.match(/lat[a-z.]*\s*:?\s*(-?\d{1,2}[.,]\d+)[\s\S]{0,40}?lon[a-z.]*\s*:?\s*(-?\d{1,3}[.,]\d+)/i);
  if(L){const a=+L[1].replace(",","."),b=+L[2].replace(",",".");if(a>20&&a<37&&b<0&&b>-18)return [a,b]}return coordsFrom(t)}
const AG_CLIENT=/\b(bank|banque|banco|immo|leasing|cih|attijari|atw|bmci|bmce|barid|sabadel|cdg|saham|wafa|cr[ée]dit|soci[ée]t[ée]|sarl|holding|groupe|assurance|bank of africa|boa|cfg|umnia|al akhdar|tamwil)\b/i;
const AG_NOTE=/visite|merci|contact|confirm|lat\b|lat\.|long|g[ée]oloc|ext[ée]rieur|int[ée]rieur|[ée]tude|voir avec|rdv|rendez|cl[ée]s?\b|appeler|urgent/i;
const AG_TYPES=[[/terrain/i,null,"terrain"],[/\b(e\.?a\.?|[ée]tat d.?avancement|avancement)\b/i,null,"avancement"],
  [/usine|entrep[ôo]t|hangar|plate-?forme logistique|logistique|unit[ée] industrielle|industriel|d[ée]p[ôo]t/i,"Usine"],[/appartement|appart\b|duplex|studio|triplex/i,"Appartement"],
  [/\bvilla/i,"Villa"],[/maison|riad|habitation/i,"Maison"],[/\blocal|magasin|commerc|showroom|boutique|caf[ée]|restaurant|pharmacie|agence/i,"Local commercial"],
  [/immeuble|bureau|plateau|parking|clinique|h[ôo]tel|[ée]cole|lyc[ée]e|coll[èe]ge|h[ôo]pital|dispensaire|centre de sant[ée]|d[ée]l[ée]gation|direction/i,"Autre"]];
function agNorm(s){return String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim()}
function agIsCity(s){const n=agNorm(s);if(!n||typeof CITIES==="undefined")return "";const c=CITIES.find(([name])=>agNorm(name)===n);return c?c[0]:""}
function agParse(title,desc,start,end){
  title=String(title||"").replace(/\s+/g," ").trim();const lines=agLines(desc),all=title+"\n"+lines.join("\n");
  const out={title,dossier:"",visite:"",typeTxt:"",typo:"",kind:"bien",lieu:"",client:"",contact:"",tel:"",gps:null,date:"",heure:"",notes:[]};
  const dm=all.match(/\b(\d{3,5})\s*\/\s*(20\d{2})\b/);if(dm)out.dossier=dm[1]+"/"+dm[2];
  const vm=title.match(/(?:visite|vis\.?)\s*(?:n[°o]\s*|#\s*)?(\d+)/i);if(vm)out.visite=vm[1];
  /* titre : « 1234/2026 /// VISITE 1 // Appartement // Maarif », « 1234/2026 | Visite #1 | Local | AIN SEBAA », « 1234/2026 - CLIENT » */
  const segs=title.split(/\s*(?:\/{2,}|\||\s[-–—]\s)\s*/).map(s=>s.replace(/^[\s.\-–—]+|[\s.\-–—]+$/g,"").trim()).filter(Boolean)
    .filter(s=>!/^\d{3,5}\s*\/\s*20\d{2}$/.test(s)&&!/^(?:visite|vis\.?|[ée]tude)\s*(?:n[°o]\s*|#\s*)?\d*$/i.test(s));
  const rest=[];segs.forEach(s=>{const t=AG_TYPES.find(([re])=>re.test(s));if(t&&!out.typeTxt){out.typeTxt=s;if(t[2])out.kind=t[2];if(t[1])out.typo=t[1]}else rest.push(s)});
  if(/terrain/i.test(out.typeTxt))out.kind="terrain";
  if(out.typeTxt&&!out.typo){const t=AG_TYPES.slice(2).find(([re])=>re.test(out.typeTxt));if(t)out.typo=t[1]}
  rest.forEach(s=>{if(/^\d+\s*\.\s*[A-Z]{2,}\b/.test(s))out.notes.push("Réf. agenda : "+s);else if(!out.client&&AG_CLIENT.test(s))out.client=s;else if(!out.lieu)out.lieu=s;else out.notes.push(s)});
  out.gps=agGps(all);
  /* description ligne par ligne */
  lines.forEach(l=>{const ph=l.match(AG_PH);
    if(ph){if(!out.tel)out.tel=agTel(ph[0]);
      if(!out.contact){const civ=l.match(/\b(?:M\.|Mr\.?|Mme|Mlle|Monsieur|Madame)\s+[A-ZÀ-Ý][A-Za-zÀ-ÿ'’\-]+(?:\s+[A-ZÀ-Ý][A-Za-zÀ-ÿ'’\-]+)?/);
        let nm=civ?civ[0]:l.replace(AG_PH,"").replace(/\b(contact|t[ée]l(?:[ée]phone)?|gsm|mobile|portable|num[ée]ro)\b\.?\s*:?/gi,"").replace(/[():,;–—\-]+/g," ").replace(/\s+/g," ").trim();
        if(!civ&&(nm.split(" ").length>3||/visite|merci|contacter|confirm|client|lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche/i.test(nm)))nm="";if(nm)out.contact=nm}
      const left=l.replace(AG_PH,"").replace(/\b(contact|t[ée]l(?:[ée]phone)?|gsm|mobile)\b\.?\s*:?/gi,"").replace(/[():\s.]+$/,"").trim();
      if(left&&!(out.contact&&left.replace(/[^A-Za-zÀ-ÿ]/g,"")===out.contact.replace(/[^A-Za-zÀ-ÿ]/g,""))&&left.split(" ").length>3)out.notes.push(l.replace(AG_PH,m=>agTel(m)));return}
    if(/-?\d{1,2}[.,]\d{3,}/.test(l)&&!/[a-z]{4,}/i.test(l.replace(/lat|long|g[ée]olocalisation/gi,"")))return;
    if(/^(lat|long)[a-z.]*\s*:/i.test(l)||/^g[ée]olocalisation\s*:?\s*-?\d/i.test(l))return;
    if(!out.client&&!/\d/.test(l)&&!AG_NOTE.test(l)&&l.length<=40&&l.split(" ").length<=5){out.client=l;return}
    if(out.dossier&&l.replace(/\s/g,"").includes(out.dossier.replace(/\s/g,""))&&l.length<30)return;
    out.notes.push(l)});
  const s=start?new Date(start):null,e=end?new Date(end):null;
  if(s&&!isNaN(s)){out.date=agDateISO(s);if(String(start).length>10)out.heure=agHM(s)+(e&&!isNaN(e)&&String(end).length>10?"–"+agHM(e):"")}
  return out}
function agPreset(p){const rem=[];rem.push("Agenda"+(p.heure?" (RDV "+p.heure+")":"")+" : "+p.title);if(p.client)rem.push("Client : "+p.client);if(p.visite)rem.push("Visite n° "+p.visite);
  p.notes.forEach(n=>{if(!rem.includes(n))rem.push(n)});
  const o={kind:p.kind,remarques:rem.join("\n")};if(p.dossier)o.dossier=p.dossier;if(p.date)o.date=p.date;if(p.contact)o.contact=p.contact;if(p.tel)o.contactTel=p.tel;
  if(p.gps)o.gps=gpsStr(p.gps);
  if(p.kind==="bien"&&p.typo)o.typo=p.typo;if(p.kind==="avancement"&&p.typeTxt)o.typeBien=p.typeTxt;
  if(p.lieu){const c=agIsCity(p.lieu);if(c)o.ville=c;else if(!p.gps)o.quartier=p.lieu.replace(/\b\w/g,m=>m.toUpperCase()).replace(/\B\w+/g,m=>m.toLowerCase())}
  return o}
function agExisting(p){if(!p.dossier||typeof visites==="undefined")return null;return visites.find(v=>(v.dossier||"").replace(/\s/g,"")===p.dossier&&(!p.date||!v.date||v.date===p.date))||visites.find(v=>(v.dossier||"").replace(/\s/g,"")===p.dossier)||null}
function agCreate(p,kind){const o=agPreset({...p,kind:kind||p.kind});$("#agDlg").close();openVisite(null,o);
  setTimeout(()=>{if(o.gps)try{autoPlace()}catch(e){}const n=$("#visNote");if(n)n.textContent="Remplie depuis l’agenda : vérifie et complète la fiche, puis enregistre."},60)}
/* ---------- Google : jeton, agendas, rendez-vous ---------- */
function agApp(){let a=(firebase.apps||[]).find(x=>x.name==="vtcal");if(!a){a=firebase.initializeApp(VT_CONFIG.firebase,"vtcal");try{a.auth().setPersistence(firebase.auth.Auth.Persistence.NONE)}catch(e){}}return a}
async function agConnect(){const st=$("#agSt");const app=agApp(),p=new firebase.auth.GoogleAuthProvider();p.addScope(AG_SCOPE);
  const prm={prompt:"select_account"};if(AG.email)prm.login_hint=AG.email;p.setCustomParameters(prm);
  st.textContent="Connexion à Google…";
  try{const r=await app.auth().signInWithPopup(p);const tok=r.credential&&r.credential.accessToken;if(!tok)throw {code:"no-token"};
    AG.tok=tok;AG.exp=Date.now()+55*60000;AG.email=(r.user&&r.user.email)||"";agSaveTok();try{LS.set("vt_ag_hint",AG.email)}catch(e){}
    const same=r.user&&auth.currentUser&&r.user.uid===auth.currentUser.uid;try{if(!same&&r.user)await r.user.delete();else await app.auth().signOut()}catch(e){try{await app.auth().signOut()}catch(_){}}
    await agLoadCals();await agFetch()}
  catch(e){const c=e&&e.code||"";st.textContent=c==="auth/popup-closed-by-user"||c==="auth/cancelled-popup-request"?"Connexion annulée.":c==="auth/popup-blocked"?"Le navigateur a bloqué la fenêtre Google : autorise les fenêtres pop-up pour Valtera, puis réessaie.":
    "Google n’a pas donné l’accès à l’agenda"+(c?" ("+c.replace("auth/","")+")":"")+". Si c’est le compte Tinsa, l’administrateur Google de Tinsa bloque peut-être les applications externes : utilise alors « Coller un rendez-vous » plus bas.";agRender()}}
async function agApi(path){if(!AG.tok||AG.exp<Date.now())throw {code:"expired"};
  const r=await fetch(AG_API+path,{headers:{Authorization:"Bearer "+AG.tok}});if(r.ok)return r.json();
  let j=null;try{j=await r.json()}catch(e){}const msg=JSON.stringify(j||{});
  if(r.status===401){AG.tok=null;agSaveTok();throw {code:"expired"}}
  if(r.status===403&&/accessNotConfigured|SERVICE_DISABLED|has not been used|is disabled/i.test(msg))throw {code:"api-off"};
  throw {code:"http-"+r.status,msg:(j&&j.error&&j.error.message)||""}}
async function agLoadCals(){const j=await agApi("/users/me/calendarList?minAccessRole=reader&maxResults=250");
  AG.cals=(j.items||[]).filter(c=>!/#holiday@|#contacts@|#weeknum@/.test(c.id)).map(c=>({id:c.id,name:c.summaryOverride||c.summary||c.id,primary:!!c.primary}));
  if(!AG.cals.some(c=>c.id===AG.cal)){const pick=AG.cals.find(c=>/visiteur/i.test(c.name)&&/anass|nessah/i.test(c.name))||AG.cals.find(c=>/visiteur/i.test(c.name))||AG.cals.find(c=>c.primary)||AG.cals[0];AG.cal=pick?pick.id:"";try{LS.set("vt_ag_cal",AG.cal)}catch(e){}}}
async function agFetch(){const st=$("#agSt");if(!AG.tok||AG.exp<Date.now()){AG.tok=null;agRender();return}
  if(!AG.cals.length){try{await agLoadCals()}catch(e){return agErr(e)}}
  const d0=new Date(AG.date+"T00:00:00"),d1=new Date(d0.getTime()+86400000);AG.busy=true;st.textContent="Lecture de l’agenda…";agRender();
  try{const j=await agApi("/calendars/"+encodeURIComponent(AG.cal)+"/events?singleEvents=true&orderBy=startTime&maxResults=50&timeMin="+encodeURIComponent(d0.toISOString())+"&timeMax="+encodeURIComponent(d1.toISOString()));
    AG.events=(j.items||[]).filter(e=>e.status!=="cancelled").map(e=>({id:e.id,p:agParse(e.summary,e.description,(e.start||{}).dateTime||(e.start||{}).date,(e.end||{}).dateTime||(e.end||{}).date),loc:e.location||""}));
    AG.events.forEach(e=>{if(!e.p.gps&&e.loc){const g=agGps(e.loc);if(g)e.p.gps=g}});
    st.textContent=AG.events.length?AG.events.length+" rendez-vous ce jour-là.":"Aucun rendez-vous ce jour-là dans cet agenda."}
  catch(e){agErr(e)}AG.busy=false;agRender()}
function agErr(e){const st=$("#agSt"),c=e&&e.code||"";if(c==="expired"){AG.tok=null;st.textContent="La connexion à l’agenda a expiré : reconnecte-toi."}
  else if(c==="api-off")st.innerHTML='L’API Google Agenda n’est pas encore activée pour Valtera. Ouvre <a href="'+AG_ENABLE+'" target="_blank" rel="noopener">ce lien</a>, clique sur « Activer », puis réessaie (une seule fois).';
  else if(!navigator.onLine)st.textContent="Pas de réseau : l’agenda sera lisible au retour de la connexion.";
  else st.textContent="Lecture de l’agenda impossible"+(e&&e.msg?" : "+e.msg:"")+".";AG.busy=false;agRender()}
/* ---------- dialogue ---------- */
function agRender(){const on=!!(AG.tok&&AG.exp>Date.now());$("#agConn").hidden=on;$("#agAcc").hidden=!on;$("#agWho").textContent=on&&AG.email?AG.email:"";
  const sel=$("#agCal");sel.hidden=!on||!AG.cals.length;sel.innerHTML=AG.cals.map(c=>'<option value="'+esc(c.id)+'"'+(c.id===AG.cal?" selected":"")+">"+esc(c.name)+"</option>").join("");
  $("#agDate").value=AG.date;const L=$("#agList");L.innerHTML="";if(!on){L.append(h("div",{class:"agempty"},h("b",{text:"Connecte ton agenda Google"}),h("p",{class:"meta",text:"Valtera lit seulement tes rendez-vous (lecture seule) pour remplir la fiche : numéro du dossier, date, client, coordonnées GPS, contact et téléphone. Tu peux choisir le compte Tinsa : ta connexion Valtera ne change pas."})));return}
  AG.events.forEach(ev=>{const p=ev.p,ex=agExisting(p),k=h("select",{class:"agkind","aria-label":"Type de fiche"});[["bien","Fiche de visite"],["terrain","Fiche terrain"],["avancement","État d’avancement"]].forEach(([v,t])=>{const o=h("option",{value:v,text:t});if(v===p.kind)o.selected=true;k.append(o)});
    const chips=h("div",{class:"agchips"});[p.dossier&&["Dossier "+p.dossier,"num"],p.typeTxt&&[p.typeTxt],p.lieu&&[p.lieu],p.client&&[p.client],p.gps&&["GPS","ok"],(p.contact||p.tel)&&[[p.contact,p.tel].filter(Boolean).join(" · ")]].filter(Boolean).forEach(([t,c])=>chips.append(h("span",{class:"chip"+(c?" "+c:""),text:t})));
    const acts=h("div",{class:"agacts"});if(ex)acts.append(h("button",{type:"button",class:"btn sm",text:"Ouvrir "+(ex.ref||"la fiche"),onclick:()=>{$("#agDlg").close();openVisite(ex)}}));
    acts.append(k,h("button",{type:"button",class:"btn sm pri",text:ex?"Nouvelle fiche":"Créer la fiche",onclick:()=>agCreate(p,k.value)}));
    L.append(h("div",{class:"agcard"+(ex?" done":"")},h("div",{class:"agtime",text:p.heure||"Journée"}),h("div",{class:"agbody"},h("b",{text:p.title||"(sans titre)"}),chips,
      p.notes.length?h("div",{class:"meta agnotes",text:p.notes.slice(0,3).join(" · ")}):null,ex?h("div",{class:"agdone",text:"Fiche déjà créée : "+(ex.ref||"")+(ex.date?" · "+ex.date.split("-").reverse().join("/"):"")}):null,acts)))})}
function agShift(n){const d=new Date(AG.date+"T12:00:00");d.setDate(d.getDate()+n);AG.date=agDateISO(d);agFetch()}
function agOpen(){if(!isOwner())return;agLoad();if(!AG.date)AG.date=agDateISO(new Date());AG.events=[];$("#agSt").textContent="";$("#agPaste").value="";$("#agDlg").showModal();agRender();
  if(AG.tok&&AG.exp>Date.now())agFetch()}
(function(){if(!$("#agDlg"))return;
  $("#agConn").onclick=agConnect;$("#agSwitch").onclick=()=>{AG.tok=null;AG.cals=[];agSaveTok();agConnect()};
  $("#agPrev").onclick=()=>agShift(-1);$("#agNext").onclick=()=>agShift(1);$("#agToday").onclick=()=>{AG.date=agDateISO(new Date());agFetch()};
  $("#agTomorrow").onclick=()=>{const d=new Date();d.setDate(d.getDate()+1);AG.date=agDateISO(d);agFetch()};
  $("#agDate").onchange=e=>{if(e.target.value){AG.date=e.target.value;agFetch()}};
  $("#agCal").onchange=e=>{AG.cal=e.target.value;try{LS.set("vt_ag_cal",AG.cal)}catch(_){}agFetch()};
  $("#agPasteGo").onclick=()=>{const t=$("#agPaste").value.trim();if(!t){toast("Colle d’abord le texte du rendez-vous.");return}
    const ls=t.split(/\n/).map(s=>s.trim()).filter(Boolean),title=ls.find(l=>/\d{3,5}\s*\/\s*20\d{2}/.test(l))||ls[0];
    const p=agParse(title,ls.filter(l=>l!==title).join("\n"),null,null);if(!p.date)p.date=AG.date||agDateISO(new Date());agCreate(p)};
  $("#agBtn").onclick=agOpen;$("#agFromKind").onclick=()=>{$("#kindDlg").close();agOpen()};
})();
function agRole(){const own=typeof isOwner==="function"&&isOwner();const b=$("#agBtn"),k=$("#agFromKind");if(b)b.hidden=!own;if(k)k.hidden=!own}

/* prix tapé librement : « 8 000 DH/mois » → location ; « 8 000 DH le m² » → prix au m² (vente) ; « 2 millions » → prix total (vente) */
const PRICE_KEYS=new Set(["price","ppm","loyer","avance"]);
const MILL_U=/^(?:m[ei]l+[iy]?ons?|mlyon|mlion|millions?|مليون)$/;
function priceIn(raw){const s=" "+String(raw??"").toLowerCase().replace(/[’`]/g,"'").replace(/\s+/g," ").trim()+" ";if(!s.trim())return null;
  const mois=/mois|mensuel|chh?ar\b|شهر|شهريا|\bpar\s*moi\b/.test(s);
  const m2=/(?:\/|\bpar|\ble|\bau|\bdu|\bl'|\bdh)\s*m(?:[èe]tre)?s?\s*(?:²|2|carr[ée]s?)?(?![a-zà-ÿ0-9])|m²\s*\/|\bm2\b(?!\s*\d)|للمتر|فالمتر|المتر|ل?ل?متر\s*مربع/.test(s)&&!/^\s*[\d\s.,]+\s*m²?\s*$/.test(s);
  const m=s.match(new RegExp(NUMRE+"\\s*"+UNITRE));if(!m)return null;const n=toNum(m[1]);if(!isFinite(n))return null;const u=(m[2]||"").trim();
  let v=n,note="",big=false;
  if(u){const a=amt(m[1],u);if(a&&isFinite(a.v)){v=a.v;note=a.note||"";big=/^m|مليون/.test(u)}}
  if(!mois&&MILL_U.test(u)&&n<10){v=n*1e6;note="« "+m[1]+" "+u+" » lu comme "+fmt(v)+" DH (à vérifier)."}
  return {v:Math.round(v*100)/100,per:m2?"m2":"tot",mois,big,note,explicit:/[a-zà-ÿء-ي\/]/i.test(s)}}
function priceSmart(k,raw){const r=priceIn(raw);if(!r)return false;const ret=retained();
  if(r.mois&&tx==="Pas-de-porte"&&k==="price"){$("#f_loyer").value=plain(r.v);$("#f_price").value="";toast("« "+raw.trim()+" » : loyer mensuel du pas-de-porte.");updCalc();return true}
  let newTx=null;if(r.mois)newTx="Location";else if(r.per==="m2"||r.big||/dh|درهم|mad/.test(raw.toLowerCase()))newTx=tx==="Pas-de-porte"?null:"Vente";
  const to=r.per==="m2"?"ppm":(k==="ppm"&&r.big?"price":(k==="ppm"?"ppm":"price")),other=to==="price"?"ppm":"price";
  if(newTx&&newTx!==tx)setTx(newTx);
  $("#f_"+to).value=plain(r.v);lastEdited=to;
  if(ret)$("#f_"+other).value=plain(Math.round(to==="price"?r.v/ret:r.v*ret));else if(to!==k)$("#f_"+k).value="";
  const what=r.mois?(to==="ppm"?"loyer au m² par mois":"loyer mensuel")+" → Location":(to==="ppm"?"prix au m²":"prix total")+(newTx==="Vente"?" → Vente":"");
  toast("« "+raw.trim()+" » : "+what+(r.note?" · "+r.note:""));updCalc();return true}
