/**
 * Created by yjw9012 on 3/6/16.
 */
/*global todomvc */
'use strict';

/**
 * Services that persists and retrieves TODOs from localStorage
 */
angular.module('sportsStore')
    .factory('productStorage', function ($http) {
        var STORAGE_ID = 'products-angularjs';

        return {
            get: function () {
                var url = "/product/get";
                return $http.get(url);
            },
            create: function (product) {
                var url = "/product/new";
                return $http.put(url, product);
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
});
