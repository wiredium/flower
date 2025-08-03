import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Project, ProjectStats } from '@/types'

interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  isLoading: boolean
  error: string | null
  filters: {
    visibility?: 'public' | 'private' | 'all'
    status?: 'draft' | 'active' | 'archived' | 'all'
    tags?: string[]
    search?: string
  }
  
  // Actions
  setProjects: (projects: Project[]) => void
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  setCurrentProject: (project: Project | null) => void
  updateProjectStats: (id: string, stats: Partial<ProjectStats>) => void
  setFilters: (filters: ProjectState['filters']) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useProjectStore = create<ProjectState>()(
  immer((set) => ({
    projects: [],
    currentProject: null,
    isLoading: false,
    error: null,
    filters: {},
    
    setProjects: (projects) =>
      set((state) => {
        state.projects = projects
      }),
    
    addProject: (project) =>
      set((state) => {
        state.projects.push(project)
      }),
    
    updateProject: (id, updates) =>
      set((state) => {
        const index = state.projects.findIndex((p) => p.id === id)
        if (index !== -1) {
          state.projects[index] = { ...state.projects[index], ...updates }
        }
        if (state.currentProject?.id === id) {
          state.currentProject = { ...state.currentProject, ...updates }
        }
      }),
    
    deleteProject: (id) =>
      set((state) => {
        state.projects = state.projects.filter((p) => p.id !== id)
        if (state.currentProject?.id === id) {
          state.currentProject = null
        }
      }),
    
    setCurrentProject: (project) =>
      set((state) => {
        state.currentProject = project
      }),
    
    updateProjectStats: (id, stats) =>
      set((state) => {
        const project = state.projects.find((p) => p.id === id)
        if (project && project.stats) {
          project.stats = { ...project.stats, ...stats }
        }
        if (state.currentProject?.id === id && state.currentProject.stats) {
          state.currentProject.stats = { ...state.currentProject.stats, ...stats }
        }
      }),
    
    setFilters: (filters) =>
      set((state) => {
        state.filters = filters
      }),
    
    setLoading: (loading) =>
      set((state) => {
        state.isLoading = loading
      }),
    
    setError: (error) =>
      set((state) => {
        state.error = error
      })
  }))
)

// Selector for filtered projects
export const selectFilteredProjects = (state: ProjectState) => {
  let filtered = [...state.projects]
  
  if (state.filters.visibility && state.filters.visibility !== 'all') {
    filtered = filtered.filter((p) => p.visibility === state.filters.visibility)
  }
  
  if (state.filters.status && state.filters.status !== 'all') {
    filtered = filtered.filter((p) => p.status === state.filters.status)
  }
  
  if (state.filters.tags && state.filters.tags.length > 0) {
    filtered = filtered.filter((p) =>
      state.filters.tags!.some((tag) => p.tags.includes(tag))
    )
  }
  
  if (state.filters.search) {
    const search = state.filters.search.toLowerCase()
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search)
    )
  }
  
  return filtered
}