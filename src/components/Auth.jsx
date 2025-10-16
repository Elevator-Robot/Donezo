import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Lock, Mail, Eye, EyeOff, LogIn, UserPlus, ArrowLeft, Key } from 'lucide-react'
import { authService } from '../services/authService'
import { dataService } from '../services/dataService'

const Auth = ({ onAuthSuccess }) => {
  const [authMode, setAuthMode] = useState('signin') // 'signin', 'signup', 'forgot-password', 'forgot-username', 'reset-password'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    resetCode: '',
    newPassword: '',
    confirmNewPassword: ''
  })
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [resetEmail, setResetEmail] = useState('')

  // Email validation function
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email.trim())
  }

  // Password strength validation function
  const isStrongPassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    return hasUpperCase && hasLowerCase && hasNumbers
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('') // Clear error when user types
    setSuccess('') // Clear success message when user types
  }

  const validateForm = () => {
    if (authMode === 'signin') {
      if (!formData.username.trim()) {
        setError('Email is required')
        return false
      }
      if (!isValidEmail(formData.username)) {
        setError('Please enter a valid email address')
        return false
      }
      if (!formData.password) {
        setError('Password is required')
        return false
      }
    } else if (authMode === 'signup') {
      if (!formData.username.trim()) {
        setError('Username is required')
        return false
      }
      if (formData.username.length < 3) {
        setError('Username must be at least 3 characters')
        return false
      }
      if (!formData.email.trim()) {
        setError('Email is required')
        return false
      }
      if (!isValidEmail(formData.email)) {
        setError('Please enter a valid email address')
        return false
      }
      if (!formData.password) {
        setError('Password is required')
        return false
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters')
        return false
      }
      if (!isStrongPassword(formData.password)) {
        setError('Password must contain at least one uppercase letter, one lowercase letter, and one number')
        return false
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return false
      }
    } else if (authMode === 'forgot-password') {
      if (!formData.email.trim()) {
        setError('Email is required')
        return false
      }
      if (!isValidEmail(formData.email)) {
        setError('Please enter a valid email address')
        return false
      }
    } else if (authMode === 'forgot-username') {
      if (!formData.email.trim()) {
        setError('Email is required')
        return false
      }
      if (!isValidEmail(formData.email)) {
        setError('Please enter a valid email address')
        return false
      }
    } else if (authMode === 'reset-password') {
      if (!formData.resetCode.trim()) {
        setError('Reset code is required')
        return false
      }
      if (!formData.newPassword) {
        setError('New password is required')
        return false
      }
      if (formData.newPassword.length < 6) {
        setError('Password must be at least 6 characters')
        return false
      }
      if (!isStrongPassword(formData.newPassword)) {
        setError('New password must contain at least one uppercase letter, one lowercase letter, and one number')
        return false
      }
      if (formData.newPassword !== formData.confirmNewPassword) {
        setError('Passwords do not match')
        return false
      }
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      if (authMode === 'signup') {
        // Sign up with Supabase
        const { user, error: signupError } = await authService.signUp(
          formData.email,
          formData.password,
          { username: formData.username }
        )

        if (signupError) {
          setError(signupError)
          return
        }

        if (user) {
          // Initialize default user data
          const { lists, settings, error: initError } = await dataService.initializeUserData(user.id)
          
          if (initError) {
            console.error('Failed to initialize user data:', initError)
            // Still proceed with login even if initialization fails
          }

          const userData = {
            todos: [],
            lists: lists || [
              { id: '1', name: 'Personal', color: 'teal', icon: 'Heart', type: 'task' },
              { id: '2', name: 'Work', color: 'blue', icon: 'Zap', type: 'task' },
              { id: '3', name: 'Shopping', color: 'green', icon: 'ShoppingCart', type: 'task' }
            ],
            settings: settings || { font: 'Rock Salt' },
            theme: settings?.theme || 'light'
          }

          // Create user object that matches the existing format
          const userObj = {
            id: user.id,
            username: formData.username,
            email: formData.email,
            createdAt: new Date().toISOString()
          }

          onAuthSuccess(userObj, userData, false)
        }
      } else if (authMode === 'signin') {
        // Sign in with Supabase using email instead of username
        // First try to find email if username was provided
        let email = formData.username
        if (!email.includes('@')) {
          // If it's a username, we need to convert it to email
          // For now, we'll require email for signin
          setError('Please use your email address to sign in')
          return
        }

        const { user, session, error: signinError } = await authService.signIn(email, formData.password)

        if (signinError) {
          setError('Invalid email or password')
          return
        }

        if (user) {
          // Get user profile
          const { profile, error: profileError } = await authService.getUserProfile(user.id)
          
          if (profileError) {
            setError('Failed to load user profile')
            return
          }

          // Load user data
          const [
            { lists, error: listsError },
            { todos, error: todosError },
            { settings, error: settingsError }
          ] = await Promise.all([
            dataService.getUserLists(user.id),
            dataService.getUserTodos(user.id),
            dataService.getUserSettings(user.id)
          ])

          if (listsError || todosError || settingsError) {
            console.error('Error loading user data:', { listsError, todosError, settingsError })
            // Continue with empty data if there are errors
          }

          const userData = {
            todos: todos || [],
            lists: lists || [],
            settings: settings || { font: 'Rock Salt' },
            theme: settings?.theme || 'light'
          }

          // Create user object that matches the existing format
          const userObj = {
            id: user.id,
            username: profile?.username || user.email.split('@')[0],
            email: user.email,
            createdAt: profile?.created_at || new Date().toISOString()
          }

          onAuthSuccess(userObj, userData, rememberMe)
        }
      } else if (authMode === 'forgot-password') {
        // Send password reset email
        const { error: resetError } = await authService.resetPassword(formData.email)

        if (resetError) {
          setError(resetError)
          return
        }

        setSuccess(`Password reset email sent to ${formData.email}. Please check your inbox.`)
      } else if (authMode === 'forgot-username') {
        // Just go back to sign in
        goBack()
        return
      } else if (authMode === 'reset-password') {
        // Just go back to sign in
        goBack()
        return
      }
    } catch (err) {
      console.error('Auth error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }



  const goBack = () => {
    setAuthMode('signin')
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      resetCode: '',
      newPassword: '',
      confirmNewPassword: ''
    })
    setRememberMe(false)
    setError('')
    setSuccess('')
    setResetEmail('')
  }

  const getTitle = () => {
    switch (authMode) {
      case 'signup':
        return 'Create Account'
      case 'signin':
        return 'Welcome Back'
      case 'forgot-password':
        return 'Forgot Password'
      case 'forgot-username':
        return 'Forgot Username'
      case 'reset-password':
        return 'Reset Password'
      default:
        return 'Welcome Back'
    }
  }

  const getSubtitle = () => {
    switch (authMode) {
      case 'signup':
        return 'Sign up to get started with Doink'
      case 'signin':
        return 'Sign in to your account'
      case 'forgot-password':
        return 'Enter your email to receive a reset link'
      case 'forgot-username':
        return 'Username recovery not available'
      case 'reset-password':
        return 'Reset handled via email link'
      default:
        return 'Sign in to your account'
    }
  }

  const renderForm = () => {
    switch (authMode) {
      case 'signin':
        return (
          <>
            {/* Username */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="email"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white text-sm sm:text-base transition-all duration-200 hover:bg-white dark:hover:bg-gray-700"
                  placeholder="Enter your email address"
                />
              </motion.div>
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white text-sm sm:text-base transition-all duration-200 hover:bg-white dark:hover:bg-gray-700"
                  placeholder="Enter your password"
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Remember Me and Forgot Password */}
            <motion.div
              className="flex items-center justify-between"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <motion.label 
                className="flex items-center cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Remember me</span>
              </motion.label>

              <div className="flex flex-col items-end space-y-1">
                <motion.button
                  type="button"
                  onClick={() => setAuthMode('forgot-password')}
                  className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Forgot your password?
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setAuthMode('forgot-username')}
                  className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Forgot your username?
                </motion.button>
              </div>
            </motion.div>
          </>
        )

      case 'signup':
        return (
          <>
            {/* Username */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white text-sm sm:text-base transition-all duration-200 hover:bg-white dark:hover:bg-gray-700"
                  placeholder="Enter your username"
                />
              </motion.div>
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white text-sm sm:text-base transition-all duration-200 hover:bg-white dark:hover:bg-gray-700"
                  placeholder="Enter your email"
                />
              </motion.div>
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white text-sm sm:text-base transition-all duration-200 hover:bg-white dark:hover:bg-gray-700"
                  placeholder="Enter your password"
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Confirm Password */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white text-sm sm:text-base transition-all duration-200 hover:bg-white dark:hover:bg-gray-700"
                  placeholder="Confirm your password"
                />
                <motion.button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </motion.button>
              </motion.div>
            </motion.div>
          </>
        )

      case 'forgot-password':
        return (
          <>
            {/* Email */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white text-sm sm:text-base transition-all duration-200 hover:bg-white dark:hover:bg-gray-700"
                  placeholder="Enter your email address"
                />
              </motion.div>
            </motion.div>
          </>
        )

      case 'forgot-username':
        return (
          <>
            <div className="text-center py-8">
              <User className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400">
                Username recovery is not available. Please use your email address to sign in.
              </p>
            </div>
          </>
        )

      case 'reset-password':
        return (
          <>
            <div className="text-center py-8">
              <Key className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400">
                Password reset is handled via secure email link. Please check your email inbox.
              </p>
            </div>
          </>
        )

      default:
        return null
    }
  }

  const getSubmitButtonText = () => {
    if (isLoading) {
      switch (authMode) {
        case 'signup':
          return 'Creating Account...'
        case 'signin':
          return 'Signing In...'
        case 'forgot-password':
          return 'Sending Reset Email...'
        default:
          return 'Loading...'
      }
    }

    switch (authMode) {
      case 'signup':
        return 'Create Account'
      case 'signin':
        return 'Sign In'
      case 'forgot-password':
        return 'Send Reset Email'
      case 'forgot-username':
        return 'Go Back'
      case 'reset-password':
        return 'Go Back'
      default:
        return 'Sign In'
    }
  }

  const getSubmitButtonIcon = () => {
    if (isLoading) {
      return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
    }

    switch (authMode) {
      case 'signup':
        return <UserPlus className="w-4 h-4 mr-2" />
      case 'signin':
        return <LogIn className="w-4 h-4 mr-2" />
      case 'forgot-password':
        return <Mail className="w-4 h-4 mr-2" />
      case 'forgot-username':
      case 'reset-password':
        return <ArrowLeft className="w-4 h-4 mr-2" />
      default:
        return <LogIn className="w-4 h-4 mr-2" />
    }
  }

  const getToggleModeText = () => {
    switch (authMode) {
      case 'signin':
        return { question: "Don't have an account?", action: 'Sign Up' }
      case 'signup':
        return { question: 'Already have an account?', action: 'Sign In' }
      default:
        return { question: 'Back to sign in', action: 'Sign In' }
    }
  }

  const handleToggleMode = () => {
    if (authMode === 'signin') {
      setAuthMode('signup')
    } else if (authMode === 'signup') {
      setAuthMode('signin')
    } else {
      goBack()
    }
    
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      resetCode: '',
      newPassword: '',
      confirmNewPassword: ''
    })
    setRememberMe(false)
    setError('')
    setSuccess('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 p-4 relative overflow-hidden">
      {/* Enhanced Ambient Cloud Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary Floating Cloud Elements */}
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-white/20 dark:bg-white/10 rounded-full blur-xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-24 h-24 bg-blue-200/30 dark:bg-blue-400/20 rounded-full blur-lg"
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 0.8, 1],
            rotate: [0, -3, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div
          className="absolute bottom-32 left-1/4 w-40 h-40 bg-purple-200/25 dark:bg-purple-400/15 rounded-full blur-2xl"
          animate={{
            x: [0, 120, 0],
            y: [0, -80, 0],
            scale: [1, 1.3, 1],
            rotate: [0, 8, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5
          }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 w-20 h-20 bg-indigo-200/30 dark:bg-indigo-400/20 rounded-full blur-lg"
          animate={{
            x: [0, -60, 0],
            y: [0, 40, 0],
            scale: [1, 1.1, 1],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 8
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-36 h-36 bg-cyan-200/20 dark:bg-cyan-400/15 rounded-full blur-xl"
          animate={{
            x: [0, 80, 0],
            y: [0, -60, 0],
            scale: [1, 0.9, 1],
            rotate: [0, 4, 0],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
        />

        {/* Additional Serene Elements */}
        <motion.div
          className="absolute top-1/3 left-1/2 w-16 h-16 bg-pink-200/20 dark:bg-pink-400/15 rounded-full blur-md"
          animate={{
            x: [0, 40, 0],
            y: [0, -30, 0],
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div
          className="absolute bottom-1/3 left-1/6 w-28 h-28 bg-yellow-200/15 dark:bg-yellow-400/10 rounded-full blur-lg"
          animate={{
            x: [0, -50, 0],
            y: [0, 70, 0],
            scale: [1, 0.85, 1],
            rotate: [0, -6, 0],
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 6
          }}
        />
        <motion.div
          className="absolute top-2/3 right-1/6 w-12 h-12 bg-green-200/25 dark:bg-green-400/15 rounded-full blur-sm"
          animate={{
            x: [0, 35, 0],
            y: [0, -25, 0],
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />

        {/* Flowing Wave Elements */}
        <motion.div
          className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-transparent via-white/5 to-transparent"
          animate={{
            y: [0, 100, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-full h-40 bg-gradient-to-t from-transparent via-blue-100/10 to-transparent"
          animate={{
            y: [0, -80, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
        />
        
        {/* Enhanced Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 dark:via-white/5 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-blue-100/20 dark:via-blue-900/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-100/15 dark:via-purple-900/15 to-transparent" />
        
        {/* Enhanced Particle Effect */}
        <div className="absolute inset-0">
          {Array.from({ length: 25 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/40 dark:bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, Math.random() * 20 - 10, 0],
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: Math.random() * 4 + 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 3,
              }}
            />
          ))}
        </div>

        {/* Floating Light Orbs */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute w-2 h-2 bg-white/60 dark:bg-white/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.4, 1, 0.4],
              scale: [1, 1.8, 1],
            }}
            transition={{
              duration: Math.random() * 5 + 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <motion.div
          className="bg-gradient-to-br from-teal-50 via-blue-50 to-cyan-100 dark:from-teal-900/30 dark:via-blue-900/30 dark:to-cyan-900/30 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20 dark:border-white/10"
          initial={{ scale: 0.9, rotateY: -5 }}
          animate={{ scale: 1, rotateY: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          whileHover={{ 
            scale: 1.02,
            rotateY: 2,
            transition: { duration: 0.3 }
          }}
        >
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            {(authMode === 'forgot-password' || authMode === 'forgot-username' || authMode === 'reset-password') && (
              <motion.button
                onClick={goBack}
                className="absolute top-6 left-6 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </motion.button>
            )}
            
            <motion.div
              className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
              whileHover={{ 
                scale: 1.1,
                rotate: 5,
                transition: { type: "spring", stiffness: 300 }
              }}
              whileTap={{ scale: 0.95 }}
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                y: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            >
              {authMode === 'forgot-password' || authMode === 'reset-password' ? (
                <Key className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              ) : (
                <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              )}
            </motion.div>
            <motion.h1 
              className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {getTitle()}
            </motion.h1>
            <motion.p 
              className="text-sm sm:text-base text-gray-600 dark:text-gray-400"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {getSubtitle()}
            </motion.p>
          </div>

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-lg mb-4"
            >
              {success}
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg mb-4"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {renderForm()}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white py-2.5 px-4 rounded-lg font-medium hover:from-teal-600 hover:to-blue-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm sm:text-base shadow-lg"
              whileHover={{ 
                scale: 1.02,
                y: -2,
                transition: { duration: 0.2 }
              }}
              whileTap={{ 
                scale: 0.98,
                y: 0,
                transition: { duration: 0.1 }
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-center justify-center">
                {getSubmitButtonIcon()}
                <span className="text-sm sm:text-base">{getSubmitButtonText()}</span>
              </div>
            </motion.button>
          </form>

          {/* Toggle Mode */}
          {(authMode === 'signin' || authMode === 'signup') && (
            <motion.div 
              className="mt-5 sm:mt-6 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                {getToggleModeText().question}
              </p>
              <motion.button
                onClick={handleToggleMode}
                className="text-emerald-600 dark:text-emerald-400 font-semibold hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors duration-200 text-sm sm:text-base"
                whileHover={{ 
                  scale: 1.05,
                  y: -1,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ 
                  scale: 0.95,
                  y: 0,
                  transition: { duration: 0.1 }
                }}
              >
                {getToggleModeText().action}
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Auth
