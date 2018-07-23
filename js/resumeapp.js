var resumeApp = angular.module('resumeApp', []);

resumeApp.controller('ResumeController', function ResumeController($scope) {
  $scope.load = function() {
      var map = L.map('map').setView([30.0444, 31.2357], 2);
      L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);
      // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      //     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      // }).addTo(map);
    $scope.experienceItemClicked = function(item){

    }
    $.getJSON("data/experience.json", function(result){
      $scope.experience = result;
      $scope.$apply();
      $('[data-toggle="tooltip"]').tooltip()
    }).fail(function() {
      alert( "error" );
    })
  }
});
