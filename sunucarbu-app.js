(() => {
  const BRANDS = {
    "Shell": { color: "#c82b24", logo: "assets/brands/Shell.png", initials: "S" },
    "TotalEnergies": { color: "#0873b9", logo: "assets/brands/totalenergies.png", initials: "T" },
    "OLA Energy": { color: "#70449b", logo: "assets/brands/ola.png", initials: "OLA" },
    "ELTON": { color: "#c96918", logo: "assets/brands/elton.png", initials: "E" },
    "Eydon": { color: "#2d3585", logo: "assets/brands/eydon.png", initials: "E" },
    "Star Oil": { color: "#147a78", logo: "assets/brands/staroil.png", initials: "STAR" },
    "API": { color: "#26834a", logo: "assets/brands/api.png", initials: "API" },
    "Touba Oil": { color: "#b44722", logo: "assets/brands/toubaoil.png", initials: "TO" },
    "Touba Sandaga Oil": { color: "#9a3b65", initials: "TS" },
    "MKA Excellence": { color: "#8f6500", logo: "assets/brands/mka.png", initials: "MKA" },
    "SGF": { color: "#008252", logo: "assets/brands/sfg.png", initials: "SGF" },
    "EDK Oil": { color: "#c6362d", logo: "assets/brands/edkoil.png", initials: "EDK" },
    "Omega Petroleum": { color: "#51438c", logo: "assets/brands/omegapetroleum.png", initials: "Ω" },
    "Neptune Oil Sénégal": { color: "#16749a", logo: "assets/brands/NeptuneOil.png", initials: "N" },
    "PETROSEN": { color: "#006d8f", logo: "assets/brands/petrosen.png", initials: "PETRO" },
    "Autres (OSM)": { color: "#465a50", initials: "OSM" }
  };

  const SHARED = {
    binId: localStorage.getItem("sunucarbu-jsonbin-id") || "",
    apiKey: localStorage.getItem("sunucarbu-jsonbin-key") || "",
    base: "https://api.jsonbin.io/v3/b"
  };

  let stations = [];
  let selected = null;
  let sharedCache = {};
  const group = L.layerGroup();
  const map = L.map("map", { doubleClickZoom: false, minZoom: 6 }).setView([14.5, -14.5], 7);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);
  group.addTo(map);

  const $ = (id) => document.getElementById(id);
  const notice = $("notice");
  function showNotice(msg) {
    notice.textContent = msg;
    notice.classList.add("on");
    setTimeout(() => notice.classList.remove("on"), 6000);
  }

  function stationBrand(s) {
    const b = s.brand || (s.tags && (s.tags.brand || s.tags.operator)) || "";
    if (/shell/i.test(b)) return "Shell";
    if (/total/i.test(b)) return "TotalEnergies";
    if (/ola/i.test(b)) return "OLA Energy";
    if (/elton/i.test(b)) return "ELTON";
    if (/eydon/i.test(b)) return "Eydon";
    if (/star/i.test(b)) return "Star Oil";
    if (/touba\s*sandaga/i.test(b)) return "Touba Sandaga Oil";
    if (/touba/i.test(b)) return "Touba Oil";
    if (/^api$/i.test(b)) return "API";
    if (/mka/i.test(b)) return "MKA Excellence";
    if (/petrosen/i.test(b)) return "PETROSEN";
    if (/\bsgf\b/i.test(b)) return "SGF";
    if (/\bedk\b/i.test(b)) return "EDK Oil";
    if (/omega/i.test(b)) return "Omega Petroleum";
    if (/neptune/i.test(b)) return "Neptune Oil Sénégal";
    return b || (s.source === "OpenStreetMap" ? "Autres (OSM)" : "Autre");
  }

  function stationLabel(s) {
    return s.name || (s.tags && s.tags.name) || s.brand || "Station";
  }

  function isReportValid(report) {
    if (!report || !report.timestamp) return false;
    if (Date.now() - report.timestamp > 24 * 3600 * 1000) return false;
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Dakar", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", hour12: false
    }).formatToParts(new Date(report.timestamp));
    const get = (t) => +parts.find((p) => p.type === t).value;
    let y = get("year"), m = get("month"), d = get("day");
    const h = get("hour");
    if (h >= 19) {
      const next = new Date(Date.UTC(y, m - 1, d + 1));
      y = next.getUTCFullYear(); m = next.getUTCMonth() + 1; d = next.getUTCDate();
    }
    return Date.now() < Date.UTC(y, m - 1, d, 19, 0, 0);
  }

  function getLocal() {
    try { return JSON.parse(localStorage.getItem("sunucarbu-local-reports-v1") || "{}"); }
    catch { return {}; }
  }

  function getReport(key) {
    const local = getLocal()[key];
    const shared = sharedCache[key];
    let best = null;
    for (const r of [local, shared]) {
      if (r && isReportValid(r) && (!best || r.timestamp > best.timestamp)) best = r;
    }
    return best;
  }

  function getStatus(key) {
    const r = getReport(key);
    return r ? r.availability : null;
  }

  function markHtml(brand, status) {
    const st = BRANDS[brand] || { color: "#16834d", initials: "?" };
    const img = st.logo
      ? `<img src="${st.logo}" alt="" draggable="false">`
      : `<span style="font-size:8px;font-weight:800;color:${st.color}">${st.initials}</span>`;
    const dot = (status === "available" || status === "shortage")
      ? `<span class="sd ${status === "shortage" ? "no" : "ok"}"></span>` : "";
    return `<span class="marker-wrap"><span class="brand" style="--c:${st.color}">${img}</span>${dot}</span>`;
  }

  function addMarker(s) {
    const brand = stationBrand(s);
    const status = getStatus(s.key);
    const m = L.marker([s.lat, s.lon], {
      icon: L.divIcon({
        className: "",
        html: markHtml(brand, status),
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      }),
      title: stationLabel(s) + (status === "shortage" ? " · Rupture" : status === "available" ? " · Disponible" : "")
    });
    m.bindPopup(`<strong>${stationLabel(s)}</strong><br>${brand}<br>${s.address || ""}`);
    m.on("click", () => selectStation(s, false));
    s.marker = m;
    group.addLayer(m);
  }

  function refreshMarkers() {
    stations.forEach((s) => {
      if (!s.marker) return;
      const brand = stationBrand(s);
      const status = getStatus(s.key);
      s.marker.setIcon(L.divIcon({
        className: "",
        html: markHtml(brand, status),
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      }));
    });
  }

  function selectStation(s, pan) {
    selected = s;
    $("btnReport").disabled = false;
    const r = getReport(s.key);
    let info = stationLabel(s) + " · " + stationBrand(s);
    if (r) {
      const t = new Date(r.timestamp).toLocaleString("fr-FR", { timeZone: "Africa/Dakar" });
      info += r.availability === "shortage"
        ? ` · Rupture signalée (${t})`
        : ` · Disponible (${t})`;
    }
    $("selInfo").textContent = info;
    renderList();
    if (pan) {
      map.setView([s.lat, s.lon], Math.max(map.getZoom(), 14));
      if (s.marker) s.marker.openPopup();
    }
  }

  function renderList() {
    const q = ($("q").value || "").toLowerCase().trim();
    const list = $("list");
    list.innerHTML = "";
    const filtered = stations.filter((s) => {
      if (!q) return true;
      const t = (stationLabel(s) + " " + stationBrand(s) + " " + (s.address || "")).toLowerCase();
      return t.includes(q);
    }).slice(0, 80);
    if (!filtered.length) {
      list.innerHTML = '<div class="muted">Aucune station</div>';
      return;
    }
    filtered.forEach((s) => {
      const status = getStatus(s.key);
      const row = document.createElement("button");
      row.type = "button";
      row.className = "row" + (selected && selected.key === s.key ? " on" : "");
      const dot = status === "available" ? '<span class="dot ok"></span>'
        : status === "shortage" ? '<span class="dot no"></span>' : "";
      row.innerHTML = `<strong>${dot}${stationLabel(s)}</strong><span>${stationBrand(s)} · ${s.address || "Sénégal"}</span>`;
      row.onclick = () => selectStation(s, true);
      list.appendChild(row);
    });
  }

  function normalize(arr, source) {
    return (arr || []).map((r, i) => ({
      key: r.id || r.key || (source + "-" + i),
      brand: r.brand || "",
      name: r.name || "",
      address: r.address || "",
      lat: +r.lat,
      lon: +r.lon,
      source: r.source || source,
      sourceUrl: r.sourceUrl || "",
      stationType: r.stationType || "",
      tags: r.tags || {}
    })).filter((s) => s.lat && s.lon);
  }

  function loadStations() {
    const batches = [
      normalize(window.sunuCarbuShellStations, "Shell"),
      normalize(window.sunuCarbuSeedStations, "TotalEnergies"),
      normalize(window.sunuCarbuMkaStations, "MKA"),
      normalize(window.sunuCarbuOlaStations, "OLA"),
      normalize(window.sunuCarbuEltonStations, "ELTON"),
      normalize(window.sunuCarbuStarStations, "Star"),
      normalize(window.sunuCarbuApiStations, "API"),
      normalize(window.sunuCarbuToubaOilStations, "Touba"),
      normalize(window.sunuCarbuMarquesComplementaires, "Autres")
    ];
    const seen = new Set();
    stations = [];
    batches.flat().forEach((s) => {
      if (seen.has(s.key)) return;
      seen.add(s.key);
      stations.push(s);
    });
    group.clearLayers();
    stations.forEach(addMarker);
    renderList();
    $("selInfo").textContent = stations.length + " stations chargées";
  }

  async function fetchShared() {
    if (!SHARED.binId || !SHARED.apiKey) return;
    try {
      const res = await fetch(`${SHARED.base}/${SHARED.binId}/latest`, {
        headers: { "X-Master-Key": SHARED.apiKey }
      });
      if (!res.ok) return;
      const data = await res.json();
      sharedCache = data.record || data || {};
    } catch (e) { console.warn(e); }
  }

  async function pushShared(all) {
    if (!SHARED.binId || !SHARED.apiKey) return false;
    try {
      const res = await fetch(`${SHARED.base}/${SHARED.binId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-Master-Key": SHARED.apiKey },
        body: JSON.stringify(all)
      });
      return res.ok;
    } catch { return false; }
  }

  $("q").addEventListener("input", renderList);
  $("btnLocate").onclick = () => {
    if (!navigator.geolocation) return showNotice("Géolocalisation indisponible");
    navigator.geolocation.getCurrentPosition((pos) => {
      map.setView([pos.coords.latitude, pos.coords.longitude], 13);
    }, () => showNotice("Impossible d'obtenir votre position"));
  };
  $("btnReport").onclick = () => {
    if (!selected) return;
    $("dlgDesc").textContent = stationLabel(selected) + " · valable jusqu'à 19h Dakar";
    $("dlg").hidden = false;
  };
  $("btnCancel").onclick = () => { $("dlg").hidden = true; };
  $("btnSubmit").onclick = async () => {
    if (!selected) return;
    const entry = {
      availability: $("avail").value,
      fuel: $("fuel").value,
      timestamp: Date.now(),
      shared: !!(SHARED.binId && SHARED.apiKey)
    };
    const local = getLocal();
    local[selected.key] = entry;
    localStorage.setItem("sunucarbu-local-reports-v1", JSON.stringify(local));
    sharedCache[selected.key] = entry;
    const ok = await pushShared(sharedCache);
    $("dlg").hidden = true;
    refreshMarkers();
    selectStation(selected, false);
    showNotice(ok ? "Signalement partagé avec tous." : (SHARED.binId ? "Enregistré localement (partage échoué)." : "Enregistré sur cet appareil. Configurez JSONBin pour le partage public."));
  };

  (async () => {
    await fetchShared();
    loadStations();
    setInterval(async () => {
      await fetchShared();
      refreshMarkers();
      if (selected) selectStation(selected, false);
    }, 120000);
  })();
})();
