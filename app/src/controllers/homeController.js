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
      $scope.searchCategories = { description: true };

      // table columns using SQL AND (template select element)
      $scope.searchFilters = { unit: '', gpm: '' };

      // Search
      $scope.searchInput = { value: '' };
      $scope.searchResults = [];
      $scope.search = function (){

        var searchColumns = $scope.searchCategories,
            searchFilters = $scope.searchFilters,
            _searchString = $scope.searchInput.value;

        DataService.searchData(
          searchColumns,  // (obj)    required - { columnName : true/false, .. }
          _searchString,  // (string) required - Search string
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
