import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const tenantId = request.headers.get('x-tenant-id')
    const userRole = request.headers.get('x-user-role')
    const userEmail = request.headers.get('x-user-email')

    if (!userId || !tenantId || !userRole || !userEmail) {
      return NextResponse.json(
        { error: 'Missing user context' },
        { status: 400 }
      )
    }

    // Fetch tenant information
    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from('tenants')
      .select('name, slug, subscription')
      .eq('id', tenantId)
      .single()

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    const user = {
      id: userId,
      email: userEmail,
      tenant_id: tenantId,
      role: userRole as 'ADMIN' | 'MEMBER',
      tenant
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
