var resumeApp = angular.module('resumeApp', []);

resumeApp.controller('ResumeController', function ResumeController($scope) {
  $scope.loadDependencies = function() {
    promises = []
    var countriesPromise = $.getJSON("data/countries.geo.json");
    var experiencePromise = $.getJSON("data/experience.json");
    promises.push(countriesPromise);
    promises.push(experiencePromise);
    Promise.all(promises).then(function(result) {
      $scope.countriespolygons = result[0];
      $scope.experience = result[1];
      $scope.showExperiences();
      $scope.$apply();
      $('[data-toggle="tooltip"]').tooltip()
    });

  }
  $scope.inializeMap = function() {
    $scope.map = L.map('map').setView([30.0444, 31.2357], 2);
    var CartoDB_Voyager = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
      subdomains: 'abcd',
      maxZoom: 19
    });
    $scope.layer = CartoDB_Voyager.addTo($scope.map);
    // $scope.layer = L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
    //   maxZoom: 18,
    //   attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    // }).addTo($scope.map);
    $scope.geojsonlayer = L.geoJSON(null, {
      style: function(feature) {
        if (feature.exp) {
          if (feature.exp.experienceType == "work")
            return {
              "color": "#4A14CC",
              "weight": 2,
              "fillOpacity": 0.1,
              "fill": true,
              "dashArray": [1, 2, 3, 4, 4, 5, 6]
            }
          else if (feature.exp.experienceType == "bornAndRaised")
            return {
              "color": "#817799",
              "weight": 2,
              "fillOpacity": 0.1,
              "fill": true,
              "dashArray": [1, 2, 3, 4, 4, 5, 6]
            }
          else if (feature.exp.experienceType == "study")
            return {
              "color": "#E6FF00",
              "weight": 2,
              "fillOpacity": 0.1,
              "fill": true,
              "dashArray": [1, 2, 3, 4, 4, 5, 6]
            }
        } else if (feature.proj) {
          return {
            "color": "#00FF00",
            "weight": 2,
            "fillOpacity": 0.1,
            "fill": true,
            "dashArray": [1, 2, 3, 4, 4, 5, 6]
          }
        } else return {
          color: "#000000"
        }
      }
    }).addTo($scope.map);
    $scope.markersLayer = L.markerClusterGroup({
      iconCreateFunction: function(cluster) {
        var childCount = cluster.getChildCount();

        return L.divIcon({
          className: 'markermultiicon',
          html: '<div><img src="img/multi.png" ><span>' + childCount + '</span></img></div>'
        });
      }
    });
    // $scope.markersLayer.addLayer(L.marker(getRandomLatLng($scope.map)));
    $scope.map.addLayer($scope.markersLayer);
  }
  $scope.load = function() {
    $scope.filterExperiences = "all"
    $scope.fiterTime = "all"
    $scope.inializeMap();
    $scope.loadDependencies();
    $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function() {
      if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
        var target = $(this.hash);
        target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
        if (target.length) {
          $('html, body').animate({
            scrollTop: (target.offset().top)
          }, 1000, "easeInOutExpo");
          return false;
        }
      }
    });

    // Closes responsive menu when a scroll trigger link is clicked
    $('.js-scroll-trigger').click(function() {
      $('.navbar-collapse').collapse('hide');
    });

    // Activate scrollspy to add active class to navbar items on scroll
    $('body').scrollspy({
      target: '#sideNav'
    });
  }
  $scope.selectAllClicked = function() {
    $scope.filterExperiences = "all";
    $scope.showExperiences();
  }
  $scope.selectEducationClicked = function() {
    $scope.filterExperiences = "education";
    $scope.showExperiences();
  }
  $scope.selectWorkClicked = function() {
    $scope.filterExperiences = "work";
    $scope.showExperiences();
  }
  $scope.getCountryPolygon = function(countryName) {
    return $scope.countriespolygons.features.find(c => c.properties.name.toLowerCase().trim() == countryName.toLowerCase().trim())
  }
  $scope.experienceItemClicked = function(item) {
    if (item == "all")
      $scope.fiterTime = "all";
    else
      $scope.fiterTime = item.from;
    $scope.showExperiences();
  }
  $scope.workIconUrl = "img/work.png"
  $scope.babyIconUrl = "img/baby.png"
  $scope.uniIconUrl = "img/uni.png"
  $scope.projectIconUrl = "img/project.png"
  $scope.getMarkerIcon = function(type) {
    iconUrl = ""
    switch (type) {
      case "work":
        iconUrl = $scope.workIconUrl
        break;
      case "bornAndRaised":
        iconUrl = $scope.babyIconUrl
        break;
      case "study":
        iconUrl = $scope.uniIconUrl
        break;
      case "project":
        iconUrl = $scope.projectIconUrl
        break;
      default:

    }
    var icon = L.icon({
      iconUrl: iconUrl,
      iconSize: [32, 32], // size of the icon
    });
    return icon;
  }
  $scope.addLocationToMap = function(location, exp, proj) {
    icontype = exp ? exp.experienceType : "project";
    // $scope.markersLayer.addLayer(marker)
    markerIcon = $scope.getMarkerIcon(icontype)
    var marker = L.marker([location.lat, location.long], {
      icon: markerIcon
    })
    var title = "";
    if (proj) title = "PROJECT";
    else if (exp) {
      switch (exp.experienceType) {
        case "work":
          title = "JOB";
          break;
        case "study":
          title = "EDUCATION";
          break;
        default:
          "";
      }
    }
    var popuphtml = `<div>
                      <div style = "text-align:center"><u><strong>${title}</u></strong></div>
                  <img src = '${markerIcon.options.iconUrl}' style = 'float: left;margin-right: 15px;'></img>`
    if (location.website)
      popuphtml += `<strong><a href= "${location.website}" target = "_blank">${location.place}</a> </strong>, ${location.city}<br/>`;
    else popuphtml += `<strong>${location.place} </strong>, ${location.city}<br/>`;

    if (exp)
    {
      var description = location.description ? location.description : exp.description;
      popuphtml += `<u>Description: </u>${description}<br/>
                  ${exp.from} ${exp.to? "to " +exp.to:""}
                  </div>`;
    }
    else {
      popuphtml += `<u>Project name:</u> <a href = "${proj.website}" target= "_blank">${proj.name}</a><br/>
  					<u>Description:</u>${proj.description}`;
      if (proj.tools)
        popuphtml += `<br/><u>Tools used:</u> ${proj.tools.join(", ")}`;
    }
    marker.bindPopup(popuphtml)
    $scope.markersLayer.addLayer(marker)
    var country = $scope.getCountryPolygon(location.country)
    if (country) {
      country.exp = exp
      country.proj = proj
      $scope.geojsonlayer.addData(country);
    }
  }
  $scope.showExperiences = function() {
    $scope.markersLayer.clearLayers()
    $scope.geojsonlayer.clearLayers()
    $scope.experience.forEach(function(exp) {
      if ($scope.fiterTime == "all" || $scope.fiterTime == exp.from) {
        switch (exp.experienceType) {
          case "bornAndRaised":
            if ($scope.filterExperiences == "all" && exp.location)
              $scope.addLocationToMap(exp.location, exp)
            break;
          case "study":
            if (($scope.filterExperiences == "all" || $scope.filterExperiences == "education") && exp.locations)
              exp.locations.forEach(function(loc) {
                $scope.addLocationToMap(loc, exp)
              });
            break;
          case "work":
            if (($scope.filterExperiences == "all" || $scope.filterExperiences == "work") && exp.location) {
              $scope.addLocationToMap(exp.location, exp)
              exp.projects.forEach(function(proj) {
                if (proj.location)
                  $scope.addLocationToMap(proj.location, null, proj)
              });
            }
            break;
          default:
        }
      }
    });
    if ($scope.geojsonlayer.getLayers().length > 0)
      $scope.map.fitBounds($scope.geojsonlayer.getBounds());
  }
});
