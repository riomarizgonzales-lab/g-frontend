const API = (window.API_URL || 'http://localhost:5000') + '/api';

async function fetchProducts(){
  try {
    console.log('Fetching products from:', API);
    const res = await fetch(`${API}/products`);
    if(!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch products`);
    const list = await res.json();
    console.log('Fetched products:', list);
    renderProducts(list.value || list);
  } catch(e){ 
    console.error('Product fetch error:', e);
    const container = document.getElementById('products') || document.getElementById('productsGrid');
    if(container) container.innerHTML = '<div class="alert error" style="grid-column:1/-1">⚠️ Unable to load products. Please try again later. Error: ' + e.message + '</div>';
  }
}

function renderProducts(list){
  const container = document.getElementById('products') || document.getElementById('productsGrid');
  if(!container) return;
  
  // Handle both array and object with .value property
  const products = Array.isArray(list) ? list : (list.value || []);
  
  if(products.length === 0){
    container.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#999">No products available yet</div>';
    return;
  }
  
  container.innerHTML = '';
  products.forEach(p => {
    const div = document.createElement('div');
    div.style.cssText = 'background:#fff;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;cursor:pointer;';
    div.className = 'card';
    // Product display: image, name, price
    let imageHtml = '';
    if (p.imageUrl) {
      const imageSrc = p.imageUrl.startsWith('http') ? p.imageUrl : (window.API_URL + p.imageUrl);
      imageHtml = `<img src="${imageSrc}" alt="${p.name}" style="width:100%;height:120px;object-fit:cover;display:block;margin-bottom:8px" onerror="this.style.display='none';this.parentElement.innerHTML='<div style=\'width:100%;height:120px;background:#e0e0e0;display:flex;align-items:center;justify-content:center;color:#999;font-size:12px;margin-bottom:8px\'>📷 No image</div>'"/>`;
    } else {
      imageHtml = '<div style="width:100%;height:120px;background:#e0e0e0;display:flex;align-items:center;justify-content:center;color:#999;font-size:12px;margin-bottom:8px">📷 No image</div>';
    }
    div.innerHTML = `
      ${imageHtml}
      <div style="padding:10px 12px;">
        <div style="font-weight:600;color:#222;font-size:15px;margin-bottom:4px;">${p.name}</div>
        <div style="color:#666;font-size:13px;margin-bottom:4px;">${p.description ? p.description : ''}</div>
        <div style="font-weight:700;color:#0b6b92;font-size:16px;margin-bottom:8px;">₱${Number(p.price).toFixed(2)}</div>
        <button class="addCart" data-id="${p._id}" data-name="${p.name}" data-price="${p.price}" data-imageurl="${p.imageUrl || ''}" data-description="${p.description || ''}" style="width:100%;padding:8px;background:#0f9bd3;color:white;border:none;border-radius:6px;font-weight:600;font-size:13px;cursor:pointer;">🛒 Add to Cart</button>
      </div>
    `;
    container.appendChild(div);
    // Allow clicking the card (but not the button) to view details
    div.addEventListener('click', (e) => {
      if (!e.target.classList.contains('addCart')) {
        location.href = `product-detail.html?id=${p._id}`;
      }
    });
  });

  // add to cart listeners
  document.querySelectorAll('.addCart').forEach(b=>{
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = b.dataset.id;
      const name = b.dataset.name;
      const price = Number(b.dataset.price);
      const imageUrl = b.dataset.imageurl;
      const description = b.dataset.description;
      addToCart({ _id:id, name, price, qty:1, imageUrl, description });
      // Show feedback
      const originalText = b.textContent;
      b.textContent = '✓ Added!';
      b.style.background = '#10b981';
      b.disabled = true;
      setTimeout(() => {
        b.textContent = originalText;
        b.style.background = '#0f9bd3';
        b.disabled = false;
      }, 1500);
    });
  });
}

function getCart(){
  return JSON.parse(localStorage.getItem('blue_cart') || '[]');
}
function saveCart(cart){ 
  localStorage.setItem('blue_cart', JSON.stringify(cart));
  // Dispatch custom event for other pages to listen
  window.dispatchEvent(new Event('cartUpdated'));
}

function addToCart(item){
  const cart = getCart();
  const found = cart.find(i => i._id === item._id);
  if(found) found.qty += item.qty;
  else cart.push(item);
  saveCart(cart);
}

window.addEventListener('load', fetchProducts);
