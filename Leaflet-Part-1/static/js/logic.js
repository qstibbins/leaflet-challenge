
// Create the 'basemap' tile layer that will be the background of our map.
let basemap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});


// OPTIONAL: Step 2
// Create the 'street' tile layer as a second background of the map
let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Create the map object with center and zoom options.
let map = L.map("map", {
  center: [44.98517, -93.30474],
  zoom: 5
});

// Then add the 'basemap' tile layer to the map.
basemap.addTo(map);

// OPTIONAL: Step 2
// Create the layer groups, base maps, and overlays for our two sets of data, earthquakes and tectonic_plates.
// Add a control to the map that will allow the user to change which layers are visible.
let earthquakes = new L.layerGroup();
let tectonic_plates = new L.layerGroup();

let baseMaps = {
  "Base Map": basemap,
  "Street Map": street
};

let overlayMaps = {
  "Earthquakes": earthquakes,
  "Tectonic Plates": tectonic_plates
};

L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(map);




// Make a request that retrieves the earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {

  // This function returns the style data for each of the earthquakes we plot on
  // the map. Pass the magnitude and depth of the earthquake into two separate functions
  // to calculate the color and radius.
  function styleInfo(feature) {
    return {
      color: getColor(feature.geometry.coordinates[2]),
      radius: getRadius(feature.properties.mag),
    }
  }

  // This function determines the color of the marker based on the depth of the earthquake.
  function getColor(depth) {
    var color = "";
    if (depth >= -10 && depth <= 10) {
        return color = "#98ee00";
    }
    else if (depth > 10 && depth <= 30) {
        return color = "#d4ee00";
    }
    else if (depth > 30 && depth <= 50) {
        return color = "#eecc00";
    }
    else if (depth > 50 && depth <= 70) {
        return color =  "#ee9c00";
    }
    else if (depth > 70 && depth <= 90) {
        return color = "#ea822c";
    }
    else if (90 < depth) {
        return color = "#ea2c2c";
    }
    else {
        return color = "black";
    }
  }

  // This function determines the radius of the earthquake marker based on its magnitude.
  function getRadius(magnitude) {
    if (magnitude === 0) {
      return magnitude * 1
    };
    return magnitude * 5
  }

  // Add a GeoJSON layer to the map once the file is loaded.
  L.geoJson(data, {
    // Turn each feature into a circleMarker on the map.
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    // Set the style for each circleMarker using our styleInfo function.
    style: styleInfo, 
    // Create a popup for each marker to display the magnitude and location of the earthquake after the marker has been created and styled
    onEachFeature: function (feature, layer) {
      layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><hr><p>Magnitude: ${feature.properties.mag}</p><hr><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
    }
  // OPTIONAL: Step 2
  // Add the data to the earthquake layer instead of directly to the map.
  }).addTo(earthquakes);

  // Create a legend control object.
  let legend = L.control({
    position: "bottomright"
  });

  // Then add all the details for the legend
  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");

    // Initialize depth intervals and colors for the legend
    let colors = ["#98ee00", "#d4ee00", "#eecc00", "#ee9c00", "#ea822c", "#ea2c2c"]
    let depthRange = [-10, 10, 30, 50, 70, 90];


    // Loop through our depth intervals to generate a label with a colored square for each interval.
    for(let i = 0; i < depthRange.length; i++)
    {
      div.innerHTML += 
      "<i style='background: " + colors[i] + " '></i>"  + 
      depthRange[i] + (depthRange[i + 1] ? "&ndash;" + depthRange[i + 1] + "<br>" : "+");
    }

    return div;
  };

  // Finally, add the legend to the map.
  legend.addTo(map);

  // OPTIONAL: Step 2
  // Make a request to get our Tectonic Plate geoJSON data.
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (plate_data) {
    // Save the geoJSON data, along with style information, to the tectonic_plates layer.
    L.geoJson(plate_data, {
      // Set the style 
      style: {
        color: "orange"
      }
    // OPTIONAL: Step 2
    // Add the data to the earthquake layer instead of directly to the map.
    }).addTo(tectonic_plates);

    // Then add the tectonic_plates layer to the map.
    tectonic_plates.addTo(map);
  });

  earthquakes.addTo(map);
  street.addTo(map);
});
