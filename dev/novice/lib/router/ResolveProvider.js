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
