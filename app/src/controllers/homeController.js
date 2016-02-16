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

      $scope.myHTML = '';



      // Create a database from sql file
      $scope.fetchData = function() {

        var startTime = new Date();
        DataService.fetchData('db.sql')

          .then(function(response){
            $scope.myHTML = 'Database ' + response + ' created in ' + ((new Date() - startTime) / 1000) + ' seconds';
            $scope.$broadcast('scroll.refreshComplete');

          },function(error){
            console.log(error);
            $scope.$broadcast('scroll.refreshComplete');
          });

      };
      $scope.fetchData();



      // Search
      $scope.searchInput = { value: '' };
      $scope.searchCategories = { description: true };
      $scope.searchFilters = { unit: '', gpm: '' };
      $scope.searchResults = [];
      $scope.search = function (){

        // Because we are searching for the same value across all checked inputs
        // we assign the same string to each if selected
        var searchCategories = {};
        angular.forEach($scope.searchCategories, function(value, category){
          if (value) {
            searchCategories[category] = $scope.searchInput.value;
          }
        });

        // Build a SQL query
        var categoryQuery = DataService.getQuery(searchCategories, 'OR'),
            filterQuery = DataService.getQuery($scope.searchFilters, 'AND'),
            query = categoryQuery +
                    (categoryQuery && filterQuery ? 'AND' : '') +
                    filterQuery;

        console.log(query);

        // Search a table
        var startTime = new Date();
        DataService.searchData(
          'products',                // (string) rewuired - Database table
          query,                     // (string) required - SQL query
          50,                        // (int)    optional - Results limit
          false                      // (bool)   optional - Asyncronous queries
        )

          .then(function(results){
            $scope.myHTML = 'Results found in ' + ((new Date() - startTime) / 1000) + ' seconds';
            $scope.searchResults = results;

          },function(error){
            console.log(error);
          });

      };



    }
];
