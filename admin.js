const API = (window.API_URL || 'http://localhost:5000') + '/api';
document.addEventListener('DOMContentLoaded', ()=>{
  const productForm = document.getElementById('productForm');
  const adminUserForm = document.getElementById('adminUserForm');
  const usersTable = document.getElementById('usersTable');
  const adminProducts = document.getElementById('adminProducts');

  // load users and products
  loadUsers();
  loadProducts();

  if(productForm){
    productForm.addEventListener('submit', async e=>{
      e.preventDefault();
      const msgDiv = document.getElementById('productMsg');
      try {
        const fd = new FormData(productForm);
        const res = await fetch(`${API}/products`, { method:'POST', body: fd });
        const data = await res.json();
        if(res.ok){
          msgDiv.innerHTML = '<div class="alert success">✓ Product added successfully</div>';
          productForm.reset();
          setTimeout(() => msgDiv.innerHTML = '', 3000);
          // Small delay to ensure file is fully written before fetching
          setTimeout(() => loadProducts(), 500);
        } else {
          msgDiv.innerHTML = '<div class="alert error">✗ ' + (data.message || 'Error adding product') + '</div>';
        }
      } catch (err) {
        msgDiv.innerHTML = '<div class="alert error">✗ Error: ' + err.message + '</div>';
      }
    });
  }

  if(adminUserForm){
    adminUserForm.addEventListener('submit', async e=>{
      e.preventDefault();
      const form = new FormData(adminUserForm);
      const payload = {
        name: form.get('name'), email: form.get('email'),
        password: form.get('password'), role: form.get('role')
      };
      const res = await fetch(`${API}/users`, {
        method: 'POST', headers:{ 'content-type':'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if(res.ok){
        alert('User added');
        adminUserForm.reset();
        loadUsers();
      } else alert(data.message || 'Error');
    });
  }

  async function loadUsers(){
    const res = await fetch(`${API}/users`);
    const allUsers = await res.json();
    // Filter out admin users, show only regular users
    const users = allUsers.filter(u => u.role === 'user');
    if(!usersTable) return;
    usersTable.innerHTML = `<tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr>`;
    users.forEach(u=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${u.name}</td><td>${u.email}</td><td><span style="background:var(--ocean-2);color:white;padding:4px 8px;border-radius:4px;font-size:12px">${u.role}</span></td>
        <td>
          <button data-id="${u._id}" class="btn small editUser">Edit</button>
          <button data-id="${u._id}" class="btn small delUser" style="background:#f66">Delete</button>
        </td>`;
      usersTable.appendChild(tr);
    });
    document.querySelectorAll('.delUser').forEach(b=>{
      b.addEventListener('click', async ()=>{
        if(!confirm('Delete user?')) return;
        const id = b.dataset.id;
        await fetch(`${API}/users/${id}`, { method: 'DELETE' });
        loadUsers();
      });
    });
    document.querySelectorAll('.editUser').forEach(b=>{
      b.addEventListener('click', async ()=>{
        const id = b.dataset.id;
        const name = prompt('New name');
        if(!name) return;
        await fetch(`${API}/users/${id}`, { method:'PUT', headers:{'content-type':'application/json'}, body: JSON.stringify({ name })});
        loadUsers();
      });
    });
  }

  async function loadProducts(){
    try {
      const res = await fetch(`${API}/products`);
      const products = await res.json();
      if(adminProducts) adminProducts.innerHTML = '';
      
      if (!products || products.length === 0) {
        adminProducts.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#999">No products yet. Add one to get started.</div>';
        return;
      }
      
      products.forEach(p => {
        const div = document.createElement('div');
        div.className = 'card static-card';
        
        // Build image HTML with cache-busting
        let imageHtml = '';
        if (p.imageUrl) {
          const imageSrc = p.imageUrl.startsWith('http') ? p.imageUrl : (window.location.origin + p.imageUrl);
          // Add cache-busting parameter
          const imageSrcWithCache = imageSrc + '?t=' + Date.now();
          imageHtml = `<img src="${imageSrcWithCache}" alt="${p.name}" style="width:100%;height:90px;object-fit:cover;border-radius:0" loading="lazy" onerror="this.style.display='none';this.parentElement.style.background='#f0f0f0';this.parentElement.innerHTML='<div style=\'width:100%;height:90px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;color:#999;font-size:11px\'>📷 No image</div>'"/>`;
        } else {
          imageHtml = '<div style="width:100%;height:90px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;color:#999;font-size:11px;border-radius:0">📷 No image</div>';
        }
        
        div.innerHTML = `
          ${imageHtml}
          <div class="card-content" style="padding:10px 8px;">
            <h3 style="font-size:15px;margin:0 0 4px 0;">${p.name}</h3>
            <p style="font-size:11px;color:#666;margin:0 0 6px 0;">${p.description ? p.description.substring(0, 40) + '...' : 'No description'}</p>
            <div class="price" style="font-size:13px;">₱ ${Number(p.price).toFixed(2)}</div>
            <div style="margin-top:6px;display:flex;gap:6px">
              <button class="btn editProduct" data-id="${p._id}" style="flex:1;font-size:12px;padding:4px 0;">✏️ Edit</button>
              <button class="btn" style="background:#f66;flex:1;font-size:12px;padding:4px 0;" data-id="${p._id}" id="del-${p._id}">🗑️ Delete</button>
            </div>
          </div>
        `;
        adminProducts.appendChild(div);

        // delete listener
        div.querySelector(`#del-${p._id}`).addEventListener('click', async () => {
          if(!confirm('Delete product?')) return;
          const msgDiv = document.getElementById('productMsg');
          try {
            const res = await fetch(`${API}/products/${p._id}`, { method:'DELETE' });
            if(res.ok){
              msgDiv.innerHTML = '<div class="alert success">✓ Product deleted</div>';
              setTimeout(() => msgDiv.innerHTML = '', 2000);
            } else {
              msgDiv.innerHTML = '<div class="alert error">✗ Error deleting product</div>';
            }
          } catch (err) {
            msgDiv.innerHTML = '<div class="alert error">✗ Error: ' + err.message + '</div>';
          }
          loadProducts();
        });
        
        // edit listener
        div.querySelector('.editProduct').addEventListener('click', async () => {
          const modal = document.getElementById('editProductModal');
          const form = document.getElementById('editProductForm');
          document.getElementById('edit-name').value = p.name || '';
          document.getElementById('edit-description').value = p.description || '';
          document.getElementById('edit-price').value = p.price || 0;
          
          const preview = document.getElementById('edit-image-preview');
          if (p.imageUrl) {
            const imageSrc = p.imageUrl.startsWith('http') ? p.imageUrl : (window.location.origin + p.imageUrl);
            preview.innerHTML = `<img src="${imageSrc}" style="width:100%;height:100%;object-fit:cover"/>`;
          } else {
            preview.innerHTML = '';
          }
          
          modal.style.display = 'flex';

          const onSubmit = async (ev) => {
            ev.preventDefault();
            const msgDiv = document.getElementById('productMsg');
            const fd = new FormData();
            fd.append('name', document.getElementById('edit-name').value);
            fd.append('description', document.getElementById('edit-description').value);
            fd.append('price', document.getElementById('edit-price').value);
            const fileInput = document.getElementById('edit-image');
            if(fileInput && fileInput.files && fileInput.files[0]){
              fd.append('image', fileInput.files[0]);
            }
            try {
              const res = await fetch(`${API}/products/${p._id}`, { method: 'PUT', body: fd });
              const data = await res.json();
              if(res.ok){
                msgDiv.innerHTML = '<div class="alert success">✓ Product updated</div>';
                setTimeout(() => msgDiv.innerHTML = '', 2000);
                modal.style.display = 'none';
                form.reset();
                loadProducts();
              } else {
                msgDiv.innerHTML = '<div class="alert error">✗ ' + (data.message || 'Update failed') + '</div>';
              }
            } catch (err) {
              msgDiv.innerHTML = '<div class="alert error">✗ Error: ' + err.message + '</div>';
            }
            form.removeEventListener('submit', onSubmit);
          };
          
          form.addEventListener('submit', onSubmit);

          document.getElementById('cancelEdit').onclick = () => {
            modal.style.display = 'none';
            form.reset();
            form.removeEventListener('submit', onSubmit);
          };

          const fileInput = document.getElementById('edit-image');
          fileInput.onchange = () => {
            const f = fileInput.files[0];
            if(!f) {
              if (p.imageUrl) {
                const imageSrc = p.imageUrl.startsWith('http') ? p.imageUrl : (window.location.origin + p.imageUrl);
                preview.innerHTML = `<img src="${imageSrc}" style="width:100%;height:100%;object-fit:cover"/>`;
              } else {
                preview.innerHTML = '';
              }
            } else {
              const reader = new FileReader();
              reader.onload = e => preview.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover"/>`;
              reader.readAsDataURL(f);
            }
          };
        });
      });
    } catch (err) {
      console.error('Error loading products:', err);
      adminProducts.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#f66">Error loading products</div>';
    }
  }
});
