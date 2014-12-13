//How to implement a slider
//This is a placeholder dataset, you'll need to swap in your own dataset
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

var projection = d3.geo.mercator()
    .translate([width / 2, height / 2])
    .center([-83.0458, 42.3314])
    .scale(30000);

var path = d3.geo.path()
    .projection(projection);

var rateById = d3.map();

var scaleColor = d3.scale.linear().domain([0, 100000]).interpolate(d3.interpolateLab).range(["red", "blue"]);
//console.log("cols", scaleColor);
//zoom behavior
// variables to hold button/slider status
var circlesDynamicallySized = false;
var nonprofitFilterVal = 0;

// function to handle button click
function toggleNonprofitSize() {
    circlesDynamicallySized = !circlesDynamicallySized;
    updateNonprofitRadius(nonprofitFilterVal, circlesDynamicallySized);
}

// listener for when our slider is changed
d3.select("#nonprofits").on("input", function() {
    updateNonprofitFilter(+this.value);
});

function capWords(sentence) {
    return sentence.replace(/[^\w](\w)/g,
        function(w){return w.toUpperCase();});
}

// function to handle nonprofits slider movement
function updateNonprofitFilter(newNonprofitVal) {
    // update the text slider
    d3.select("#sliderlabel").text(newNonprofitVal.toLocaleString());

    // update the global var and the slider value
    nonprofitFilterVal = newNonprofitVal;
    d3.select("#nonprofits").property("value", newNonprofitVal);

    // update all the circles
    updateNonprofitRadius(nonprofitFilterVal, circlesDynamicallySized);
}

// function to resize circles
function updateNonprofitRadius(nonprofitFilter, circlesSized) {
    var minRadius = 2.5;
    var nonprofitRadius = 0;

    d3.selectAll(".nonprofit")
        .select("circle")
        .transition(400)
        .attr("r", function(d){
            // should use () ? : syntax here, but line width for blog!
            if (circlesSized) {
                nonprofitRadius = Math.sqrt(d.nonprofits) / 300.0;
            } else {
                nonprofitRadius = minRadius;
            }

            if (d.nonprofits >= nonprofitFilter) {
                return Math.max(nonprofitRadius, minRadius);
            } else {
                return 0;
            }
        });
}
var zoom = d3.behavior.zoom()
    .translate([margin.l, margin.t])
    .scale(1)
    .scaleExtent([1, 5])
    .on('zoom', zoomed);

rootSvg.call(zoom);

function anNonprofitChart() {

    var width = 1100,
        height = 600;

    // functions to translate lat/lon to the svg coordinate space
    var projection = d3.geo.albersUsa()
        .translate([width / 2, height / 2])
        .scale(1100);
    var path = d3.geo.path()
        .projection(projection);

    // insert a master svg element into our div
    var svg = d3.select("#nonprofitcanvas").append("svg")
        .attr("width", width)
        .attr("height", height);

    // create a d3-tip object for better mouseover effects
    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return "<span style='color:#268bd2'>" +
                d.apt + "</span>" + " - " + "<span style='color:#ccc'>" +
                d.name.charAt(0) + capWords(d.name.slice(1).toLowerCase()) +
                "</span><br>" +
                "<span style='color:#268bd2'>2013 Nonprofits: </span>" +
                d.nonprofits.toLocaleString();
        });
    svg.call(tip);


    // asynchronous load of multiple datasets
    queue()
        .defer(d3.csv, "data/nonprofits.csv", parseMetaData(d, sliderval))
        .await(makePlot);  // makePlot will wait until both loaded

    function makePlot(error, nonprofits) {

        // d3 csv's are untyped:  need to coerce elements into numerics
        nonprofits.forEach(function(d) {
            var aptPos = [+d.lon, +d.lat];
            var position = projection(aptPos);
            if (position == null) {
                d.x = -10;  // essentially saying don't plot these
                d.y = -10;
            } else {
                d.x = position[0];
                d.y = position[1];
            }

            d.nonprofits = +d.nonprofits;
        });

        // topojson
        svg.append("path")
            .datum(topojson.feature(us, us.objects.land))
            .attr("class", "land")
            .attr("d", path);
        svg.append("path")
            .datum(topojson.mesh(us, us.objects.states,
                function(a, b) { return a !== b; }))
            .attr("class", "states")
            .attr("d", path);

        // use d3 to insert nonprofits
        var nonprofit = svg.append("g")
            .attr("class", "nonprofitGroup")
            .selectAll("g")
            .data(nonprofits)
            .enter().append("g")
            .attr("class", "nonprofit")
            .append("circle")
            .attr("transform", function(d) {return "translate(" + d.x + "," + d.y + ")";})
            .attr("fill", "#268bd2")
            .style("opacity", 0.8)
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);

        // use d3 to set circle radius based on page variables
        updateNonprofitFilter(nonprofitFilterVal); // this calls updateNonprofitRadius

    }

}

