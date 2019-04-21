angular.module('nApp', [
  //'novice.tpls', // to preload templates
  'noviceServices' // to use noviceServices providers
]);

angular.module('nApp').constant("NOVICE_ROUTES", [
  {
    main: true,
    name: "home2",
    path: '/',
    templateUrl: 'view.html',
    controller: "devCtrl",
    resolve: "customResolve"
  },
  {
	  name: "tuto",
	  baseUrl: "/tuto",
	  routes: [
    {path: '/', templateUrl: 'view.html'},
		{path: '/step1', templateUrl: 'view.html'},
		{path: '/step2', templateUrl: 'view.html'},
    {name: 'tuto_finally' , path: '/finally/', templateUrl: 'view.html'}
	  ]
  },
  {
    name: "users",
    baseUrl: '/users',
    routes: [
      {name: "user_details", path: '/:id', templateUrl: 'view.html'}
    ]
  }
])

angular.module('nApp')
.config(
  function($locationProvider,
    ResolveProvider, lykXhrProvider, lykConsoleProvider, noviceStorageProvider){

    noviceStorageProvider.setPrefix("_outerhaven_");

    lykConsoleProvider.setDev(true);

    ResolveProvider.add("customResolve", {custom: function(){return "DAMN!"}});

    lykXhrProvider.routes(
      {
        "iotfactory": {
          "countries": {
            method: 'GET',
            url: 'https://report.phoryapp.com' + '/api/countries'
          }
        }
      }
    )
  }
);


angular.module('nApp')
.controller("devCtrl",
  function($scope, custom, lykConsole, lykPropertyAccess, noviceUtils, lykXhr,
  noviceStorage, $localStorage, $timeout){

    noviceUtils.onDestroy.cancelTimeouts($scope);

    noviceStorage.set("something", 'its value')
    lykConsole.debug(noviceStorage.getStorage());


    var listHandler;

    $scope.timeouts = {};

    $scope.getManualHandler = function(h){
      listHandler = h;
      $scope.timeouts = $timeout(function(){
        listHandler(function(list){
          list[1] = ({_id: "AAA", name: "aaa great A"})
        });
      }, 5000);
    }

    $scope.myButtons = [
    {
      name: "Alert",
      class: "btn-warning btn-xs  yellow darken-2",
      state: "warning",
      action: function(elem, i){
        lykConsole.dev(elem);
      }
    },
    {
      name: "Delete",
      class: "btn-danger btn-xs red darken-2",
      state: "danger",
      action: function(elem, i, data){
        lykConsole.dev(elem);
        data.some(function(el, idx){
          if(el._id === elem._id){
            data.splice(idx, 1);
            return true;
          }
        });
      }
    }
  ];

    $scope.countriesCols = [
      {id:'_id', sortable: true, class: "col-xs-1 darker-bg"},
      {id:'name', sortable: true, class: "col-xs-3"},
      {type: "actions", name:"DoSum", class: "col-xs-8"}
    ];

    $scope.querySearchFn = function(entry, search){
      var props = ['_id', 'name'];

      //lykConsole.dev(search);

      return noviceUtils.found(
        props.map(function(p){
          return lykPropertyAccess.getValue(entry, p);
        }),
        search,
        true
      );
    };
  }
);
