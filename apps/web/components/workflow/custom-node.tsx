import { memo } from "react"
import { Handle, Position, NodeProps } from "reactflow"
import { Card } from "@packages/ui/src/card"
import {
  Brain,
  Bot,
  FileInput,
  FileOutput,
  GitBranch,
  Repeat,
  Shuffle,
  Sparkles
} from "lucide-react"

const nodeIcons: Record<string, any> = {
  input: FileInput,
  output: FileOutput,
  cerebras: Brain,
  openai: Sparkles,
  anthropic: Bot,
  transform: Shuffle,
  condition: GitBranch,
  loop: Repeat,
}

function CustomNode({ data, selected }: NodeProps) {
  const Icon = nodeIcons[data.type] || Brain
  
  return (
    <Card
      className={`min-w-[200px] ${
        selected ? "ring-2 ring-primary ring-offset-2" : ""
      } ${
        data.type === "input"
          ? "border-green-500"
          : data.type === "output"
          ? "border-red-500"
          : "border-purple-500"
      }`}
    >
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-2">
          <div
            className={`p-2 rounded-lg ${
              data.type === "input"
                ? "bg-green-100 text-green-700"
                : data.type === "output"
                ? "bg-red-100 text-red-700"
                : "bg-purple-100 text-purple-700"
            }`}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">{data.label}</h3>
            {data.model && (
              <p className="text-xs text-muted-foreground">{data.model}</p>
            )}
          </div>
        </div>
        
        {data.prompt && (
          <div className="mt-2 p-2 bg-muted rounded text-xs line-clamp-2">
            {data.prompt}
          </div>
        )}
        
        {data.condition && (
          <div className="mt-2 p-2 bg-muted rounded text-xs">
            <code>{data.condition}</code>
          </div>
        )}
      </div>
      
      {data.type !== "input" && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 bg-purple-500 border-2 border-white"
        />
      )}
      
      {data.type !== "output" && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 bg-purple-500 border-2 border-white"
        />
      )}
    </Card>
  )
}

export default memo(CustomNode)