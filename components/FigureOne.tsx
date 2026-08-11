import type { ChainStage, Track } from "@/lib/content";

/**
 * FIG. 01 — single-line electrical diagram, grid to rack.
 * Each curriculum track's chainStage maps to one node here, so the
 * hero diagram and the curriculum can never drift apart.
 */
const STAGE_TO_NODE: Record<ChainStage, string> = {
  "grid-interface": "substation",
  network: "switchgear",
  facility: "ups",
  scale: "rack",
};

interface NodeDef {
  id: string;
  x: number;
  label: string;
}

const NODES: NodeDef[] = [
  { id: "grid", x: 44, label: "GRID" },
  { id: "substation", x: 150, label: "SUBSTATION" },
  { id: "switchgear", x: 256, label: "SWITCHGEAR" },
  { id: "ups", x: 372, label: "UPS / BESS" },
  { id: "pdu", x: 484, label: "PDU" },
  { id: "rack", x: 580, label: "RACK" },
];

const WIRE_Y = 96;

export default function FigureOne({ tracks }: { tracks: Track[] }) {
  const trackByNode = new Map<string, Track>();
  for (const track of tracks) {
    trackByNode.set(STAGE_TO_NODE[track.chainStage], track);
  }

  return (
    <figure className="figure-card">
      <figcaption>
        <span className="fig-no">Fig. 01</span>
        <span className="fig-title">Single-line diagram — utility to rack</span>
      </figcaption>
      <svg
        viewBox="0 0 640 200"
        role="img"
        aria-label="Single-line electrical diagram showing power flowing from the utility grid through a substation, switchgear, UPS and battery storage, and a power distribution unit into a compute rack. Curriculum tracks are pinned to the stages they cover."
      >
        <defs>
          <pattern id="graph-paper" width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M 16 0 L 0 0 0 16" fill="none" stroke="var(--rule-grid)" strokeWidth="1" />
          </pattern>
        </defs>

        <rect width="640" height="200" fill="url(#graph-paper)" />

        {/* conductor */}
        <path className="oneline-conductor" d={`M ${NODES[0].x} ${WIRE_Y} H ${NODES[5].x}`} />
        {/* animated blue pulse along the conductor */}
        <path className="oneline-pulse" d={`M ${NODES[0].x} ${WIRE_Y} H ${NODES[5].x}`} />

        {/* grid: source symbol */}
        <circle className="oneline-symbol" cx={NODES[0].x} cy={WIRE_Y} r="16" />
        <path
          d={`M ${NODES[0].x - 8} ${WIRE_Y} q 4 -7 8 0 t 8 0`}
          fill="none"
          stroke="var(--c-ink-900)"
          strokeWidth="1.5"
        />

        {/* substation: two-winding transformer */}
        <circle className="oneline-symbol" cx={NODES[1].x - 7} cy={WIRE_Y} r="12" />
        <circle className="oneline-symbol" cx={NODES[1].x + 7} cy={WIRE_Y} r="12" fill="none" />

        {/* switchgear: breaker box */}
        <rect className="oneline-symbol" x={NODES[2].x - 14} y={WIRE_Y - 16} width="28" height="32" />
        <path
          d={`M ${NODES[2].x - 8} ${WIRE_Y + 9} L ${NODES[2].x + 8} ${WIRE_Y - 9}`}
          stroke="var(--c-ink-900)"
          strokeWidth="1.5"
        />

        {/* UPS / BESS: battery cell plates */}
        <rect className="oneline-symbol" x={NODES[3].x - 22} y={WIRE_Y - 16} width="44" height="32" />
        <path
          d={`M ${NODES[3].x - 8} ${WIRE_Y - 10} V ${WIRE_Y + 10} M ${NODES[3].x - 2} ${WIRE_Y - 5} V ${WIRE_Y + 5} M ${NODES[3].x + 4} ${WIRE_Y - 10} V ${WIRE_Y + 10} M ${NODES[3].x + 10} ${WIRE_Y - 5} V ${WIRE_Y + 5}`}
          stroke="var(--c-ink-900)"
          strokeWidth="1.5"
        />

        {/* PDU */}
        <rect className="oneline-symbol" x={NODES[4].x - 14} y={WIRE_Y - 14} width="28" height="28" />
        <circle cx={NODES[4].x} cy={WIRE_Y} r="4" fill="var(--c-blue-500)" />

        {/* rack */}
        <rect className="oneline-symbol" x={NODES[5].x - 13} y={WIRE_Y - 22} width="26" height="44" />
        <path
          d={`M ${NODES[5].x - 8} ${WIRE_Y - 12} h 16 M ${NODES[5].x - 8} ${WIRE_Y - 4} h 16 M ${NODES[5].x - 8} ${WIRE_Y + 4} h 16 M ${NODES[5].x - 8} ${WIRE_Y + 12} h 16`}
          stroke="var(--c-ink-900)"
          strokeWidth="1.5"
        />

        {/* labels + track pins derived from tracks[].chainStage */}
        {NODES.map((node) => {
          const track = trackByNode.get(node.id);
          return (
            <g key={node.id}>
              <text className="oneline-label" x={node.x} y={158} textAnchor="middle">
                {node.label}
              </text>
              {track ? (
                <text className="oneline-track" x={node.x} y={174} textAnchor="middle">
                  {track.code}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
