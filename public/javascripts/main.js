// setup initial view of the visual interface
var data;

var makeNetwork;

var netkey = "genre";

var svg;

var force;

var eTech;

$(document).ready(function(){
  var width = 1024,
  height = 768;

  $("#canvas").width(width);

  var color = d3.scale.category20();

  makeNetwork = function() {

    if (force) {
      console.log("stopping force");
      force.stop();
    }

    console.log("svg: ", svg)
    if (! svg) {
      svg = d3.select("#canvas").append("svg")
          .attr("width", width)
          .attr("height", height);
    } else {
      console.log("emptying svg");
      svg.html("");
    }

    force = d3.layout.force()
        .charge(-120)
        .linkDistance(50)
        .size([width, height]);

    var rows = data;
    var json = {
      nodes: [], // unique nodes found in data
      links: []  // links between nodes
    };
    json.nodes = rows.slice(0);

    var root_node = {name: "root", weight: 1};
    json.nodes.push(root_node);

    var myMap = new Map();

    for ( var i = 0; i < rows.length; i++ ) {
      console.log("node! " + rows[i].name);

      console.log("rows[i]", rows[i]);
      var keys = rows[i][netkey].split(/,\s*/);
      //var netkey = queryhelper();
      //var keys = rows[i].netkey.split(/,\s*/);

      for (var j = 0; j < keys.length; j++) {
        key = keys[j];

        if (!(myMap.has(key))) {
          console.log("new key! " + key);
          var new_node = {name: key, weight: 1};
          json.nodes.push(new_node); // here we can give another key-value
          myMap.set(key, new_node);
          json.links.push({source:new_node, target: root_node, value: 1})
        }
        var link_node = myMap.get(key);
        json.links.push({source:rows[i], target: link_node, value: 1})
      }

    }
    //console.log(key.length)
    //console.log(json.nodes);
    links = json.links;
    //console.log(json.links);

    force
        .nodes(json.nodes)
        .links(json.links)
        .start();

    var link = svg.selectAll(".link")
        .data(links)
        .enter().append("line")// "path" and curved
        .attr("class", "link")
        .style("stroke-width", function(d) { return Math.sqrt(d.value); });

    var enterNode = svg.selectAll("circle")
        .data(json.nodes)
        .enter().append("circle")
        .attr("id", function(d){
              return d.name;
         });

   var node =  svg.selectAll("circle")
        .attr("r", 4.5)
        .style("fill", function(d) { return color(d.category); })
        .style("stroke", "#808080") // the black curcumface
        .call(force.drag);


    node.on("click", function(d){
      console.log("d", d);
      var dummy = _.omit(d,["weight", "index", "x", "y", "px", "py", "fixed"]);
      console.log("dummy", dummy);
      var html = _.reduce(dummy, function(result, key, value) {
        if (_(["wikilink", "website"]).contains(value)) {
          key = "<a href='" + key + "'>" + key + "</a>";
        }
        return result + "<dt>" + value + "</dt>" + "<dd>" + key + "</dd>"
      }, "");
      $("#information .nodeattributes").html("<dl>" + html + "</dl>");
    });

    var lable = node.append("title")
          .text(function(d) { return d.name; });

    force.on("tick", function() {
      link.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      node.attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });

    // document.getElementById(".node").onmouseover = function() {mouseOver()};
    });

  }// this is end of makeNetwork definition.

  d3.csv("/data/eSTEP_PattyUseCase.csv", function(d) {
    return {
      name: d.name,
      genre: d.genre,
      category: d.category,
      comment: d.comment,
      operatingSystem: d.operatingSystem,
      programmingLanguage: d.programmingLanguage,
      license: d.license,
      applicability: d.applicability,
      developedBy: d.developedBy,
      website: d.website,
      wikilink: d.wikilink,
      weight: 1
    };
  }, function(rows) {
    data = rows;
    makeNetwork();
  });

});

// action by selecting items of the dropdown menue

function queryhelper() {
    var x = document.getElementById("queryCriterion");
    console.log(x.value);
    netkey = x.value;
    makeNetwork();
    return x.value;
};

function search_eTech(){
    var circleID = document.getElementById("userInput").value;
    var theNode = d3.select("#" + circleID);
    console.log(theNode);
    theNode.attr("r", 20); // this should be on
    // console.log(theNode.select("title"));
    // console.log(theNode.select("title").text());
    // theNode.select("title")[0].value="Test";
}
