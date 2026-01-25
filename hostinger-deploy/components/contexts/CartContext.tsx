'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react'

export interface CartItem {
  id: string
  name: string
  price: number
  currency?: string
  category?: string
  imageUrl?: string
  quantity: number
  variant?: string | null
  notes?: string
}

export interface CustomerInfo {
  name: string
  phone: string
  address?: string
  email?: string
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (product: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeFromCart: (index: number) => void
  updateQuantity: (index: number, quantity: number) => void
  updateNotes: (index: number, notes: string) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartItemCount: () => number
  customerInfo: CustomerInfo | null
  saveCustomerInfo: (info: CustomerInfo) => void
}

// Create context - using undefined as default is fine with proper checks in hooks
const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'sunday_market_cart'
const CUSTOMER_STORAGE_KEY = 'sunday_market_customer'

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (stored) {
        setCart(JSON.parse(stored))
      }
    } catch (e) {
      console.warn('Could not load cart from storage:', e)
    }
  }, [])

  // Load customer info from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CUSTOMER_STORAGE_KEY)
      if (stored) {
        setCustomerInfo(JSON.parse(stored))
      }
    } catch (e) {
      // No customer info stored
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    } catch (e) {
      console.warn('Could not save cart to storage:', e)
    }
  }, [cart])

  const addToCart = useCallback((product: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setCart((prevCart) => {
      const cartItem: CartItem = {
        ...product,
        quantity: parseInt(String(quantity)) || 1,
      }

      // Check if item already exists (same product, variant, notes)
      const existingIndex = prevCart.findIndex(
        (item) =>
          item.id === cartItem.id &&
          item.variant === cartItem.variant &&
          item.notes === cartItem.notes
      )

      if (existingIndex >= 0) {
        const newCart = [...prevCart]
        newCart[existingIndex].quantity += cartItem.quantity
        return newCart
      } else {
        return [...prevCart, cartItem]
      }
    })
  }, [])

  const removeFromCart = useCallback((index: number) => {
    setCart((prevCart) => prevCart.filter((_, i) => i !== index))
  }, [])

  const updateQuantity = useCallback((index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index)
      return
    }
    setCart((prevCart) => {
      const newCart = [...prevCart]
      newCart[index].quantity = parseInt(String(quantity)) || 1
      return newCart
    })
  }, [removeFromCart])

  const updateNotes = useCallback((index: number, notes: string) => {
    setCart((prevCart) => {
      const newCart = [...prevCart]
      newCart[index].notes = notes || ''
      return newCart
    })
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
  }, [])

  const getCartTotal = useCallback(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [cart])

  const getCartItemCount = useCallback(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0)
  }, [cart])

  const saveCustomerInfo = useCallback((info: CustomerInfo) => {
    setCustomerInfo(info)
    try {
      localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(info))
    } catch (e) {
      console.warn('Could not save customer info:', e)
    }
  }, [])

  // Memoize context value to prevent unnecessary re-renders
  // Ensure value is always a plain object, never undefined or a function
  const value = useMemo<CartContextType>(() => {
    return {
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      updateNotes,
      clearCart,
      getCartTotal,
      getCartItemCount,
      customerInfo,
      saveCustomerInfo,
    }
  }, [cart, addToCart, removeFromCart, updateQuantity, updateNotes, clearCart, getCartTotal, getCartItemCount, customerInfo, saveCustomerInfo])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextType {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}


