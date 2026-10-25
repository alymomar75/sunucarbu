window.sunuCarbuShellStations = (function(){
  var S = [].concat(
    window.sunuCarbuShellPart1 || [],
    window.sunuCarbuShellPart2 || [],
    window.sunuCarbuShellPart3 || []
  );
  return S.map(function(r){
    return {
      id: "shell-" + r[0],
      brand: "Shell",
      name: (String(r[1]).toUpperCase().indexOf("SHELL")===0) ? r[1] : ("SHELL " + r[1]),
      address: r[2],
      lat: r[3],
      lon: r[4],
      source: "Shell Station Locator (officiel)",
      sourceUrl: "https://find.shell.com/sn/fuel/locations/en_US"
    };
  });
})();
