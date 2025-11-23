import {
  signIn as amplifySignIn,
  signUp as amplifySignUp,
  signOut as amplifySignOut,
  getCurrentUser as amplifyGetCurrentUser,
  fetchAuthSession,
  resetPassword as amplifyResetPassword,
  confirmResetPassword as amplifyConfirmResetPassword,
  updatePassword as amplifyUpdatePassword,
  signInWithRedirect
} from 'aws-amplify/auth'
import '../lib/amplifyClient'
import { PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb'
import { dynamoDB, AWS_CONFIG, generateKeys, ENTITY_TYPES } from '../lib/aws'

// Session management
let currentSession = null
let sessionCallbacks = []

const persistSession = (session) => {
  currentSession = session
  localStorage.setItem('donezo_session', JSON.stringify(session))
}

const clearSession = () => {
  currentSession = null
  localStorage.removeItem('donezo_session')
}

const notifyAuthListeners = (event, session) => {
  sessionCallbacks.forEach(callback => callback(event, session))
}

const deriveUsernames = (email, fallbackUsername) => {
  if (fallbackUsername && fallbackUsername !== email) {
    return fallbackUsername
  }
  if (email?.includes('@')) {
    return email.split('@')[0]
  }
  return fallbackUsername || 'donezo-user'
}

const ensureUserProfile = async (userId, email, username) => {
  if (!userId || !AWS_CONFIG.DYNAMODB_TABLE_NAME) return

  const userKeys = generateKeys.user(userId)

  const existing = await dynamoDB.send(new GetCommand({
    TableName: AWS_CONFIG.DYNAMODB_TABLE_NAME,
    Key: userKeys
  }))

  if (existing.Item) {
    return existing.Item
  }

  const timestamp = new Date().toISOString()
  const userItem = {
    ...userKeys,
    EntityType: ENTITY_TYPES.USER,
    id: userId,
    email,
    username,
    created_at: timestamp,
    updated_at: timestamp
  }

  await dynamoDB.send(new PutCommand({
    TableName: AWS_CONFIG.DYNAMODB_TABLE_NAME,
    Item: userItem
  }))

  return userItem
}

const buildSessionFromAmplify = async ({ notifyListeners = false } = {}) => {
  const user = await amplifyGetCurrentUser()
  const sessionResult = await fetchAuthSession()
  const tokens = sessionResult.tokens || {}

  const email = user?.signInDetails?.loginId || user?.username || ''
  const friendlyUsername = deriveUsernames(email, user?.username)

  await ensureUserProfile(user.userId, email, friendlyUsername)

  const sessionPayload = {
    accessToken: tokens.accessToken?.toString() || '',
    idToken: tokens.idToken?.toString() || '',
    refreshToken: tokens.refreshToken?.toString() || '',
    user: {
      id: user.userId,
      email,
      username: friendlyUsername
    }
  }

  persistSession(sessionPayload)

  if (notifyListeners) {
    notifyAuthListeners('SIGNED_IN', sessionPayload)
  }

  return sessionPayload
}

const handleAuthError = (error) => {
  if (!error) return 'Unknown authentication error'
  if (typeof error === 'string') return error
  if (error.message) return error.message
  return 'Unknown authentication error'
}

export const authService = {
  async signUp(email, password, userData) {
    try {
      const signUpResult = await amplifySignUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            nickname: userData.username
          }
        }
      })

      // If Cognito requires confirmation, surface a friendly message
      if (signUpResult?.nextStep?.signUpStep && signUpResult.nextStep.signUpStep !== 'DONE') {
        return {
          user: null,
          error: 'Check your email for a confirmation link/code, then sign in again.'
        }
      }

      const signInResult = await amplifySignIn({ username: email, password })

      if (!signInResult?.isSignedIn) {
        const step = signInResult?.nextStep?.signInStep || 'additional verification'
        return {
          user: null,
          error: `Please complete the ${step} challenge in the hosted UI before continuing.`
        }
      }

      try {
        const session = await buildSessionFromAmplify({ notifyListeners: true })
        return { user: session?.user || null, error: null }
      } catch (sessionError) {
        console.error('Post-signup session error:', sessionError)
        return {
          user: null,
          error: 'Sign-up succeeded, but we could not finalize the session. Please sign in again.'
        }
      }
    } catch (error) {
      console.error('Signup error:', error)
      return { user: null, error: handleAuthError(error) }
    }
  },

  async signIn(email, password) {
    try {
      const signInResult = await amplifySignIn({ username: email, password })

      if (!signInResult?.isSignedIn) {
        const nextStep = signInResult?.nextStep?.signInStep || 'additional verification'
        return {
          user: null,
          session: null,
          error: `Please complete the ${nextStep} challenge via the hosted UI before continuing.`
        }
      }

      const session = await buildSessionFromAmplify({ notifyListeners: true })
      return { user: session.user, session, error: null }
    } catch (error) {
      console.error('Signin error:', error)
      return { user: null, session: null, error: handleAuthError(error) }
    }
  },

  async signInWithGoogle() {
    await signInWithRedirect({ provider: 'Google' })
  },

  async signOut() {
    try {
      await amplifySignOut({ global: true })
    } catch (error) {
      console.error('Signout error:', error)
      return { error: handleAuthError(error) }
    } finally {
      clearSession()
      notifyAuthListeners('SIGNED_OUT', null)
    }

    return { error: null }
  },

  async getSession() {
    try {
      if (currentSession) {
        return { session: currentSession, error: null }
      }

      const session = await buildSessionFromAmplify()
      return { session, error: null }
    } catch (error) {
      if (error?.name === 'UserUnAuthenticatedException') {
        clearSession()
        return { session: null, error: null }
      }

      console.error('Get session error:', error)
      return { session: null, error: handleAuthError(error) }
    }
  },

  async getCurrentUser() {
    try {
      const session = await buildSessionFromAmplify()
      return { user: session.user, error: null }
    } catch (error) {
      if (error?.name === 'UserUnAuthenticatedException') {
        return { user: null, error: null }
      }
      console.error('Get current user error:', error)
      return { user: null, error: handleAuthError(error) }
    }
  },

  async getUserProfile(userId) {
    try {
      const userKeys = generateKeys.user(userId)

      const command = new GetCommand({
        TableName: AWS_CONFIG.DYNAMODB_TABLE_NAME,
        Key: userKeys
      })

      const response = await dynamoDB.send(command)

      if (response.Item) {
        return { profile: response.Item, error: null }
      }

      return { profile: null, error: 'Profile not found' }
    } catch (error) {
      console.error('Get profile error:', error)
      return { profile: null, error: handleAuthError(error) }
    }
  },

  async resetPassword(email) {
    try {
      const result = await amplifyResetPassword({ username: email })
      return { error: null, nextStep: result.nextStep }
    } catch (error) {
      console.error('Password reset error:', error)
      return { error: handleAuthError(error) }
    }
  },

  async confirmPasswordReset(email, confirmationCode, newPassword) {
    try {
      await amplifyConfirmResetPassword({
        username: email,
        confirmationCode,
        newPassword
      })
      return { error: null }
    } catch (error) {
      console.error('Confirm password reset error:', error)
      return { error: handleAuthError(error) }
    }
  },

  async updatePassword(oldPassword, newPassword) {
    try {
      await amplifyUpdatePassword({ oldPassword, newPassword })
      return { error: null }
    } catch (error) {
      console.error('Update password error:', error)
      return { error: handleAuthError(error) }
    }
  },

  onAuthStateChange(callback) {
    sessionCallbacks.push(callback)

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
