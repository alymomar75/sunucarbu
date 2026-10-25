window.sunuCarbuShellStations = window.sunuCarbuShellStations || [];
(function(){
  var FALLBACK = [
    {id:"shell-almadies",brand:"Shell",name:"SHELL ALMADIES",address:"Rond Point de Ngor - Almadies, Dakar",lat:14.743342,lon:-17.511444},
    {id:"shell-vdn",brand:"Shell",name:"SHELL VDN",address:"VDN Face Cices, Dakar",lat:14.746546,lon:-17.46716},
    {id:"shell-touba",brand:"Shell",name:"SHELL TOUBA PREFECTURE",address:"Touba",lat:14.834383,lon:-15.890022},
    {id:"shell-thies",brand:"Shell",name:"SHELL THIES",address:"Thiès",lat:14.782011,lon:-16.952711},
    {id:"shell-stlouis",brand:"Shell",name:"SHELL ST LOUIS CENTRE",address:"Saint-Louis",lat:16.018536,lon:-16.490506},
    {id:"shell-ziguinchor",brand:"Shell",name:"SHELL ZIGUINCHOR",address:"Ziguinchor",lat:12.583881,lon:-16.262658},
    {id:"shell-tambacounda",brand:"Shell",name:"SHELL TAMBACOUNDA",address:"Tambacounda",lat:13.774164,lon:-13.677083},
    {id:"shell-kolda",brand:"Shell",name:"SHELL KOLDA",address:"Kolda",lat:12.868817,lon:-14.899133},
    {id:"shell-kaolack",brand:"Shell",name:"SHELL KAOLACK",address:"Kaolack",lat:14.147442,lon:-16.091639},
    {id:"shell-mbour",brand:"Shell",name:"SHELL MBOUR",address:"Mbour",lat:14.42232,lon:-16.95008}
  ];
  window.sunuCarbuShellStations = FALLBACK;
  window.sunuCarbuShellReady = fetch(
    "https://shellgsllocator.geoapp.me/api/v2/locations/within_bounds?sw[]=12&sw[]=-18&ne[]=17&ne[]=-11&autoload=true&travelmode=driving&format=json"
  ).then(function(r){ return r.json(); }).then(function(d){
    var locs = (d.locations || []).filter(function(x){ return (x.country_code||"").toUpperCase()==="SN"; });
    if (!locs.length) return;
    window.sunuCarbuShellStations = locs.map(function(x){
      return {
        id: "shell-" + x.id,
        brand: "Shell",
        name: x.name || "Shell",
        address: x.address || x.city || "",
        lat: +x.lat,
        lon: +(x.lng || x.lon),
        source: "Shell Station Locator",
        sourceUrl: "https://find.shell.com/sn/fuel/locations/en_US"
      };
    }).filter(function(s){ return s.lat && s.lon; });
    if (typeof window.sunuCarbuReloadStations === "function") window.sunuCarbuReloadStations();
  }).catch(function(){});
})();
