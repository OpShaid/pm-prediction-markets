import { create } from 'zustand'
import { User } from '@/types'
import { apiClient } from '@/services/api'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  isGuest: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  loadUser: () => Promise<void>
  updateBalance: (newBalance: number) => void
  setGuestMode: (isGuest: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('auth_token'),
  isAuthenticated: false,
  isLoading: true,
  isGuest: localStorage.getItem('isGuest') === 'true',

  login: async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password)
      localStorage.setItem('auth_token', response.token)
      localStorage.removeItem('isGuest')
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isGuest: false,
      })
    } catch (error) {
      throw error
    }
  },

  register: async (email: string, username: string, password: string) => {
    try {
      const response = await apiClient.register(email, username, password)
      localStorage.setItem('auth_token', response.token)
      localStorage.removeItem('isGuest')
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isGuest: false,
      })
    } catch (error) {
      throw error
    }
  },

  logout: async () => {
    try {
      if (!localStorage.getItem('isGuest')) {
        await apiClient.logout()
      }
    } finally {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('isGuest')
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isGuest: false,
      })
    }
  },

  loadUser: async () => {
    const token = localStorage.getItem('auth_token')
    const isGuest = localStorage.getItem('isGuest') === 'true'

    if (isGuest) {
      // Guest mode with mock user
      set({
        user: {
          id: 'guest',
          email: 'guest@demo.com',
          username: 'Guest User',
          balance: 0,
          createdAt: new Date().toISOString(),
        },
        token: null,
        isAuthenticated: true,
        isGuest: true,
        isLoading: false,
      })
      return
    }

    if (!token) {
      set({ isLoading: false, isGuest: false })
      return
    }

    try {
      const user = await apiClient.getCurrentUser()
      set({
        user,
        token,
        isAuthenticated: true,
        isGuest: false,
        isLoading: false,
      })
    } catch (error) {
      localStorage.removeItem('auth_token')
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isGuest: false,
        isLoading: false,
      })
    }
  },

  updateBalance: (newBalance: number) => {
    set((state) => ({
      user: state.user ? { ...state.user, balance: newBalance } : null,
    }))
  },

  setGuestMode: (isGuest: boolean) => {
    if (isGuest) {
      localStorage.setItem('isGuest', 'true')
      set({
        user: {
          id: 'guest',
          email: 'guest@demo.com',
          username: 'Guest User',
          balance: 0,
          createdAt: new Date().toISOString(),
        },
        token: null,
        isAuthenticated: true,
        isGuest: true,
      })
    } else {
      localStorage.removeItem('isGuest')
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isGuest: false,
      })
    }
  },
}))
