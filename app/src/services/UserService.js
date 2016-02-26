'use strict';

/**
 * @ngdoc function
 * @name Html5IonicTemplate.service:UsersService
 * @description Helper functions for saving user data
 * # UserService
 */
module.exports = [
    '$q',
    '$http',
    '$rootScope',
    '$ionicPopup',
    '$timeout',
    // 'localStorageService',

    function(
      $q,
      $http,
      $rootScope,
      $ionicPopup,
      $timeout
      // ,
      // localStorageService
    ) {

      var _appKey = 'appTestKey',
          _appCode = 'w8wh37ej',
          _users = [],
          _config = [],
          _profile = {};

      // ------------------- Get config ----------------------------------------
      // Gets user privacy list from macs.js or json
      // Returns array of users [{ 'email@place.com' : '1' }, ..]
      function _csvToJSON (csv) {
        var newLine = (csv.indexOf('\n') > -1) ? '\n' : '\r',
            lines = csv.split(newLine),
            result = [],
            headers = lines[0].split(',');

        for(var i=1; i<lines.length; i++){
          var obj = {},
              skipLine = false,
              currentline=lines[i].split(',');


          for(var j=0; j<headers.length; j++){
            if (currentline.length > 1) {
              obj[headers[j].trim()] = currentline[j].trim();
            } else {
              skipLine = true;
            }
          }
          if (!skipLine) {
            result.push(obj);
          }
        }
        return result;
      }
      function _getCSVdata (csvPath) {
        return $q(function(resolve, reject) {
          $http.get(csvPath).then(function(platformCSV){
            resolve( _csvToJSON(platformCSV.data) );
          },function(e){
            reject(e);
          });
        });
      }
      function _getConfig () {
        return $q(function(resolve, reject) {

          var localPath = 'data/users.csv',
              assetId = '36718',
              isLoaded = false;

          macs.getAssetPath(assetId, function(data){
            _getCSVdata(data.assetPath).then(function(config){
              isLoaded = true;
              resolve(config);
            },function(e){
              reject(e);
            });
          },function(e){
            reject(e);
          });

          $timeout(function () {
            if(!isLoaded) {
              _getCSVdata(localPath).then(function(config){
                resolve(config);
              });
            }

          }, 300);

        });
      }

      // ------------------- Create profile ------------------------------------
      // Get user from gooddata and configers privacy level
      function _getCurrentUser() {
        return $q(function(resolve, reject) {
          var noConnection = true;
          macs.getGoodDataSSOSessionId(
            'gooddata@imsmartapp.com',
            'YES',
            function(result) {
              noConnection = false;
              resolve(result.user);
            },
            function(e) {
              $ionicPopup.alert({
                title: 'Error',
                template: '<div class="center-text">' +
                          'There was a problem getting settings</div>'
              }).then(function(){
                reject(e);
              });
            }
          );

          $timeout(function(){
            if (noConnection) {
              // $ionicPopup.alert({
              //   title: 'Timeout',
              //   template: '<div class="center-text">' +
              //             'Request timed out</div>'
              // }).then(function(){
              //   reject('Request timed out');
              // });

              resolve('dleonard@comparenetworks.com');
            }
          }, 300);

        });
      }
      function _getPrivacy (email, config) {
        var c = config || _config;
        var f = c.filter(function(user){
          return user.email.toLowerCase() === email.toLowerCase();
        });
        return f.length ? parseInt(f[0].privacy) : 2;
      }
      function _createProfile (config) {
        return $q(function(resolve, reject) {
          var profile = {};
          _getCurrentUser().then(function(email){
            profile.email = email;
            profile.privacy = _getPrivacy(email, config);
            resolve(profile);
          },function(e){
            reject(e);
          });
        });
      }

      // ------------------- Find helper functions -----------------------------
      var findAll = function() {
        return $q(function(resolve) {
          resolve(_users);
        });
      };
      var findManagers = function() {
        return _config.filter(function(config){
          return parseInt(config.privacy) === 1;
        });
      };
      var findById = function(userid) {
        return $q(function(resolve) {
          resolve(_users[userid]);
        });
      };
      var findByEmail = function(searchKey, set) {
        return $q(function(resolve) {
          var users = set || _users;
          resolve( users.filter(function(user) {
            return user.email === searchKey;
          }));
        });
      };

      // ------------------- Create users --------------------------------------
      // Retuns array of all users from macs.js (filtered by privacy)
      // Syncs the main profile and moves to index 0 in user array
      function _getLatestEntry (matched){
        var current = matched[0];
        angular.forEach(matched, function(match){
          if (match.modifiedDate > current.modifiedDate) {
            current = match;
          }
        });
        return angular.fromJson(current.value);
      }
      function _syncProfile(users, profile) {
        var u = users.filter(function(user) {
          return user.email.toLowerCase() === profile.email.toLowerCase();
        });

        // Keep privacy setting
        var p = u.length ? u[0] : profile;
        p.privacy = u.length ? profile.privacy : p.privacy;
        return(p);
      }
      function _removeProfile(users, profile) {
        var i = -1;
        angular.forEach(users, function(user, index){
          i = user.email === profile.email ? index : i;
        });
        if (i > -1) {
          users.splice(i, 1);
        }
        return(users);
      }
      function _filterManager(users, managerEmail) {
        return users.filter(function(user){
          return user.manager === managerEmail;
        });
      }
      function _getUserData() {
        return $q(function(resolve, reject){

          var noConnection = true;
          macs.getItemUserData(
            _appKey,
            _appCode,
            '', // userId
            '', // privacy
            function(result) {
              noConnection = false;

              var parsedUsers = [];
              angular.forEach(result.items, function(user){
                parsedUsers.push(_getLatestEntry(user));
              });

              resolve(parsedUsers);
            },
            function(e) {
              // reject(e);
            }
          );

          var temp = [
            {
              email: 'dleonard@comparenetworks.com',
              name: 'David Leonard',
              privacy: '2',
              manager: 'jroy@comparenetworks.com',
              address: {
                street: '123 Street',
                city: 'Oaklandia',
                state: 'CA',
                zip: '75944',
                phone: '321-456-1234'
              },

              accounts: []
            },{
              email: 'Don@me.com',
              name: 'Don Something',
              manager: 'dleonard@comparenetworks.com',
              privacy: '2',
              address: {
                street: '',
                city: '',
                state: '',
                zip: '',
                phone: ''
              },

              accounts: []
            },{
              email: 'Susan@me.com',
              name: 'Susan Something',
              manager: 'jroy@comparenetworks.com',
              privacy: '2',
              address: {
                street: '',
                city: '',
                state: '',
                zip: '',
                phone: ''
              },

              accounts: []
            }
          ];

          // No macs.js timeout
          $timeout(function(){
            if (noConnection) {
              // $ionicPopup.alert({
              //   title: 'Timeout',
              //   template: '<div class="center-text">' +
              //             'Remote data request timed out</div>'
              // }).then(function(){
              //   reject('No connection with macs.js');
              // });

              resolve(temp);
            }
          }, 300);

        });
      }
      function _createUsers (profile) {
        return $q(function(resolve) {

          // Get data from macs
          _getUserData().then(function(users){

            // Sync user profile with macs
            var p = [_syncProfile(users, profile)];

            // Remove profile from user list
            var parsedUsers = _removeProfile(users, profile);

            // Check profile privacy setting
            switch (parseInt(p[0].privacy)) {

              // God
              // Return god and followers
              case 0:
                console.log(p[0].email + ' is god');
                resolve(p.concat(parsedUsers));
                break;

              // Manager
              // Return manager and grunts
              case 1:
                console.log(p[0].email + ' is a manager');
                var filteredUsers = _filterManager(parsedUsers, p[0].email);
                resolve(p.concat(filteredUsers));
                break;

              // Grunt
              // Return profile only
              default:
                console.log(p[0].email + ' is a grunt');
                resolve(p);
                break;
            }

          // No data from macs
          },function(){
            resolve([profile]);
          });

        });
      }

      // ------------------- Saving functions ----------------------------------
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

      // Save to local storage
      // var saveLocal = function() {
      //   localStorageService.set(_appKey, _users[0]);
      // }

      // Save user locally
      var saveUser = function(user) {
        _users[0] = angular.copy(user);
      };
      // var clear = function() {
      //   localStorageService.remove(_appKey);
      // };

      // ------------------- Init ----------------------------------------------
      var init = function() {
        return $q(function(resolve, reject) {
          _getConfig().then(function(config){
            _config = config;
            // console.log(config);
            _createProfile(config).then(function(profile){
              _profile = profile;
              // console.log(profile);
              _createUsers(profile).then(function(users){
                _users = users;
                // console.log(users);
                resolve(users);
                // Do something with each user's accounts array
              },function(e){
                reject(e);
              });
            },function(e){
              reject(e);
            });
          },function(e){
            reject(e);
          });
        });
      };

      return {
        init: init,
        saveProfile: saveProfile,
        saveUser: saveUser,

        findAll: findAll,
        findManagers: findManagers,
        findById: findById,
        findByEmail: findByEmail
      };

    }
];
