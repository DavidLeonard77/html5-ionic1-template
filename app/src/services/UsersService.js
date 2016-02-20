'use strict';

/**
 * @ngdoc function
 * @name Html5IonicTemplate.service:UsersService
 * @description Helper functions for saving user data
 * # DataService
 */
module.exports = [
    '$q',
    '$http',
    '$rootScope',
    '$ionicPopup',
    '$timeout',
    'localStorageService',
    'TerritoryService',
    'FavoritesService',
    'RecentlyViewedService',

    function(
      $q,
      $http,
      $rootScope,
      $ionicPopup,
      $timeout,
      localStorageService,
      TerritoryService,
      FavoritesService,
      RecentlyViewedService
    ) {

      var _appKey = 'appTestKey';
      var _appCode = 'w8wh37ej';
      var _users = [];
      var _fmtSnapshot;
      var _getUsers = function () {
        var deferred = $q.defer();
        deferred.resolve(_users);
        return deferred.promise;
      };

      // Gets all users from macs.js
      function _fetchUserData() {
        var deferred = $q.defer();
        var noConnection = true;
        macs.getItemUserData(
          _appKey,
          _appCode,
          '', // userId
          '', // privacy
          function(result) {
            noConnection = false;
            deferred.resolve(result.items);
          },
          function() {
            $ionicPopup.alert({
              title: 'Error',
              template: '<div class="center-text">' +
                        'There was a problem getting remote data</div>'
            }).then(function(){
              deferred.resolve([]);
            });
          }
        );

        $timeout(function(){
          if (noConnection) {
            $ionicPopup.alert({
              title: 'Timeout',
              template: '<div class="center-text">' +
                        'Remote data request timed out</div>'
            }).then(function(){
              deferred.resolve([]);
            });
          }
        }, 3000);

        return deferred.promise;
      }

      // Snapshot Defiant.js
      function _createSnapshot(obj) {
        var deferred = $q.defer();
        Defiant.getSnapshot(obj, function(snapshot) {
          deferred.resolve(snapshot);
        });
        return deferred.promise;
      }

      // Syncs macs.js users with _users
      function _syncProfiles(fmtProfiles) {
        var deferred = $q.defer();

        // Returns the latest user entry from macs.js
        function getCurrentProfile(matched){
          var current = matched[0];
          angular.forEach(matched, function(match){
            if (match.modifiedDate > current.modifiedDate) {
              current = match;
            }
          });
          return angular.fromJson(current.value);
        }

        // Merge data
        angular.forEach(_users, function(fmtUser, i){

          // Snapshot query by user email
          var snapshotUsers;
          if (fmtUser.email) {
            snapshotUsers = JSON.search(
              fmtProfiles,
              '//*[contains(value, "' + fmtUser.email + '")]'
            );

            // Get latest entry and save to _users
            if (snapshotUsers.length) {
              var current = getCurrentProfile(snapshotUsers);
              if (JSON.stringify(fmtUser) !== JSON.stringify(current)) {

                var editable = [
                  'professionalexperience',
                  'professionalinterests',
                  'teamleads',
                  'expertisearea',
                  'fmtleadfor',
                  'education',
                  'hobbies',
                  'molecule',
                  'phone',
                  'city',
                  'state'
                ];

                angular.forEach(editable, function(key){
                  _users[i][key] = current[key];
                });

              }
            }
          }

        });

        // Refactor json for Defiant snapshot
        var refactored = [];
        angular.forEach(_users, function(fmt){
          refactored.push({ 'value' : fmt });
        });

        _createSnapshot(refactored).then(function(snapshot){
          _fmtSnapshot = snapshot;
          deferred.resolve();
        });
        return deferred.promise;
      }

      // Returns app user email or false
      function _getAccount() {
        var deferred = $q.defer();
        var noConnection = true;
        macs.getGoodDataSSOSessionId(
          'gooddata@imsmartapp.com',
          'YES',
          function(result) {
            noConnection = false;
            deferred.resolve(result.user);
          },
          function() {
            $ionicPopup.alert({
              title: 'Error',
              template: '<div class="center-text">' +
                        'There was a problem getting settings</div>'
            }).then(function(){
              deferred.resolve();
            });
          }
        );

        $timeout(function(){
          if (noConnection) {
            $ionicPopup.alert({
              title: 'Timeout',
              template: '<div class="center-text">' +
                        'Request timed out</div>'
            }).then(function(){
              deferred.resolve();
              // deferred.resolve('dleonard@comparenetworks.com');
            });
          }
        },3000);

        return deferred.promise;
      }

      // Handles error after checking user exists in _users
      function _currentUserIsValid(user) {
        var deferred = $q.defer();
        if (user.length) {
          localStorageService.set('fmt-account', user[0]);
          deferred.resolve(true);
        } else {
          localStorageService.remove('fmt-account');
          $ionicPopup.alert({
            title: 'Error',
            template: '<div class="center-text">' +
                      'You are not a registered user</div>'
          }).then(function(){
            deferred.resolve();
          });
        }
        return deferred.promise;
      }

      // PUBLIC FUNCTIONS

      // Gets user from json and merge data from local storage
      var initUsers = function() {
        var deferred = $q.defer();

        // Get db users from users.json
        $http({ url: 'data/users.json', method: 'GET' }).then(function(users){
          _users = users.data;
          _fetchUserData().then(function(profiles){
            _createSnapshot(profiles).then(function(snapshot){
              _syncProfiles(snapshot).then(function(){
                deferred.resolve();
              });
            });
          });
        });
        return deferred.promise;
      };

      // Returns true if app user email is in _users
      var findCurrentUser = function() {

        var deferred = $q.defer();

        var fmtAccount = localStorageService.get('fmt-account');
        if (fmtAccount) {
          findByEmail(fmtAccount.email).then(function(user) {
            _currentUserIsValid(user).then(function(result){
              deferred.resolve(result);
            });
          });
        } else {
          _getAccount().then(function(account){
            if (account) {
              findByEmail(account).then(function(user) {
                _currentUserIsValid(user).then(function(result){
                  deferred.resolve(result);
                });
              });
            } else {
              deferred.resolve();
            }
          });
        }

        return deferred.promise;
      };

      // Saves profile to macs.js
      var saveProfile = function(value) {
        macs.saveItemUserData(
          _appCode,
          _appKey,
          value,
          '1',
          function() {
            $ionicPopup.alert({
              title: 'Success',
              template: '<div class="center-text">' +
                        'Settings updated</div>'
            }).then(function(){ });
          },
          function() {
            $ionicPopup.alert({
              title: 'Error',
              template: '<div class="center-text">' +
                        'There was a problem updating data</div>'
            }).then(function(){ });
          }
        );
      };

      var saveUser = function(user) {
        var fmts = [];
        angular.copy(_users, fmts);
        angular.forEach(fmts, function(fmt,i){
          if (parseInt(fmt.id) === parseInt(user.id)) {
            fmts[i] = user;
          }
        });
        _users = fmts;
      };

      var clear = function() {
        localStorageService.remove('fmt-account');
      };

      // ------------------- All Users -----------------------
      var findAll = function() {
        var deferred = $q.defer();
        deferred.resolve(_users);
        return deferred.promise;
      };

      // ------------------- Any Field -----------------------
      var findByAnyField = function(searchKey) {
        var deferred = $q.defer();

        var results = JSON.search(
          _fmtSnapshot,
          '//*[contains(value, "' + searchKey + '")]'
        );

        var refactored = [];
        angular.forEach(results, function(result){
          refactored.push(result.value);
        });

        deferred.resolve(refactored);

        // Skip managers
        // _getUsers().then(function(d){
        //   var results = d.filter(function(element){
        //     var match = false;
        //     angular.forEach(element, function(val,key){
        //       if (
        //         key !== 'manager' &&
        //         key !== 'profileimg' &&
        //         !match &&
        //         val
        //           .toString()
        //           .toLowerCase()
        //           .indexOf( searchKey.toLowerCase() ) > -1) {
        //         match = element;
        //       }
        //     });
        //     return match;
        //   });
        //   deferred.resolve(results);
        // });

        return deferred.promise;
      };

      // ------------------- ID -----------------------
      var findById = function(userid) {
        var deferred = $q.defer();
        _getUsers().then(function(d){
          var user = d[userid];
          deferred.resolve(user);
        });
        return deferred.promise;
      };

      // ------------------- User ID -----------------------
      var findByUserId = function(userid) {
        var deferred = $q.defer();
        _getUsers().then(function(d){
          var results = d.filter(function(element) {
            return parseInt(element.id) === parseInt(userid);
          });
          deferred.resolve(results[0]);
        });
        return deferred.promise;
      };

      // ------------------- Name -----------------------
      var findByName = function(searchKey) {
        var deferred = $q.defer();
        _getUsers().then(function(d){
          var results = d.filter(function(element) {
            var fullName = element.name;
            return fullName.toLowerCase()
              .indexOf(searchKey.toLowerCase()) > -1;
          });
          deferred.resolve(results);
        });
        return deferred.promise;
      };

      // ------------------- Email -----------------------
      var findByEmail = function(searchKey) {
        var deferred = $q.defer();
        _getUsers().then(function(d){
          var results = d.filter(function(element) {
            return element.email &&
              element.email.toLowerCase() === searchKey.toLowerCase();
          });
          deferred.resolve(results);
        });
        return deferred.promise;
      };

      // ------------------- Filter Example -----------------------
      function filterExample (searchKey, set) {
        return set.filter(function(element) {

          // Your filter
          var filter = true;
          return filter ? element : false;

        });
      }
      var findByExample = function(searchKey, set) {
        var deferred = $q.defer();

        if (set) {
          deferred.resolve( filterExample(searchKey, set) );
        } else {
          _getUsers().then(function(data){
            deferred.resolve( filterExample(searchKey, data) );
          });
        }
        return deferred.promise;
      };

      return {
        initUsers: initUsers,
        findCurrentUser: findCurrentUser,
        saveProfile: saveProfile,
        saveUser: saveUser,
        clear: clear,
        findAll: findAll,
        findByAnyField: findByAnyField,
        findById: findById,
        findByUserId: findByUserId,
        findByName: findByName,
        findByEmail: findByEmail,
        findByExample: findByExample
      };

    }
];
