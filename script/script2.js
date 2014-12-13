//How to implement a slider
//This is a placeholder dataset, you'll need to swap in your own dataset
/*
 var sliderValues = [
 {year:2005, value:203},
 {year:2006, value:201},
 {year:2007, value:303},
 {year:2008, value:234},
 {year:2009, value:103},
 {year:2010, value:21}
 ];
 */

var margin = {t: 50, l: 50, b: 50, r: 50},
    width = $('.canvas').width() - margin.l - margin.r,
    height = $('.canvas').height() - margin.t - margin.b;

var rootSvg = d3.select('.canvas')
    .append('svg')
    .attr('width', width + margin.l + margin.r)
    .attr('height', height + margin.t + margin.b);
var svg = rootSvg
    .append('g')
    .attr('transform', "translate(" + margin.l + "," + margin.t + ")");

//var center = d3.geo.centroid(json); //center on MI instead

var projection = d3.geo.albersUsa()
    .translate([width / 2, height / 2]);
//    .scale(scale).center(center);

var path = d3.geo.path()
    .projection(projection);

var rateById = d3.map();

var scaleColor = d3.scale.linear().domain([0, 0.15]).range(["#fff", "red"]);

//zoom behavior
var zoom = d3.behavior.zoom()
    .translate([margin.l, margin.t])
    .scale(1)
    .scaleExtent([1, 5])
    .on('zoom', zoomed);

rootSvg.call(zoom);

//import data
queue()
    .defer(d3.json, "data/medianhhincome.geojson")
    .defer(d3.csv, "data/nonprofits.csv", parseMetaData)
    .await(function (err, blocks, counties, states) {

        draw(blocks, counties, states);
    });

function draw(blocks, counties, states) {

    svg.selectAll('.blocks')
        .data(blocks.features)
        .enter()
        .append('path')
        .attr('class', 'block')
        .attr('d', path)
        .style('fill', function (d) {
            var id = (+d.properties.STATE) + d.properties.COUNTY + d.properties.COUNTY,
                rate = d.medhhinc;
            return scaleColor(rate);
        })
        .on('click', onClick);


    svg.selectAll('.counties')
        .data(counties.features)
        .enter()
        .append('path')
        .attr('class', 'county')
        .attr('d', path)
        .style('fill', function (d) {
            var id = (+d.properties.STATE) + d.properties.COUNTY,
                rate = medhhinc;
            return scaleColor(rate);
        })
        .on('click', onClick);

    svg.append('path')
        .attr('class', 'state')
        .datum(states)
        .attr('d', path);


}

function parse(d) {
///    console.log(d.features);
    var newRow = {};

    var key, val, i, len;
    for (val = i = 0, len = d.features.length; i < len; val = ++i) {
        key = d.features[val];
        console.log(key.properties);
        newRow.medhhinc = (key.properties["Med_HH_Inc"]),
            newRow.medfaminc = (key.properties["Med_Fam_In"]),
            newRow.totalfam = (key.properties["Total_FamH"]),
            newRow.totalhh = (key.properties["Total_HH"]),
            newRow.totalnonfam = (key.properties["Tot_NonFam"]);
    }
    console.log(newRow);
    return(newRow);
}


function parseMetaData(d) {
    var newRow = {};

    newRow.organization = d.NAME,
        newRow.ein = d.EIN,
        newRow.ntee = (d["NTEE_CD"]),
        newRow.year = (d["RULING_YEAR"]),
        newRow.month = (d["RULING_MONTH"]),
        newRow.income = (d["INCOME_AMT"]),
        newRow.assets = (d["ASSET_AMT"]),
        newRow.revenue = (d["REVENUE_AMT"]);
    console.log(newRow);
    return(newRow);
};

function onClick(d) {
    console.log(d);
    var bounds = path.bounds(d.geometry);
    var x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1];

    //scale factor is determined by the proportion of dx vs. width, and dy vs. height
    var scaleFactor = Math.min(width / dx, height / dy) / 4;
    var translate = [margin.l + width / 2 - scaleFactor * x, margin.t + height / 2 - scaleFactor * y];

    //
    zoom.translate(translate).scale(scaleFactor);
    svg.transition()
        .duration(2000)
        .call(zoom.event);
}

function zoomed() {

    svg
        .attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
    svg.selectAll('.county')
        .style('stroke-width', .5 / d3.event.scale + 'px');
    svg.selectAll('.state')
        .style('stroke-width', 1 / d3.event.scale + 'px');
}

/*
 function onMouseEnter(d){
 var x = scales.x(d.gdpPerCap) + margin.l,
 y = height+ margin.b - scales.y(d.life) + 10;
 var $tooltip = $('.tooltip');

 var w = $tooltip
 .append('<h3>'+d.country+'</h3>')
 .outerWidth();

 $tooltip.css({
 visibility:"visible",
 bottom: y + "px",
 left: x - w/2 + "px"
 });
 }
 */

/*
 function onMouseLeave(d){
 d3.select('.tooltip')
 .style('visibility','hidden')
 .selectAll('h3')
 .remove();
 }
 */
