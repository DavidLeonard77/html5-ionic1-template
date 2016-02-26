'use strict';

/**
 * @ngdoc function
 * @name Html5IonicTemplate.controller:MainController
 * @description
 * # MainController
 */
module.exports = [
    '$scope',
    'UserService',
    function(
      $scope,
      UserService
    ) {
      UserService.init().then(function(){
        $scope.$broadcast('usersFetched');
      },function(e){
        console.log(e);
      });
    }
];
