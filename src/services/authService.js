import { 
  SignUpCommand, 
  InitiateAuthCommand, 
  GlobalSignOutCommand,
  ForgotPasswordCommand,
  ChangePasswordCommand,
  GetUserCommand
} from '@aws-sdk/client-cognito-identity-provider'
import { PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb'
import { cognito, dynamoDB, AWS_CONFIG, generateKeys, ENTITY_TYPES, validateAWSConfig } from '../lib/aws'
import { v4 as uuidv4 } from 'uuid'

// Session management
let currentSession = null
let sessionCallbacks = []

export const authService = {
  // Sign up a new user
  async signUp(email, password, userData) {
    try {
      // Validate AWS configuration before attempting authentication
      const configValidation = validateAWSConfig()
      if (!configValidation.isValid) {
        const error = new Error('AWS configuration incomplete')
        error.configValidation = configValidation
        throw error
      }
      const command = new SignUpCommand({
        ClientId: AWS_CONFIG.COGNITO_CLIENT_ID,
        Username: email,
        Password: password,
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'custom:username', Value: userData.username }
        ]
      })

      const response = await cognito.send(command)
      
      if (response.UserSub) {
        const userId = response.UserSub
        
        // Create user profile in DynamoDB
        const userKeys = generateKeys.user(userId)
        const userItem = {
          ...userKeys,
          EntityType: ENTITY_TYPES.USER,
          id: userId,
          email: email,
          username: userData.username,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        await dynamoDB.send(new PutCommand({
          TableName: AWS_CONFIG.DYNAMODB_TABLE_NAME,
          Item: userItem
        }))

        const user = {
          id: userId,
          email: email,
          username: userData.username
        }

        return { user, error: null }
      }

      return { user: null, error: 'Failed to create user' }
    } catch (error) {
      console.error('Signup error:', error)
      
      // Provide specific guidance for CLIENT_ID configuration errors
      if (error.configValidation?.clientIdHelp) {
        console.error('🔧 CLIENT_ID Configuration Help:', error.configValidation.clientIdHelp)
        return { 
          user: null, 
          error: `${error.message}. Missing COGNITO_CLIENT_ID environment variable. Check console for setup instructions.`,
          configValidation: error.configValidation
        }
      }
      
      return { user: null, error: error.message }
    }
  },

  // Sign in existing user
  async signIn(email, password) {
    try {
      // Validate AWS configuration before attempting authentication
      const configValidation = validateAWSConfig()
      if (!configValidation.isValid) {
        const error = new Error('AWS configuration incomplete')
        error.configValidation = configValidation
        throw error
      }
      const command = new InitiateAuthCommand({
        ClientId: AWS_CONFIG.COGNITO_CLIENT_ID,
        AuthFlow: 'USER_PASSWORD_AUTH',
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password
        }
      })

      const response = await cognito.send(command)
      
      if (response.AuthenticationResult) {
        const accessToken = response.AuthenticationResult.AccessToken
        
        // Get user info using access token
        const getUserCommand = new GetUserCommand({
          AccessToken: accessToken
        })
        
        const userResponse = await cognito.send(getUserCommand)
        const userId = userResponse.Username
        
        // Get user profile from DynamoDB
        const { profile } = await this.getUserProfile(userId)
        
        const user = {
          id: userId,
          email: email,
          username: profile?.username || email.split('@')[0]
        }

        const session = {
          accessToken,
          refreshToken: response.AuthenticationResult.RefreshToken,
          user
        }

        currentSession = session
        localStorage.setItem('donezo_session', JSON.stringify(session))
        
        // Notify listeners
        sessionCallbacks.forEach(callback => callback('SIGNED_IN', session))

        return { user, session, error: null }
      }

      return { user: null, session: null, error: 'Authentication failed' }
    } catch (error) {
      console.error('Signin error:', error)
      
      // Provide specific guidance for CLIENT_ID configuration errors
      if (error.configValidation?.clientIdHelp) {
        console.error('🔧 CLIENT_ID Configuration Help:', error.configValidation.clientIdHelp)
        return { 
          user: null, 
          session: null,
          error: `${error.message}. Missing COGNITO_CLIENT_ID environment variable. Check console for setup instructions.`,
          configValidation: error.configValidation
        }
      }
      
      return { user: null, session: null, error: error.message }
    }
  },

  // Sign out user
  async signOut() {
    try {
      if (currentSession?.accessToken) {
        const command = new GlobalSignOutCommand({
          AccessToken: currentSession.accessToken
        })
        
        await cognito.send(command)
      }
      
      currentSession = null
      localStorage.removeItem('donezo_session')
      
      // Notify listeners
      sessionCallbacks.forEach(callback => callback('SIGNED_OUT', null))
      
      return { error: null }
    } catch (error) {
      console.error('Signout error:', error)
      
      // Clear session even if logout fails
      currentSession = null
      localStorage.removeItem('donezo_session')
      sessionCallbacks.forEach(callback => callback('SIGNED_OUT', null))
      
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
      const storedSession = localStorage.getItem('donezo_session')
      if (storedSession) {
        const session = JSON.parse(storedSession)
        
        // Verify the session is still valid
        try {
          const getUserCommand = new GetUserCommand({
            AccessToken: session.accessToken
          })
          
          await cognito.send(getUserCommand)
          currentSession = session
          
          return { session, error: null }
        } catch (verifyError) {
          // Session is invalid, clear it
          localStorage.removeItem('donezo_session')
        }
      }
      
      return { session: null, error: null }
    } catch (error) {
      console.error('Get session error:', error)
      return { session: null, error: error.message }
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { session } = await this.getSession()
      return { user: session?.user || null, error: null }
    } catch (error) {
      console.error('Get user error:', error)
      return { user: null, error: error.message }
    }
  },

  // Get user profile from database
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
      return { profile: null, error: error.message }
    }
  },

  // Reset password
  async resetPassword(email) {
    try {
      // Validate AWS configuration before attempting password reset
      const configValidation = validateAWSConfig()
      if (!configValidation.isValid) {
        const error = new Error('AWS configuration incomplete')
        error.configValidation = configValidation
        throw error
      }
      const command = new ForgotPasswordCommand({
        ClientId: AWS_CONFIG.COGNITO_CLIENT_ID,
        Username: email
      })

      await cognito.send(command)
      return { error: null }
    } catch (error) {
      console.error('Password reset error:', error)
      
      // Provide specific guidance for CLIENT_ID configuration errors
      if (error.configValidation?.clientIdHelp) {
        console.error('🔧 CLIENT_ID Configuration Help:', error.configValidation.clientIdHelp)
        return { 
          error: `${error.message}. Missing COGNITO_CLIENT_ID environment variable. Check console for setup instructions.`,
          configValidation: error.configValidation
        }
      }
      
      return { error: error.message }
    }
  },

  // Update password
  async updatePassword(newPassword) {
    try {
      if (!currentSession?.accessToken) {
        throw new Error('No active session')
      }

      const command = new ChangePasswordCommand({
        AccessToken: currentSession.accessToken,
        PreviousPassword: 'old-password', // This would need to be provided by the user
        ProposedPassword: newPassword
      })

      await cognito.send(command)
      return { error: null }
    } catch (error) {
      console.error('Update password error:', error)
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