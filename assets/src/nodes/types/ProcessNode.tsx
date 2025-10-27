import { T, useEditor } from "tldraw";
import {
  NODE_HEADER_HEIGHT_PX,
  NODE_ROW_HEADER_GAP_PX,
  NODE_ROW_HEIGHT_PX,
  NODE_WIDTH_PX,
} from "../../constants";
import { Port, ShapePort } from "../../ports/Port";
import { NodeShape } from "../NodeShapeUtil";
import {
  ExecutionResult,
  InfoValues,
  InputValues,
  NodeComponentProps,
  NodeDefinition,
  NodeRow,
  updateNode,
  areAnyInputsOutOfDate,
} from "./shared";

/**
 * A simple Process node with one input and multiple outputs.
 * Similar to Node-RED nodes - can be configured via double-click.
 */
export type ProcessNode = T.TypeOf<typeof ProcessNode>;
export const ProcessNode = T.object({
  type: T.literal("process"),
  name: T.string,
  // Custom properties that can be configured
  properties: T.object({
    outputCount: T.number,
  }),
  lastResult: T.number.nullable(),
});

export class ProcessNodeDefinition extends NodeDefinition<ProcessNode> {
  static type = "process";
  static validator = ProcessNode;
  title = "Process";
  heading = "Process";
  icon = "⚙️";

  getDefault(): ProcessNode {
    return {
      type: "process",
      name: "Process",
      properties: {
        outputCount: 2,
      },
      lastResult: null,
    };
  }

  // Fixed height - just shows the node name and status
  getBodyHeightPx(_shape: NodeShape, _node: ProcessNode) {
    return NODE_ROW_HEIGHT_PX;
  }

  getPorts(_shape: NodeShape, node: ProcessNode): Record<string, ShapePort> {
    const ports: Record<string, ShapePort> = {
      // Single input port on the left, positioned at the center of the header
      input: {
        id: "input",
        x: 0,
        y: NODE_HEADER_HEIGHT_PX / 2,
        terminal: "end",
      },
    };

    // Multiple output ports on the right
    const outputCount = node.properties.outputCount;
    
    // Calculate the starting Y position for output ports
    // They should start after the header and account for the node row content
    const startY = NODE_HEADER_HEIGHT_PX / 2;
    
    for (let i = 0; i < outputCount; i++) {
      ports[`output_${i}`] = {
        id: `output_${i}`,
        x: NODE_WIDTH_PX,
        // Position outputs starting from the same Y as input, distributed vertically
        y: startY + (i * 16), // Reduced spacing to 16px for better alignment
        terminal: "start",
      };
    }

    return ports;
  }

  // Simple passthrough for now - just outputs the input value
  async execute(
    shape: NodeShape,
    node: ProcessNode,
    inputs: InputValues,
  ): Promise<ExecutionResult> {
    const inputValue = inputs["input"] ?? 0;

    updateNode<ProcessNode>(this.editor, shape, (node) => ({
      ...node,
      lastResult: inputValue,
    }));

    // Send same value to all outputs
    const result: ExecutionResult = {};
    for (let i = 0; i < node.properties.outputCount; i++) {
      result[`output_${i}`] = inputValue;
    }

    return result;
  }

  getOutputInfo(
    shape: NodeShape,
    node: ProcessNode,
    inputs: InfoValues,
  ): InfoValues {
    const result: InfoValues = {};
    const isOutOfDate =
      areAnyInputsOutOfDate(inputs) || shape.props.isOutOfDate;

    for (let i = 0; i < node.properties.outputCount; i++) {
      result[`output_${i}`] = {
        value: node.lastResult ?? 0,
        isOutOfDate,
      };
    }

    return result;
  }

  Component = ProcessNodeComponent;
}

export function ProcessNodeComponent({
  shape,
  node,
}: NodeComponentProps<ProcessNode>) {
  const editor = useEditor();

  // Handle double-click to open config panel
  const handleDoubleClick = () => {
    const event = new CustomEvent("nodeDoubleClick", {
      detail: {
        nodeId: shape.id,
        nodeType: node.type,
        nodeName: node.name,
        nodeProperties: node.properties,
      },
    });
    window.dispatchEvent(event);
  };

  return (
    <>
      {/* Input port */}
      <Port shapeId={shape.id} portId="input" />

      {/* Node body */}
      <NodeRow onDoubleClick={handleDoubleClick} style={{ cursor: "pointer" }}>
        <div style={{ padding: "8px", fontSize: "12px", color: "#666" }}>
          {node.name}
        </div>
      </NodeRow>

      {/* Output ports */}
      {Array.from({ length: node.properties.outputCount }, (_, i) => (
        <Port key={`output_${i}`} shapeId={shape.id} portId={`output_${i}`} />
      ))}
    </>
  );
}
