import { T } from "tldraw";
import {
  NODE_HEADER_HEIGHT_PX,
  NODE_ROW_BOTTOM_PADDING_PX,
  NODE_ROW_HEADER_GAP_PX,
  NODE_ROW_HEIGHT_PX,
  NODE_WIDTH_PX,
} from "../../constants";
import { Port, ShapePort } from "../../ports/Port";
import { NodeShape } from "../NodeShapeUtil";

/**
 * A simple Process node with one input and multiple outputs.
 * Similar to Node-RED nodes - can be configured via double-click.
 */
export type ProcessNode = T.TypeOf<typeof ProcessNode>;
export const ProcessNode = T.object({
  type: T.literal("process"),
  name: T.string,
  properties: T.object({
    outputCount: T.number,
  }),
});

export const processNodeDef = {
  type: "process" as const,
  validator: ProcessNode,
  title: "Process",
  icon: "⚙️",

  getDefault(): ProcessNode {
    return {
      type: "process",
      name: "Process",
      properties: {
        outputCount: 1,
      },
    };
  },

  getBodyHeightPx(_node: ProcessNode): number {
    return NODE_ROW_HEIGHT_PX;
  },

  getPorts(node: ProcessNode): Record<string, ShapePort> {
    const totalHeight =
      NODE_HEADER_HEIGHT_PX +
      NODE_ROW_HEADER_GAP_PX +
      NODE_ROW_HEIGHT_PX +
      NODE_ROW_BOTTOM_PADDING_PX;
    const centerY = totalHeight / 2;

    const ports: Record<string, ShapePort> = {
      input: {
        id: "input",
        x: 0,
        y: centerY,
        terminal: "end" as const,
      },
    };

    const outputCount = node.properties.outputCount;

    if (outputCount === 1) {
      ports.output = {
        id: "output",
        x: NODE_WIDTH_PX,
        y: centerY,
        terminal: "start" as const,
      };
    } else {
      const spacing = 20;
      const totalOutputsHeight = (outputCount - 1) * spacing;
      const startY = (totalHeight - totalOutputsHeight) / 2;

      for (let i = 0; i < outputCount; i++) {
        ports[`output_${i}`] = {
          id: `output_${i}`,
          x: NODE_WIDTH_PX,
          y: startY + i * spacing,
          terminal: "start" as const,
        };
      }
    }

    return ports;
  },

  Component: ProcessNodeComponent,
};

export function ProcessNodeComponent({
  shape,
  node,
}: {
  shape: NodeShape;
  node: ProcessNode;
}) {
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
      <Port shapeId={shape.id} portId="input" />

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
