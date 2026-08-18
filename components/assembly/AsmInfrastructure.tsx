import type { ChainStage, Track } from "@/lib/content";

export const STAGE_TO_NODE: Record<ChainStage, string> = {
  "grid-interface": "substation",
  network: "switchgear",
  facility: "ups",
  scale: "rack",
};

const NODES = [
  { id: "grid", x: 52, label: "Grid" },
  { id: "substation", x: 172, label: "Substation" },
  { id: "switchgear", x: 292, label: "Switchgear" },
  { id: "ups", x: 420, label: "UPS / BESS" },
  { id: "pdu", x: 540, label: "PDU" },
  { id: "rack", x: 654, label: "Rack" },
] as const;

const WIRE_Y = 104;

export default function AsmInfrastructure({ tracks }: { tracks: Track[] }) {
  const trackByNode = new Map<string, Track>();
  for (const track of tracks) {
    trackByNode.set(STAGE_TO_NODE[track.chainStage], track);
  }

  return (
    <figure className="asm-card t-deep asm-infrastructure">
      <figcaption className="asm-infrastructure-caption">
        <div>
          <p className="asm-eyebrow">System map · fig. 01</p>
          <h3 className="asm-d2" id="asm-infrastructure-title">
            Utility to rack
          </h3>
        </div>
        <p className="asm-lede">
          One electrical chain. Four programme tracks pinned to the point where
          their decisions become physical.
        </p>
      </figcaption>

      <div className="asm-infrastructure-scroll">
        <svg
          viewBox="0 0 710 220"
          role="img"
          aria-labelledby="asm-infrastructure-title asm-infrastructure-desc"
        >
          <desc id="asm-infrastructure-desc">
            A single-line electrical diagram showing power moving from the grid
            through a substation, switchgear, UPS and battery storage, and a
            power distribution unit into a compute rack. Summit tracks are
            attached to the stages they address.
          </desc>
          <defs>
            <pattern id="asm-graph-paper" width="18" height="18" patternUnits="userSpaceOnUse">
              <path d="M 18 0 L 0 0 0 18" className="asm-infrastructure-grid" />
            </pattern>
          </defs>
          <rect width="710" height="220" fill="url(#asm-graph-paper)" />
          <path
            className="asm-infrastructure-wire"
            d={`M ${NODES[0].x} ${WIRE_Y} H ${NODES[5].x}`}
          />

          <circle className="asm-infrastructure-symbol" cx={NODES[0].x} cy={WIRE_Y} r="18" />
          <path
            className="asm-infrastructure-detail"
            d={`M ${NODES[0].x - 9} ${WIRE_Y} q 4 -8 9 0 t 9 0`}
          />

          <circle className="asm-infrastructure-symbol" cx={NODES[1].x - 8} cy={WIRE_Y} r="13" />
          <circle className="asm-infrastructure-symbol" cx={NODES[1].x + 8} cy={WIRE_Y} r="13" />

          <rect className="asm-infrastructure-symbol" x={NODES[2].x - 16} y={WIRE_Y - 18} width="32" height="36" />
          <path className="asm-infrastructure-detail" d={`M ${NODES[2].x - 9} ${WIRE_Y + 10} L ${NODES[2].x + 9} ${WIRE_Y - 10}`} />

          <rect className="asm-infrastructure-symbol" x={NODES[3].x - 24} y={WIRE_Y - 18} width="48" height="36" />
          <path
            className="asm-infrastructure-detail"
            d={`M ${NODES[3].x - 9} ${WIRE_Y - 11} V ${WIRE_Y + 11} M ${NODES[3].x - 2} ${WIRE_Y - 6} V ${WIRE_Y + 6} M ${NODES[3].x + 5} ${WIRE_Y - 11} V ${WIRE_Y + 11} M ${NODES[3].x + 12} ${WIRE_Y - 6} V ${WIRE_Y + 6}`}
          />

          <rect className="asm-infrastructure-symbol" x={NODES[4].x - 15} y={WIRE_Y - 15} width="30" height="30" />
          <circle className="asm-infrastructure-dot" cx={NODES[4].x} cy={WIRE_Y} r="4" />

          <rect className="asm-infrastructure-symbol" x={NODES[5].x - 15} y={WIRE_Y - 25} width="30" height="50" />
          <path
            className="asm-infrastructure-detail"
            d={`M ${NODES[5].x - 9} ${WIRE_Y - 14} h 18 M ${NODES[5].x - 9} ${WIRE_Y - 5} h 18 M ${NODES[5].x - 9} ${WIRE_Y + 5} h 18 M ${NODES[5].x - 9} ${WIRE_Y + 14} h 18`}
          />

          {NODES.map((node) => {
            const track = trackByNode.get(node.id);
            return (
              <g key={node.id}>
                <text className="asm-infrastructure-label" x={node.x} y="166" textAnchor="middle">
                  {node.label}
                </text>
                {track ? (
                  <text className="asm-infrastructure-track" x={node.x} y="187" textAnchor="middle">
                    {track.code}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>
    </figure>
  );
}
