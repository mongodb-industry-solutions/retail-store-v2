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

  const bulkStartBtn = document.getElementById("bulkStartBtn");
  const bulkPauseBtn = document.getElementById("bulkPauseBtn");
  const bulkResumeBtn = document.getElementById("bulkResumeBtn");
  const bulkCancelBtn = document.getElementById("bulkCancelBtn");
  const bulkResetBtn = document.getElementById("bulkResetBtn");
  const bulkItemsPerSearch = document.getElementById("bulkItemsPerSearch");
  const bulkDelayPdpMs = document.getElementById("bulkDelayPdpMs");
  const bulkDelaySearchMs = document.getElementById("bulkDelaySearchMs");
  const bulkProgressLine = document.getElementById("bulkProgressLine");
  const bulkLogEl = document.getElementById("bulkLog");

  const BULK_STORAGE_KEY = "bulkSeedStateV1";

  let scrapedProducts = [];
  let bulkRunnerActive = false;

  // Persist store URL in chrome.storage
  chrome.storage.local.get(["storeUrl"], (result) => {
    if (result.storeUrl) storeUrlEl.value = result.storeUrl;
  });
  storeUrlEl.addEventListener("change", () => {
    chrome.storage.local.set({ storeUrl: storeUrlEl.value });
  });

  bulkPauseBtn.addEventListener("click", async () => {
    await chrome.storage.local.set({
      [BULK_STORAGE_KEY]: { ...(await getBulkState()), paused: true },
    });
    bulkLog("Paused.");
  });

  bulkResumeBtn.addEventListener("click", async () => {
    const st = await getBulkState();
    await chrome.storage.local.set({ [BULK_STORAGE_KEY]: { ...st, paused: false } });
    bulkResumeBtn.disabled = true;
    bulkPauseBtn.disabled = false;
    bulkLog("Resumed.");
  });

  bulkCancelBtn.addEventListener("click", async () => {
    await chrome.storage.local.set({ bulkSeedCancelled: true });
    bulkLog("Cancel requested — will stop after current step.");
  });

  bulkResetBtn.addEventListener("click", async () => {
    await chrome.storage.local.set({
      [BULK_STORAGE_KEY]: {
        searchIndex: 0,
        paused: false,
        running: false,
        totals: { imported: 0, skipped: 0, errors: 0 },
      },
      bulkSeedCancelled: false,
    });
    bulkProgressLine.textContent = "";
    bulkLogEl.textContent = "";
    bulkLog("Progress reset.");
  });

  bulkStartBtn.addEventListener("click", async () => {
    if (bulkRunnerActive) return;
    let searches;
    try {
      const res = await fetch(chrome.runtime.getURL("seedSearches.json"));
      const data = await res.json();
      searches = data.searches;
    } catch (e) {
      showStatus("Could not load seedSearches.json: " + e.message, "error");
      return;
    }
    if (!searches || !searches.length) {
      showStatus("seedSearches.json is empty.", "error");
      return;
    }

    const storeUrl = storeUrlEl.value.replace(/\/+$/, "");
    if (!storeUrl) {
      showStatus("Set Store API URL first.", "error");
      return;
    }

    const itemsPerSearch = Math.min(48, Math.max(1, parseInt(bulkItemsPerSearch.value, 10) || 10));
    const delayPdp = Math.max(0, parseInt(bulkDelayPdpMs.value, 10) || 2000);
    const delaySearch = Math.max(0, parseInt(bulkDelaySearchMs.value, 10) || 3000);

    await chrome.storage.local.set({ bulkSeedCancelled: false });
    let st = await getBulkState();
    if (st.searchIndex >= searches.length) {
      st = { searchIndex: 0, paused: false, running: true, totals: { imported: 0, skipped: 0, errors: 0 } };
    } else {
      st = { ...st, paused: false, running: true };
    }
    await chrome.storage.local.set({ [BULK_STORAGE_KEY]: st });

    bulkRunnerActive = true;
    bulkStartBtn.disabled = true;
    bulkPauseBtn.disabled = false;
    bulkResumeBtn.disabled = true;
    bulkCancelBtn.disabled = false;
    emptyState.style.display = "none";
    bulkLog(`Starting bulk run (${searches.length} searches, ${itemsPerSearch} ASINs each, raw import)...`);

    try {
      await runBulkSeedLoop({
        searches,
        itemsPerSearch,
        delayPdp,
        delaySearch,
        storeUrl,
      });
    } catch (e) {
      bulkLog("Fatal: " + e.message);
      showStatus("Bulk run error: " + e.message, "error");
    } finally {
      bulkRunnerActive = false;
      bulkStartBtn.disabled = false;
      bulkPauseBtn.disabled = true;
      bulkResumeBtn.disabled = true;
      bulkCancelBtn.disabled = true;
      const final = await getBulkState();
      await chrome.storage.local.set({
        [BULK_STORAGE_KEY]: { ...final, running: false, paused: false },
      });
      showStatus("Bulk run finished.", "success");
    }
  });

  chrome.storage.local.get([BULK_STORAGE_KEY], (r) => {
    const st = r[BULK_STORAGE_KEY];
    if (st && st.running) {
      bulkProgressLine.textContent =
        "Last session was interrupted. Use Start to continue from saved index, or Reset.";
    }
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
      enrichmentHtml = `<div style="margin:8px 0; display:flex; flex-wrap:wrap; gap:8px;">
        <span style="padding:3px 10px; border-radius:12px; font-size:11px; font-weight:600; ${result.enrichment.aiDescriptions ? "background:#e8f5e9; color:#2e7d32;" : "background:#fff3e0; color:#e65100;"}">${result.enrichment.aiDescriptions ? "✅ AI Descriptions" : "⚠️ No AI (add ANTHROPIC_API_KEY)"}</span>
        <span style="padding:3px 10px; border-radius:12px; font-size:11px; font-weight:600; ${result.enrichment.embeddings ? "background:#e8f5e9; color:#2e7d32;" : "background:#fff3e0; color:#e65100;"}">${result.enrichment.embeddings ? "✅ Embeddings" : "⚠️ No Embeddings (add VOYAGE_AI_API_KEY)"}</span>
      </div>`;
      if (result.enrichment.note) {
        enrichmentHtml += `<p style="font-size:12px;color:#555;margin-top:6px;">${escapeHtml(result.enrichment.note)}</p>`;
      }
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
            "amazonImports",
            "amazonBreadcrumbs", "amazonBreadcrumbPath", "amazonAttributes", "amazonFeatureBullets",
            "rawAmazonDescription", "enrichmentStatus", "amazonPdpScrapeError", "amazonTextEnrichedAt",
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
                  <span style="padding:2px 8px; background:#efebe9; color:#4e342e; border-radius:10px; font-family:monospace;">ASIN: ${escapeHtml(p.amazonImports?.amazonAsin || p.amazonAsin || "")}</span>
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

  async function getBulkState() {
    const r = await chrome.storage.local.get([BULK_STORAGE_KEY]);
    const d = r[BULK_STORAGE_KEY];
    return {
      searchIndex: typeof d?.searchIndex === "number" ? d.searchIndex : 0,
      paused: !!d?.paused,
      running: !!d?.running,
      totals: d?.totals || { imported: 0, skipped: 0, errors: 0 },
    };
  }

  function bulkLog(line) {
    const ts = new Date().toISOString().slice(11, 19);
    bulkLogEl.textContent += `[${ts}] ${line}\n`;
    bulkLogEl.scrollTop = bulkLogEl.scrollHeight;
  }

  async function waitUnlessPaused() {
    while (true) {
      const cancel = await chrome.storage.local.get(["bulkSeedCancelled"]);
      if (cancel.bulkSeedCancelled) return false;
      const st = await getBulkState();
      if (!st.paused) return true;
      await sleep(400);
    }
  }

  function mergeSearchAndPdp(card, detail, detailError) {
    const d = detail || {};
    return {
      ...card,
      title: d.pdpTitle || card.title,
      imageUrl: d.pdpImageUrl || card.imageUrl,
      amazonBreadcrumbs: d.amazonBreadcrumbs || [],
      amazonFeatureBullets: d.amazonFeatureBullets || [],
      amazonDescription: d.amazonDescription || "",
      amazonAttributes: d.amazonAttributes && typeof d.amazonAttributes === "object" ? d.amazonAttributes : {},
      pdpScrapeError: detailError || null,
    };
  }

  async function runBulkSeedLoop({ searches, itemsPerSearch, delayPdp, delaySearch, storeUrl }) {
    let st = await getBulkState();

    for (let si = st.searchIndex; si < searches.length; si++) {
      if (!(await waitUnlessPaused())) {
        bulkLog("Cancelled.");
        await chrome.storage.local.set({ [BULK_STORAGE_KEY]: { ...st, searchIndex: si } });
        return;
      }

      const query = searches[si];
      bulkProgressLine.textContent = `Search ${si + 1}/${searches.length}: ${query.slice(0, 60)}…`;
      bulkLog(`Search ${si + 1}/${searches.length}: ${query}`);

      const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
      const searchTab = await chrome.tabs.create({ url: searchUrl, active: false });
      await waitForTabLoad(searchTab.id);
      await sleep(Math.max(delaySearch, 1500));

      await chrome.scripting.executeScript({
        target: { tabId: searchTab.id },
        files: ["content.js"],
      });

      let searchRes;
      try {
        searchRes = await chrome.tabs.sendMessage(searchTab.id, {
          action: "scrapeProducts",
          limit: itemsPerSearch,
        });
      } catch (e) {
        bulkLog(`Search scrape failed: ${e.message}`);
        st.totals.errors++;
        try {
          chrome.tabs.remove(searchTab.id);
        } catch (_) {}
        await chrome.storage.local.set({
          [BULK_STORAGE_KEY]: { ...st, searchIndex: si + 1 },
        });
        continue;
      }

      try {
        chrome.tabs.remove(searchTab.id);
      } catch (_) {}

      const cards = searchRes.products || [];
      if (cards.length === 0) {
        bulkLog("No results for this query.");
        await chrome.storage.local.set({
          [BULK_STORAGE_KEY]: { ...st, searchIndex: si + 1 },
        });
        st.searchIndex = si + 1;
        await sleep(delaySearch);
        continue;
      }

      const merged = [];
      for (let ci = 0; ci < cards.length; ci++) {
        if (!(await waitUnlessPaused())) {
          await chrome.storage.local.set({
            [BULK_STORAGE_KEY]: { ...st, searchIndex: si },
          });
          bulkLog("Cancelled.");
          return;
        }

        const card = cards[ci];
        if (!card.asin) continue;

        const dpTab = await chrome.tabs.create({
          url: `https://www.amazon.com/dp/${encodeURIComponent(card.asin)}`,
          active: false,
        });
        await waitForTabLoad(dpTab.id);
        await sleep(Math.max(delayPdp, 1000));

        await chrome.scripting.executeScript({
          target: { tabId: dpTab.id },
          files: ["content-pdp.js"],
        });

        let detail = null;
        let err = null;
        try {
          const r = await chrome.tabs.sendMessage(dpTab.id, { action: "scrapeProductDetail" });
          detail = r.detail;
          err = r.error;
        } catch (e) {
          err = e.message;
        }

        try {
          chrome.tabs.remove(dpTab.id);
        } catch (_) {}

        merged.push(mergeSearchAndPdp(card, detail, err));
        bulkLog(`  ASIN ${card.asin} PDP ${err ? "partial (" + err + ")" : "ok"}`);
        await sleep(delayPdp);
      }

      if (merged.length === 0) {
        await chrome.storage.local.set({
          [BULK_STORAGE_KEY]: { ...st, searchIndex: si + 1 },
        });
        st.searchIndex = si + 1;
        await sleep(delaySearch);
        continue;
      }

      try {
        const response = await fetch(`${storeUrl}/api/amazon/import`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: "raw", products: merged }),
        });
        const text = await response.text();
        if (!response.ok) {
          bulkLog(`API error ${response.status}: ${text.slice(0, 200)}`);
          st.totals.errors++;
        } else {
          const result = JSON.parse(text);
          st.totals.imported += result.imported || 0;
          st.totals.skipped += result.skipped || 0;
          bulkLog(
            `  Posted: imported ${result.imported}, skipped ${result.skipped} (totals: +${st.totals.imported} / skip ${st.totals.skipped})`
          );
        }
      } catch (e) {
        bulkLog(`Fetch failed: ${e.message}`);
        st.totals.errors++;
      }

      st.searchIndex = si + 1;
      await chrome.storage.local.set({ [BULK_STORAGE_KEY]: { ...st, searchIndex: si + 1 } });
      await sleep(delaySearch);
    }

    bulkProgressLine.textContent = `Done. Imported ~${st.totals.imported}, skipped ${st.totals.skipped}, errors ${st.totals.errors}`;
    bulkLog("All searches complete. Run pass 2: npm run enrich:amazon-text in microservices/productEmbeddings");
  }
});
