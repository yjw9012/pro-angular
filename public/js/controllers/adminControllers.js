/**
 * Created by yjw9012 on 3/12/16.
 */
angular.module("sportsStoreAdmin")
    .factory('productStorage', function ($http) {
        return {
            getOrders: function () {
                var url = "/order/get";
                return $http.get(url);
            },
            createProduct: function (product) {
                var url = "/product/new";
                return $http.put(url, product);
            },
            getProducts: function () {
                var url = "/product/get";
                return $http.get(url);
            },
            update: function (product) {
                var url = "/product/update";
                return $http.post(url, JSON.stringify(product));
            },
            delete: function(id) {
                var url = "/product/delete";
                return $http.post(url, JSON.stringify({id: id}));
            }
        };
    })
    .controller("authCtrl", function ($scope, $location) {
        $scope.authenticate = function (user, pass) {
            // RethinkDB does not have access control.
            $location.path("/main");

            /*
             $http.post(authUrl, {username: user, password: pass}, {withCredentials: true})
             .success(function (data) {
             $location.path("/main");
             })
             .error(function (error) {
             $scope.authenticationError = error;
             });
             */
        }
    })
    .controller("mainCtrl", function ($scope) {
        $scope.screens = ["Products", "Orders"];
        $scope.current = $scope.screens[0];

        $scope.setScreen = function (index) {
            $scope.current = $scope.screens[index];
        }

        $scope.getScreen = function () {
            return $scope.current == "Products"
                ? "views/adminProducts.html" : "views/adminOrders.html";
        }
    })
    .controller("ordersCtrl", function ($scope, $http, productStorage) {
        productStorage.getOrders().success(function (data) {
            $scope.orders = data;
        }).error(function (error) {
            $scope.error = error;
        });

        $scope.selectedOrder;

        $scope.selectOrder = function (order) {
            $scope.selectedOrder = order;
        };

        $scope.calcTotal = function (order) {
            var total = 0;
            for (var i = 0; i < order.products.length; i++) {
                total += order.products[i].count * order.products[i].price;
            }
            return total;
        }
    });