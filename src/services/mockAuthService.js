// Mock auth service for demo mode
import { v4 as uuidv4 } from 'uuid'

// In-memory storage for demo mode
let mockUsers = {}
let currentSession = null
let sessionCallbacks = []

export const mockAuthService = {
  // Sign up a new user
  async signUp(email, password, userData) {
    try {
      // Check if user already exists
      const existingUser = Object.values(mockUsers).find(user => user.email === email)
      if (existingUser) {
        return { user: null, error: 'User already exists' }
      }

      const userId = uuidv4()
      const user = {
        id: userId,
        email: email,
        username: userData.username,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Store user
      mockUsers[userId] = { ...user, password }

      return { user, error: null }
    } catch (error) {
      console.error('Mock signup error:', error)
      return { user: null, error: error.message }
    }
  },

  // Sign in existing user
  async signIn(email, password) {
    try {
      const user = Object.values(mockUsers).find(u => u.email === email && u.password === password)
      
      if (!user) {
        return { user: null, session: null, error: 'Invalid email or password' }
      }

      const session = {
        accessToken: `mock-token-${Date.now()}`,
        refreshToken: `mock-refresh-${Date.now()}`,
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        }
      }

      currentSession = session
      localStorage.setItem('donezo_demo_session', JSON.stringify(session))
      
      // Notify listeners
      sessionCallbacks.forEach(callback => callback('SIGNED_IN', session))

      return { user: session.user, session, error: null }
    } catch (error) {
      console.error('Mock signin error:', error)
      return { user: null, session: null, error: error.message }
    }
  },

  // Sign out user
  async signOut() {
    try {
      currentSession = null
      localStorage.removeItem('donezo_demo_session')
      
      // Notify listeners
      sessionCallbacks.forEach(callback => callback('SIGNED_OUT', null))
      
      return { error: null }
    } catch (error) {
      console.error('Mock signout error:', error)
      return { error: error.message }
    }
  },

  // Get current session
  async getSession() {
    try {
      if (currentSession) {
        return { session: currentSession, error: null }
      }
      
      // Try to restore from localStorage
      const storedSession = localStorage.getItem('donezo_demo_session')
      if (storedSession) {
        const session = JSON.parse(storedSession)
        currentSession = session
        return { session, error: null }
      }
      
      return { session: null, error: null }
    } catch (error) {
      console.error('Mock get session error:', error)
      return { session: null, error: error.message }
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { session } = await this.getSession()
      return { user: session?.user || null, error: null }
    } catch (error) {
      console.error('Mock get user error:', error)
      return { user: null, error: error.message }
    }
  },

  // Get user profile from mock storage
  async getUserProfile(userId) {
    try {
      const user = mockUsers[userId]
      if (user) {
        const { password, ...profile } = user
        return { profile, error: null }
      }
      return { profile: null, error: 'Profile not found' }
    } catch (error) {
      console.error('Mock get profile error:', error)
      return { profile: null, error: error.message }
    }
  },

  // Reset password (mock)
  async resetPassword(email) {
    try {
      // In demo mode, just pretend to send email
      return { error: null }
    } catch (error) {
      console.error('Mock password reset error:', error)
      return { error: error.message }
    }
  },

  // Update password (mock)
  async updatePassword(newPassword) {
    try {
      if (!currentSession?.user?.id) {
        throw new Error('No active session')
      }

      const userId = currentSession.user.id
      if (mockUsers[userId]) {
        mockUsers[userId].password = newPassword
      }

      return { error: null }
    } catch (error) {
      console.error('Mock update password error:', error)
      return { error: error.message }
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback) {
    sessionCallbacks.push(callback)
    
    // Return unsubscribe function
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            const index = sessionCallbacks.indexOf(callback)
            if (index > -1) {
              sessionCallbacks.splice(index, 1)
            }
          }
        }
      }
    }
  }
}