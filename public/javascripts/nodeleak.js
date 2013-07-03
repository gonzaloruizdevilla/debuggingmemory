'use strict';

var leakedNodes = [];

function createNode(text) {
    var div = document.createElement("div"),
        innerDiv = document.createElement("div");
    innerDiv.appendChild(document.createTextNode(text + " - "+ new Date().toTimeString()));
    div.appendChild(innerDiv);
    return div;
}

function createLeakedNodes() {
    var i;
    for (i = 0; i < 20; i++) {
        leakedNodes.push(createNode("Leaked:" + i));
    }
}

function createGCNodes() {
    var i;
    for (i = 0; i < 20; i++) {
        createNode("Collected:" + i);
    }
}

function createNodes() {
    createLeakedNodes();
    createGCNodes();
}