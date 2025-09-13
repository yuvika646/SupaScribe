import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    const noteId = params.id

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Missing tenant context' },
        { status: 400 }
      )
    }

    if (!noteId) {
      return NextResponse.json(
        { error: 'Note ID is required' },
        { status: 400 }
      )
    }

    // Delete note with tenant isolation
    const { error } = await supabaseAdmin
      .from('notes')
      .delete()
      .eq('id', noteId)
      .eq('tenant_id', tenantId) // Ensure tenant isolation

    if (error) {
      console.error('Error deleting note:', error)
      return NextResponse.json(
        { error: 'Failed to delete note' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Note deleted successfully' })
  } catch (error) {
    console.error('Note deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
