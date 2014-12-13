final_project
=============
What Works:
The general idea was to display the median household income as a choropleth map to establish where the need for nonprofit services is. The nonprofits have been filtered to include only human services organizations (as classified by the IRS) and organized in a CSV file with latitude and longitude obtained through the Google API by address.

I got the choropleth to work and the nonprofit data parsed properly by the parseMetaData function.
This was achieved through converting shapefiles to JSON data for the choropleth, and acquiring lats and longs from Google. The year slider is also appearing with the correct range included.

What Doesn't:
The nonprofit data is not being plotted on the map and does not interface with the year slider.
Lastly, the About button is an implementation of Bootstrap's modal but is not really working properly. When the page first loads, the About modal covers the screen, but when you click About, the intro text disappears.
