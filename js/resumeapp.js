var resumeApp = angular.module('resumeApp', []);

resumeApp.controller('ResumeController', function ResumeController($scope) {
  $scope.loadDependencies = function(){
    promises = []
    var countriesPromise = $.getJSON("data/countries.geo.json");
    var experiencePromise = $.getJSON("data/experience.json");
    promises.push(countriesPromise);
    promises.push(experiencePromise);
    Promise.all(promises).then(function(result){
      $scope.countriespolygons = result[0];
      $scope.experience = result[1];
      $scope.showExperiences();
      $scope.$apply();
      $('[data-toggle="tooltip"]').tooltip()
    });

  }
  $scope.inializeMap = function(){
    $scope.map = L.map('map').setView([30.0444, 31.2357], 2);
    //mymap.on('load', onMapLoad);
    var Esri_OceanBasemap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}', {
      	attribution: 'Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri',
      	maxZoom: 13
      });
      $scope.layer = Esri_OceanBasemap.addTo($scope.map);
    // $scope.layer = L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
    //   maxZoom: 18,
    //   attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    // }).addTo($scope.map);
    $scope.geojsonlayer = L.geoJSON(null, {
        style: function(feature) {
          if(feature.exp)
          {
            if(feature.exp.experienceType == "work")
              return {color: "#4A14CC"}
            else if(feature.exp.experienceType == "bornAndRaised")
              return {color: "#817799"}
            else if(feature.exp.experienceType == "study")
                return {color: "#E6FF00"}
          }
          else if (feature.proj){
            return {color: "#00FF00"}
          }
          else return {color: "#000000"}
        }
    }).addTo($scope.map);
    $scope.markersLayer = L.markerClusterGroup(
      {
        iconCreateFunction: function(cluster) {
        var childCount = cluster.getChildCount();

            return L.divIcon({className: 'markermultiicon', html: '<div><img src="img/multi.png" ><span>' + childCount + '</span></img></div>'});
        }
        }
      );
    // $scope.markersLayer.addLayer(L.marker(getRandomLatLng($scope.map)));
    $scope.map.addLayer($scope.markersLayer);
  }
  $scope.load = function() {
      $scope.filterExperiences = "all"
      $scope.fiterTime = "all"
      $scope.inializeMap();
      $scope.loadDependencies();
  }
  $scope.selectAllClicked = function(){
    $scope.filterExperiences = "all";
    $scope.showExperiences();
  }
  $scope.selectEducationClicked = function(){
    $scope.filterExperiences = "education";
    $scope.showExperiences();
  }
  $scope.selectWorkClicked = function(){
    $scope.filterExperiences = "work";
    $scope.showExperiences();
  }
  $scope.getCountryPolygon = function(countryName){
    return $scope.countriespolygons.features.find(c=>c.properties.name.toLowerCase().trim() == countryName.toLowerCase().trim())
  }
  $scope.experienceItemClicked = function(item){
    if(item == "all")
      $scope.fiterTime = "all";
    else
      $scope.fiterTime = item.from;
    $scope.showExperiences();
  }
  $scope.workIconUrl = "img/work.png"
  $scope.babyIconUrl = "img/baby.png"
  $scope.uniIconUrl = "img/uni.png"
  $scope.projectIconUrl = "img/project.png"
  $scope.getMarkerIcon = function(type){
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

      iconSize:     [32, 32], // size of the icon
      // shadowSize:   [50, 64], // size of the shadow
      // iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
      // shadowAnchor: [4, 62],  // the same for the shadow
      // popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
    });
    return icon;
  }
  $scope.addLocationToMap = function(location, exp, proj){
    icontype = exp ? exp.experienceType : "project";
    // $scope.markersLayer.addLayer(marker)
    markerIcon = $scope.getMarkerIcon(icontype)
    var marker = L.marker([location.lat, location.long],{icon: markerIcon})//.addTo($scope.map);
    var popuphtml = `<div>
                  <img src = '${markerIcon.options.iconUrl}' style = 'float: left;margin-right: 15px;'></img>`
	if(location.website)
		popuphtml += `<strong><a href= "${location.website}" target = "_blank">${location.place}</a> </strong>, ${location.city}<br/>`;
    else popuphtml += `<strong>${location.place} </strong>, ${location.city}<br/>`
    if(exp) popuphtml+=`<u>Description: </u>${exp.description}<br/>
				
                  ${exp.from} ${exp.to? "to " +exp.to:""}
                  
                  </div>`
	else 
	{
		popuphtml += `<u>Project:</u> <a href = "${proj.website}" target= "_blank">${proj.name}</a><br/>
					<u>Description:</u>${proj.description}`;
		if(proj.tools)
			popuphtml+= `<br/><u>Tools used:</u> ${proj.tools.join(", ")}`;
	}
    marker.bindPopup(popuphtml)
    $scope.markersLayer.addLayer(marker)
    var country = $scope.getCountryPolygon(location.country)
    console.log(country)
    if(country)
    {
      country.exp = exp
      country.proj = proj
      $scope.geojsonlayer.addData(country);
      //console.log(country)
    }
  }
  $scope.showExperiences = function(){
    $scope.markersLayer.clearLayers()
    $scope.geojsonlayer.clearLayers()
    $scope.experience.forEach(function(exp){
      if($scope.fiterTime == "all" || $scope.fiterTime == exp.from)
      {
          switch (exp.experienceType) {
            case "bornAndRaised":
              if($scope.filterExperiences == "all" && exp.location)
                $scope.addLocationToMap(exp.location, exp)
              break;
            case "study":
              if(($scope.filterExperiences == "all" || $scope.filterExperiences == "education") && exp.locations)
                exp.locations.forEach(function(loc){
                  $scope.addLocationToMap(loc, exp)
                });
              break;
            case "work":
              if(($scope.filterExperiences == "all" || $scope.filterExperiences == "work") && exp.location)
                {
                  $scope.addLocationToMap(exp.location, exp)
                  exp.projects.forEach(function(proj){
                    if(proj.location)
                      $scope.addLocationToMap(proj.location, null,proj)
                  });
                }
              break;
            default:
          }
        }
    });
    if($scope.geojsonlayer.getLayers().length > 0)
      $scope.map.fitBounds($scope.geojsonlayer.getBounds());
  }
});
