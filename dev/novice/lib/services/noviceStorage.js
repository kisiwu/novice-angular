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


    this.$get = function($localStorage) {

        if(!($localStorage[storageName]
          && angular.isObject($localStorage[storageName]))){
            $localStorage[storageName] = {};
        }

        function getStorage(){
          return $localStorage[storageName];
        }

        function set(name, value){
          getStorage()[prefix+name] = value;
        }

        function get(name){
          return getStorage()[prefix+name];
        }

        return {
          set: set,
          get: get,
          getStorage: getStorage
        };
    };
});
