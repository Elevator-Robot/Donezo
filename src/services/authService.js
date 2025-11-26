import {
  signIn as amplifySignIn,
  signUp as amplifySignUp,
  signOut as amplifySignOut,
  getCurrentUser as amplifyGetCurrentUser,
  fetchAuthSession,
  resetPassword as amplifyResetPassword,
  confirmResetPassword as amplifyConfirmResetPassword,
  updatePassword as amplifyUpdatePassword,
  confirmSignUp as amplifyConfirmSignUp,
  signInWithRedirect
} from 'aws-amplify/auth'
import { generateClient } from 'aws-amplify/data'
import { ensureAmplifyConfigured } from '../lib/amplifyClient'

let dataClientPromise
const getDataClient = () => {
  if (!dataClientPromise) {
    dataClientPromise = ensureAmplifyConfigured().then(() => generateClient())
  }
  return dataClientPromise
}

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
  if (!userId) return null

  const dataClient = await getDataClient()
  const existing = await dataClient.models.UserProfile.get({ id: userId })
  if (existing.errors?.length) {
    throw new Error(existing.errors[0].message)
  }

  if (existing.data) {
    return existing.data
  }

  const timestamp = new Date().toISOString()
  const { data, errors } = await dataClient.models.UserProfile.create({
    id: userId,
    email,
    username,
    created_at: timestamp,
    updated_at: timestamp
  })

  if (errors?.length) {
    throw new Error(errors[0].message)
  }

  return data
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
          error: null,
          requiresConfirmation: true,
          nextStep: signUpResult.nextStep,
          errorCode: null
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
        return { user: session?.user || null, error: null, requiresConfirmation: false, errorCode: null }
      } catch (sessionError) {
        console.error('Post-signup session error:', sessionError)
        return {
          user: null,
          error: 'Sign-up succeeded, but we could not finalize the session. Please sign in again.',
          requiresConfirmation: false,
          errorCode: null
        }
      }
    } catch (error) {
      console.error('Signup error:', error)
      return { user: null, error: handleAuthError(error), requiresConfirmation: false, errorCode: error?.name }
    }
  },

  async signIn(email, password) {
    const performSignIn = async () => amplifySignIn({ username: email, password })

    try {
      let signInResult
      try {
        signInResult = await performSignIn()
      } catch (error) {
        if (error?.name === 'UserAlreadyAuthenticatedException' || error?.message?.includes('already a signed in user')) {
          try {
            await amplifySignOut({ global: false })
          } catch (signOutError) {
            console.warn('Soft sign-out failed, continuing anyway:', signOutError)
          }
          signInResult = await performSignIn()
        } else {
          throw error
        }
      }

      if (!signInResult?.isSignedIn) {
        const nextStep = signInResult?.nextStep?.signInStep || 'additional verification'
        return {
          user: null,
          session: null,
          error: `Please complete the ${nextStep} challenge via the hosted UI before continuing.`,
          errorCode: signInResult?.nextStep?.signInStep || 'NEXT_STEP_REQUIRED'
        }
      }

      const session = await buildSessionFromAmplify({ notifyListeners: true })
      return { user: session.user, session, error: null, errorCode: null }
    } catch (error) {
      console.error('Signin error:', error)
      return { user: null, session: null, error: handleAuthError(error), errorCode: error?.name }
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
      const dataClient = await getDataClient()
      const { data, errors } = await dataClient.models.UserProfile.get({ id: userId })
      if (errors?.length) {
        throw new Error(errors[0].message)
      }

      if (!data) {
        return { profile: null, error: 'Profile not found' }
      }

      return { profile: data, error: null }
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

  async confirmSignUp(email, confirmationCode) {
    try {
      await amplifyConfirmSignUp({ username: email, confirmationCode })
      return { error: null }
    } catch (error) {
      console.error('Confirm signup error:', error)
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
