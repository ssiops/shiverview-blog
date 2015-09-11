(function (angular) {
angular.module('shiverview')
.controller('blogArchiveCtrl', ['$scope', '$http', '$routeParams', 'user', 'markdown', function ($scope, $http, $params, user, markdown) {
  $scope.articles = [];
  $scope.user = user.get();
  $scope.markdown = markdown;
  $scope.params = $params;
  $scope.parse = function () {
    if ($params.expression) {
      var patterns = {
        title: /^[0-9]{4}-[0-9]{2}-[\w-]+$/g,
        label: /label:\w+/g,
        date: /date:[0-9]{4}-[0-9]{2}/g
      }
      if (patterns.title.test($params.expression))
        return $scope.retrieve($params.expression);
      var query = {};
      var label;
      var date;
      if (label = patterns.label.exec($params.expression))
        query.label = label[0].split(':')[1];
      if (date = patterns.date.exec($params.expression))
        query.date = date[0].split(':')[1];
      $scope.retrieve(query);
    } else {
      $scope.retrieve({});
    }
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

  $scope.parse();
}]);
})(window.angular);
