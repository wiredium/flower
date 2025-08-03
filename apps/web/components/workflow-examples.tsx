'use client'

import { useState, useEffect } from 'react'
import ReactFlow, {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Background,
  BackgroundVariant,
  MarkerType,
  Position,
  Handle,
  NodeTypes,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { 
  Database, 
  Mail, 
  FileText, 
  Image, 
  Bot, 
  Cloud,
  Send,
  Filter,
  Download,
  Upload,
  Eye,
  Settings,
  ChevronLeft,
  ChevronRight,
  Brain,
  ListChecks,
  GitBranch,
  Terminal,
  Code,
  Target,
  Lightbulb
} from 'lucide-react'

// Custom Node Component
const WorkflowNode = ({ data }: { data: any }) => {
  const Icon = data.icon
  return (
    <div className={`px-3 py-2 rounded-lg border ${data.color} bg-white dark:bg-gray-900 shadow-md min-w-[120px]`}>
      <Handle type="target" position={Position.Top} className="!bg-purple-500 !w-2 !h-2" />
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded ${data.iconBg} flex items-center justify-center`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="text-xs font-medium text-gray-900 dark:text-white">{data.label}</div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-purple-500 !w-2 !h-2" />
    </div>
  )
}

const nodeTypes: NodeTypes = {
  workflow: WorkflowNode,
}

// Different workflow examples
const workflowExamples = {
  ideaProcessing: {
    title: 'Idea to BRD Pipeline',
    description: 'Transform your project idea into actionable BRD',
    nodes: [
      {
        id: '1',
        type: 'workflow',
        position: { x: 50, y: 50 },
        data: { 
          label: 'Input Idea',
          icon: Lightbulb,
          color: 'border-blue-300 dark:border-blue-700',
          iconBg: 'bg-blue-500'
        },
      },
      {
        id: '2',
        type: 'workflow',
        position: { x: 200, y: 50 },
        data: { 
          label: 'AI Analysis',
          icon: Brain,
          color: 'border-purple-300 dark:border-purple-700',
          iconBg: 'bg-purple-500'
        },
      },
      {
        id: '3',
        type: 'workflow',
        position: { x: 350, y: 50 },
        data: { 
          label: 'Todo List',
          icon: ListChecks,
          color: 'border-yellow-300 dark:border-yellow-700',
          iconBg: 'bg-yellow-500'
        },
      },
      {
        id: '4',
        type: 'workflow',
        position: { x: 200, y: 150 },
        data: { 
          label: 'BRD Export',
          icon: FileText,
          color: 'border-green-300 dark:border-green-700',
          iconBg: 'bg-green-500'
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
      { id: 'e3-4', source: '3', target: '4', animated: true },
    ],
  },
  planningFlow: {
    title: 'Planning & Architecture',
    description: 'Generate comprehensive project plans and architecture',
    nodes: [
      {
        id: '1',
        type: 'workflow',
        position: { x: 50, y: 50 },
        data: { 
          label: 'Requirements',
          icon: Target,
          color: 'border-indigo-300 dark:border-indigo-700',
          iconBg: 'bg-indigo-500'
        },
      },
      {
        id: '2',
        type: 'workflow',
        position: { x: 200, y: 50 },
        data: { 
          label: 'Cerebras AI',
          icon: Bot,
          color: 'border-purple-300 dark:border-purple-700',
          iconBg: 'bg-purple-500'
        },
      },
      {
        id: '3',
        type: 'workflow',
        position: { x: 350, y: 50 },
        data: { 
          label: 'Architecture',
          icon: GitBranch,
          color: 'border-pink-300 dark:border-pink-700',
          iconBg: 'bg-pink-500'
        },
      },
      {
        id: '4',
        type: 'workflow',
        position: { x: 125, y: 150 },
        data: { 
          label: 'Review',
          icon: Eye,
          color: 'border-orange-300 dark:border-orange-700',
          iconBg: 'bg-orange-500'
        },
      },
      {
        id: '5',
        type: 'workflow',
        position: { x: 275, y: 150 },
        data: { 
          label: 'Document',
          icon: FileText,
          color: 'border-green-300 dark:border-green-700',
          iconBg: 'bg-green-500'
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
      { id: 'e2-4', source: '2', target: '4', animated: true },
      { id: 'e3-4', source: '3', target: '4', animated: true },
      { id: 'e4-5', source: '4', target: '5', animated: true },
    ],
  },
  codeExecution: {
    title: 'Code Execution Flow',
    description: 'Export BRD and execute with Cerebras x Cline',
    nodes: [
      {
        id: '1',
        type: 'workflow',
        position: { x: 50, y: 50 },
        data: { 
          label: 'BRD Doc',
          icon: FileText,
          color: 'border-blue-300 dark:border-blue-700',
          iconBg: 'bg-blue-500'
        },
      },
      {
        id: '2',
        type: 'workflow',
        position: { x: 200, y: 50 },
        data: { 
          label: 'Export',
          icon: Download,
          color: 'border-purple-300 dark:border-purple-700',
          iconBg: 'bg-purple-500'
        },
      },
      {
        id: '3',
        type: 'workflow',
        position: { x: 100, y: 150 },
        data: { 
          label: 'Local Editor',
          icon: Code,
          color: 'border-green-300 dark:border-green-700',
          iconBg: 'bg-green-500'
        },
      },
      {
        id: '4',
        type: 'workflow',
        position: { x: 250, y: 150 },
        data: { 
          label: 'Cline Execute',
          icon: Terminal,
          color: 'border-cyan-300 dark:border-cyan-700',
          iconBg: 'bg-cyan-500'
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
      { id: 'e2-4', source: '2', target: '4', animated: true },
    ],
  },
}

export default function WorkflowExamples() {
  const [currentExample, setCurrentExample] = useState<keyof typeof workflowExamples>('ideaProcessing')
  const [mounted, setMounted] = useState(false)
  const [autoRotate, setAutoRotate] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  const example = workflowExamples[currentExample]
  const [nodes, setNodes, onNodesChange] = useNodesState(example.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(example.edges)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Add transition animation
    setIsTransitioning(true)
    const timeout = setTimeout(() => {
      setNodes(example.nodes)
      setEdges(example.edges)
      setTimeout(() => setIsTransitioning(false), 50)
    }, 150)
    
    return () => clearTimeout(timeout)
  }, [currentExample, setNodes, setEdges, example.nodes, example.edges])

  // Auto-rotate examples
  useEffect(() => {
    if (!autoRotate) return
    
    const interval = setInterval(() => {
      setCurrentExample((prev) => {
        const keys = Object.keys(workflowExamples) as Array<keyof typeof workflowExamples>
        const currentIndex = keys.indexOf(prev)
        const nextIndex = (currentIndex + 1) % keys.length
        return keys[nextIndex] || prev
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [autoRotate])

  const handlePrevious = () => {
    setAutoRotate(false)
    const keys = Object.keys(workflowExamples) as Array<keyof typeof workflowExamples>
    const currentIndex = keys.indexOf(currentExample)
    const prevIndex = currentIndex === 0 ? keys.length - 1 : currentIndex - 1
    setCurrentExample(keys[prevIndex] || currentExample)
  }

  const handleNext = () => {
    setAutoRotate(false)
    const keys = Object.keys(workflowExamples) as Array<keyof typeof workflowExamples>
    const currentIndex = keys.indexOf(currentExample)
    const nextIndex = (currentIndex + 1) % keys.length
    setCurrentExample(keys[nextIndex] || currentExample)
  }

  if (!mounted) return null

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Transition overlay */}
      <div 
        className={`absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 dark:from-purple-600/10 dark:to-pink-600/10 z-20 pointer-events-none transition-opacity duration-300 ${
          isTransitioning ? 'opacity-100' : 'opacity-0'
        }`}
      />
      
      <div className={`w-full h-full transition-all duration-500 ${
        isTransitioning ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
      }`}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          minZoom={0.8}
          maxZoom={1.2}
          preventScrolling={false}
          zoomOnScroll={false}
          panOnScroll={false}
          panOnDrag={false}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
        >
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={15} 
            size={1}
            color="#e0e7ff15"
          />
        </ReactFlow>
      </div>
      
      {/* Example info with animation */}
      <div className={`absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg p-3 max-w-xs z-30 transition-all duration-500 ${
        isTransitioning ? 'translate-x-[-20px] opacity-0' : 'translate-x-0 opacity-100'
      }`}>
        <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
          {example.title}
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {example.description}
        </p>
      </div>
      
      {/* Navigation arrows with animation */}
      <button
        onClick={handlePrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-gray-800 transition-all hover:scale-110 group z-30"
        aria-label="Previous workflow"
        disabled={isTransitioning}
      >
        <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
      </button>
      
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-gray-800 transition-all hover:scale-110 group z-30"
        aria-label="Next workflow"
        disabled={isTransitioning}
      >
        <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
      </button>
      
      {/* Example selector */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {Object.keys(workflowExamples).map((key) => (
          <button
            key={key}
            onClick={() => {
              setAutoRotate(false)
              setCurrentExample(key as keyof typeof workflowExamples)
            }}
            className={`w-2 h-2 rounded-full transition-all ${
              currentExample === key 
                ? 'bg-purple-600 w-8' 
                : 'bg-gray-400 hover:bg-gray-600'
            }`}
            aria-label={`Select ${key} example`}
          />
        ))}
      </div>
    </div>
  )
}