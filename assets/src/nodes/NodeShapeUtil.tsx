import classNames from "classnames";
import {
  Circle2d,
  Group2d,
  HTMLContainer,
  RecordProps,
  Rectangle2d,
  resizeBox,
  ShapeUtil,
  T,
  TLBaseShape,
  TLResizeInfo,
  useEditor,
  useUniqueSafeId,
} from "tldraw";
import { NODE_WIDTH_PX, PORT_RADIUS_PX } from "../constants";
import { Port, ShapePort } from "../ports/Port";
import { getNodePorts } from "./nodePorts";
import { getNodeHeightPx, NodeBody, NodeType, nodeDefs } from "./nodeTypes";

export type NodeShape = TLBaseShape<"node", { node: NodeType }>;

export class NodeShapeUtil extends ShapeUtil<NodeShape> {
  static override type = "node" as const;
  static override props: RecordProps<NodeShape> = {
    node: NodeType,
  };

  getDefaultProps(): NodeShape["props"] {
    return {
      node: nodeDefs.process.getDefault(),
    };
  }

  override canEdit() {
    return false;
  }
  override canResize() {
    return false;
  }
  override hideResizeHandles() {
    return true;
  }
  override hideRotateHandle() {
    return true;
  }
  override hideSelectionBoundsBg() {
    return true;
  }
  override hideSelectionBoundsFg() {
    return true;
  }
  override isAspectRatioLocked() {
    return false;
  }
  override getBoundsSnapGeometry(_shape: NodeShape) {
    return {
      points: [{ x: 0, y: 0 }],
    };
  }

  // Define the geometry of our node shape including ports
  getGeometry(shape: NodeShape) {
    const ports = getNodePorts(this.editor, shape);

    const portGeometries = Object.values(ports).map(
      (port) =>
        new Circle2d({
          x: port.x - PORT_RADIUS_PX,
          y: port.y - PORT_RADIUS_PX,
          radius: PORT_RADIUS_PX,
          isFilled: true,
          // not a label, but this hack excludes them from the selection bounds which is useful
          isLabel: true,
          excludeFromShapeBounds: true,
        }),
    );

    const bodyGeometry = new Rectangle2d({
      width: NODE_WIDTH_PX,
      height: getNodeHeightPx(shape.props.node),
      isFilled: true,
    });

    return new Group2d({
      children: [bodyGeometry, ...portGeometries],
    });
  }

  override onResize(shape: any, info: TLResizeInfo<any>) {
    return resizeBox(shape, info);
  }

  component(shape: NodeShape) {
    return <NodeShape shape={shape} />;
  }

  indicator(shape: NodeShape) {
    const ports = Object.values(getNodePorts(this.editor, shape));
    return <NodeShapeIndicator shape={shape} ports={ports} />;
  }
}

// SVG indicator component that shows selection bounds and ports
function NodeShapeIndicator({
  shape,
  ports,
}: {
  shape: NodeShape;
  ports: ShapePort[];
}) {
  const id = useUniqueSafeId();
  const editor = useEditor();

  return (
    <>
      {/* Create a mask to show ports as holes in the selection bounds */}
      <mask id={id}>
        <rect
          width={NODE_WIDTH_PX + 10}
          height={getNodeHeightPx(shape.props.node) + 10}
          fill="white"
          x={-5}
          y={-5}
        />
        {ports.map((port) => (
          <circle
            key={port.id}
            cx={port.x}
            cy={port.y}
            r={PORT_RADIUS_PX}
            fill="black"
            strokeWidth={0}
          />
        ))}
      </mask>
      <rect
        rx={9}
        width={NODE_WIDTH_PX}
        height={getNodeHeightPx(shape.props.node)}
        mask={`url(#${id})`}
      />
      {ports.map((port) => (
        <circle key={port.id} cx={port.x} cy={port.y} r={PORT_RADIUS_PX} />
      ))}
    </>
  );
}

// Main node component that renders the HTML content
function NodeShape({ shape }: { shape: NodeShape }) {
  const editor = useEditor();

  return (
    <HTMLContainer className={classNames("NodeShape", "NodeShape--editable")}>
      <NodeBody shape={shape} />
    </HTMLContainer>
  );
}
