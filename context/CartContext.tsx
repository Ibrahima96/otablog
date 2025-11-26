import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MarketplaceItem } from '../types';

interface CartItem extends MarketplaceItem {
    id: string; // Unique ID for the cart item (could be post ID)
    quantity: number;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: MarketplaceItem, itemId: string) => void;
    removeFromCart: (itemId: string) => void;
    clearCart: () => void;
    total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    const addToCart = (item: MarketplaceItem, itemId: string) => {
        setCartItems(prev => {
            const existingItem = prev.find(i => i.id === itemId);
            if (existingItem) {
                return prev.map(i =>
                    i.id === itemId ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prev, { ...item, id: itemId, quantity: 1 }];
        });
        console.log('Added to cart:', item.title);
        // You could add a toast notification here
    };

    const removeFromCart = (itemId: string) => {
        setCartItems(prev => prev.filter(i => i.id !== itemId));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, total }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
