import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user || !authData.session) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Fetch user profile to get tenant info and role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select(`
        tenant_id,
        role,
        email,
        tenants!inner(name, slug, subscription)
      `)
      .eq('id', authData.user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    const user = {
      id: authData.user.id,
      email: profile.email,
      tenant_id: profile.tenant_id,
      role: profile.role,
      tenant: profile.tenants
    }

    return NextResponse.json({
      token: authData.session.access_token,
      user
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
