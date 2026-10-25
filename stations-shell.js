window.sunuCarbuShellStations = (function(){
  var S = [["10125489","KOUMPENTOUM","",13.981342,-14.568527],["10125488","DIAROUME","",13.981356,-14.802292],["10125487","KOUNGHEUL","",13.981356,-14.802292],["10125475","VDN","Dakar",14.72,-17.46],["10125470","ALMADIES","Rond Point de Ngor - Almadies, Dakar",14.7455,-17.5102],["10125471","NGOR","Route Des Almadies - Ngor, Dakar",14.7472,-17.5165],["10125472","OUAKAM","Ouakam, Dakar",14.72,-17.48],["10125473","TOUBA PREFECTURE","Touba",14.834383,-15.890022],["10125474","TOUBA 2","Touba",14.822992,-15.896375],["10125476","MBACKE","Mbacke",14.802233,-15.906719],["10125477","TAMBACOUNDA","Tambacounda",13.774164,-13.677083],["10125478","KAOLACK","Kaolack",14.15,-16.07],["10125479","THIES","Thies",14.79,-16.93],["10125480","ST LOUIS CENTRE","Saint-Louis",16.018536,-16.490506],["10125481","ZIGUINCHOR","Ziguinchor",12.583881,-16.262658],["10125482","KOLDA","Kolda",12.868817,-14.899133],["10125483","KEDOUGOU","Kedougou",12.573556,-12.208858],["10125484","DIAMNIADIO","Diamniadio",14.72,-17.19],["10125485","RUFISQUE","Rufisque",14.71,-17.27],["10125486","MBOUR","Mbour",14.42,-16.96]];
  return S.map(function(r){
    return {
      id: "shell-" + r[0],
      brand: "Shell",
      name: (String(r[1]).toUpperCase().indexOf("SHELL")===0) ? r[1] : ("SHELL " + r[1]),
      address: r[2],
      lat: r[3],
      lon: r[4],
      source: "Shell Station Locator",
      sourceUrl: "https://find.shell.com/sn/fuel/locations/en_US"
    };
  });
})();
