'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

interface Note {
  id: string
  title: string
  content: string
  author_id: string
}

export default function DashboardPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [creating, setCreating] = useState(false)
  const { user, token, logout } = useAuth()
  const router = useRouter()

  // Redirect if not authenticated
  useEffect(() => {
    if (!user && !loading) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Fetch notes on component mount
  useEffect(() => {
    if (user && token) {
      fetchNotes()
    }
  }, [user, token])

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch notes')
      }

      const data = await response.json()
      setNotes(data.notes || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setCreating(true)
    setError('')

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, content })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create note')
      }

      // Clear form and refresh notes
      setTitle('')
      setContent('')
      await fetchNotes()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete note')
      }

      // Refresh notes
      await fetchNotes()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleUpgrade = async () => {
    if (!user?.tenant) return

    try {
      const response = await fetch(`/api/tenants/${user.tenant.slug}/upgrade`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upgrade')
      }

      // Refresh the page to update tenant info
      window.location.reload()
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  const isFreeTenant = user.tenant?.subscription === 'FREE'
  const noteCount = notes.length
  const isAtLimit = isFreeTenant && noteCount >= 3
  const shouldShowUpgrade = isFreeTenant && noteCount >= 3

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">SupaScribe</h1>
              <p className="text-sm text-gray-600">
                {user.tenant?.name} ({user.tenant?.subscription})
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user.email} ({user.role})
              </span>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Upgrade Banner */}
          {shouldShowUpgrade && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-yellow-700">
                    You've reached the note limit for FREE accounts (3 notes).
                    {user.role === 'ADMIN' && (
                      <button
                        onClick={handleUpgrade}
                        className="ml-2 font-medium underline hover:text-yellow-600"
                      >
                        Upgrade to Pro
                      </button>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* Create Note Form */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Note</h2>
            <form onSubmit={handleCreateNote}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isAtLimit}
                  placeholder={isAtLimit ? "Upgrade to Pro to create more notes" : "Enter note title"}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  id="content"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={isAtLimit}
                  placeholder={isAtLimit ? "Upgrade to Pro to create more notes" : "Enter note content"}
                />
              </div>
              <button
                type="submit"
                disabled={creating || isAtLimit || !title.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Creating...' : 'Create Note'}
              </button>
            </form>
          </div>

          {/* Notes List */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Your Notes ({noteCount})
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {notes.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  No notes yet. Create your first note above!
                </div>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="px-6 py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {note.title}
                        </h3>
                        {note.content && (
                          <p className="mt-2 text-gray-600">{note.content}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="ml-4 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
