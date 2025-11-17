
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
    const container = document.getElementById('products');
    if(container) container.innerHTML = '<div class="alert error" style="grid-column:1/-1"> Unable to load products. ' + e.message + '</div>';
  }
}

function renderProducts(list){
  const container = document.getElementById('products');
  if(!container) return;
  
  const products = Array.isArray(list) ? list : (list.value || []);
  
  if(products.length === 0){
    container.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px 40px;color:#a0aac0">No products available yet</div>';
    return;
  }
  
  container.innerHTML = '';
  products.forEach(p => {
    const div = document.createElement('div');
    div.className = 'product-card';
    
    let imageHtml = '';
    if (p.imageUrl) {
      const imageSrc = p.imageUrl.startsWith('http') ? p.imageUrl : ((window.API_URL || window.location.origin) + p.imageUrl);
      imageHtml = `<img src="${imageSrc}" alt="${p.name}" class="product-image" loading="lazy" onerror="this.style.display='none'"/>`;
    } else {
      imageHtml = '<div class="product-image" style="display:flex;align-items:center;justify-content:center;color:#a0aac0;font-size:14px;"> No image</div>';
    }
    
    div.innerHTML = `
      ${imageHtml}
      <div class="product-content">
        <div class="product-name">${p.name}</div>
        <div class="product-description">${p.description ? p.description : 'Premium tech product'}</div>
        <div class="product-price">₱ ${Number(p.price).toFixed(2)}</div>
        <div class="product-actions">
          <button class="btn-add-cart" data-id="${p._id}" data-name="${p.name}" data-price="${p.price}" data-imageurl="${p.imageUrl || ''}" data-description="${p.description || ''}"> Add Cart</button>
          <button class="btn-view" onclick="location.href='product-detail.html?id=${p._id}'"> View</button>
        </div>
      </div>
    `;
    
    container.appendChild(div);
  });

  document.querySelectorAll('.btn-add-cart').forEach(b=>{
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = b.dataset.id;
      const name = b.dataset.name;
      const price = Number(b.dataset.price);
      const imageUrl = b.dataset.imageurl;
      const description = b.dataset.description;
      addToCart({ _id:id, name, price, qty:1, imageUrl, description });
      const originalText = b.textContent;
      b.textContent = ' Added!';
      b.style.background = '#4ade80';
      b.disabled = true;
      setTimeout(() => {
        b.textContent = originalText;
        b.style.background = '';
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

