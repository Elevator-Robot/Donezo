import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react'
import { authService } from '../services/authService'
import { dataService } from '../services/dataService'

const deriveUsernameFromEmail = (value = '') => {
  if (!value.includes('@')) return value || 'donezo-user'
  return value.split('@')[0]
}

const Auth = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isOAuthLoading, setIsOAuthLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPasswordStep, setShowPasswordStep] = useState(false)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const [confirmationCode, setConfirmationCode] = useState('')

  const resetAlerts = () => {
    setError('')
    setSuccess('')
  }

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.trim()) {
      setError('Email is required')
      return false
    }
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address')
      return false
    }
    return true
  }

  const handleEmailContinue = () => {
    resetAlerts()
    if (!validateEmail()) return
    setShowPasswordStep(true)
  }

  const hydrateUserContext = async (userId, username, emailAddress, { seedDefaults = false } = {}) => {
    try {
      const profileResult = await authService.getUserProfile(userId)
      const resolvedUsername = profileResult.profile?.username || username

      let lists = []
      let todos = []
      let settings = { font: 'Rock Salt', theme: 'light' }

      if (seedDefaults) {
        const { lists: seededLists, settings: seededSettings } = await dataService.initializeUserData(userId)
        if (seededLists?.length) lists = seededLists
        if (seededSettings) settings = seededSettings
      }

      const [listsRes, todosRes, settingsRes] = await Promise.all([
        dataService.getUserLists(userId),
        dataService.getUserTodos(userId),
        dataService.getUserSettings(userId)
      ])

      if (!lists.length) {
        lists = listsRes.lists || []
      }
      todos = todosRes.todos || []
      if (settingsRes.settings) {
        settings = settingsRes.settings
      }

      if (!lists.length) {
        const { lists: seededLists, settings: seededSettings } = await dataService.initializeUserData(userId)
        if (seededLists?.length) lists = seededLists
        if (seededSettings) settings = seededSettings || settings
      }

      const userData = {
        todos,
        lists,
        settings,
        theme: settings?.theme || 'light'
      }

      const userObj = {
        id: userId,
        username: resolvedUsername,
        email: emailAddress,
        createdAt: profileResult.profile?.created_at || new Date().toISOString()
      }

      onAuthSuccess(userObj, userData)
    } catch (err) {
      console.error('Failed to load user data:', err)
      setError('Signed in, but failed to load your data. Please refresh the page.')
    }
  }

  const handleCreateAccount = async () => {
    const username = deriveUsernameFromEmail(email)
    const {
      user,
      error: signupError,
      requiresConfirmation,
      errorCode: signupErrorCode
    } = await authService.signUp(email, password, { username })

    if (signupError) {
      if (signupErrorCode === 'UsernameExistsException') {
        setError('Account already exists. Double-check your password or continue with Google.')
      } else {
        setError(signupError)
      }
      return { success: false, handled: true }
    }

    if (requiresConfirmation) {
      setNeedsConfirmation(true)
      setSuccess('Check your email for the verification code to finish creating your account.')
      return { success: false, handled: true }
    }

    if (user) {
      await hydrateUserContext(user.id, username, email, { seedDefaults: true })
      return { success: true, handled: true }
    }

    return { success: false, handled: false }
  }

  const attemptSignIn = async () => {
    const { user, error: signInError, errorCode } = await authService.signIn(email, password)

    if (signInError) {
      const shouldAutoCreate = errorCode === 'UserNotFoundException' || errorCode === 'NotAuthorizedException'
      if (shouldAutoCreate) {
        const result = await handleCreateAccount()
        if (result?.success || result?.handled) {
          return
        }
      }
      setError(signInError)
      return
    }

    if (user) {
      await hydrateUserContext(user.id, deriveUsernameFromEmail(email), email)
    }
  }

  const handleConfirmation = async () => {
    if (!confirmationCode.trim()) {
      setError('Please enter the confirmation code from your email.')
      return
    }

    setIsLoading(true)
    resetAlerts()
    try {
      const { error: confirmError } = await authService.confirmSignUp(email, confirmationCode.trim())
      if (confirmError) {
        setError(confirmError)
        return
      }
      setNeedsConfirmation(false)
      setSuccess('Account confirmed! Signing you in...')
      await attemptSignIn()
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrimarySubmit = async (e) => {
    e.preventDefault()
    resetAlerts()

    if (needsConfirmation) {
      await handleConfirmation()
      return
    }

    if (!showPasswordStep) {
      handleEmailContinue()
      return
    }

    if (!password) {
      setError('Password is required')
      return
    }

    setIsLoading(true)
    try {
      await attemptSignIn()
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToEmail = () => {
    setShowPasswordStep(false)
    setNeedsConfirmation(false)
    setPassword('')
    setConfirmationCode('')
    resetAlerts()
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsOAuthLoading(true)
      await authService.signInWithGoogle()
    } catch (err) {
      console.error('Google sign-in error:', err)
      setError('Failed to start Google sign-in. Please try again.')
      setIsOAuthLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-white/20 dark:bg-white/10 rounded-full blur-xl"
          animate={{ x: [0, 100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-32 left-1/4 w-40 h-40 bg-purple-200/25 dark:bg-purple-400/15 rounded-full blur-2xl"
          animate={{ x: [0, 120, 0], y: [0, -80, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <motion.div
          className="bg-gradient-to-br from-teal-50 via-blue-50 to-cyan-100 dark:from-teal-900/30 dark:via-blue-900/30 dark:to-cyan-900/30 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20 dark:border-white/10"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <div className="text-center mb-6">
            {(showPasswordStep || needsConfirmation) && (
              <motion.button
                onClick={handleBackToEmail}
                className="absolute top-6 left-6 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </motion.button>
            )}
            <motion.div
              className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <CheckCircle className="w-7 h-7 text-white" />
            </motion.div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {needsConfirmation ? 'Confirm your account' : showPasswordStep ? 'Welcome back' : 'Log in or sign up'}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {needsConfirmation ? 'Enter the code we sent to your email to finish signing up.' : 'Use your email and password or continue with Google.'}
            </p>
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="text-emerald-600 text-sm bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg mb-4">
              {success}
            </div>
          )}

          <form className="space-y-4" onSubmit={handlePrimarySubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={showPasswordStep || needsConfirmation}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-white"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {needsConfirmation ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirmation code
                </label>
                <input
                  type="text"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-white tracking-widest text-center"
                  placeholder="123456"
                />
              </div>
            ) : showPasswordStep && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-white"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {!showPasswordStep && !needsConfirmation && (
              <motion.button
                type="button"
                onClick={handleEmailContinue}
                className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                Continue
              </motion.button>
            )}

            {(showPasswordStep || needsConfirmation) && (
              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-teal-600 hover:to-blue-600 disabled:opacity-50"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? 'Please wait…' : needsConfirmation ? 'Confirm account' : 'Continue'}
              </motion.button>
            )}
          </form>

          <div className="mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              <span className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">Or continue with</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </div>
            <motion.button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isOAuthLoading}
              className="w-full flex items-center justify-center gap-3 border border-gray-300 dark:border-gray-600 rounded-lg py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white/80 dark:bg-gray-800/80 hover:bg-white disabled:opacity-60"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>{isOAuthLoading ? 'Redirecting…' : 'Continue with Google'}</span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Auth
