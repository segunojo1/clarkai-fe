"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, File, ChevronDown, Globe, PlusIcon } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import workspaceServiceInstance from "@/services/workspace.service"

interface Workspace {
  enc_id: string
  name: string
  description?: string
  materials?: { id: string | number; name: string }[]
  quizzes?: { id: string | number; name: string }[]
  notes?: { id: string | number; name: string }[]
  sessions?: { id: string | number; name: string }[]
  canvas?: { id: string | number; name: string }[]
}

const WorkspaceItem = ({ workspace }: { workspace: Workspace }) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="space-y-2">
      <div
        onClick={() => setExpanded(!expanded)}
        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-[#262626] bg-[#262626] p-2 rounded-[5px]"
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Globe width={19} height={19} color="#9747FF" />
            {workspace.name}
          </div>
          <ChevronDown className="w-4 h-4 ml-2" />
        </div>
      </div>

      {expanded && (
        <div className="relative pl-6">
          <div className="absolute left-3 top-0 h-full w-px bg-gray-200 dark:bg-[#E5E5E5]" aria-hidden="true" />

          {/* Materials */}
          <div className="space-y-1 relative">
            <div className="pl-2 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Materials
            </div>
            {(workspace.materials || []).map((material) => (
              <div key={material.id} className="relative pl-6 flex items-center gap-2">
                <div className="absolute left-3 top-0 h-full w-px text-[13px] bg-gray-200 dark:bg-[#E5E5E5]" />
                <File color="#D4D4D4" fill="#D4D4D4" height={12} width={9.6} />
                <div>{material.name}</div>
              </div>
            ))}
          </div>

          {/* Quizzes */}
          <div className="space-y-1 relative mt-3">
            <div className="pl-2 flex items-center">
              <File className="w-4 h-4 mr-2" />
              Quizzes
            </div>
            {(workspace.quizzes || []).map((quiz) => (
              <div key={quiz.id} className="relative pl-6">
                <div className="absolute left-3 top-0 h-full w-px bg-gray-200 dark:bg-gray-700" />
                <div>{quiz.name}</div>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div className="space-y-1 relative mt-3">
            <div className="pl-2 flex items-center">
              <File className="w-4 h-4 mr-2" />
              Notes
            </div>
            {(workspace.notes || []).map((note) => (
              <div key={note.id} className="relative pl-6">
                <div className="absolute left-3 top-0 h-full w-px bg-gray-200 dark:bg-[#E5E5E5]" />
                <div>{note.name}</div>
              </div>
            ))}
          </div>

          {/* Sessions */}
          <div className="space-y-1 relative mt-3">
            <div className="pl-2 flex items-center">
              <File className="w-4 h-4 mr-2" />
              Sessions
            </div>
            {(workspace.sessions || []).map((session) => (
              <div key={session.id} className="relative pl-6">
                <div className="absolute left-3 top-0 h-full w-px bg-gray-200 dark:bg-[#E5E5E5]" />
                <div>{session.name}</div>
              </div>
            ))}
          </div>

          {/* Canvas */}
          <div className="space-y-1 relative mt-3">
            <div className="pl-2 flex items-center">
              <File className="w-4 h-4 mr-2" />
              Canvas
            </div>
            {(workspace.canvas || []).map((canvas) => (
              <div key={canvas.id} className="relative pl-6">
                <div className="absolute left-3 top-0 h-full w-px bg-gray-200 dark:bg-[#E5E5E5]" />
                <div>{canvas.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const Workspaces = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        setIsLoading(true)
        const data = await workspaceServiceInstance.getWorkspaces()
        setWorkspaces(data)
      } catch (err) {
        console.error(err)
        setError("Failed to load workspaces")
      } finally {
        setIsLoading(false)
      }
    }

    fetchWorkspaces()
  }, [])

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 dark:bg-[#2c2c2c] pt-16 p-4">
        <Tabs defaultValue="folders" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="folders">Folders</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center justify-between mt-5">
          <p className="font-medium">Workspaces</p>
          <PlusIcon width={12} height={12} />
        </div>

        <div className="mt-4 space-y-1">
          {isLoading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-red-500 text-sm">{error}</div>
          ) : (
            workspaces.map((workspace) => (
              <WorkspaceItem key={workspace.enc_id} workspace={workspace} />
            ))
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-4">
        <h1 className="text-[14px] font-bold mb-4">Workspaces</h1>

        <div className="flex items-center flex-wrap gap-4">
          {workspaces.map((workspace) => (
            <div
              key={workspace.enc_id}
              className="flex flex-col items-center p-6 gap-4 hover:bg-[#2C2C2C] rounded-[14px]"
            >
              <Image src="/assets/file.png" alt={workspace.name} width={172} height={138} />
              <div className="flex flex-col gap-1 text-center">
                <h2 className="text-[15px] font-bold">{workspace.name}</h2>
                <p>{workspace.materials?.length ?? 0} Materials</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Workspaces
