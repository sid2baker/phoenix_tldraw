import { T, useEditor } from "tldraw";
import {
  NODE_HEADER_HEIGHT_PX,
  NODE_ROW_BOTTOM_PADDING_PX,
  NODE_ROW_HEADER_GAP_PX,
} from "../constants";
import { ShapePort } from "../ports/Port";
import { NodeShape } from "./NodeShapeUtil";
import { ProcessNode, processNodeDef } from "./types/ProcessNode";

export type NodeType = ProcessNode;
export const NodeType = ProcessNode;

export const nodeDefs = {
  process: processNodeDef,
};

export function getNodeBodyHeightPx(node: NodeType): number {
  return processNodeDef.getBodyHeightPx(node);
}

export function getNodeHeightPx(node: NodeType): number {
  return (
    NODE_HEADER_HEIGHT_PX +
    NODE_ROW_HEADER_GAP_PX +
    getNodeBodyHeightPx(node) +
    NODE_ROW_BOTTOM_PADDING_PX
  );
}

export function getNodeTypePorts(node: NodeType): Record<string, ShapePort> {
  return processNodeDef.getPorts(node);
}

export function NodeBody({ shape }: { shape: NodeShape }) {
  const node = shape.props.node;
  const Component = processNodeDef.Component;
  return <Component shape={shape} node={node} />;
}
