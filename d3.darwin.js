/* Reusable d3 force-directed layout for darwin graphs
 * Follows the design pattern suggested by Mike Bostock:
 * http://bost.ocks.org/mike/chart/
 */

(function () {
  d3.darwin = function () {
    var width = 1000,
      height = 1000,
      skills = [],
      links = [],
      linkStroke = "#000",
      linkStrokeWidth = 1.5,
      nodeRadius = 5,
      nodeStroke = "#000",
      nodeStrokeWidth = 1.5,
      nodeFill = "#fff",
      canvas = document.createElement("canvas"),
      context = canvas.getContext("2d");

    function my() {
      // compute links
      links = [];
      for (const s of skills) {
        for (const p of s.parents) {
          links.push({ source: p, target: s.id });
        }
      }

      // we are using d3 v7 now
      // generate the force layout
      simulation = d3
        .forceSimulation(skills)
        .force(
          "link",
          d3.forceLink(links).id(function (d) {
            return d.id;
          })
        )
        .force("charge", d3.forceManyBody().strength(-10))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .on("tick", ticked);
    }
    // utility functions to draw the graph
    ticked = () => {
      context.clearRect(0, 0, width, height);
      for (const link of links) {
        context.beginPath();
        drawLink(link);
        context.strokeStyle = linkStroke;
        context.lineWidth = linkStrokeWidth;
        context.stroke();
      }
      context.strokeStyle = nodeStroke;
      for (const node of skills) {
        context.beginPath();
        drawNode(node);
        context.fillStyle = nodeFill;
        context.strokeStyle = nodeStroke;
        context.fill();
        context.stroke();
      }
    };

    drawLink = (d) => {
      context.moveTo(d.source.x, d.source.y);
      context.lineTo(d.target.x, d.target.y);
    };

    drawNode = (d) => {
      context.moveTo(d.x + nodeRadius, d.y);
      context.arc(d.x, d.y, nodeRadius, 0, 2 * Math.PI);
    };

    // getter and setters for variables defined above
    my.width = function (value) {
      if (!arguments.length) return width;
      width = value;
      canvas.width = width;
      return my;
    };

    my.height = function (value) {
      if (!arguments.length) return height;
      height = value;
      canvas.height = height;
      return my;
    };

    my.skills = function (value) {
      if (!arguments.length) return skills;
      skills = value;
      return my;
    };

    my.linkStroke = function (value) {
      if (!arguments.length) return linkStroke;
      linkStroke = value;
      return my;
    };

    my.linkStrokeWidth = function (value) {
      if (!arguments.length) return linkStrokeWidth;
      linkStrokeWidth = value;
      return my;
    };

    my.nodeRadius = function (value) {
      if (!arguments.length) return nodeRadius;
      nodeRadius = value;
      return my;
    };

    my.nodeStroke = function (value) {
      if (!arguments.length) return nodeStroke;
      nodeStroke = value;
      return my;
    };

    my.nodeStrokeWidth = function (value) {
      if (!arguments.length) return nodeStrokeWidth;
      nodeStrokeWidth = value;
      return my;
    };

    my.canvas = function (value) {
      if (!arguments.length) return canvas;
      canvas = value;
      canvas.width = width;
      canvas.height = height;
      context = canvas.getContext("2d");
      return my;
    };

    return my;
  }; // end of darwin
})();
