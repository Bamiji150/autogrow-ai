(() => {
  "use strict";
  const KEY = "autogrow_mvp_v1";
  const defaults = {
    active: false, killed: true,
    settings: { dailyCap: 0, reinvestPct: 20, lossLimit: 0, minProfit: 1000 },
    offers: [], entries: []
  };
  let state = load();
  function load() {
    try { return {...structuredClone(defaults), ...JSON.parse(localStorage.getItem(KEY) || "{}")}; }
    catch { return structuredClone(defaults); }
  }
  function save() { localStorage.setItem(KEY, JSON.stringify(state)); render(); }
  const $ = id => document.getElementById(id);
  const money = n => new Intl.NumberFormat("en-NG", {style:"currency",currency:"NGN",maximumFractionDigits:2}).format(Number(n)||0);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const totals = () => {
    const revenue = state.entries.filter(e=>e.type==="revenue").reduce((s,e)=>s+e.amount,0);
    const costs = state.entries.filter(e=>e.type==="cost").reduce((s,e)=>s+e.amount,0);
    return {revenue,costs,profit:revenue-costs};
  };
  function decision() {
    const t=totals(), s=state.settings;
    if (state.killed || !state.active) return {ok:false,title:"Not scaling",msg:"Tracking is paused or the kill switch is active."};
    if (t.profit < 0 && Math.abs(t.profit) >= Number(s.lossLimit)) return {ok:false,title:"Loss limit reached",msg:"Pause activity and review costs before continuing."};
    if (t.profit < Number(s.minProfit)) return {ok:false,title:"Not enough profit yet",msg:"Keep testing organically. Do not increase spending."};
    return {ok:true,title:"Eligible for controlled scaling",msg:"Positive profit meets your threshold. Review performance before scaling; no money is spent automatically."};
  }
  function render() {
    const t=totals(), s=state.settings, d=decision();
    $("revenue").textContent=money(t.revenue); $("costs").textContent=money(t.costs);
    $("profit").textContent=money(t.profit); $("profit").className="num "+(t.profit>=0?"green":"red");
    const allowance = Math.max(0, t.profit) * Math.min(50,Math.max(0,Number(s.reinvestPct)||0))/100;
    $("allowance").textContent=money(Math.min(allowance,Math.max(0,Number(s.dailyCap)||0)));
    $("dailyCap").value=s.dailyCap; $("reinvestPct").value=s.reinvestPct; $("lossLimit").value=s.lossLimit; $("minProfit").value=s.minProfit;
    $("statusDot").className="dot"+((state.killed||!state.active)?" off":"");
    $("statusTitle").textContent=state.killed?"KILL SWITCH ACTIVE":state.active?"Tracking enabled":"Safe mode — paused";
    $("statusText").textContent=state.killed?"All scaling decisions are disabled. You can still review or export records.":state.active?"Rules are evaluating the ledger. No automatic purchases or advertising occur.":"Enable tracking to evaluate the saved limits; no background activity occurs.";
    $("enableBtn").textContent=state.active&&!state.killed?"Pause tracking":"Enable tracking";
    $("scaleDecision").innerHTML=`<span class="dot ${d.ok?"":"off"}"></span><div><strong>${esc(d.title)}</strong><p>${esc(d.msg)}</p></div>`;
    $("offerCount").textContent=`${state.offers.length} offer${state.offers.length===1?"":"s"}`;
    $("offers").innerHTML=state.offers.length?state.offers.map(o=>`<div class="item"><div><strong>${esc(o.name)}</strong><div class="small">${esc(o.category||"Uncategorised")} ${o.network?"· "+esc(o.network):""}</div><a href="${esc(o.url)}" target="_blank" rel="noopener noreferrer nofollow">${esc(o.url)}</a></div><button class="danger" data-remove-offer="${esc(o.id)}">Remove</button></div>`).join(""):`<div class="empty">No offers yet. Add your first approved affiliate link above.</div>`;
    $("ledgerWrap").innerHTML=state.entries.length?`<div style="overflow-x:auto"><table><thead><tr><th>Date</th><th>Type</th><th>Note</th><th>Amount</th><th></th></tr></thead><tbody>${[...state.entries].reverse().map(e=>`<tr><td>${new Date(e.date).toLocaleDateString()}</td><td>${e.type==="revenue"?"Revenue":"Cost"}</td><td>${esc(e.note||"—")}</td><td class="${e.type==="revenue"?"green":"red"}">${e.type==="revenue"?"+":"−"}${money(e.amount)}</td><td><button class="danger" data-remove-entry="${esc(e.id)}">×</button></td></tr>`).join("")}</tbody></table></div>`:`<div class="empty">No ledger entries yet.</div>`;
    $("killBtn").textContent=state.killed?"⏻ Kill switch is ON":"⏻ Activate kill switch";
  }
  $("saveSettings").addEventListener("click",()=>{
    const vals={dailyCap:Number($("dailyCap").value),reinvestPct:Number($("reinvestPct").value),lossLimit:Number($("lossLimit").value),minProfit:Number($("minProfit").value)};
    if(Object.values(vals).some(v=>!Number.isFinite(v)||v<0)||vals.reinvestPct>50){alert("Use non-negative limits and reinvestment between 0 and 50%.");return;}
    state.settings=vals;save();
  });
  $("enableBtn").addEventListener("click",()=>{
    if(state.active&&!state.killed){state.active=false;} else {state.killed=false;state.active=true;}
    save();
  });
  $("killBtn").addEventListener("click",()=>{
    state.killed=!state.killed;
    if(state.killed) state.active=false;
    save();
  });
  $("offerForm").addEventListener("submit",e=>{
    e.preventDefault();const url=$("offerUrl").value.trim();
    try{const u=new URL(url);if(!["https:","http:"].includes(u.protocol))throw Error();}catch{alert("Enter a valid http:// or https:// affiliate URL.");return;}
    state.offers.push({id:crypto.randomUUID(),name:$("offerName").value.trim(),category:$("offerCategory").value.trim(),url,network:$("offerNetwork").value.trim(),created:new Date().toISOString()});
    e.target.reset();save();
  });
  $("entryForm").addEventListener("submit",e=>{
    e.preventDefault();const amount=Number($("entryAmount").value);
    if(!Number.isFinite(amount)||amount<=0){alert("Enter an amount greater than zero.");return;}
    state.entries.push({id:crypto.randomUUID(),type:$("entryType").value,amount,note:$("entryNote").value.trim(),date:new Date().toISOString()});
    e.target.reset();save();
  });
  document.addEventListener("click",e=>{
    const offer=e.target.closest("[data-remove-offer]"), entry=e.target.closest("[data-remove-entry]");
    if(offer){state.offers=state.offers.filter(o=>o.id!==offer.dataset.removeOffer);save();}
    if(entry){state.entries=state.entries.filter(x=>x.id!==entry.dataset.removeEntry);save();}
  });
  $("clearLedger").addEventListener("click",()=>{if(confirm("Delete every ledger entry? Export a backup first if needed.")){state.entries=[];save();}});
  $("exportBtn").addEventListener("click",()=>{
    const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),a=document.createElement("a");
    a.href=URL.createObjectURL(blob);a.download="autogrow-backup.json";a.click();URL.revokeObjectURL(a.href);
  });
  $("importBtn").addEventListener("click",()=>$("importFile").click());
  $("importFile").addEventListener("change",async e=>{
    const file=e.target.files[0];if(!file)return;
    try{const data=JSON.parse(await file.text());if(!Array.isArray(data.offers)||!Array.isArray(data.entries)||!data.settings)throw Error("Invalid backup format");
      if(confirm("Replace current offers, ledger and settings with this backup?")){state={...structuredClone(defaults),...data,killed:true,active:false};save();}
    }catch(err){alert("Could not import this backup: "+err.message);}e.target.value="";
  });
  if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
  render();
})();