/*global document, d3*/
(function () {
    'use strict';

    var tooltip,
        svg,
        graph,
        width = 800,
        height = 500,
        color = d3.scale.category20b(),
        color2 = d3.scale.category10();


    function createArrowMarker(svg) {
        svg.append("svg:defs")
            .selectAll("marker")
            .data(["arrow"])
            .enter().append("svg:marker")
                .attr("id", String)
                .attr("viewBox", "0 -5 10 10")
                .attr("refX", 26)
                .attr("refY", 0)
                .attr("markerWidth", 5)
                .attr("markerHeight", 4)
                .attr("orient", "auto")
                .append("svg:path")
                    .attr("d", "M0,-5L10,0L0,5");
    }

    function createForce() {
        return d3.layout.force()
            .gravity(0.2)
            .charge(-1000)
            .linkDistance(40)
            .size([width, height]);
    }

    function nodeColor(node) {
        if (node.dominated) { return color2(2); }
        if (node.dominator) { return color2(3); }
        return color(node.group);
    }

    function unmarkRelated(node) {
        node.dominates.forEach(function (dominated) {
            graph.nodes[dominated].dominated = false;
        });

        graph.nodes[node.dominatedBy].dominator = false;

        svg.selectAll(".node")
            .data(graph.nodes)
            .style("fill", nodeColor)
            .attr("r", 20)
            .classed("selected", false);
    }

    function radius(node) {
        if (node.dominator) {return 28; }
        if (node.dominated) {return 16; }
        return 20;
    }

    function markRelated(node) {
        node.dominates.forEach(function (dominated) {
            graph.nodes[dominated].dominated = true;
        });

        graph.nodes[node.dominatedBy].dominator = true;

        svg.selectAll(".node")
            .data(graph.nodes)
            .style("fill", nodeColor)
            .attr("r", radius)
            .classed("selected", function(d) {return d.dominated || d.dominator; });
    }

    function tooltipText(node) {
        var first = true,
            text = "<strong>Node " + node.name + "</strong><br/>" +
                "Dominated by " + graph.nodes[node.dominatedBy].name + "<br/>" +
                "Dominates: ";
        if (node.dominates.length === 0) {
            text += "None";
        } else {
            node.dominates.forEach(function (dominated) {
                if (first) {
                    first = false;
                } else {
                    text += ", ";
                }
                text += graph.nodes[dominated].name;
            });
        }
        return text;
    }
    function showTooltip(circle, node) {
        tooltip.transition()
            .duration(200)
            .style("opacity", 0.8);
        tooltip.html(tooltipText(node))
            .style("left", (parseInt(circle.attr("cx")) + 80) + "px")
            .style("top", (parseInt(circle.attr("cy")) + 110)+ "px");
    }

    function hideTooltip() {
        tooltip.transition()
            .duration(200)
            .style("opacity", 0);
    }

    function mouseover(node) {
        var circle = d3.select(this);
        markRelated(node);
        showTooltip(circle, node);
        circle
            .style("fill", "red")
            .classed("selected", true);
    }

    function mouseout(node) {
        unmarkRelated(node);
        hideTooltip();
        d3.select(this)
            .style("fill", function(d) { return color(d.group); })
            .classed("selected", false);
    }

    function createGraph() {

        var force;

        force = createForce();

        svg = d3.select("body").append("svg")
            .attr("width", width)
            .attr("height", height);

        tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        createArrowMarker(svg);

        d3.json("/json/graph.json", function(error, data) {
            var link, node, texts;
            graph = data;
            graph.nodes[0].fixed = true;
            graph.nodes[0].x = width / 2;
            graph.nodes[0].y = 30;
            force
                .nodes(graph.nodes)
                .links(graph.links)
                .start();

            link = svg.selectAll(".link")
                .data(graph.links)
                .enter()
                .append("line")
                .attr("class", "link")
                .attr("marker-end", "url(#arrow)")
                .style("stroke-width", function(d) { return Math.sqrt(d.value); });

            node = svg.selectAll(".node")
                .data(graph.nodes)
                .enter().append("circle")
                .attr("class", "node")
                .attr("r", 20)
                .style("fill", function(d) { return color(d.group); })
                .call(force.drag)
                .on("mouseover", mouseover)
                .on("mouseout", mouseout);

            texts = svg.selectAll("text")
                .data(graph.nodes)
                .enter()
                .append("text")
                .text(function(d) { return d.name; })
                .attr("font-family", "sans-serif")
                .attr("font-size", "20px")
                .attr("fill", "red")
                .style("pointer-events", "none");

            force.on("tick", function() {
                link.attr("x1", function(d) { return d.source.x; })
                    .attr("y1", function(d) { return d.source.y; })
                    .attr("x2", function(d) { return d.target.x; })
                    .attr("y2", function(d) { return d.target.y; });

                node.attr("cx", function(d) { return d.x; })
                    .attr("cy", function(d) { return d.y; });

                texts
                    .attr("x", function(d) { return d.x; })
                    .attr("y", function(d) { return d.y; })
                    .attr("dx", "-10px")
                    .attr("dy", "5px");
            });
        });
    }

    document.addEventListener('DOMContentLoaded', createGraph);

}());