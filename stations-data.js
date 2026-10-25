window.sunuCarbuSeedStations = window.sunuCarbuSeedStations || [];
window.sunuCarbuTotalReady = Promise.all([
  fetch("stations-total-a.json").then(function(r){return r.json()}),
  fetch("stations-total-b.json").then(function(r){return r.json()})
]).then(function(parts){
  var list = [].concat(parts[0]||[], parts[1]||[]);
  if (list.length) {
    window.sunuCarbuSeedStations = list;
    if (typeof window.sunuCarbuReloadStations === "function") window.sunuCarbuReloadStations();
  }
}).catch(function(){});
