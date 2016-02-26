'use strict';

/**
 * @ngdoc function
 * @name Html5IonicTemplate.controller:SettingsController
 * @description
 * # SettingsController
 */
module.exports = [
    '$scope',
    '$http',
    'UserService',

    function(
      $scope,
      $http,
      UserService
    ) {

      $http.get('data/territory.json').then(function(states){

        $scope.states = states.data;

        UserService.findById(0).then(function(profile){
          $scope.profile = profile;
          $scope.managers = UserService.findManagers();
        });

      },function(){ });

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

    }
];
