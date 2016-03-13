/**
 * Created by yjw9012 on 3/6/16.
 */
angular.module('sportsStore')
    .controller("sportsStoreCtrl", function ($scope, $location, productStorage, cart) {
        $scope.data = {};

        productStorage.get().success(function (data) {
            $scope.data.products = data;
        }).error(function (error) {
            $scope.data.error = error;
        });

        $scope.sendOrder = function (shippingDetails) {
            var order = angular.copy(shippingDetails);
            order.products = cart.getProducts();
            productStorage.create(order).success(function (data) {
                $scope.data.orderId = data.id;
                cart.getProducts().length = 0;
            }).error(function (error) {
                $scope.data.orderError = error;
            }).finally(function () {
                $location.path("/complete");
            });
        }

    });