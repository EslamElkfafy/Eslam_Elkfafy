let currentProduct = null;
let selectedColor = null;
let selectedSize = null;

async function openProductModal(handle) {
  const res = await fetch(`/products/${handle}.json`);
  const { product } = await res.json();
  currentProduct = product;

  // Fill basic info
  document.getElementById('product-modal-title').textContent = product.title;
  document.getElementById('product-modal-description').innerHTML = product.body_html;
  document.getElementById('product-modal-image').src = product.image?.src || '';
  document.getElementById('product-modal-image').alt = product.title;

  // Price = first variant
  document.getElementById(
    'product-modal-price'
  ).textContent = `$${product.variants[0].price} ${product.variants[0].price_currency}`;
  const firstVariant = product.variants[0];
  // document.getElementById('selected-variant-id').value = firstVariant.id;

  // Build color buttons
  const colorContainer = document.getElementById('color-options');
  colorContainer.innerHTML = `
    <div class="product-modal-color-label">
      <span class="product-modal-color-label-text">Color</span>
    </div>
    <div class="product-modal-color-buttons">
      ${product.options
        .find((o) => o.name === 'Color')
        .values.map(
          (color, i) => `
        <button
          class="product-modal-color-button ${color.toLowerCase()}}"
          style="--btn-color: ${color.toLowerCase()};"
          onclick="selectColor('${color}')">
          ${color}
        </button>
      `
        )
        .join('')}
    </div>
  `;
  selectedColor = null;

  // Build size dropdown
  const sizeMenu = document.getElementById('size-options');
  sizeMenu.innerHTML = product.options
    .find((o) => o.name === 'Size')
    .values.map(
      (size) => `
    <button class="product-modal-size-option" onclick="selectSize('${size}')">${size}</button>
  `
    )
    .join('');
  selectedSize = null;
  document.getElementById('selected-size').textContent = 'Choose your size';

  // Toggle size dropdown
  const sizeBtn = document.getElementById('size-dropdown-btn');
  const sizeArrow = document.getElementById('size-dropdown-arrow');
  sizeBtn.onclick = () => {
    const isOpen = sizeMenu.style.display === 'block';

    sizeMenu.style.display = isOpen ? 'none' : 'block';
    sizeArrow.src = isOpen ? "{{ 'arrow-modal-down.svg' | asset_url }}" : "{{ 'arrow-modal-up.svg' | asset_url }}";
  };

  document.getElementById('product-modal-overlay').style.display = 'flex';
}

function selectColor(color) {
  selectedColor = color;
  console.log(color);
  document.querySelectorAll('.product-modal-color-button').forEach((btn) => {
    btn.classList.toggle('selected', btn.textContent.trim().toLowerCase() === color.toLowerCase());
  });
  updateVariant();
}

function selectSize(size) {
  selectedSize = size;
  document.getElementById('selected-size').textContent = size;
  document.getElementById('size-options').style.display = 'none';
  document.getElementById('size-dropdown-arrow').src = "{{ 'arrow-modal-down.svg' | asset_url }}";
  updateVariant();
}

function updateVariant() {
  console.log(selectedColor, selectedSize);
  if (!selectedColor || !selectedSize) return;

  // In Shopify, option1 is typically the first option (Size) and option2 is the second option (Color)
  const variant = currentProduct.variants.find((v) => v.option1 === selectedSize && v.option2 === selectedColor);
  console.log(variant);
  if (variant) {
    document.getElementById('product-modal-price').textContent = `$${variant.price} ${variant.price_currency}`;
    document.getElementById('selected-variant-id').value = variant.id;
  }
}

async function addToCart() {
  const variantId = document.getElementById('selected-variant-id').value;
  const errorBox = document.getElementById('product-modal-error');
  const addBtn = document.querySelector('.product-modal-cart-button');

  // Reset error message
  errorBox.style.display = 'none';
  errorBox.textContent = '';

  // Validation: Require both color & size
  if (!selectedColor && !selectedSize) {
    errorBox.textContent = 'Please select a color and a size.';
    errorBox.style.display = 'block';
    return;
  }
  if (!selectedColor) {
    errorBox.textContent = 'Please select a color.';
    errorBox.style.display = 'block';
    return;
  }
  if (!selectedSize) {
    errorBox.textContent = 'Please select a size.';
    errorBox.style.display = 'block';
    return;
  }

  if (!variantId) {
    errorBox.textContent = 'This combination is not available.';
    errorBox.style.display = 'block';
    return;
  }

  try {
    // Disable button during request
    addBtn.disabled = true;
    addBtn.textContent = 'Adding...';

    // Add to cart request
    await fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: variantId, quantity: 1 }),
    });
    // Check condition: Black + Medium
    if (selectedColor.toLowerCase() === 'black' && selectedSize.toLowerCase() === 'm') {
      // ID of "Soft Winter Jacket" variant (replace with real ID from Shopify Admin / theme code)

      const softWinterJacketVariantId = '45057681981601';

      await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: softWinterJacketVariantId, quantity: 1 }),
      });
    }

    alert('Added to cart!');
    closeProductModal();
  } catch (err) {
    errorBox.textContent = 'Something went wrong. Please try again.';
    errorBox.style.display = 'block';
  } finally {
    // Re-enable button
    addBtn.disabled = false;
    addBtn.classList.remove('disabled');
    addBtn.textContent = 'Add to cart';
  }
}

function closeProductModal() {
  document.getElementById('product-modal-overlay').style.display = 'none';
  document.getElementById('selected-variant-id').value = '';
}
// Close modal if clicking outside modal container
document.getElementById('product-modal-overlay').addEventListener('click', function(e) {
if (e.target === this) { // only if the overlay itself was clicked
  closeProductModal();
}
});