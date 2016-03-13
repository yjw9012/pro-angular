/**
 * Created by yjw9012 on 3/13/16.
 */
angular.module("sportsStoreAdmin")
    .controller("productCtrl", function ($scope, productStorage) {
        $scope.listProducts = function () {
            productStorage.getProducts().success(function (data) {
                $scope.products = data;
            }).error(function (error) {
                console.log(error.message);
            });
        };

        $scope.deleteProduct = function (product) {
            productStorage.delete(product.id).success(function (data) {
                $scope.products.splice($scope.products.indexOf(product), 1);
            }).error(function (error) {
                console.log(error.message);
            })
        };

        $scope.createProduct = function (product) {
            productStorage.createProduct(product).success(function (data) {
                $scope.products.push(data);
                $scope.editedProduct = null;
            }).error(function (error) {
                console.log(error.message);
            })
        };

        $scope.updateProduct = function (product) {
            productStorage.update(product).success(function (data) {
                $scope.editedProduct = null;
            }).error(function (error) {
                console.log(error.message);
            })
        };

        $scope.startEdit = function (product) {
            $scope.editedProduct = product;
        };

        $scope.cancelEdit = function () {
            $scope.editedProduct = null;
        };

        $scope.listProducts();
    });