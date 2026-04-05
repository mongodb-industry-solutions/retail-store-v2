// Content script injected on Amazon search result pages
// Scrapes product data from the DOM and sends it back via Chrome messaging

(function () {
  // Listen for scrape requests from the popup/background
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "scrapeProducts") {
      const limit = message.limit || 10;
      const products = scrapeAmazonResults(limit);
      sendResponse({ products });
    }
    return true; // keep channel open for async response
  });

  function scrapeAmazonResults(limit) {
    const products = [];
    // Amazon search results are in [data-component-type="s-search-result"] divs
    const resultCards = document.querySelectorAll(
      '[data-component-type="s-search-result"]'
    );

    for (let i = 0; i < Math.min(resultCards.length, limit); i++) {
      const card = resultCards[i];
      try {
        const product = extractProductFromCard(card);
        if (product && product.title && product.asin) {
          products.push(product);
        }
      } catch (e) {
        console.warn("Failed to parse product card:", e);
      }
    }

    return products;
  }

  function extractProductFromCard(card) {
    const asin = card.getAttribute("data-asin");
    if (!asin) return null;

    // Title — get the main product name, avoiding sponsored labels
    let title = "";
    const h2El = card.querySelector("h2");
    if (h2El) {
      // Get only the text from the anchor's span inside h2
      const h2Link = h2El.querySelector("a");
      if (h2Link) {
        // Get all spans inside the link and join their text
        const spans = h2Link.querySelectorAll("span");
        if (spans.length > 0) {
          // Use the last span or the longest span (the actual title)
          let bestSpan = "";
          spans.forEach((s) => {
            const text = s.textContent.trim();
            if (text.length > bestSpan.length) bestSpan = text;
          });
          title = bestSpan;
        } else {
          title = h2Link.textContent.trim();
        }
      } else {
        title = h2El.textContent.trim();
      }
    }
    // Clean up: remove "Sponsored" prefix and "Featured from Amazon brands" noise
    title = title
      .replace(/^Sponsored\s*/gi, "")
      .replace(/^Featured from Amazon brands\s*/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    // Price — get the first non-"List:" price
    let price = null;
    const priceEls = card.querySelectorAll(".a-price");
    for (const priceEl of priceEls) {
      // Skip "List:" prices (original/strikethrough prices)
      const prevText = priceEl.previousElementSibling?.textContent || "";
      if (prevText.toLowerCase().includes("list")) continue;
      // Skip prices with a-text-price class (strikethrough)
      if (priceEl.closest(".a-text-price")) continue;

      const wholeEl = priceEl.querySelector(".a-price-whole");
      const fractionEl = priceEl.querySelector(".a-price-fraction");
      if (wholeEl) {
        const whole = wholeEl.textContent.replace(/[^0-9]/g, "");
        const fraction = fractionEl
          ? fractionEl.textContent.replace(/[^0-9]/g, "")
          : "00";
        price = parseFloat(`${whole}.${fraction}`);
        break;
      }
    }

    // Image
    const imgEl = card.querySelector("img.s-image");
    const imageUrl = imgEl ? imgEl.getAttribute("src") : "";

    // Brand — multiple strategies
    let brand = "";
    // Strategy 1: Look for "by BRAND" text
    const byLine = card.querySelector(".a-row .a-size-base.a-color-secondary");
    if (byLine) {
      brand = byLine.textContent.trim()
        .replace(/^by\s+/i, "")
        .replace(/Visit the\s+/i, "")
        .replace(/\s+Store$/i, "")
        .replace(/^Sponsored\s*/gi, "");
    }
    // Strategy 2: Look for a bold brand-like element above or near the title
    if (!brand || brand === "Sponsored" || brand.length < 2) {
      const brandEl2 = card.querySelector(".a-size-base-plus.a-color-base");
      if (brandEl2) {
        brand = brandEl2.textContent.trim().replace(/^Sponsored\s*/gi, "");
      }
    }
    // Strategy 3: Extract brand from title (first word/phrase before the main description)
    if (!brand || brand === "Sponsored" || brand.length < 2) {
      // Try to get brand from the beginning of the title
      const titleParts = title.split(/\s+/);
      if (titleParts.length > 2) {
        // Common pattern: "BrandName Product Description..."
        brand = titleParts[0];
      }
    }
    // Clean brand
    brand = (brand || "").replace(/^Sponsored\s*/gi, "").trim();

    // Rating
    const ratingEl = card.querySelector(".a-icon-star-small .a-icon-alt, .a-icon-star .a-icon-alt");
    let rating = null;
    if (ratingEl) {
      const ratingMatch = ratingEl.textContent.match(/([\d.]+)/);
      if (ratingMatch) rating = parseFloat(ratingMatch[1]);
    }

    // Review count
    const reviewEl = card.querySelector('[data-csa-c-content-id="alf-customer-ratings-count-component"] .a-size-base, .a-size-base.s-underline-text');
    let reviewCount = null;
    if (reviewEl) {
      const countMatch = reviewEl.textContent.replace(/,/g, "").match(/(\d+)/);
      if (countMatch) reviewCount = parseInt(countMatch[1]);
    }

    // Product URL
    const linkEl = card.querySelector("h2 a");
    let productUrl = "";
    if (linkEl) {
      const href = linkEl.getAttribute("href");
      productUrl = href.startsWith("http")
        ? href
        : `https://www.amazon.com${href}`;
    }

    // Category breadcrumb (from Amazon's department refinement)
    let category = "";
    const breadcrumbEl = document.querySelector(
      ".a-color-state.a-text-bold, .s-desktop-width-max .a-size-base.a-link-normal"
    );
    if (breadcrumbEl) {
      category = breadcrumbEl.textContent.trim();
    }

    // Description snippet (sometimes visible in search results)
    let descriptionSnippet = "";
    const descEl = card.querySelector(".a-size-base-plus.a-color-base.a-text-normal");
    if (descEl) {
      descriptionSnippet = descEl.textContent.trim();
    }

    // Color info (sometimes in variant labels)
    let color = "";
    const colorEl = card.querySelector(".a-color-base .a-text-bold");
    if (colorEl && colorEl.textContent.toLowerCase().includes("color")) {
      const colorVal = colorEl.nextSibling;
      if (colorVal) color = colorVal.textContent.trim();
    }

    // Skip items that are clearly not real products (no title or just "Sponsored")
    if (!title || title.toLowerCase() === "sponsored") return null;

    return {
      asin,
      title,
      price,
      imageUrl: imageUrl,
      brand,
      rating,
      reviewCount,
      productUrl,
      category,
      color,
      descriptionSnippet,
    };
  }
})();
