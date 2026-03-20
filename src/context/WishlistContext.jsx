import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  const { user, isAdmin } = useAuth()
  const [wishlistIds, setWishlistIds] = useState([])

  useEffect(() => {
    if (user && !isAdmin()) {
      api.get('/api/wishlist/ids')
        .then(res => setWishlistIds(res.data))
        .catch(() => {})
    } else {
      setWishlistIds([])
    }
  }, [user])

  const isWishlisted = (productId) => wishlistIds.includes(productId)

  const toggle = async (product) => {
    const wishlisted = isWishlisted(product.id)
    try {
      if (wishlisted) {
        await api.delete(`/api/wishlist/${product.id}`)
        setWishlistIds(prev => prev.filter(id => id !== product.id))
        toast.success('Removed from wishlist')
      } else {
        await api.post(`/api/wishlist/${product.id}`)
        setWishlistIds(prev => [...prev, product.id])
        toast.success('Added to wishlist')
      }
    } catch {
      toast.error('Failed to update wishlist')
    }
  }

  return (
    <WishlistContext.Provider value={{ wishlistIds, isWishlisted, toggle }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => useContext(WishlistContext)
