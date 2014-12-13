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

var nonprofitData;

var scaleColor = d3.scale.linear().domain([0, 100000]).interpolate(d3.interpolateLab).range(["red", "blue"]);
//console.log("cols", scaleColor);
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
//    .defer(d3.csv, "data/nonprofits.csv", parseMetaData())
    .await(function (err, geo) {
        draw(geo);
    });

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


}
function updateYear(newYearVal) {
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

function parseMetaData(d) {
    console.log("----------------------------------", d);
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
    for (var i = 0; i <= newRow.length; i++) {
        var nonprofits = [
            {
                name: name,
                key: key,
                coordinates: [lat, long],
                year: year,
                revenue: revenue
            }
        ]
    }

//console.log(newRow);
    for (var i = 0; i <= newRow.length; i++) {
        var nonprofits = [
            {
                name: name,
                key: key,
                coordinates: [lat, long],
                year: year,
                revenue: revenue
            }
        ]
    }

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
// $( "#modal" ).dialog();
// $('#modal').modal()                      // initialized with defaults
// $('#modal').modal({ keyboard: false })   // initialized with no keyboard
$(document).ready(function () {
    //$('#dialog').dialog(); 
    $('#about').click(function () {
        $('#modal').dialog();
        $("#modal").dialog({
            width: 500,
            position: { my: "center", at: "center"}
        });

        console.log($("#modal"));
        $('#modal').dialog('open');
        return false;
    });
});
// BootstrapDialog.show({
//     title: 'Say-hello dialog',
//     message: 'Hi Apple!'
// });