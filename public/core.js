var holidayPack = angular.module('holidayPack', ['ngRoute']);

holidayPack.config(function($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "/public/home.html"
                // controller: "homeClt"
        })
        .when('/holiday', {
            templateUrl: "/public/holidaypackage.html"
        })
        .when('/holiday/departing/:city', {
            templateUrl: "/public/holidaypackage.html"
        })
        .when('/holiday/during/:month', {
            templateUrl: "/public/holidaypackage.html"
        })
        .otherwise({
            redirectTo: '/holiday'
        });
});
// holidayPack.directive('jque', function() {
//     console.log('Called directive');
//     return {
//         restrict: 'A',
//         link: "js/vendor/modernizr-2.8.3.min.js"
//     };
// });
// holidayPack.controller('homeClt', function($scope, $http) {


// })

holidayPack.directive('wbSelect2', function() {
    return {
        restrict: 'A',
        scope: {
            'selectWidth': '@',
            'ngModel': '='
        },
        link: function(scope, element, attrs) {
            //Setting default values for attribute params
            scope.selectWidth = scope.selectWidth || 200;
            element.select2({
                width: scope.selectWidth,
            });
        }
    };
});

// holidayPack.filter('startFrom', function() {
//     return function(input, start) {
//         start = +start; //parse to int
//         return input.slice(start);
//     }
// });


holidayPack.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
});

holidayPack.controller('mainController', function($scope, $http, $routeParams, $window, $location, $filter) {

    $scope.dealData = [];

    $scope.currentPage = 0;
    $scope.pageSize = 5;
    $scope.q = '';

    $scope.getData = function() {
        return $filter('filter')($scope.dealData, $scope.q)
    }

    $scope.numberOfPages = function() {
        return Math.ceil($scope.dealData.length / $scope.pageSize);
    }

    $scope.$watch(function() {
        return $location.path();
    }, function(value) {
        console.log('value', value);
        if (value.includes("/holiday")) {
            $scope.displayHoliday = true;
        } else {
            $scope.displayHoliday = false;
        }
    });

    // $scope.sendData = {
    //     date: "to 2018-01-" + d.getDate() + ""
    // };
    // 2018-01-09 to 2018-01-24

    //  City list in footer
    $scope.holiHader = false;
    $scope.getCity = function(departure) {
        console.log('departure', departure);

        var searchData = {
            departure: departure,
            withCity: false
        }
        $window.scrollTo(0, 0);

        $http.post('/api/getallHolidayDeal', searchData)
            .success(function(data) {
                console.log('getallHolidayDeal', data);
                if (data.status) {
                    $scope.dealData = data.data;
                    $scope.depselect = departure;
                    getDestination(departure);
                } else {
                    console.log('Something gone wrong!', data.message);
                }
            })
            .error(function(data) {
                console.log('Error: ' + data.message);
            });
    }

    // Year list in footer
    function getNext12MonthNamesWithYear() {
        var now = new Date();
        var month = now.getMonth();
        var year = now.getFullYear();

        var names = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        var short = ['jan', 'feb', 'mar', 'apr', 'may', 'jun',
            'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
        ];

        var res = [];
        for (var i = 0; i < 12; ++i) {
            res.push({
                "value": names[month] + ' ' + year,
                "text": short[month] + '-' + year
            });
            if (++month === 12) {
                month = 0;
                ++year;
            }
        }
        return res;
    }
    $scope.yearSearch = getNext12MonthNamesWithYear();

    $scope.searchWithYear = function(monthYear) {
        $window.scrollTo(0, 0);
        $scope.departureName = 'in ' + monthYear.value.split(' ')[0];
        $http.get('/api/getwithYear/' + monthYear.text)
            .success(function(data) {
                console.log('data get success', data);
                $scope.dealData = data.data;
            })
            .error(function(error) {
                console.log('Error for get data from search');
            });
    }

    $scope.GetSearch = function(data) {
        var searchData = {
            date: data.date ? data.date : "",
            departure: data.depselect ? data.depselect.departure : "",
            destination: data.desselect ? data.desselect.destination : ""
        }
        $http.post('/api/getallDeal', searchData)
            .success(function(data) {
                console.log('data', data);
                if (data.status) {
                    console.log('ok display me');
                    $scope.dealData = data.data;
                } else {
                    console.log('Something gone wrong!', data.message);
                }
            })
            .error(function(data) {
                console.log('Error: ' + data.message);
            });
    };
    $scope.getDesti = function(departure, destination) {
        console.log('departure', departure);
        console.log('destination', destination.destination);

        if (destination) {
            var searchData = {
                departure: departure,
                destination: destination.destination,
                withCity: false
            }
            $http.post('/api/getallHolidayDeal', searchData)
                .success(function(data) {
                    console.log('getallHolidayDeal', data);
                    if (data.status) {
                        $scope.dealData = data.data;
                    } else {
                        console.log('Something gone wrong!', data.message);
                    }
                })
                .error(function(data) {
                    console.log('Error: ' + data.message);
                });
        } else {
            getDestination(departure);
            var searchData = {
                departure: departure,
                withCity: false
            }
            $http.post('/api/getallHolidayDeal', searchData)
                .success(function(data) {
                    console.log('getallHolidayDeal', data);
                    if (data.status) {
                        $scope.dealData = data.data;
                    } else {
                        console.log('Something gone wrong!', data.message);
                    }
                })
                .error(function(data) {
                    console.log('Error: ' + data.message);
                });
        }

    }

    function getDestination(departure) {
        $scope.departureName = 'from ' + departure;
        $http.get('api/getDestination/' + departure)
            .success(function(data) {
                console.log('getDestination', data.data);
                $scope.destination = data.data;
            })
            .error(function(data) {
                console.log(data.message);
            })
    }
    $scope.GetallHolidayDeal = function() {
        var searchData = {
            date: $scope.date ? $scope.date : "",
            departure: $scope.depselect,
            destination: $scope.desselect ? $scope.desselect.destination : "",
            withCity: false
        }

        console.log('searchData', searchData);
        $http.post('/api/getallHolidayDeal', searchData)
            .success(function(data) {
                console.log('data', data);
                if (data.status) {
                    console.log('ok display me');
                    $scope.dealData = data.data;
                    if ($scope.date && data.data.length == 0) {
                        alert('No deals have been found in your date range. Here are some dates you may be interested in');
                    }
                } else {
                    console.log('Something gone wrong!', data.message);
                }
            })
            .error(function(data) {
                console.log('Error: ' + data.message);
            });
    }


    var searchData = {
        withCity: true
    }

    $http.post('/api/getallHolidayDeal', searchData)
        .success(function(data) {
            console.log('getallHolidayDeal', data);
            if (data.status) {
                console.log('ok display me', data.city[0].departure);
                $scope.departure = data.city;
                $scope.depselect = data.city[0].departure;
                $scope.dealData = data.data;
                getDestination(data.city[0].departure);
            } else {
                console.log('Something gone wrong!', data.message);
            }
        })
        .error(function(data) {
            console.log('Error: ' + data.message);
        });

    // Display selected data into model 
    $scope.viewModelWithData = function(val) {
        console.log('Display me ', val);
        $scope.depselect = val.departure;
        $scope.desselect = val.destination;
    }

    // For Sorting
    $scope.reverse = true;
    $scope.sortBy = function(dealName) {
        $scope.reverse = ($scope.dealName === dealName) ? !$scope.reverse : false;
        $scope.dealName = dealName;
    };

    // Footer
    $scope.currentYear = new Date().getFullYear();
});