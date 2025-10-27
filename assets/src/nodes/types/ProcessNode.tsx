import { Editor, T, TLUiIconJsx } from "tldraw";
import {
  NODE_HEADER_HEIGHT_PX,
  NODE_ROW_BOTTOM_PADDING_PX,
  NODE_ROW_HEADER_GAP_PX,
  NODE_ROW_HEIGHT_PX,
  NODE_WIDTH_PX,
} from "../../constants";
import { Port, PortId, ShapePort } from "../../ports/Port";
import { NodeShape } from "../NodeShapeUtil";
import { NodeType } from "../nodeTypes";

export interface NodeComponentProps<Node extends { type: string }> {
  shape: NodeShape;
  node: Node;
}

export abstract class NodeDefinition<Node extends { type: string }> {
  constructor(public readonly editor: Editor) {
    const ctor = this.constructor as NodeDefinitionConstructor<Node>;
    this.type = ctor.type;
    this.validator = ctor.validator;
  }

  readonly type: Node["type"];
  readonly validator: T.Validator<Node>;
  abstract readonly title: string;
  abstract readonly heading?: string;
  abstract readonly icon: TLUiIconJsx;

  abstract getDefault(): Node;
  abstract getBodyHeightPx(shape: NodeShape, node: Node): number;
  abstract getPorts(shape: NodeShape, node: Node): Record<string, ShapePort>;
  onPortConnect(_shape: NodeShape, _node: Node, _port: PortId): void {}
  onPortDisconnect(_shape: NodeShape, _node: Node, _port: PortId): void {}
  abstract Component: React.ComponentType<NodeComponentProps<Node>>;
}

export interface NodeDefinitionConstructor<Node extends { type: string }> {
  new (editor: Editor): NodeDefinition<Node>;
  readonly type: Node["type"];
  readonly validator: T.Validator<Node>;
}

/**
 * Update the `node` prop within a node shape.
 */
export function updateNode<T extends NodeType>(
  editor: Editor,
  shape: NodeShape,
  update: (node: T) => T,
) {
  editor.updateShape<NodeShape>({
    id: shape.id,
    type: shape.type,
    props: { node: update(shape.props.node as T) },
  });
}

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
        outputCount: 1,
      },
    };
  }

  // Minimal height - just enough for a compact node
  getBodyHeightPx(_shape: NodeShape, _node: ProcessNode) {
    return NODE_ROW_HEIGHT_PX;
  }

  getPorts(_shape: NodeShape, node: ProcessNode): Record<string, ShapePort> {
    // Calculate total node height for centering ports
    const totalHeight =
      NODE_HEADER_HEIGHT_PX +
      NODE_ROW_HEADER_GAP_PX +
      NODE_ROW_HEIGHT_PX +
      NODE_ROW_BOTTOM_PADDING_PX;
    const centerY = totalHeight / 2;

    const ports: Record<string, ShapePort> = {
      // Single input port on the left, centered vertically
      input: {
        id: "input",
        x: 0,
        y: centerY,
        terminal: "end",
      },
    };

    // Output ports on the right
    const outputCount = node.properties.outputCount;

    if (outputCount === 1) {
      // Single output aligned with input
      ports.output = {
        id: "output",
        x: NODE_WIDTH_PX,
        y: centerY,
        terminal: "start",
      };
    } else {
      // Multiple outputs distributed vertically
      const spacing = 20;
      const totalOutputsHeight = (outputCount - 1) * spacing;
      const startY = (totalHeight - totalOutputsHeight) / 2;

      for (let i = 0; i < outputCount; i++) {
        ports[`output_${i}`] = {
          id: `output_${i}`,
          x: NODE_WIDTH_PX,
          y: startY + i * spacing,
          terminal: "start",
        };
      }
    }

    return ports;
  }

  Component = ProcessNodeComponent;
}

export function ProcessNodeComponent({
  shape,
  node,
}: NodeComponentProps<ProcessNode>) {
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

  const outputCount = node.properties.outputCount;

  return (
    <>
      {/* Input port */}
      <Port shapeId={shape.id} portId="input" />

      {/* Node body with name */}
      <div
        onDoubleClick={handleDoubleClick}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: NODE_WIDTH_PX,
          height:
            NODE_HEADER_HEIGHT_PX +
            NODE_ROW_HEADER_GAP_PX +
            NODE_ROW_HEIGHT_PX +
            NODE_ROW_BOTTOM_PADDING_PX,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: 500,
          color: "#374151",
          backgroundColor: "white",
          border: "1px solid #d1d5db",
          borderRadius: "8px",
          userSelect: "none",
          boxSizing: "border-box",
        }}
      >
        {node.name}
      </div>

      {/* Output port(s) */}
      {outputCount === 1 ? (
        <Port shapeId={shape.id} portId="output" />
      ) : (
        Array.from({ length: outputCount }, (_, i) => (
          <Port key={`output_${i}`} shapeId={shape.id} portId={`output_${i}`} />
        ))
      )}
    </>
  );
}
