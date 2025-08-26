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

        existingUsers.push(newUser)
        localStorage.setItem('donezo-users', JSON.stringify(existingUsers))

        // Initialize user data
        const userData = {
          todos: [],
          lists: [
            { id: '1', name: 'Personal', color: 'teal', icon: 'Heart' },
            { id: '2', name: 'Work', color: 'blue', icon: 'Zap' },
            { id: '3', name: 'Shopping', color: 'pink', icon: 'ShoppingBag' },
            { id: '4', name: 'Health', color: 'emerald', icon: 'Activity' },
            { id: '5', name: 'Learning', color: 'purple', icon: 'BookOpen' }
          ],
          settings: {
            font: 'Rock Salt'
          },
          theme: 'light'
        }

        localStorage.setItem(`donezo-user-${newUser.id}`, JSON.stringify(userData))
        localStorage.setItem('donezo-current-user', JSON.stringify(newUser))

        onAuthSuccess(newUser, userData)
      } else if (authMode === 'signin') {
        // Sign in
        const existingUsers = JSON.parse(localStorage.getItem('donezo-users') || '[]')
        const user = existingUsers.find(user => 
          user.username === formData.username && user.password === formData.password
        )

        if (!user) {
          setError('Invalid username or password')
          return
        }

        // Load user data
        const userData = JSON.parse(localStorage.getItem(`donezo-user-${user.id}`) || '{}')
        localStorage.setItem('donezo-current-user', JSON.stringify(user))

        onAuthSuccess(user, userData)
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

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => setAuthMode('forgot-password')}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
              >
                Forgot your password?
              </button>
            </div>
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
    setError('')
    setSuccess('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
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
              className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {authMode === 'forgot-password' || authMode === 'reset-password' ? (
                <Key className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              ) : (
                <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              )}
            </motion.div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {getTitle()}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {getSubtitle()}
            </p>
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
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2.5 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm sm:text-base"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-center">
                {getSubmitButtonIcon()}
                <span className="text-sm sm:text-base">{getSubmitButtonText()}</span>
              </div>
            </motion.button>
          </form>

          {/* Toggle Mode */}
          {(authMode === 'signin' || authMode === 'signup') && (
            <div className="mt-5 sm:mt-6 text-center">
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                {getToggleModeText().question}
              </p>
              <motion.button
                onClick={handleToggleMode}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 text-sm sm:text-base"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {getToggleModeText().action}
              </motion.button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Auth
