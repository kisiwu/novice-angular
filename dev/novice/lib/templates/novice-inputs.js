angular.module('novice/template/novice-inputs/novice-input-list.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('novice/template/novice-inputs/novice-input-list.html',
    "<div ng-repeat=\"(i,m) in vm.model\" class=\"input-field novice-input-list\">"+
        "<i class=\"material-icons prefix\" ng-click=\"vm.remove(i)\">indeterminate_check_box</i>"+
        "<input ng-model=\"m.text\" ng-class=\"(!vm.options.allowEmpty && !m.text) || (vm.duplicates.indexOf(i) > -1) ? 'invalid':'valid'\" />"+
    "</div>"+
    "<div class=\"input-field novice-input-list\">"+
        "<i class=\"material-icons prefix\"  ng-click=\"vm.add()\">add_box</i>"+
        "<input ng-model=\"vm.newValue.text\" ng-class=\"{'invalid': vm.options.required && vm.touched && !vm.model.length}\" ng-blur=\"vm.add()\" />"+
    "</div>");
}]);
