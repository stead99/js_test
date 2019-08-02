// https://observablehq.com/@d3/hierarchical-edge-bundling@243
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Hierarchical Edge Bundling

The [Flare visualization toolkit](https://flare.prefuse.org) package hierarchy and imports.`
)});
  main.variable(observer("chart")).define("chart", ["tree","d3","data","id","DOM","width","line"], function(tree,d3,data,id,DOM,width,line)
{
  const root = tree(d3.hierarchy(data)
      .sort((a, b) => (a.height - b.height) || a.data.name.localeCompare(b.data.name)));

  const map = new Map(root.leaves().map(d => [id(d), d]));

  const context = DOM.context2d(width, width - 40);
  context.canvas.style.display = "block";
  context.canvas.style.maxWidth = "100%";
  context.canvas.style.margin = "auto";
  context.translate(width / 2, width / 2);
  line.context(context);

  for (const leaf of root.leaves()) {
    context.save();
    context.rotate(leaf.x - Math.PI / 2);
    context.translate(leaf.y, 0);
    if (leaf.x >= Math.PI) {
      context.textAlign = "right";
      context.rotate(Math.PI);
      context.translate(-3, 0);
    } else {
      context.textAlign = "left";
      context.translate(3, 0);
    }
    context.fillText(leaf.data.name, 0, 3);
    context.restore();
  }

  context.globalCompositeOperation = "multiply";
  context.strokeStyle = "lightsteelblue";
  for (const leaf of root.leaves()) {
    for (const i of leaf.data.imports) {
      context.beginPath();
      line(leaf.path(map.get(i)));
      context.stroke();
    }
  }

  return context.canvas;
}
);
  main.variable(observer("data")).define("data", ["d3"], async function(d3)
{
  const map = new Map;

  const imports = await d3.json("https://gist.githubusercontent.com/mbostock/1044242/raw/3ebc0fde3887e288b4a9979dad446eb434c54d08/flare.json");

  imports.forEach(function find(data) {
    const {name} = data;
    if (map.has(name)) return map.get(name);
    const i = name.lastIndexOf(".");
    map.set(name, data);
    if (i >= 0) {
      find({name: name.substring(0, i), children: []}).children.push(data);
      data.name = name.substring(i + 1);
    }
    return data;
  });

  return map.get("flare");
}
);
  main.variable(observer("id")).define("id", function(){return(
function id(node) {
  return `${node.parent ? id(node.parent) + "." : ""}${node.data.name}`;
}
)});
  main.variable(observer("width")).define("width", function(){return(
932
)});
  main.variable(observer("radius")).define("radius", ["width"], function(width){return(
width / 2
)});
  main.variable(observer("line")).define("line", ["d3"], function(d3){return(
d3.radialLine()
    .curve(d3.curveBundle.beta(0.85))
    .radius(d => d.y)
    .angle(d => d.x)
)});
  main.variable(observer("tree")).define("tree", ["d3","radius"], function(d3,radius){return(
d3.cluster()
    .size([2 * Math.PI, radius - 100])
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@5")
)});
  return main;
}
