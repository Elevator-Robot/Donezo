# Migration Guide: From localStorage to Supabase

If you were using a previous version of Donezo that stored data in your browser's localStorage, this guide will help you understand the changes and migrate your data.

## What Changed

**Previous Version:**
- Data stored locally in your browser
- No user accounts
- Data was device-specific
- No cross-device sync

**New Version:**
- User accounts with email/password
- Data stored in cloud database (Supabase)
- Cross-device synchronization
- Secure, persistent data storage

## Your Existing Data

Your previous tasks and lists are still stored in your browser's localStorage, but the new version doesn't automatically access this data for security and data integrity reasons.

## Migration Options

### Option 1: Manual Migration (Recommended)

1. **Before Upgrading**: If you haven't upgraded yet, you can manually note down your important tasks and lists.

2. **After Upgrading**:
   - Create a new account
   - Manually recreate your important lists
   - Add your important tasks

### Option 2: Export localStorage Data

If you're comfortable with browser developer tools:

1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Run this command to see your old data:
   ```javascript
   // See all your old Doink data
   Object.keys(localStorage).filter(key => key.startsWith('doink-')).forEach(key => {
     console.log(key, JSON.parse(localStorage.getItem(key) || '{}'));
   });
   ```

4. Copy the output and use it as reference when recreating your data in the new system.

## Benefits of the New System

### For You
- ✅ **Never lose your data**: Even if you clear your browser or switch devices
- ✅ **Access anywhere**: Sign in from any device to see your tasks
- ✅ **Real-time sync**: Changes appear instantly on all your devices
- ✅ **Better security**: Your data is encrypted and securely stored

### For the App
- ✅ **Better performance**: Database queries are faster than localStorage for large datasets
- ✅ **Collaboration ready**: Foundation for future sharing features
- ✅ **Backup & recovery**: Your data is automatically backed up
- ✅ **Scalability**: Can handle unlimited tasks and lists

## Frequently Asked Questions

### Can I access my old localStorage data?

Your old data is still in your browser's localStorage, but the new version uses a completely different data structure and storage method. For security and data integrity, we don't automatically migrate this data.

### Will my old data interfere with the new system?

No, the old localStorage data won't interfere with the new system. The new version uses completely different storage keys and methods.

### Can I use both versions?

Technically yes, but we recommend using only the new version to avoid confusion. The old localStorage data won't sync with the new cloud database.

### Is my data secure?

Yes! The new system uses:
- Industry-standard encryption
- Row Level Security (RLS) in the database
- Secure authentication with Supabase
- Your data is isolated from other users

### What if I don't want to create an account?

Unfortunately, the new version requires an account for the cloud sync functionality. However, creating an account is free and only requires an email address.

## Need Help?

If you encounter any issues during migration or have questions:

1. Check the [SUPABASE_SETUP.md](SUPABASE_SETUP.md) guide for setup instructions
2. Review the updated README.md for new features
3. Open an issue on GitHub if you encounter bugs

## Summary

While manual migration is required, the new system provides significant benefits in terms of data persistence, security, and cross-device access. The small effort to recreate your data will be worth the improved experience and peace of mind knowing your tasks are safely stored in the cloud.