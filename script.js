const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();

const stock = [
  ["nike-black", "Nike Black Socks", "Nike", "Nike/nike-black.png", 2.99],
  ["nike-elite-blue", "Nike Elite Blue Socks", "Nike", "Nike/elite.png", 2.99],
  ["nike-elite-black", "Nike Elite Black Socks", "Nike", "Nike/elite-black.png", 2.99],
  ["nike-elite-red", "Nike Elite Red Socks", "Nike", "Nike/elite-red.png", 2.99],
  ["nike-elite-white", "Nike Elite White Socks", "Nike", "Nike/elite-white.png", 2.99],
  ["nike-mix-black", "Nike Mix Black", "Nike", "Nike/mix-black.png", 2.99],
  ["nike-mix-blue", "Nike Mix Blue", "Nike", "Nike/mix-blue.png", 2.99],
  ["nike-mix-blue-white", "Nike Mix Blue / White", "Nike", "Nike/mix-blue-white.png", 2.99],
  ["nike-mix-gray", "Nike Mix Gray", "Nike", "Nike/mix-gray.png", 2.99],
  ["nike-mix-green", "Nike Mix Green", "Nike", "Nike/mix-green.png", 2.99],
  ["nike-mix-orange", "Nike Mix Orange", "Nike", "Nike/mix-orange.png", 2.99],
  ["nike-mix-purple", "Nike Mix Purple", "Nike", "Nike/mix-purple.png", 2.99],
  ["nike-mix-purple-pink", "Nike Mix Purple / Pink", "Nike", "Nike/mix-purple-pink.png", 2.99],
  ["nike-mix-rose", "Nike Mix Rose", "Nike", "Nike/mix-rose.png", 2.99],
  ["nike-mix-rose-white", "Nike Mix Rose / White", "Nike", "Nike/mix-rose-white.png", 2.99],
  ["nike-mix-white-purple", "Nike Mix White / Purple", "Nike", "Nike/mix-white-purple.png", 2.99],
  ["nike-mix-yellow", "Nike Mix Yellow", "Nike", "Nike/mix-yellow.png", 2.99],
  ["nike-white", "Nike White Socks", "Nike", "Nike/nike-white.png", 2.99],
  ["on-cloud-3-pack", "On Cloud 3-Pack", "On Cloud", "On Cloud/on-cloud-3-pack.png", 6.00],
  ["nekat-cheese", "Nekat Cheese Socks", "Nekat", "Nekat/cheese.png", 2.50],
  ["nekat-elephant", "Nekat Elephant Socks", "Nekat", "Nekat/elephant.png", 2.50],
  ["nekat-mthl", "Nekat Mthl Socks", "Nekat", "Nekat/mthl.png", 2.50],
  ["nekat-shisha", "Nekat ShiSha Socks", "Nekat", "Nekat/shisha.png", 2.50],
  ["nekat-women", "Nekat Women Socks", "Nekat", "Nekat/women.png", 2.50],
  ["alo-blue", "Alo Blue Socks", "Alo", "Alo/alo-blue.png", 2.99],
  ["alo-light-pink", "Alo Light Pink Socks", "Alo", "Alo/alo-light-pink.png", 2.99],
  ["alo-light-purple", "Alo Light Purple Socks", "Alo", "Alo/alo-light-purple.png", 2.99],
  ["plain-white-ankle-3-pack", "White Ankle Socks 3-Pack", "Plain", "Plain/white-ankle-3-pack.png", 5.99],
  ["grip-black", "Black Grip Socks", "Grip", "Grip/grip-black.png", 3.99],
  ["grip-white", "White Grip Socks", "Grip", "Grip/grip-white.png", 3.99]
].map(([id, name, category, image, price]) => ({
  id,
  name,
  category,
  image: `assets/${image.replace(/\.png$/, ".webp")}`,
  price,
  searchText: `${name} ${category} socks`
}));

const featuredIds = ["nike-elite", "nike-elite-black", "nike-elite-red", "nike-elite-white"];
const featuredGrid = document.querySelector("#featured-products");
const stockGrid = document.querySelector("#stock-products");
const stockEmpty = document.querySelector("#stock-empty");

function createProductCard(product, featured = false) {
  const card = document.createElement("article");
  card.className = `store-product${featured ? " feature-large" : ""}`;
  card.dataset.productId = product.id;
  card.dataset.category = product.category;

  const photo = document.createElement("div");
  photo.className = "product-photo";
  const image = document.createElement("img");
  image.src = product.image;
  image.alt = product.name;
  image.loading = "lazy";
  image.decoding = "async";
  photo.append(image);
  if (featured) {
    const tag = document.createElement("span");
    tag.className = "product-tag";
    tag.textContent = "IN STOCK";
    photo.append(tag);
  }

  const details = document.createElement("div");
  details.className = "product-details";
  const copy = document.createElement("div");
  const name = document.createElement("strong");
  name.textContent = product.name;
  const category = document.createElement("span");
  category.textContent = product.category;
  copy.append(name, category);
  const price = document.createElement("span");
  price.className = "price";
  price.textContent = `$${product.price.toFixed(2)}`;
  details.append(copy, price);

  const addButton = document.createElement("button");
  addButton.type = "button";
  addButton.className = "add-to-cart";
  addButton.dataset.addToCart = product.id;
  addButton.setAttribute("aria-label", `Add ${product.name} to cart`);
  addButton.append(document.createTextNode("ADD TO CART "));
  const addIcon = document.createElement("span");
  addIcon.setAttribute("aria-hidden", "true");
  addIcon.textContent = "+";
  addButton.append(addIcon);
  card.append(photo, details, addButton);
  return card;
}

