# AWS Setup Guide for Donezo

This guide will help you set up AWS DynamoDB and Cognito for the Donezo todo application.

## Prerequisites

- An AWS account (free tier is sufficient for development)
- AWS CLI configured or AWS access keys
- Node.js and npm installed

## Step 1: Configure AWS Credentials

### Option A: AWS CLI (Recommended)

1. Install the AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
2. Configure your credentials:
   ```bash
   aws configure
   ```
3. Enter your AWS Access Key ID, Secret Access Key, region, and output format

### Option B: Environment Variables

Set these environment variables:
```bash
export AWS_ACCESS_KEY_ID=your-access-key-id
export AWS_SECRET_ACCESS_KEY=your-secret-access-key
export AWS_REGION=us-east-1
```

## Step 2: Set Up DynamoDB Table

### Automated Setup (Recommended)

Run the provided script to create the DynamoDB table:

```bash
cd your-donezo-project
node aws-setup/create-dynamodb-table.js
```

This creates a table named `donezo-app` with the proper schema for the application.

### Manual Setup

If you prefer to create the table manually:

1. Go to the AWS Console → DynamoDB
2. Click "Create table"
3. Configure:
   - **Table name**: `donezo-app`
   - **Partition key**: `PK` (String)
   - **Sort key**: `SK` (String)
   - **Billing mode**: On-demand
4. After creation, add a Global Secondary Index:
   - **Index name**: `EntityTypeIndex`
   - **Partition key**: `EntityType` (String)
   - **Sort key**: `SK` (String)

## Step 3: Set Up Cognito User Pool

### Automated Setup (Recommended)

Run the provided script to create the Cognito User Pool:

```bash
node aws-setup/create-cognito-pool.js
```

This will output the User Pool ID and Client ID you need for configuration.

### Manual Setup

If you prefer manual setup:

1. Go to AWS Console → Cognito
2. Click "Create user pool"
3. Configure sign-in options:
   - **Username**: Email address
   - **Password requirements**: Minimum 8 characters, require uppercase, lowercase, and numbers
4. Configure message delivery:
   - **Email**: Use Cognito (for development)
5. Create the user pool and note the **User Pool ID**
6. Create a User Pool Client:
   - **App type**: Public client
   - **Auth flows**: Enable "USER_PASSWORD_AUTH"
   - Note the **Client ID**

## Step 4: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` with your AWS values:
   ```env
   VITE_AWS_REGION=us-east-1
   VITE_AWS_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
   VITE_AWS_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
   VITE_AWS_DYNAMODB_TABLE_NAME=donezo-app
   VITE_AWS_ACCESS_KEY_ID=your-access-key-id
   VITE_AWS_SECRET_ACCESS_KEY=your-secret-access-key
   ```

## Step 5: Set Up IAM Permissions

Create an IAM policy with the following permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:PutItem",
                "dynamodb:GetItem",
                "dynamodb:UpdateItem",
                "dynamodb:DeleteItem",
                "dynamodb:Query",
                "dynamodb:Scan"
            ],
            "Resource": [
                "arn:aws:dynamodb:*:*:table/donezo-app",
                "arn:aws:dynamodb:*:*:table/donezo-app/index/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "cognito-idp:InitiateAuth",
                "cognito-idp:SignUp",
                "cognito-idp:ConfirmSignUp",
                "cognito-idp:ForgotPassword",
                "cognito-idp:ConfirmForgotPassword",
                "cognito-idp:ChangePassword",
                "cognito-idp:GetUser",
                "cognito-idp:GlobalSignOut"
            ],
            "Resource": "arn:aws:cognito-idp:*:*:userpool/*"
        }
    ]
}
```

Attach this policy to your IAM user or role.

## Step 6: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to your app and test:
   - Creating a new account
   - Signing in with existing credentials
   - Creating todos and lists
   - Logging out and logging back in

## Step 7: Verify Multi-Device Sync

1. Sign in to your account on one device/browser
2. Create some todos and lists
3. Sign in to the same account on another device/browser
4. Verify that your data appears on both devices
5. Make changes on one device and refresh the other to see updates

## Data Structure

The application uses a single-table design in DynamoDB with the following access patterns:

### Primary Key Structure
- **User Profile**: `PK=USER#<userId>`, `SK=PROFILE`
- **User Lists**: `PK=USER#<userId>`, `SK=LIST#<listId>`
- **User Todos**: `PK=USER#<userId>`, `SK=TODO#<todoId>`
- **User Settings**: `PK=USER#<userId>`, `SK=SETTINGS`

### Entity Types
- `USER`: User profile information
- `LIST`: Todo lists
- `TODO`: Individual todo items
- `USER_SETTINGS`: User preferences and settings

## Security Features

### DynamoDB Security
- Item-level security through application logic
- IAM policies control access to tables
- Encryption at rest and in transit

### Cognito Authentication
- Secure password hashing
- Email verification for new accounts
- JWT token-based authentication
- Automatic token refresh

### Application Security
- User data isolation through partition keys
- Input validation and sanitization
- Secure session management

## Production Deployment

### Environment Variables
Ensure your production environment has the correct AWS credentials:

```env
VITE_AWS_REGION=us-east-1
VITE_AWS_COGNITO_USER_POOL_ID=your-production-user-pool-id
VITE_AWS_COGNITO_CLIENT_ID=your-production-client-id
VITE_AWS_DYNAMODB_TABLE_NAME=donezo-app-prod
# Use IAM roles instead of access keys in production
```

### Production Best Practices
1. Use IAM roles instead of access keys when possible
2. Enable CloudWatch monitoring for DynamoDB
3. Set up CloudWatch alarms for error rates
4. Enable AWS CloudTrail for audit logging
5. Consider using DynamoDB backup and point-in-time recovery
6. Use separate AWS resources for different environments

## Troubleshooting

### Common Issues

1. **"Access Denied" errors**
   - Verify your AWS credentials are correct
   - Check IAM permissions for DynamoDB and Cognito
   - Ensure the table name matches your configuration

2. **"User Pool not found" errors**
   - Verify the User Pool ID in your environment variables
   - Check that the User Pool exists in the correct region

3. **"Table not found" errors**
   - Verify the DynamoDB table was created successfully
   - Check that the table name matches your configuration

4. **Authentication errors**
   - Verify the Cognito Client ID is correct
   - Check that USER_PASSWORD_AUTH is enabled in your User Pool Client
   - Ensure email verification is configured correctly

### Getting Help

- Check the [AWS DynamoDB documentation](https://docs.aws.amazon.com/dynamodb/)
- Review the [AWS Cognito documentation](https://docs.aws.amazon.com/cognito/)
- Check the browser console for detailed error messages
- Verify operations in the AWS Console

## Migration from Supabase

If you're migrating from the previous Supabase version:

1. **Export existing data**: Use the Supabase dashboard to export your data
2. **Create AWS resources**: Follow this setup guide
3. **Manual data migration**: 
   - Create a new account with the same email
   - Manually recreate your important lists and todos
   - The old Supabase data won't interfere with the new system

## Cost Considerations

### DynamoDB Costs
- **On-demand billing**: Pay per request
- **Free tier**: 25 GB storage, 25 read/write capacity units
- Typical costs for personal use: $0-5/month

### Cognito Costs
- **Free tier**: 50,000 monthly active users
- Typical costs for personal use: $0/month

### Total estimated cost for personal use: $0-5/month

The AWS free tier should cover most personal usage scenarios.