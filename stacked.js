// create the neighbourhood population bar chart
function setup_stacked() {
    
    // set the chart's title
    $("div.header").text("Population of Calgary's Sectors");
    
    // get the group, and offset by margins
    var grp = g.svg.append('g')
        .attr("transform","translate(" + g.margin.left + "," + g.margin.top + ")");            

    // find total for each sector
    var total = [];
    for (var i=0; i<g.data.length; i++) {   
        var index = findWithinArray(total, "name", g.data[i].SECTOR);
        if (index < 0) {
            var element = {};
            element.name = g.data[i].SECTOR;
            element.population = 0;
            element.neighbourhoods = [];        
            element.runningpopulation = [];
            index = total.length;
            total.push(element);
        }
        total[index].runningpopulation.push(total[index].population);
        total[index].population += parseInt(g.data[i].RES_CNT);
        total[index].neighbourhoods.push(g.data[i].NAME);                
    }    
    var sectors = total.map(function(d) { return d.name; });

    // setup scales
    var x = d3.scaleBand().rangeRound([0, g.width]).padding(.05)
        .domain(sectors);
    var y = d3.scaleLinear().range([g.height,0])
        .domain([0, d3.max(total, function(d) { return d.population; })]);

    // setup the colour scale
    var maxpop = d3.max(g.data, function(d) { return parseInt(d.RES_CNT); });
    var colour = d3.scaleLinear().domain([0,maxpop])
        .interpolate(d3.interpolateLab)
        .range([d3.rgb("#002ACC"), d3.rgb("#DDD500")]);                

    // draw x axis
    grp.append('g')
        .attr("class","axis axis--x")
        .attr("transform", "translate(0," + g.height + ")")
        .call(d3.axisBottom(x))
    // add a label
    g.svg.append('text')
        .attr("transform", "translate(" + (g.width/2) + ", " + (g.height + g.margin.top + 50) + ")")
        .attr('dx', '1em')
        .attr('text-anchor','left')
        .text("Sector");

    // draw y axis
    grp.append("g")
        .attr("class","axis axis--y")
        .call(d3.axisLeft(y).ticks(10))
    // add a label
    g.svg.append("text")
        .attr("transform","rotate(-90)")
        .attr("y",0)
        .attr("x",0 - (g.height / 2))
        .attr("dy", "1em")
        .attr("text-anchor", "middle")
        .text("Population");    

    // colour legend
    var lgrp = g.svg.append('g')
        .attr("transform","translate(" + g.margin.left + "," + g.margin.top + ")");
    // draw a colour legend
    lgnd = [ {pop:0,colour:colour(0)},
             {pop:1*maxpop/6,colour:colour(1*maxpop/7)},
             {pop:2*maxpop/6,colour:colour(2*maxpop/7)},
             {pop:3*maxpop/6,colour:colour(3*maxpop/7)},
             {pop:4*maxpop/6,colour:colour(4*maxpop/7)},
             {pop:5*maxpop/6,colour:colour(5*maxpop/7)},
             {pop:maxpop,colour:colour(maxpop)} ];

    var legendboxlength = 20; // size of the legend square
    lgrp.selectAll('.lgndsqr')
        .data(lgnd)
        .enter().append("rect")
            .attr("class","lgndsqr")
            .attr("y", function(d,i) { return y(0) - 2.3*legendboxlength - 1.5*legendboxlength*i; })
            .attr("x", g.width+30)
            .attr("width", function(d,i) { return legendboxlength; })
            .attr("height", function(d,i) { return legendboxlength; })
            .attr("fill", function(d) { return d.colour; });

    lgrp.selectAll("text")
        .data(lgnd)
        .enter().append('text')
            .attr("x", g.width+66+legendboxlength)
            .attr("y", function(d,i) { return y(0) - 2*legendboxlength - 1.5*legendboxlength*i; })
            .attr("dy", ".8em")
            .attr("font-size", "12px")
            .attr("text-anchor", "end")
            .text(function (d) { return Math.round(d.pop); });
    lgrp.append('rect')
            .attr("x", g.width+25)
            .attr("y", y(0) - 1.5* lgnd.length * (legendboxlength+6) )
            .attr("width", 3.7*legendboxlength)
            .attr("height",1.5*legendboxlength*(lgnd.length+1.5))
            .attr("fill",'none')
            .attr("stroke-width",'1')
            .attr("stroke",'black');
    lgrp.append('text')
            .attr("x", g.width+30)
            .attr("y", y(0) - 1.5* lgnd.length * (legendboxlength+6) +16 )
            .attr("dy", ".8em")
            .attr("font-size", "14px")
            .text("Population");

    // draw the bars
    grp.selectAll('.bar')
        .data(g.data)
        .enter().append('rect')
            .attr("class", "bar")
            .attr("x", function(d) { return x(d.SECTOR); })
            .attr("y", function(d) { 
                    var index1 = findWithinArray(total, "name", d.SECTOR);
                    var index2 = total[index1].neighbourhoods.indexOf(d.NAME);
                    return y(total[index1].runningpopulation[index2] + parseInt(d.RES_CNT)); 
                })
            .attr("width", x.bandwidth())
            .attr("name", function(d) { return d.SECTOR + " - " + d.NAME; })
            .attr("height", function(d) { return g.height - y(parseInt(d.RES_CNT)); })
            .attr("population", function(d) { return d.RES_CNT; })
            .attr("rpopulation", function(d) { 
                var index1 = findWithinArray(total,"name",d.SECTOR);
                var index2 = total[index1].neighbourhoods.indexOf(d.NAME);
                return total[index1].runningpopulation[index2]; 
            })
            .attr("fill", function(d){ return colour(parseInt(d.RES_CNT)); })
            .append("svg:title")
            .text(function(d) { return d.NAME + ", " + d.RES_CNT + " residents"; });
}