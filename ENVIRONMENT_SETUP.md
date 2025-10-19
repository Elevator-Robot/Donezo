# Donezo - Environment Setup Guide

## Quick Start (Demo Mode)

The application is now configured to work out-of-the-box in demo mode. Simply run:

```bash
npm install
npm run dev
```

Then open http://localhost:3000 and create an account. Your data will be stored locally for the demo session.

## Demo Mode vs Production Mode

### Demo Mode (Default)
- **Enabled when**: AWS environment variables are not configured
- **Data storage**: Local browser storage (session-based)
- **User accounts**: Mock authentication service
- **Features**: Full functionality with local data persistence
- **Best for**: Development, testing, demos

### Production Mode
- **Enabled when**: All AWS environment variables are properly configured
- **Data storage**: AWS DynamoDB
- **User accounts**: AWS Cognito
- **Features**: Full functionality with cloud persistence
- **Best for**: Production deployment

## AWS Configuration (Production Mode)

To enable production mode with AWS services:

1. Copy the environment example file:
   ```bash
   cp .env.example .env.local
   ```

2. Configure your AWS credentials in `.env.local`:
   ```bash
   VITE_AWS_REGION=us-east-1
   VITE_AWS_COGNITO_USER_POOL_ID=your-user-pool-id
   VITE_AWS_COGNITO_CLIENT_ID=your-client-id
   VITE_AWS_DYNAMODB_TABLE_NAME=donezo-app
   VITE_AWS_ACCESS_KEY_ID=your-access-key-id
   VITE_AWS_SECRET_ACCESS_KEY=your-secret-access-key
   
   # Set to false or remove to disable demo mode
   VITE_DEMO_MODE=false
   ```

3. Set up AWS services:
   ```bash
   npm run setup:aws
   ```

## AWS Services Required

### Cognito User Pool
- User authentication and management
- Custom attributes: `custom:username`
- Password policy configuration

### DynamoDB Table
- Single table design
- Partition key: `PK` (String)
- Sort key: `SK` (String)
- Table name: `donezo-app` (or as configured)

### IAM Permissions
The AWS credentials need permissions for:
- `cognito-idp:*` - Cognito Identity Provider operations
- `dynamodb:*` - DynamoDB operations (or more specific permissions)

## Error Handling

The application now includes robust error handling:

### Network/AWS Connectivity Issues
- Graceful fallback to demo mode
- User-friendly error messages
- Automatic retry mechanisms

### Missing Configuration
- Clear warnings in console
- Demo mode activation
- Visual indicators in the UI

### CORS Issues
- AWS SDK handles CORS automatically
- No additional CORS configuration needed for AWS services

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_AWS_REGION` | No | `us-east-1` | AWS region |
| `VITE_AWS_COGNITO_USER_POOL_ID` | For AWS mode | - | Cognito User Pool ID |
| `VITE_AWS_COGNITO_CLIENT_ID` | For AWS mode | - | Cognito App Client ID |
| `VITE_AWS_DYNAMODB_TABLE_NAME` | For AWS mode | `donezo-app` | DynamoDB table name |
| `VITE_AWS_ACCESS_KEY_ID` | For AWS mode | - | AWS access key |
| `VITE_AWS_SECRET_ACCESS_KEY` | For AWS mode | - | AWS secret key |
| `VITE_DEMO_MODE` | No | `true` | Force demo mode |

## Testing Account Creation

### Demo Mode Test
1. Open http://localhost:3000
2. Click "Sign Up" 
3. Fill in the form:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `TestPass123`
4. Submit the form
5. Should see successful account creation and login

### Production Mode Test
1. Ensure AWS is configured
2. Set `VITE_DEMO_MODE=false`
3. Restart the development server
4. Follow the same steps as demo mode
5. Account should be created in AWS Cognito
6. Data should be stored in DynamoDB

## Troubleshooting

### "Load Failed" Error
- **Cause**: AWS credentials missing or invalid
- **Solution**: Check environment variables or use demo mode

### Network Errors
- **Cause**: Internet connectivity or AWS service issues
- **Solution**: Application automatically falls back to demo mode

### Build Errors
- **Cause**: Missing dependencies or configuration
- **Solution**: Run `npm install` and check environment setup

## Security Notes

### Development
- Demo mode data is stored in browser localStorage
- No real authentication in demo mode
- Data is lost when browser storage is cleared

### Production
- Use IAM roles instead of access keys when possible
- Rotate credentials regularly
- Implement proper CORS policies
- Enable CloudTrail for audit logging

## Next Steps

1. **For development**: Demo mode is ready to use
2. **For staging**: Configure AWS services and test
3. **For production**: Use IAM roles and secure credential management