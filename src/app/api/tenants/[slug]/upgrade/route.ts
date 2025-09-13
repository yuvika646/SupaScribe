import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const userRole = request.headers.get('x-user-role')
    const tenantId = request.headers.get('x-tenant-id')
    const tenantSlug = params.slug

    // Check if user has ADMIN role
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin role required.' },
        { status: 403 }
      )
    }

    if (!tenantSlug) {
      return NextResponse.json(
        { error: 'Tenant slug is required' },
        { status: 400 }
      )
    }

    // Verify the tenant exists and user belongs to it
    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from('tenants')
      .select('id, subscription')
      .eq('slug', tenantSlug)
      .single()

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    // Verify user belongs to this tenant
    if (tenant.id !== tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized. You can only upgrade your own tenant.' },
        { status: 403 }
      )
    }

    // Check if already PRO
    if (tenant.subscription === 'PRO') {
      return NextResponse.json(
        { error: 'Tenant is already upgraded to PRO' },
        { status: 400 }
      )
    }

    // Update tenant subscription to PRO
    const { error: updateError } = await supabaseAdmin
      .from('tenants')
      .update({ subscription: 'PRO' })
      .eq('id', tenant.id)

    if (updateError) {
      console.error('Error upgrading tenant:', updateError)
      return NextResponse.json(
        { error: 'Failed to upgrade tenant' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Tenant successfully upgraded to PRO',
      subscription: 'PRO'
    })
  } catch (error) {
    console.error('Tenant upgrade error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
