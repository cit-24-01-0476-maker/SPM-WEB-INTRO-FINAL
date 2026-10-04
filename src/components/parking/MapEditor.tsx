import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useParking } from "@/lib/parking/useParking";
import { uid } from "@/lib/parking/service";
import { calculateRoute } from "@/lib/parking/navigation";
import type { Facility, MapNode } from "@/lib/parking/types";
import { ParkingMap } from "./ParkingMap";
import { PageTitle, Panel, Field, Hint } from "./ui";
export function MapEditor({ operations = false }: { operations?: boolean }) {
  const { state, run } = useParking();
  const facilities = state.facilities.filter(
    (f) => operations || f.providerId === state.currentProviderId,
  );
  const [draft, setDraft] = useState<Facility>(() => structuredClone(facilities[0]));
  const search = useRouterState({ select: (s) => s.location.searchStr });
  const requestedId = new URLSearchParams(search).get("facility");
  useEffect(() => {
    if (!requestedId) return;
    const requested = state.facilities.find(
      (f) => f.id === requestedId && (operations || f.providerId === state.currentProviderId),
    );
    if (requested) setDraft(structuredClone(requested));
  }, [requestedId, operations, state.currentProviderId, state.facilities]);
  const [nodeId, setNodeId] = useState("SLOT_A05"),
    [from, setFrom] = useState("ENTRY_01"),
    [to, setTo] = useState("ROAD_01"),
    [direction, setDirection] = useState<"BOTH" | "ONE_WAY">("BOTH"),
    [zoneName, setZoneName] = useState(""),
    [preview, setPreview] = useState(false),
    [dirty, setDirty] = useState(false);
  const node = draft.map.nodes.find((n) => n.id === nodeId);
  const selectedSlot = draft.slots.find((p) => p.nodeId === nodeId);
  function update(value: Facility) {
    setDraft(value);
    setDirty(true);
  }
  function move(id: string, x: number, y: number) {
    const next = structuredClone(draft);
    const n = next.map.nodes.find((n) => n.id === id);
    if (!n) return;
    n.x = x;
    n.y = y;
    const slot = next.slots.find((p) => p.nodeId === id);
    if (slot) {
      slot.x = x;
      slot.y = y;
    }
    next.map.edges.forEach((e) => {
      const a = next.map.nodes.find((n) => n.id === e.from),
        b = next.map.nodes.find((n) => n.id === e.to);
      if (a && b) e.distance = Math.max(1, Math.hypot(a.x - b.x, a.y - b.y) / 5);
    });
    update(next);
  }
  function add(type: MapNode["type"]) {
    const next = structuredClone(draft);
    const id = uid(type.toLowerCase());
    const x = 400,
      y = type === "SLOT" ? 170 : 290;
    const code =
      type === "SLOT"
        ? `A${String(Math.max(0, ...draft.slots.map((s) => Number(s.code.replace(/\D/g, "")) || 0)) + 1).padStart(2, "0")}`
        : type.toLowerCase();
    next.map.nodes.push({ id, x, y, type, label: code });
    if (type === "SLOT")
      next.slots.push({
        id: uid("slot"),
        code,
        nodeId: id,
        x,
        y,
        zone: next.map.zones[0].id,
        status: "AVAILABLE",
      });
    const nearest = [...next.map.nodes]
      .filter((n) => n.id !== id && n.type !== "SLOT")
      .sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0];
    if (nearest)
      next.map.edges.push({
        id: uid("edge"),
        from: nearest.id,
        to: id,
        distance: Math.max(1, Math.hypot(nearest.x - x, nearest.y - y) / 5),
        direction: "BOTH",
        enabled: true,
      });
    update(next);
    setNodeId(id);
  }
  function remove() {
    const next = structuredClone(draft);
    next.map.nodes = next.map.nodes.filter((n) => n.id !== nodeId);
    next.map.edges = next.map.edges.filter((e) => e.from !== nodeId && e.to !== nodeId);
    next.slots = next.slots.filter((p) => p.nodeId !== nodeId);
    update(next);
    setNodeId(next.map.nodes[0]?.id ?? "");
  }
  const entry = draft.map.nodes.find((n) => n.type === "ENTRY");
  const destination = selectedSlot ?? draft.slots.find((p) => p.code === "A05") ?? draft.slots[0];
  const route = entry && destination ? calculateRoute(draft.map, entry.id, destination.nodeId) : [];
  return (
    <>
      <PageTitle
        title="Custom Parking Map Editor"
        description="Create structured, editable parking layouts. Each facility has an independent navigation graph."
      />
      <Panel>
        <div className="parking-editor-toolbar">
          <Field label="Parking facility">
            <select
              value={draft.id}
              onChange={(e) => {
                setDraft(structuredClone(facilities.find((f) => f.id === e.target.value)!));
                setDirty(false);
                setNodeId("ENTRY_01");
              }}
            >
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </Field>
          <button onClick={() => add("SLOT")}>Add Slot</button>
          <button onClick={() => add("ENTRY")}>Add Entrance</button>
          <button onClick={() => add("EXIT")}>Add Exit</button>
          <button onClick={() => add("ROAD")}>Add Road Node</button>
          <button onClick={() => setPreview(!preview)}>
            {preview ? "Hide route preview" : "Preview navigation graph"}
          </button>
          <button
            className="eco-button"
            onClick={async () => {
              if (
                await run(
                  { type: "MAP_SAVE", facilityId: draft.id, map: draft.map, slots: draft.slots },
                  "Layout saved",
                )
              )
                setDirty(false);
            }}
          >
            Save Layout
          </button>
        </div>
        <Hint>
          {dirty
            ? "Unsaved layout changes. Save before switching facilities."
            : "Changes are draft-only until you save. Existing active bookings protect their layout."}
        </Hint>
      </Panel>
      <div className="parking-two-column parking-map-layout">
        <Panel className="parking-map-panel">
          <ParkingMap
            facility={draft}
            editNodeId={nodeId}
            onMove={move}
            navigation={
              preview
                ? {
                    bookingId: "preview",
                    mode: "SLOT",
                    status: "NAVIGATING",
                    progress: 0.45,
                    route,
                    geofence: "ENTERED",
                  }
                : null
            }
          />
          {preview && !route.length && (
            <p role="alert">Route not found. Connect the entrance to the selected space.</p>
          )}
        </Panel>
        <Panel title="Selected map element">
          <div className="parking-form">
            <Field label="Element">
              <select value={nodeId} onChange={(e) => setNodeId(e.target.value)}>
                {draft.map.nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.label} · {n.type}
                  </option>
                ))}
              </select>
            </Field>
            {node && (
              <>
                <Field label={selectedSlot ? "Slot code" : "Label"}>
                  <input
                    value={selectedSlot?.code ?? node.label}
                    onChange={(e) => {
                      const next = structuredClone(draft);
                      next.map.nodes.find((n) => n.id === nodeId)!.label = e.target.value;
                      const slot = next.slots.find((p) => p.nodeId === nodeId);
                      if (slot) slot.code = e.target.value;
                      update(next);
                    }}
                  />
                </Field>
                <div className="parking-form-pair">
                  <Field label="X coordinate">
                    <input
                      type="number"
                      min="20"
                      max="780"
                      value={node.x}
                      onChange={(e) => move(nodeId, Number(e.target.value), node.y)}
                    />
                  </Field>
                  <Field label="Y coordinate">
                    <input
                      type="number"
                      min="20"
                      max="470"
                      value={node.y}
                      onChange={(e) => move(nodeId, node.x, Number(e.target.value))}
                    />
                  </Field>
                </div>
                {selectedSlot && (
                  <>
                    <Field label="Slot status">
                      <select
                        value={selectedSlot.status}
                        onChange={(e) => {
                          const next = structuredClone(draft);
                          next.slots.find((p) => p.nodeId === nodeId)!.status = e.target
                            .value as typeof selectedSlot.status;
                          update(next);
                        }}
                      >
                        <option>AVAILABLE</option>
                        <option>OCCUPIED</option>
                        <option>BLOCKED</option>
                      </select>
                    </Field>
                    <Field label="Zone">
                      <select
                        value={selectedSlot.zone}
                        onChange={(e) => {
                          const next = structuredClone(draft);
                          next.slots.find((p) => p.nodeId === nodeId)!.zone = e.target.value;
                          update(next);
                        }}
                      >
                        {draft.map.zones.map((z) => (
                          <option key={z.id} value={z.id}>
                            {z.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </>
                )}
                <button onClick={remove}>Delete selected element</button>
              </>
            )}
            <Hint>
              Select an element then click the map or change coordinates to move it. Every saved
              slot needs a driving route from an entrance and to an exit.
            </Hint>
          </div>
        </Panel>
      </div>
      <div className="parking-two-column">
        <Panel title="Road connections">
          <div className="parking-form">
            <Field label="From node">
              <select value={from} onChange={(e) => setFrom(e.target.value)}>
                {draft.map.nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="To node">
              <select value={to} onChange={(e) => setTo(e.target.value)}>
                {draft.map.nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Direction">
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as typeof direction)}
              >
                <option value="BOTH">Two-way</option>
                <option value="ONE_WAY">One-way</option>
              </select>
            </Field>
            <button
              onClick={() => {
                const a = draft.map.nodes.find((n) => n.id === from),
                  b = draft.map.nodes.find((n) => n.id === to);
                if (!a || !b || from === to) return;
                update({
                  ...draft,
                  map: {
                    ...draft.map,
                    edges: [
                      ...draft.map.edges,
                      {
                        id: uid("edge"),
                        from,
                        to,
                        direction,
                        enabled: true,
                        distance: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y) / 5),
                      },
                    ],
                  },
                });
              }}
            >
              Connect nodes
            </button>
          </div>
          <div className="parking-edge-list">
            {draft.map.edges.map((e) => (
              <div className="parking-list-row" key={e.id}>
                <small>
                  {draft.map.nodes.find((n) => n.id === e.from)?.label}{" "}
                  {e.direction === "BOTH" ? "↔" : "→"}{" "}
                  {draft.map.nodes.find((n) => n.id === e.to)?.label} · {e.distance.toFixed(1)} m
                </small>
                <div>
                  <button
                    onClick={() =>
                      update({
                        ...draft,
                        map: {
                          ...draft.map,
                          edges: draft.map.edges.map((edge) =>
                            edge.id === e.id ? { ...edge, enabled: !edge.enabled } : edge,
                          ),
                        },
                      })
                    }
                  >
                    {e.enabled ? "Disable" : "Enable"}
                  </button>
                  <button
                    onClick={() =>
                      update({
                        ...draft,
                        map: {
                          ...draft.map,
                          edges: draft.map.edges.filter((edge) => edge.id !== e.id),
                        },
                      })
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Zones">
          {draft.map.zones.map((z) => (
            <Field key={z.id} label={`Zone ${z.id}`}>
              <input
                value={z.name}
                onChange={(e) =>
                  update({
                    ...draft,
                    map: {
                      ...draft.map,
                      zones: draft.map.zones.map((zone) =>
                        zone.id === z.id ? { ...zone, name: e.target.value } : zone,
                      ),
                    },
                  })
                }
              />
            </Field>
          ))}
          <Field label="New zone name">
            <input value={zoneName} onChange={(e) => setZoneName(e.target.value)} />
          </Field>
          <button
            onClick={() => {
              if (zoneName.trim()) {
                update({
                  ...draft,
                  map: {
                    ...draft.map,
                    zones: [...draft.map.zones, { id: uid("zone"), name: zoneName.trim() }],
                  },
                });
                setZoneName("");
              }
            }}
          >
            Create Zone
          </button>
        </Panel>
      </div>
    </>
  );
}
