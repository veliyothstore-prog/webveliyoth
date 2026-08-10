import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { cartService } from '../services/cartService';

import { notificationService } from '../services/notificationService';

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  // ... state declarations ...
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ products: [], categories: [], brands: [], promotions: [], gallery: [], heroImage: '/hero.png', version: '1.5', commercialConditions: '' });
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [orders, setOrders] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [quoteDetails, setQuoteDetails] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [filters, setFilters] = useState({ search: '', brand: 'all', range: 'all', type: 'all', minPrice: 0, maxPrice: 10000 });
  const [viewingImage, setViewingImage] = useState(null);
  const [cart, setCart] = useState(cartService.getCart());

  // Cart Actions
  const addToCart = (product, qty) => { setCart(cartService.addToCart(cart, product, qty)); };
  const removeFromCart = (id) => { setCart(cartService.removeFromCart(cart, id)); };
  const updateCartQty = (id, qty) => { setCart(cartService.updateQuantity(cart, id, qty)); };
  const clearCart = () => { setCart(cartService.clearCart()); };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [initialData, ordersData, quotesData, details, adminsData] = await Promise.all([
          productService.fetchInitialData(), orderService.fetchOrders(), orderService.fetchQuotes(), 
          orderService.fetchQuoteDetails(), authService.fetchAdmins()
        ]);
        setData(initialData); setOrders(ordersData); setQuotes(quotesData); setQuoteDetails(details); setAdmins(adminsData);
      } catch (e) { console.error('Error init:', e); } finally { setLoading(false); }
    };
    init();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null); setIsAuthenticated(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Auth Wrappers
  const login = async (email, pass) => { await authService.login(email, pass); };
  const logout = async () => { await authService.logout(); setUser(null); setIsAuthenticated(false); setIsAdminOpen(false); };
  const fetchAdmins = async () => { setAdmins(await authService.fetchAdmins()); };
  const addAdmin = async (email, active) => { await authService.addAdmin(email, active); await fetchAdmins(); };
  const updateAdmin = async (id, upd) => { await authService.updateAdmin(id, upd); await fetchAdmins(); };
  const signUpAdmin = async (email, pass) => { await authService.signUpAdmin(email, pass); await addAdmin(email, true); };
  const deleteAdmin = async (id) => { await authService.deleteAdmin(id); await fetchAdmins(); };
  const changePassword = async (pass) => { await authService.changePassword(pass); };

  // Product Wrappers
  const updateProduct = async (id, upd) => { await productService.updateProduct(id, upd); setData(p => ({ ...p, products: p.products.map(pr => pr.id === id ? { ...pr, ...upd } : pr) })); };
  const addProduct = async (prod) => { const n = await productService.addProduct(prod); setData(p => ({ ...p, products: [...p.products, n] })); };
  const deleteProduct = async (id) => { await productService.deleteProduct(id); setData(p => ({ ...p, products: p.products.filter(pr => pr.id !== id) })); };
  const uploadImage = async (file, f) => await productService.uploadImage(file, f);
  const addGalleryImage = async (pid, url) => { const n = await productService.addGalleryImage(pid, url); setData(p => ({ ...p, gallery: [...p.gallery, n] })); };
  const deleteGalleryImage = async (id) => { await productService.deleteGalleryImage(id); setData(p => ({ ...p, gallery: p.gallery.filter(g => g.id !== id) })); };
  const addCategory = async (n) => { const c = await productService.addCategory(n); setData(p => ({ ...p, categories: [...p.categories, c] })); };
  const updateCategory = async (id, n) => { await productService.updateCategory(id, n); setData(p => ({ ...p, categories: p.categories.map(c => c.id === id ? { ...c, name: n } : c) })); };
  const deleteCategory = async (id) => { await productService.deleteCategory(id); setData(p => ({ ...p, categories: p.categories.filter(c => c.id !== id) })); };
  const addBrand = async (n) => { const b = await productService.addBrand(n); setData(p => ({ ...p, brands: [...p.brands, b] })); };
  const updateBrand = async (id, n) => { await productService.updateBrand(id, n); setData(p => ({ ...p, brands: p.brands.map(b => b.id === id ? { ...b, name: n } : b) })); };
  const deleteBrand = async (id) => { await productService.deleteBrand(id); setData(p => ({ ...p, brands: p.brands.filter(b => b.id !== id) })); };
  const updatePromotion = async (id, upd) => { await productService.updatePromotion(id, upd); setData(p => ({ ...p, promotions: p.promotions.map(pr => pr.id === id ? { ...pr, ...upd } : pr) })); };
  const updateStoreConfig = async (newConfig) => { await productService.updateStoreConfig(newConfig); setData(p => ({ ...p, ...newConfig })); };

  // Order Wrappers
  const fetchOrders = async () => { setOrders(await orderService.fetchOrders()); };
  const addOrder = async (ord) => { await orderService.addOrder(ord); await fetchOrders(); };
  const updateOrder = async (id, upd) => { await orderService.updateOrder(id, upd); await fetchOrders(); };
  const deleteOrder = async (id) => { await orderService.deleteOrder(id); await fetchOrders(); };
  const fetchQuotes = async () => { setQuotes(await orderService.fetchQuotes()); };
  const fetchQuoteDetails = async () => { setQuoteDetails(await orderService.fetchQuoteDetails()); };
  const registerQuote = async (prod, cust) => { const r = await orderService.registerQuote(prod, cust); await fetchQuotes(); await fetchQuoteDetails(); return r; };
  const saveQuoteDetails = async (det) => { await orderService.saveQuoteDetails(det); await fetchQuoteDetails(); };
  const deleteQuote = async (id) => { await orderService.deleteQuote(id); await fetchQuotes(); };
  const updateQuote = async (id, upd) => { await orderService.updateQuote(id, upd); await fetchQuotes(); };

  return (
    <StoreContext.Provider value={{ 
      data, loading, user, login, logout, orders, fetchOrders, addOrder, uploadImage, activeCategory, setActiveCategory, 
      filters, setFilters, selectedProduct, setSelectedProduct, isAdminOpen, setIsAdminOpen, isAuthenticated, setIsAuthenticated, 
      updateProduct, addCategory, updateCategory, deleteCategory, addBrand, updateBrand, deleteBrand, addProduct, deleteProduct, 
      updatePromotion, changePassword, updateStoreConfig, admins, fetchAdmins, addAdmin, updateAdmin, signUpAdmin, deleteAdmin, 
      deleteOrder, updateOrder, quotes, fetchQuotes, quoteDetails, fetchQuoteDetails, registerQuote, saveQuoteDetails, deleteQuote, 
      updateQuote, addGalleryImage, deleteGalleryImage, viewingImage, setViewingImage,
      cart, addToCart, removeFromCart, updateCartQty, clearCart,
      getQuoteItems: orderService.getQuoteItems
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
