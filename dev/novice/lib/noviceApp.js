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

  'nApp'
]);

angular.module('noviceApp').run(function($rootScope){
  $rootScope.__novice = {
    generatedAt: new Date()
  };
})
