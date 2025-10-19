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

// Configuration constants
export const AWS_CONFIG = {
  COGNITO_USER_POOL_ID: import.meta.env.VITE_AWS_COGNITO_USER_POOL_ID || '',
  COGNITO_CLIENT_ID: import.meta.env.VITE_AWS_COGNITO_CLIENT_ID || '',
  DYNAMODB_TABLE_NAME: import.meta.env.VITE_AWS_DYNAMODB_TABLE_NAME || 'donezo-app'
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