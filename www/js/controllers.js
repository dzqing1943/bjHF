/**
 * Created by bj-dzq on 10/10/16.
 */
angular.module('bjApp.controllers', ['bjApp.services'])
  .factory("Utility", function (AuthenticationService) {
    return {
      handleUnauthenticated: function ($state, $ionicPopup, $ionicViewSwitcher) {
        $ionicPopup.alert({ title: '获取用户信息失败', template: "请重新登陆，谢谢！", okText: '确定' }).then(function () {
          AuthenticationService.logout();
          $ionicViewSwitcher.nextDirection('forward');
          $state.go('login');
        });
      },
      checkIsLogin: function(status){
        if(status == 403)
          return false;
        return true;
      }
    }
  })
  .controller('LoginCtrl', function ($scope, $state, $ionicPopup, $ionicHistory, $ionicViewSwitcher, $ionicLoading, AuthenticationService) {
    $scope.user = {
      name: null,
      password: null
    };

    $scope.doLogin = function() {
      var user = $scope.user;

      $ionicLoading.show({
        template: '用户登录中...'
      });
      AuthenticationService.login({ name: user.name, password: user.password }).success(function (data, status, headers, config) {
        $ionicLoading.hide();
        if (data.success !== true) {
          $ionicPopup.alert({ title: '用户登录失败', template: data.data.message, okText: '确定' });
        }
        else {
          $ionicHistory.nextViewOptions({
            disableBack: true
          });

          $ionicViewSwitcher.nextDirection('forward');
          $state.go('list', {}, {reload: true });
        }
      }).error(function (data, status, headers, config) {
        $ionicLoading.hide();
        $ionicPopup.alert({ title: '用户登录失败', template: '请检查您的网络连接是否正常！', okText: '确定' });
      });
    }
  })
  .controller('ListCtrl', function ($scope, $state, $ionicPopup, $ionicHistory, $ionicViewSwitcher, $ionicLoading, $cordovaBarcodeScanner, AuthenticationService,
                                    OrderService, Utility) {
    $scope.now = new Date();
    $scope.doLogout = function () {
      $ionicViewSwitcher.nextDirection('back');
      AuthenticationService.logout();
      $state.go("login");
    };

    $scope.shopCar = function () {
      $ionicPopup.alert({ title: '百精玉石', template: '兄弟！购物车在这里了。', okText: '确定' });
    };

    $scope.getlist = function (orderId) {
      $ionicViewSwitcher.nextDirection('forward');
      $state.go("detail", {orderId: orderId}, {reload: true});
    };

    var working = false;
    var doScan = function(){
      if(working)
        return;

      working = true;
      $cordovaBarcodeScanner.scan().then(function(imageData) {
        if(imageData.text != null && imageData.text != ''){
          $ionicPopup.alert({ title: '扫描成功', template: "货品:" + imageData.text, okText: '确定' }).then(function () {
            $ionicLoading.show({
              template: '货品查询中...'
            });
            OrderService.itemByCode(imageData.text).success(function(data, status){
              $ionicLoading.hide();

              if(!Utility.checkIsLogin(data.code)){
                Utility.handleUnauthenticated($state, $ionicPopup, $ionicViewSwitcher);
                return;
              }

              if(data.success && data.data != null){
                $ionicViewSwitcher.nextDirection('forward');
                $state.go("detail", {orderId: data.data.id}, {reload: true});
              }
              else {
                $ionicPopup.alert({title: '百精玉石', template: '没有这个货吧，兄弟～', okText: '确定'}).then(function(){
                  $ionicViewSwitcher.nextDirection('back');
                  $state.go("list");
                });
              }
            }).error(function(data, status){
              $ionicLoading.hide();

              if(!Utility.checkIsLogin(status)){
                Utility.handleUnauthenticated($state, $ionicPopup, $ionicViewSwitcher);
                return;
              }

              $ionicPopup.alert({ title: '货品查询失败', template: '请检查您的网络连接是否正常！', okText: '确定' });
            });
          });
        }
        else{
          $ionicPopup.confirm({ title: '扫描失败',
            template: '是否重新扫描?',
            cancelText: '取消',
            okText: '重新扫描'
          }).then(function(yes) {
            if (yes)
              doScan();
            else {
              $ionicViewSwitcher.nextDirection('back');
              $state.go("list");
            }
          });
        }
        working = false;
      }, function(error) {
        $ionicPopup.alert({ title: '扫描失败', template: error, okText: '确定' }).then(function () {
          $ionicViewSwitcher.nextDirection('back');
          $state.go("list");
        });
        working = false;
      });
    };

    $scope.goScan = doScan;

    $scope.goQuery = function(){
      $ionicViewSwitcher.nextDirection('forward');
      $state.go("query");
    };

    $ionicLoading.show({
      template: "货品加载中..."
    });

    OrderService.all().success(
      function(data, status){
        $ionicLoading.hide();

        if(!Utility.checkIsLogin(data.code)){
          Utility.handleUnauthenticated($state, $ionicPopup, $ionicViewSwitcher);
          return;
        }

        if(data.success){
          $scope.orders = data.data;
        }
      }).error(
      function(data, status){
        $ionicLoading.hide();

        if(!Utility.checkIsLogin(status)){
          Utility.handleUnauthenticated($state, $ionicPopup, $ionicViewSwitcher);
          return;
        }

        $ionicPopup.alert({ title: '货品加载失败', template: '请检查您的网络连接是否正常！', okText: '确定' });
      });
  })
  .controller('DetailCtrl', function ($scope, $state, $ionicPopup, $ionicHistory, $ionicSlideBoxDelegate, $ionicScrollDelegate, $ionicViewSwitcher, $ionicLoading,
                                      $stateParams, OrderService, Utility) {
    $scope.goList = function () {
      $ionicViewSwitcher.nextDirection('back');
      $state.go("list");
    };

    $scope.shopCar = function () {
      $ionicPopup.alert({ title: '百精玉石', template: '兄弟！购物车在这里了。', okText: '确定' });
    };

    $scope.goBack = function(){
      $ionicViewSwitcher.nextDirection('back');
      $ionicHistory.goBack();
    };

    $scope.doBuy = function(){
      $ionicPopup.alert({ title: '百精玉石', template: '兄弟！拿着钱再买可以吗。', okText: '确定' });
    };

    $ionicLoading.show({
      template: '货品信息加载中...'
    });

    OrderService.detailById($stateParams.orderId).success(
      function(data, status){
        $ionicLoading.hide();

        if(!Utility.checkIsLogin(data.code)){
          Utility.handleUnauthenticated($state, $ionicPopup, $ionicViewSwitcher);
          return;
        }

        if(data.success){
          $scope.data = data.data;
        }
      }).error(
      function(data, status){
        $ionicLoading.hide();

        if(!Utility.checkIsLogin(status)){
          Utility.handleUnauthenticated($state, $ionicPopup, $ionicViewSwitcher);
          return;
        }

        $ionicPopup.alert({ title: '货品信息加载失败', template: '请检查您的网络连接是否正常！', okText: '确定' });
      });
  })
  .controller('QueryCtrl', function ($scope, $state, $ionicPopup, $ionicHistory, $ionicViewSwitcher, $ionicLoading, OrderService, Utility) {
    $scope.data = { orderCode : null };

    $scope.goList = function(){
      $ionicViewSwitcher.nextDirection('back');
      $state.go("list");
    };

    $scope.doInput = function(){
      $ionicLoading.show({
        template: '货品查询中...'
      });
      OrderService.itemByCode($scope.data.orderCode).success(function(data, status){
        $ionicLoading.hide();

        if(!Utility.checkIsLogin(data.code)) {
          Utility.handleUnauthenticated($state, $ionicPopup, $ionicViewSwitcher);
          return;
        }

        if(data.success && data.data != null){
          $state.go("detail", {orderId: data.data.id}, {reload: true});
        }
        else {
          $ionicPopup.alert({title: '百精玉石', template: '没有这个货吧，兄弟～', okText: '确定'});
        }
      }).error(function(data, status){
        $ionicLoading.hide();

        if(!Utility.checkIsLogin(status)) {
          Utility.handleUnauthenticated($state, $ionicPopup, $ionicViewSwitcher);
          return;
        }

        $ionicPopup.alert({ title: '货品查询失败', template: '请检查您的网络连接是否正常！', okText: '确定' });
      });
    };
  })
  .controller('ScanCtrl', function ($scope, $state, $ionicPopup, $ionicHistory, $ionicViewSwitcher, $ionicLoading) {
    $scope.goList = function(){
      $ionicViewSwitcher.nextDirection('back');
      $state.go("list");
    };
    $scope.doScan = function(){
    };
  })
