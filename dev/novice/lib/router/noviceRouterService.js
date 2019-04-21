angular.module('noviceRouterServices')
.factory("noviceRouterService", function($route, $location, lykConsole){

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

  function goTo(name, params, absolute){
    $location.path(path(name, params, absolute))
  }

  return {
    path: path,
    goTo: goTo
  }
});