anNonprofitChart();

function draw(geo) {
//    console.log(geo.features);

    svg.selectAll('.blocks')
        .data(geo.features)
        .enter()
        .append('path')
        .attr('class', 'blocks')
        .attr('d', path)
        .style('fill', function (d) {
            if (d.properties.ALAND10 == 0) {
                return "white"
            }
            else {
//            var id = d.properties.GEOID10;
//            rateById = d.properties.Med_HH_Inc;
                return scaleColor(d.properties.Med_HH_Inc)
            }
        })
        .on('click', onClick)


};
queue()
    .defer(d3.csv, "data/nonprofits.csv", parseMetaData)
    .await(function (err, data) {
        update(data);
    });




function updateYear (newYearVal) {
    // update the text slider
    d3.select("#year")
        .text(newYearVal.toLocaleString());

    // update the global var and the slider value
    yearFilterVal = newYearVal;
    d3.select("#yearSlider").property("value", newYearVal);

    // update all the circles
    updateYear(yearFilterVal,
        circlesDynamicallySized);
}

//function drawCircles(sliderValue) {
//    console.log(nonprofitData);
//    svg.selectAll('circle')
//        .data([nonprofitData, sliderValue]).enter()
//        .append("circle")
//        .attr("cx", function (d, i) {
//            return (i + 1) * 25;
//        })
//        .attr("cy", 10)
//        .attr("r", 10)
//        .attr("transform", function () {
//            return "translate(" + projection([d.long, d.lat]) + ")"
//        });
//    //        .filter(function (d) {
////            if (d.year == sliderValue) {
////                return d;
////            }
////        })
////    if (nonprofitData["year"] == sliderValue) {return nonprofitData}
//
//    /*
//     svg.selectAll(".circle")
//     .attr("year", sliderValue)
//     .data(data)
//     .enter()
//     .filter(function (d) {
//     if (d.year == sliderValue) {
//     .append("circle")
//     .attr("transform", function () {
//     return "translate(" + projection([d.long, d.lat]) + ")"
//     })
//     });
//     };
//     */
//}
function parse(d) {
///    console.log(d.features);
    var newRow = {};

    var key, val, i, len;
    for (val = i = 0, len = d.features.length; i < len; val = ++i) {
        newRow.block = (d.features.properties["GEOID10"])
            .county = (d.features.properties["COUNTYFP10"])
            .water = (d.features.properties["AWATER10"])
            .medhhinc = (d.features.properties["Med_HH_Inc"])
            .medfaminc = (d.features.properties["Med_Fam_In"])
            .totalfam = (d.features.properties["Total_FamH"])
            .totalhh = (d.features.properties["Total_HH"])
            .totalnonfam = (d.features.properties["Tot_NonFam"]);
    }
    console.log(newRow);
    return(newRow);
}


function parseMetaData(d) {
    console.log("----------------------------------", d);
//    if d["RLLING YEAR"] == VALUE THEN
    var newRow = {
        name: (d["NAME"]),
        key: d["EIN"],
        ntee: d["NTEE_CD"],
        year: d["RULING_YEAR"],
        month: d["RULING_MONTH"],
        income: d["INCOME_AMT"],
        assets: d["ASSET_AMT"],
        revenue: d["REVENUE_AMT"],
        lat: d["LATS"],
        long: d["LONGS"]
};
//console.log(newRow);
return(newRow);
}

function onClick(d) {
//    console.log(d);
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

    svg.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
    svg.selectAll('.county')
        .style('stroke-width', .5 / d3.event.scale + 'px');
    svg.selectAll('.state')
        .style('stroke-width', 1 / d3.event.scale + 'px');
}

/*
 function onMouseEnter(d){
 var $tooltip = $('.tooltip');

 var w = $tooltip
 .append('
 <h3>'+d.country+'</h3>
 ')
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
 .style('visibility', 'hidden')
 .selectAll('h3')
 .remove();
 }
 */