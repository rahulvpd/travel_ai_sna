import { CULTURAL_CIRCUITS } from '../data/culturalCircuits';

export async function computeCircuitSNA() {
    return new Promise((resolve) => {
        setTimeout(() => {
            const nodes = [];
            const links = [];
            const nodeMap = new Map();

            // 1. Build Nodes
            CULTURAL_CIRCUITS.forEach((circuit, circuitIndex) => {
                circuit.places.forEach((place, placeIndex) => {
                    const id = place.name;
                    if (!nodeMap.has(id)) {
                        nodeMap.set(id, {
                            id: id,
                            name: place.name,
                            district: place.district,
                            highlight: place.highlight,
                            group: circuitIndex + 1,
                            circuitName: circuit.name,
                            coord: place.coord,
                            degree: 0,
                            val: 1
                        });
                        nodes.push(nodeMap.get(id));
                    }
                });
            });

            // 2. Build Sequential Links within Circuits
            CULTURAL_CIRCUITS.forEach((circuit) => {
                for (let i = 0; i < circuit.places.length - 1; i++) {
                    const sourceId = circuit.places[i].name;
                    const targetId = circuit.places[i + 1].name;
                    
                    links.push({
                        source: sourceId,
                        target: targetId,
                        type: 'sequential',
                        circuit: circuit.name
                    });

                    // Increase degree
                    nodeMap.get(sourceId).degree += 1;
                    nodeMap.get(sourceId).val += 0.5;
                    nodeMap.get(targetId).degree += 1;
                    nodeMap.get(targetId).val += 0.5;
                }
            });

            // 3. Centrality & Metrics calculation
            const metrics = {
                totalNodes: nodes.length,
                totalEdges: links.length,
                circuits: CULTURAL_CIRCUITS.length
            };

            resolve({ nodes, links, metrics });
        }, 800); // Simulate network delay
    });
}
