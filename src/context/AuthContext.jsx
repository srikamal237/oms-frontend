import { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })
  const navigate = useNavigate()

  const login = async (username, password) => {
    const res = await api.post('/api/auth/login', { username, password })
    const { token, roles, username: uname } = res.data
    localStorage.setItem('token', token)
    const userData = { username: uname, roles }
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    if (roles?.includes('ROLE_ADMIN')) navigate('/admin/dashboard')
    else navigate('/products')
  }

  const register = async (username, password) => {
    await api.post('/api/auth/register', { username, password })
    navigate('/login')
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/login')
  }

  const isAdmin = () => user?.roles?.includes('ROLE_ADMIN')

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
