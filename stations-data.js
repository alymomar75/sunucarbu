window.sunuCarbuSeedStations = (function(){
  var S = [].concat(
    window.sunuCarbuTotalPart1 || [],
    window.sunuCarbuTotalPart2 || [],
    window.sunuCarbuTotalPart3 || []
  );
  return S.map(function(r){
    return {
      id: "total-woos-" + r[0],
      brand: "TotalEnergies",
      name: (String(r[1]).indexOf("TOTAL")===0||String(r[1]).indexOf("Total")===0) ? r[1] : ("TotalEnergies " + r[1]),
      address: r[2],
      lat: r[3],
      lon: r[4],
      source: "Locator officiel TotalEnergies",
      sourceUrl: "https://totalenergies.sn/stations-service/trouver-une-station"
    };
  });
})();
