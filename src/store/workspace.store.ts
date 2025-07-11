import { create } from 'zustand'
import workspaceService from '@/services/workspace.service'

interface Workspace {
    name: string
    description?: string
    enc_id: string
}

interface WorkspaceStore {
    workspaces: Workspace[]
    selectedWorkspace: Workspace | null
    isLoading: boolean
    error: string | null
    getWorkspaces: () => Promise<void>
    createWorkspace: (name: string, description?: string) => Promise<void>
    selectWorkspace: (workspace: Workspace) => void
    clearError: () => void
    setError: (error: string) => void
}

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
    workspaces: [],
    selectedWorkspace: null,
    isLoading: false,
    error: null,
    
    setError: (error: string) => {
        set({ error })
    },

    clearError: () => {
        set({ error: null })
    },

    selectWorkspace: (workspace: Workspace) => {
        set({ selectedWorkspace: workspace })
    },

    getWorkspaces: async () => {
        set({ isLoading: true, error: null })
        try {
            const workspaces = await workspaceService.getWorkspaces()
            set({ workspaces })
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to fetch workspaces' })
        } finally {
            set({ isLoading: false })
        }
    },

    createWorkspace: async (name: string, description?: string) => {
        set({ isLoading: true, error: null })
        try {
            await workspaceService.createWorkspace(name, description)
            // Refresh workspaces after creation
            await get().getWorkspaces()
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to create workspace' })
        } finally {
            set({ isLoading: false })
        }
    }
}))