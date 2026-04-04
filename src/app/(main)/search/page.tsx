"use client"

import React, { useState } from "react"
import workspaceService from "@/services/workspace.service"
import Link from "next/link"

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<any | null>(null)

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!query.trim()) return
    setError(null)
    setLoading(true)
    try {
      const resp = await workspaceService.search({ s: query })
      setResults(resp)
    } catch (err) {
      console.error(err)
      setError("Search failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Search</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search workspaces, files, chats..."
          className="flex-1 px-3 py-2 rounded border bg-white dark:bg-[#1f1f1f] border-gray-300 dark:border-gray-700"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-[#FF3D00] text-white rounded"
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {!results && (
        <div className="text-sm text-gray-500">Enter a query to search.</div>
      )}

      {results && (
        <div className="space-y-6">
          {/* Workspace results */}
          {Array.isArray(results.WorkspaceResult) && (
            <div>
              <h2 className="text-lg font-medium mb-2">Workspaces</h2>
              <ul className="space-y-2">
                {results.WorkspaceResult.map((w: any) => (
                  <li key={w.enc_id} className="p-3 border rounded">
                    <Link href={`/workspaces/${w.enc_id}`} className="text-blue-600">
                      {w.name}
                    </Link>
                    {w.description && <div className="text-sm text-gray-600">{w.description}</div>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Chats */}
          {Array.isArray(results.chatResult) && (
            <div>
              <h2 className="text-lg font-medium mb-2">Chats</h2>
              <ul className="space-y-2">
                {results.chatResult.map((c: any) => (
                  <li key={c.id} className="p-3 border rounded">
                    <Link href={`/chat/${c.id}`} className="text-blue-600">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* PDF results */}
          {Array.isArray(results.pdfResult) && results.pdfResult.length > 0 && (
            <div>
              <h2 className="text-lg font-medium mb-2">PDFs</h2>
              <ul className="space-y-2">
                {results.pdfResult.map((p: any, i: number) => (
                  <li key={i} className="p-3 border rounded">
                    <div className="text-sm">{p.fileName || p.name || 'PDF'}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Image results */}
          {Array.isArray(results.imageFilesResult) && results.imageFilesResult.length > 0 && (
            <div>
              <h2 className="text-lg font-medium mb-2">Images</h2>
              <ul className="space-y-2">
                {results.imageFilesResult.map((img: any, i: number) => (
                  <li key={i} className="p-3 border rounded">
                    <div className="text-sm">{img.fileName || img.name || 'Image'}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
