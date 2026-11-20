/* Valtera : démarrage sûr.
   - ?reset=1 : efface le cache hors ligne de l'application (pas les données du serveur) et recharge.
   - Si l'application ne démarre pas, affiche un message lisible au lieu d'un écran vide. */
(function () {
  var errs = [];
  window.__vtErrors = errs;
  window.addEventListener("error", function (e) { errs.push((e && e.message) || "Erreur inconnue"); });
  window.addEventListener("unhandledrejection", function (e) { var r = e && e.reason; errs.push((r && (r.message || r.code)) || String(r)); });

  function resetApp() {
    var jobs = [];
    try { if (navigator.serviceWorker) jobs.push(navigator.serviceWorker.getRegistrations().then(function (rs) { return Promise.all(rs.map(function (r) { return r.unregister(); })); })); } catch (e) {}
    try { if (window.caches) jobs.push(caches.keys().then(function (ks) { return Promise.all(ks.map(function (k) { return caches.delete(k); })); })); } catch (e) {}
    try { if (window.indexedDB && indexedDB.databases) jobs.push(indexedDB.databases().then(function (dbs) { return Promise.all(dbs.map(function (d) { return new Promise(function (ok) { var q = indexedDB.deleteDatabase(d.name); q.onsuccess = q.onerror = q.onblocked = function () { ok(); }; }); })); })); } catch (e) {}
    return Promise.all(jobs).catch(function () {}).then(function () {
      location.replace(location.pathname + "?t=" + Date.now());
    });
  }
  window.__vtReset = resetApp;

  if (/[?&]reset=1/.test(location.search)) {
    document.addEventListener("DOMContentLoaded", function () {
      document.body.innerHTML = '<p style="font:16px system-ui,sans-serif;padding:32px;color:#13242a;background:#fff">Réparation de Valtera en cours…</p>';
    });
    resetApp();
    return;
  }

  function panel(msg) {
    if (document.getElementById("vtRescue")) return;
    var d = document.createElement("div");
    d.id = "vtRescue";
    d.setAttribute("role", "alert");
    d.style.cssText = "position:fixed;inset:0;z-index:9999;background:#ffffff;color:#13242a;font:15px/1.5 system-ui,sans-serif;display:flex;align-items:center;justify-content:center;padding:24px";
    d.innerHTML = '<div style="max-width:420px;display:flex;flex-direction:column;gap:14px">'
      + '<b style="font-size:20px">Valtera ne s’ouvre pas correctement</b>'
      + '<span>' + msg + '</span>'
      + '<button id="vtReload" style="padding:12px 16px;border-radius:10px;border:1px solid #c9d3d4;background:#fff;font:inherit;color:#13242a">Recharger</button>'
      + '<button id="vtRepair" style="padding:12px 16px;border-radius:10px;border:none;background:#0d5c63;color:#fff;font:inherit;font-weight:600">Réparer l’application</button>'
      + '<small style="color:#5b6b70">« Réparer » efface seulement la copie enregistrée sur ce téléphone : tes témoins et tes fiches restent sur le serveur. Il faudra te reconnecter avec Google.</small>'
      + (errs.length ? '<small style="color:#8a2b2b;word-break:break-word">Détail : ' + String(errs[0]).replace(/[<>&]/g, "") + '</small>' : '')
      + '</div>';
    document.body.appendChild(d);
    document.getElementById("vtReload").onclick = function () { location.reload(); };
    document.getElementById("vtRepair").onclick = function () { this.disabled = true; this.textContent = "Réparation…"; resetApp(); };
  }
  window.__vtRescue = panel;

  /* l'application doit avoir démarré en quelques secondes */
  window.addEventListener("load", function () {
    setTimeout(function () {
      if (!window.__vtBooted) panel("Le démarrage a échoué.");
    }, 6000);
  });
})();
