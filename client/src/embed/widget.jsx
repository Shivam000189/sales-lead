import { createRoot } from "react-dom/client";
import LeadFormShared from "./LeadFormShared";
import embedCss from "./embed.css?inline";

function initLeadWidget() {
  // 1. Locate the widget script tag to read attributes
  const currentScript =
    document.currentScript ||
    document.querySelector("script[data-api-url]") ||
    document.querySelector("script[src*='widget.js']");

  let apiUrl = currentScript?.dataset?.apiUrl || "";
  if (!apiUrl && currentScript?.src) {
    try {
      const url = new URL(currentScript.src);
      apiUrl = `${url.origin}/api`;
    } catch {
      apiUrl = "";
    }
  }

  // 2. Locate target container
  const CONTAINER_ID = "hero-crm-lead-form";
  let container = document.getElementById(CONTAINER_ID);

  if (!container) {
    container = document.createElement("div");
    container.id = CONTAINER_ID;
    if (currentScript && currentScript.parentNode) {
      currentScript.parentNode.insertBefore(container, currentScript);
    } else {
      document.body.appendChild(container);
    }
  }

  // Avoid multiple mounts on same container
  if (container.__heroCrmMounted) {
    return;
  }
  container.__heroCrmMounted = true;

  // 3. Encapsulate styles with Shadow DOM
  let mountPoint;
  if (container.attachShadow) {
    const shadowRoot = container.attachShadow({ mode: "open" });
    const styleEl = document.createElement("style");
    styleEl.textContent = embedCss;
    shadowRoot.appendChild(styleEl);

    mountPoint = document.createElement("div");
    mountPoint.className = "hero-lead-embed-root";
    shadowRoot.appendChild(mountPoint);
  } else {
    // Fallback if Shadow DOM is unavailable
    const styleEl = document.createElement("style");
    styleEl.textContent = embedCss;
    document.head.appendChild(styleEl);
    mountPoint = container;
  }

  // 4. Render React tree
  const root = createRoot(mountPoint);
  root.render(<LeadFormShared apiUrl={apiUrl} isEmbed={true} />);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLeadWidget);
} else {
  initLeadWidget();
}

export default initLeadWidget;
