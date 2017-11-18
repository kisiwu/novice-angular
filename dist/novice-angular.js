angular.module('noviceFilters', [

])


angular.module('noviceFilters').filter("timeFormat", function(){
  return function(date, format, charCase) {

    if(angular.isUndefined(date)){
      return;
    }

    date = new Date(date);

    switch (charCase) {
      case 'l':
      case 'L':
        return (d3.timeFormat(format)(date)).toLowerCase();
        break;
      case 'u':
      case 'U':
      default:
        return d3.timeFormat(format)(date);
        break;
    }
  };
});

angular.module("noviceFilters",[]),angular.module("noviceFilters").filter("timeFormat",function(){return function(a,b,c){if(!angular.isUndefined(a))switch(a=new Date(a),c){case"l":case"L":return d3.timeFormat(b)(a).toLowerCase();case"u":case"U":default:return d3.timeFormat(b)(a)}}});
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

angular.module('noviceApp').run(['$rootScope', function($rootScope){
  $rootScope.__novice = {
    generatedAt: new Date()
  };
}])

angular.module('noviceRouter', [
  'ngRoute',
  '2lykUtils',
  'noviceRouterServices',

  'nApp'
]);

angular.module('noviceRouterServices', [
  'ngRoute',
  '2lykUtils'
]);

angular.module('noviceRouterServices').provider('Resolve', function ResolveProvider() {

    var all = {};

    this.add = function(name, value){
      if(angular.isObject(name) && angular.isUndefined(value)){
        Object.keys(name).forEach(
          function(key){
            all[key] = name[key];
          }
        );
      }
      else
        all[name] = value;
    }

    this.get = function(name) {
        return all[name];
    };

    this.$get = function() {
        return {};
    };
});

angular.module('noviceRouterServices')
.factory("noviceRouterService", ['$route', 'lykConsole', function($route, lykConsole){

  var routes = {};

  var rawRoutes = $route.routes;

  Object.keys(rawRoutes).forEach(
    function(path){
      if(rawRoutes[path].name){
        routes[rawRoutes[path].name] = rawRoutes[path];
      }
    }
  );

 /**
  * @function path
  * @description builds path from name and params
  * if Url param is missing or route doesn't exist, returns empty string
  * if more params passed, adds them as url variables
  * @param {String} name
  * @param {Object} params
  * @param {Boolean} absolute - Absolute path
  * @return {String} build path
  */
  function path(name, params, absolute){
    var buildPath = "", urlVars = {};
    var route = routes[name];
    params = params && angular.isObject(params) ? params : {};
    if(!route){
      //throw new Error(`Route ${name} not found`);
      lykConsole.error('[noviceRouterService][path]', 'Route', "'"+name+"'",'not found')
      return '';
    }

    route = angular.copy(route);
    buildPath = route.originalPath;

    //console.log(buildPath);

    if(route.keys.length){
      if(route.keys.some(function(k){
        if(!k.optional && angular.isUndefined(params[k.name])){
          //throw new Error(`Missing param '${k.name}' for path ${route.originalPath}`);
          lykConsole.error('[noviceRouterService][path]', 'Missing param' , "'"+k.name+"'", 'for path', "'"+route.originalPath+"'")
          return true;
        }
      })){
        return '';
      }

      Object.keys(params).forEach(
        function(p){
          var index = ':'+p;
          var pos = buildPath.indexOf(index);
          if(pos > -1){
            buildPath = buildPath.replace(new RegExp(index, 'g'), params[p])
          }
          else{
            urlVars[p] = params[p];
          }
        }
      );


    }
    else{
      urlVars = params;
    }

    if(Object.keys(urlVars).length){
      buildPath += "?";
      Object.keys(urlVars).forEach(
        function(v, i, array){
          buildPath += (v + "=" + urlVars[v])
          if((i+1) < array.length){
            buildPath += "&"
          }
        }
      );
    }

    if(!absolute){
      if(buildPath.indexOf("/") == 0){
        buildPath = buildPath.substring(1);
      }
    }
    else if(angular.isString(absolute)){
      buildPath = absolute+buildPath;
    }

    return buildPath;
  }

  return {
    path: path
  }
}]);

