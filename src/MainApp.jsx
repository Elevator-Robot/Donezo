import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import App from './App'
import Auth from './components/Auth'

const MainApp = () => {
  const [currentUser, setCurrentUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuthState = () => {
      try {
        const savedUser = localStorage.getItem('donezo-current-user')
        if (savedUser) {
          const user = JSON.parse(savedUser)
          console.log('Found existing user:', user)
          
          // Load user data from localStorage
          const userDataFromStorage = {
            todos: JSON.parse(localStorage.getItem(`donezo-user-${user.id}-todos`) || '[]'),
            lists: JSON.parse(localStorage.getItem(`donezo-user-${user.id}-lists`) || '[]'),
            settings: JSON.parse(localStorage.getItem(`donezo-user-${user.id}-settings`) || '{"font": "Rock Salt"}'),
            theme: localStorage.getItem(`donezo-user-${user.id}-theme`) || 'light'
          }
          
          console.log('Loaded user data:', userDataFromStorage)
          
          setCurrentUser(user)
          setUserData(userDataFromStorage)
          
          // Set global app data from user's data
          localStorage.setItem('donezo-todos', JSON.stringify(userDataFromStorage.todos))
          localStorage.setItem('donezo-lists', JSON.stringify(userDataFromStorage.lists))
          localStorage.setItem('donezo-settings', JSON.stringify(userDataFromStorage.settings))
          localStorage.setItem('donezo-theme', userDataFromStorage.theme)
        }
      } catch (error) {
        console.error('Error checking auth state:', error)
        // Clear potentially corrupted data
        localStorage.removeItem('donezo-current-user')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthState()
  }, [])

  const handleAuthSuccess = (user, userData) => {
    console.log('Authentication successful:', user, userData)
    setCurrentUser(user)
    setUserData(userData)
    
    // Set global app data from user's data
    localStorage.setItem('donezo-todos', JSON.stringify(userData.todos))
    localStorage.setItem('donezo-lists', JSON.stringify(userData.lists))
    localStorage.setItem('donezo-settings', JSON.stringify(userData.settings))
    localStorage.setItem('donezo-theme', userData.theme)
    
    // Trigger theme application
    document.documentElement.setAttribute('data-theme', userData.theme)
    if (userData.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const handleLogout = () => {
    console.log('Logging out user')
    
    // Save current app state to user's storage before logout
    if (currentUser) {
      const currentAppData = {
        todos: JSON.parse(localStorage.getItem('donezo-todos') || '[]'),
        lists: JSON.parse(localStorage.getItem('donezo-lists') || '[]'),
        settings: JSON.parse(localStorage.getItem('donezo-settings') || '{"font": "Rock Salt"}'),
        theme: localStorage.getItem('donezo-theme') || 'light'
      }
      
      // Save to user-specific storage
      localStorage.setItem(`donezo-user-${currentUser.id}-todos`, JSON.stringify(currentAppData.todos))
      localStorage.setItem(`donezo-user-${currentUser.id}-lists`, JSON.stringify(currentAppData.lists))
      localStorage.setItem(`donezo-user-${currentUser.id}-settings`, JSON.stringify(currentAppData.settings))
      localStorage.setItem(`donezo-user-${currentUser.id}-theme`, currentAppData.theme)
    }
    
    // Clear current user
    localStorage.removeItem('donezo-current-user')
    setCurrentUser(null)
    setUserData(null)
    
    // Clear global app data
    localStorage.removeItem('donezo-todos')
    localStorage.removeItem('donezo-lists')
    localStorage.removeItem('donezo-settings')
    localStorage.removeItem('donezo-theme')
    
    // Reset to light theme
    document.documentElement.setAttribute('data-theme', 'light')
    document.documentElement.classList.remove('dark')
  }

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center"
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{
              rotate: {
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              },
              scale: {
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          >
            <div className="text-white text-2xl font-bold">D</div>
          </motion.div>
          <motion.div
            className="text-gray-600 text-lg font-medium"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Loading Donezo...
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      {currentUser ? (
        <motion.div
          key="app"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <App 
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        </motion.div>
      ) : (
        <motion.div
          key="auth"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Auth onAuthSuccess={handleAuthSuccess} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default MainApp