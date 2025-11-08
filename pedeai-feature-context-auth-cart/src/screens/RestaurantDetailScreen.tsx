import React, { useEffect, useState, useContext } from 'react';
import { fetchRestaurantProducts } from '../api/api';
import { CartContext } from '../contexts/CartContext';

export default function RestaurantDetailScreen({ route }: any) {
  const { id } = route.params;
  const [products, setProducts] = useState<any[]>([]);
  const cart = useContext(CartContext)!;

  useEffect(()=>{ fetchRestaurantProducts(id).then(setProducts).catch(()=>{}); }, [id]);

  const add = (p:any) => { const ok = cart.addItem({ productId: p.id, restaurantId: id, name: p.name, price: p.price, quantity:1 }); if(!ok) alert('Seu carrinho contém itens de outro restaurante.'); };

  return null;
}