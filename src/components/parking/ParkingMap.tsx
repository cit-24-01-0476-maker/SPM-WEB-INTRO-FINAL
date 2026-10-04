import { useId, useState } from "react";
import type { Facility, NavigationSession } from "@/lib/parking/types";
import { routePosition } from "@/lib/parking/navigation";
import { Status } from "./ui";
export function ParkingMap({
  facility,
  selected,
  navigation,
  onSelect,
  editNodeId,
  onMove,
}: {
  facility: Facility;
  selected?: string;
  navigation?: NavigationSession | null;
  onSelect?: (id: string) => void;
  editNodeId?: string;
  onMove?: (id: string, x: number, y: number) => void;
}) {
  const arrow = useId().replaceAll(":", "");
  const [zoom, setZoom] = useState(1);
  const route = navigation?.route ?? [];
  const routeNodes = route
    .map((id) => facility.map.nodes.find((n) => n.id === id))
    .filter((n) => !!n);
  const position = route.length
    ? routePosition(facility.map, route, navigation?.progress ?? 0)
    : null;
  const end = routeNodes[routeNodes.length - 1];
  return (
    <div className="parking-map-container">
      <div className="parking-map-toolbar">
        <strong>{facility.name}</strong>
        <div>
          <button aria-label="Zoom out map" onClick={() => setZoom(Math.max(0.75, zoom - 0.25))}>
            −
          </button>
          <span>{Math.round(zoom * 100)}%</span>
          <button aria-label="Zoom in map" onClick={() => setZoom(Math.min(2, zoom + 0.25))}>
            +
          </button>
          <button onClick={() => setZoom(1)}>Reset view</button>
        </div>
      </div>
      <div className="parking-map-scroll">
        <svg
          viewBox="0 0 800 500"
          className="parking-functional-map"
          role="group"
          aria-label={`Interactive parking map for ${facility.name}`}
          style={{ width: `${zoom * 100}%`, minWidth: zoom > 1 ? `${zoom * 500}px` : undefined }}
          onPointerDown={(event) => {
            if (!editNodeId || !onMove) return;
            const svg = event.currentTarget;
            const matrix = svg.getScreenCTM();
            if (!matrix) return;
            const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(
              matrix.inverse(),
            );
            onMove(
              editNodeId,
              Math.round(Math.min(780, Math.max(20, point.x))),
              Math.round(Math.min(470, Math.max(20, point.y))),
            );
          }}
        >
          <defs>
            <marker
              id={arrow}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#072e64" />
            </marker>
          </defs>
          <rect x="15" y="30" width="770" height="430" rx="24" fill="#eff2f5" stroke="#dce5ef" />
          <text x="40" y="68" className="map-zone-label">
            {facility.map.zones.map((z) => z.name).join(" · ")}
          </text>
          {facility.map.edges.map((edge) => {
            const a = facility.map.nodes.find((n) => n.id === edge.from),
              b = facility.map.nodes.find((n) => n.id === edge.to);
            return a && b ? (
              <g key={edge.id}>
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={edge.enabled ? "#dcdfe4" : "#f0c7c2"}
                  strokeWidth="35"
                  strokeLinecap="round"
                />
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="#fff"
                  strokeWidth="1.5"
                  strokeDasharray="6 9"
                />
              </g>
            ) : null;
          })}
          {routeNodes.length > 1 && (
            <polyline
              points={routeNodes.map((n) => `${n.x},${n.y}`).join(" ")}
              fill="none"
              stroke="#0d3976"
              strokeWidth="5"
              strokeLinejoin="round"
              strokeLinecap="round"
              markerEnd={`url(#${arrow})`}
            />
          )}
          {facility.map.nodes
            .filter((n) => n.type !== "SLOT" && n.type !== "ROAD")
            .map((n) => (
              <g key={n.id}>
                <circle cx={n.x} cy={n.y} r="15" fill={n.type === "EXIT" ? "#b45309" : "#176bff"} />
                <text x={n.x} y={n.y + 4} textAnchor="middle" fill="white" fontSize="10">
                  {n.type === "ENTRY" ? "IN" : n.type === "EXIT" ? "OUT" : "QR"}
                </text>
                <text x={n.x} y={n.y + 38} textAnchor="middle" className="map-node-label">
                  {n.label}
                </text>
              </g>
            ))}
          {facility.slots.map((slot) => {
            const state =
              selected === slot.id && slot.status === "AVAILABLE" ? "SELECTED" : slot.status;
            const colours: Record<string, string> = {
              AVAILABLE: "#dbe2ed",
              SELECTED: "#bdcde4",
              RESERVED: "#fce9b9",
              OCCUPIED: "#dce3eb",
              BLOCKED: "#f5d7d5",
            };
            const selectable = !!onSelect && slot.status === "AVAILABLE";
            return (
              <g
                key={slot.id}
                role={onSelect ? "button" : undefined}
                tabIndex={selectable ? 0 : undefined}
                aria-disabled={onSelect && !selectable ? true : undefined}
                aria-label={`${slot.code} ${state.toLowerCase()}`}
                onClick={() => selectable && onSelect?.(slot.id)}
                onKeyDown={(e) => {
                  if (selectable && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onSelect?.(slot.id);
                  }
                }}
                className={selectable ? "map-slot-selectable" : ""}
              >
                <rect
                  x={slot.x - 37}
                  y={slot.y - 45}
                  width="74"
                  height="90"
                  rx="9"
                  fill={colours[state]}
                  stroke={state === "SELECTED" ? "#176bff" : "#b9c0c9"}
                  strokeWidth={state === "SELECTED" ? 3 : 1}
                />
                <text
                  x={slot.x}
                  y={slot.y - 8}
                  textAnchor="middle"
                  fontSize="17"
                  fontWeight="700"
                  fill="#06182c"
                >
                  {slot.code}
                </text>
                <text x={slot.x} y={slot.y + 13} textAnchor="middle" fontSize="8" fill="#414b5a">
                  {state}
                </text>
                {slot.status === "OCCUPIED" && (
                  <rect
                    x={slot.x - 12}
                    y={slot.y + 23}
                    width="24"
                    height="13"
                    rx="4"
                    fill="#828993"
                  />
                )}
              </g>
            );
          })}
          {end && (
            <circle
              cx={end.x}
              cy={end.y}
              r="25"
              fill="none"
              stroke="#0d3976"
              strokeDasharray="5 5"
            />
          )}
          {position && (
            <g
              aria-label="Current demo location"
              style={{ transition: "transform 600ms ease" }}
              transform={`translate(${position.x},${position.y})`}
            >
              <circle r="19" fill="#176bff" stroke="white" strokeWidth="3" />
              <path
                d="M-7 5 V-5 Q-7-9 0-9 Q7-9 7-5 V5 Z M-7-1 H7"
                fill="none"
                stroke="white"
                strokeWidth="2"
              />
            </g>
          )}
          <text x="40" y="438" fontSize="10" fill="#666d76">
            {editNodeId
              ? "Click the map to reposition the selected element"
              : "SPM ECO · Demo positioning · Layout coordinates"}
          </text>
        </svg>
      </div>
      <div className="parking-map-legend">
        {["AVAILABLE", "SELECTED", "RESERVED", "OCCUPIED", "BLOCKED"].map((value) => (
          <Status key={value} value={value} />
        ))}
      </div>
    </div>
  );
}
