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
