(function (angular) {
angular.module('shiverview')
.controller('blogArchiveCtrl', ['$scope', '$http', '$routeParams', '$location', '$filter', '$rootScope', 'user', 'markdown', function ($scope, $http, $params, $location, $filter, $rootScope, user, markdown) {
  $scope.user = user.get();
  if (typeof $scope.user.then === 'function')
    $scope.user.then(function () { $scope.user = user.get(); });
  $scope.articles = [];
  $scope.markdown = markdown;
  $scope.params = $params;
  $scope.query = {};
  $scope.filter = {};
  $scope.calendar = [];
  $scope.parse = function () {
    if ($params.expression) {
      var patterns = {
        title: /^[0-9]{4}-[0-9]{2}-[\w-]+$/g,
        label: /label:\w+/g,
        date: /date:[0-9]{4}-[0-9]{2}/g
      }
      if (patterns.title.test($params.expression))
        return $scope.retrieve($params.expression);
      var label;
      var date;
      if (label = patterns.label.exec($params.expression))
        $scope.query.label = label[0].split(':')[1];
      if (date = patterns.date.exec($params.expression))
        $scope.query.date = date[0].split(':')[1];
    }
    $scope.retrieve($scope.query);
  };
  $scope.retrieve = function (query) {
    var url = '/blog/archive/';
    if (typeof query === 'string') {
      url = url + query;
      query = {}
    }
    $http({
      url: url,
      params: query,
      method: 'get'
    }).then(function (res) {
      if (res.data instanceof Array) {
        $scope.articles = res.data;
        //for (var i = 0; i < max(2, $scope.articles.length); i++)
        //  $scope.retrieveComments($scope.articles[i]);
      } else {
        $scope.articles = [res.data];
      }
    }, function (res) {
      $rootScope.$broadcast('errorMessage', res.data.message);
    });
  };
  $scope.remove = function (article) {
    if (!$scope.user.admin)
      return;
    if (article.removing) {
      $http({
        url: '/blog/archive/' + article.title,
        method: 'delete'
      }).then(function () {
        if (typeof $scope.query === 'string')
          $location.url('/blog');
        else
          $scope.retrieve($scope.query);
      }, function (res) {
        $rootScope.$broadcast('errorMessage', res.data.message);
      });
    } else {
      article.removing = true;
    }
  };
  $scope.retrieveComments = function (article) {
    $http({
      url: '/blog/archive/' + article.title + '/comments',
      method: 'get'
    }).then(function (res) {
      article.comments = res.data;
    }, function (res) {
      $rootScope.$broadcast('errorMessage', res.data.message);
    });
  };
  $scope.retrieveLabels = function () {
    $http({
      url: '/blog/labels',
      method: 'get'
    }).then(function (res) {
      $scope.labels = res.data;
      // TODO: detect label.style.background-color and change text color
      if ($scope.query.label) {
        for (var i = 0; i < $scope.labels.length; i++) {
          if ($scope.labels[i].title == $scope.query.label) {
            $scope.filter.label = $scope.labels[i];
            break;
          }
        }
      }
    }, function (res) {
      $rootScope.$broadcast('errorMessage', res.data.message);
    });
  };
  $scope.generateCalendar = function () {
    $http({
      url: '/blog/archive',
      params: {
        reverse: true,
        limit: 1
      },
      method: 'get'
    }).then(function (res) {
      var old;
      if (res.data.length < 1)
        old = new Date()
      else
        old = new Date(res.data[0].date)
      var d = new Date();
      var n = d.getFullYear();
      var y;
      while (d.getTime() > old.getTime()) {
        y = d.getFullYear();
        if (typeof $scope.calendar[n - y] === 'undefined')
          $scope.calendar.push({year: y, months: []});
        $scope.calendar[n - y].months.unshift({
          month: ('0' + (d.getMonth() + 1)).slice(-2),
          name: $filter('date')(d, 'MMM')
        });
        d.setMonth(d.getMonth() - 1);
      }
      if (d.getMonth() == old.getMonth()) {
        if (typeof $scope.calendar[n - y] === 'undefined')
          $scope.calendar.push({year: y, months: []});
        $scope.calendar[n - y].months.unshift({
          month: ('0' + (d.getMonth() + 1)).slice(-2),
          name: $filter('date')(d, 'MMM')
        });
      }
    }, function (res) {
      $rootScope.$broadcast('errorMessage', res.data.message);
    });
  };
  $scope.updateQuery = function (query) {
    for (var i in query)
      $scope.query[i] = query[i];
    var newQuery = [];
    for (var key in $scope.query)
      newQuery.push(key + ':' + $scope.query[key]);
    $location.url('/blog/archive/' + newQuery.join('+'));
  };

  $scope.parse();
  $scope.retrieveLabels();
  $scope.generateCalendar();
}]);
})(window.angular);
