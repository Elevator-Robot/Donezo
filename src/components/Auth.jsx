import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Lock, Mail, Eye, EyeOff, LogIn, UserPlus, ArrowLeft, Key } from 'lucide-react'

const Auth = ({ onAuthSuccess }) => {
  const [authMode, setAuthMode] = useState('signin') // 'signin', 'signup', 'forgot-password', 'reset-password'
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
    if (authMode === 'signin' || authMode === 'signup') {
      if (!formData.username.trim()) {
        setError('Username is required')
        return false
      }
      if (authMode === 'signup' && !formData.email.trim()) {
        setError('Email is required')
        return false
      }
      if (!formData.password) {
        setError('Password is required')
        return false
      }
      if (authMode === 'signup' && formData.password.length < 6) {
        setError('Password must be at least 6 characters')
        return false
      }
      if (authMode === 'signup' && formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return false
      }
    } else if (authMode === 'forgot-password') {
      if (!formData.email.trim()) {
        setError('Email is required')
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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (authMode === 'signup') {
        // Check if user already exists
        const existingUsers = JSON.parse(localStorage.getItem('donezo-users') || '[]')
        const userExists = existingUsers.find(user => 
          user.username === formData.username || user.email === formData.email
        )

        if (userExists) {
          setError('Username or email already exists')
          return
        }

        // Create new user
        const newUser = {
          id: Date.now().toString(),
          username: formData.username,
          email: formData.email,
          password: formData.password, // In a real app, this would be hashed
          createdAt: new Date().toISOString()
        }

        console.log('Creating new user:', newUser)

        existingUsers.push(newUser)
        localStorage.setItem('donezo-users', JSON.stringify(existingUsers))

        // Initialize user data
        const userData = {
          todos: [],
          lists: [
            { id: '1', name: 'Personal', color: 'teal', icon: 'Heart', type: 'task' },
            { id: '2', name: 'Work', color: 'blue', icon: 'Zap', type: 'task' },
            { id: '3', name: 'Grocery', color: 'green', icon: 'ShoppingCart', type: 'grocery' },
            { id: '4', name: 'Shopping', color: 'pink', icon: 'ShoppingBag', type: 'task' },
            { id: '5', name: 'Health', color: 'emerald', icon: 'Activity', type: 'task' },
            { id: '6', name: 'Learning', color: 'purple', icon: 'BookOpen', type: 'task' },
            { id: '7', name: 'Home Projects', color: 'orange', icon: 'Home', type: 'task' },
            { id: '8', name: 'Reading List', color: 'indigo', icon: 'Book', type: 'task' }
          ],
          settings: {
            font: 'Rock Salt'
          },
          theme: 'light'
        }

        console.log('Initializing user data:', userData)

        // Store user data with the correct key format
        localStorage.setItem(`donezo-user-${newUser.id}-todos`, JSON.stringify(userData.todos))
        localStorage.setItem(`donezo-user-${newUser.id}-lists`, JSON.stringify(userData.lists))
        localStorage.setItem(`donezo-user-${newUser.id}-settings`, JSON.stringify(userData.settings))
        localStorage.setItem(`donezo-user-${newUser.id}-theme`, userData.theme)
        localStorage.setItem('donezo-current-user', JSON.stringify(newUser))

        console.log('User data stored successfully')
        onAuthSuccess(newUser, userData, false) // New users don't need remember me
      } else if (authMode === 'signin') {
        // Sign in
        const existingUsers = JSON.parse(localStorage.getItem('donezo-users') || '[]')
        console.log('Attempting signin for username:', formData.username)
        console.log('Existing users:', existingUsers)
        
        const user = existingUsers.find(user => 
          user.username === formData.username && user.password === formData.password
        )

        if (!user) {
          setError('Invalid username or password')
          return
        }

        console.log('User found:', user)

        // Load user data from the correct localStorage keys
        const userData = {
          todos: JSON.parse(localStorage.getItem(`donezo-user-${user.id}-todos`) || '[]'),
          lists: JSON.parse(localStorage.getItem(`donezo-user-${user.id}-lists`) || '[]'),
          settings: JSON.parse(localStorage.getItem(`donezo-user-${user.id}-settings`) || '{"font": "Rock Salt"}'),
          theme: localStorage.getItem(`donezo-user-${user.id}-theme`) || 'light'
        }
        
        console.log('Loaded user data:', userData)
        localStorage.setItem('donezo-current-user', JSON.stringify(user))

        onAuthSuccess(user, userData, rememberMe)
      } else if (authMode === 'forgot-password') {
        // Check if email exists
        const existingUsers = JSON.parse(localStorage.getItem('donezo-users') || '[]')
        const user = existingUsers.find(user => user.email === formData.email)

        if (!user) {
          setError('No account found with this email address')
          return
        }

        // Generate reset code (in a real app, this would be sent via email)
        const resetCode = Math.random().toString(36).substring(2, 8).toUpperCase()
        
        // Store reset code temporarily (in a real app, this would be in a database)
        localStorage.setItem('donezo-reset-codes', JSON.stringify({
          ...JSON.parse(localStorage.getItem('donezo-reset-codes') || '{}'),
          [formData.email]: {
            code: resetCode,
            userId: user.id,
            expires: Date.now() + (10 * 60 * 1000) // 10 minutes
          }
        }))

        setResetEmail(formData.email)
        setSuccess(`Reset code sent to ${formData.email}: ${resetCode}`)
        setAuthMode('reset-password')
      } else if (authMode === 'reset-password') {
        // Verify reset code and update password
        const resetCodes = JSON.parse(localStorage.getItem('donezo-reset-codes') || '{}')
        const resetData = resetCodes[resetEmail]

        if (!resetData || resetData.code !== formData.resetCode.toUpperCase()) {
          setError('Invalid reset code')
          return
        }

        if (Date.now() > resetData.expires) {
          setError('Reset code has expired')
          return
        }

        // Update user password
        const existingUsers = JSON.parse(localStorage.getItem('donezo-users') || '[]')
        const updatedUsers = existingUsers.map(user => 
          user.id === resetData.userId 
            ? { ...user, password: formData.newPassword }
            : user
        )

        localStorage.setItem('donezo-users', JSON.stringify(updatedUsers))
        
        // Clean up reset code
        delete resetCodes[resetEmail]
        localStorage.setItem('donezo-reset-codes', JSON.stringify(resetCodes))

        setSuccess('Password updated successfully! You can now sign in.')
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
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
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
      case 'reset-password':
        return 'Reset Password'
      default:
        return 'Welcome Back'
    }
  }

  const getSubtitle = () => {
    switch (authMode) {
      case 'signup':
        return 'Sign up to get started with Donezo'
      case 'signin':
        return 'Sign in to your account'
      case 'forgot-password':
        return 'Enter your email to receive a reset code'
      case 'reset-password':
        return 'Enter the reset code and your new password'
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

              <motion.button
                type="button"
                onClick={() => setAuthMode('forgot-password')}
                className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Forgot your password?
              </motion.button>
            </motion.div>
          </>
        )

      case 'signup':
        return (
          <>
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>
          </>
        )

      case 'forgot-password':
        return (
          <>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                  placeholder="Enter your email address"
                />
              </div>
            </div>
          </>
        )

      case 'reset-password':
        return (
          <>
            {/* Reset Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reset Code
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="text"
                  name="resetCode"
                  value={formData.resetCode}
                  onChange={handleInputChange}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base uppercase"
                  placeholder="Enter the 6-digit code"
                  maxLength={6}
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type={showConfirmNewPassword ? 'text' : 'password'}
                  name="confirmNewPassword"
                  value={formData.confirmNewPassword}
                  onChange={handleInputChange}
                  className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showConfirmNewPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
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
          return 'Sending Code...'
        case 'reset-password':
          return 'Updating Password...'
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
        return 'Send Reset Code'
      case 'reset-password':
        return 'Update Password'
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
      case 'reset-password':
        return <Key className="w-4 h-4 mr-2" />
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
          className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-cyan-900/20 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20 dark:border-white/10"
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
            {(authMode === 'forgot-password' || authMode === 'reset-password') && (
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
              className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
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
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-2.5 px-4 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm sm:text-base shadow-lg"
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
