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
        return {
            get: function () {
                var url = "/product/get";
                return $http.get(url);
            },
            create: function (order) {
                var url = "/order/new";
                return $http.put(url, order);
            }
        };
});
