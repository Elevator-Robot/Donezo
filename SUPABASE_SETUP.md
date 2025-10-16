# Supabase Setup Guide for Donezo

This guide will help you set up Supabase for the Donezo todo application.

## Prerequisites

- A Supabase account (free tier is sufficient)
- Node.js and npm installed

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/log in
2. Click "New Project"
3. Choose your organization
4. Fill in your project details:
   - **Name**: `donezo-todo` (or any name you prefer)
   - **Database Password**: Generate a strong password and save it
   - **Region**: Choose the region closest to your users
5. Click "Create new project"
6. Wait for the project to be created (usually takes 1-2 minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like `https://your-project-ref.supabase.co`)
   - **Project API Keys** → **anon public** (this is safe to use in frontend)

## Step 3: Configure Environment Variables

1. In your Donezo project root, copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and replace the placeholder values:
   ```env
   VITE_SUPABASE_URL=https://your-actual-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key
   ```

## Step 4: Set Up the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Create a new query
3. Copy the contents of `database/schema.sql` from this project
4. Paste it into the SQL editor and click **Run**

This will create:
- Database tables (users, lists, todos, user_settings)
- Row Level Security (RLS) policies
- Indexes for performance
- Triggers for automatic user profile creation

## Step 5: Configure Authentication

1. In your Supabase dashboard, go to **Authentication** → **Settings**
2. Under **Site URL**, add your application URLs:
   - For development: `http://localhost:3000` (or your dev port)
   - For production: `https://your-domain.com`
3. Under **Redirect URLs**, add the same URLs
4. Make sure **Enable email confirmations** is enabled for production

## Step 6: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to your app and try:
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

## Security Features

The database schema includes several security features:

### Row Level Security (RLS)
- Users can only access their own data
- All database operations are automatically filtered by user ID
- Policies are enforced at the database level

### Authentication
- Passwords are hashed automatically by Supabase
- Email verification for new accounts
- Secure session management
- Automatic token refresh

### Data Validation
- Username and email uniqueness constraints
- Required field validation
- Foreign key constraints to maintain data integrity

## Production Deployment

### Environment Variables
Ensure your production environment has the correct Supabase credentials:

```env
VITE_SUPABASE_URL=your-production-supabase-url
VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

### Supabase Settings
1. Update **Site URL** and **Redirect URLs** to your production domain
2. Consider enabling additional security features in Supabase dashboard
3. Set up database backups in Supabase settings

## Troubleshooting

### Common Issues

1. **"Invalid API key" error**
   - Verify your `.env.local` file has the correct values
   - Make sure you're using the **anon public** key, not the service role key

2. **"Database connection failed"**
   - Check that the database schema was applied correctly
   - Verify the project URL is correct

3. **"User cannot access data"**
   - Ensure RLS policies were created correctly
   - Check that the user is properly authenticated

4. **Build errors**
   - Make sure all environment variables are prefixed with `VITE_`
   - Restart your development server after changing environment variables

### Getting Help

- Check the [Supabase documentation](https://supabase.com/docs)
- Review the browser console for error messages
- Verify database operations in the Supabase dashboard

## Migration from localStorage

If you have existing data in localStorage from the previous version:

1. Export your data before upgrading (manually copy todos/lists)
2. Create a new account with the same email
3. Manually recreate your lists and todos
4. The old localStorage data will remain but won't be used

Note: Automatic migration is not implemented to avoid potential data conflicts.