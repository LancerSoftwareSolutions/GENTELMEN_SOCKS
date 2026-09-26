const year = document.querySelector("#year");

if (year) {
  year.textContent = new Date().getFullYear();
}

const products = [...document.querySelectorAll(".store-product")].map((card, index) => {
  const name = card.querySelector(".product-details strong")?.textContent.trim() || `Product ${String(index + 1).padStart(2, "0")}`;
  const detail = card.querySelector(".product-details div span")?.textContent.trim() || "Premium socks";
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const entry = { id, name, detail, card, searchText: name };
  card.dataset.productId = id;
  card.dataset.productName = name;

  const addButton = document.createElement("button");
  addButton.type = "button";
  addButton.className = "add-to-cart";
  addButton.dataset.addToCart = id;
  addButton.setAttribute("aria-label", `Add ${name} to cart`);
  addButton.innerHTML = 'ADD TO CART <span aria-hidden="true">+</span>';
  card.append(addButton);
  return entry;
});

const searchDialog = document.querySelector("#search-dialog");
const searchInput = document.querySelector("#search-input");
const searchStatus = document.querySelector("#search-status");
const searchResults = document.querySelector("#search-results");
const cartDialog = document.querySelector("#cart-dialog");
const cartItems = document.querySelector("#cart-items");
const cartEmpty = document.querySelector("#cart-empty");
const cartBottom = document.querySelector("#cart-bottom");
const cartCount = document.querySelector("#cart-count");
const cartTitleCount = document.querySelector("#cart-title-count");
const checkoutLink = document.querySelector("#checkout-link");
const cartStorageKey = "gentelman-socks-cart-v1";

function readCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(cartStorageKey) || "[]");
    return saved.filter(item => products.some(product => product.id === item.id) && Number.isInteger(item.quantity) && item.quantity > 0);
  } catch {
    return [];
  }
}

let cart = readCart();
const fuse = typeof Fuse === "function" ? new Fuse(products, {
  keys: ["name"],
  threshold: 0.28,
  ignoreLocation: true,
  minMatchCharLength: 2,
  includeScore: true
}) : null;

function editDistance(left, right) {
  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let row = 1; row <= left.length; row += 1) {
    const current = [row];
    for (let column = 1; column <= right.length; column += 1) {
      current[column] = Math.min(
        current[column - 1] + 1,
        previous[column] + 1,
        previous[column - 1] + (left[row - 1] === right[column - 1] ? 0 : 1)
      );
    }
    previous = current;
  }
  return previous[right.length];
}

function fallbackSearch(query) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return products.map(product => {
    const words = product.searchText.toLowerCase().split(/\s+/);
    const score = terms.reduce((total, term) => {
      const closest = Math.min(...words.map(word => word.includes(term) || term.includes(word)
        ? 0.08
        : editDistance(term, word) / Math.max(term.length, word.length)));
      return total + closest;
    }, 0) / Math.max(terms.length, 1);
    return { item: product, score };
  }).filter(result => result.score <= 0.48).sort((left, right) => left.score - right.score);
}

function renderSearchResults() {
  const query = searchInput.value.trim();
  searchResults.replaceChildren();
  if (!query) {
    searchStatus.textContent = "Start typing to search available products.";
    return;
  }
  if (query.length < 2) {
    searchStatus.textContent = "Enter at least two characters.";
    return;
  }

  const matches = fuse ? fuse.search(query).map(result => result.item) : fallbackSearch(query).map(result => result.item);
  if (!matches.length) {
    searchStatus.textContent = `No products found for “${query}”.`;
    return;
  }
  searchStatus.textContent = `${matches.length} ${matches.length === 1 ? "product" : "products"} found`;

  matches.forEach(product => {
    const row = document.createElement("div");
    row.className = "search-result";
    const marker = document.createElement("span");
    marker.className = "search-result-marker";
    marker.textContent = product.name.match(/\d+/)?.[0] || "GS";
    const copy = document.createElement("span");
    copy.className = "search-result-copy";
    const title = document.createElement("strong");
    title.textContent = product.name;
    const description = document.createElement("small");
    description.textContent = product.detail;
    copy.append(title, description);
    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.className = "result-add";
    addButton.dataset.addToCart = product.id;
    addButton.textContent = "ADD";
    row.append(marker, copy, addButton);
    searchResults.append(row);
  });
}

