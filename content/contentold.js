(function () {

    const OVERLAY_ID = "openlearning-overlay";
    let triggered = false;
    
    let currentMapName = null;

    function extractMapName() {
      const el = document.querySelector(".map-mode-indicator .info-tag p");
      if (!el) return null;

      // Entfernt evtl. Map-Icon Textkram
      return el.innerText.replace("Maps", "").trim();
    }

    function watchConfirmButton() {
      const confirmBtn = document.getElementById("confirmButton");
      if (!confirmBtn) return;

      const observer = new MutationObserver(() => {
        if (confirmBtn.classList.contains("confirmActive")) {
          const name = extractMapName();
          if (name) {
            currentMapName = name;
            console.log("Map stored:", currentMapName);
          }
        }
      });

      observer.observe(confirmBtn, {
        attributes: true,
        attributeFilter: ["class"]
      });
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
        pitch: pitchMatch ? parseFloat(pitchMatch[1]) : 0
      };
    }
    
  
    function decimalToDMS(decimal, isLat) {
      const absolute = Math.abs(decimal);
      const degrees = Math.floor(absolute);
      const minutesFloat = (absolute - degrees) * 60;
      const minutes = Math.floor(minutesFloat);
      const seconds = ((minutesFloat - minutes) * 60).toFixed(1);
  
      const direction = isLat
        ? decimal >= 0 ? "N" : "S"
        : decimal >= 0 ? "E" : "W";
  
      return `${degrees}°${minutes}'${seconds}"${direction}`;
    }
  
  
    function buildStreetViewLink(data) {
      const { lat, lng, heading, pitch, fov } = data;
    
      return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}&heading=${heading}&pitch=${pitch}&fov=${fov}`;
    }
    

    function createOverlay(coords) {
      if (document.getElementById(OVERLAY_ID)) return;
  
      const overlay = document.createElement("div");
      overlay.id = OVERLAY_ID;
  
      overlay.innerHTML = `
        <div class="ol-header">
          <span>OpenLearning</span>
          <button class="ol-close">✕</button>
        </div>
        <div class="ol-content">
          <p><strong>Map:</strong> ${currentMapName ?? "Unknown"}</p>
          <p><strong>Latitude:</strong> ${coords?.lat ?? "N/A"}</p>
          <p><strong>Longitude:</strong> ${coords?.lng ?? "N/A"}</p>
          <button class="ol-map-btn">Hier nochmal genau angucken</button>
        </div>
      `;
  
      Object.assign(overlay.style, {
        position: "fixed",
        top: "20px",
        right: "20px",
        width: "300px",
        background: "#111",
        color: "white",
        borderRadius: "12px",
        boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
        zIndex: "999999",
        fontFamily: "sans-serif",
        fontSize: "14px",
        overflow: "hidden"
      });
  
      document.body.appendChild(overlay);
  
      const header = overlay.querySelector(".ol-header");
      Object.assign(header.style, {
        background: "#1e1e1e",
        padding: "10px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        cursor: "move",
        fontWeight: "bold"
      });
  
      overlay.querySelector(".ol-content").style.padding = "12px";
  
      const mapBtn = overlay.querySelector(".ol-map-btn");
      Object.assign(mapBtn.style, {
        marginTop: "10px",
        padding: "8px 10px",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
        background: "#2d7ff9",
        color: "white",
        width: "100%"
      });
  
      const streetLink = coords
        ? buildStreetViewLink(coords)
        : "#";

      mapBtn.addEventListener("click", () => {
        window.open(streetLink, "_blank");
      });
  
      overlay.querySelector(".ol-close").addEventListener("click", () => {
        overlay.remove();
      });
  
      makeDraggable(overlay);
    }
  
    function removeOverlay() {
      const overlay = document.getElementById(OVERLAY_ID);
      if (overlay) overlay.remove();
    }
  
    function check() {
      const xpArea = document.getElementById("XParea");
  
      if (xpArea && !triggered) {
        triggered = true;
        const data = extractStreetViewData();
        createOverlay(data);
      }
  
      if (!xpArea && triggered) {
        triggered = false;
        removeOverlay();
      }
    }
  
    function makeDraggable(element) {
      let offsetX = 0;
      let offsetY = 0;
      let isDown = false;
  
      const header = element.querySelector(".ol-header");
  
      header.addEventListener("mousedown", (e) => {
        isDown = true;
        offsetX = element.offsetLeft - e.clientX;
        offsetY = element.offsetTop - e.clientY;
      });
  
      document.addEventListener("mouseup", () => {
        isDown = false;
      });
  
      document.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        element.style.left = e.clientX + offsetX + "px";
        element.style.top = e.clientY + offsetY + "px";
        element.style.right = "auto";
      });
    }
    
    // Warten bis confirmButton existiert (SPA-safe)
    function initConfirmWatcher() {
      const btn = document.getElementById("confirmButton");
      if (btn) {
        watchConfirmButton();
      } else {
        setTimeout(initConfirmWatcher, 500);
      }
    }

    initConfirmWatcher();

    setInterval(check, 300);
  
  })();
  