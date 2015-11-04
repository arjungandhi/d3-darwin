# d3-network

This is a d3-based gene network visualization. The module is a wrapper for a d3 force-directed layout but customized for visuzalizing weighted gene networks.

## Usage

The module uses the design pattern suggested by Mike Bostock: http://bost.ocks.org/mike/chart/

Add the js file:

<script src="d3.network.js" charset="utf-8"></script>

```js
var network = d3.network()
		.genes(data.genes)
		.edges(data.edges);
d3.select("#chart")
	.append("svg")
	.attr("width",500)
	.attr("height",500)
	.call(network);
network.filter(.5, 10).draw();
```

## API Reference

<a name="network" href="#network">#</a> d3.<b>network</b>()

Constructs a new network instance.

<a name="nodes" href="#nodes">#</a> <b>nodes</b>([nodes])

Sets the associated nodes (genes) to the given array. Provides the same functionality as d3.force.nodes()

<a name="edges" href="#edges">#</a> <b>edges</b>([edges])

Sets the associated edges to the given array. Provides the same functionality as d3.force.links()

<a name="filter" href="#filter">#</a> <b>filter</b>(edge_cutoff, node_cutoff)

Filters the network to be visualized. <em>edge_cutoff</em> specifies the minimum edge weight for an edge to be included in the display. <em>node_cutoff</em> specifies the maximum number of genes to be displayed (beyond any query genes). For example, for a network with 2 query genes and <em>node_cutoff</em>=2, the displayed network will contain 4 genes. Nodes are prioritized by their connectivity to the query genes.

<a name="width" href="#width">#</a> <b>width</b>(width)

Specifies the width of the network layout. The width and height of this network are applied in d3.force.size([width,height]).

<a name="height" href="#height">#</a> <b>height</b>(height)

Specifies the height of the network layout. The width and height of this network are applied in d3.force.size([width,height]).


<a name="showlegend" href="#showlegend">#</a> <b>showLegend</b>(show)

If <em>show</em> is true, a legend mapping edge colors to weights will be drawn when draw() is called.


<a name="ongene" href="#ongene">#</a> <b>onGene</b>(type, listener)

Registers the specified <em>listener</em> to receive events of the specified <em>type</em>. Specifying listeners for <em>mouseover</em>, <em>mouseout</em>, <em>mouseclick</em>, <em>mouseout</em> will override the default actions.

<a name="onedge" href="#onedge">#</a> <b>onEdge</b>(type, listener)

Registers the specified <em>listener</em> to receive events of the specified <em>type</em>. Specifying listeners for <em>mouseover</em>, <em>mouseout</em> will override the default actions.