angular.module('noviceRouter').config(['NOVICE_ROUTES', '$routeProvider', 'ResolveProvider', 'lykConsoleProvider', function(NOVICE_ROUTES, $routeProvider, ResolveProvider, lykConsoleProvider){

  if(!(angular.isArray(NOVICE_ROUTES) && NOVICE_ROUTES.length > 0))
      return;

  var hasMain = false;

  function searchResolve(r, p){
    if(r.resolve && angular.isString(r.resolve)){
      var resolve = ResolveProvider.get(r.resolve);
      if(!resolve){
        console.error("resolve", "'"+r.resolve+"'" ,"not found in 'ResolveProvider' for route", "'"+r.name+"'", "'"+p+"'");
      }
      else{
        r.resolve = resolve;
      }
    }
  }

  function isMain(route){
    if(route.main){
      if(hasMain){
        delete route.main;
        return false;
      }
      hasMain = true;
      return true;
    }
    return false;
  }

  NOVICE_ROUTES.forEach(function(route){
    var path = route.path;
    var baseUrl = route.baseUrl || "";
    var routes = route.routes;
    var name = route.name;
    var doRoutes = false;
    if(!path){
      if(!(Array.isArray(routes) && routes.length > 0)){
           return;
      }
      doRoutes = true;
    }

    searchResolve(route, path);

    if(!doRoutes){
      delete route.path;
      var respMain = isMain(route);
      $routeProvider.
      when(path,route);
      if(respMain){
        lykConsoleProvider.dev("[ROUTER]", "main:",path);
        $routeProvider.
        otherwise({
            redirectTo: path
          });
      }
      return;
    }

    routes.forEach(function(subRoute){
      var subPath = baseUrl + (subRoute.path || '');
      subRoute.name = subRoute.name || name;
      if(!subPath)
          return;

      searchResolve(subRoute, subPath);

      delete subRoute.path;
      var respMain = isMain(subRoute);
      $routeProvider.
      when(subPath, subRoute);
      if(respMain){
        lykConsoleProvider.dev("[ROUTER]", "main:",subPath);
        $routeProvider.
        otherwise({
            redirectTo: subPath
          });
      }
    });

  });
}]);

angular.module('noviceRouter').run(
  ['$rootScope', '$window', '$location', 'lykConsole', 'noviceRouterService', function($rootScope, $window, $location, lykConsole, noviceRouterService){

    $rootScope.router = noviceRouterService;

    $rootScope.$on('$routeChangeStart', function (event, current) {
        if(!current){
          lykConsole.error("404 NO ROUTE");
          return;
        }
        var NoviceRoute = current.$$route;
        if(!NoviceRoute){
          return;
        }
        $rootScope._routeName = NoviceRoute.name;
        $rootScope._templateUrl = NoviceRoute.templateUrl;
        $rootScope._path = NoviceRoute.originalPath;
        $rootScope._controller = NoviceRoute.controller || '';
        lykConsole.dev("[RUN]",$rootScope._routeName || '', $rootScope._path);
        //console.log(NoviceRoute);
        //console.log(current);
        /*if(IOTRoute && IOTRoute.permissions && IOTRoute.name){
          var IOTPermissions = IOTRoute.permissions;
          if(!IOTSecurityService.isAuthenticated()){
            $rootScope.hideBody = true;
            event.preventDefault();
            $window.location.href = './login.html';
            return;
          }
          if(Array.isArray(IOTPermissions)){
            for(var iPerm = 0; iPerm < IOTPermissions.length ; iPerm++){
              if(!IOTSecurityService.hasPermission(IOTRoute.name,IOTPermissions[iPerm], true)){
                  $rootScope.hideBody = true;
                  $location.path("/");
                  return;
                  break;
              }
            }
          }
          else{

            if(!IOTSecurityService.hasPermission(IOTRoute.name,null, true)){
              $rootScope.hideBody = true;
                $location.path("/");
                return;
            }
            console.debug("PERMISSIONS OK");
            console.log("CURRENT", current);
          }*/
        });
  }]
);

