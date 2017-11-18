angular.module('noviceRouter').run(
  function($rootScope, $window, $location, lykConsole, noviceRouterService){

    $rootScope.router = noviceRouterService;

    $rootScope.$on('$routeChangeStart', function (event, current) {
        if(!current){
          lykConsole.error("404 NO ROUTE");
          return;
        }
        var NoviceRoute = current.$$route;
        if(!NoviceRoute){
          return;
        }
        $rootScope._routeName = NoviceRoute.name;
        $rootScope._templateUrl = NoviceRoute.templateUrl;
        $rootScope._path = NoviceRoute.originalPath;
        $rootScope._controller = NoviceRoute.controller || '';
        lykConsole.dev("[RUN]",$rootScope._routeName || '', $rootScope._path);
        //console.log(NoviceRoute);
        //console.log(current);
        /*if(IOTRoute && IOTRoute.permissions && IOTRoute.name){
          var IOTPermissions = IOTRoute.permissions;
          if(!IOTSecurityService.isAuthenticated()){
            $rootScope.hideBody = true;
            event.preventDefault();
            $window.location.href = './login.html';
            return;
          }
          if(Array.isArray(IOTPermissions)){
            for(var iPerm = 0; iPerm < IOTPermissions.length ; iPerm++){
              if(!IOTSecurityService.hasPermission(IOTRoute.name,IOTPermissions[iPerm], true)){
                  $rootScope.hideBody = true;
                  $location.path("/");
                  return;
                  break;
              }
            }
          }
          else{

            if(!IOTSecurityService.hasPermission(IOTRoute.name,null, true)){
              $rootScope.hideBody = true;
                $location.path("/");
                return;
            }
            console.debug("PERMISSIONS OK");
            console.log("CURRENT", current);
          }*/
        });
  }
);
