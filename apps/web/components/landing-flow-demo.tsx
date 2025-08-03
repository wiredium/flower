'use client'

import { useCallback, useEffect, useState, useMemo } from 'react'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  MarkerType,
  Position,
  Handle,
  NodeTypes,
  EdgeTypes,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Sparkles, Zap, Database, Cloud, GitBranch, Code, Bot, Layers, Brain, FileText, ListChecks, Terminal, Lightbulb, Target } from 'lucide-react'

// Custom Node Components
const CustomNode = ({ data }: { data: any }) => {
  const Icon = data.icon
  return (
    <div className={`px-4 py-3 rounded-xl border-2 ${data.color} bg-white dark:bg-gray-900 shadow-lg hover:shadow-xl transition-all duration-300 min-w-[150px]`}>
      <Handle type="target" position={Position.Top} className="!bg-purple-500" />
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${data.iconBg} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-semibold text-gray-900 dark:text-white text-sm">{data.label}</div>
          {data.description && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{data.description}</div>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-purple-500" />
    </div>
  )
}

const AINode = ({ data }: { data: any }) => {
  return (
    <div className="px-4 py-3 rounded-xl border-2 border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 shadow-lg hover:shadow-xl transition-all duration-300 min-w-[180px]">
      <Handle type="target" position={Position.Top} className="!bg-purple-500" />
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-semibold text-gray-900 dark:text-white text-sm">{data.label}</div>
          <div className="text-xs text-purple-600 dark:text-purple-400 mt-0.5">{data.description}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-purple-500" />
    </div>
  )
}

const nodeTypes: NodeTypes = {
  custom: CustomNode,
  ai: AINode,
}

// Custom Edge
const AnimatedEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: any) => {
  const edgePath = `M ${sourceX},${sourceY} C ${sourceX},${sourceY + 50} ${targetX},${targetY - 50} ${targetX},${targetY}`
  
  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path stroke-purple-300 dark:stroke-purple-600"
        d={edgePath}
        markerEnd={markerEnd}
        strokeWidth={2}
      />
      <circle className="fill-purple-500 animate-pulse">
        <animateMotion dur="2s" repeatCount="indefinite">
          <mpath href={`#${id}`} />
        </animateMotion>
        <animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite" />
      </circle>
    </>
  )
}

const edgeTypes: EdgeTypes = {
  animated: AnimatedEdge,
}

export default function LandingFlowDemo() {
  const [mounted, setMounted] = useState(false)
  
  const initialNodes: Node[] = useMemo(() => [
    {
      id: '1',
      type: 'custom',
      position: { x: 50, y: 50 },
      data: { 
        label: 'Project Idea',
        description: 'Your concept',
        icon: Lightbulb,
        color: 'border-blue-300 dark:border-blue-700',
        iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500'
      },
    },
    {
      id: '2',
      type: 'ai',
      position: { x: 250, y: 50 },
      data: { 
        label: 'Cerebras AI',
        description: 'Analyze & Plan',
        icon: Brain,
      },
    },
    {
      id: '3',
      type: 'custom',
      position: { x: 450, y: 50 },
      data: { 
        label: 'Todo Generation',
        description: 'Task breakdown',
        icon: ListChecks,
        color: 'border-yellow-300 dark:border-yellow-700',
        iconBg: 'bg-gradient-to-br from-yellow-500 to-orange-500'
      },
    },
    {
      id: '4',
      type: 'custom',
      position: { x: 150, y: 180 },
      data: { 
        label: 'BRD Document',
        description: 'Export docs',
        icon: FileText,
        color: 'border-green-300 dark:border-green-700',
        iconBg: 'bg-gradient-to-br from-green-500 to-emerald-500'
      },
    },
    {
      id: '5',
      type: 'custom',
      position: { x: 350, y: 180 },
      data: { 
        label: 'Local Editor',
        description: 'Your IDE',
        icon: Code,
        color: 'border-purple-300 dark:border-purple-700',
        iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500'
      },
    },
    {
      id: '6',
      type: 'custom',
      position: { x: 250, y: 280 },
      data: { 
        label: 'Cline Execute',
        description: 'Build & Deploy',
        icon: Terminal,
        color: 'border-indigo-300 dark:border-indigo-700',
        iconBg: 'bg-gradient-to-br from-indigo-500 to-purple-500'
      },
    },
  ], [])

  const initialEdges: Edge[] = useMemo(() => [
    {
      id: 'e1-2',
      source: '1',
      target: '2',
      type: 'animated',
      animated: true,
      style: { stroke: '#a855f7' },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#a855f7',
      },
    },
    {
      id: 'e2-3',
      source: '2',
      target: '3',
      type: 'animated',
      animated: true,
      style: { stroke: '#a855f7' },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#a855f7',
      },
    },
    {
      id: 'e2-4',
      source: '2',
      target: '4',
      type: 'animated',
      animated: true,
      style: { stroke: '#a855f7' },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#a855f7',
      },
    },
    {
      id: 'e3-5',
      source: '3',
      target: '5',
      type: 'animated',
      animated: true,
      style: { stroke: '#a855f7' },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#a855f7',
      },
    },
    {
      id: 'e4-6',
      source: '4',
      target: '6',
      type: 'animated',
      animated: true,
      style: { stroke: '#a855f7' },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#a855f7',
      },
    },
    {
      id: 'e5-6',
      source: '5',
      target: '6',
      type: 'animated',
      animated: true,
      style: { stroke: '#a855f7' },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#a855f7',
      },
    },
  ], [])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  useEffect(() => {
    setMounted(true)
    
    // Auto-animate nodes position slightly
    const interval = setInterval(() => {
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          position: {
            x: node.position.x + (Math.random() - 0.5) * 2,
            y: node.position.y + (Math.random() - 0.5) * 2,
          },
        }))
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [setNodes])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  if (!mounted) return null

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        defaultViewport={{ x: 0, y: 0, zoom: 0.9 }}
        minZoom={0.5}
        maxZoom={1.5}
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
          gap={20} 
          size={1}
          color="#e0e7ff20"
        />
      </ReactFlow>
      
      {/* Floating labels */}
      <div className="absolute top-4 left-4 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-xs font-medium animate-pulse">
        Idea to BRD Pipeline
      </div>
      
      <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
        <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        <span className="text-xs text-gray-600 dark:text-gray-400">Powered by Cerebras x Cline</span>
      </div>
    </div>
  )
}