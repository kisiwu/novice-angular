/**
 * @ngdoc module
 * @module noviceDirectives
 */
angular.module('noviceDirectives', [
  '2lykUtils'
]);

angular.module("noviceDirectives").
    directive('noviceList', ['lykPropertyAccess', '$timeout', 'lykConsole', function(lykPropertyAccess, $timeout, lykConsole){

      return {
      restrict: 'EA',
      templateUrl: function(element, attrs) {
        if(attrs.templateUrl){
          return attrs.templateUrl;
        }
        // default template
        return 'novice/template/novice-list/novice-list.html';
      },
      transclude: true,
      require: 'ngModel',
      scope: {
        columns: '=', //[string|object] //if object => {id,name,sortable}
        model: '=ngModel', //[object]
        selectFn: '=?', //function to execute when a row has been selected, (item)
        searchFn: '=?', //function to execute when a search has been triggered, (word)
        sortFn: '=?', //function to execute when a sort has been triggered, (column._id, true | false (asc or desc))
        bottomFn: '=?', //function to execute when we reached the bottom
        querySearchFn: '=?',
        defaultSort: '@',
        defaultOrder: '@',
        hideList: '=?',
        scrollFn: '=?',

        buttons: '=?',

        tableClass: '=?'
      },
      link: function(scope, element, attrs, ngModel){

        scope.__do = function(){
          //console.error("myPagingFunction");
          var method = Array.prototype.shift.call(arguments);
          var args = arguments;
          if(scope[method]){
            switch(method){
              default:
                $timeout(function () {
                  scope[method].apply(this, args);
                }, 10);
                break;
            }
          }
        }

        scope.youCanStickTheHeader = false;
        scope.setYouCanStickTheHeader = function(){
          scope.youCanStickTheHeader = true;
        }

        var activeRow = {};
        scope.isActiveRow = function(item){
          return activeRow == item;
        }
        scope.activeRow = function(item){
          activeRow = item;
        }

        var sort = "";
        scope.order = scope.defaultOrder == "asc" ? true : false; // for asc and desc
        scope.sort;

        scope.setSort = function(id, notoggle, smthElse, column){
          //console.info("setSort");
          if(!notoggle){
            if(scope.isSortedBy(id)){
              scope.order = !scope.order;
            }
            else{
                scope.order = true;
            }
          }
          sort = id;
          if(scope.sortFn){
            scope.sortFn(sort, scope.order);
            return;
          }

          /** angular orderBy **/
          scope.sort = function(item){
            return getValue(item, id, column);
          }
          scope.reverse = !scope.order;

          //console.log(scope.sort);
        }
        scope.isSortedBy = function(id){
          //console.info("isSortedBy");
          return sort == id;
        }
        scope.getValue =  getValue;
        scope.getArray = function(item, key, column){
          var retour = [];
          if(angular.isObject(item) && scope.getType(item, key, column) == 'array'){
            retour = getValue(item, key, column, true);
          }
          return retour;
        }
        scope.getType = function(item, key, column){
          if(column.type)
            return column.type;

          var type = lykPropertyAccess.getType(item, key);
          if(type == 'undefined' && column &&  column.alternative){
            type = lykPropertyAccess.getType(item, column.alternative);
          }
          return type;
        }

        function selectFn(){
          console.info("[noviceList]", "selectFn");
        }
        function searchFn(){
          console.info("[noviceList]", "searchFn");
        }

        function actionFn(button, elem, i, data){
          lykConsole.dev("[noviceList]","actionFn");
          if(button && angular.isObject(button) && typeof button.action === 'function'){
            button.action(elem, i, data);
          }
        }
        function getValue(item, key, column, noInner){
          var returnValue;
          var value = lykPropertyAccess.async.getValue(item, key);
          returnValue = value.$$state.value;

          if(typeof returnValue == 'undefined' && column &&  column.alternative){
            value = lykPropertyAccess.async.getValue(item, column.alternative);
            returnValue = value.$$state.value;
          }

          /** inner **/
          if(!noInner && column && angular.isArray(column.inner) && angular.isObject(returnValue)){
            returnValue = column.inner.map(
              function(str){
                return lykPropertyAccess.getValue(returnValue, str);
              }
            ).join(' ');
          }
          /** filter **/
          if(column && column.filter){
            returnValue = column.filter(returnValue, key, item);
          }
          return returnValue;
        }
        scope.searchFn = scope.searchFn || searchFn;
        scope.selectFn = scope.selectFn || selectFn;
        scope.actionFn = actionFn;

        onInit();

        function onInit(){
        //  console.info("listDirective");
          scope.columns = scope.columns || [];
          scope.$watchCollection("model", function(newValue) {
            scope.rows = newValue || [];
          }, true);

          scope.actionsColumn = scope.columns
          .filter(function(column){
            return (column && angular.isObject(column) && column.type === "actions");
          });
          scope.actionsColumn = scope.actionsColumn.length > 0 ? scope.actionsColumn[0] : undefined;

          scope.columns = scope.columns
          .filter(function(column){
            return (angular.isString(column) && column.trim() != "") ||
              (
                column && angular.isObject(column)
                && (
                  typeof column.type === 'undefined' ||
                  (angular.isString(column.type) && ["actions"].indexOf(column.type) == -1)
                )
              );
          })
          .map(function(column){
              if(angular.isString(column)){
                column = {id: column};
              }
              column.name = column.name || column.id;
              column.sortable = column.sortable || false;
              column.filter = column.filter || undefined;
              column.class = column.class || "";
              column.type = column.type || undefined;

              /** TODO **/
              column.inner = angular.isArray(column.inner) ? column.inner : undefined;
              column.alternative = angular.isString(column.alternative) ? column.alternative : undefined;
              /** /TODO **/
              return column;
          });
          //console.info(scope.columns);
          scope.searchFn = scope.searchFn || searchFn;
          scope.selectFn = scope.selectFn || selectFn;
          scope.actionFn = actionFn;
          scope.defaultSort = scope.defaultSort || "";
          if(scope.defaultSort){
            scope.setSort(scope.defaultSort, true);
          }

          scope.buttons = angular.isArray(scope.buttons) ? scope.buttons : [];

          scope.loaded = true;
          //console.info("loaded");
        }
      },
    };
    }]);