function saveCart() {
  localStorage.setItem(cartStorageKey, JSON.stringify(cart));
}

function renderCart() {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  cartCount.textContent = String(count);
  cartCount.hidden = count === 0;
  cartTitleCount.textContent = `(${count})`;
  cartItems.replaceChildren();
  cartEmpty.hidden = count > 0;
  cartBottom.hidden = count === 0;

  cart.forEach(item => {
    const product = products.find(entry => entry.id === item.id);
    if (!product) return;
    const row = document.createElement("article");
    row.className = "cart-item";
    const marker = document.createElement("span");
    marker.className = "cart-item-marker";
    marker.textContent = product.name.match(/\d+/)?.[0] || "GS";
    const details = document.createElement("div");
    details.className = "cart-item-details";
    const title = document.createElement("strong");
    title.textContent = product.name;
    const price = document.createElement("span");
    price.textContent = "Price confirmed by message";
    details.append(title, price);
    const controls = document.createElement("div");
    controls.className = "quantity-controls";
    controls.innerHTML = `<button type="button" data-cart-action="decrease" data-product-id="${item.id}" aria-label="Decrease ${product.name} quantity">−</button><span>${item.quantity}</span><button type="button" data-cart-action="increase" data-product-id="${item.id}" aria-label="Increase ${product.name} quantity">+</button>`;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "remove-item";
    remove.dataset.cartAction = "remove";
    remove.dataset.productId = item.id;
    remove.textContent = "REMOVE";
    row.append(marker, details, controls, remove);
    cartItems.append(row);
  });

  const orderLines = cart.map(item => {
    const product = products.find(entry => entry.id === item.id);
    return product ? `- ${product.name} x ${item.quantity}` : null;
  }).filter(Boolean);
  const message = `Hi, I would like to confirm availability and pricing for:\n${orderLines.join("\n")}`;
  checkoutLink.href = `https://wa.me/96171603086?text=${encodeURIComponent(message)}`;
}

document.querySelector("#open-search").addEventListener("click", () => {
  searchDialog.showModal();
  renderSearchResults();
  requestAnimationFrame(() => searchInput.focus());
});

document.querySelector("#open-cart").addEventListener("click", () => {
  renderCart();
  cartDialog.showModal();
});

searchInput.addEventListener("input", renderSearchResults);
document.querySelectorAll("[data-close-dialog]").forEach(button => {
  button.addEventListener("click", () => button.closest("dialog").close());
});
document.querySelector("#continue-shopping").addEventListener("click", () => cartDialog.close());

document.querySelectorAll("dialog").forEach(dialog => {
  dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
  });
});

document.addEventListener("click", event => {
  const addButton = event.target.closest("[data-add-to-cart]");
  if (addButton) {
    const existing = cart.find(item => item.id === addButton.dataset.addToCart);
    if (existing) existing.quantity += 1;
    else cart.push({ id: addButton.dataset.addToCart, quantity: 1 });
    saveCart();
    renderCart();
    addButton.classList.add("is-added");
    addButton.setAttribute("aria-label", "Added to cart");
    window.setTimeout(() => {
      addButton.classList.remove("is-added");
      addButton.setAttribute("aria-label", `Add ${products.find(product => product.id === addButton.dataset.addToCart)?.name || "product"} to cart`);
    }, 900);
    return;
  }

  const control = event.target.closest("[data-cart-action]");
  if (!control) return;
  const item = cart.find(entry => entry.id === control.dataset.productId);
  if (!item) return;
  if (control.dataset.cartAction === "increase") item.quantity += 1;
  if (control.dataset.cartAction === "decrease") item.quantity -= 1;
  if (control.dataset.cartAction === "remove" || item.quantity < 1) cart = cart.filter(entry => entry.id !== item.id);
  saveCart();
  renderCart();
});

renderCart();