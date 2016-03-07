/**
 * Created by yjw9012 on 3/6/16.
 */
angular.module('sportsStore')
    .controller("sportsStoreCtrl", function ($scope, productStorage) {
        $scope.data = {};

        productStorage.get().success(function (data) {
            $scope.data.products = data;
        }).error(function (error) {
            $scope.data.error = error;
        });
    });