import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import toast from 'react-hot-toast';
import { generateProfessionalPDF } from '../utils/pdfGenerator';
// Recharts import removed for stability

import AdminLogin from './AdminLogin';
import { setupAdminRealtime } from '../services/realtimeService';

const AdminPanel = () => {
  const { 
    data, orders, quotes, quoteDetails, fetchQuoteDetails,
    updateProduct, deleteProduct, addProduct, uploadImage,
    logout, changePassword, admins, fetchAdmins, fetchQuotes,
    fetchOrders, deleteQuote, updateQuote, addOrder, updateOrder,
    deleteOrder, isAdminOpen, setIsAdminOpen, isAuthenticated, login,
    addGalleryImage, deleteGalleryImage, updateStoreConfig, updatePromotion,
    getQuoteItems, addCategory, deleteCategory, addBrand, deleteBrand
  } = useStore();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newProduct, setNewProduct] = useState({ id: '', title: '', price: '', stock: '', image: '', brand: '', category: '', type: '', details: '' });
  const [uploading, setUploading] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [previewPdf, setPreviewPdf] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [quoteStatusFilter, setQuoteStatusFilter] = useState('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [selectedQuoteItems, setSelectedQuoteItems] = useState(null);
  const [isViewingItems, setIsViewingItems] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [currentRef, setCurrentRef] = useState(null);
  const [prodSearch, setProdSearch] = useState('');
  const [prodCatFilter, setProdCatFilter] = useState('all');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchAdmins();
    if (activeTab === 'quotes') { fetchQuotes(); fetchQuoteDetails(); }
    if (activeTab === 'orders') { fetchOrders(); fetchQuoteDetails(); }
  }, [activeTab]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchQuotes();
    fetchOrders();
    fetchQuoteDetails();
    fetchAdmins();
    const cleanup = setupAdminRealtime(fetchQuotes, fetchOrders);
    return cleanup;
  }, [isAuthenticated]);

  const getCustomerInfo = (ref) => {
    const detail = quoteDetails?.find(d => d.reference === ref);
    return detail ? { name: detail.customer_name, phone: detail.customer_phone } : null;
  };

  if (!isAdminOpen) return null;

  if (!isAuthenticated) {
    return <AdminLogin onLogin={login} onCancel={() => setIsAdminOpen(false)} />;
  }

  const handleFileUpload = async (e, isEditing = false, promoId = null, isHero = false) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, isHero ? 'config' : 'productos');
      if (isHero) {
        await updateStoreConfig({ heroImage: url });
        toast.success('Portada actualizada');
      } else if (promoId) {
        await updatePromotion(promoId, { image: url });
        toast.success('Promo actualizada');
      } else if (isEditing) {
        setEditingProduct({ ...editingProduct, image: url });
      } else {
        setNewProduct({ ...newProduct, image: url });
      }
      if (!promoId && !isHero) toast.success('Imagen lista');
    } catch (err) {
      toast.error('Error al subir');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const productToSave = editingProduct ? { ...editingProduct } : { ...newProduct };
      
      // Asegurar tipos numéricos
      productToSave.price = parseFloat(productToSave.price);
      productToSave.stock = parseInt(productToSave.stock);

      let rawDescription = productToSave.details;
      while (typeof rawDescription === 'object' && rawDescription !== null) {
        rawDescription = rawDescription.description || '';
      }

      if (editingProduct) {
        // Estructura exacta solicitada por el usuario para el campo 'details'
        const brandName = data.brands.find(b => b.id === productToSave.brand)?.name || productToSave.brand;
        productToSave.details = {
          type: productToSave.type || '',
          brand: brandName,
          description: rawDescription // el texto del textarea
        };

        await updateProduct(editingProduct.id, productToSave);
        toast.success('Actualizado');
        setEditingProduct(null);
      } else {
        // Estructura exacta para productos nuevos
        const brandName = data.brands.find(b => b.id === productToSave.brand)?.name || productToSave.brand;
        productToSave.details = {
          type: productToSave.type || '',
          brand: brandName,
          description: rawDescription
        };

        await addProduct(productToSave);
        toast.success('Creado');
        setIsAddingProduct(false);
        setNewProduct({ id: '', title: '', price: '', stock: '', image: '', brand: '', category: '', type: '', details: '' });
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar: ' + err.message);
    }
  };


  const handleViewItems = async (q) => {
    setCurrentRef(q.reference);
    setLoadingItems(true);
    setIsViewingItems(true);
    try {
      const items = await getQuoteItems(q.reference);
      setSelectedQuoteItems(items);
    } catch (err) {
      toast.error('Error al cargar detalles');
    } finally {
      setLoadingItems(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'products', label: 'Productos', icon: '📦' },
    { id: 'categories', label: 'Categorías', icon: '📁' },
    { id: 'brands', label: 'Marcas', icon: '✨' },
    { id: 'promotions', label: 'Promociones', icon: '🏷️' },
    { id: 'quotes', label: 'Cotizaciones', icon: '📄' },
    { id: 'orders', label: 'Pedidos', icon: '🛒' },
    { id: 'config', label: 'Configuración', icon: '⚙️' },
    { id: 'users', label: 'Accesos', icon: '🔐' }
  ];

  // Gráficos eliminados temporalmente para estabilidad

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: '#f4f7f6', zIndex: 4000, display: 'flex', flexDirection: isMobile ? 'column' : 'row', fontFamily: "'Inter', sans-serif" }}>
      {/* Overlay para móvil */}
      {isMobile && isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 4900 }} 
        />
      )}

      <aside style={{ 
        width: '260px', 
        background: '#111', 
        color: 'white', 
        display: 'flex', 
        flexDirection: 'column',
        position: isMobile ? 'fixed' : 'relative',
        left: isMobile ? (isMobileMenuOpen ? 0 : '-260px') : 0,
        height: '100%',
        transition: 'all 0.3s ease',
        zIndex: 5000,
        boxShadow: isMobile && isMobileMenuOpen ? '10px 0 30px rgba(0,0,0,0.5)' : 'none'
      }}>
        <div style={{ padding: '2rem 1.5rem', background: 'var(--primary)', color: 'black', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0 }}>VELIYOTH STORE</h2>
          {isMobile && <button onClick={() => setIsMobileMenuOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>}
        </div>
        <nav style={{ flex: 1, padding: '2rem 0', overflowY: 'auto' }}>
          {menuItems.map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); if (isMobile) setIsMobileMenuOpen(false); }} style={{ width: '100%', padding: '1.2rem 2rem', border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '1.2rem', background: activeTab === item.id ? '#1e293b' : 'transparent', color: activeTab === item.id ? '#ffffff' : '#94a3b8', borderLeft: activeTab === item.id ? '5px solid var(--primary)' : '5px solid transparent', fontWeight: activeTab === item.id ? 800 : 600, fontSize: '1.05rem', transition: 'all 0.2s ease' }}>
              <span style={{ fontSize: '1.4rem', opacity: activeTab === item.id ? 1 : 0.7 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '2rem', borderTop: '1px solid #222' }}>
          <button onClick={() => logout()} style={{ width: '100%', padding: '1rem', background: '#334155', color: '#f8fafc', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'center', fontSize: '1.1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', transition: 'all 0.2s ease' }}>
            <span style={{ fontSize: '1.3rem' }}>🚪</span> Salir
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
        <header style={{ height: '70px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'space-between' : 'flex-end', padding: '0 1.5rem' }}>
          {isMobile && (
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              style={{ background: 'none', border: 'none', fontSize: '1.8rem', cursor: 'pointer', padding: '0.5rem' }}
            >
              ☰
            </button>
          )}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {activeTab === 'products' && <button onClick={() => setIsAddingProduct(true)} style={{ background: 'var(--primary)', border: 'none', padding: '0.8rem 1.2rem', borderRadius: '4px', fontWeight: 900, cursor: 'pointer', fontSize: '0.75rem' }}>+ NUEVO PRODUCTO</button>}
            {activeTab === 'users' && <button onClick={() => setIsAddingUser(true)} style={{ background: 'var(--primary)', border: 'none', padding: '0.8rem 1.2rem', borderRadius: '4px', fontWeight: 900, cursor: 'pointer', fontSize: '0.75rem' }}>+ NUEVO USUARIO</button>}
          </div>
        </header>

        <div style={{ flex: 1, padding: isMobile ? '1.2rem' : '2.5rem', overflowY: 'auto' }}>
          {activeTab === 'dashboard' && (
            <div style={{ padding: '0.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', padding: '1.8rem', borderRadius: '20px', color: 'white', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <p style={{ margin: 0, opacity: 0.85, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px' }}>VENTAS DE HOY</p>
                    <h3 style={{ margin: '0.6rem 0', fontSize: '2.2rem', fontWeight: 900 }}>S/ {orders.filter(o => o.status === 'Pagado' && new Date(o.created_at).toDateString() === new Date().toDateString()).reduce((acc, curr) => acc + Number(curr.price), 0).toLocaleString()}</h3>
                    <div style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.2)', padding: '0.3rem 0.7rem', borderRadius: '20px', display: 'inline-block' }}>Solo pedidos pagados</div>
                  </div>
                  <span style={{ position: 'absolute', right: '-10px', bottom: '-10px', fontSize: '5rem', opacity: 0.15 }}>💰</span>
                </div>
                <div style={{ background: 'white', padding: '1.8rem', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div><p style={{ margin: 0, color: '#64748b', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px' }}>PEDIDOS TOTALES</p><h3 style={{ margin: '0.6rem 0', fontSize: '2.2rem', fontWeight: 900, color: '#1e293b' }}>{orders.length}</h3></div>
                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🛒</div>
                  </div>
                  <div style={{ marginTop: '0.8rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.75rem' }}>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>{orders.filter(o => o.status === 'Pagado').length} Pagados</span>
                    <span style={{ color: '#94a3b8' }}>•</span>
                    <span style={{ color: '#ef4444', fontWeight: 700 }}>{orders.filter(o => o.status === 'Pendiente').length} Pendientes</span>
                    <span style={{ color: '#94a3b8' }}>•</span>
                    <span style={{ color: '#3b82f6', fontWeight: 700 }}>{orders.filter(o => o.status === 'Enviado').length} Enviados</span>
                  </div>
                </div>
                <div style={{ background: 'white', padding: '1.8rem', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div><p style={{ margin: 0, color: '#64748b', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px' }}>COTIZACIONES</p><h3 style={{ margin: '0.6rem 0', fontSize: '2.2rem', fontWeight: 900, color: '#1e293b' }}>{quotes.length}</h3></div>
                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📄</div>
                  </div>
                  <div style={{ marginTop: '0.8rem', display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>{quotes.filter(q => q.status === 'Aceptado').length} Aceptadas</span>
                    <span style={{ color: '#94a3b8' }}>•</span>
                    <span style={{ color: '#f59e0b', fontWeight: 700 }}>{quotes.filter(q => q.status === 'Enviado' || !q.status).length} Enviadas</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>📦</div>
                  <div><p style={{ margin: 0, color: '#64748b', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}>Productos</p><h4 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: '#1e293b' }}>{data.products.length}</h4></div>
                </div>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: '#fdf2f8', color: '#db2777', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🏷️</div>
                  <div><p style={{ margin: 0, color: '#64748b', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}>Marcas</p><h4 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: '#1e293b' }}>{data.brands.length}</h4></div>
                </div>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>📂</div>
                  <div><p style={{ margin: 0, color: '#64748b', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}>Categorías</p><h4 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: '#1e293b' }}>{data.categories.length}</h4></div>
                </div>
              </div>

              {/* GRÁFICOS */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr', gap: '1.5rem' }}>
                 {/* Gráficos deshabilitados por estabilidad */}
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>🔍</span>
                  <input 
                    type="text" 
                    placeholder="Buscar por nombre o código..." 
                    value={prodSearch}
                    onChange={(e) => setProdSearch(e.target.value)}
                    style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}
                  />
                </div>
                <select 
                  value={prodCatFilter}
                  onChange={(e) => setProdCatFilter(e.target.value)}
                  style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontSize: '0.9rem', color: '#1e293b', fontWeight: 600, cursor: 'pointer' }}
                >
                  <option value="all">Todas las Categorías</option>
                  {data.categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>

              <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isMobile ? '600px' : 'auto' }}>
                  <thead style={{ background: '#f8fafc', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                    <tr><th style={{ padding: '1.2rem 1.5rem', textAlign: 'left' }}>CÓDIGO</th><th style={{ padding: '1.2rem 1.5rem', textAlign: 'left' }}>PRODUCTO</th><th style={{ padding: '1.2rem', textAlign: 'center' }}>CATEGORÍA</th><th style={{ padding: '1.2rem', textAlign: 'center' }}>PRECIO (S/)</th><th style={{ padding: '1.2rem 1.5rem', textAlign: 'right' }}>ACCIONES</th></tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const filtered = data.products
                        .filter(p => prodCatFilter === 'all' || p.category === prodCatFilter)
                        .filter(p => p.title.toLowerCase().includes(prodSearch.toLowerCase()) || p.id.toLowerCase().includes(prodSearch.toLowerCase()));
                      
                      if (filtered.length === 0) {
                        return <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', fontWeight: 600 }}>No se encontraron productos con estos filtros</td></tr>;
                      }

                      return filtered.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '1rem 1.5rem', fontWeight: 800, color: '#64748b', fontSize: '0.75rem' }}>{p.id}</td>
                          <td style={{ padding: '1rem 1.5rem' }}><div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{p.title}</div><div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{p.brand}</div></td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <span style={{ padding: '0.3rem 0.8rem', background: '#f1f5f9', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700 }}>
                              {data.categories.find(c => c.id === p.category)?.name || p.category}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 800 }}>S/ {Number(p.price || 0).toFixed(2)}</td>
                          <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}><button onClick={() => setEditingProduct({...p})} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#f97316', marginRight: '1rem' }}>✏️</button><button onClick={() => { if(window.confirm('¿Eliminar?')) deleteProduct(p.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#cbd5e1' }}>🗑️</button></td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'orders' && (
            <>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                Gestión de Pedidos
                <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', flex: isMobile ? '1' : 'none' }}>
                  <div style={{ position: 'relative', width: isMobile ? '100%' : '250px' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                    <input 
                      type="text" 
                      placeholder="Buscar cliente..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.5rem', borderRadius: '50px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                  <select 
                    value={orderStatusFilter} 
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    style={{ padding: '0.8rem 1rem', borderRadius: '50px', border: '1px solid #e2e8f0', background: 'white', fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', cursor: 'pointer', outline: 'none', minWidth: '130px' }}
                  >
                    <option value="all">Todos los Estados</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Pagado">Pagado</option>
                    <option value="Enviado">Enviado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
              </h2>

              {isMobile ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {(() => {
                    const combinedOrders = orders.filter(ord => {
                      const info = getCustomerInfo(ord.reference);
                      const search = searchTerm.toLowerCase();
                      const matchesSearch = ord.reference?.toLowerCase().includes(search) || 
                                           info?.name?.toLowerCase().includes(search) || 
                                           ord.product_title?.toLowerCase().includes(search);
                      const matchesStatus = orderStatusFilter === 'all' || ord.status === orderStatusFilter;
                      return matchesSearch && matchesStatus;
                    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

                    return combinedOrders.map((ord, index) => (
                    <div key={ord.id} style={{ background: 'white', padding: '1.2rem', borderRadius: '15px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.85rem' }}>{ord.reference || '-'}</span>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>#{combinedOrders.length - index}</div>
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{new Date(ord.created_at).toLocaleDateString()}</div>
                          </div>
                      </div>
                      
                      <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                        {(() => { 
                          const info = getCustomerInfo(ord.reference); 
                          return (
                            <>
                              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b', marginBottom: '0.3rem' }}>{info?.name || 'Cliente sin nombre'}</div>
                              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{ord.product_title}</div>
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Cód: {ord.product_id} • {ord.brand?.toUpperCase()}</div>
                              {info?.phone && (<div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, marginTop: '5px' }}>📱 {info.phone}</div>)}
                            </>
                          ); 
                        })()}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Total</div>
                          <div style={{ fontWeight: 900, fontSize: '1.2rem', color: '#1e293b' }}>S/ {ord.price}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                          <select value={ord.status} onChange={async (e) => { 
                            const newStatus = e.target.value; 
                            try { 
                              if (newStatus === 'Cancelado') { 
                                if (window.confirm('¿Cancelar este pedido?')) { 
                                  await updateOrder(ord.id, { status: 'Cancelado' });
                                  const quote = quotes.find(q => q.reference === ord.reference);
                                  if (quote) await updateQuote(quote.id, { status: 'Rechazado' });
                                  toast.success('Pedido cancelado'); 
                                } 
                              } else { 
                                await updateOrder(ord.id, { status: newStatus }); 
                                if (newStatus === 'Pagado' && ord.product_id !== 'MULTI') {
                                  const product = data.products.find(p => String(p.id) === String(ord.product_id));
                                  if (product && product.stock > 0) await updateProduct(product.id, { stock: product.stock - 1 });
                                }
                                toast.success('Actualizado'); 
                              } 
                            } catch (err) { toast.error('Error'); } 
                          }} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.75rem', fontWeight: 800, background: ord.status === 'Pagado' ? '#dcfce7' : '#fef9c3', color: ord.status === 'Pagado' ? '#166534' : '#854d0e' }}>
                            <option value="Pendiente">Pendiente</option><option value="Pagado">Pagado</option><option value="Enviado">Enviado</option><option value="Cancelado">Cancelado</option>
                            {ord._isQuote && <option value="Aceptado">Aceptado</option>}
                          </select>
                          <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center', marginTop: '0.5rem' }}>
                            <button onClick={async () => {
                              toast.loading('Generando PDF...', { id: 'pdf-ord-mob' });
                              try {
                                const info = getCustomerInfo(ord.reference);
                                let pdfItems = [];
                                if (ord._isQuote) {
                                  const items = await getQuoteItems(ord.reference);
                                  pdfItems = items.map(it => ({ ...it, title: it.product_title }));
                                } else {
                                  pdfItems = [{ ...ord, title: ord.product_title }];
                                }
                                
                                const blob = await generateProfessionalPDF(pdfItems, { name: info?.name, phone: info?.phone, reference: ord.reference, output: 'blob' });
                                if (blob) {
                                  setPreviewPdf(URL.createObjectURL(blob));
                                  toast.success('Listo', { id: 'pdf-ord-mob' });
                                } else {
                                  toast.error('Error', { id: 'pdf-ord-mob' });
                                }
                              } catch (e) {
                                console.error(e);
                                toast.error('Error al generar PDF', { id: 'pdf-ord-mob' });
                              }
                            }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem' }}>📄</button>
                            <button onClick={() => { if(window.confirm('¿Eliminar pedido?')) deleteOrder(ord.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', color: '#cbd5e1' }}>🗑️</button>
                          </div>
                        </div>
                      </div>
                    </div>
                    ))
                  })()}
                </div>
              ) : (
                <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                    <thead style={{ background: '#f8fafc', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                      <tr><th style={{ padding: '1.2rem 1.5rem', textAlign: 'left' }}>REFERENCIA</th><th style={{ padding: '1.2rem 1.5rem', textAlign: 'left' }}>ORDEN</th><th style={{ padding: '1.2rem 1.5rem', textAlign: 'left' }}>PRODUCTO / CLIENTE</th><th style={{ padding: '1.2rem', textAlign: 'center' }}>TOTAL (S/)</th><th style={{ padding: '1.2rem', textAlign: 'center' }}>ESTADO</th><th style={{ padding: '1.2rem 1.5rem', textAlign: 'right' }}>ACCIONES</th></tr>
                    </thead>
                    <tbody>
                    {(() => {
                      const combinedOrders = orders.filter(ord => {
                        const info = getCustomerInfo(ord.reference);
                        const search = searchTerm.toLowerCase();
                        const matchesSearch = ord.reference?.toLowerCase().includes(search) || 
                                             info?.name?.toLowerCase().includes(search) || 
                                             ord.product_title?.toLowerCase().includes(search);
                        const matchesStatus = orderStatusFilter === 'all' || ord.status === orderStatusFilter;
                        return matchesSearch && matchesStatus;
                      }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

                      return combinedOrders.map((ord, index) => (
                        <tr key={ord.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '1rem 1.5rem', fontWeight: 800, color: 'var(--primary)', fontSize: '0.85rem' }}>{ord.reference || '-'}</td>
                          <td style={{ padding: '1rem 1.5rem' }}><div style={{ fontWeight: 800, fontSize: '0.85rem' }}>#{combinedOrders.length - index}</div><div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{new Date(ord.created_at).toLocaleDateString()}</div></td>
                          <td style={{ padding: '1rem 1.5rem' }}>{(() => { const info = getCustomerInfo(ord.reference); return (<><div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1e293b' }}>{info?.name || 'Cliente sin nombre'}</div><div style={{ fontSize: '0.75rem', color: '#64748b' }}>{ord.product_title}</div><div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Cód: {ord.product_id} • {ord.brand?.toUpperCase()}</div>{info?.phone && (<div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, marginTop: '2px' }}>📱 {info.phone}</div>)}</>); })()}</td>
                          <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 800 }}>S/ {Number(ord.price || 0).toFixed(2)}</td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <select value={ord.status} onChange={async (e) => { 
                                 const newStatus = e.target.value; 
                                 try { 
                                   await updateOrder(ord.id, { status: newStatus }); 
                                   if (newStatus === 'Pagado' && ord.product_id !== 'MULTI') {
                                     const product = data.products.find(p => String(p.id) === String(ord.product_id));
                                     if (product && product.stock > 0) await updateProduct(product.id, { stock: product.stock - 1 });
                                   }
                                   toast.success('Actualizado'); 
                                 } catch (err) { toast.error('Error'); } 
                               }} style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.75rem', fontWeight: 700, background: ord.status === 'Pagado' ? '#dcfce7' : '#fef9c3' }}>
                                <option value="Pendiente">Pendiente</option>
                                <option value="Pagado">Pagado</option>
                                <option value="Enviado">Enviado</option>
                                <option value="Cancelado">Cancelado</option>
                              </select>
                          </td>
                          <td style={{ padding: '1.5rem', textAlign: 'right', width: '150px' }}>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                              <button onClick={async () => {
                                toast.loading('Generando PDF...', { id: 'pdf-ord' });
                                try {
                                  const info = getCustomerInfo(ord.reference);
                                  let pdfItems = [];
                                  if (ord.product_id === 'MULTI') {
                                    const items = await getQuoteItems(ord.reference);
                                    pdfItems = items.map(it => ({ ...it, title: it.product_title }));
                                  } else {
                                    pdfItems = [{ ...ord, title: ord.product_title }];
                                  }

                                  const blob = await generateProfessionalPDF(pdfItems, { name: info?.name, phone: info?.phone, reference: ord.reference, commercialConditions: data.commercialConditions, output: 'blob' });
                                  if (blob) {
                                    setPreviewPdf(URL.createObjectURL(blob));
                                    toast.success('Listo', { id: 'pdf-ord' });
                                  } else {
                                    toast.error('Error', { id: 'pdf-ord' });
                                  }
                                } catch (e) {
                                  console.error(e);
                                  toast.error('Error al generar PDF', { id: 'pdf-ord' });
                                }
                              }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>📄</button>
                              <button onClick={() => { if(window.confirm('¿Eliminar pedido?')) deleteOrder(ord.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#cbd5e1' }}>🗑️</button>
                            </div>
                          </td>
                        </tr>
                        ))
                      })()}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {activeTab === 'quotes' && (
            <>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                Gestión de Cotizaciones
                <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', flex: isMobile ? '1' : 'none' }}>
                  <div style={{ position: 'relative', width: isMobile ? '100%' : '250px' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                    <input 
                      type="text" 
                      placeholder="Buscar cliente..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.5rem', borderRadius: '50px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                  <select 
                    value={quoteStatusFilter} 
                    onChange={(e) => setQuoteStatusFilter(e.target.value)}
                    style={{ padding: '0.8rem 1rem', borderRadius: '50px', border: '1px solid #e2e8f0', background: 'white', fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', cursor: 'pointer', outline: 'none', minWidth: '130px' }}
                  >
                    <option value="all">Todos los Estados</option>
                    <option value="Enviado">Enviado</option>
                    <option value="Aceptado">Aceptado</option>
                    <option value="Rechazado">Rechazado</option>
                  </select>
                </div>
              </h2>

              {!isMobile ? (
                <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', overflowX: 'auto', marginBottom: '1rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                    <thead style={{ background: '#f8fafc', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                      <tr>
                        <th style={{ padding: '1.2rem 1.5rem', textAlign: 'left' }}>REFERENCIA</th>
                        <th style={{ padding: '1.2rem 1.5rem', textAlign: 'left' }}>CLIENTE / PRODUCTO</th>
                        <th style={{ padding: '1.2rem', textAlign: 'center' }}>FECHA</th>
                        <th style={{ padding: '1.2rem', textAlign: 'center' }}>TOTAL (S/)</th>
                        <th style={{ padding: '1.2rem', textAlign: 'center' }}>ESTADO</th>
                        <th style={{ padding: '1.2rem 1.5rem', textAlign: 'right' }}>ACCIONES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotes.filter(q => {
                        const info = getCustomerInfo(q.reference);
                        const search = searchTerm.toLowerCase();
                        const matchesSearch = q.reference?.toLowerCase().includes(search) || 
                                             info?.name?.toLowerCase().includes(search) || 
                                             q.product_title?.toLowerCase().includes(search);
                        const matchesStatus = quoteStatusFilter === 'all' || q.status === quoteStatusFilter;
                        return matchesSearch && matchesStatus;
                      }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                      .map((q) => {
                        const info = getCustomerInfo(q.reference);
                        return (
                          <tr key={q.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '1.5rem', fontWeight: 800, color: 'var(--primary)', width: '120px' }}>{q.reference}</td>
                            <td style={{ padding: '1.5rem' }}>
                              <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{info?.name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{q.product_title}</div>
                            </td>
                            <td style={{ padding: '1.5rem', textAlign: 'center', width: '110px', fontSize: '0.85rem' }}>{new Date(q.created_at).toLocaleDateString()}</td>
                            <td style={{ padding: '1.5rem', textAlign: 'center', fontWeight: 800, width: '120px' }}>S/ {Number(q.price).toFixed(2)}</td>
                            <td style={{ padding: '1.5rem', textAlign: 'center', width: '130px' }}>
                              <select 
                                value={q.status || 'Enviado'} 
                                onChange={async (e) => {
                                  const newStatus = e.target.value;
                                  try {
                                    if (newStatus === 'Aceptado' && q.status !== 'Aceptado') {
                                      await updateQuote(q.id, { status: 'Aceptado' });
                                      const existingOrder = orders.find(o => o.reference === q.reference);
                                      if (existingOrder) {
                                        await updateOrder(existingOrder.id, { status: 'Pendiente' });
                                        toast.success('Pedido actualizado a Pendiente');
                                      } else {
                                        await addOrder({
                                          product_id: 'MULTI',
                                          product_title: q.product_title,
                                          price: q.price,
                                          reference: q.reference,
                                          status: 'Pendiente'
                                        });
                                        toast.success('Cotización movida a Pedidos');
                                      }
                                    } else {
                                      await updateQuote(q.id, { status: newStatus });
                                      toast.success('Estado actualizado');
                                    }
                                  } catch (err) {
                                    console.error(err);
                                    toast.error('Error al actualizar estado');
                                  }
                                }}
                                style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.75rem', fontWeight: 700, background: q.status === 'Aceptado' ? '#dcfce7' : q.status === 'Rechazado' ? '#fee2e2' : '#fef9c3' }}
                              >
                                <option value="Enviado">Enviado</option>
                                <option value="Aceptado">Aceptado</option>
                                <option value="Rechazado">Rechazado</option>
                              </select>
                            </td>
                            <td style={{ padding: '1.6rem 1.5rem', textAlign: 'right', width: '250px' }}>
                              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                                <button onClick={() => handleViewItems(q)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>DETALLES 👁️</button>
                                <button onClick={async () => {
                                  toast.loading('Generando vista previa...', { id: 'pdf-prev' });
                                  const items = await getQuoteItems(q.reference);
                                  const blob = await generateProfessionalPDF(items.map(it => ({ ...it, title: it.product_title })), { name: info?.name, phone: info?.phone, reference: q.reference, commercialConditions: data.commercialConditions, output: 'blob' });
                                  if (blob) {
                                    setPreviewPdf(URL.createObjectURL(blob));
                                    toast.success('Listo', { id: 'pdf-prev' });
                                  } else {
                                    toast.error('Error al generar PDF', { id: 'pdf-prev' });
                                  }
                                }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>📄</button>
                                <button onClick={() => { if(window.confirm('¿Eliminar?')) deleteQuote(q.id).then(fetchQuotes) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#cbd5e1' }}>🗑️</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                // Vista móvil (mantiene el diseño de tarjetas)
                quotes.filter(q => {
                  const info = getCustomerInfo(q.reference);
                  const search = searchTerm.toLowerCase();
                  const matchesSearch = q.reference?.toLowerCase().includes(search) || 
                                       info?.name?.toLowerCase().includes(search) || 
                                       q.product_title?.toLowerCase().includes(search);
                  const matchesStatus = quoteStatusFilter === 'all' || q.status === quoteStatusFilter;
                  return matchesSearch && matchesStatus;
                }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .map((q) => {
                  const info = getCustomerInfo(q.reference);
                  return (
                    <div key={q.id} style={{ background: 'white', padding: '1.2rem', borderRadius: '15px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.85rem' }}>{q.reference}</span>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{new Date(q.created_at).toLocaleDateString()}</span>
                      </div>
                      <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b', marginBottom: '0.3rem' }}>{info?.name || 'Cliente'}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{q.product_title}</div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Precio</div>
                          <div style={{ fontWeight: 900, fontSize: '1.2rem', color: '#1e293b' }}>S/ {Number(q.price).toFixed(2)}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Estado</div>
                          <select 
                            value={q.status || 'Enviado'} 
                            onChange={async (e) => {
                              const newStatus = e.target.value;
                              try {
                                if (newStatus === 'Aceptado' && q.status !== 'Aceptado') {
                                  await updateQuote(q.id, { status: 'Aceptado' });
                                  const existingOrder = orders.find(o => o.reference === q.reference);
                                  if (existingOrder) {
                                    await updateOrder(existingOrder.id, { status: 'Pendiente' });
                                    toast.success('Pedido actualizado a Pendiente');
                                  } else {
                                    await addOrder({
                                      product_id: 'MULTI',
                                      product_title: q.product_title,
                                      price: q.price,
                                      reference: q.reference,
                                      status: 'Pendiente'
                                    });
                                    toast.success('Cotización movida a Pedidos');
                                  }
                                } else {
                                  await updateQuote(q.id, { status: newStatus });
                                  toast.success('Estado actualizado');
                                }
                              } catch (err) {
                                console.error(err);
                                toast.error('Error al actualizar estado');
                              }
                            }}
                            style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.75rem', fontWeight: 700, background: q.status === 'Aceptado' ? '#dcfce7' : q.status === 'Rechazado' ? '#fee2e2' : '#fef9c3' }}
                          >
                            <option value="Enviado">Enviado</option>
                            <option value="Visto">Visto</option>
                            <option value="Aceptado">Aceptado</option>
                            <option value="Rechazado">Rechazado</option>
                          </select>
                        </div>
                         <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                           <button onClick={() => handleViewItems(q)} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800 }}>VER DETALLE 👁️</button>
                          <button onClick={async () => {
                            const items = await getQuoteItems(q.reference);
                            generateProfessionalPDF(items.map(it => ({ ...it, title: it.product_title })), { name: info?.name, phone: info?.phone, reference: q.reference, commercialConditions: data.commercialConditions });
                          }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>📄</button>
                          <button onClick={() => { if(window.confirm('¿Eliminar?')) deleteQuote(q.id).then(fetchQuotes) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: '#cbd5e1' }}>🗑️</button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}

          {activeTab === 'users' && (
            <>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem' }}>Gestión de Accesos</h2>
              <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isMobile ? '500px' : 'auto' }}>
                  <thead style={{ background: '#f8fafc', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                    <tr><th style={{ padding: '1.2rem 1.5rem', textAlign: 'left' }}>EMAIL</th><th style={{ padding: '1.2rem', textAlign: 'center' }}>AUTORIZADO</th><th style={{ padding: '1.2rem 1.5rem', textAlign: 'right' }}>ACCIONES</th></tr>
                  </thead>
                  <tbody>
                    {admins.map(adm => { const isSuperUser = adm.email === 'veliyothstore@gmail.com'; return (
                      <tr key={adm.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '1rem 1.5rem', fontWeight: 700, fontSize: '0.9rem' }}>{adm.email}</td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>{!isSuperUser && (<input type="checkbox" checked={adm.active} onChange={(e) => updateAdmin(adm.id, { active: e.target.checked })} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}/>)}</td>
                        <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}><button onClick={() => setEditingUser(adm)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#f97316', marginRight: '1rem' }}>✏️</button>{!isSuperUser && (<button onClick={() => { if(window.confirm(`¿Eliminar acceso a ${adm.email}?`)) deleteAdmin(adm.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#cbd5e1' }}>🗑️</button>)}</td>
                      </tr>
                    );})}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'categories' && (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '1.5rem' : '2.5rem' }}>
              <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 1.5rem 0', fontWeight: 800 }}>Añadir Categoría</h4>
                <div style={{ display: 'flex', gap: '1rem' }}><input type="text" value={newCatName} onChange={(e) => setNewCatName(e.target.value.toUpperCase())} placeholder="EJ. ACCESORIOS" style={{ flex: 1, padding: '0.8rem', borderRadius: '4px', border: '1px solid #e2e8f0', textTransform: 'uppercase' }} /><button onClick={() => { addCategory(newCatName); setNewCatName(''); }} style={{ background: 'var(--primary)', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '4px', fontWeight: 900, cursor: 'pointer' }}>AGREGAR</button></div>
              </div>
              <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 1.5rem 0', fontWeight: 800 }}>Categorías Actuales</h4>
                {data.categories.map(cat => (<div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderRadius: '4px', marginBottom: '0.5rem' }}><span style={{ fontWeight: 700 }}>{cat.name}</span><button onClick={() => deleteCategory(cat.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1' }}>🗑️</button></div>))}
              </div>
            </div>
          )}

          {activeTab === 'brands' && (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '1.5rem' : '2.5rem' }}>
              <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 1.5rem 0', fontWeight: 800 }}>Añadir Marca</h4>
                <div style={{ display: 'flex', gap: '1rem' }}><input type="text" value={newBrandName} onChange={(e) => setNewBrandName(e.target.value.toUpperCase())} placeholder="EJ. HP" style={{ flex: 1, padding: '0.8rem', borderRadius: '4px', border: '1px solid #e2e8f0', textTransform: 'uppercase' }} /><button onClick={() => { addBrand(newBrandName); setNewBrandName(''); }} style={{ background: 'var(--primary)', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '4px', fontWeight: 900, cursor: 'pointer' }}>AGREGAR</button></div>
              </div>
              <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 1.5rem 0', fontWeight: 800 }}>Marcas Actuales</h4>
                {data.brands.map(b => (<div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 1rem', borderBottom: '1px solid #f1f5f9' }}><span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{b.name}</span><button onClick={() => deleteBrand(b.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1' }}>🗑️</button></div>))}
              </div>
            </div>
          )}

          {activeTab === 'promotions' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {data.promotions.map(promo => (
                <div key={promo.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <div style={{ height: '150px', background: '#f8fafc', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}><img src={promo.image} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /></div>
                  <label style={{ display: 'inline-block', background: 'white', border: '1px solid var(--primary)', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>📷 Cambiar Imagen<input type="file" hidden onChange={(e) => handleFileUpload(e, false, promo.id)} /></label>
                  <input type="text" value={promo.title} onChange={(e) => updatePromotion(promo.id, { title: e.target.value.toUpperCase() })} style={{ width: '100%', padding: '0.7rem', borderRadius: '4px', border: '1px solid #e2e8f0', marginBottom: '1rem', fontWeight: 700, textTransform: 'uppercase' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', textAlign: 'left' }}><label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}><input type="checkbox" checked={promo.active} onChange={(e) => updatePromotion(promo.id, { active: e.target.checked })} /> Mostrar en Carrusel Web</label><label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}><input type="checkbox" checked={promo.showdiscount} onChange={(e) => updatePromotion(promo.id, { showdiscount: e.target.checked })} /> Mostrar etiqueta "10% OFF"</label></div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'config' && (
            <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ background: 'white', padding: isMobile ? '1.5rem' : '3rem', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <h4 style={{ textAlign: 'left', fontWeight: 800, marginBottom: '2rem' }}>Imagen de Portada (Hero)</h4>
                <div style={{ background: '#f8fafc', borderRadius: '12px', padding: isMobile ? '1rem' : '2rem', marginBottom: '2rem' }}><img src={data.heroImage} alt="Hero" style={{ maxWidth: '100%', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} /></div>
                <label style={{ display: 'block', background: 'var(--primary)', color: 'black', padding: '1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 900, fontSize: '1rem', textTransform: 'uppercase' }}>📷 CAMBIAR IMAGEN DE PORTADA<input type="file" hidden onChange={(e) => handleFileUpload(e, false, null, true)} /></label>
              </div>
              <div style={{ background: 'white', padding: isMobile ? '1.5rem' : '3rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ textAlign: 'left', fontWeight: 800, marginBottom: '2rem' }}>Condiciones Comerciales (PDF)</h4>
                <textarea 
                  value={data.commercialConditions || ''} 
                  onChange={(e) => updateStoreConfig({ commercialConditions: e.target.value })} 
                  style={{ width: '100%', minHeight: '150px', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontFamily: 'monospace', fontSize: '0.9rem' }} 
                  placeholder="Ej: Forma de pago: 70% adelanto..."
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {(isAddingUser || editingUser) && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '500px', borderRadius: '12px', padding: isMobile ? '1.5rem' : '2.5rem' }}>
            <h3 style={{ margin: '0 0 2rem 0', fontWeight: 900 }}>{isAddingUser ? 'NUEVO' : 'EDITAR'} USUARIO</h3>
            <form onSubmit={async (e) => { e.preventDefault(); const email = e.target.new_user_email.value; const pass = e.target.new_user_password?.value; const confirm = e.target.new_user_confirm?.value; const active = e.target.active?.checked ?? true; if (isAddingUser && pass !== confirm) return toast.error('Las contraseñas no coinciden'); try { if (isAddingUser) { await signUpAdmin(email, pass, active); toast.success('Creado'); } else { await updateAdmin(editingUser.id, { email, active }); if (pass) await changePassword(pass); toast.success('Actualizado'); } setIsAddingUser(false); setEditingUser(null); } catch (err) { toast.error('Error: ' + err.message); } }}>
              <div style={{ marginBottom: '1.2rem' }}><label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, marginBottom: '0.5rem' }}>EMAIL</label><input name="new_user_email" type="email" autoComplete="off" required disabled={editingUser?.email === 'veliyothstore@gmail.com'} defaultValue={editingUser?.email || ''} style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd', background: editingUser?.email === 'veliyothstore@gmail.com' ? '#f8fafc' : 'white' }} /></div>
              <div style={{ marginBottom: '1.2rem' }}><label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, marginBottom: '0.5rem' }}>{editingUser ? 'NUEVA CONTRASEÑA' : 'CONTRASEÑA'}</label><input name="new_user_password" type="password" autoComplete="new-password" required={isAddingUser} placeholder={editingUser ? 'Dejar en blanco para no cambiar' : ''} style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd' }} /></div>
              <div style={{ marginBottom: '1.2rem' }}><label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, marginBottom: '0.5rem' }}>REPETIR CONTRASEÑA</label><input name="new_user_confirm" type="password" autoComplete="new-password" required={isAddingUser} style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd' }} /></div>
              {editingUser?.email !== 'veliyothstore@gmail.com' && (<div style={{ marginBottom: '2rem' }}><label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer' }}><input name="active" type="checkbox" defaultChecked={editingUser ? editingUser.active : true} style={{ width: '18px', height: '18px' }} /> Habilitado</label></div>)}
              <div style={{ display: 'flex', gap: '1.5rem' }}><button type="button" onClick={() => { setIsAddingUser(false); setEditingUser(null); }} style={{ flex: 1, padding: '1rem', borderRadius: '4px', border: '1px solid #ddd', background: 'none', cursor: 'pointer', fontWeight: 700 }}>CANCELAR</button><button type="submit" className="btn-primary" style={{ flex: 1, padding: '1rem', fontWeight: 900 }}>{isAddingUser ? 'CREAR USUARIO' : 'GUARDAR CAMBIOS'}</button></div>
            </form>
          </div>
        </div>
      )}

      {(editingProduct || isAddingProduct) && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '600px', borderRadius: '12px', padding: isMobile ? '1.5rem' : '2.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 2rem 0', fontWeight: 900 }}>{editingProduct ? 'EDITAR' : 'NUEVO'} PRODUCTO</h3>
            <form onSubmit={handleSaveProduct}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.2rem' }}>
                <div><label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, marginBottom: '0.5rem' }}>CÓDIGO (ID)</label><input type="text" required disabled={!!editingProduct} value={editingProduct ? editingProduct.id : newProduct.id} onChange={(e) => setNewProduct({...newProduct, id: e.target.value.toUpperCase().replace(/\s+/g, '')})} placeholder="EJ: SKU-001" style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd', background: editingProduct ? '#f8fafc' : 'white', textTransform: 'uppercase' }} /></div>
                <div><label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, marginBottom: '0.5rem' }}>TÍTULO</label><input type="text" required value={editingProduct ? editingProduct.title : newProduct.title} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, title: e.target.value.toUpperCase()}) : setNewProduct({...newProduct, title: e.target.value.toUpperCase()})} style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd', textTransform: 'uppercase' }} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.2rem' }}>
                <div><label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800 }}>PRECIO (S/)</label><input type="number" step="0.01" required value={editingProduct ? editingProduct.price : newProduct.price} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, price: e.target.value}) : setNewProduct({...newProduct, price: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd' }} /></div>
                <div><label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800 }}>STOCK</label><input type="number" required value={editingProduct ? editingProduct.stock : newProduct.stock} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, stock: e.target.value}) : setNewProduct({...newProduct, stock: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd' }} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.2rem', marginBottom: '1.2rem' }}>
                <div><label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800 }}>CATEGORÍA</label><select required value={editingProduct ? editingProduct.category : newProduct.category} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, category: e.target.value}) : setNewProduct({...newProduct, category: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd' }}><option value="">Seleccionar...</option>{data.categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select></div>
                <div><label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800 }}>MARCA</label><select required value={editingProduct ? editingProduct.brand : newProduct.brand} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, brand: e.target.value}) : setNewProduct({...newProduct, brand: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd' }}><option value="">Seleccionar...</option>{data.brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
                <div><label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800 }}>TIPO (JSON)</label><input type="text" placeholder="EJ: IP" value={editingProduct ? editingProduct.type : newProduct.type} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, type: e.target.value.toUpperCase()}) : setNewProduct({...newProduct, type: e.target.value.toUpperCase()})} style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd', textTransform: 'uppercase' }} /></div>
              </div>
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, marginBottom: '0.5rem' }}>DESCRIPCIÓN / DETALLES</label>
                <textarea 
                  value={(() => {
                    let val = editingProduct ? editingProduct.details : newProduct.details;
                    while (typeof val === 'object' && val !== null) {
                        val = val.description || '';
                    }
                    return val || '';
                  })()} 
                  onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, details: e.target.value}) : setNewProduct({...newProduct, details: e.target.value})} 
                  placeholder="Detalles técnicos del producto..."
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd', minHeight: '120px', fontFamily: 'monospace', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, marginBottom: '0.5rem' }}>IMAGEN PRINCIPAL</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  {(editingProduct?.image || newProduct.image) && <img src={editingProduct ? editingProduct.image : newProduct.image} alt="" style={{ width: '50px', height: '50px', objectFit: 'contain', border: '1px solid #eee' }} />}
                  <input type="file" onChange={(e) => handleFileUpload(e, !!editingProduct)} style={{ fontSize: '0.8rem' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem' }}><button type="button" onClick={() => { setEditingProduct(null); setIsAddingProduct(false); }} style={{ flex: 1, padding: '1rem', borderRadius: '4px', border: '1px solid #ddd', background: 'none', cursor: 'pointer', fontWeight: 700 }}>CANCELAR</button><button type="submit" disabled={uploading} className="btn-primary" style={{ flex: 2, padding: '1rem', fontWeight: 900 }}>{uploading ? 'SUBIENDO...' : 'GUARDAR PRODUCTO'}</button></div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL VISTA PREVIA PDF */}
      {previewPdf && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 6000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '0.5rem' : '2rem' }}>
          <div style={{ width: '100%', maxWidth: '900px', height: isMobile ? '95vh' : '90vh', background: 'white', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div style={{ padding: '0.8rem 1.2rem', background: '#1e293b', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ margin: 0, fontSize: isMobile ? '0.8rem' : '1rem', fontWeight: 700 }}>VISTA PREVIA</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <a href={previewPdf} download="Cotizacion.pdf" style={{ background: 'var(--primary)', color: 'black', textDecoration: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', fontWeight: 800, fontSize: '0.7rem' }}>DESCARGAR</a>
                <button onClick={() => setPreviewPdf(null)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 800, fontSize: '0.7rem' }}>CERRAR</button>
              </div>
            </div>
            <iframe src={previewPdf} style={{ width: '100%', flex: 1, border: 'none' }} title="Vista Previa PDF" />
            {isMobile && (
              <div style={{ padding: '0.6rem', background: '#f1f5f9', color: '#475569', fontSize: '0.65rem', textAlign: 'center', fontWeight: 600 }}>
                ¿No carga el PDF? Usa el botón <b>DESCARGAR</b>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Detalles de Cotización */}
      {isViewingItems && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '800px', borderRadius: '15px', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            <div style={{ padding: '1.5rem', background: '#1e293b', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Detalle de Cotización: {currentRef}</h3>
              <button onClick={() => { setIsViewingItems(false); setSelectedQuoteItems(null); }} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
              {loadingItems ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando productos...</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '0.8rem', textAlign: 'left' }}>
                      <th style={{ padding: '0.8rem' }}>PRODUCTO</th>
                      <th style={{ padding: '0.8rem' }}>MARCA</th>
                      <th style={{ padding: '0.8rem', textAlign: 'center' }}>CANT</th>
                      <th style={{ padding: '0.8rem', textAlign: 'right' }}>PRECIO UNIT.</th>
                      <th style={{ padding: '0.8rem', textAlign: 'right' }}>SUBTOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedQuoteItems?.map((it, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.8rem', fontWeight: 700, fontSize: '0.85rem' }}>{it.product_title}</td>
                        <td style={{ padding: '0.8rem', fontSize: '0.8rem' }}>{it.brand}</td>
                        <td style={{ padding: '0.8rem', textAlign: 'center', fontWeight: 800 }}>{it.quantity}</td>
                        <td style={{ padding: '0.8rem', textAlign: 'right' }}>S/ {Number(it.price).toFixed(2)}</td>
                        <td style={{ padding: '0.8rem', textAlign: 'right', fontWeight: 800 }}>S/ {(Number(it.price) * Number(it.quantity)).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div style={{ padding: '1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => { setIsViewingItems(false); setSelectedQuoteItems(null); }} style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none', background: '#1e293b', color: 'white', fontWeight: 800, cursor: 'pointer' }}>CERRAR</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
