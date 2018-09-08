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
        pColumns: '=columns', //[string|object] //if object => {id,name,sortable}
        model: '=ngModel', //[object]
        pSelectFn: '=?selectFn', //function to execute when a row has been selected, (item)
        pSearchFn: '=?searchFn', //function to execute when a search has been triggered, (word)
        sortFn: '=?', //function to execute when a sort has been triggered, (column._id, true | false (asc or desc))
        bottomFn: '=?', //function to execute when we reached the bottom
        querySearchFn: '=?',
        defaultSort: '@',
        defaultOrder: '@',
        hideList: '=?',

        pButtons: '=?buttons',

        tableClass: '=?',

        //style
        tableHeight: '=?'
      },
      link: function(scope, element, attrs, ngModel){

        lykConsole.dev("[noviceList]");

        scope.__do = function(){
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
          if(typeof scope.sortFn === 'function'){
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

        scope.selectFn = selectFn;
        scope.searchFn = searchFn;
        scope.actionFn = actionFn;
        function selectFn(elem){
          lykConsole.dev("[noviceList]", "selectFn");
          if(typeof scope.pSelectFn === 'function'){
            scope.pSelectFn(elem);
          }
        }
        function searchFn(tag){
          lykConsole.dev("[noviceList]", "searchFn");
          if(typeof scope.pSearchFn === 'function'){
            scope.pSearchFn(tag);
          }
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

        // on init
        scope.defaultSort = scope.defaultSort || "";
        if(scope.defaultSort){
          scope.setSort(scope.defaultSort, true);
        }

        scope.loaded = true;

        scope.$watchCollection("pButtons", function(newValue) {
          scope.buttons = angular.isArray(newValue) ? newValue : [];
        }, true);

        scope.$watchCollection("model", function(newValue) {
          scope.rows = newValue;
        }, true);

        scope.$watchCollection("pColumns", function(newValue) {

          if(!angular.isArray(newValue)){
            scope.columns = [];
            return;
          }

          var rawColumns = angular.copy(newValue);

          scope.actionsColumn = rawColumns
          .filter(function(column){
            return (column && angular.isObject(column) && column.type === "actions");
          });
          scope.actionsColumn = scope.actionsColumn.length > 0 ? scope.actionsColumn[0] : undefined;

          scope.columns = rawColumns
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

        }, true);

      }
      // END - link
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

        //display
        hideFilters: '=?',

        // (noviceList params)
        querySearchFn: '=?',
        pSelectFn: '=?selectFn',
        tableHeight: '=?'
      },
      link: function(scope, element, attrs){
        var limit = 50;
        var page = 0;
        var sort = "";
        var order = "";
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
          params[paramsNames.search] = scope.search ? encodeURIComponent(scope.search) : undefined;

          ['limit','page','sort','order','search'].forEach(
            function(p){
              if(typeof params[paramsNames[p]] === "undefined" || params[paramsNames[p]] === ""){
                delete params[paramsNames[p]];
              }
            }
          );

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

angular.module("noviceDirectives")
.directive("noviceInputList", ['$timeout', '$q', function($timeout, $q){
  return {
    restrict: 'E',
    require: ['ngModel'],
    templateUrl: function(elem, attrs) {
      return attrs.templateUrl || 'novice/template/novice-inputs/novice-input-list.html';
    },
    scope: {
      options: "=?options"
    },
    controllerAs: 'vm',
    bindToController: true,
    controller: function(){

      var vm = this;

      function getOptions(){
        return vm.options && angular.isObject(vm.options) && !angular.isArray(vm.options) ? vm.options : {};
      }

      this.newValue = {text: ''};

      this.duplicates = [];

      this.getOptions = getOptions;

      this.add = function(){
        this.touched = true;

        var options = getOptions();
        var v = this.newValue;
        if(!options.allowEmpty && !v.text){
          return;
        }
        this.model.push(v);
        this.newValue = {text: ''};
      };

      this.remove = function(i){
        this.touched = true;
        
        this.model.splice(i,1);
      }
    },
    link: function(scope, elem, attrs, ctrls){

      var ngModel = ctrls[0];

      scope.getCtrl = function(){
        return ngModel;
      }

      // validator for required
      ngModel.$validators.required = function(modelValue, viewValue) {
        var value = modelValue || viewValue || [];
        if (scope.vm.getOptions().required && !value.length) {
          return false;
        }
        return true;
      };

      ngModel.$validators.emptyNotAllowed = function(modelValue, viewValue) {
        var value = modelValue || viewValue || [];
        if (!scope.vm.getOptions().allowEmpty && value.length) {
          return !value.some(function(v){
            return ngModel.$isEmpty(v);
          });
        }
        return true;
      };

      ngModel.$validators.duplicates = function(modelValue, viewValue) {
        var value = modelValue || viewValue || [];
        if (scope.vm.getOptions().disallowDuplicates && value.length) {
          if(value.some(function(v, i){
            return value.some(function(v2, i2){
              if(i2 != i && v2 == v){
                scope.vm.duplicates = [i,i2];
                return true;
              }
              return false;
            });
          })){
            return false;
          }
        }
        scope.vm.duplicates = [];
        return true;
      };

      scope.$watch('vm.model', function(value) {
        ngModel.$setViewValue(value.map(function(v){return v.text;}));
        ngModel.$validate();
      }, true);

      ngModel.$render = function() {
        if (!angular.isArray(ngModel.$viewValue)) {
          ngModel.$viewValue = [];
        }
        scope.vm.model = ngModel.$viewValue.map(function(text){return {text: text};});
      }
    }
  }
}]);