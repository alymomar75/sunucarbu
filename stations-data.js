window.sunuCarbuSeedStations = window.sunuCarbuSeedStations || [];
(function(){
  var FALLBACK = [
    {id:"total-km10",brand:"TotalEnergies",name:"TOTAL KM10",address:"Route de Rufisque, Dakar",lat:14.740001,lon:-17.39966,source:"Locator officiel TotalEnergies",sourceUrl:"https://totalenergies.sn/stations-service/trouver-une-station"},
    {id:"total-point-e",brand:"TotalEnergies",name:"TOTAL POINT E",address:"Point E, Dakar",lat:14.697304,lon:-17.457245,source:"Locator officiel TotalEnergies",sourceUrl:"https://totalenergies.sn/stations-service/trouver-une-station"},
    {id:"total-touba",brand:"TotalEnergies",name:"TOTAL TOUBA",address:"Touba",lat:14.817553,lon:-15.899161,source:"Locator officiel TotalEnergies",sourceUrl:"https://totalenergies.sn/stations-service/trouver-une-station"},
    {id:"total-stlouis",brand:"TotalEnergies",name:"TOTAL FLEUVE",address:"Saint-Louis",lat:16.023218,lon:-16.507447,source:"Locator officiel TotalEnergies",sourceUrl:"https://totalenergies.sn/stations-service/trouver-une-station"}
  ];
  window.sunuCarbuSeedStations = FALLBACK;
  var url = "https://api.woosmap.com/stores/search?key=woos-c236c6f3-31fe-3118-82e7-a19ca42466f7&lat=14.5&lng=-14.5&radius=500000&stores_by_page=300";
  window.sunuCarbuTotalReady = fetch(url, {
    headers: { "Referer": "https://totalenergies.sn/" }
  }).then(function(r){ return r.json(); }).then(function(d){
    var feats = d.features || [];
    var stations = feats.map(function(f){
      var p = f.properties || {};
      var up = p.user_properties || {};
      if (up.poiType && up.poiType !== "FUELING") return null;
      var c = (f.geometry || {}).coordinates || [];
      var name = p.name || "TotalEnergies";
      var addr = ((p.address||{}).lines||[]).join(", ");
      var city = (p.address||{}).city || "";
      return {
        id: "total-woos-" + (p.store_id || "").slice(0,12),
        brand: "TotalEnergies",
        name: /^total/i.test(name) ? name : ("TotalEnergies " + name),
        address: [addr, city].filter(Boolean).join(", "),
        lat: +c[1],
        lon: +c[0],
        source: "Locator officiel TotalEnergies (Woosmap)",
        sourceUrl: "https://totalenergies.sn/stations-service/trouver-une-station"
      };
    }).filter(function(s){ return s && s.lat && s.lon; });
    if (stations.length) {
      window.sunuCarbuSeedStations = stations;
      if (typeof window.sunuCarbuReloadStations === "function") window.sunuCarbuReloadStations();
    }
  }).catch(function(){});
})();
