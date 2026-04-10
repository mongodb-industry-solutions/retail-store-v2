// Content script for Amazon product detail pages — scrapes text, breadcrumbs, attributes (no images for LLM)

(function () {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "scrapeProductDetail") {
      try {
        const detail = scrapeProductDetailPage();
        sendResponse({ detail, error: null });
      } catch (e) {
        sendResponse({ detail: null, error: e.message || String(e) });
      }
    }
    return true;
  });

  function scrapeBreadcrumbs() {
    const ul =
      document.querySelector("#wayfinding-breadcrumbs_feature_div ul") ||
      document.querySelector("#wayfinding-breadcrumbs_container ul");
    if (!ul) return [];
    const out = [];
    ul.querySelectorAll("li").forEach((li) => {
      const link = li.querySelector("a.a-link-normal");
      const text = (link || li).textContent.replace(/\s+/g, " ").trim();
      if (text && !/^›$/.test(text)) out.push(text);
    });
    return out;
  }

  function scrapeFeatureBullets() {
    const root = document.querySelector("#feature-bullets");
    if (!root) return [];
    const items = [];
    root.querySelectorAll("li span.a-list-item").forEach((span) => {
      const t = span.textContent.replace(/\s+/g, " ").trim();
      if (t) items.push(t);
    });
    return items;
  }

  function scrapeProductDescription() {
    const el = document.querySelector("#productDescription_feature_div");
    if (!el) return "";
    return el.innerText.replace(/\s+\n/g, "\n").trim().slice(0, 20000);
  }

  function scrapeDetailAttributes() {
    const attrs = {};

    const tableSelectors = [
      "table.prodDetTable tr",
      "table#productDetails_techSpec_section_1 tr",
      "#productDetails_db_sections tr",
    ];
    for (const sel of tableSelectors) {
      document.querySelectorAll(sel).forEach((tr) => {
        const th = tr.querySelector("th");
        const td = tr.querySelector("td");
        if (th && td) {
          const k = th.textContent.replace(/\s+/g, " ").trim();
          const v = td.textContent.replace(/\s+/g, " ").trim();
          if (k && v && !attrs[k]) attrs[k] = v;
        }
      });
    }

    document.querySelectorAll("#detailBullets_feature_div ul li").forEach((li) => {
      const spans = li.querySelectorAll("span.a-text-bold, span:first-child");
      if (spans.length >= 2) {
        let k = spans[0].textContent.replace(/\s+/g, " ").replace(/:\s*$/, "").trim();
        let v = "";
        const rest = li.cloneNode(true);
        const first = rest.querySelector("span");
        if (first) first.remove();
        v = rest.textContent.replace(/\s+/g, " ").trim();
        if (k && v && !attrs[k]) attrs[k] = v;
      }
    });

    document.querySelectorAll("#productFactsDesktopExpander .a-fixed-left-grid-inner, #productFactsDesktop_feature_div tr").forEach((row) => {
      const label = row.querySelector(".a-span3, th");
      const value = row.querySelector(".a-span9, td");
      if (label && value) {
        const k = label.textContent.replace(/\s+/g, " ").trim();
        const v = value.textContent.replace(/\s+/g, " ").trim();
        if (k && v && !attrs[k]) attrs[k] = v;
      }
    });

    return attrs;
  }

  function scrapeLandingImageUrl() {
    const img =
      document.querySelector("#landingImage") ||
      document.querySelector("#imgTagWrapperId img") ||
      document.querySelector("#main-image");
    return img ? img.getAttribute("src") || img.src || "" : "";
  }

  function scrapeTitle() {
    const t = document.querySelector("#productTitle");
    return t ? t.textContent.replace(/\s+/g, " ").trim() : "";
  }

  function scrapeProductDetailPage() {
    return {
      amazonBreadcrumbs: scrapeBreadcrumbs(),
      amazonFeatureBullets: scrapeFeatureBullets(),
      amazonDescription: scrapeProductDescription(),
      amazonAttributes: scrapeDetailAttributes(),
      pdpTitle: scrapeTitle(),
      pdpImageUrl: scrapeLandingImageUrl(),
    };
  }
})();
