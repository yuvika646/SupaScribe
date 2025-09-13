import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from './src/lib/supabase'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for public routes
  if (pathname === '/api/health' || pathname === '/api/auth/login' || pathname === '/login') {
    return NextResponse.next()
  }

  // Skip middleware for static files and Next.js internal routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Extract JWT from Authorization header
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // For frontend routes, redirect to login
    if (!pathname.startsWith('/api/')) {
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
    // For API routes, return 401
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = authHeader.replace('Bearer ', '')

  try {
    // Verify JWT with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    
    if (error || !user) {
      throw new Error('Invalid token')
    }

    // Fetch user profile to get tenant_id and role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('tenant_id, role, email')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Create response with user context in headers
    const response = NextResponse.next()
    response.headers.set('x-user-id', user.id)
    response.headers.set('x-tenant-id', profile.tenant_id)
    response.headers.set('x-user-role', profile.role)
    response.headers.set('x-user-email', profile.email)

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    
    // For frontend routes, redirect to login
    if (!pathname.startsWith('/api/')) {
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
    // For API routes, return 401
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
