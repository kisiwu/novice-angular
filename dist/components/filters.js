/**
 * @ngdoc module
 * @module noviceFilters
 */
angular.module('noviceFilters', [

])


angular.module('noviceFilters').filter("timeFormat", function(){
  return function(date, format, charCase) {

    if(angular.isUndefined(date)){
      return;
    }

    date = new Date(date);

    switch (charCase) {
      case 'l':
      case 'L':
        return (d3.timeFormat(format)(date)).toLowerCase();
        break;
      case 'u':
      case 'U':
      default:
        return d3.timeFormat(format)(date);
        break;
    }
  };
});
