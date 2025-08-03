import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { Node, Edge, Connection, NodeChange, EdgeChange } from 'reactflow'
import type { Workflow, WorkflowNode, WorkflowEdge, WorkflowVariable, WorkflowExecution } from '@/types'

interface WorkflowState {
  workflow: Workflow | null
  nodes: Node[]
  edges: Edge[]
  variables: WorkflowVariable[]
  selectedNode: Node | null
  selectedEdge: Edge | null
  isExecuting: boolean
  currentExecution: WorkflowExecution | null
  executionHistory: WorkflowExecution[]
  isDirty: boolean
  canUndo: boolean
  canRedo: boolean
  history: {
    past: { nodes: Node[]; edges: Edge[] }[]
    future: { nodes: Node[]; edges: Edge[] }[]
  }
  
  // Actions
  setWorkflow: (workflow: Workflow) => void
  setNodes: (nodes: Node[]) => void
  setEdges: (edges: Edge[]) => void
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void
  addNode: (node: Node) => void
  updateNode: (id: string, data: Partial<Node>) => void
  deleteNode: (id: string) => void
  addEdge: (edge: Edge) => void
  updateEdge: (id: string, data: Partial<Edge>) => void
  deleteEdge: (id: string) => void
  selectNode: (node: Node | null) => void
  selectEdge: (edge: Edge | null) => void
  addVariable: (variable: WorkflowVariable) => void
  updateVariable: (name: string, updates: Partial<WorkflowVariable>) => void
  deleteVariable: (name: string) => void
  setExecuting: (executing: boolean) => void
  setCurrentExecution: (execution: WorkflowExecution | null) => void
  addExecutionToHistory: (execution: WorkflowExecution) => void
  saveSnapshot: () => void
  undo: () => void
  redo: () => void
  clearHistory: () => void
  setDirty: (dirty: boolean) => void
}

