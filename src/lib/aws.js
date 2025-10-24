import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider'

// AWS configuration
const awsConfig = {
  region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || ''
  }
}

// DynamoDB client
const dynamoDBClient = new DynamoDBClient(awsConfig)
export const dynamoDB = DynamoDBDocumentClient.from(dynamoDBClient)

// Cognito client
export const cognito = new CognitoIdentityProviderClient(awsConfig)

// Configuration constants with validation
export const AWS_CONFIG = {
  COGNITO_USER_POOL_ID: import.meta.env.VITE_AWS_COGNITO_USER_POOL_ID || '',
  COGNITO_CLIENT_ID: import.meta.env.VITE_AWS_COGNITO_CLIENT_ID || '',
  DYNAMODB_TABLE_NAME: import.meta.env.VITE_AWS_DYNAMODB_TABLE_NAME || 'donezo-app'
}

// Validation function to check if AWS configuration is properly set
export const validateAWSConfig = () => {
  const missing = []
  const warnings = []
  
  // Check for required AWS Cognito configuration
  if (!AWS_CONFIG.COGNITO_USER_POOL_ID) {
    missing.push('VITE_AWS_COGNITO_USER_POOL_ID')
  }
  
  if (!AWS_CONFIG.COGNITO_CLIENT_ID) {
    missing.push('VITE_AWS_COGNITO_CLIENT_ID')
  }
  
  // Check for AWS credentials
  if (!awsConfig.credentials.accessKeyId) {
    missing.push('VITE_AWS_ACCESS_KEY_ID')
  }
  
  if (!awsConfig.credentials.secretAccessKey) {
    missing.push('VITE_AWS_SECRET_ACCESS_KEY')
  }
  
  return {
    isValid: missing.length === 0,
    missing,
    warnings,
    // Troubleshooting guidance for CLIENT_ID specifically
    clientIdHelp: !AWS_CONFIG.COGNITO_CLIENT_ID ? {
      issue: 'Missing AWS Cognito Client ID',
      description: 'The VITE_AWS_COGNITO_CLIENT_ID environment variable is not set.',
      solutions: [
        '1. Create a .env.local file in your project root',
        '2. Add the line: VITE_AWS_COGNITO_CLIENT_ID=your-actual-client-id',
        '3. Get your Client ID from AWS Console > Cognito > User Pools > Your Pool > App clients',
        '4. Or run: npm run setup:cognito to create a new Cognito setup',
        '5. Restart your development server after adding the environment variable'
      ],
      commonErrors: [
        'Make sure the variable starts with VITE_ (Vite requirement)',
        'Check that .env.local is in your project root directory',
        'Ensure there are no spaces around the = sign',
        'Verify the Client ID is correct (usually 26 characters)'
      ]
    } : null
  }
}

// Entity types for DynamoDB single-table design
export const ENTITY_TYPES = {
  USER: 'USER',
  LIST: 'LIST',
  TODO: 'TODO',
  USER_SETTINGS: 'USER_SETTINGS'
}

// Helper function to generate partition and sort keys
export const generateKeys = {
  user: (userId) => ({
    PK: `USER#${userId}`,
    SK: `PROFILE`
  }),
  list: (userId, listId) => ({
    PK: `USER#${userId}`,
    SK: `LIST#${listId}`
  }),
  todo: (userId, todoId) => ({
    PK: `USER#${userId}`,
    SK: `TODO#${todoId}`
  }),
  userSettings: (userId) => ({
    PK: `USER#${userId}`,
    SK: `SETTINGS`
  })
}