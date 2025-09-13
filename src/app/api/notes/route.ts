import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id')

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Missing tenant context' },
        { status: 400 }
      )
    }

    // Fetch notes for the tenant
    const { data: notes, error } = await supabaseAdmin
      .from('notes')
      .select('id, title, content, author_id')
      .eq('tenant_id', tenantId)
      .order('id', { ascending: false })

    if (error) {
      console.error('Error fetching notes:', error)
      return NextResponse.json(
        { error: 'Failed to fetch notes' },
        { status: 500 }
      )
    }

    return NextResponse.json({ notes })
  } catch (error) {
    console.error('Notes fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const tenantId = request.headers.get('x-tenant-id')

    if (!userId || !tenantId) {
      return NextResponse.json(
        { error: 'Missing user or tenant context' },
        { status: 400 }
      )
    }

    const { title, content } = await request.json()

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    // Check tenant subscription and note count
    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from('tenants')
      .select('subscription')
      .eq('id', tenantId)
      .single()

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    // If tenant has FREE subscription, check note limit
    if (tenant.subscription === 'FREE') {
      const { count, error: countError } = await supabaseAdmin
        .from('notes')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)

      if (countError) {
        console.error('Error counting notes:', countError)
        return NextResponse.json(
          { error: 'Failed to check note limit' },
          { status: 500 }
        )
      }

      if (count !== null && count >= 3) {
        return NextResponse.json(
          { error: 'Note limit reached. Upgrade to Pro to create more notes.' },
          { status: 403 }
        )
      }
    }

    // Create the note
    const { data: note, error: createError } = await supabaseAdmin
      .from('notes')
      .insert({
        title,
        content: content || '',
        author_id: userId,
        tenant_id: tenantId
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating note:', createError)
      return NextResponse.json(
        { error: 'Failed to create note' },
        { status: 500 }
      )
    }

    return NextResponse.json({ note }, { status: 201 })
  } catch (error) {
    console.error('Note creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