export const useWorkflowStore = create<WorkflowState>()(
  immer((set, get) => ({
    workflow: null,
    nodes: [],
    edges: [],
    variables: [],
    selectedNode: null,
    selectedEdge: null,
    isExecuting: false,
    currentExecution: null,
    executionHistory: [],
    isDirty: false,
    canUndo: false,
    canRedo: false,
    history: {
      past: [],
      future: []
    },
    
    setWorkflow: (workflow) =>
      set((state) => {
        state.workflow = workflow
        state.nodes = workflow.nodes.map((node) => ({
          id: node.id,
          type: node.type,
          position: node.position,
          data: node.data
        })) as Node[]
        state.edges = workflow.edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
          label: edge.label,
          type: edge.type,
          animated: edge.animated
        })) as Edge[]
        state.variables = workflow.variables
        state.isDirty = false
      }),
    
    setNodes: (nodes) =>
      set((state) => {
        state.nodes = nodes
        state.isDirty = true
      }),
    
    setEdges: (edges) =>
      set((state) => {
        state.edges = edges
        state.isDirty = true
      }),
    
    onNodesChange: (changes) =>
      set((state) => {
        // Apply changes to nodes
        changes.forEach((change) => {
          if (change.type === 'position' && change.position) {
            const node = state.nodes.find((n) => n.id === change.id)
            if (node) {
              node.position = change.position
            }
          } else if (change.type === 'remove') {
            state.nodes = state.nodes.filter((n) => n.id !== change.id)
          } else if (change.type === 'select') {
            const node = state.nodes.find((n) => n.id === change.id)
            if (node) {
              node.selected = change.selected
            }
          }
        })
        state.isDirty = true
      }),
    
    onEdgesChange: (changes) =>
      set((state) => {
        changes.forEach((change) => {
          if (change.type === 'remove') {
            state.edges = state.edges.filter((e) => e.id !== change.id)
          } else if (change.type === 'select') {
            const edge = state.edges.find((e) => e.id === change.id)
            if (edge) {
              edge.selected = change.selected
            }
          }
        })
        state.isDirty = true
      }),
    
    onConnect: (connection) =>
      set((state) => {
        const id = `${connection.source}-${connection.target}`
        const newEdge: Edge = {
          id,
          source: connection.source!,
          target: connection.target!,
          sourceHandle: connection.sourceHandle || undefined,
          targetHandle: connection.targetHandle || undefined
        }
        state.edges.push(newEdge)
        state.isDirty = true
      }),
    
    addNode: (node) =>
      set((state) => {
        state.nodes.push(node)
        state.isDirty = true
      }),
    
    updateNode: (id, data) =>
      set((state) => {
        const index = state.nodes.findIndex((n) => n.id === id)
        if (index !== -1) {
          state.nodes[index] = { ...state.nodes[index], ...data }
          state.isDirty = true
        }
      }),
    
    deleteNode: (id) =>
      set((state) => {
        state.nodes = state.nodes.filter((n) => n.id !== id)
        state.edges = state.edges.filter((e) => e.source !== id && e.target !== id)
        state.isDirty = true
      }),
    
    addEdge: (edge) =>
      set((state) => {
        state.edges.push(edge)
        state.isDirty = true
      }),
    
    updateEdge: (id, data) =>
      set((state) => {
        const index = state.edges.findIndex((e) => e.id === id)
        if (index !== -1) {
          state.edges[index] = { ...state.edges[index], ...data }
          state.isDirty = true
        }
      }),
    
    deleteEdge: (id) =>
      set((state) => {
        state.edges = state.edges.filter((e) => e.id !== id)
        state.isDirty = true
      }),
    
    selectNode: (node) =>
      set((state) => {
        state.selectedNode = node
        state.selectedEdge = null
      }),
    
    selectEdge: (edge) =>
      set((state) => {
        state.selectedEdge = edge
        state.selectedNode = null
      }),
    
    addVariable: (variable) =>
      set((state) => {
        state.variables.push(variable)
        state.isDirty = true
      }),
    
    updateVariable: (name, updates) =>
      set((state) => {
        const index = state.variables.findIndex((v) => v.name === name)
        if (index !== -1) {
          state.variables[index] = { ...state.variables[index], ...updates }
          state.isDirty = true
        }
      }),
    
    deleteVariable: (name) =>
      set((state) => {
        state.variables = state.variables.filter((v) => v.name !== name)
        state.isDirty = true
      }),
    
    setExecuting: (executing) =>
      set((state) => {
        state.isExecuting = executing
      }),
    
    setCurrentExecution: (execution) =>
      set((state) => {
        state.currentExecution = execution
      }),
    
    addExecutionToHistory: (execution) =>
      set((state) => {
        state.executionHistory.unshift(execution)
        if (state.executionHistory.length > 50) {
          state.executionHistory.pop()
        }
      }),
    
    saveSnapshot: () => {
      const { nodes, edges } = get()
      set((state) => {
        state.history.past.push({ nodes: [...nodes], edges: [...edges] })
        state.history.future = []
        state.canUndo = true
        state.canRedo = false
        // Keep only last 50 snapshots
        if (state.history.past.length > 50) {
          state.history.past.shift()
        }
      })
    },
    
    undo: () => {
      const { history } = get()
      if (history.past.length > 0) {
        set((state) => {
          const current = { nodes: [...state.nodes], edges: [...state.edges] }
          const previous = state.history.past.pop()!
          state.history.future.push(current)
          state.nodes = previous.nodes
          state.edges = previous.edges
          state.canUndo = state.history.past.length > 0
          state.canRedo = true
        })
      }
    },
    
    redo: () => {
      const { history } = get()
      if (history.future.length > 0) {
        set((state) => {
          const current = { nodes: [...state.nodes], edges: [...state.edges] }
          const next = state.history.future.pop()!
          state.history.past.push(current)
          state.nodes = next.nodes
          state.edges = next.edges
          state.canUndo = true
          state.canRedo = state.history.future.length > 0
        })
      }
    },
    
    clearHistory: () =>
      set((state) => {
        state.history = { past: [], future: [] }
        state.canUndo = false
        state.canRedo = false
      }),
    
    setDirty: (dirty) =>
      set((state) => {
        state.isDirty = dirty
      })
  }))
)