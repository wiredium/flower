import { useCallback } from "react"
import { useReactFlow } from "reactflow"
import { Card } from "@packages/ui/src/card"
import { Button } from "@packages/ui/src/button"
import { useWorkflowStore } from "@/stores/workflow.store"
import { generateId } from "@/lib/utils"
import {
  Brain,
  Bot,
  FileInput,
  FileOutput,
  GitBranch,
  Repeat,
  Shuffle,
  Sparkles,
  Plus
} from "lucide-react"

const nodeTemplates = [
  {
    type: "input",
    label: "Input",
    icon: FileInput,
    color: "text-green-600",
    bgColor: "bg-green-100",
    data: { label: "Input Node", type: "input" }
  },
  {
    type: "output",
    label: "Output",
    icon: FileOutput,
    color: "text-red-600",
    bgColor: "bg-red-100",
    data: { label: "Output Node", type: "output" }
  },
  {
    type: "cerebras",
    label: "Cerebras",
    icon: Brain,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    data: {
      label: "Cerebras AI",
      type: "cerebras",
      model: "llama3.1-70b",
      temperature: 0.7,
      maxTokens: 1000
    }
  },
  {
    type: "openai",
    label: "OpenAI",
    icon: Sparkles,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    data: {
      label: "OpenAI GPT",
      type: "openai",
      model: "gpt-4",
      temperature: 0.7,
      maxTokens: 1000
    }
  },
  {
    type: "anthropic",
    label: "Anthropic",
    icon: Bot,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    data: {
      label: "Claude",
      type: "anthropic",
      model: "claude-3-opus",
      temperature: 0.7,
      maxTokens: 1000
    }
  },
  {
    type: "transform",
    label: "Transform",
    icon: Shuffle,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
    data: {
      label: "Transform",
      type: "transform",
      transform: "// Transform data\nreturn input"
    }
  },
  {
    type: "condition",
    label: "Condition",
    icon: GitBranch,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    data: {
      label: "Condition",
      type: "condition",
      condition: "input.value > 0"
    }
  },
  {
    type: "loop",
    label: "Loop",
    icon: Repeat,
    color: "text-teal-600",
    bgColor: "bg-teal-100",
    data: {
      label: "Loop",
      type: "loop",
      iterations: 3
    }
  }
]

export default function NodePanel() {
  const { project } = useReactFlow()
  const { addNode, saveSnapshot } = useWorkflowStore()
  
  const handleAddNode = useCallback((template: typeof nodeTemplates[0]) => {
    saveSnapshot()
    
    const id = generateId()
    const newNode = {
      id,
      type: "custom",
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 400 + 100
      },
      data: { ...template.data }
    }
    
    addNode(newNode)
  }, [addNode, saveSnapshot])
  
  return (
    <Card className="p-4 w-64 max-h-[600px] overflow-y-auto">
      <h3 className="font-semibold mb-3 flex items-center">
        <Plus className="h-4 w-4 mr-2" />
        Add Node
      </h3>
      <div className="space-y-2">
        {nodeTemplates.map((template) => {
          const Icon = template.icon
          return (
            <Button
              key={template.type}
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleAddNode(template)}
            >
              <div className={`p-1.5 rounded ${template.bgColor} mr-2`}>
                <Icon className={`h-4 w-4 ${template.color}`} />
              </div>
              {template.label}
            </Button>
          )
        })}
      </div>
    </Card>
  )
}