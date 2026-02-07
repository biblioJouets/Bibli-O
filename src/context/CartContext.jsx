'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getSuggestedPlan } from '@/lib/core/utils/subscription';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { data: session } = useSession();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  // Charger le panier au démarrage si connecté
  useEffect(() => {
    if (session) fetchCart();
    else setCart({ items: [] }); // Reset si déconnecté
  }, [session]);

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart');
      if (res.ok) setCart(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!session) {
      alert("Veuillez vous connecter pour ajouter au panier !");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
      });
      if (res.ok) setCart(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'PUT',
        body: JSON.stringify({ itemId, quantity }),
      });
      if (res.ok) setCart(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const res = await fetch(`/api/cart?itemId=${itemId}`, {
        method: 'DELETE',
      });
      if (res.ok) setCart(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  // Calcul du total
  const cartTotal = cart.items?.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0) || 0;

  const cartCount = cart.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
const planInfo = getSuggestedPlan(cartCount);
const cartTotalDisplay = planInfo.price;
  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, cartTotalDisplay, cartCount, loading, planName: planInfo.name }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);