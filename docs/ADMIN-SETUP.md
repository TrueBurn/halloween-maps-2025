# Admin Setup Guide

## Prerequisites: Configure Supabase Auth (REQUIRED)

Before inviting admin users, you **must** configure Supabase authentication settings:

### 1. Configure Redirect URLs

For **both** Supabase projects:

1. Go to your Supabase dashboard
2. Navigate to **Authentication** → **URL Configuration**

Add these redirect URLs (one per line):
```
http://localhost:3000/auth/confirm
https://*.your-domain.com/auth/confirm
https://*.your-domain.com/admin/reset-password
```

**Note:** Replace `your-domain.com` with your actual domain. The `*` wildcard allows any subdomain.

### 2. Configure Email Templates

For **both** Supabase projects:

1. Go to your Supabase dashboard
2. Navigate to **Authentication** → **Email Templates**

#### Invite User Template
Replace the entire template with:
```html
<h2>You have been invited</h2>

<p>You have been invited to create a user on {{ .SiteURL }}. Follow this link to accept the invite:</p>
<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/admin">Accept the invite</a>
</p>
```

#### Reset Password Template
Replace the entire template with:
```html
<h2>Reset Password</h2>

<p>Follow this link to reset the password for your user:</p>
<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/admin">Reset Password</a>
</p>
```

---

## Creating an Admin User

### Method 1: Invite User (Recommended for Production)

**Best for**: Inviting new admins who will set their own password

1. Go to your Supabase dashboard → **Authentication** → **Users**

2. Click **"Invite user"**

3. Enter the admin's email address

4. Click **"Send invite"**

5. The user will receive an email with a link to `/auth/confirm` (verifies token)

6. After verification, they're redirected to `/admin/reset-password` to set their password

7. After setting their password, they can login at `/admin/login`

### Method 2: Create User with Password (Development Only)

**Best for**: Quick development setup

1. Go to **Authentication** → **Users**

2. Click **"Add user"** → **"Create new user"**

3. Enter:
   - Email: your-email@example.com
   - Password: (create a secure password)
   - **Auto Confirm User**: ✅ Check this box (important!)

4. Click **"Create user"**

### Method 3: Using SQL (Create Admin Directly - Advanced)

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

## Password Reset Flow

Users can reset their password directly from the login page:

1. Go to `/admin/login`
2. Enter your email address
3. Click **"Forgot?"** next to the password field
4. Check email for password reset link
5. Click the link → Goes to `/auth/confirm` (verifies token)
6. Automatically redirected to `/admin/reset-password`
7. Set a new password
8. Login with the new password

## Troubleshooting

### "Invalid login credentials" error

- ✅ Make sure the user's email is confirmed
- ✅ Check that you're using the correct email and password
- ✅ Use the "Forgot?" link on login page to reset password

### Invite link not working

- ✅ Make sure redirect URLs are configured in Supabase (see Prerequisites section)
  - Must include `/auth/confirm` as primary redirect
- ✅ Make sure email templates are updated (see Prerequisites section)
- ✅ Check that the invite link goes to `/auth/confirm?token_hash=...&type=invite`
- ✅ Verify the link hasn't expired (invite links expire after 24 hours)
- ✅ Check for errors at `/error` page if redirected there

### Password reset not working

- ✅ Ensure email templates are configured correctly (see Prerequisites section)
- ✅ Check redirect URLs include `/auth/confirm` (see Prerequisites section)
- ✅ Verify reset link goes to `/auth/confirm?token_hash=...&type=recovery`
- ✅ Try requesting a new reset link from the login page
- ✅ Check browser console for errors during token verification

### User can't access admin panel after login

- Check browser console for errors
- Make sure cookies are enabled
- Try clearing browser cache and cookies

### Need to manually reset admin password (Dashboard)

1. Go to **Authentication** → **Users** in Supabase
2. Click on the user
3. Click **"Send password reset email"**
4. User will receive email with reset link to `/admin/reset-password`

## Security Notes

- 🔐 Use strong passwords for admin accounts
- 🔐 Enable email confirmation in production
- 🔐 Consider adding role-based access control (RBAC) for multiple admin levels
- 🔐 Regularly audit admin user list
