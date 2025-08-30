"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Globe, X } from "lucide-react"
import workspaceServiceInstance from "@/services/workspace.service"
import { useRouter } from "next/navigation"
import { useWorkspaceStore } from '@/store/workspace.store';

const workspaceTags = [
  { color: "text-blue-500", id: "blue" },
  { color: "text-orange-500", id: "orange" },
  { color: "text-cyan-400", id: "cyan" },
  { color: "text-blue-600", id: "darkblue" },
  { color: "text-gray-300", id: "gray" },
  { color: "text-red-500", id: "red" },
  { color: "text-yellow-500", id: "yellow" },
  { color: "text-white", id: "white" },
  { color: "text-orange-600", id: "darkorange" },
]

interface WorkspaceCreationModalProps {
  children: React.ReactNode
}

export function WorkspaceCreationModal({ children }: WorkspaceCreationModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [workspaceName, setWorkspaceName] = useState("")
  const [selectedTag, setSelectedTag] = useState("")
  const [note, setNote] = useState("")

  const handleCreateWorkspace = async () => {
    if (!workspaceName) {
      alert("Please enter a workspace name");
      return;
    }

    try {
      const workspaceService = workspaceServiceInstance;
      await workspaceService.createWorkspace(workspaceName, selectedTag, note);
      
      // Close modal and reset form
      setOpen(false);
      setWorkspaceName("");
      setSelectedTag("");
      setNote("");
      
      // Refresh the workspaces list
      useWorkspaceStore.getState().getWorkspaces();
      
      // Navigate to workspaces page
      router.push('/workspaces')
    } catch (error) {
      console.error("Error creating workspace:", error);
      alert("Failed to create workspace. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent 
        className="dark:bg-[#2C2C2C] bg-[#F8F8F7] dark:border-[#525252] border-[#A3A3A3] text-white p-6 w-[400px] max-w-[90vw] rounded-lg transform -translate-x-20"
        showCloseButton={false}
      >
        {/* Custom Close Button */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-3 right-3 p-1 text-gray-400 hover:text-white transition-colors duration-200"
        >
          <X className="w-4 h-4" />
        </button>

        <DialogHeader className="text-center pt-1">
          <DialogTitle className="text-lg font-medium dark:text-white text-black">
            Create a New Workspace
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">

          {/* Workspace Name */}
          <div className="space-y-2">
            <label className="text-sm dark:text-gray-300 text-black">Workspace Name</label>
            <Input
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder="you@example.com"
              className="dark:bg-[#1a1a1a] dark:border-[#333] border-[#D4D4D4] dark:text-white text-black placeholder:text-gray-500 h-11 px-3 rounded-md focus:border-[#555] focus:ring-0"
            />
          </div>

          {/* Select Workspace Tag */}
          <div className="space-y-2">
            <label className="text-sm dark:text-gray-300 text-black">Select Workspace tag</label>
            <div className="flex gap-2 justify-start">
              {workspaceTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => setSelectedTag(tag.id)}
                  className={`p-1 transition-all duration-200 ${
                    selectedTag === tag.id 
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-[#2C2C2C] rounded-full' 
                      : 'hover:scale-105'
                  }`}
                >
                  <Globe className={`w-6 h-6 ${tag.color}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Add Note */}
          <div className="space-y-2 pb-4 border-b dark:border-[#444] border-[#D4D4D4]">
            <label className="text-sm dark:text-gray-300 text-black">Add a Note (optional)</label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What's this workspace for?"
              className="dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white text-black placeholder:text-gray-500 min-h-20 p-3 rounded-md resize-none focus:border-[#555] focus:ring-0"
            />
          </div>

          {/* Create Button */}
          <div className="pt-3">
            <Button
              onClick={handleCreateWorkspace}
              className="w-full bg-[#FF3D00] hover:bg-[#FF3D00]/90 text-white font-medium py-3 h-12 rounded-md transition-colors duration-200"
            >
              Create Workspace
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 