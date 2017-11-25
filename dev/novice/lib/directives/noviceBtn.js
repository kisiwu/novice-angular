angular.module("noviceDirectives").
    directive('noviceBtn', function($compile, $http, $templateCache){

      return {
        restrict: 'A',
        replace: false,
        templateUrl: function(element, attrs) {
          var tpl;
          if(attrs.noviceBtn){
            tpl = attrs.noviceBtn.toLowerCase();
          }

          var tpls = [
            'default',
            'danger',
            'warning',
            'info'
          ];

          // default template
          if(!~tpls.indexOf(tpl))
            tpl = tpls[0];

          return 'novice/template/novice-btn/'+tpl+'.html';
        },
        transclude: true,
        scope: {
          noviceBtn: '='
        }/*,
        controller: function($scope, $element, $attrs){
          var render = function (c){
            $element.replaceWith(c);
            $compile($element.contents())($scope);
          };

          var renderCache = function(){
            render($templateCache.get('novice/template/novice-btn/'+$scope.noviceBtn+'.html'));
          };

          if($scope.noviceBtn){
            if(angular.isDefined($templateCache.get('novice/template/novice-btn/'+$scope.noviceBtn+'.html'))){
              renderCache();
            }
            else{
              $http.get('novice/template/novice-btn/'+$scope.noviceBtn+'.html').then(function (res) {
                $templateCache.put('novice/template/novice-btn/'+$scope.noviceBtn+'.html', res.data );
                renderCache();
              });
            }
          }
        }*/
      }

    });
