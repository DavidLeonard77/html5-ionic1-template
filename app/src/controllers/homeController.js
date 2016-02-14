'use strict';

/**
 * @ngdoc function
 * @name Html5IonicTemplate.controller:HomeController
 * @description
 * # HomeController
 */
module.exports = [
    '$scope',
    'ApiService',
    'DataService',

    function(
      $scope,
      ApiService,
      DataService
    ) {

      // Create a database from sql file
      $scope.myHTML = '';
      $scope.fetchData = function() {

        DataService.fetchData('db.sql')

          .then( function(response){
            $scope.myHTML = response;
            $scope.$broadcast('scroll.refreshComplete');

          }, function(error){
            console.log(error);
            $scope.$broadcast('scroll.refreshComplete');
          });

      };
      $scope.fetchData();

      // table columns using SQL OR (template checkbox or radio button elements)
      $scope.selectedCategories = { description: true };

      // table columns using SQL AND (template select element)
      $scope.selectedFilters = { unit: '', gpm: '0.4' };

      // Search
      $scope.searchResults = [];
      $scope.search = function (searchString){

        var searchColumns = $scope.selectedCategories,
            searchFilters = $scope.selectedFilters;

        DataService.searchData(
          searchColumns,  // (obj)    required - { columnName : true/false, .. }
          searchString,   // (string) required - Search string
          searchFilters,  // (obj)    optional - { filterName : 'value', .. }
          false           // (bool)   optional - asyncronous queries
        )

          .then(function(result){
            $scope.searchResults = result;

          },function(error){
            console.log(error);
          });

      };



    }
];