angular.module("noviceDirectives").
    directive('noviceListXhr', ['lykPropertyAccess', '$timeout', 'lykXhr', 'lykConsole', function(lykPropertyAccess, $timeout, lykXhr, lykConsole){

      return {
      templateUrl: function(element, attrs) {
        if(attrs.templateUrl){
          return attrs.templateUrl;
        }
        // default template
        return 'novice/template/novice-list/novice-list-xhr.html';
      },
      transclude: true,
      scope: {
        columns: '=',
        xhr: '<',
        xhrParams: '<',
        parametersNames: '<',
        myButtons: '=?buttons',
        querySearchFn: '=?',

        //display
        hideFilters: '=?',

        //style
        tableHeight: '=?',
      },
      link: function(scope, element, attrs){
        var limit = 50;
        var page = 0;
        var sort = "";
        var order = "asc";
        var nbPages = 1;

        var paramsNames = {
          page: "page",
          limit: "limit",
          sort: "sort",
          order: "order",
          search: "search"
        };

        if(scope.parametersNames && angular.isObject(scope.parametersNames)){
          Object.keys(scope.parametersNames).forEach(
            function(p){
              if(scope.parametersNames[p] && angular.isString(scope.parametersNames[p])){
                paramsNames[p] = scope.parametersNames[p];
              }
            }
          );
        }

        scope.myList = [];

        if(attrs.hasOwnProperty('xhrSort')){
          scope.sortMyList = function(pSort, pOrder){
            /*if(pSort || pOrder)
              lykConsole.dev(pSort, pOrder);*/

            sort = pSort;
            order = pOrder ? "asc" : "desc";
            page = 0;
            executeXhr(true);
          }
        }

        if(!scope.hideFilters && typeof scope.querySearchFn === 'function'){
          scope.myQuerySearchFn = function(entry){
            if(scope.hideFilters){
              return true;
            }
            return scope.querySearchFn(entry, scope.search);
          }
        }

        scope.loadMore = function(){
          if(nbPages <= page + 1){
            return;
          }
          page++;
          executeXhr();
        }

        scope.doSearch = function(){
          /*if(typeof scope.querySearchFn === 'function'){
            scope.querySearchFn(scope.search);
          }
          else{
            executeXhr(true);
          }*/
          console.log("[noviceListXhr]","dont knx wut to do");
        }

        function executeXhr(makeNewList){
          var params = {};

          params[paramsNames.limit] = limit;
          params[paramsNames.page] = page;
          params[paramsNames.sort] = sort;
          params[paramsNames.order] = order;
          params[paramsNames.search] = encodeURIComponent(scope.search);

          lykXhr.execute(scope.xhr, {params: params}, scope.xhrParams).then(
            function(data){
              if(!data){
                return lykConsole.dev("[noviceListXhr]","No data");
              }
              if(angular.isArray(data)){
                if(makeNewList){
                  scope.myList = data;
                }
                else{
                  scope.myList = scope.myList.concat(data);
                }
                lykConsole.dev("[noviceListXhr]","size:", scope.myList.length);
              }
              else if(angular.isObject(data)){
                var arrayProp = "data";
                if(angular.isArray(data["docs"]) && !angular.isArray(data["data"])){
                  arrayProp = "docs";
                }
                if(!angular.isArray(data[arrayProp])){
                  return lykConsole.dev("[noviceListXhr]","No data");
                }

                if(makeNewList){
                  scope.myList = data[arrayProp];
                }
                else{
                  scope.myList = scope.myList.concat(data[arrayProp]);
                }
                nbPages = angular.isNumber(data.pages) ? data.pages : nbPages;
              }
            },
            lykConsole.error
          );
        }

        executeXhr();

      },
    };
    }]);

/**
 * @ngdoc module
 * @module noviceFilters
 */
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

angular.module('noviceServices')
.provider('noviceStorage', function noviceStorageProvider() {

    var storageName = "_novice_storage_";
    var prefix = "";

    this.setPrefix = function setPrefix(name){
      prefix = name;
      if(!angular.isString(prefix)){
        prefix = JSON.stringify(prefix);
      }
    }


    this.$get = ['$localStorage', function($localStorage) {

        if(!($localStorage[storageName]
          && angular.isObject($localStorage[storageName]))){
            $localStorage[storageName] = {};
        }

        function getStorage(){
          return $localStorage[storageName];
        }

        function reset(){
          delete $localStorage[storageName];
          $localStorage[storageName] = {};
        }

        function set(name, value){
          getStorage()[prefix+name] = value;
        }

        function get(name){
          return getStorage()[prefix+name];
        }

        function remove(name){
          delete getStorage()[prefix+name];
        }

        return {
          set: set,
          get: get,
          remove: remove,
          getStorage: getStorage,
          reset: reset
        };
    }];
});
