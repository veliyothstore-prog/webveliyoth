import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';

const AdminPanel = () => {
  const { 
    data, isAdminOpen, setIsAdminOpen, 
    isAuthenticated, setIsAuthenticated,
    addCategory, updateCategory, deleteCategory,
    addBrand, updateBrand, deleteBrand,
    addProduct, updateProduct, deleteProduct, updatePromotion,
    updateAdminPassword, updateHeroImage, uploadImage
  } = useStore();

  const [activeTab, setActiveTab] = useState('products');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [newCatName, setNewCatName] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  
  // Product Form State
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [newProduct, setNewProduct] = useState({
    title: '', brand: '', price: '', category: 'laptops', image: '', details: { description: '' }
  });

  // Local editing states to avoid re-renders during typing
  const [editingCats, setEditingCats] = useState({});
  const [editingBrands, setEditingBrands] = useState({});
  const [editingPromos, setEditingPromos] = useState({});

  if (!isAdminOpen) return null;

  // LOGIN SCREEN
  if (!isAuthenticated) {
    const handleLogin = (e) => {
      e.preventDefault();
      if (password === data.adminPassword) {
        setIsAuthenticated(true);
        setLoginError(false);
      } else {
        setLoginError(true);
      }
    };

    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        background: 'var(--bg-dark)', zIndex: 5000,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <form onSubmit={handleLogin} style={{ background: 'white', padding: '3rem', borderRadius: '12px', width: '400px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
          <div style={{ background: 'var(--primary)', display: 'inline-block', padding: '0.5rem 1rem', marginBottom: '2rem' }}>
            <img src="/logo.png" alt="VeliYoth" style={{ height: '30px' }} />
          </div>
          <h2 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Acceso Administrativo</h2>
          <input 
            type="password" placeholder="Contraseña" 
            value={password} onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '1rem', fontSize: '1rem' }}
          />
          {loginError && <p style={{ color: 'red', fontSize: '0.8rem', marginBottom: '1rem' }}>Contraseña incorrecta</p>}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="button" onClick={() => setIsAdminOpen(false)} style={{ flex: 1, padding: '1rem', background: '#eee', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" className="btn-primary" style={{ flex: 1, padding: '1rem', borderRadius: '8px' }}>Entrar</button>
          </div>
        </form>
      </div>
    );
  }

  const filteredProducts = data.products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProduct.title || !newProduct.price) return;
    addProduct({
      ...newProduct,
      price: parseFloat(newProduct.price),
      details: { ...newProduct.details, brand: newProduct.brand }
    });
    setNewProduct({ title: '', brand: '', price: '', category: 'laptops', image: '', details: { description: '' } });
    setIsAddingProduct(false);
  };

  const handleUpdateProduct = (e) => {
    e.preventDefault();
    updateProduct(editingProduct.id, editingProduct);
    setEditingProduct(null);
  };

  const handleImageUpload = async (file, folder, callback) => {
    if (file) {
      try {
        setIsUploading(true);
        const publicUrl = await uploadImage(file, folder);
        callback(publicUrl);
      } catch (error) {
        alert('Error al subir la imagen');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSaveCategory = async (id) => {
    if (editingCats[id] !== undefined) {
      await updateCategory(id, editingCats[id]);
      const newEditing = { ...editingCats };
      delete newEditing[id];
      setEditingCats(newEditing);
    }
  };

  const handleSaveBrand = async (id) => {
    if (editingBrands[id] !== undefined) {
      await updateBrand(id, editingBrands[id]);
      const newEditing = { ...editingBrands };
      delete newEditing[id];
      setEditingBrands(newEditing);
    }
  };

  const handleSavePromo = async (id) => {
    if (editingPromos[id] !== undefined) {
      const updates = { title: editingPromos[id] };
      await updatePromotion(id, updates);
      const newEditing = { ...editingPromos };
      delete newEditing[id];
      setEditingPromos(newEditing);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: '#f4f7f6', zIndex: 3000, display: 'flex'
    }}>
      {/* Sidebar */}
      <aside style={{ width: '260px', background: 'var(--bg-dark)', color: 'white', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '2rem', background: 'var(--primary)', color: 'black', fontWeight: 900, fontSize: '1.2rem' }}>
          VELIYOTH STORE
        </div>
        <nav style={{ flex: 1, padding: '1rem 0' }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'products', label: 'Productos', icon: '💻' },
            { id: 'categories', label: 'Categorías', icon: '📁' },
            { id: 'brands', label: 'Marcas', icon: '🏆' },
            { id: 'promotions', label: 'Promociones', icon: '🏷️' },
            { id: 'config', label: 'Configuración', icon: '⚙️' },
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                width: '100%', padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '1rem',
                background: activeTab === item.id ? '#222' : 'none', border: 'none',
                color: activeTab === item.id ? 'var(--primary)' : 'white',
                borderLeft: activeTab === item.id ? '4px solid var(--primary)' : '4px solid transparent',
                cursor: 'pointer', textAlign: 'left'
              }}
            >
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>
        <button 
          onClick={() => { setIsAuthenticated(false); setIsAdminOpen(false); }}
          style={{ padding: '1.5rem', background: '#222', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 700 }}
        >
          👋 Salir
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ padding: '1.5rem 3rem', background: 'white', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{activeTab.toUpperCase()}</h2>
          {activeTab === 'products' && (
            <button className="btn-primary" onClick={() => setIsAddingProduct(true)}>+ Nuevo Producto</button>
          )}
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          
          {/* ADD/EDIT MODAL */}
          {(isAddingProduct || editingProduct) && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <form 
                onSubmit={isAddingProduct ? handleAddProduct : handleUpdateProduct} 
                style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '500px', maxHeight: '90vh', overflowY: 'auto' }}
              >
                <h3 style={{ marginBottom: '1.5rem' }}>{isAddingProduct ? 'Añadir Nuevo Producto' : 'Editar Producto'}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <input 
                    placeholder="Título del producto" 
                    value={isAddingProduct ? newProduct.title : editingProduct.title} 
                    onChange={e => isAddingProduct ? setNewProduct({...newProduct, title: e.target.value}) : setEditingProduct({...editingProduct, title: e.target.value})} 
                    style={{ padding: '0.8rem', border: '1px solid #ddd' }} required 
                  />
                  
                  <select 
                    value={isAddingProduct ? newProduct.brand : editingProduct.brand} 
                    onChange={e => isAddingProduct ? setNewProduct({...newProduct, brand: e.target.value}) : setEditingProduct({...editingProduct, brand: e.target.value})} 
                    style={{ padding: '0.8rem', border: '1px solid #ddd' }}
                  >
                    <option value="">Seleccionar Marca</option>
                    {data.brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                  </select>

                  <input 
                    placeholder="Precio (S/)" type="number" 
                    value={isAddingProduct ? newProduct.price : editingProduct.price} 
                    onChange={e => isAddingProduct ? setNewProduct({...newProduct, price: e.target.value}) : setEditingProduct({...editingProduct, price: e.target.value})} 
                    style={{ padding: '0.8rem', border: '1px solid #ddd' }} required 
                  />
                  
                  <select 
                    value={isAddingProduct ? newProduct.category : editingProduct.category} 
                    onChange={e => isAddingProduct ? setNewProduct({...newProduct, category: e.target.value}) : setEditingProduct({...editingProduct, category: e.target.value})} 
                    style={{ padding: '0.8rem', border: '1px solid #ddd' }}
                  >
                    {data.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  
                  <div style={{ border: '1px dashed #ccc', padding: '1rem', borderRadius: '4px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: '0.5rem' }}>CARGAR IMAGEN (800x800px)</label>
                    <input 
                      type="file" accept="image/*"
                      disabled={isUploading}
                      onChange={(e) => handleImageUpload(e.target.files[0], isAddingProduct ? (newProduct.category === 'cameras' ? 'kit' : 'laptops/imagenes') : (editingProduct.category === 'cameras' ? 'kit' : 'laptops/imagenes'), (res) => isAddingProduct ? setNewProduct({...newProduct, image: res}) : setEditingProduct({...editingProduct, image: res}))}
                    />
                    {isUploading && <p style={{ fontSize: '0.7rem', color: 'var(--primary)', marginTop: '0.5rem' }}>⏳ Subiendo imagen a la nube...</p>}
                    {(isAddingProduct ? newProduct.image : editingProduct.image) && !isUploading && (
                      <img src={isAddingProduct ? newProduct.image : editingProduct.image} style={{ height: '50px', marginTop: '0.5rem' }} />
                    )}
                  </div>

                  <textarea 
                    placeholder="Descripción / Detalles" 
                    value={isAddingProduct ? newProduct.details.description : editingProduct.details.description} 
                    onChange={e => isAddingProduct ? setNewProduct({...newProduct, details: {...newProduct.details, description: e.target.value}}) : setEditingProduct({...editingProduct, details: {...editingProduct.details, description: e.target.value}})} 
                    style={{ padding: '0.8rem', border: '1px solid #ddd', height: '120px' }} 
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '2rem' }}>
                  <button type="button" onClick={() => { setIsAddingProduct(false); setEditingProduct(null); }} style={{ flex: 1, padding: '0.8rem', background: '#eee', border: 'none' }}>Cancelar</button>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>{isAddingProduct ? 'Guardar Producto' : 'Actualizar Producto'}</button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
              <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', border: '1px solid #eee' }}>
                <span style={{ color: '#888', fontSize: '0.8rem', fontWeight: 700 }}>PRODUCTOS</span>
                <h3 style={{ fontSize: '2rem', fontWeight: 900 }}>{data.products.length}</h3>
              </div>
              <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', border: '1px solid #eee' }}>
                <span style={{ color: '#888', fontSize: '0.8rem', fontWeight: 700 }}>CATEGORÍAS</span>
                <h3 style={{ fontSize: '2rem', fontWeight: 900 }}>{data.categories.length}</h3>
              </div>
              <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', border: '1px solid #eee' }}>
                <span style={{ color: '#888', fontSize: '0.8rem', fontWeight: 700 }}>MARCAS</span>
                <h3 style={{ fontSize: '2rem', fontWeight: 900 }}>{data.brands.length}</h3>
              </div>
              <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', border: '1px solid #eee' }}>
                <span style={{ color: '#888', fontSize: '0.8rem', fontWeight: 700 }}>PROMOS</span>
                <h3 style={{ fontSize: '2rem', fontWeight: 900 }}>{data.promotions.filter(p=>p.active).length}</h3>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #eee', overflow: 'hidden' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid #eee', display: 'flex', gap: '1rem', background: '#fcfcfc' }}>
                <input type="text" placeholder="🔍 Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 2, padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }} />
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ flex: 1, padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                  <option value="all">Todas las categorías</option>
                  {data.categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#fafafa', borderBottom: '1px solid #eee' }}>
                  <tr>
                    <th style={{ padding: '1.2rem', textAlign: 'left', color: '#888' }}>PRODUCTO</th>
                    <th style={{ padding: '1.2rem', textAlign: 'left', color: '#888' }}>CATEGORÍA</th>
                    <th style={{ padding: '1.2rem', textAlign: 'left', color: '#888' }}>PRECIO (S/)</th>
                    <th style={{ padding: '1.2rem', textAlign: 'right', color: '#888' }}>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                      <td style={{ padding: '1.2rem' }}>
                        <div style={{ fontWeight: 600 }}>{p.title}</div>
                        <div style={{ fontSize: '0.7rem', color: '#888' }}>{p.brand}</div>
                      </td>
                      <td style={{ padding: '1.2rem' }}>
                        <span style={{ background: '#f0f0f0', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem' }}>{p.category}</span>
                      </td>
                      <td style={{ padding: '1.2rem' }}>
                         <span style={{ fontWeight: 700 }}>S/ {Math.round(p.price)}</span>
                      </td>
                      <td style={{ padding: '1.2rem', textAlign: 'right' }}>
                        <button onClick={() => setEditingProduct(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', marginRight: '1rem' }}>✏️</button>
                        <button onClick={() => { if(window.confirm('¿Eliminar producto?')) deleteProduct(p.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'categories' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
               <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', border: '1px solid #eee', height: 'fit-content' }}>
                 <h4 style={{ marginBottom: '1.5rem' }}>Añadir Categoría</h4>
                 <div style={{ display: 'flex', gap: '0.5rem' }}>
                   <input type="text" placeholder="Ej. Accesorios" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} style={{ flex: 1, padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }} />
                   <button onClick={() => { if(newCatName) { addCategory(newCatName); setNewCatName(''); } }} className="btn-primary">Agregar</button>
                 </div>
               </div>

               <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', border: '1px solid #eee' }}>
                 <h4 style={{ marginBottom: '1.5rem' }}>Categorías Actuales</h4>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                   {data.categories.map(cat => (
                     <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem', background: '#fcfcfc', border: '1px solid #eee', alignItems: 'center' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                         <input 
                            value={editingCats[cat.id] !== undefined ? editingCats[cat.id] : cat.name} 
                            onChange={(e) => setEditingCats({...editingCats, [cat.id]: e.target.value})} 
                            style={{ border: 'none', background: 'none', fontSize: '0.9rem', fontWeight: 600, width: '100%', padding: '0.2rem', borderBottom: editingCats[cat.id] !== undefined ? '2px solid var(--primary)' : '2px solid transparent' }} 
                         />
                       </div>
                       <div style={{ display: 'flex', gap: '0.5rem' }}>
                         {editingCats[cat.id] !== undefined && (
                           <button onClick={() => handleSaveCategory(cat.id)} style={{ background: 'var(--primary)', border: 'none', borderRadius: '4px', padding: '0.2rem 0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}>💾</button>
                         )}
                         <button onClick={() => { if(window.confirm('¿Eliminar categoría?')) deleteCategory(cat.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
            </div>
          )}

          {activeTab === 'brands' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
               <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', border: '1px solid #eee', height: 'fit-content' }}>
                 <h4 style={{ marginBottom: '1.5rem' }}>Añadir Marca</h4>
                 <div style={{ display: 'flex', gap: '0.5rem' }}>
                   <input type="text" placeholder="Ej. HP" value={newBrandName} onChange={(e) => setNewBrandName(e.target.value)} style={{ flex: 1, padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }} />
                   <button onClick={() => { if(newBrandName) { addBrand(newBrandName); setNewBrandName(''); } }} className="btn-primary">Agregar</button>
                 </div>
               </div>

               <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', border: '1px solid #eee' }}>
                 <h4 style={{ marginBottom: '1.5rem' }}>Marcas Actuales</h4>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                   {data.brands.map(brand => (
                     <div key={brand.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem', background: '#fcfcfc', border: '1px solid #eee', alignItems: 'center' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                         <input 
                            value={editingBrands[brand.id] !== undefined ? editingBrands[brand.id] : brand.name} 
                            onChange={(e) => setEditingBrands({...editingBrands, [brand.id]: e.target.value})} 
                            style={{ border: 'none', background: 'none', fontSize: '0.9rem', fontWeight: 600, width: '100%', padding: '0.2rem', borderBottom: editingBrands[brand.id] !== undefined ? '2px solid var(--primary)' : '2px solid transparent' }} 
                         />
                       </div>
                       <div style={{ display: 'flex', gap: '0.5rem' }}>
                         {editingBrands[brand.id] !== undefined && (
                           <button onClick={() => handleSaveBrand(brand.id)} style={{ background: 'var(--primary)', border: 'none', borderRadius: '4px', padding: '0.2rem 0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}>💾</button>
                         )}
                         <button onClick={() => { if(window.confirm('¿Eliminar marca?')) deleteBrand(brand.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
            </div>
          )}

          {activeTab === 'promotions' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
               {data.promotions.map(promo => (
                 <div key={promo.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee' }}>
                   <div style={{ 
                     height: '140px', backgroundColor: '#fcfcfc',
                     backgroundImage: promo.image ? `url(${promo.image})` : 'none', 
                     backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
                     borderRadius: '4px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #eee'
                   }}>
                     {!promo.image && <span style={{ color: '#ccc' }}>Sin Imagen</span>}
                   </div>
                   <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                     <button 
                        className="btn-outline" disabled={isUploading}
                        style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file'; input.accept = 'image/*';
                          input.onchange = (e) => handleImageUpload(e.target.files[0], 'promociones', (res) => updatePromotion(promo.id, { image: res }));
                          input.click();
                        }}
                     >
                       {isUploading ? '⌛ Subiendo...' : '📷 Cambiar Imagen'}
                     </button>
                   </div>
                   <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                     <input 
                       type="text" 
                       value={editingPromos[promo.id] !== undefined ? editingPromos[promo.id] : promo.title} 
                       onChange={(e) => setEditingPromos({...editingPromos, [promo.id]: e.target.value})} 
                       style={{ flex: 1, padding: '0.6rem', border: '1px solid #ddd', borderRadius: '4px', fontWeight: 600 }} 
                     />
                     {editingPromos[promo.id] !== undefined && (
                        <button onClick={() => handleSavePromo(promo.id)} style={{ background: 'var(--primary)', border: 'none', borderRadius: '4px', padding: '0.5rem', cursor: 'pointer' }}>💾</button>
                     )}
                   </div>
                   <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                      <input type="checkbox" checked={promo.active} onChange={(e) => updatePromotion(promo.id, { active: e.target.checked })} /> Mostrar en Carrusel Web
                   </label>
                   <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                      <input type="checkbox" checked={promo.showDiscount} onChange={(e) => updatePromotion(promo.id, { showDiscount: e.target.checked })} /> Mostrar etiqueta "10% OFF"
                   </label>
                 </div>
               ))}
            </div>
          )}

          {activeTab === 'config' && (
            <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
               <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', border: '1px solid #eee' }}>
                 <h4 style={{ marginBottom: '1.5rem' }}>Imagen de Portada (Hero)</h4>
                 <div style={{ 
                   width: '100%', height: '200px', 
                   background: `url(${data.heroImage}) center/contain no-repeat`,
                   backgroundColor: '#f9f9f9', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #eee'
                 }}></div>
                 <button 
                    className="btn-primary" disabled={isUploading} style={{ width: '100%' }}
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file'; input.accept = 'image/*';
                      input.onchange = (e) => handleImageUpload(e.target.files[0], 'otros', (res) => updateHeroImage(res));
                      input.click();
                    }}
                 >
                   {isUploading ? '⌛ Subiendo Portada...' : '📸 Cambiar Imagen de Portada'}
                 </button>
               </div>

               <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', border: '1px solid #eee' }}>
                 <h4 style={{ marginBottom: '1.5rem' }}>Seguridad del Panel</h4>
                 <div style={{ marginBottom: '1.5rem' }}>
                   <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Nueva Contraseña Administrativa</label>
                   <input 
                    type="text" placeholder="Escribe la nueva contraseña" defaultValue={data.adminPassword}
                    onBlur={(e) => { if(e.target.value && window.confirm('¿Cambiar la contraseña?')) updateAdminPassword(e.target.value); }} 
                    style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }} 
                   />
                 </div>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
