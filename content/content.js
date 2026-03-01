// content/content.js
console.log("Content script injected");
(function () {

    let triggered = false;
    let currentMapName = null;
    const BASE_URL = "https://nitrolack.github.io/openlearning-plugin/data";
    const META_URL = (slug) => `${BASE_URL}/metas/${slug}-metas.json`;
    const TAGHINTS_URL = (slug) => `${BASE_URL}/maps/${slug}-taghints.json`;
    let loading = false;

    let cache = {
    slug: null,
    mapName: null,
    metas: null,
    tagHints: null,
    ok: false,
    tried: false
    };

    function slugify(str) {
    return String(str)
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-]/g, "");
    }

    async function loadJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return await res.json();
    }

    async function ensureMapDataLoaded() {
    const mapName = currentMapName || extractMapName();
    if (!mapName) return false;

    const slug = slugify(mapName);

    if (cache.slug === slug && cache.ok) return true;
    if (cache.slug === slug && cache.tried && !cache.ok) return false;

    cache = { slug, mapName, metas: null, tagHints: null, ok: false, tried: true };

    try {
        const [metas, tagHints] = await Promise.all([
        loadJson(META_URL(slug)),
        loadJson(TAGHINTS_URL(slug))
        ]);

        cache.metas = metas;
        cache.tagHints = tagHints;
        cache.ok = true;
        return true;
    } catch {
        cache.ok = false;
        return false;
    }
    }

    function haversineMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const toRad = (x) => (x * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    function findBestHintLocation(lat, lng, thresholdMeters = 50) {
    const locs = cache.tagHints?.locations;
    if (!Array.isArray(locs) || !locs.length) return null;

    let best = null;
    let bestD = Infinity;

    for (const loc of locs) {
        if (typeof loc.lat !== "number" || typeof loc.lng !== "number") continue;
        const d = haversineMeters(lat, lng, loc.lat, loc.lng);
        if (d < bestD) {
        bestD = d;
        best = loc;
        }
    }

    if (!best || bestD > thresholdMeters) return null;
    return { loc: best, dist: bestD };
    }

    function findMetasForTags(tags) {
    const metas = cache.metas?.metas;
    if (!Array.isArray(metas) || !metas.length) return [];

    const wanted = new Set((tags || [])
        .map(t => String(t).trim().toLowerCase())
        .filter(Boolean)
    );

    return metas.filter(m => {
        const tag = String(m.tag || "").trim().toLowerCase();
        return tag && wanted.has(tag);
    });
    }
    function extractMapName() {
      const el = document.querySelector(".map-mode-indicator .info-tag p");
      if (!el) return null;
      return el.innerText.replace("Maps", "").trim();
    }
  
    function extractStreetViewData() {
      const iframe = document.querySelector("#panorama-iframe");
      if (!iframe) return null;
  
      const src = iframe.src;
  
      const locMatch = src.match(/location=([-0-9.]+),([-0-9.]+)/);
      if (!locMatch) return null;
  
      const fovMatch = src.match(/fov=([-0-9.]+)/);
      const headingMatch = src.match(/heading=([-0-9.]+)/);
      const pitchMatch = src.match(/pitch=([-0-9.]+)/);
  
      return {
        lat: parseFloat(locMatch[1]),
        lng: parseFloat(locMatch[2]),
        fov: fovMatch ? parseFloat(fovMatch[1]) : 90,
        heading: headingMatch ? parseFloat(headingMatch[1]) : 0,
        pitch: pitchMatch ? parseFloat(pitchMatch[1]) : 0,
        mapName: currentMapName
      };
    }
  
    function watchConfirmButton() {
      const confirmBtn = document.getElementById("confirmButton");
      if (!confirmBtn) return;
  
      const observer = new MutationObserver(() => {
        if (confirmBtn.classList.contains("confirmActive")) {
          const name = extractMapName();
          if (name) {
            currentMapName = name;
          }
        }
      });
  
      observer.observe(confirmBtn, {
        attributes: true,
        attributeFilter: ["class"]
      });
    }
  
    function initConfirmWatcher() {
      const btn = document.getElementById("confirmButton");
      if (btn) {
        watchConfirmButton();
      } else {
        setTimeout(initConfirmWatcher, 500);
      }
    }
  
    async function check() {
        if (loading) return;
        loading = true;
      
        try {
          const xpArea = document.getElementById("experienceArea");
      
          if (xpArea && !triggered) {
            triggered = true;
      
            const ok = await ensureMapDataLoaded();
            if (!ok) return;
      
            const data = extractStreetViewData();
            if (!data) return;
      
            const best = findBestHintLocation(data.lat, data.lng, 50);
            if (!best) return;
      
            const tags = Array.isArray(best.loc.tags) ? best.loc.tags : [];
            const metas = findMetasForTags(tags);
            if (!metas.length) return;
      
            createOverlay({
              mapName: cache.mapName,
              lat: data.lat,
              lng: data.lng,
              tags,
              metas
            });
          }
      
          if (!xpArea && triggered) {
            triggered = false;
            removeOverlay();
          }
      
        } finally {
          loading = false;
        }
      }
  
    initConfirmWatcher();
    setInterval(() => { check(); }, 400);
  
  })();