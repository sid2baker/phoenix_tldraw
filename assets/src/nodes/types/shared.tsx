import classNames from "classnames";
import { Editor, T, TLUiIconJsx } from "tldraw";
import { PortId, ShapePort } from "../../ports/Port";
import { NodeShape } from "../NodeShapeUtil";
import { NodeType } from "../nodeTypes";

export type WorkflowValue = number;

/**
 * A special value that can be returned from a node to indicate that execution should stop.
 */
export type STOP_EXECUTION = typeof STOP_EXECUTION;
export const STOP_EXECUTION = Symbol("STOP_EXECUTION");

export interface InfoValues {
  [key: string]: {
    value: WorkflowValue | STOP_EXECUTION;
    isOutOfDate: boolean;
  };
}

export interface ExecutionResult {
  [key: string]: WorkflowValue | STOP_EXECUTION;
}

export interface InputValues {
  [key: string]: WorkflowValue;
}

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
  abstract getOutputInfo(
    shape: NodeShape,
    node: Node,
    inputs: InfoValues,
  ): InfoValues;
  abstract execute(
    shape: NodeShape,
    node: Node,
    inputs: InputValues,
  ): Promise<ExecutionResult>;
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
  isOutOfDate: boolean = true,
) {
  editor.updateShape<NodeShape>({
    id: shape.id,
    type: shape.type,
    props: { node: update(shape.props.node as T), isOutOfDate },
  });
}

/**
 * A row in a node. This component just applies some styling.
 */
export function NodeRow({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={classNames("NodeRow", className)}>
      {children}
    </div>
  );
}

/**
 * Format a number to display with up to 5 significant figures, using suffixes for large numbers.
 */
function formatNumber(value: number): string {
  // Handle special cases
  if (value === 0) return "0";
  if (!isFinite(value)) return value.toString();

  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  // For very large numbers, use suffixes
  if (absValue >= 1_000_000_000) {
    return sign + (absValue / 1_000_000_000).toPrecision(3) + "B";
  }
  if (absValue >= 1_000_000) {
    return sign + (absValue / 1_000_000).toPrecision(3) + "M";
  }
  if (absValue >= 1_000) {
    return sign + (absValue / 1_000).toPrecision(3) + "k";
  }

  // For smaller numbers, use up to 5 significant figures
  if (absValue >= 1) {
    // For numbers >= 1, limit to 5 significant figures
    return sign + absValue.toPrecision(5).replace(/\.?0+$/, "");
  } else if (absValue >= 0.001) {
    // For numbers between 0.001 and 1, show up to 5 significant figures
    return sign + absValue.toPrecision(3);
  } else {
    // For very small numbers, use scientific notation
    return value.toExponential(2);
  }
}

/**
 * A value within a node. If the value is STOP_EXECUTION, a placeholder is shown instead.
 */
export function NodeValue({ value }: { value: number | STOP_EXECUTION }) {
  if (value === STOP_EXECUTION) {
    return <div className="NodeValue_placeholder" />;
  }

  return formatNumber(value);
}

export function areAnyInputsOutOfDate(inputs: InfoValues): boolean {
  return Object.values(inputs).some((input) => input.isOutOfDate);
}