angular.module('noviceServices', [

])

angular.module('noviceServices')
.factory("noviceUtils", ['$timeout', '$interval', function($timeout, $interval){

  function found(value, search, caseSensitive){

    if(!search)
      return true;
    if(!value)
      return false;

    var valueArray, searchArray;

    searchArray = angular.isArray(search) ?
                    angular.copy(search) :
                    angular.isString(search) || angular.isNumber(search) ?
                      search.toString().split(" ").map(function(str){
                        return str.trim();
                      }) :
                      [];
    valueArray = angular.isArray(value) ?
                    angular.copy(value) :
                    angular.isString(value) || angular.isNumber(value) ?
                      value.toString().split(" ").map(function(str){
                        return str.trim();
                      }) :
                      [];

    searchArray.filter(function(elem){
      return elem && angular.isString(elem);
    });
    if(!searchArray.length)
      return true;
    valueArray.filter(function(elem){
      return elem && angular.isString(elem);
    });
    if(!valueArray.length)
      return false;

    if(!caseSensitive){
      searchArray = searchArray.map(function(str){
        return str.toLowerCase();
      });
      valueArray = valueArray.map(function(str){
        return str.toLowerCase();
      });
    }

    return !searchArray.some(function(subSearch){
      return (!valueArray.some(function(str){
        return str.indexOf(subSearch) > -1;
      })) ? true : false;
    });
  }

  function cancelTimeouts(scope){
    scope.$on('$destroy', function() {
      _cancelTimeouts(scope, [
        {
          name:"timeouts",
          service: $timeout
        },{
          name: "intervals",
          service: $interval
        }])


    });
  }

  function _cancelTimeouts(scope, vars){
    vars.forEach(
      function(o){
        var varName = o.name;
        var service = o.service;
        if(scope[varName] && angular.isObject(scope[varName])){
          Object.keys(scope[varName]).forEach(
            function(t){
              console.log(t,':', scope[varName][t]);
              if(scope[varName][t])
                service.cancel(scope[varName][t]);
            }
          );
        }
      }
    );
  }

  return {
    found: found,
    onDestroy: {
      cancelTimeouts: cancelTimeouts
    }
  }
}]);

angular.module("noviceServices",[]),angular.module("noviceServices").factory("noviceUtils",["$timeout","$interval",function(a,b){function c(a,b,c){if(!b)return!0;if(!a)return!1;var d,e;return e=angular.isArray(b)?angular.copy(b):angular.isString(b)||angular.isNumber(b)?b.toString().split(" ").map(function(a){return a.trim()}):[],d=angular.isArray(a)?angular.copy(a):angular.isString(a)||angular.isNumber(a)?a.toString().split(" ").map(function(a){return a.trim()}):[],e.filter(function(a){return a&&angular.isString(a)}),!e.length||(d.filter(function(a){return a&&angular.isString(a)}),!!d.length&&(c||(e=e.map(function(a){return a.toLowerCase()}),d=d.map(function(a){return a.toLowerCase()})),!e.some(function(a){return!d.some(function(b){return b.indexOf(a)>-1})})))}function d(c){c.$on("$destroy",function(){e(c,[{name:"timeouts",service:a},{name:"intervals",service:b}])})}function e(a,b){b.forEach(function(b){var c=b.name,d=b.service;a[c]&&angular.isObject(a[c])&&Object.keys(a[c]).forEach(function(b){console.log(b,":",a[c][b]),a[c][b]&&d.cancel(a[c][b])})})}return{found:c,onDestroy:{cancelTimeouts:d}}}]);