productsRender();

function productsRender() {
  featuredGrid.replaceChildren(...featuredIds.map(id => createProductCard(stock.find(product => product.id === id), true)));
  stockGrid.replaceChildren(...stock.map(product => createProductCard(product)));
}

const products = stock;

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
const maxQuantity = 99;
const deliveryFee = 5;

function readCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(cartStorageKey) || "[]");
    return saved.filter(item => products.some(product => product.id === item.id) && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= maxQuantity);
  } catch {
    return [];
  }
}

let cart = readCart();
const fuse = typeof Fuse === "function" ? new Fuse(products, {
  keys: ["name", "category"],
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
    const image = document.createElement("img");
    image.className = "search-result-image";
    image.src = product.image;
    image.alt = "";
    const copy = document.createElement("span");
    copy.className = "search-result-copy";
    const title = document.createElement("strong");
    title.textContent = product.name;
    const description = document.createElement("small");
    description.textContent = `${product.category} · $${product.price.toFixed(2)}`;
    copy.append(title, description);
    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.className = "result-add";
    addButton.dataset.addToCart = product.id;
    addButton.textContent = "ADD";
    row.append(image, copy, addButton);
    searchResults.append(row);
  });
}

function saveCart() {
  try {
    localStorage.setItem(cartStorageKey, JSON.stringify(cart));
  } catch {
    return;
  }
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
    const image = document.createElement("img");
    image.className = "cart-item-image";
    image.src = product.image;
    image.alt = "";
    const details = document.createElement("div");
    details.className = "cart-item-details";
    const title = document.createElement("strong");
    title.textContent = product.name;
    const price = document.createElement("span");
    price.textContent = `$${product.price.toFixed(2)} each`;
    details.append(title, price);
    const controls = document.createElement("div");
    controls.className = "quantity-controls";
    const decrease = document.createElement("button");
    decrease.type = "button";
    decrease.dataset.cartAction = "decrease";
    decrease.dataset.productId = product.id;
    decrease.setAttribute("aria-label", `Decrease ${product.name} quantity`);
    decrease.textContent = "−";
    const quantity = document.createElement("span");
    quantity.textContent = String(item.quantity);
    const increase = document.createElement("button");
    increase.type = "button";
    increase.dataset.cartAction = "increase";
    increase.dataset.productId = product.id;
    increase.setAttribute("aria-label", `Increase ${product.name} quantity`);
    increase.textContent = "+";
    controls.append(decrease, quantity, increase);
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "remove-item";
    remove.dataset.cartAction = "remove";
    remove.dataset.productId = item.id;
    remove.textContent = "REMOVE";
    row.append(image, details, controls, remove);
    cartItems.append(row);
  });

  const orderLines = cart.map(item => {
    const product = products.find(entry => entry.id === item.id);
    return product ? `- ${product.name} x ${item.quantity}` : null;
  }).filter(Boolean);
  const subtotal = cart.reduce((total, item) => {
    const product = products.find(entry => entry.id === item.id);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);
  const total = subtotal + deliveryFee;
  const message = `Hi, I would like to order:\n${orderLines.join("\n")}\nItems subtotal: $${subtotal.toFixed(2)}\nDelivery: $${deliveryFee.toFixed(2)}\nTotal: $${total.toFixed(2)}`;
  checkoutLink.href = `https://wa.me/96171603086?text=${encodeURIComponent(message)}`;
  document.querySelector("#cart-subtotal").textContent = `$${subtotal.toFixed(2)}`;
  document.querySelector("#cart-delivery").textContent = `$${deliveryFee.toFixed(2)}`;
  document.querySelector("#cart-total").textContent = `$${total.toFixed(2)}`;
}

document.querySelectorAll(".category-filter").forEach(button => {
  button.addEventListener("click", () => {
    const category = button.dataset.category;
    document.querySelectorAll(".category-filter").forEach(filter => {
      const active = filter === button;
      filter.classList.toggle("is-active", active);
      filter.setAttribute("aria-pressed", String(active));
    });
    const visibleProducts = [...stockGrid.children].filter(card => category === "all" || card.dataset.category === category);
    [...stockGrid.children].forEach(card => {
      card.hidden = category !== "all" && card.dataset.category !== category;
    });
    stockEmpty.hidden = visibleProducts.length > 0;
  });
});

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
    if (existing) existing.quantity = Math.min(existing.quantity + 1, maxQuantity);
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
  if (control.dataset.cartAction === "increase") item.quantity = Math.min(item.quantity + 1, maxQuantity);
  if (control.dataset.cartAction === "decrease") item.quantity -= 1;
  if (control.dataset.cartAction === "remove" || item.quantity < 1) cart = cart.filter(entry => entry.id !== item.id);
  saveCart();
  renderCart();
});

renderCart();
