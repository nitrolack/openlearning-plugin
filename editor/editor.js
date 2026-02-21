const app = document.getElementById("app");
let currentView = "metas";
let convertedGuessr = null;
let convertedTagHints = null;

State.load(() => {
  render();
});

function render() {
    app.innerHTML = `
    <div class="topbar">
      <h1>${I18N.t("title")}</h1>
      <button id="langBtn">${I18N.getLang().toUpperCase()}</button>
    </div>
  
    <div class="tabs">
      <button id="tabMetas">${I18N.t("metas")}</button>
      <button id="tabConverter">${I18N.t("converter")}</button>
      <button id="tabHelp">${I18N.t("help")}</button>
    </div>
  
    <div id="content"></div>
  `;
  document.getElementById("tabMetas")
  .addEventListener("click", () => switchView("metas"));

document.getElementById("tabConverter")
  .addEventListener("click", () => switchView("converter"));

document.getElementById("tabHelp")
  .addEventListener("click", () => switchView("help"));

document.getElementById("langBtn")
  .addEventListener("click", switchLang);
  renderView();
}

function switchView(view) {
  currentView = view;
  renderView();
}

function switchLang() {
  I18N.setLang(I18N.getLang() === "de" ? "en" : "de");
  render();
}

function renderView() {
  const content = document.getElementById("content");

  if (currentView === "metas") renderMetas(content);
  if (currentView === "converter") renderConverter(content);
  if (currentView === "help") renderHelp(content);
}

function renderMetas(container) {

    const state = State.get();
  
    container.innerHTML = `
      <div class="meta-toolbar">
        <label>${I18N.t("worldName")}</label>
        <input id="worldName" value="${state.world}">
        
        <div class="meta-buttons">
            <button id="loadFileBtn">${I18N.t("loadFile")}</button>
            <button id="saveFileBtn">${I18N.t("saveFile")}</button>
            <button id="addMetaBtn">${I18N.t("addMeta")}</button>
            <button id="clearAllBtn" class="danger">
                ${I18N.t("clearAll")}
            </button>
        </div>
  
        <input type="file" id="fileInput" accept=".json" style="display:none;">
      </div>
  
      <div id="metaList"></div>
    `;
  
    // 🔥 Wichtig: Ab hier erst DOM-Zugriffe
  
    const worldInput = document.getElementById("worldName");
    const addBtn = document.getElementById("addMetaBtn");
    const loadBtn = document.getElementById("loadFileBtn");
    const saveBtn = document.getElementById("saveFileBtn");
    const fileInput = document.getElementById("fileInput");
    const clearBtn = document.getElementById("clearAllBtn");

    worldInput.addEventListener("input", e => {
      state.world = e.target.value;
      State.save();
    });
  
    addBtn.addEventListener("click", () => {
      state.metas.push({ tag: "", text: "", imageUrl: "" });
      State.save();
      render(); // komplettes Re-Render
    });
  
    loadBtn.addEventListener("click", () => {
      fileInput.click();
    });
  
    saveBtn.addEventListener("click", exportMetaFile);
    fileInput.addEventListener("change", importMetaFile);
    
    clearBtn.addEventListener("click", () => {
        const confirmed = confirm(I18N.t("confirmClearAll"));
      
        if (!confirmed) return;
      
        state.metas = [];
        State.save();
        render();
      });

    renderMetaList();
  }

  function importMetaFile(event) {
    const file = event.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
  
    reader.onload = e => {
      try {
        const parsed = JSON.parse(e.target.result);
  
        if (!parsed.world || !Array.isArray(parsed.metas)) {
          alert("Invalid Meta File");
          return;
        }
  
        State.set(parsed);
        render();
  
      } catch {
        alert("Invalid JSON");
      }
    };
  
    reader.readAsText(file);
  }

  function exportMetaFile() {
    const state = State.get();
    
    if (validateDuplicateTags().size > 0) {
        alert("Duplicate tags detected. Please fix them before saving.");
        return;
      }

    if (!state.world) {
      alert("World name required");
      return;
    }
  
    const normalized = state.world
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "");
  
    const blob = new Blob(
      [JSON.stringify(state, null, 2)],
      { type: "application/json" }
    );
  
    const url = URL.createObjectURL(blob);
  
    const a = document.createElement("a");
    a.href = url;
    a.download = `${normalized}-metas.json`;
    a.click();
  
    URL.revokeObjectURL(url);
  }

function renderMetaList() {
    const state = State.get();
    const list = document.getElementById("metaList");
    
    if (!list) return;
    list.innerHTML = "";
  
    state.metas.forEach((meta, index) => {
      const card = document.createElement("div");
      card.className = "meta-card";
  
      card.innerHTML = `
        <label>${I18N.t("tag")}</label>
        <input data-index="${index}" data-field="tag" value="${meta.tag}">
        
        <label>${I18N.t("text")}</label>
        <textarea data-index="${index}" data-field="text">${meta.text}</textarea>
        
        <label>${I18N.t("image")}</label>
        <input data-index="${index}" data-field="imageUrl" value="${meta.imageUrl}">
        
        <button class="delete-btn" data-index="${index}">
          ${I18N.t("delete")}
        </button>
        <hr>
      `;
  
      list.appendChild(card);
      
    });
    
    applyDuplicateValidation();
    bindMetaEvents();
  } 
  
