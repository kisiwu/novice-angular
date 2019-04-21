angular.module('novice/template/novice-list/novice-list.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('novice/template/novice-list/novice-list.html',
    "<div lyk-stick-container class=\"novice-list list-container scroll-1\" lyk-on-bottom=\"__do('bottomFn')\" >"+
    "<table lyk-stick"+
      "stick-if=\"youCanStickTheHeader\""+
      "stick-watch=\"rows\""+
      "ng-show=\"loaded\""+
      "class=\"table header-fixed {{tableClass}}\""+
      "ng-hide=\"hideList\">"+
      "<thead>"+
        "<tr>"+
        "<th ng-if=\"pCheckboxes\""+
            ">"+
          "<label>"+
          "<input type=\"checkbox\""+ 
                "class=\"check-one\""+ 
                "ng-click=\"checkAll()\" />"+
          "<span></span>"+
          "</label>"+
        "</th>"+
        "<th ng-repeat=\"column in columns\""+
            "lyk-ng-repeat-listen-to=\"'last'\""+
            "lyk-ng-repeat-do=\"setYouCanStickTheHeader()\""+
            "ng-click=\"column.sortable ? setSort(column.id, null, null, column) : __doNothing()\""+
            "ng-class=\"column.sortable ? 'clickable' : 'cursor-default'\""+
            "class=\"{{column.name}} {{column.class}}\">"+

          "<span>{{column.name}}</span>"+
          "<span class=\"caret \" ng-class=\"{'caret-up': order}\" ng-show=\"isSortedBy(column.id)\"></span>"+
        "</th>"+
        "<th ng-if=\"actionsColumn || buttons.length > 0\" class=\"{{actionsColumn.class}}\">"+
          "{{actionsColumn.name || 'actions'}}"+
        "</th>"+
        "</tr>"+
      "</thead>"+
      "<tbody>"+
        "<tr ng-repeat=\"elem in rows | filter: querySearchFn | orderBy:sort:reverse\""+
            "ng-click=\"__do('selectFn', elem, true); activeRow(elem);\""+
            "ng-class=\"{'active': isActiveRow(elem)}\">"+
          "<td ng-if=\"pCheckboxes\""+
              ">"+
            "<label>"+
            "<input type=\"checkbox\""+ 
                "class=\"check-one\" />"+
            "<span></span>"+
            "</label>"+
          "</td>"+
          "<td ng-repeat=\"column in columns\" class=\"{{column.class}}\">"+
              "<span ng-if=\"getType(elem, column.id, column) == 'array'\" ng-repeat=\"tag in getArray(elem, column.id, column)\">"+
                "<span class=\"tag\" ng-click=\"__do('searchFn', tag)\">{{tag}}</span>"+
              "</span>"+
              "<span ng-if=\"!(getType(elem, column.id, column) == 'array')\">"+
                "{{getValue(elem, column.id, column)}}"+
              "</span>"+
          "</td>"+
          "<td ng-if=\"actionsColumn || buttons.length > 0\" class=\"{{actionsColumn.class}}\">"+
            "<button type=\"button\" ng-repeat=\"button in buttons\" class=\"btn btn-action {{button.class}}\" ng-click=\"__do('actionFn', button, elem, $parent.$index, rows);\">"+
              "{{button.name}}"+
            "</button>"+
          "</td>"+
        "</tr>"+
      "</tbody>"+
    "</table>"+
    "</div>");
}]);
