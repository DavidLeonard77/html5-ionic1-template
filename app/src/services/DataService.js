'use strict';

/**
 * @ngdoc function
 * @name Html5IonicTemplate.service:DataService
 * @description webSQL helper functions for creating and processing SQL queries
 * # DataService
 */
module.exports = [
    '$http',
    '$timeout',
    '$q',
    'SQLprocessor',

    function(
      $http,
      $timeout,
      $q,
      SQLprocessor
    ) {

      /** Fetch an SQL file and create a webSQL database
      * @constructor
      * @param  {fileName} name of sql file
      * @param  {shortName} name for db
      * @param  {cache} removes random hash in database shortname (default: false)
      * @return {promise} (resolve, reject)
      */
      function fetchData (fileName, shortName, cache, maxSize) {

        var _filePath = fileName ? 'data/'+fileName : null,          // Prefix path if we have one
            _cache = cache ? '' : parseInt(Math.random()*100000000), // Give a unique name if not caching
            _shortName = shortName ? shortName+_cache : 'db'+_cache, // Assemble short name
            _longName = '',                                          // Long name
            _maxSize = maxSize || 52400000;                          // Max size in bytes

        return $q(function(resolve, reject) {

          // Opens existing db or creates new
          SQLprocessor.openDatabase(_shortName, _longName, _maxSize, function(){

            // Get the SQL file
            $http({
              url: _filePath,
              method: 'GET'
            }).then(function(sql){

              // Load SQL.data into webSQL
              var startTime = new Date();
              SQLprocessor.process(
                sql.data,
                function(){
                  resolve('Database ' + _shortName + ' created in ' + ((new Date() - startTime) / 1000) + ' seconds');
                },
                function(error, failingQuery, sequenceNumber){
                  reject('Error: ' + error.message + ' at sequence ' + sequenceNumber);
                }
              );

            // Error in file load
            }, function(error){
              reject(error);
            });

          });

        });

      }


      /** Search the database
      * @constructor
      * @param {column} table column to search
      * @param {string} search string
      * @return {promise} (resolve([results]), reject(error))
      */
      function processSearch (columns, string, filters) {

        var parts = string && string.length ? string.split(' ') : null,
            query = '';

        return $q( function(resolve, reject){

          // Something to search
          if (columns && string) {

            // Prepare the query with selected categories
            var c = 0;
            angular.forEach(columns, function(value, column){
              if (value) {
                query = c > 0 ? query + ' OR ' : query;
                angular.forEach(parts, function(item, i){
                  if (item.length) {
                    query = i > 0 ? query +' AND ' : query;
                    query = query + column +' LIKE "%' + item + '%"';
                  }
                });
                c++;
              }
            });

            // Prepare the query with selected filters
            if (filters) {
              query = '(' + query + ')';
              angular.forEach(filters, function(value, filter){
                if (value.length) {
                  query = query + ' AND (' + filter +' = "' + value + '")';
                }
              });
            }

            // Final query
            query = 'SELECT * FROM products WHERE ' + query + ' LIMIT 50';
            // console.log(query);

            // Process the query
            SQLprocessor.process(query,

              // Return found columns
              function(tx, results, arr){
                resolve(arr);
              },

              // Error in sql statement
              function(error, statement){
                reject('Error: ' + error.message + ' when processing ' + statement);
              }
            );

          // return no search results
          } else {
            resolve([]);
          }

        });

      }



      /** Cues the search requests for 'live search'
      * @constructor
      * @param {columns} (obj) table columns to search
      * @param {string} (string) to search
      * @param {filters} (obj) table columns to filter
      * @param {asyncsearch} (bool) asyncronous SQL processing (default: false)
      * @return {promise} (resolve([results]), reject(error))
      */
      var processingSQL = false;
      var queuedSearch = [];
      function searchData (columns, string, filters, asyncsearch) {

        return $q(function(resolve, reject){

          if (columns) {

            // fire away
            if (asyncsearch) {
              processSearch(columns, string, filters).then(function(result){
                resolve(resut);
              });

            // Send SQL queries syncronously
            } else {

              // Save search for later if sql still processing
              if (processingSQL) {
                queuedSearch = [{
                  'columns' : columns,
                  'item' : string,
                  'filters' : filters || null
                }];
                reject('Still processing');

              // Process free
              } else {

                // Nothing to search - kill the cue
                if (!string) {
                  queuedSearch = [];
                  resolve([]);

                } else {
                  processingSQL = true;

                  var startTime = new Date();
                  processSearch(columns, string, filters)
                    .then(function(result){

                      // console.log('Results returned in ' + ((new Date() - startTime) / 1000) + ' seconds');

                      processingSQL = false;
                      if (queuedSearch.length) {

                        processSearch(
                          queuedSearch[0].columns,
                          queuedSearch[0].string,
                          queuedSearch[0].filters
                        )
                          .then(function(cuedResult){
                            resolve(cuedResult);
                          },function(error){
                            reject(error);
                          });
                        queuedSearch = [];

                      // Return the result
                      } else {
                        resolve(result);
                      }

                    });

                }

              }

            }

          } else {
            reject('No columns provided');
          }
        });

      }


      // public api
      return {
        fetchData: fetchData,
        searchData: searchData
      };
    }
];
