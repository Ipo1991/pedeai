import React, { useEffect, useState, useContext } from 'react';
import { fetchRestaurants } from '../api/api';
import { CartContext } from '../contexts/CartContext';

export default function RestaurantsScreen() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const cart = useContext(CartContext)!;

  useEffect(() => { fetchRestaurants().then(setRestaurants).catch(()=>{}); }, []);

  const addToCart = (restaurantId:number, product:any) => {
    const ok = cart.addItem({ productId: product.id, restaurantId, name: product.name, price: product.price, quantity: 1 });
    if (!ok) { alert('Seu carrinho contém itens de outro restaurante. Limpe o carrinho para adicionar deste restaurante.'); }
  };

  return null;
}