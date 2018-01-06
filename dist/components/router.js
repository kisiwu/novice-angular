/**
 * @ngdoc module
 * @module noviceRouter
 */
angular.module('noviceRouter', [
  'ngRoute',
  '2lykUtils',
  'noviceRouterServices',
  'nApp'
]);

/**
 * @ngdoc module
 * @module noviceRouterServices
 */
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
    var rootName = name;

    route.rootName = rootName;

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
      subRoute.rootName = rootName;
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
        $rootScope._routeRootName = NoviceRoute.rootName;
        $rootScope._templateUrl = NoviceRoute.templateUrl;
        $rootScope._path = NoviceRoute.originalPath;
        $rootScope._controller = NoviceRoute.controller || '';
        lykConsole.dev(
          "[RUN]",
          $rootScope._routeName || '',
          $rootScope._path
        );
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
