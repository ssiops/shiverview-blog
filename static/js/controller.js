(function (angular) {
angular.module('shiverview')
.controller('blogArchiveCtrl', ['$scope', '$http', '$routeParams', '$location', '$filter', '$rootScope', 'user', 'markdown', function ($scope, $http, $params, $location, $filter, $rootScope, user, markdown) {
  $scope.user = user.get();
  if ($scope.user && typeof $scope.user.then === 'function')
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
        date: /date:[0-9]{4}-[0-9]{2}/g,
        page: /page:[0-9]+/g
      }
      if (patterns.title.test($params.expression))
        return $scope.retrieve($params.expression);
      var label;
      var date;
      var page;
      if (label = patterns.label.exec($params.expression))
        $scope.query.label = label[0].split(':')[1];
      if (date = patterns.date.exec($params.expression))
        $scope.query.date = date[0].split(':')[1];
      if (page = patterns.page.exec($params.expression))
        $scope.query.page = page[0].split(':')[1];
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
      url: '/blog/archive/' + article.title + '/comment',
      method: 'get'
    }).then(function (res) {
      article.comments = res.data;
      for (var i = 0; i < article.comments.length; i++)
        $scope.queryCommentAuthor(article.comments[i]);
    }, function (res) {
      $rootScope.$broadcast('errorMessage', res.data.message);
    });
  };
  $scope.autoRetrieveComments = function (article) {
    if (!article.comments)
      $scope.retrieveComments(article);
  };
  $scope.queryCommentAuthor = function (comment) {
    user.query(comment.author)
    .then(function (res) {
      comment.user = res.data;
    }, function (res) {
      $rootScope.$broadcast('errorMessage', res.data.message);
    });
  };
  $scope.submitComment = function (e, article) {
    if (e) e.preventDefault();
    $http({
      url: '/blog/archive/' + article.title + '/comment',
      data: {content: article.newComment},
      method: 'post'
    })
    .then(function (res) {
      article.newComment = '';
      $scope.retrieveComments(article);
    }, function (res) {
      $rootScope.$broadcast('errorMessage', res.data.message);
    });
  };
  $scope.updateComment = function (e, comment) {
    if (e) e.preventDefault();
    $http({
      url: '/blog/archive/' + comment.origin + '/comment/' + comment._id,
      data: {content: comment.edit},
      method: 'put'
    })
    .then(function (res) {
      comment.content = comment.edit;
      comment.editing = false;
      $rootScope.$broadcast('successMessage', 'Comment updated.');
    }, function (res) {
      $rootScope.$broadcast('errorMessage', res.data.message);
    });
  };
  $scope.removeComment = function (comment, article) {
    if (comment.removing) {
      $http({
        url: '/blog/archive/' + article.title + '/comment/' + comment._id,
        method: 'delete'
      }).then(function () {
        $scope.retrieveComments(article);
        $rootScope.$broadcast('successMessage', 'Comment removed.');
      }, function (res) {
        $rootScope.$broadcast('errorMessage', res.data.message);
      });
    } else {
      comment.removing = true;
    }
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
