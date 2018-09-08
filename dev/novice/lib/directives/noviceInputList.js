angular.module("noviceDirectives")
.directive("noviceInputList", function($timeout, $q){
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
});