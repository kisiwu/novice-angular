angular.module("noviceDirectives").
    directive('noviceList', function(lykPropertyAccess, $timeout, lykConsole){

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

        tableClass: '=?'
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
    });
