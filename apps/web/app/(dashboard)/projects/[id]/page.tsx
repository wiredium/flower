"use client";

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Button } from "@packages/ui/src/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@packages/ui/src/tabs"
import { useWorkflowStore } from "@/stores/workflow.store"
import { useProjectStore } from "@/stores/project.store"
import { trpc } from "@/lib/trpc"
import { useToast } from "@/hooks/use-toast"
import {
  Save,
  Play,
  Undo,
  Redo,
  Settings,
  Share,
  Download,
  ChevronLeft
} from "lucide-react"

// Dynamically import React Flow to avoid SSR issues
const WorkflowEditor = dynamic(
  () => import("@/components/workflow/workflow-editor"),
  { ssr: false }
)

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const { toast } = useToast()
  
  const { currentProject, setCurrentProject } = useProjectStore()
  const {
    workflow,
    setWorkflow,
    isDirty,
    isExecuting,
    canUndo,
    canRedo,
    undo,
    redo,
    setDirty
  } = useWorkflowStore()
  
  const { data: project, isPending: isLoading } = trpc.project.get.useQuery(
    { id: projectId }
  )
  
  useEffect(() => {
    if (project) {
      const projectData = {
        ...project,
        workflow: project.workflowData || { nodes: [], edges: [], variables: [] }
      } as any
      setCurrentProject(projectData)
      setWorkflow(projectData.workflow)
    }
  }, [project])
  
  const updateMutation = trpc.project.update.useMutation()
  
  useEffect(() => {
    if (updateMutation.isSuccess) {
      toast({
        title: "Workflow saved",
        description: "Your changes have been saved successfully",
        variant: "success"
      })
      setDirty(false)
    }
  }, [updateMutation.isSuccess])
  
  useEffect(() => {
    if (updateMutation.isError) {
      toast({
        title: "Save failed",
        description: updateMutation.error.message,
        variant: "destructive"
      })
    }
  }, [updateMutation.isError])
  
  const executeMutation = trpc.workflow.execute.useMutation()
  
  useEffect(() => {
    if (executeMutation.isSuccess) {
      toast({
        title: "Workflow executed",
        description: "Check the execution tab for results",
        variant: "success"
      })
    }
  }, [executeMutation.isSuccess])
  
  useEffect(() => {
    if (executeMutation.isError) {
      toast({
        title: "Execution failed",
        description: executeMutation.error.message,
        variant: "destructive"
      })
    }
  }, [executeMutation.isError])
  
  const handleSave = async () => {
    if (!workflow || !projectId) return
    
    await updateMutation.mutateAsync({
      id: projectId,
      workflowData: {
        nodes: workflow.nodes,
        edges: workflow.edges,
        variables: workflow.variables
      }
    })
  }
  
  const handleExecute = async () => {
    if (!workflow) return
    
    await executeMutation.mutateAsync({
      projectId: projectId,
      variables: {}
    })
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    )
  }
  
  if (!project) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Project not found</h2>
          <p className="text-muted-foreground">The project you're looking for doesn't exist</p>
          <Button onClick={() => router.push("/projects")}>
            Back to Projects
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/projects")}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-bold">{project.name}</h1>
            <p className="text-sm text-muted-foreground">{project.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            disabled={!canUndo}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={redo}
            disabled={!canRedo}
          >
            <Redo className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={!isDirty || updateMutation.isPending}
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleExecute}
            disabled={isExecuting || executeMutation.isPending}
          >
            <Play className="h-4 w-4 mr-1" />
            Run
          </Button>
          <Button variant="ghost" size="sm">
            <Share className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="editor" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="executions">Executions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="collaborators">Collaborators</TabsTrigger>
        </TabsList>
        
        <TabsContent value="editor" className="flex-1 m-0">
          <WorkflowEditor />
        </TabsContent>
        
        <TabsContent value="executions" className="flex-1 p-4">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Execution History</h2>
            <p className="text-muted-foreground">View past workflow executions</p>
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="flex-1 p-4">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Project Settings</h2>
            <p className="text-muted-foreground">Configure project settings and permissions</p>
          </div>
        </TabsContent>
        
        <TabsContent value="collaborators" className="flex-1 p-4">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Collaborators</h2>
            <p className="text-muted-foreground">Manage team members and permissions</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}