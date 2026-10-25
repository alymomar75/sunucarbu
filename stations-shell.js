window.sunuCarbuShellStations = window.sunuCarbuShellStations || [];
window.sunuCarbuShellReady = Promise.all([
  fetch("stations-shell-a.json").then(function(r){return r.json()}),
  fetch("stations-shell-b.json").then(function(r){return r.json()})
]).then(function(parts){
  var list = [].concat(parts[0]||[], parts[1]||[]);
  if (list.length) {
    window.sunuCarbuShellStations = list;
    if (typeof window.sunuCarbuReloadStations === "function") window.sunuCarbuReloadStations();
  }
}).catch(function(){});
