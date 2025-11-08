import React, { useContext } from 'react';
import { CartContext } from '../contexts/CartContext';
import { createPayment } from '../api/api';

export default function CheckoutScreen() {
  const cart = useContext(CartContext)!;

  const handleConfirm = async (addressId:number, paymentId:number) => {
    // call order creation endpoint when backend is ready
    const payload = { restaurantId: cart.restaurantId, items: cart.items.map(i=>({ productId:i.productId, quantity:i.quantity })), addressId, paymentId };
    try {
      // await api.post('/orders', payload);
      alert('Pedido enviado (simulado)');
      cart.clear();
    } catch (e) { alert('Erro ao criar pedido'); }
  };

  return null;
}