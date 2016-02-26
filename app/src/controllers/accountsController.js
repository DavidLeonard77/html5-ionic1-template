'use strict';

/**
 * @ngdoc function
 * @name Html5IonicTemplate.controller:HomeController
 * @description
 * # HomeController
 */
module.exports = [
    '$scope',
    '$state',
    'UserService',
    function(
      $scope,
      $state,
      UserService
    ) {

      UserService.findById(0).then(function(user){
        $scope.user = user;
        console.log('here',$scope.user);
      });

      $scope.moveItem = function (fromIndex, toIndex) {
        var item = $scope.user.accounts.splice(fromIndex, 1);
        $scope.user.accounts.splice(toIndex, 0, item[0]);
        UserService.saveUser($scope.user);
      };

      $scope.deleteItem = function (index) {
        $scope.user.accounts.splice(index, 1);
        UserService.saveUser($scope.user);
      };

      $scope.openAccount = function (index) {
        console.log(index);
        $state.go('app.input',{
          account: index,
          business: $scope.user.accounts[index].opportunity,
        });
      };

    }
];
