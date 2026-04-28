import { dynastyHex, dynastyIcons } from '../../utils/dynastyColors';

export default function TripSNATimeline({ subgraph }) {
  if (!subgraph?.chronological?.length) {
    return null;
  }

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
      <p className="mb-3 text-xs text-white/30">Selected places in chronological order.</p>

      {subgraph.chronological.map((node, index) => {
        const color = dynastyHex[node.dynasty] || '#888888';

        return (
          <div key={node.id} className="flex items-start gap-3">
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: color, boxShadow: `0 0 8px ${color}66` }}
              />
              {index < subgraph.chronological.length - 1 && (
                <div className="w-0.5 h-6 mt-1" style={{ background: `${color}33` }} />
              )}
            </div>

            <div className="flex-1 pb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-white">{node.name}</span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full border"
                  style={{
                    borderColor: `${color}55`,
                    color,
                    background: `${color}14`,
                  }}
                >
                  {dynastyIcons[node.dynasty] || 'o'} {node.dynasty}
                </span>
              </div>
              <p className="text-xs text-white/40 mt-0.5">
                {node.period} · {node.placeType}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
