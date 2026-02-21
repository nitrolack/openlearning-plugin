let overlayElement = null;
let mouseMoveHandler = null;
let mouseUpHandler = null;

function createOverlay(payload) {
  if (overlayElement) return;

  overlayElement = document.createElement("div");
  overlayElement.id = "openlearning-overlay";

  overlayElement.innerHTML = `
    <div class="ol-header">
      <span class="ol-title">OpenLearning</span>
      <button class="ol-close">✕</button>
    </div>
    <div class="ol-content">
      <div class="ol-map">${escapeHtml(payload.mapName || "")}</div>
      ${renderMetas(payload.metas || [])}
    </div>
  `;

  document.body.appendChild(overlayElement);

  overlayElement
    .querySelector(".ol-close")
    .addEventListener("click", removeOverlay);

  makeDraggable(overlayElement);
}

function renderMetas(metas) {
  if (!metas.length) return "";

  return metas.map(meta => `
    <div class="ol-card">
      <div class="ol-tag">${escapeHtml(meta.tag || "")}</div>
      <div class="ol-text">${escapeHtml(meta.text || "")}</div>
      ${meta.imageUrl 
        ? `<img class="ol-image" src="${escapeHtml(meta.imageUrl)}" />`
        : ""}
    </div>
  `).join("");
}

function removeOverlay() {
  if (overlayElement) {
    overlayElement.remove();
    overlayElement = null;
  }

  cleanupDragListeners();
}

function cleanupDragListeners() {
  if (mouseMoveHandler) {
    document.removeEventListener("mousemove", mouseMoveHandler);
    mouseMoveHandler = null;
  }

  if (mouseUpHandler) {
    document.removeEventListener("mouseup", mouseUpHandler);
    mouseUpHandler = null;
  }
}

function makeDraggable(element) {
  const header = element.querySelector(".ol-header");

  let offsetX = 0;
  let offsetY = 0;

  header.addEventListener("mousedown", e => {
    e.preventDefault();

    offsetX = element.offsetLeft - e.clientX;
    offsetY = element.offsetTop - e.clientY;

    mouseMoveHandler = (ev) => {
      const newLeft = ev.clientX + offsetX;
      const newTop = ev.clientY + offsetY;

      const maxLeft = window.innerWidth - element.offsetWidth;
      const maxTop = window.innerHeight - element.offsetHeight;

      element.style.left = Math.max(0, Math.min(newLeft, maxLeft)) + "px";
      element.style.top = Math.max(0, Math.min(newTop, maxTop)) + "px";
      element.style.right = "auto";
    };

    mouseUpHandler = () => {
      cleanupDragListeners();
    };

    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", mouseUpHandler);
  });
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}