(() => {
  const BRANDS = {
    "Shell": { color: "#c82b24", logo: "assets/brands/Shell.png", initials: "S" },
    "TotalEnergies": { color: "#0873b9", logo: "https://totalenergies.sn/themes/custom/butterfly_theme/logo.svg?v=1.2", initials: "T" },
    "OLA Energy": { color: "#70449b", logo: "assets/brands/ola.png", initials: "OLA" },
    "ELTON": { color: "#c96918", logo: "assets/brands/elton.png", initials: "E" },
    "Eydon": { color: "#2d3585", logo: "assets/brands/eydon.png", initials: "E" },
    "Star Oil": { color: "#147a78", logo: "assets/brands/staroil.svg", initials: "STAR" },
    "API": { color: "#26834a", logo: "assets/brands/api.png", initials: "API" },
    "Touba Oil": { color: "#b44722", logo: "assets/brands/toubaoil.png", initials: "TO" },
    "Touba Sandaga Oil": { color: "#9a3b65", initials: "TS" },
    "MKA Excellence": { color: "#8f6500", logo: "assets/brands/mka.png", initials: "MKA" },
    "SGF": { color: "#008252", logo: "assets/brands/sfg.png", initials: "SGF" },
    "EDK Oil": { color: "#c6362d", logo: "assets/brands/edkoil.png", initials: "EDK" },
    "Omega Petroleum": { color: "#51438c", logo: "assets/brands/omegapetroleum.png", initials: "Ω" },
    "Neptune Oil Sénégal": { color: "#16749a", logo: "assets/brands/NeptuneOil.png", initials: "N" },
    "Zen": { color: "#2f8b55", logo: "assets/brands/zen.png", initials: "ZEN" }, 
    "Puma Energy": { color: "#d81e05", logo: "assets/brands/puma.png", initials: "PUMA" },
    "PETROSEN": { color: "#006d8f", logo: "assets/brands/petrosen.png", initials: "PETRO" },
    "Séné Pétrole": { color: "#008a3e", logo: "assets/brands/senepetrole.png", initials: "SP" },
    "Oryx Energies": { color: "#e36b22", logo: "assets/brands/oryx.png", initials: "ORYX" },
    "Autres (OSM)": { color: "#465a50", initials: "OSM" }
  };

const SHARED = {
    binId: "6ae29494ffd5d1605394576e",
    apiKey: "$2a$10$EYAsG1bBdPaO478pnrZsMOxcEayPOeJtlI7Kb99lw/dfbCKPBk4Ea",
    base: "https://api.jsonbin.io/v3/b"
  };

  let stations = [];
  let selected = null;
  let sharedCache = {};
  let activeBrandFilter = "";
  let userPos = null;
  let userMarker = null;
  let routeLayers = [];
  let routeOptions = [];
  let routeController = null;
  let routeRequestId = 0;
  const group = L.layerGroup();
  const map = L.map("map", { doubleClickZoom: false, minZoom: 6 }).setView([14.5, -14.5], 7);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);
  group.addTo(map);

  try {
    if (window.sunuCarbuSenegalBoundary) {
      L.geoJSON(window.sunuCarbuSenegalBoundary, {
        style: { color: "#16834d", weight: 1.5, fillOpacity: 0.03 }
      }).addTo(map);
    }
  } catch (e) {}

  const $ = (id) => document.getElementById(id);
  const notice = $("notice");
  function showNotice(msg) {
    if (!notice) return;
    notice.textContent = msg;
    notice.classList.add("on");
    setTimeout(() => notice.classList.remove("on"), 6000);
  }

  function stationBrand(s) {
    const b = s.brand || (s.tags && (s.tags.brand || s.tags.operator)) || "";
    if (/shell/i.test(b)) return "Shell";
    if (/total/i.test(b)) return "TotalEnergies";
    if (/ola/i.test(b)) return "OLA Energy";
    if (/puma/i.test(b)) return "Puma Energy";
    if (/elton/i.test(b)) return "ELTON";
    if (/eydon/i.test(b)) return "Eydon";
    if (/star/i.test(b)) return "Star Oil";
    if (/touba\s*sandaga/i.test(b)) return "Touba Sandaga Oil";
    if (/touba/i.test(b)) return "Touba Oil";
    if (/^api$/i.test(b) || /\bapi\b/i.test(b)) return "API";
    if (/mka/i.test(b)) return "MKA Excellence";
    if (/petrosen/i.test(b)) return "PETROSEN";
    if (/\bsgf\b/i.test(b)) return "SGF";
    if (/oryx/i.test(b)) return "Oryx Energies";
    if (/\bedk\b/i.test(b)) return "EDK Oil";
    if (/omega/i.test(b)) return "Omega Petroleum";
    if (/neptune/i.test(b)) return "Neptune Oil Sénégal";
    if (/zen/i.test(b)) return "Zen";
    return b || (s.source === "OpenStreetMap" ? "Autres (OSM)" : "Autre");
  }

  function stationLabel(s) {
    return s.name || (s.tags && s.tags.name) || s.brand || "Station";
  }

  function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const toRad = (d) => d * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function formatDistance(km) {
    if (km < 1) return Math.round(km * 1000) + " m";
    if (km < 10) return km.toFixed(1).replace(".", ",") + " km";
    return Math.round(km) + " km";
  }

  function estimateMinutes(km) {
    return Math.max(1, Math.round((km / 25) * 60));
  }

  function formatEta(min) {
    if (min < 60) return min + " min";
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m ? h + " h " + m + " min" : h + " h";
  }

  function isReportUsable(report) {
    return !!report && Number.isFinite(Number(report.timestamp)) &&
      Number(report.timestamp) > 0 &&
      (report.availability === "shortage" || report.availability === "available");
  }

  function isReportStale(report) {
    return Date.now() - Number(report.timestamp) >= 48 * 3600 * 1000;
  }

  function reportAgeLabel(report) {
    return isReportStale(report) ? " · Signalement ancien (> 48 h)" : "";
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
      if (isReportUsable(r) && (!best || Number(r.timestamp) > Number(best.timestamp))) best = r;
    }
    return best;
  }

  function getStatus(key) {
    const r = getReport(key);
    return r ? r.availability : null;
  }

  function markHtml(brand, status) {
    const st = BRANDS[brand] || { color: "#16834d", initials: (brand || "?").slice(0, 3).toUpperCase() };
    const img = st.logo
      ? `<img src="${st.logo}" alt="" draggable="false" onerror="this.style.display='none';this.parentNode.textContent='${st.initials}'">`
      : `<span style="font-size:8px;font-weight:800;color:${st.color}">${st.initials}</span>`;
    const dot = status === "shortage"
      ? `<span class="sd no"></span>`
      : (status === "available" ? `<span class="sd ok"></span>` : "");
    return `<span class="marker-wrap"><span class="brand" style="--c:${st.color}">${img}</span>${dot}</span>`;
  }

  function clearRoute() {
    if (routeController) routeController.abort();
    routeController = null;
    routeRequestId++;
    routeLayers.forEach((layer) => map.removeLayer(layer));
    routeLayers = [];
    routeOptions = [];
    const choices = $("routeChoices");
    if (choices) choices.replaceChildren();
    const note = $("routeNote");
    if (note) note.textContent = userPos
      ? "Trajet calculé depuis votre position · estimation OSM, sans trafic en temps réel."
      : "Votre position est nécessaire pour calculer un trajet.";
    const button = $("btnRoute");
    if (button) button.disabled = !selected;
  }

  function formatRouteDistance(meters) {
    return formatDistance(meters / 1000);
  }

  function selectRoute(index) {
    routeLayers.forEach((layer, i) => layer.setStyle({
      color: i === index ? "#2563eb" : "#94a3b8",
      weight: i === index ? 6 : 4,
      opacity: i === index ? 0.9 : 0.65,
      dashArray: i === index ? null : "7 7"
    }));
    const choices = $("routeChoices");
    if (!choices) return;
    Array.from(choices.children).forEach((button, i) => {
      button.setAttribute("aria-pressed", String(i === index));
    });
    const bounds = routeLayers[index].getBounds();
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [28, 28], maxZoom: 14 });
  }

  function displayRoutes(routes) {
    routeLayers.forEach((layer) => map.removeLayer(layer));
    routeLayers = [];
    routeOptions = routes.filter((route) =>
      route && route.geometry && Array.isArray(route.geometry.coordinates) &&
      route.geometry.coordinates.length > 1 &&
      Number.isFinite(route.distance) && Number.isFinite(route.duration) &&
      route.geometry.coordinates.every((point) =>
        Array.isArray(point) && Number.isFinite(point[0]) && Number.isFinite(point[1])
      )
    );
    if (!routeOptions.length) throw new Error("Aucun tracé routier exploitable.");

    routeOptions.forEach((route, index) => {
      const points = route.geometry.coordinates.map(([lon, lat]) => [lat, lon]);
      const layer = L.polyline(points, {
        color: index === 0 ? "#2563eb" : "#94a3b8",
        weight: index === 0 ? 6 : 4,
        opacity: index === 0 ? 0.9 : 0.65,
        dashArray: index === 0 ? null : "7 7"
      }).addTo(map);
      layer.on("click", () => selectRoute(index));
      routeLayers.push(layer);
    });

    const choices = $("routeChoices");
    if (choices) {
      choices.replaceChildren();
      routeOptions.forEach((route, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "route-choice";
        button.setAttribute("aria-pressed", String(index === 0));
        button.textContent = `Option ${index + 1} · ${formatRouteDistance(route.distance)} · ${formatEta(Math.round(route.duration / 60))}`;
        button.onclick = () => selectRoute(index);
        choices.appendChild(button);
      });
    }

    selectRoute(0);
    const note = $("routeNote");
    if (note) note.textContent = `${routeOptions.length} itinéraire(s) · estimation OSRM/OpenStreetMap (service public, disponibilité non garantie), sans données de trafic en temps réel.`;
  }

  async function calculateRoute() {
    if (!selected || !userPos) return;
    clearRoute();
    const station = selected;
    const requestId = routeRequestId;
    const controller = new AbortController();
    routeController = controller;
    const button = $("btnRoute");
    const note = $("routeNote");
    if (button) button.disabled = true;
    if (note) note.textContent = "Calcul de l’itinéraire…";

    const url = `https://router.project-osrm.org/route/v1/driving/${userPos.lon},${userPos.lat};${station.lon},${station.lat}?alternatives=true&overview=full&geometries=geojson&steps=false`;
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error("Service d’itinéraire indisponible.");
      const result = await response.json();
      if (requestId !== routeRequestId || !selected || selected.key !== station.key) return;
      if (result.code !== "Ok" || !Array.isArray(result.routes) || !result.routes.length) {
        throw new Error("Aucun itinéraire trouvé pour cette station.");
      }
      displayRoutes(result.routes);
    } catch (error) {
      if (requestId !== routeRequestId || error.name === "AbortError") {
        if (error.name === "AbortError" && requestId === routeRequestId && note) {
          note.textContent = "Le calcul a dépassé le délai. Réessayez.";
        }
        return;
      }
      if (note) note.textContent = error.message || "Impossible de calculer l’itinéraire.";
      showNotice(error.message || "Impossible de calculer l’itinéraire.");
    } finally {
      clearTimeout(timeout);
      if (requestId === routeRequestId) {
        routeController = null;
        if (button) button.disabled = !selected;
      }
    }
  }

  function addMarker(s) {
    const brand = stationBrand(s);
    const status = getStatus(s.key);
    const report = getReport(s.key);
    const m = L.marker([s.lat, s.lon], {
      icon: L.divIcon({
        className: "",
        html: markHtml(brand, status),
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      }),
      title: stationLabel(s) + (status === "shortage" ? " · Pénurie signalée" : status === "available" ? " · Disponible (signalé)" : " · Aucun signalement récent — état non vérifié") + (report ? reportAgeLabel(report) : "")
    });
    const src = s.sourceUrl
      ? `<br><a href="${s.sourceUrl}" target="_blank" rel="noopener">Source ↗</a>`
      : (s.source ? `<br><small>Source : ${s.source}</small>` : "");
    m.bindPopup(`<strong>${stationLabel(s)}</strong><br>${brand}<br>${s.address || ""}${src}`);
    m.on("click", () => selectStation(s, false));
    s.marker = m;
    group.addLayer(m);
  }

  function refreshMarkers() {
    stations.forEach((s) => {
      if (!s.marker) return;
      const brand = stationBrand(s);
      const status = getStatus(s.key);
      const report = getReport(s.key);
      s.marker.options.title = stationLabel(s) +
        (status === "shortage" ? " · Pénurie signalée" : status === "available" ? " · Disponible (signalé)" : " · Aucun signalement récent — état non vérifié") +
        (report ? reportAgeLabel(report) : "");
      s.marker.setIcon(L.divIcon({
        className: "",
        html: markHtml(brand, status),
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      }));
    });
  }

  function selectStation(s, pan) {
    const changed = !selected || selected.key !== s.key;
    if (changed) clearRoute();
    selected = s;
    const btnReport = $("btnReport");
    if (btnReport) btnReport.disabled = false;
    const btnRoute = $("btnRoute");
    if (btnRoute) btnRoute.disabled = false;
    const r = getReport(s.key);
    let info = stationLabel(s) + " · " + stationBrand(s);
    if (userPos) {
      const km = haversineKm(userPos.lat, userPos.lon, s.lat, s.lon);
      info += " · " + formatDistance(km) + " · ~" + formatEta(estimateMinutes(km));
    } else if (s.address) {
      info += " · " + s.address;
    }
    if (r) {
      const t = new Date(r.timestamp).toLocaleString("fr-FR", { timeZone: "Africa/Dakar" });
      info += r.availability === "shortage"
        ? ` · Pénurie signalée (${t})`
        : ` · Disponible signalé (${t})`;
      info += reportAgeLabel(r);
    } else {
      info += " · Aucun signalement récent — état non vérifié";
    }
    const selInfo = $("selInfo");
    if (selInfo) selInfo.textContent = info;
    renderList();
    if (pan) {
      map.setView([s.lat, s.lon], Math.max(map.getZoom(), 14));
      if (s.marker) s.marker.openPopup();
    }
  }

  function renderList() {
    const qEl = $("q");
    const q = (qEl ? qEl.value : "").toLowerCase().trim();
    const list = $("list");
    if (!list) return;
    list.innerHTML = "";
    let filtered = stations.filter((s) => {
      const brand = stationBrand(s);
      if (activeBrandFilter && brand !== activeBrandFilter) return false;
      if (!q) return true;
      const t = (stationLabel(s) + " " + brand + " " + (s.address || "")).toLowerCase();
      return t.includes(q);
    });
    if (userPos) {
      filtered = filtered.map((s) => {
        const km = haversineKm(userPos.lat, userPos.lon, s.lat, s.lon);
        return { s, km };
      }).sort((a, b) => a.km - b.km).slice(0, 100);
    } else {
      filtered = filtered.slice(0, 100).map((s) => ({ s, km: null }));
    }
    if (!filtered.length) {
      list.innerHTML = '<div class="note">Aucune station</div>';
      return;
    }
    filtered.forEach(({ s, km }) => {
      const status = getStatus(s.key);
      const report = getReport(s.key);
      const row = document.createElement("button");
      row.type = "button";
      row.className = "row" + (selected && selected.key === s.key ? " on" : "");
      const dot = status === "shortage" ? '<span class="dot no"></span>'
        : status === "available" ? '<span class="dot ok"></span>' : "";
      let meta = stationBrand(s);
      if (km != null) {
        meta += " · " + formatDistance(km) + " · ~" + formatEta(estimateMinutes(km));
      } else if (s.address) {
        meta += " · " + s.address;
      } else {
        meta += " · Sénégal";
      }
      if (status === null) meta += " · État non vérifié";
      else if (report && isReportStale(report)) meta += " · Signalement ancien";
      row.innerHTML = `<strong>${dot}${stationLabel(s)}</strong><span>${meta}</span>`;
      row.onclick = () => selectStation(s, true);
      list.appendChild(row);
    });
  }

  function renderBrandLegend() {
    const grid = $("brandGrid");
    if (!grid) return;
    grid.innerHTML = "";
    const counts = {};
    stations.forEach((s) => {
      const b = stationBrand(s);
      counts[b] = (counts[b] || 0) + 1;
    });
    const allBtn = document.createElement("button");
    allBtn.type = "button";
    allBtn.className = "bitem" + (!activeBrandFilter ? " on" : "");
    allBtn.innerHTML = `<span class="mini" style="--c:#16834d;font-size:8px;font-weight:800;color:#16834d">★</span><span>Toutes (${stations.length})</span>`;
    allBtn.onclick = () => { activeBrandFilter = ""; applyFilters(); };
    grid.appendChild(allBtn);
    Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a.localeCompare(b, "fr")).forEach((name) => {
      const st = BRANDS[name] || { color: "#16834d", initials: name.slice(0, 3) };
      const el = document.createElement("button");
      el.type = "button";
      el.className = "bitem" + (activeBrandFilter === name ? " on" : "");
      el.setAttribute("aria-pressed", String(activeBrandFilter === name));
      const mini = st.logo
        ? `<span class="mini" style="--c:${st.color}"><img src="${st.logo}" alt="" onerror="this.remove()"></span>`
        : `<span class="mini" style="--c:${st.color};font-size:7px;font-weight:800;color:${st.color}">${st.initials}</span>`;
      el.innerHTML = `${mini}<span>${name} (${counts[name]})</span>`;
      el.onclick = () => {
        activeBrandFilter = activeBrandFilter === name ? "" : name;
        applyFilters();
      };
      grid.appendChild(el);
    });
  }

  function applyFilters() {
    renderList();
    const qEl = $("q");
    const q = (qEl ? qEl.value : "").toLowerCase().trim();
    stations.forEach((s) => {
      if (!s.marker) return;
      const brand = stationBrand(s);
      const matchBrand = !activeBrandFilter || brand === activeBrandFilter;
      const t = (stationLabel(s) + " " + brand + " " + (s.address || "")).toLowerCase();
      const matchQ = !q || t.includes(q);
      if (matchBrand && matchQ) {
        if (!group.hasLayer(s.marker)) group.addLayer(s.marker);
      } else if (group.hasLayer(s.marker)) {
        group.removeLayer(s.marker);
      }
    });
    renderBrandLegend();
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
    })).filter((s) => s.lat && s.lon && isFinite(s.lat) && isFinite(s.lon));
  }

  function loadStations() {
    const batches = [
      normalize(window.sunuCarbuShellStations, "Shell"),
      normalize(window.sunuCarbuSeedStations, "TotalEnergies"),
      normalize(window.sunuCarbuMkaStations, "MKA"),
      normalize(window.sunuCarbuOlaStations, "OLA"),
      normalize(window.sunuCarbuEltonStations, "ELTON"),
      normalize(window.sunuCarbuStarStations, "Star"),
      normalize(window.sunuCarbuOryxStations, "Oryx Energies"),
      normalize(window.sunuCarbuApiStations, "API"),
      normalize(window.sunuCarbuToubaOilStations, "Touba"),
      normalize(window.sunuCarbuZenStations, "Zen"),
      normalize(window.sunuCarbuSenePetroleStations, "Séné Pétrole"),
      normalize(window.sunuCarbuPumaStations, "Puma Energy"), // <--- Virgule ajoutée ici
      normalize(window.sunuCarbuComplementaryBrandStations, "Complementaires")
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
    renderBrandLegend();
    const countEl = $("count");
    if (countEl) countEl.textContent = "(" + stations.length + ")";
    const note = $("sourceNote");
    if (note) note.textContent = stations.length + " stations · les pastilles gardent le dernier signalement, ancien après 48 h · sans signalement : état non vérifié.";
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

  const qElem = $("q");
  if (qElem) qElem.addEventListener("input", applyFilters);

  const btnLocate = $("btnLocate");
  function setUserPosition(lat, lon, centerMap) {
    userPos = { lat, lon };
    if (userMarker) {
      userMarker.setLatLng([lat, lon]);
    } else {
      const blueIcon = L.divIcon({
        className: "",
        html: `<span style="display:block;width:18px;height:18px;border-radius:50%;background:#2563eb;border:3px solid #fff;box-shadow:0 0 0 2px #2563eb,0 2px 8px rgba(0,0,0,.35)"></span>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      });
      userMarker = L.marker([lat, lon], { icon: blueIcon, zIndexOffset: 1000, title: "Votre position" }).addTo(map);
      userMarker.bindPopup("<strong>Vous êtes ici</strong>");
    }
    if (centerMap) map.setView([lat, lon], 14);
    renderList();
  }

  if (btnLocate) {
    btnLocate.onclick = () => {
      if (!navigator.geolocation) return showNotice("Géolocalisation indisponible");
      showNotice("Localisation en cours…");
      navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setUserPosition(lat, lon, true);
        showNotice("Position affichée · stations triées par proximité");
      }, () => showNotice("Impossible d'obtenir votre position"), {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000
      });
    };
  }

  const btnRoute = $("btnRoute");
  if (btnRoute) {
    btnRoute.onclick = () => {
      if (!selected) return;
      if (userPos) {
        calculateRoute();
        return;
      }
      if (!navigator.geolocation) {
        showNotice("La géolocalisation est nécessaire pour calculer un itinéraire.");
        return;
      }
      btnRoute.disabled = true;
      const note = $("routeNote");
      if (note) note.textContent = "Localisation en cours…";
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserPosition(pos.coords.latitude, pos.coords.longitude, false);
        calculateRoute();
      }, () => {
        btnRoute.disabled = !selected;
        if (note) note.textContent = "Position indisponible. Autorisez la géolocalisation puis réessayez.";
        showNotice("Impossible d'obtenir votre position.");
      }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
    };
  }

  const btnReport = $("btnReport");
  if (btnReport) {
    btnReport.onclick = () => {
      if (!selected) return;
      const dlgDesc = $("dlgDesc");
      if (dlgDesc) dlgDesc.textContent = stationLabel(selected) + " · signalement libre, visible par tous (non vérifié officiellement).";
      const dlg = $("dlg");
      if (dlg) dlg.hidden = false;
    };
  }

  const btnCancel = $("btnCancel");
  if (btnCancel) {
    btnCancel.onclick = () => {
      const dlg = $("dlg");
      if (dlg) dlg.hidden = true;
    };
  }

  const btnSubmit = $("btnSubmit");
  if (btnSubmit) {
    btnSubmit.onclick = async () => {
      if (!selected) return;
      const availEl = $("avail");
      const fuelEl = $("fuel");
      const entry = {
        availability: availEl ? availEl.value : "available",
        fuel: fuelEl ? fuelEl.value : "",
        timestamp: Date.now(),
        shared: !!(SHARED.binId && SHARED.apiKey)
      };
      const local = getLocal();
      local[selected.key] = entry;
      localStorage.setItem("sunucarbu-local-reports-v1", JSON.stringify(local));
      sharedCache[selected.key] = entry;
      const ok = await pushShared(sharedCache);
      const dlg = $("dlg");
      if (dlg) dlg.hidden = true;
      refreshMarkers();
      selectStation(selected, false);
      showNotice(ok ? "Signalement partagé avec tous." : (SHARED.binId ? "Enregistré localement (partage échoué)." : "Enregistré sur cet appareil."));
    };
  }

  window.sunuCarbuReloadStations = function(){ loadStations(); };
  (async () => {
    await fetchShared();
    loadStations();
    Promise.allSettled([
      window.sunuCarbuShellReady,
      window.sunuCarbuTotalReady
    ]).then(function(){ loadStations(); });
    setInterval(async () => {
      await fetchShared();
      refreshMarkers();
      if (selected) selectStation(selected, false);
    }, 120000);
  })();
})();
