import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
    id: string; // Unique ID for the cart item (e.g., excursionId + date)
    excursionId: string;
    title: string;
    image: string;
    date: string; // ISO date string
    passengers: {
        adults: number;
        children: number;
    };
    pricePerAdult: number;
    pricePerChild?: number;
    totalPrice: number;
    type: 'excursion'; // For future extensibility
}

interface CartState {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    clearCart: () => void;
    getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (item) => {
                set((state) => {
                    // Check if item already exists (optional: update quantity vs separate entry)
                    // For excursions, usually we just add it. Or replace if exactly same config?
                    // Let's allow multiple calls. Validation logic can be in component.
                    return { items: [...state.items, item] };
                });
            },
            removeItem: (id) => {
                set((state) => ({
                    items: state.items.filter((item) => item.id !== id),
                }));
            },
            clearCart: () => set({ items: [] }),
            getTotalPrice: () => {
                return get().items.reduce((total, item) => total + item.totalPrice, 0);
            },
        }),
        {
            name: 'shpc-cart-storage', // name of the item in the storage (must be unique)
            storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
        }
    )
);