function applyDuplicateValidation() {
    const duplicates = validateDuplicateTags();
  
    document.querySelectorAll('[data-field="tag"]').forEach(input => {
      const value = input.value.trim().toLowerCase();
  
      if (value && duplicates.has(value)) {
        input.classList.add("duplicate");
      } else {
        input.classList.remove("duplicate");
      }
    });
  }
  function bindMetaEvents() {
    const state = State.get();
  
    document.querySelectorAll("[data-field]").forEach(el => {
        el.addEventListener("input", e => {
          const index = e.target.dataset.index;
          const field = e.target.dataset.field;
      
          state.metas[index][field] = e.target.value;
          State.save();
      
          if (field === "tag") {
            applyDuplicateValidation();
          }
        });
      });
  
      document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", e => {
          const index = e.currentTarget.dataset.index;
      
          state.metas.splice(index, 1);
          State.save();
          render();
        });
      });

    
  }

  function validateDuplicateTags() {
    const state = State.get();
  
    const seen = new Map();
    const duplicates = new Set();
  
    state.metas.forEach((meta, index) => {
      const tag = meta.tag?.trim().toLowerCase();
      if (!tag) return;
  
      if (seen.has(tag)) {
        duplicates.add(tag);
      } else {
        seen.set(tag, index);
      }
    });
  
    return duplicates;
  }

  function renderConverter(container) {
    container.innerHTML = `
      <div class="converter-wrapper">
        <h2>${I18N.t("converterTitle")}</h2>

        <div class="converter-file-row">
        <button id="selectFileBtn">Datei auswählen</button>
        <input type="file" id="mapFileInput" accept=".json" style="display:none;">
      </div>

        <textarea id="importArea" placeholder="${I18N.t("pasteMapMaking")}"></textarea>
  
        <label class="checkbox-row">
          <input type="checkbox" id="includeTags" checked>
          ${I18N.t("includeTags")}
        </label>
  
        <div class="converter-buttons">
          <button id="convertBtn">${I18N.t("convert")}</button>
          <button id="downloadGuessrBtn" disabled>${I18N.t("downloadGuessr")}</button>
          <button id="downloadTagHintsBtn" disabled>${I18N.t("downloadTagHints")}</button>
        </div>
  
        <div class="converter-output">
          <h3>OpenGuessr</h3>
          <pre id="guessrOutput"></pre>
  
          <h3>Tag Hints</h3>
          <pre id="tagHintsOutput"></pre>
        </div>
      </div>
    `;
  
    document.getElementById("convertBtn").addEventListener("click", () => {
      try {
        const raw = document.getElementById("importArea").value;
        const data = JSON.parse(raw);
  
        const includeTags = document.getElementById("includeTags").checked;
  
        const { guessr, tagHints } = convertMapMakingToOpenGuessr(data, includeTags);
  
        convertedGuessr = guessr;
        convertedTagHints = tagHints;
  
        document.getElementById("guessrOutput").textContent =
          JSON.stringify(guessr, null, 2);
  
        document.getElementById("tagHintsOutput").textContent =
          tagHints ? JSON.stringify(tagHints, null, 2) : "";
  
        document.getElementById("downloadGuessrBtn").disabled = false;
        document.getElementById("downloadTagHintsBtn").disabled = !tagHints;
  
      } catch (e) {
        alert(I18N.t("invalidMapMaking"));
      }
    });
    
    document.getElementById("selectFileBtn")
  .addEventListener("click", () => {
    document.getElementById("mapFileInput").click();
  });

document.getElementById("mapFileInput")
  .addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = ev => {
      document.getElementById("importArea").value = ev.target.result;
    };

    reader.readAsText(file);
  });

    document.getElementById("downloadGuessrBtn").addEventListener("click", () => {
      if (!convertedGuessr) return;
      downloadJSON(convertedGuessr, "openguessr-locations.json");
    });
  
    document.getElementById("downloadTagHintsBtn").addEventListener("click", () => {
      if (!convertedTagHints) return;
      const worldSlug = slugify(convertedTagHints.world || "world");
      downloadJSON(convertedTagHints, `${worldSlug}-taghints.json`);
    });
  }

  function convertMapMakingToOpenGuessr(data, includeTags) {
    if (!data || typeof data !== "object") throw new Error("bad");
    if (typeof data.name !== "string") throw new Error("bad");
    if (!Array.isArray(data.customCoordinates)) throw new Error("bad");
  
    const coords = data.customCoordinates
      .filter(c => typeof c?.lat === "number" && typeof c?.lng === "number")
      .map(c => ({
        lat: c.lat,
        lng: c.lng,
        tags: Array.isArray(c?.extra?.tags) ? c.extra.tags : []
      }));
  
    // OpenGuessr: [[lat,lng],...]
    const guessr = {
      locations: coords.map(c => [c.lat, c.lng])
    };
  
    let tagHints = null;
  
    if (includeTags) {
      // pro location tags + unique list
      const unique = new Set();
      coords.forEach(c => c.tags.forEach(t => unique.add(String(t))));
  
      tagHints = {
        world: data.name,
        locations: coords.map(c => ({
          lat: c.lat,
          lng: c.lng,
          tags: c.tags
        })),
        uniqueTags: Array.from(unique).sort()
      };
    }
  
    return { guessr, tagHints };
  }

  function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
  
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  
    URL.revokeObjectURL(url);
  }
  
  function slugify(str) {
    return String(str)
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "");
  }

  function renderHelp(container) {
    container.innerHTML = `
      <p>${I18N.t("explanation")}</p>
    `;
  }