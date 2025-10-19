#!/usr/bin/env node

/**
 * AWS Cognito User Pool Creation Script for Donezo App
 * 
 * This script creates a Cognito User Pool and User Pool Client
 * for authentication in the Donezo todo application.
 * 
 * Usage:
 * node aws-setup/create-cognito-pool.js
 */

import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider'
import { 
  CreateUserPoolCommand, 
  CreateUserPoolClientCommand,
  DescribeUserPoolCommand,
  ListUserPoolsCommand
} from '@aws-sdk/client-cognito-identity-provider'

// Configuration
const USER_POOL_NAME = process.env.COGNITO_USER_POOL_NAME || 'donezo-users'
const CLIENT_NAME = process.env.COGNITO_CLIENT_NAME || 'donezo-web-client'
const AWS_REGION = process.env.AWS_REGION || 'us-east-1'

const cognitoClient = new CognitoIdentityProviderClient({
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
})

async function checkExistingUserPool() {
  try {
    const listCommand = new ListUserPoolsCommand({
      MaxResults: 60
    })
    
    const response = await cognitoClient.send(listCommand)
    const existingPool = response.UserPools?.find(pool => pool.Name === USER_POOL_NAME)
    
    return existingPool
  } catch (error) {
    console.error('Error checking existing user pools:', error.message)
    return null
  }
}

async function createUserPool() {
  try {
    console.log(`Creating Cognito User Pool: ${USER_POOL_NAME}...`)

    const createPoolCommand = new CreateUserPoolCommand({
      PoolName: USER_POOL_NAME,
      
      // Password Policy
      Policies: {
        PasswordPolicy: {
          MinimumLength: 8,
          RequireUppercase: true,
          RequireLowercase: true,
          RequireNumbers: true,
          RequireSymbols: false,
          TemporaryPasswordValidityDays: 7
        }
      },
      
      // Auto-verified attributes
      AutoVerifiedAttributes: ['email'],
      
      // Username configuration
      UsernameConfiguration: {
        CaseSensitive: false
      },
      
      // User attributes
      Schema: [
        {
          Name: 'email',
          AttributeDataType: 'String',
          Required: true,
          Mutable: true
        },
        {
          Name: 'username',
          AttributeDataType: 'String',
          Mutable: true,
          DeveloperOnlyAttribute: false
        }
      ],
      
      // Account recovery
      AccountRecoverySetting: {
        RecoveryMechanisms: [
          {
            Name: 'verified_email',
            Priority: 1
          }
        ]
      },
      
      // Email configuration (using Cognito's built-in email)
      EmailConfiguration: {
        EmailSendingAccount: 'COGNITO_DEFAULT'
      },
      
      // User pool add-ons
      UserPoolAddOns: {
        AdvancedSecurityMode: 'OFF' // Use 'ENFORCED' for production
      },
      
      // Verification message templates
      VerificationMessageTemplate: {
        DefaultEmailOption: 'CONFIRM_WITH_CODE',
        EmailMessage: 'Welcome to Donezo! Your verification code is {####}',
        EmailSubject: 'Verify your Donezo account'
      },
      
      // Tags
      UserPoolTags: {
        Application: 'Donezo',
        Environment: process.env.NODE_ENV || 'development'
      }
    })

    const poolResult = await cognitoClient.send(createPoolCommand)
    const userPoolId = poolResult.UserPool.Id

    console.log(`✅ User Pool created successfully!`)
    console.log(`User Pool ID: ${userPoolId}`)
    
    return userPoolId
    
  } catch (error) {
    console.error('❌ Error creating user pool:', error.message)
    throw error
  }
}

async function createUserPoolClient(userPoolId) {
  try {
    console.log(`Creating User Pool Client: ${CLIENT_NAME}...`)

    const createClientCommand = new CreateUserPoolClientCommand({
      UserPoolId: userPoolId,
      ClientName: CLIENT_NAME,
      
      // Authentication flows
      ExplicitAuthFlows: [
        'ALLOW_USER_PASSWORD_AUTH',
        'ALLOW_REFRESH_TOKEN_AUTH',
        'ALLOW_USER_SRP_AUTH'
      ],
      
      // Token validity
      AccessTokenValidity: 24, // 24 hours
      RefreshTokenValidity: 30, // 30 days
      IdTokenValidity: 24, // 24 hours
      
      TokenValidityUnits: {
        AccessToken: 'hours',
        RefreshToken: 'days',
        IdToken: 'hours'
      },
      
      // Prevent user existence errors
      PreventUserExistenceErrors: 'ENABLED',
      
      // Supported identity providers
      SupportedIdentityProviders: ['COGNITO'],
      
      // Read/write attributes
      ReadAttributes: [
        'email',
        'email_verified',
        'custom:username'
      ],
      
      WriteAttributes: [
        'email',
        'custom:username'
      ]
    })

    const clientResult = await cognitoClient.send(createClientCommand)
    
    console.log(`✅ User Pool Client created successfully!`)
    console.log(`Client ID: ${clientResult.UserPoolClient.ClientId}`)
    
    return clientResult.UserPoolClient.ClientId
    
  } catch (error) {
    console.error('❌ Error creating user pool client:', error.message)
    throw error
  }
}

async function main() {
  try {
    // Check if user pool already exists
    const existingPool = await checkExistingUserPool()
    
    let userPoolId
    if (existingPool) {
      console.log(`✅ User Pool ${USER_POOL_NAME} already exists`)
      console.log(`User Pool ID: ${existingPool.Id}`)
      userPoolId = existingPool.Id
    } else {
      userPoolId = await createUserPool()
    }
    
    // Create user pool client
    const clientId = await createUserPoolClient(userPoolId)
    
    console.log('\n🎉 Cognito setup complete!')
    console.log('\n📝 Add these values to your .env.local file:')
    console.log(`VITE_AWS_COGNITO_USER_POOL_ID=${userPoolId}`)
    console.log(`VITE_AWS_COGNITO_CLIENT_ID=${clientId}`)
    console.log(`VITE_AWS_REGION=${AWS_REGION}`)
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    process.exit(1)
  }
}

// Run the script
main()