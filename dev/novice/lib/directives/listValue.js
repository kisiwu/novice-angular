angular.module("noviceDirectives")
.directive("listValue", function($timeout, $q){
  return {
    restrict: 'E',
    require: ['ngModel'],
    templateUrl: function(elem, attrs) {
      return attrs.templateUrl || 'novice/template/novice-inputs/list-value.html';
    },
    scope: {
      options: "=?options"
    },
    controllerAs: 'vm',
    bindToController: true,
    controller: function($scope){

      var vm = this;

      function getOptions(){
        return vm.options && angular.isObject(vm.options) && !angular.isArray(vm.options) ? vm.options : {keys: []};
      }

      function createNewValue(){
        var nv = {id: ''};
        if(vm.currentKeys.length){
          nv.id = vm.currentKeys[0];
        }
        vm.newValue = nv;
      }

      vm.keys = angular.isArray(getOptions().keys) ? getOptions().keys : [];
      vm.currentKeys = [];

      function updateKeys(){
        vm.keys = angular.isArray(getOptions().keys) ? getOptions().keys : [];
        vm.currentKeys = [];
        //fill currentKeys
        vm.keys.forEach(element => {
          if (!vm.model.some(
            function (m) {
              return m.id == element;
            }
          )) {
            vm.currentKeys.push(element);
          }
        });
        if(!(vm.newValue && vm.newValue.id))
          createNewValue();
      }

      $scope.$watch("vm.options", updateKeys, true);

      this.duplicates = [];

      this.getOptions = getOptions;

      

      this.add = function(){
        this.touched = true;

        var options = getOptions();
        var v = this.newValue;

        console.log(v)

        if(!v.id || typeof v.value == "undefined" || v.value == ""){
          return;
        }

        this.model.push(v);

        var pos = this.currentKeys.indexOf(v.id);
        if(pos != -1){
          this.currentKeys.splice(pos, 1);
        }

        createNewValue();
      };

      this.remove = function(i){
        this.touched = true;
        
        if(this.model[i].id && this.currentKeys.indexOf(this.model[i].id) == -1){
          this.currentKeys.push(this.model[i].id);
        }

        this.model.splice(i,1);
      };

      //----- ctrl start -----

      // create this.newValue
      createNewValue();
    },
    link: function(scope, elem, attrs, ctrls){

      var ngModel = ctrls[0];

      scope.getCtrl = function(){
        return ngModel;
      }

      // validator for required
      /*ngModel.$validators.required = function(modelValue, viewValue) {
        var value = modelValue || viewValue || [];
        if (scope.vm.getOptions().required && !value.length) {
          return false;
        }
        return true;
      };*/

      ngModel.$validators.emptyNotAllowed = function(modelValue, viewValue) {
        var value = modelValue || viewValue || [];
        /*if (!scope.vm.getOptions().allowEmpty && value.length) {
          return !value.some(function(v){
            return ngModel.$isEmpty(v);
          });
        }
        return true;*/
        return true;
      };

      /*ngModel.$validators.duplicates = function(modelValue, viewValue) {
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
      };*/

      scope.$watch('vm.model', function(value) {
        var viewVal = {};
        value.map(function(v){
          return viewVal[v.id] = v.value;
        });
        ngModel.$setViewValue(viewVal);
        ngModel.$validate();
      }, true);

      ngModel.$render = function() {
        if (! (ngModel.$viewValue && angular.isObject(ngModel.$viewValue) && !angular.isArray(ngModel.$viewValue)) ) {
          ngModel.$viewValue = {};
        }
        scope.vm.model = Object.keys(ngModel.$viewValue).map(function(k){return {id: k, value: ngModel.$viewValue[k]};});
      }
    }
  }
});