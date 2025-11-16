const API = (window.API_URL || 'http://localhost:5000') + '/api';

// Cart helpers used by cart page
function getCart(){
  return JSON.parse(localStorage.getItem('blue_cart') || '[]');
}
function saveCart(cart){
  localStorage.setItem('blue_cart', JSON.stringify(cart));
  // notify other pages
  window.dispatchEvent(new Event('cartUpdated'));
}

function changeQty(id, delta){
  const cart = getCart();
  const idx = cart.findIndex(i => i._id === id);
  if(idx === -1) return;
  cart[idx].qty = Math.max(0, (Number(cart[idx].qty) || 0) + Number(delta));
  if(cart[idx].qty <= 0){
    cart.splice(idx, 1);
  }
  saveCart(cart);
  if(typeof renderCart === 'function') renderCart();
}

function removeItem(id){
  const cart = getCart();
  const newCart = cart.filter(i => i._id !== id);
  saveCart(newCart);
  if(typeof renderCart === 'function') renderCart();
}

function renderCart(){
  const cart = JSON.parse(localStorage.getItem('blue_cart') || '[]');
  const emptyCart = document.getElementById('emptyCart');
  const cartItems = document.getElementById('cartItems');
  
  if(!emptyCart || !cartItems) return; // Exit if not on cart page
  
  if(cart.length === 0){
    emptyCart.style.display = 'block';
    cartItems.innerHTML = '';
    const checkoutBtn = document.getElementById('checkoutBtn');
    if(checkoutBtn) checkoutBtn.disabled = true;
    return;
  }

  emptyCart.style.display = 'none';
  const checkoutBtn = document.getElementById('checkoutBtn');
  if(checkoutBtn) checkoutBtn.disabled = false;

  // Display cart items with image, name, price, description, qty, total
  let html = '<div style="border:1px solid #e6f3f8;border-radius:8px;overflow:hidden;">';
  html += '<div style="background:#f8fbfd;padding:12px;font-weight:600;color:#0b6b92;display:grid;grid-template-columns:80px 1fr 80px 80px 80px;gap:12px;border-bottom:1px solid #e6f3f8;align-items:center;">';
  html += '<div>Image</div><div>Product</div><div style="text-align:right;">Price</div><div style="text-align:right;">Qty</div><div style="text-align:right;">Total</div></div>';

  let subtotal = 0;
  cart.forEach(item => {
    const itemTotal = item.price * item.qty;
    subtotal += itemTotal;
    // Use item.imageUrl if present, else fallback
    let imageHtml = '';
    if (item.imageUrl) {
      const imageSrc = item.imageUrl.startsWith('http') ? item.imageUrl : (window.API_URL + item.imageUrl);
      imageHtml = `<img src="${imageSrc}" alt="${item.name}" style="width:60px;height:60px;object-fit:cover;border-radius:6px;background:#f8fbfd;" onerror="this.style.display='none'"/>`;
    } else {
      imageHtml = '<div style="width:60px;height:60px;background:#e0e0e0;display:flex;align-items:center;justify-content:center;color:#999;font-size:12px;border-radius:6px;">📷</div>';
    }
    html += `
      <div style="padding:12px 0;border-bottom:1px solid #f0f0f0;display:grid;grid-template-columns:80px 1fr 100px 120px 80px;gap:12px;align-items:center;">
        <div>${imageHtml}</div>
        <div>
          <div style="font-weight:600;color:#222;">${item.name}</div>
          <div style="color:#666;font-size:12px;">${item.description ? item.description : ''}</div>
        </div>
        <div style="text-align:right;color:#666;">₱${Number(item.price).toFixed(2)}</div>
        <div style="text-align:right;color:#666;display:flex;justify-content:flex-end;gap:8px;align-items:center;"> 
          <button onclick="changeQty('${item._id}', -1)" style="width:30px;height:30px;border-radius:6px;border:1px solid #e6e6e6;background:#fff;cursor:pointer">−</button>
          <div style="min-width:36px;text-align:center;font-weight:600">${item.qty}</div>
          <button onclick="changeQty('${item._id}', 1)" style="width:30px;height:30px;border-radius:6px;border:1px solid #e6e6e6;background:#fff;cursor:pointer">+</button>
        </div>
        <div style="text-align:right;font-weight:600;color:#0b6b92;">₱${Number(itemTotal).toFixed(2)}</div>
        <div style="text-align:right;"><button onclick="removeItem('${item._id}')" style="padding:6px 10px;background:#ff6b6b;color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px;">Remove</button></div>
      </div>
    `;
  });

  html += '</div>';
  cartItems.innerHTML = html;

  // Update totals
  const tax = subtotal * 0.12;
  const shipping = subtotal > 0 ? 100 : 0;
  const total = subtotal + tax + shipping;
  
  document.getElementById('subtotal').textContent = '₱' + Number(subtotal).toFixed(2);
  document.getElementById('tax').textContent = '₱' + Number(tax).toFixed(2);
  document.getElementById('shipping').textContent = '₱' + Number(shipping).toFixed(2);
  document.getElementById('total').textContent = '₱' + Number(total).toFixed(2);
}

// Place order function (still used by checkout)
async function placeOrder(name, email, address, description){
  const items = getCart();
  if(items.length === 0) return alert('Cart empty');
  const payload = { name, email, address, description, items };
  const res = await fetch(`${API}/orders`, {
    method:'POST', headers:{'content-type':'application/json'},
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(()=>({}));
  if(res.ok){
    alert('Order placed');
    localStorage.removeItem('blue_cart');
    window.dispatchEvent(new Event('cartUpdated'));
  } else alert('Order failed: ' + (data.message || ''));
}

// Ensure cart display updates on cart events
window.addEventListener('cartUpdated', function() {
  if (typeof renderCart === 'function') renderCart();
});
window.addEventListener('load', function() {
  if (typeof renderCart === 'function') renderCart();
});
