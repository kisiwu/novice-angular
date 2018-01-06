angular.module('noviceRouter').config(function(NOVICE_ROUTES, $routeProvider, ResolveProvider, lykConsoleProvider){

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
});
