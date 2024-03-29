import G6 from '@antv/g6';
G6.registerEdge(
  'custom-edge',
  {
    // Response the states change
    setState(name, value, item) {
      const group = item.getContainer();
      const shape = group.get('children')[0]; // The order is determined by the ordering of been draw
      if (name === 'active') {
        if (value) {
          shape.attr('stroke', 'red');
        } else {
          shape.attr('stroke', '#333');
        }
      }
      if (name === 'selected') {
        if (value) {
          shape.attr('lineWidth', 3);
        } else {
          shape.attr('lineWidth', 2);
        }
      }
    },
  },
  'line'
);
export const createGraph = (ref, layout) => {
  const graph = new G6.Graph({
    container: ref.current,
    // fitView: true,
    // fitCenter: true,
    modes: {
      default: ['drag-canvas', 'drag-node', 'zoom-canvas'],
    },
    defaultNode: {
      shape: 'node',
      labelCfg: {
        position: 'bottom',
        style: {
          fill: '#000000A6',
          fontSize: 6,
        },
      },
      style: {
        stroke: '#72CC4A',
        width: 150,
      },
    },
    defaultEdge: {
      shape: 'polyline',
      style: {
        endArrow: true,
      },
      labelCfg: { autoRotate: true, style: { fontSize: 6 } },
    },
    nodeStateStyles: {
      hover: {
        stroke: 'red',
        lineWidth: 3,
      },
    },
    edgeStateStyles: {
      hover: {
        stroke: 'blue',
        lineWidth: 3,
      },
      endArrow: true,
      label: false,
    },
    layout: layout,
  });
  graph.edge(function () {
    return {
      label: false,
    };
  });
  let selectedEdge = null;
  graph.on('edge:click', ev => {
    const edge = ev.item;
    graph.setItemState(edge, 'selected', !edge.hasState('selected')); // Switch the 'selected' state
    if (selectedEdge) {
      graph.setItemState(selectedEdge, 'selected', false);
    }
    selectedEdge = edge;
  });

  graph.on('edge:mouseenter', ev => {
    const edge = ev.item;
    graph.setItemState(edge, 'active', true);
  });

  graph.on('edge:mouseleave', ev => {
    const edge = ev.item;
    graph.setItemState(edge, 'active', false);
  });

  return graph;
};

export const createTree = (ref, layout, rootNodeId) => {
  console.log(layout);
  const graph = new G6.TreeGraph({
    container: ref.current,
    linkCenter: true,
    fitView: true,
    fitCenter: true,
    modes: {
      default: [
        {
          type: 'collapse-expand',
          onChange: function onChange(item, collapsed) {
            const data = item.get('model');
            data.collapsed = collapsed;
            return true;
          },
        },
        'drag-canvas',
        'zoom-canvas',
      ],
    },
    defaultNode: {
      size: 26,
    },
    layout: layout,
  });
  let centerX = 0;
  graph.node(function (node) {
    if (node.id === rootNodeId) {
      centerX = node.x;
      console.log('root node is....', rootNodeId);
    }

    return {
      label: node.label ? node.label : node.id,
      labelCfg: {
        position:
          node.children && node.children.length > 0
            ? 'left'
            : node.x > centerX
            ? 'right'
            : 'left',
        offset: 5,
      },
    };
  });

  return graph;
};
