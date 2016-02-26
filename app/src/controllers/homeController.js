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
    '$timeout',
    'UserService',
    'AccountService',
    function(
      $scope,
      $state,
      $timeout,
      UserService,
      AccountService
    ) {

      function _createAccount () {
        $scope.account = angular.copy( AccountService.createAccount() );
      }
      function _createUser (user) {
        $scope.user = user;
        _createAccount();
        console.log($scope.account);
      }

      $scope.$on('usersFetched', function(){
        UserService.findById(0).then(function(user){
          _createUser(user);
        });
      });

      UserService.findById(0).then(function(user){
        if (user) {
          _createUser(user);
          console.log('already loaded');
        } else {
          console.log('not yet');
        }
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
      $scope.clearForm = function() {
        _createAccount();
      };
      $scope.saveAccount = function() {
        $scope.user.accounts.push( angular.copy($scope.account) );
        UserService.saveUser($scope.user);
        $timeout(function(){
          // Clear ??
          _createAccount();
        }, 500);
        $state.go('app.input',{
          account: $scope.user.accounts.length-1,
          business: $scope.account.opportunity,
        });
      };

    }
];
