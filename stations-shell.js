window.sunuCarbuShellStations = [
  { id: "shell-almadies", brand: "Shell", name: "SHELL ALMADIES", address: "Rond Point de Ngor - Almadies, Dakar", phone: "+221 33 849 37 37", lon: -17.5102, lat: 14.7455 },
  { id: "shell-ngor", brand: "Shell", name: "SHELL NGOR", address: "Route Des Almadies - Ngor, Dakar", phone: "+221 33 849 37 37", lon: -17.5165, lat: 14.7472 },
  { id: "shell-ouakam", brand: "Shell", name: "SHELL OUAKAM", address: "Ouakam Tally Diallo, Dakar", phone: "", lon: -17.4875, lat: 14.7248 },
  { id: "shell-cluny", brand: "Shell", name: "SHELL CLUNY", address: "Avenue Cheikh Anta Diop, Dakar", phone: "", lon: -17.4621, lat: 14.6892 },
  { id: "shell-point-e", brand: "Shell", name: "SHELL POINT E", address: "Rue 9 Bis X Rue 11 - Point E, Dakar", phone: "", lon: -17.4582, lat: 14.6935 },
  { id: "shell-malick-sy", brand: "Shell", name: "SHELL MALICK SY", address: "Avenue Malick Sy X Av. Lamine Gueye, Dakar", phone: "", lon: -17.4385, lat: 14.6782 },
  { id: "shell-phenix", brand: "Shell", name: "SHELL PHENIX", address: "Avenue Faidherbe X Lamine Gueye, Dakar", phone: "", lon: -17.436, lat: 14.6751 },
  { id: "shell-pasteur", brand: "Shell", name: "SHELL PASTEUR", address: "Avenue Pasteur, Dakar", phone: "+221 33 823 19 66", lon: -17.432, lat: 14.6625 },
  { id: "shell-bourguiba", brand: "Shell", name: "SHELL BOURGUIBA", address: "Avenue Bourguiba Face Stade Demba Diop, Dakar", phone: "", lon: -17.4518, lat: 14.7075 },
  { id: "shell-liberte-5", brand: "Shell", name: "SHELL LIBERTE 5", address: "Face Terminus Sotrac Liberté 5, Dakar", phone: "", lon: -17.456, lat: 14.7182 },
  { id: "shell-vdn", brand: "Shell", name: "SHELL VDN", address: "Voie de Degagement Nord - Face CICES, Dakar", phone: "", lon: -17.4682, lat: 14.7395 },
  { id: "shell-patte-doie", brand: "Shell", name: "SHELL PATTE D'OIE", address: "Patte D'oie - Grand Yoff, Dakar", phone: "", lon: -17.441, lat: 14.7312 },
  { id: "shell-golf", brand: "Shell", name: "SHELL GOLF", address: "Quartier Notaire / Croisement Dial Mbaye, Guédiawaye", phone: "+221 77 636 60 34", lon: -17.4085, lat: 14.7682 },
  { id: "shell-pikine-1", brand: "Shell", name: "SHELL PIKINE 1", address: "Entrée Pikine (Bountou Pikine), Dakar", phone: "", lon: -17.3825, lat: 14.7502 },
  { id: "shell-pikine-2", brand: "Shell", name: "SHELL PIKINE 2", address: "Route Des Niayes X Tally Bou Mack, Pikine", phone: "", lon: -17.3619, lat: 14.7463 },
  { id: "shell-keur-massar", brand: "Shell", name: "SHELL KEUR MASSAR", address: "Entrée Keur Massar, Dakar", phone: "", lon: -17.311, lat: 14.778 },
  { id: "shell-rufisque-1", brand: "Shell", name: "SHELL RUFISQUE 1", address: "Route Nationale N1 - Entrée Rufisque, Rufisque", phone: "", lon: -17.2802, lat: 14.7215 },
  { id: "shell-diamniadio", brand: "Shell", name: "SHELL DIAMNIADIO", address: "Diamniadio Sortie Péage, Diamniadio", phone: "", lon: -17.1985, lat: 14.7185 }
].map((station) => ({
  ...station,
  source: "Localisateur officiel Shell Sénégal (données fournies)",
  sourceUrl: "https://www.shell.sn/automobilistes/localisateur-de-station-shell.html"
}));
