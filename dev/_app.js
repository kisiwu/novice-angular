angular.module('nApp', []);

angular.module('nApp').constant("NOVICE_ROUTES", [
  {
    main: true,
    name: "home2",
    path: '/',
    templateUrl: 'view.html',
    //controller: "devCtrl",
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
  function($locationProvider, ResolveProvider, lykXhrProvider, lykConsoleProvider){
    ResolveProvider.add("customResolve", {custom: function(){return "DAMN!"}});
  }
);
