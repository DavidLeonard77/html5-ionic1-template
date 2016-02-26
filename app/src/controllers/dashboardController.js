'use strict';

/**
 * @ngdoc function
 * @name Html5IonicTemplate.controller:dashboardController
 * @description
 * # dashboardController
 */
module.exports = [
    '$scope',
    'UserService',

    function(
      $scope,
      UserService
    ) {

      $scope.myHTML = '';


      $scope.myHTML = '';
      UserService.init().then(function(users){
        $scope.users = users;
        console.log(users);
      },function(e){
        console.log(e);
      });

    }
];
