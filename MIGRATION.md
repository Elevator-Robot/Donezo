# Migration Guide: From Supabase to AWS DynamoDB

If you were using a previous version of Donezo with Supabase, this guide will help you migrate to the new AWS-based infrastructure.

## What Changed

**Previous Version (Supabase):**
- PostgreSQL database with Row Level Security
- Supabase Auth for authentication
- Real-time subscriptions
- Supabase client SDK

**New Version (AWS):**
- AWS DynamoDB for data storage
- AWS Cognito for authentication
- RESTful API pattern with AWS SDK
- Enhanced security with IAM policies

## Your Existing Supabase Data

Your existing data is stored in your Supabase project and is not automatically migrated to AWS. You have several migration options.

## Migration Options

### Option 1: Export from Supabase Dashboard

1. **Export your data**:
   - Go to your Supabase dashboard
   - Navigate to the Table Editor
   - Export data from `users`, `lists`, `todos`, and `user_settings` tables
   - Save as CSV or JSON files

2. **Set up AWS infrastructure**:
   - Follow the [AWS_SETUP.md](AWS_SETUP.md) guide
   - Create DynamoDB table and Cognito User Pool

3. **Manual recreation**:
   - Create a new account with the same email
   - Manually recreate your lists and todos using the exported data

### Option 2: Programmatic Migration

Create a migration script to transfer data:

1. **Keep both systems running temporarily**
2. **Export from Supabase**:
   ```javascript
   // Example export script for Supabase
   const { createClient } = require('@supabase/supabase-js')
   const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
   
   async function exportData(userId) {
     const { data: lists } = await supabase.from('lists').select('*').eq('user_id', userId)
     const { data: todos } = await supabase.from('todos').select('*').eq('user_id', userId)
     const { data: settings } = await supabase.from('user_settings').select('*').eq('user_id', userId)
     
     return { lists, todos, settings }
   }
   ```

3. **Import to AWS**:
   - Use the dataService methods to recreate the data in DynamoDB

### Option 3: Keep Supabase as Backup

- Maintain read-only access to your Supabase data
- Use it as a reference while manually recreating important items
- Gradually migrate over time

## Benefits of AWS Migration

### Performance & Reliability
- ✅ **Better scalability**: DynamoDB handles massive scale automatically
- ✅ **Lower latency**: Single-digit millisecond response times
- ✅ **High availability**: 99.99% availability SLA
- ✅ **No cold starts**: Always-on performance

### Cost & Management
- ✅ **Pay-per-use**: Only pay for what you consume
- ✅ **Free tier**: Generous free tier for development
- ✅ **Reduced vendor lock-in**: Standard AWS services
- ✅ **Better monitoring**: CloudWatch integration

### Security & Compliance
- ✅ **Enterprise security**: AWS security standards
- ✅ **IAM integration**: Fine-grained access controls
- ✅ **Audit trails**: CloudTrail logging
- ✅ **Compliance**: SOC, HIPAA, PCI DSS compliance

## Frequently Asked Questions

### Can I keep using Supabase?

The previous Supabase version is no longer maintained. You can continue using it temporarily, but you won't receive updates or bug fixes.

### Will my Supabase data interfere with AWS?

No, the AWS version uses completely different storage and authentication systems. Your Supabase data remains in your Supabase project.

### Can I use both versions during migration?

Yes, you can run both versions during the migration period to ensure you don't lose any important data.

### Is the AWS version more secure?

Both versions are secure, but AWS provides additional enterprise-grade security features:
- IAM policies for fine-grained access control
- CloudTrail for audit logging
- AWS security compliance certifications
- Advanced threat detection

### Will it cost more than Supabase?

For typical personal use, both AWS and Supabase have generous free tiers. AWS DynamoDB and Cognito free tier limits should cover most individual users at no cost.

### Is the feature set the same?

Yes, all existing features are maintained. The user interface and functionality remain identical.

## Need Help?

If you encounter any issues during migration or have questions:

1. Check the [AWS_SETUP.md](AWS_SETUP.md) guide for setup instructions
2. Review the updated README.md for AWS configuration
3. Check AWS documentation for DynamoDB and Cognito
4. Open an issue on GitHub if you encounter bugs

## Migration Support Tools

We've included helper scripts to make migration easier:

- `npm run setup:aws` - Complete AWS setup
- `npm run setup:dynamodb` - Create DynamoDB table only
- `npm run setup:cognito` - Create Cognito User Pool only

## Summary

The migration to AWS provides enhanced scalability, reliability, and security. While it requires some setup work, the AWS infrastructure offers enterprise-grade capabilities with generous free tier limits for personal use. The improved performance and reliability make it worthwhile for long-term use.