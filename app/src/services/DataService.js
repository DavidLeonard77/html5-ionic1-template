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
      * @param  {fileName}  name of sql file
      * @param  {shortName} name for db
      * @param  {cache}     removes random hash in database shortname (default: false)
      * @param  {maxsize}   in butes
      * @return {promise}   (resolve(shortName), reject(error))
      */
      function fetchData (fileName, shortName, cache, maxSize) {

        var _filePath = fileName ? 'data/' + fileName : null,          // Prefix path if we have one
            _cache = cache ? '' : parseInt(Math.random()*100000000),   // Give a unique name if not caching
            _shortName = shortName ? shortName+_cache : 'db' + _cache, // Assemble short name
            _longName = '',                                            // Long name
            _maxSize = maxSize || 5240000;                             // Max size in bytes

        return $q(function(resolve, reject) {

          // Opens existing db or creates new
          SQLprocessor.openDatabase(_shortName, _longName, _maxSize, function(){

            // Get the SQL file
            $http({
              url: _filePath,
              method: 'GET'
            }).then(function(sql){

              // Load SQL.data into webSQL
              SQLprocessor.process( sql.data,

                function(){
                  resolve(_shortName);
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

      /** Get array of string parts
      * @constructor
      * @param  {string}      (string) to search
      * @return {parts}       (array)  Array of string parts
      */
      function getSearchStringParts (string) {
        return string && string.length ? string.split(' ') : null;
      }

      /** Build SQL query for searching a category
      * @constructor
      * @param  {string}      (string) to search
      * @param  {category}    (string) table column to search
      * @return {query}       (string)
      */
      function stringQuery (string, category) {
        var parts = getSearchStringParts(string),
            query = '';

        angular.forEach(parts, function(item, index){
          if (item.length) {
            query = index > 0 ? query + ' AND ' : query;
            query += category +' LIKE "%' + item + '%"';
          }
        });
        query = query ? '(' + query + ')' : query;

        return query;
      }

      /** Build SQL query for searching a list of categories
      * @constructor
      * @param  {searchItems} (obj)    List of columns and values to search
      * @param  {operator}    (string) SQL operator to use (eg ' AND ')
      * @return {query}       (string)
      */
      function columnQuery (searchItems, operator) {
        var match = operator || ' OR ',
            query = '';

        angular.forEach(searchItems, function(string, column) {
          if (string) {
            query = query ? query + match : query;
            query += stringQuery(string, column);
          }
        });
        query = query ? '(' + query + ')' : query;

        return query;
      }

      /** Build a full query
      * @constructor
      * @param  {string}      (string)  to search
      * @param  {categories}  (obj)     table columns to search (SQL OR)
      * @param  {filters}     (obj)     table columns to filter (SQL AND)
      * @return {promise}     (resolve([results]), reject(error))
      */
      function getQuery (string, categories, filters) {

        var categoryQuery = columnQuery(categories, ' OR '),
            filterQuery = columnQuery(filters, ' AND '),

            query = categoryQuery +
                    (categoryQuery && filterQuery ? ' AND ' : '') +
                    filterQuery;

        return query;
      }

      /** Search the database
      * @constructor
      * @param  {table}       (string)  table name to search
      * @param  {query}       (string)  SQL query
      * @param  {limit}       (integer) return results limit (default 50)
      * @return {promise}     (resolve([results]), reject(error))
      */
      function processSearch (table, query, limit) {
        var _limit = parseInt(limit) || 50;

        return $q( function(resolve, reject){

          if (table && query) {

            // Process the query
            SQLprocessor.process(
              'SELECT * FROM ' + table + ' WHERE ' + query + ' LIMIT ' + _limit,

              // Return found columns
              function(tx, results, arr){
                resolve(arr);
              },

              // Error in sql statement
              function(error, statement){
                reject(error.message + ' when processing ' + statement);
              }
            );

          } else {
            resolve([]);
          }

        });

      }

      /** Queues the search requests for 'live search'
      * @constructor
      * @param  {table}       (string)  table name to search
      * @param  {query}       (string)  SQL query
      * @param  {limit}       (integer) return results limit (default 50)
      * @param  {asyncsearch} (bool)    asyncronous SQL processing (default false)
      * @return {promise}     (resolve([results]), reject(error))
      */
      var processingSQL = false;
      var queuedQuery = [];
      function searchData (table, query, limit, asyncsearch) {

        return $q(function(resolve, reject){

          if (query) {

            // fire away
            if (asyncsearch) {
              processSearch(table, query, limit)

                .then(function(result){
                  resolve(result);
                },function(error){
                  reject(error);
                });

            // Send SQL queries syncronously
            } else {

              // Save search for later if sql still processing
              if (processingSQL) {

                queuedQuery = [query];
                reject('Still processing');

              // Process free
              } else {

                processingSQL = true;
                processSearch(table, query, limit)

                  .then(function(result){

                    processingSQL = false;

                    // Search request in queue
                    if (queuedQuery.length) {

                      processSearch(table, queuedQuery[0], limit)

                        .then(function(cuedResult){
                          resolve(cuedResult);

                        },function(error){
                          reject(error);
                        });

                      queuedQuery = [];

                    // Return the result
                    } else {
                      resolve(result);
                    }

                  },function(error){
                    reject(error);
                  });

              }

            }

          } else {
            resolve([]);
          }
        });

      }


      // public api
      return {
        fetchData: fetchData,
        getQuery: getQuery,
        searchData: searchData
      };
    }
];
