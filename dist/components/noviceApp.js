/**
 * @ngdoc module
 * @module noviceApp
 */
angular.module('noviceApp', [
  '2lykUtils',

  /**
   * services:
   *   - Resolve
   *   - noviceRouterService
   * config
   * run
   *
   * dependencies:
   *   - ngRoute
   *   - 2lykUtils
   *   - noviceRouterServices
   *   - nApp
   *
   * nApp:
   *   constants:
   *     - NOVICE_ROUTES
   */
  'noviceRouter',

  /**
   * services:
   *   - noviceUtils
   */
  'noviceServices',

  /**
   * filters:
   *   - timeFormat
   *
   * dependencies:
   *   - d3
   */
  'noviceFilters',

  /**
   * directives:
   *   - noviceList
   *   - noviceListXhr
   *
   * dependencies:
   *   - 2lykUtils
   */
  'noviceDirectives',

  'nApp'
]);

angular.module('noviceApp').run(['$rootScope', function($rootScope){
  $rootScope.__novice = {
    generatedAt: new Date()
  };
}])
