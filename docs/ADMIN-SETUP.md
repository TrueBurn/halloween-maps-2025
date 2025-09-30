# Admin Setup Guide

## Creating an Admin User

### Method 1: Using Supabase Dashboard (Recommended for Development)

1. Go to your Supabase project dashboard:
   https://supabase.com/dashboard/project/YOUR_PROJECT_ID

2. Navigate to **Authentication** → **Users**

3. Click **"Add user"** → **"Create new user"**

4. Enter:
   - Email: your-email@example.com
   - Password: (create a secure password)
   - **Auto Confirm User**: ✅ Check this box (important!)

5. Click **"Create user"**

### Method 2: Disable Email Confirmation (Development Only)

If you want to allow users to sign up without email confirmation during development:

1. Go to **Authentication** → **Settings**
2. Scroll to **Email Auth**
3. Toggle **"Enable email confirmations"** to OFF
4. Click **"Save"**

**⚠️ Important**: Re-enable email confirmation before deploying to production!

### Method 3: Using SQL (Create Admin Directly)

1. Go to **SQL Editor** in Supabase dashboard

2. Run this query (replace with your email and password):

\`\`\`sql
-- Create admin user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@example.com', -- Change this
  crypt('your-secure-password', gen_salt('bf')), -- Change this
  NOW(),
  NULL,
  '',
  NULL,
  '',
  NULL,
  '',
  '',
  NULL,
  NULL,
  '{"provider":"email","providers":["email"]}',
  '{}',
  NULL,
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL,
  false,
  NULL
);
\`\`\`

## Testing Admin Access

1. Navigate to: http://localhost:3000/admin/login

2. Enter your email and password

3. You should be redirected to the admin dashboard at: http://localhost:3000/admin

## Troubleshooting

### "Invalid login credentials" error

- ✅ Make sure the user's email is confirmed
- ✅ Check that you're using the correct email and password
- ✅ Try resetting the password in Supabase dashboard

### User can't access admin panel after login

- Check browser console for errors
- Make sure cookies are enabled
- Try clearing browser cache and cookies

### Need to reset admin password

1. Go to **Authentication** → **Users** in Supabase
2. Click on the user
3. Click **"Reset password"**
4. Generate a new password or use the reset email flow

## Security Notes

- 🔐 Use strong passwords for admin accounts
- 🔐 Enable email confirmation in production
- 🔐 Consider adding role-based access control (RBAC) for multiple admin levels
- 🔐 Regularly audit admin user list
