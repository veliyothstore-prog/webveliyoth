export const cartService = {
  getCart: () => {
    const saved = localStorage.getItem('veliyoth_cart');
    return saved ? JSON.parse(saved) : [];
  },

  saveCart: (cart) => {
    localStorage.setItem('veliyoth_cart', JSON.stringify(cart));
  },

  addToCart: (cart, product, quantity = 1) => {
    const existing = cart.find(item => item.id === product.id);
    let newCart;
    if (existing) {
      newCart = cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + quantity } 
          : item
      );
    } else {
      newCart = [...cart, { 
        id: product.id, 
        title: product.title, 
        price: product.price, 
        image: product.image,
        quantity 
      }];
    }
    cartService.saveCart(newCart);
    return newCart;
  },

  removeFromCart: (cart, productId) => {
    const newCart = cart.filter(item => item.id !== productId);
    cartService.saveCart(newCart);
    return newCart;
  },

  updateQuantity: (cart, productId, quantity) => {
    if (quantity < 1) return cartService.removeFromCart(cart, productId);
    const newCart = cart.map(item => 
      item.id === productId ? { ...item, quantity } : item
    );
    cartService.saveCart(newCart);
    return newCart;
  },

  clearCart: () => {
    localStorage.removeItem('veliyoth_cart');
    return [];
  }
};
