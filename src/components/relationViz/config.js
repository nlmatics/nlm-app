export const testData = {
  smallGraph: {
    // The array of nodes
    nodes: [
      {
        id: 'node1', // String, unique and required
        x: 100, // Number, the x coordinate
        y: 200, // Number, the y coordinate
        label: 'node1',
      },
      {
        id: 'node2', // String, unique and required
        x: 300, // Number, the x coordinate
        y: 200, // Number, the y coordinate
        label: 'node2',
      },
    ],
    // The array of edges
    edges: [
      {
        source: 'node1', // String, required, the id of the source node
        target: 'node2', // String, required, the id of the target node
        label: 'likes',
      },
    ],
  },

  graph: {
    nodes: [
      {
        id: 'A',
        label: 'A',
      },
      {
        id: 'B',
        label: 'B',
      },
      {
        id: 'C',
        label: 'C',
      },
      {
        id: 'D',
        label: 'D',
      },
      {
        id: 'E',
        label: 'E',
      },
      {
        id: 'F',
        label: 'F',
      },
      {
        id: 'G',
        label: 'G',
      },
      {
        id: 'H',
        label: 'H',
      },
    ],
    edges: [
      {
        source: 'A',
        target: 'B',
        labelx: 'related to',
      },
      {
        source: 'B',
        target: 'C',
        labelx: 'related to',
      },
      {
        source: 'A',
        target: 'C',
        labelx: 'related to',
      },
      {
        source: 'D',
        target: 'A',
        labelx: 'related to',
      },
      {
        source: 'D',
        target: 'E',
        labelx: 'related to',
      },
      {
        source: 'E',
        target: 'F',
        labelx: 'related to',
      },
      {
        source: 'F',
        target: 'D',
        labelx: 'related to',
      },
      {
        source: 'G',
        target: 'H',
        labelx: 'related to',
      },
      {
        source: 'H',
        target: 'G',
        labelx: 'related to',
      },
    ],
  },

  tree: {
    id: 'Modeling Methods',
    children: [
      {
        id: 'Classification',
        collapsed: true,
        children: [
          {
            id: 'Logistic regression',
          },
          {
            id: 'Linear discriminant analysis',
          },
          {
            id: 'Rules',
          },
          {
            id: 'Decision trees',
          },
          {
            id: 'Naive Bayes',
          },
          {
            id: 'K nearest neighbor',
          },
          {
            id: 'Probabilistic neural network',
          },
          {
            id: 'Support vector machine',
          },
        ],
      },
      {
        id: 'Consensus',
        children: [
          {
            id: 'Models diversity',
            children: [
              {
                id: 'Different initializations',
              },
              {
                id: 'Different parameter choices',
              },
              {
                id: 'Different architectures',
              },
              {
                id: 'Different modeling methods',
              },
              {
                id: 'Different training sets',
              },
              {
                id: 'Different feature sets',
              },
            ],
          },
          {
            id: 'Methods',
            children: [
              {
                id: 'Classifier selection',
              },
              {
                id: 'Classifier fusion',
              },
            ],
          },
          {
            id: 'Common',
            children: [
              {
                id: 'Bagging',
              },
              {
                id: 'Boosting',
              },
              {
                id: 'AdaBoost',
              },
            ],
          },
        ],
      },
      {
        id: 'Regression',
        children: [
          {
            id: 'Multiple linear regression',
          },
          {
            id: 'Partial least squares',
          },
          {
            id: 'Multi-layer feedforward neural network',
          },
          {
            id: 'General regression neural network',
          },
          {
            id: 'Support vector regression',
          },
        ],
      },
    ],
  },
};

export const layouts = {
  mindmap: {
    type: 'mindmap',
    direction: 'H',
    getHeight: () => {
      return 16;
    },
    getWidth: () => {
      return 16;
    },
    getVGap: () => {
      return 10;
    },
    getHGap: () => {
      return 50;
    },
  },
  radialLayout: {
    type: 'radial',
    linkDistance: 200, // The edge length
    maxIteration: 1000,
    focusNode: 'node11',
    unitRadius: 100,
    preventOverlap: true, // nodeSize or size in data is required for preventOverlap: true
    nodeSize: 30,
    strictRadial: false,
    workerEnabled: true, // Whether to activate web-worker
  },
  forceLayout: {
    type: 'force',
    // center: [200, 200], // The center of the graph by default
    linkDistance: 50, // Edge length
    nodeStrength: 30,
    edgeStrength: 0.1,
    collideStrength: 0.8,
    nodeSize: 30,
    alpha: 0.3,
    alphaDecay: 0.028,
    alphaMin: 0.01,
    forceSimulation: null,
  },
  dagreLayout: {
    type: 'dagre',
    rankdir: 'LR', // The center of the graph by default
    align: 'DL',
    nodesep: 20,
    ranksep: 50,
    controlPoints: true,
  },
  forceAtlas2layout: {
    type: 'forceAtlas2',
    preventOverlap: true,
  },
  tbDendogram: {
    type: 'dendrogram',
    direction: 'TB', // H / V / LR / RL / TB / BT
    nodeSep: 40,
    rankSep: 100,
  },
  compactBoxlayout: {
    type: 'compactBox',
    direction: 'RL',
    getId: function getId(d) {
      return d.id;
    },
    getHeight: () => {
      return 26;
    },
    getWidth: () => {
      return 26;
    },
    getVGap: () => {
      return 20;
    },
    getHGap: () => {
      return 30;
    },
    radial: true,
  },
  gforce: {
    type: 'gForce',
    gravity: 0,
    nodeSize: 30,
    edgeStrength: 100,
    nodeStrength: 100,
    linkDistance: 200,
    preventOverlap: true,
  },
};
