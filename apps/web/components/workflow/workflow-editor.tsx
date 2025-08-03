"use client";

import { useCallback, useEffect } from "react"
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  Connection,
  ConnectionMode,
  Panel
} from "reactflow"
import "reactflow/dist/style.css"

import { useWorkflowStore } from "@/stores/workflow.store"
import NodePanel from "./node-panel"
import CustomNode from "./custom-node"
import { Button } from "@packages/ui/src/button"
import { Plus } from "lucide-react"

const nodeTypes = {
  custom: CustomNode,
}

function WorkflowEditorInner() {
  const { project } = useReactFlow()
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectNode,
    saveSnapshot
  } = useWorkflowStore()
  
  const [reactFlowNodes, setReactFlowNodes, onReactFlowNodesChange] = useNodesState(nodes)
  const [reactFlowEdges, setReactFlowEdges, onReactFlowEdgesChange] = useEdgesState(edges)
  
  // Sync React Flow state with Zustand store
  useEffect(() => {
    setReactFlowNodes(nodes)
  }, [nodes, setReactFlowNodes])
  
  useEffect(() => {
    setReactFlowEdges(edges)
  }, [edges, setReactFlowEdges])
  
  const handleNodesChange = useCallback((changes: any) => {
    onReactFlowNodesChange(changes)
    onNodesChange(changes)
  }, [onReactFlowNodesChange, onNodesChange])
  
  const handleEdgesChange = useCallback((changes: any) => {
    onReactFlowEdgesChange(changes)
    onEdgesChange(changes)
  }, [onReactFlowEdgesChange, onEdgesChange])
  
  const handleConnect = useCallback((params: Connection) => {
    saveSnapshot()
    onConnect(params)
  }, [onConnect, saveSnapshot])
  
  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    selectNode(node)
  }, [selectNode])
  
  const handlePaneClick = useCallback(() => {
    selectNode(null)
  }, [selectNode])
  
  const handleNodeDragStop = useCallback(() => {
    saveSnapshot()
  }, [saveSnapshot])
  
  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={reactFlowNodes}
        edges={reactFlowEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        onNodeDragStop={handleNodeDragStop}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: "#a78bfa", strokeWidth: 2 }
        }}
        fitView
      >
        <Background color="#aaa" gap={16} />
        <Controls />
        <MiniMap
          nodeStrokeColor={(n) => {
            if (n.type === "input") return "#10b981"
            if (n.type === "output") return "#ef4444"
            return "#8b5cf6"
          }}
          nodeColor={(n) => {
            if (n.type === "input") return "#10b98120"
            if (n.type === "output") return "#ef444420"
            return "#8b5cf620"
          }}
          nodeBorderRadius={8}
        />
        <Panel position="top-left">
          <NodePanel />
        </Panel>
      </ReactFlow>
    </div>
  )
}

export default function WorkflowEditor() {
  return (
    <ReactFlowProvider>
      <WorkflowEditorInner />
    </ReactFlowProvider>
  )
}