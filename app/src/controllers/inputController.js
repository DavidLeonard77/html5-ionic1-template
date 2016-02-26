'use strict';

/**
 * @ngdoc function
 * @name Html5IonicTemplate.controller:InputController
 * @description
 * # InputController
 */
module.exports = [
    '$scope',
    '$stateParams',
    'UserService',
    function(
      $scope,
      $stateParams,
      UserService
    ) {

      UserService.findById(0).then(function(user){
        $scope.user = user;
        $scope.account = user.accounts[ parseInt($stateParams.account) ];
        $scope.stages = ['1','2','3','4','5'];
        $scope.businesses = [
          $scope.patientwarming = $scope.account.businesses.patientwarming,
          $scope.perioperative = $scope.account.businesses.perioperative,
          $scope.sterilizationsteam = $scope.account.businesses.sterilizationsteam,
          $scope.sterilizationperoxide = $scope.account.businesses.sterilizationperoxide
        ];

        console.log($scope.user);
      });

      $scope.forms = {};
      $scope.itemValidity = function (form, field) {

        var invalid = $scope.forms[form][field].$invalid && $scope.forms[form][field].$touched,
            untouched = $scope.forms[form][field].$invalid && $scope.forms[form][field].$untouched,
            valid = $scope.forms[form].$valid;

        if (valid) {
          return 'valid';
        } else if (untouched) {
          return 'untouched';
        } else if (invalid) {
          return 'invalid';
        } else {
          return '';
        }

      };

      $scope.toggleGroup = function(group) {
          if ($scope.isGroupShown(group)) {
            $scope.shownGroup = null;
          } else {
            $scope.shownGroup = group;
          }
        };
      $scope.isGroupShown = function(group) {
        return $scope.shownGroup === group;
      };

      $scope.updateData = function(e) {
        console.log(e);
      };
      // $scope.saveAccount = function() {
      //   $scope.users[0].accounts.push( angular.copy($scope.account) );
      //   console.log($scope.users[0]);
      // };

    }
];
