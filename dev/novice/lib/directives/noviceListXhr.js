angular.module("noviceDirectives").
    directive('noviceListXhr', function(lykPropertyAccess, $timeout, lykXhr, lykConsole){

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

          lykXhr.execute(scope.xhr, {params: params}).then(
            function(data){
              if(!data){
                return lykConsole.dev("No data");
              }
              if(angular.isArray(data)){
                if(makeNewList){
                  scope.myList = data;
                }
                else{
                  scope.myList = scope.myList.concat(data);
                }
              }
              else if(angular.isObject(data)){
                if(angular.isArray(data.data)){
                  return lykConsole.dev("No data");
                }
                if(makeNewList){
                  scope.myList = data.data;
                }
                else{
                  scope.myList = scope.myList.concat(data.data);
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
    });
