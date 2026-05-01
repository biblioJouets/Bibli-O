'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getSuggestedPlan } from '@/lib/core/utils/subscription';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { data: session } = useSession();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);
  // Contexte d'échange : null si mode normal, { orderId, selectedProductIds } si mode échange
  const [exchangeContext, setExchangeContext] = useState(null);
  // Contexte de réassort : null si mode normal, { sourceOrderId, slots } si mode refill
  const [refillContext, setRefillContext] = useState(null);
  // Données Box Mystère : null si panier normal, { childAge, childGender } si box présente
  const [boxMystereData, setBoxMystereData] = useState(null);

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
      else {
        const data = await res.json();
        throw new Error(data.error || "Erreur ajout au panier");
      }
    } finally {
      setLoading(false);
    }
  };

  // Vide le panier puis ajoute uniquement la Box Mystère avec les données enfant
  const addBoxToCart = async (boxProductId, childAge, childGender) => {
    if (!session) {
      alert("Veuillez vous connecter pour commander la Box Mystère !");
      return false;
    }
    setLoading(true);
    try {
      // 1. Vider tous les items du panier existant
      const currentCart = cart;
      for (const item of currentCart.items || []) {
        await fetch(`/api/cart?itemId=${item.id}`, { method: 'DELETE' });
      }

      // 2. Ajouter la Box Mystère
      const res = await fetch('/api/cart', {
        method: 'POST',
        body: JSON.stringify({ productId: boxProductId, quantity: 1 }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur ajout Box Mystère");
      }
      const newCart = await res.json();
      setCart(newCart);
      setBoxMystereData({ childAge, childGender });
      return true;
    } catch (err) {
      console.error(err);
      alert(err.message);
      return false;
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

  const clearCart = () => {
    setCart({ items: [] });
    setBoxMystereData(null);
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
    <CartContext.Provider value={{ cart, addToCart, addBoxToCart, updateQuantity, removeFromCart, clearCart, cartTotalDisplay, cartCount, loading, planName: planInfo.name, exchangeContext, setExchangeContext, refillContext, setRefillContext, boxMystereData, setBoxMystereData }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);