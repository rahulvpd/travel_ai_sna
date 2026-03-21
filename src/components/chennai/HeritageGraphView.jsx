import React, { useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

const HeritageGraphView = () => {
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetch('http://localhost:8000/api/graph')
            .then(res => res.json())
            .then(data => {
                // Transform backend insights into force-graph format
                const nodes = Object.keys(data.centrality).map(id => ({
                    id,
                    group: data.communities[id] || 0
                }));
                const links = []; // Links logic would be added here based on graph structure
                setGraphData({ nodes, links });
                setLoading(false);
            })
            .catch(() => {
                // Fallback sample data when backend is offline
                const sampleNodes = [
                    { id: 'Meenakshi Temple', group: 1 },
                    { id: 'Brihadeeswarar', group: 1 },
                    { id: 'Shore Temple', group: 2 },
                    { id: 'Thanjavur Palace', group: 1 },
                    { id: 'Chettinad', group: 3 },
                    { id: 'Madurai', group: 1 },
                    { id: 'Rameswaram', group: 2 },
                    { id: 'Kanchipuram', group: 2 },
                ];
                const sampleLinks = [
                    { source: 'Meenakshi Temple', target: 'Madurai' },
                    { source: 'Brihadeeswarar', target: 'Thanjavur Palace' },
                    { source: 'Shore Temple', target: 'Kanchipuram' },
                    { source: 'Madurai', target: 'Chettinad' },
                    { source: 'Madurai', target: 'Rameswaram' },
                    { source: 'Kanchipuram', target: 'Brihadeeswarar' },
                ];
                setGraphData({ nodes: sampleNodes, links: sampleLinks });
                setError(true);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="flex items-center justify-center h-full text-white/50">Loading Heritage Network...</div>;

    return (
        <div className="relative w-full h-full">
            {error && (
                <div className="absolute top-2 left-2 z-10 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
                    Showing sample data — backend offline
                </div>
            )}
            <ForceGraph2D
                graphData={graphData}
                nodeLabel="id"
                nodeAutoColorBy="group"
                linkDirectionalArrowLength={3.5}
                linkDirectionalArrowRelPos={1}
                width={800}
                height={380}
            />
        </div>
    );
};

export default HeritageGraphView;
