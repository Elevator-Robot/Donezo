#!/usr/bin/env node

/**
 * DynamoDB Table Creation Script for Donezo App
 * 
 * This script creates a DynamoDB table for the Donezo todo application.
 * The table uses a single-table design with composite keys.
 * 
 * Usage:
 * node aws-setup/create-dynamodb-table.js
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb'

// Configuration
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'donezo-app'
const AWS_REGION = process.env.AWS_REGION || 'us-east-1'

const dynamoClient = new DynamoDBClient({
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
})

async function createTable() {
  try {
    // Check if table already exists
    try {
      const describeCommand = new DescribeTableCommand({
        TableName: TABLE_NAME
      })
      
      const existingTable = await dynamoClient.send(describeCommand)
      console.log(`✅ Table ${TABLE_NAME} already exists with status: ${existingTable.Table.TableStatus}`)
      return
    } catch (error) {
      if (error.name !== 'ResourceNotFoundException') {
        throw error
      }
      // Table doesn't exist, continue with creation
    }

    console.log(`Creating DynamoDB table: ${TABLE_NAME}...`)

    const createCommand = new CreateTableCommand({
      TableName: TABLE_NAME,
      
      // Key Schema
      KeySchema: [
        {
          AttributeName: 'PK',
          KeyType: 'HASH'  // Partition key
        },
        {
          AttributeName: 'SK',
          KeyType: 'RANGE' // Sort key
        }
      ],
      
      // Attribute Definitions
      AttributeDefinitions: [
        {
          AttributeName: 'PK',
          AttributeType: 'S'
        },
        {
          AttributeName: 'SK',
          AttributeType: 'S'
        },
        {
          AttributeName: 'EntityType',
          AttributeType: 'S'
        },
        {
          AttributeName: 'GSI1PK',
          AttributeType: 'S'
        },
        {
          AttributeName: 'GSI1SK',
          AttributeType: 'S'
        }
      ],
      
      // Global Secondary Indexes
      GlobalSecondaryIndexes: [
        {
          IndexName: 'GSI1',
          KeySchema: [
            {
              AttributeName: 'GSI1PK',
              KeyType: 'HASH'
            },
            {
              AttributeName: 'GSI1SK',
              KeyType: 'RANGE'
            }
          ],
          Projection: {
            ProjectionType: 'ALL'
          },
          BillingMode: 'PAY_PER_REQUEST'
        },
        {
          IndexName: 'EntityTypeIndex',
          KeySchema: [
            {
              AttributeName: 'EntityType',
              KeyType: 'HASH'
            },
            {
              AttributeName: 'SK',
              KeyType: 'RANGE'
            }
          ],
          Projection: {
            ProjectionType: 'ALL'
          },
          BillingMode: 'PAY_PER_REQUEST'
        }
      ],
      
      // Billing Mode
      BillingMode: 'PAY_PER_REQUEST',
      
      // Tags
      Tags: [
        {
          Key: 'Application',
          Value: 'Donezo'
        },
        {
          Key: 'Environment',
          Value: process.env.NODE_ENV || 'development'
        }
      ]
    })

    const result = await dynamoClient.send(createCommand)
    
    console.log('✅ Table creation initiated successfully!')
    console.log(`Table ARN: ${result.TableDescription.TableArn}`)
    console.log(`Table Status: ${result.TableDescription.TableStatus}`)
    console.log('\n📋 Table Access Patterns:')
    console.log('- User Profile: PK=USER#<userId>, SK=PROFILE')
    console.log('- User Lists: PK=USER#<userId>, SK=LIST#<listId>')
    console.log('- User Todos: PK=USER#<userId>, SK=TODO#<todoId>')
    console.log('- User Settings: PK=USER#<userId>, SK=SETTINGS')
    console.log('\nNote: Table may take a few minutes to become active.')
    
  } catch (error) {
    console.error('❌ Error creating table:', error.message)
    process.exit(1)
  }
}

// Run the script
createTable()