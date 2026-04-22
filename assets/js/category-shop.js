(function () {
  "use strict";

  const config = window.categoryPageConfig;

  if (!config) {
    return;
  }

  const state = {
    search: "",
    filter: "Todos"
  };

  const elements = {
    title: document.querySelector("[data-category-title]"),
    description: document.querySelector("[data-category-description]"),
    kicker: document.querySelector("[data-category-kicker]"),
    breadcrumb: document.querySelector("[data-category-breadcrumb]"),
    search: document.querySelector("[data-product-search]"),
    filters: document.querySelector("[data-category-filters]"),
    grid: document.querySelector("[data-product-grid]"),
    counter: document.querySelector("[data-product-count]"),
    adminMessage: document.querySelector("[data-admin-message]")
  };

  const products = Array.isArray(config.products) ? config.products : [];
  const availableFilters = ["Todos"].concat(
    [...new Set(products.flatMap((product) => product.tags || []))]
  );

  function setPageCopy() {
    if (elements.title) elements.title.textContent = config.title || "Categoría";
    if (elements.description) elements.description.textContent = config.description || "";
    if (elements.kicker) elements.kicker.textContent = config.kicker || "Catálogo Tecno Acces";
    if (elements.breadcrumb) elements.breadcrumb.textContent = config.title || "Categoría";
    if (elements.adminMessage) {
      elements.adminMessage.textContent = config.adminMessage || "Editá el arreglo de productos para cargar nuevos artículos.";
    }
    document.title = `${config.title || "Categoría"} | Tecno Acces`;
  }

  function buildWhatsAppUrl(productName) {
    const phone = config.whatsappNumber || "5493624216834";
    const message = encodeURIComponent(
      `Hola, quiero consultar por ${productName} en la categoría ${config.title}.`
    );
    return `https://wa.me/${phone}?text=${message}`;
  }

  function productMatches(product) {
    const haystack = [
      product.name,
      product.description,
      product.sku,
      ...(product.tags || [])
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = haystack.includes(state.search);
    const matchesFilter =
      state.filter === "Todos" || (product.tags || []).includes(state.filter);

    return matchesSearch && matchesFilter;
  }

  function renderFilters() {
    if (!elements.filters) return;

    elements.filters.innerHTML = availableFilters
      .map(
        (filter) => `
          <button type="button" class="category-filter${filter === state.filter ? " active" : ""}" data-filter="${filter}">
            ${filter}
          </button>
        `
      )
      .join("");

    elements.filters.querySelectorAll("[data-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        state.filter = button.dataset.filter || "Todos";
        renderFilters();
        renderProducts();
      });
    });
  }

  function renderProducts() {
    if (!elements.grid) return;

    const visibleProducts = products.filter(productMatches);

    if (elements.counter) {
      elements.counter.textContent = `${visibleProducts.length} producto(s) disponibles`;
    }

    if (!visibleProducts.length) {
      elements.grid.innerHTML = `
        <div class="col-12">
          <div class="empty-products">
            <i class="bi bi-search"></i>
            <h3>No encontramos productos con ese criterio</h3>
            <p>Probá con otra búsqueda o quitá el filtro para ver todo el catálogo.</p>
          </div>
        </div>
      `;
      return;
    }

    elements.grid.innerHTML = visibleProducts
      .map(
        (product, index) => `
          <div class="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="${100 + index * 50}">
            <article class="product-card">
              <div class="product-media">
                <img src="${product.image || config.fallbackImage || "assets/img/hero.webp"}" alt="${product.name}">
                ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ""}
              </div>
              <div class="product-body">
                <div class="product-meta">
                  <span class="product-price">${product.price || "Consultar"}</span>
                  <span class="product-sku">${product.sku || ""}</span>
                </div>
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description || ""}</p>
                <div class="product-tags">
                  ${(product.tags || []).map((tag) => `<span>${tag}</span>`).join("")}
                </div>
                <div class="product-actions">
                  <a class="btn btn-primary" href="${buildWhatsAppUrl(product.name)}" target="_blank" rel="noopener noreferrer">Consultar</a>
                  <a class="btn btn-outline-primary" href="index.html#portfolio">Ver categorías</a>
                </div>
              </div>
            </article>
          </div>
        `
      )
      .join("");

    if (window.AOS) {
      window.AOS.refreshHard();
    }
  }

  if (elements.search) {
    elements.search.addEventListener("input", (event) => {
      state.search = event.target.value.trim().toLowerCase();
      renderProducts();
    });
  }

  setPageCopy();
  renderFilters();
  renderProducts();
})();
