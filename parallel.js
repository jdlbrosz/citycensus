function setup_parallel() {
    
    $("div.header").text("Calgary's Community Structures");
    
    var data = [];
    for (var i=0; i<g.data.length; i++) {   
        var index = findWithinArray(data, "COMM_STRUCTURE", g.data[i].COMM_STRUCTURE);
        if (index < 0) {
            var element = {};
            element.COMM_STRUCTURE = g.data[i].COMM_STRUCTURE;
            element.Population = 0;
            element.Dogs = 0;
            element.Cats = 0;
            element.Males = 0;
            element.Females = 0;
            index = data.length;
            data.push(element);
        }
        data[index].Population += parseInt(g.data[i].RES_CNT);
        data[index].Dogs += parseInt(g.data[i].DOG_CNT);
        data[index].Cats += parseInt(g.data[i].CAT_CNT);
        data[index].Males += parseInt(g.data[i].MALE_CNT);
        data[index].Females += parseInt(g.data[i].FEMALE_CNT);
    }
    data.sort(function(a,b) { return d3.descending(a.COMM_STRUCTURE,b.COMM_STRUCTURE); });    

    // the various parallel dimensions we're charting the data with
    // probably could do generate this automatically (particularly for all numeric values) but for now this will do
    var dimensions = [{
        name: "COMM_STRUCTURE",
        scale: d3.scalePoint().range([g.height,10]),
        type: "string",
        domain: data.map(function(d) { return d.COMM_STRUCTURE; }),
        ticks: data.map(function(d) { return d.COMM_STRUCTURE; }).length
    },{
        name: "Population",
        scale: d3.scaleLinear().range([g.height, 10]),
        type: "number",
        domain: [0.0, d3.max(data, function(d) { return d.Population; })],
        ticks: 4
    },{
        name: "Females",
        scale: d3.scaleLinear().range([g.height, 10]),
        type: "number",
        domain: [0.0, d3.max(data, function(d) { return d.Females; })],
        ticks: 4
    },{
        name: "Males",
        scale: d3.scaleLinear().range([g.height, 10]),
        type: "number",
        domain: [0.0, d3.max(data, function(d) { return d.Males; })],
        ticks: 4    
    },{
        name: "Dogs",
        scale: d3.scaleLinear().range([g.height, 10]),
        type: "number",
        domain: [0.0, d3.max(data, function(d) { return d.Dogs; })],
        ticks: 4
    },{
        name: "Cats",
        scale: d3.scaleLinear().range([g.height, 10]),
        type: "number",
        domain: [0.0, d3.max(data, function(d) { return d.Cats; })],
        ticks: 4
    }]; 

    // use x to scale where we will place each dimension horizontally
    var x = d3.scalePoint()
        .domain(dimensions.map(function(d) { return d.name; }))
        .range([0,g.width]);

    var line = d3.line()
        .defined(function(d) { return !isNaN(d[1]); });

    // create the svg block
    var grp = g.svg.append("g")
        .attr("transform", "translate(" + g.margin.left + "," + g.margin.top + ")");
    
    // label each axis
    var dimension = grp.selectAll(".dimension")
        .data(dimensions)
      .enter().append("g")
        .attr("class", "dimension")
        .attr("transform", function(d) { return "translate(" + x(d.name) + ")"; });

    // also setup how we'll map each dimensions
    dimensions.forEach(function(dimension) {
        dimension.scale.domain(dimension.domain);
    });

  // draw paths - we'll do this twice, once for the background, inactive lines; another for the foreground coloured lines
  grp.append("g")
      .attr("class", "background")
    .selectAll("path")
      .data(data)
    .enter().append("path")
      .attr("d", draw);

  grp.append("g")
      .attr("class", "foreground")
    .selectAll("path")
      .data(data)
    .enter().append("path")
      .attr("d", draw)
      .attr("class",function(d){ return d.COMM_STRUCTURE; });

    // draw the axes and labels
  dimension.append("g")
      .attr("class", "axis")
      .each(function(d) { d3.select(this).call(d3.axisLeft(d.scale).tickPadding(4).ticks(d.ticks)); })
      .call(customAxis)
    .append("text")
      .attr("class", "title")
      .attr("text-anchor", "middle")
      .attr("y", -9)
      .text(function(d) { return d.name; });
    
  var ordinal_labels = grp.selectAll(".axis text")
      .on("mouseover", mouseover)
      .on("mouseout", mouseout);

  // setup mouseovers events
  var projection = grp.selectAll(".background path,.foreground path")
      .on("mouseover", mouseover)
      .on("mouseout", mouseout);

  // used to highlight the path that is being hovered over
  function mouseover(d) {
    g.svg.classed("active", true);
    if (typeof d === "string") {
        projection.classed("inactive", function(p) { return p.name !== d; });
        projection.filter(function(p) { return p.name === d; }).each(moveToFront);
        ordinal_labels.classed("inactive", function(p) { return p !== d; });
        ordinal_labels.filter(function(p) { return p === d; }).each(moveToFront);
    } else {
        projection.classed("inactive", function(p) { return p !== d; });
        projection.filter(function(p) { return p === d; }).each(moveToFront);
        ordinal_labels.classed("inactive", function(p) { return p !== d.name; });
        ordinal_labels.filter(function(p) { return p === d.name; }).each(moveToFront);
    }
  }

    function mouseout(d) {
        g.svg.classed("active", false);
        projection.classed("inactive", false);
        ordinal_labels.classed("inactive", false);
    }
    
    function customAxis(g)
    {
        g.selectAll("text")
            .attr("x",-4)
            .attr("dy",12);
    }

    function moveToFront() {
        this.parentNode.appendChild(this);
    }

    function draw(d) {
        return line(dimensions.map(function(dimension) {
            return [x(dimension.name), dimension.scale(d[dimension.name])];
        }));
    }
    
} // end setup