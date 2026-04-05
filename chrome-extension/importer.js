// Importer page script — runs in its own tab, stays open throughout the flow

document.addEventListener("DOMContentLoaded", () => {
  const searchQueryEl = document.getElementById("searchQuery");
  const resultCountEl = document.getElementById("resultCount");
  const searchBtn = document.getElementById("searchBtn");
  const storeUrlEl = document.getElementById("storeUrl");
  const statusBar = document.getElementById("statusBar");
  const resultsSection = document.getElementById("resultsSection");
  const resultsCountEl = document.getElementById("resultsCount");
  const productGrid = document.getElementById("productGrid");
  const importBtn = document.getElementById("importBtn");
  const selectAllBtn = document.getElementById("selectAllBtn");
  const deselectAllBtn = document.getElementById("deselectAllBtn");
  const importResults = document.getElementById("importResults");
  const emptyState = document.getElementById("emptyState");

  let scrapedProducts = [];

  // Persist store URL in chrome.storage
  chrome.storage.local.get(["storeUrl"], (result) => {
    if (result.storeUrl) storeUrlEl.value = result.storeUrl;
  });
  storeUrlEl.addEventListener("change", () => {
    chrome.storage.local.set({ storeUrl: storeUrlEl.value });
  });

  // Enter key triggers search
  searchQueryEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchBtn.click();
  });

  // ─── Search ────────────────────────────────────────────────────────────
  searchBtn.addEventListener("click", async () => {
    const query = searchQueryEl.value.trim();
    const limit = parseInt(resultCountEl.value) || 10;

    if (!query) {
      showStatus("Please enter a search query.", "error");
      return;
    }

    setLoading(searchBtn, true);
    showStatus("Opening Amazon search... (this tab stays open!)", "info");
    importResults.style.display = "none";
    emptyState.style.display = "none";

    try {
      // Step 1: Open Amazon search in a NEW tab (this page stays open)
      const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
      const tab = await chrome.tabs.create({ url: searchUrl, active: false });

      showStatus("Waiting for Amazon page to load...", "info");

      // Step 2: Wait for the tab to finish loading
      await waitForTabLoad(tab.id);

      // Give Amazon a moment to render dynamic content
      await sleep(2000);

      showStatus("Scraping product results...", "info");

      // Step 3: Inject content script and scrape
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"],
      });

      const results = await chrome.tabs.sendMessage(tab.id, {
        action: "scrapeProducts",
        limit,
      });

      // Close the Amazon tab — we have what we need
      try { chrome.tabs.remove(tab.id); } catch (e) { /* tab may already be closed */ }

      scrapedProducts = results.products || [];

      if (scrapedProducts.length === 0) {
        showStatus(
          "No products found. Try a different search term, or Amazon may have changed their layout.",
          "error"
        );
        resultsSection.style.display = "none";
        emptyState.style.display = "block";
      } else {
        showStatus(
          `Found ${scrapedProducts.length} product(s). Select which to import below.`,
          "success"
        );
        renderProducts(scrapedProducts);
        resultsSection.style.display = "block";
      }
    } catch (err) {
      showStatus(`Error: ${err.message}`, "error");
      console.error(err);
    } finally {
      setLoading(searchBtn, false);
    }
  });

  // ─── Select / Deselect All ─────────────────────────────────────────────
  selectAllBtn.addEventListener("click", () => {
    document.querySelectorAll(".product-card").forEach((card) => {
      card.classList.add("selected");
    });
  });
  deselectAllBtn.addEventListener("click", () => {
    document.querySelectorAll(".product-card").forEach((card) => {
      card.classList.remove("selected");
    });
  });

  // ─── Import ────────────────────────────────────────────────────────────
  importBtn.addEventListener("click", async () => {
    const selected = getSelectedProducts();
    if (selected.length === 0) {
      showStatus("No products selected for import.", "error");
      return;
    }

    const storeUrl = storeUrlEl.value.replace(/\/+$/, "");
    setLoading(importBtn, true);
    showStatus(`Importing ${selected.length} product(s) to store...`, "info");

    try {
      const response = await fetch(`${storeUrl}/api/amazon/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: selected }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server returned ${response.status}: ${text}`);
      }

      const result = await response.json();
      showStatus("✅ Import complete!", "success");
      showImportResults(result);
    } catch (err) {
      showStatus(`Import failed: ${err.message}`, "error");
      console.error(err);
    } finally {
      setLoading(importBtn, false);
    }
  });

  // ─── Helpers ───────────────────────────────────────────────────────────

  function renderProducts(products) {
    resultsCountEl.textContent = `${products.length} product(s) found`;
    productGrid.innerHTML = "";

    products.forEach((p, i) => {
      const card = document.createElement("div");
      card.className = "product-card selected";
      card.dataset.index = i;
      card.innerHTML = `
        <div class="check">✓</div>
        <img src="${escapeAttr(p.imageUrl || "")}" alt="" onerror="this.src='icons/icon48.png'">
        <div class="product-info">
          <div class="product-title" title="${escapeAttr(p.title)}">${escapeHtml(p.title)}</div>
          <div class="product-meta">
            ${p.price != null ? `<span class="product-price">$${p.price.toFixed(2)}</span>` : '<span class="product-price">No price</span>'}
            ${p.brand ? `<span class="product-brand">${escapeHtml(p.brand)}</span>` : ""}
            ${p.rating ? `<span class="product-rating">★ ${p.rating}</span>` : ""}
          </div>
        </div>
      `;

      card.addEventListener("click", () => {
        card.classList.toggle("selected");
      });

      productGrid.appendChild(card);
    });
  }

  function getSelectedProducts() {
    const selected = [];
    document.querySelectorAll(".product-card.selected").forEach((card) => {
      const idx = parseInt(card.dataset.index);
      if (scrapedProducts[idx]) selected.push(scrapedProducts[idx]);
    });
    return selected;
  }

  function showImportResults(result) {
    importResults.style.display = "block";

    // Enrichment status badges
    let enrichmentHtml = "";
    if (result.enrichment) {
      enrichmentHtml = `<div style="margin:8px 0; display:flex; gap:8px;">
        <span style="padding:3px 10px; border-radius:12px; font-size:11px; font-weight:600; ${result.enrichment.aiDescriptions ? "background:#e8f5e9; color:#2e7d32;" : "background:#fff3e0; color:#e65100;"}">${result.enrichment.aiDescriptions ? "✅ AI Descriptions" : "⚠️ No AI (add ANTHROPIC_API_KEY)"}</span>
        <span style="padding:3px 10px; border-radius:12px; font-size:11px; font-weight:600; ${result.enrichment.embeddings ? "background:#e8f5e9; color:#2e7d32;" : "background:#fff3e0; color:#e65100;"}">${result.enrichment.embeddings ? "✅ Embeddings" : "⚠️ No Embeddings (add VOYAGE_AI_API_KEY)"}</span>
      </div>`;
    }

    let productsHtml = "";
    if (result.importedProducts && result.importedProducts.length > 0) {
      productsHtml = result.importedProducts
        .map((p, i) => {
          // Collect extra attributes
          const skipKeys = new Set([
            "_id", "name", "brand", "price", "image", "masterCategory", "subCategory",
            "articleType", "description", "gender", "baseColour", "color", "amazonAsin",
            "amazonRating", "amazonReviewCount", "amazonUrl", "amazonCategory", "source",
            "importedAt", "lastUpdatedAt", "hasEmbedding", "embeddingDimensions", "descriptionSnippet",
          ]);
          const extraAttrs = Object.entries(p).filter(([k]) => !skipKeys.has(k));

          return `
          <div style="border:1px solid #ddd; border-radius:8px; padding:14px; margin-bottom:10px; background:${i % 2 === 0 ? "white" : "#fafafa"};">
            <div style="display:flex; gap:12px; align-items:flex-start;">
              <img src="${escapeAttr(p.image?.url || "")}" alt="" style="width:64px; height:64px; object-fit:contain; border-radius:4px; background:#f5f5f5; flex-shrink:0;" onerror="this.style.display='none'">
              <div style="flex:1; min-width:0;">
                <div style="font-size:14px; font-weight:600; margin-bottom:4px;">${escapeHtml(p.name)}</div>
                <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:6px; font-size:11px;">
                  <span style="padding:2px 8px; background:#e3f2fd; color:#1565c0; border-radius:10px; font-weight:600;" title="Click to copy _id" onclick="navigator.clipboard.writeText('${p._id}').then(()=>this.textContent='✅ Copied!')">🆔 ${p._id}</span>
                  <span style="padding:2px 8px; background:#e8eaf6; color:#283593; border-radius:10px;">${escapeHtml(p.masterCategory || "?")} › ${escapeHtml(p.subCategory || "?")}</span>
                  ${p.articleType ? `<span style="padding:2px 8px; background:#f3e5f5; color:#6a1b9a; border-radius:10px;">${escapeHtml(p.articleType)}</span>` : ""}
                  <span style="padding:2px 8px; background:#fff3e0; color:#e65100; border-radius:10px; font-weight:700;">$${p.price?.amount?.toFixed(2) || "0.00"}</span>
                  <span style="padding:2px 8px; background:#e0f2f1; color:#00695c; border-radius:10px;">${escapeHtml(p.brand || "Unknown")}</span>
                  ${p.gender ? `<span style="padding:2px 8px; background:#fce4ec; color:#880e4f; border-radius:10px;">${escapeHtml(p.gender)}</span>` : ""}
                  ${p.baseColour ? `<span style="padding:2px 8px; background:#f5f5f5; color:#333; border-radius:10px;">🎨 ${escapeHtml(p.baseColour)}</span>` : ""}
                  <span style="padding:2px 8px; background:${p.hasEmbedding ? "#e8f5e9" : "#ffebee"}; color:${p.hasEmbedding ? "#2e7d32" : "#c62828"}; border-radius:10px;">${p.hasEmbedding ? `✅ Embedding (${p.embeddingDimensions}d)` : "❌ No embedding"}</span>
                  <span style="padding:2px 8px; background:#efebe9; color:#4e342e; border-radius:10px; font-family:monospace;">ASIN: ${escapeHtml(p.amazonAsin || "")}</span>
                </div>
                ${p.description ? `<div style="font-size:12px; color:#555; line-height:1.4; margin-bottom:6px; max-height:60px; overflow:hidden;">${escapeHtml(p.description)}</div>` : ""}
                ${extraAttrs.length > 0 ? `<div style="font-size:11px; color:#777; margin-top:4px;">
                  ${extraAttrs.map(([k, v]) => `<span style="padding:1px 6px; background:#f0f0f0; border-radius:4px; margin-right:4px;">${escapeHtml(k)}: ${escapeHtml(typeof v === "object" ? JSON.stringify(v) : String(v))}</span>`).join("")}
                </div>` : ""}
              </div>
            </div>
          </div>`;
        })
        .join("");

      productsHtml = `
        <div style="margin-top:12px;">
          <h4 style="font-size:14px; color:#333; margin-bottom:8px;">Imported Products:</h4>
          ${productsHtml}
        </div>
        <div style="margin-top:10px; display:flex; gap:8px;">
          <button class="btn btn-sm" id="copyJsonBtn">📋 Copy All as JSON</button>
        </div>
      `;
    }

    importResults.innerHTML = `
      <h3>📦 Import Results</h3>
      <div class="stat"><strong>${result.imported || 0}</strong> product(s) imported successfully</div>
      <div class="stat"><strong>${result.skipped || 0}</strong> product(s) skipped (already in store)</div>
      <div class="stat"><strong>${result.total || 0}</strong> total submitted</div>
      ${enrichmentHtml}
      ${productsHtml}
    `;

    // Wire up copy button (avoid inline JSON in onclick)
    const copyBtn = document.getElementById("copyJsonBtn");
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        navigator.clipboard
          .writeText(JSON.stringify(result.importedProducts, null, 2))
          .then(() => (copyBtn.textContent = "✅ Copied!"));
      });
    }
  }

  function showStatus(message, type) {
    statusBar.textContent = message;
    statusBar.className = `status-bar ${type}`;
  }

  function setLoading(btn, loading) {
    btn.disabled = loading;
    btn.querySelector(".btn-text").style.display = loading ? "none" : "";
    btn.querySelector(".btn-loading").style.display = loading ? "" : "none";
  }

  function waitForTabLoad(tabId) {
    return new Promise((resolve) => {
      chrome.tabs.onUpdated.addListener(function listener(id, info) {
        if (id === tabId && info.status === "complete") {
          chrome.tabs.onUpdated.removeListener(listener);
          resolve();
        }
      });
    });
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function escapeHtml(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function escapeAttr(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
});
