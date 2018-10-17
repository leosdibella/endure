class Edge {
    readonly toVertexIndex: number;
    readonly weight: number;

    constructor(toVertexIndex: number, weight: number) {
        this.toVertexIndex = toVertexIndex;
        this.weight = weight;
    };
};

class EdgeSet {
    readonly edges: Edge[] = [];
};

export class ConnectedGraph {
    readonly vertexIndices: number[] = [];
    weight: number = 0;

    addIndex(edge: Edge) {
        this.vertexIndices.push(edge.toVertexIndex);
        this.weight += edge.weight;
    };
};

export class DirectedAcyclicGraph {
    private readonly edgeSet: EdgeSet[] = [];
    largestConnectedSubgraph: ConnectedGraph;

    constructor(vertices: any[]) {
        for (let i = 0; vertices.length; ++i) {
            this.edgeSet.push(new EdgeSet());
        }
    };

    addEdge(fromVertexIndex: number, toVertexIndex: number, weight: number) : void {
        this.edgeSet[fromVertexIndex].edges.push(new Edge(toVertexIndex, weight));
    };

    generateLargestConnectedSubgraph() : ConnectedGraph {
        return this.largestConnectedSubgraph;
    };
};