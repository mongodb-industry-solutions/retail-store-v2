// Popup script — handles UI logic, triggers search & import

document.addEventListener("DOMContentLoaded", () => {
  const searchQueryEl = document.getElementById("searchQuery");
  const resultCountEl = document.getElementById("resultCount");
  const searchBtn = document.getElementById("searchBtn");
  const storeUrlEl = document.getElementById("storeUrl");
  const statusBar = document.getElementById("statusBar");
  const resultsSection = document.getElementById("resultsSection");
  const resultsCountEl = document.getElementById("resultsCount");
  const productList = document.getElementById("productList");
  const importBtn = document.getElementById("importBtn");
  const selectAllBtn = document.getElementById("selectAllBtn");
  const deselectAllBtn = document.getElementById("deselectAllBtn");
  const importResults = document.getElementById("importResults");

  let scrapedProducts = [];
  let amazonTabId = null;

  // Persist store URL
  chrome.storage?.local?.get(["storeUrl"], (result) => {
    if (result.storeUrl) storeUrlEl.value = result.storeUrl;
  });
  storeUrlEl.addEventListener("change", () => {
    chrome.storage?.local?.set({ storeUrl: storeUrlEl.value });
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
    showStatus("Opening Amazon search...", "info");
    importResults.style.display = "none";

    try {
      // Step 1: Open Amazon search tab
      const openResult = await sendMessage({
        action: "openAmazonSearch",
        query,
      });

      if (!openResult || !openResult.tabId) {
        throw new Error("Failed to open Amazon search tab");
      }

      amazonTabId = openResult.tabId;
      showStatus("Scraping product results...", "info");

      // Step 2: Scrape the results from that tab
      const scrapeResult = await sendMessage({
        action: "scrapeTab",
        tabId: amazonTabId,
        limit,
      });

      if (scrapeResult.error) {
        throw new Error(scrapeResult.error);
      }

      scrapedProducts = scrapeResult.products || [];

      if (scrapedProducts.length === 0) {
        showStatus(
          "No products found. Amazon may have changed their layout, or the search returned no results.",
          "error"
        );
        resultsSection.style.display = "none";
      } else {
        showStatus(
          `Found ${scrapedProducts.length} product(s). Select which to import.`,
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
  selectAllBtn.addEventListener("click", () => toggleAll(true));
  deselectAllBtn.addEventListener("click", () => toggleAll(false));

  function toggleAll(checked) {
    productList.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      cb.checked = checked;
      cb.closest(".product-item").classList.toggle("selected", checked);
    });
  }

  // ─── Import ────────────────────────────────────────────────────────────
  importBtn.addEventListener("click", async () => {
    const selected = getSelectedProducts();
    if (selected.length === 0) {
      showStatus("No products selected for import.", "error");
      return;
    }

    const storeUrl = storeUrlEl.value.replace(/\/+$/, "");
    setLoading(importBtn, true);
    showStatus(`Importing ${selected.length} product(s)...`, "info");

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
      showStatus("Import complete!", "success");
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
    productList.innerHTML = "";

    products.forEach((p, i) => {
      const item = document.createElement("div");
      item.className = "product-item selected";
      item.innerHTML = `
        <input type="checkbox" checked data-index="${i}">
        <img src="${p.imageUrl || ""}" alt="" onerror="this.src='icons/icon48.png'">
        <div class="product-info">
          <div class="product-title" title="${escapeHtml(p.title)}">${escapeHtml(p.title)}</div>
          <div class="product-meta">
            ${p.price != null ? `<span class="product-price">$${p.price.toFixed(2)}</span>` : '<span class="product-price">No price</span>'}
            ${p.brand ? `<span class="product-brand">${escapeHtml(p.brand)}</span>` : ""}
            ${p.rating ? `<span class="product-rating">★ ${p.rating}</span>` : ""}
          </div>
        </div>
      `;

      const checkbox = item.querySelector("input");
      checkbox.addEventListener("change", () => {
        item.classList.toggle("selected", checkbox.checked);
      });
      item.addEventListener("click", (e) => {
        if (e.target.tagName !== "INPUT") {
          checkbox.checked = !checkbox.checked;
          item.classList.toggle("selected", checkbox.checked);
        }
      });

      productList.appendChild(item);
    });
  }

  function getSelectedProducts() {
    const selected = [];
    productList.querySelectorAll('input[type="checkbox"]:checked').forEach((cb) => {
      const idx = parseInt(cb.dataset.index);
      if (scrapedProducts[idx]) selected.push(scrapedProducts[idx]);
    });
    return selected;
  }

  function showImportResults(result) {
    importResults.style.display = "block";
    importResults.innerHTML = `
      <h3>Import Results</h3>
      <div class="stat"><strong>${result.imported || 0}</strong> product(s) imported</div>
      <div class="stat"><strong>${result.skipped || 0}</strong> product(s) skipped (already in store)</div>
      <div class="stat"><strong>${result.total || 0}</strong> total submitted</div>
    `;
  }

  function showStatus(message, type) {
    statusBar.textContent = message;
    statusBar.className = `status-bar ${type}`;
    statusBar.style.display = "block";
  }

  function setLoading(btn, loading) {
    btn.disabled = loading;
    btn.querySelector(".btn-text").style.display = loading ? "none" : "";
    btn.querySelector(".btn-loading").style.display = loading ? "" : "none";
  }

  function sendMessage(message) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
});
