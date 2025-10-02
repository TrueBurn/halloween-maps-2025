import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '~/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/admin'

  // Redirect to error if no token
  if (!token_hash || !type) {
    return NextResponse.redirect(new URL('/error?message=invalid_token', request.url))
  }

  const supabase = await createClient()

  // Verify the OTP
  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash,
  })

  if (error) {
    return NextResponse.redirect(new URL('/error?message=verification_failed', request.url))
  }

  // For password recovery and invites, redirect to reset password page
  if (type === 'recovery' || type === 'invite' || type === 'email_change') {
    return NextResponse.redirect(new URL('/admin/reset-password', request.url))
  }

  // For other types (e.g., email confirmation), redirect to the next URL
  return NextResponse.redirect(new URL(next, request.url))
}
