'use strict';

/**
 * @ngdoc overview
 * @name Html5IonicTemplate
 * @description
 * # Initializes main application and routing
 *
 * Main module of the application.
 */

// Example to require lodash
// This is resolved and bundled by browserify
//
// var _ = require( 'lodash' );

angular.module( 'Html5IonicTemplate', [
  'ionic',
  'ngCordova',
  'ngResource',
  'ui.utils.masks'
] )
.run( [
  '$ionicPlatform',

  function( $ionicPlatform )
  {

  $ionicPlatform.ready(function() {
    // save to use plugins here
  });

  // add possible global event handlers here

} ] )

.config( [
  '$httpProvider',
  '$stateProvider',
  '$urlRouterProvider',

  function( $httpProvider, $stateProvider, $urlRouterProvider )
  {
    // register $http interceptors, if any. e.g.
    // $httpProvider.interceptors.push('interceptor-name');

    // Application routing
    $stateProvider
      .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/main.html',
        controller: 'MainController'
      })
      .state('app.home', {
        url: '/home',
        cache: false,
        views: {
          'viewContent': {
            templateUrl: 'templates/views/home.html',
            controller: 'HomeController'
          }
        }
      })
      .state('app.input', {
        url: '/input' +
             '?account' +
             '?business',
        cache: false,
        views: {
          'viewContent': {
            templateUrl: 'templates/views/input.html',
            controller: 'InputController'
          }
        }
      })
      .state('app.accounts', {
        url: '/accounts',
        cache: false,
        views: {
          'viewContent': {
            templateUrl: 'templates/views/accounts.html',
            controller: 'AccountsController'
          }
        }
      })
      // .state('app.dashboard', {
      //   url: '/dashboard',
      //   cache: true,
      //   views: {
      //     'viewContent': {
      //       templateUrl: 'templates/views/dashboard.html',
      //       controller: 'DashboardController'
      //     }
      //   }
      // })
      .state('app.settings', {
        url: '/settings',
        cache: true,
        views: {
          'viewContent': {
            templateUrl: 'templates/views/settings.html',
            controller: 'SettingsController'
          }
        }
      });


    // redirects to default route for undefined routes
    $urlRouterProvider.otherwise('/app/home');
  }
] )

// Angular module controllers
//
.controller( 'MainController',      require( './controllers/mainController'      ) )
.controller( 'HomeController',      require( './controllers/homeController'      ) )
.controller( 'InputController',     require( './controllers/inputController'     ) )
.controller( 'AccountsController',  require( './controllers/accountsController'  ) )
.controller( 'DashboardController', require( './controllers/dashboardController' ) )
.controller( 'SettingsController',  require( './controllers/settingsController'  ) )

// Angular module services
//
// .factory( 'ExampleService',      require( './services/ExampleService'         ) )
.factory( 'ApiService',             require( './services/ApiService'             ) )
.factory( 'DataService',            require( './services/DataService'            ) )
.factory( 'SQLprocessor',           require( './services/html5sql'               ) )
.factory( 'UserService',            require( './services/UserService'            ) )
.factory( 'AccountService',         require( './services/AccountService'         ) )

;
