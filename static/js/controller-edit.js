(function (angular) {
angular.module('shiverview')
.controller('blogEditCtrl', ['$scope', '$http', '$window', '$location', '$modal', '$rootScope', '$routeParams', 'markdown', function ($scope, $http, $window, $location, $modal, $rootScope, $params, markdown) {
  $scope.payload = {
    title: '',
    abstract: '',
    content: ''
  };
  $scope.selectedLabels = [];
  $scope.newLabel = {};
  $scope.textarea = $window.document.getElementById('content');
  $scope.markdown = markdown;
  $scope.retrieve = function () {
    if ($params.title) {
      $http({
        url: '/blog/archive/' + $params.title,
        method: 'get'
      }).then(function (res) {
        $scope.payload = res.data;
      }, function (res) {
        if (res.status == 404)
          $location.url('/blog/edit/');
        else
          $rootScope.$broadcast('errorMessage', res.data.message);
      });
    };
  };
  $scope.retrieveLabels = function () {
    $http({
      url: '/blog/labels',
      method: 'get'
    }).then(function (res) {
      $scope.labels = res.data;
      // TODO: detect label.style.background-color and change text color
    }, function (res) {
      $rootScope.$broadcast('errorMessage', res.data.message);
    });
  };
  $scope.insertSymbol = function(opt) {
    var value = $scope.textarea.value;
    var start = $scope.textarea.selectionStart;
    var end = $scope.textarea.selectionEnd;
    if (opt.wrap) {
      if (start === end)
        $scope.textarea.value = value.substring(0, start) + opt.wrap + opt.wrap + value.substring(end, value.length);
      else
        $scope.textarea.value = value.substring(0, start) + opt.wrap + value.substring(start, end) + opt.wrap + value.substring(end, value.length);
      $scope.textarea.selectionStart = $scope.textarea.selectionEnd = start + opt.wrap.length;
    }
    if (opt.home) {
      var br = start - 1;
      for (; br >= 0 && value.charAt(br) != '\n'; br--);
      br++;
      $scope.textarea.value = value.substring(0, br) + opt.home + value.substring(br, value.length);
      $scope.textarea.selectionStart = $scope.textarea.selectionEnd = start + opt.home.length;
    }
    if (opt.line) {
      $scope.textarea.value = value.substring(0, start) + '\n' + opt.line + '\n' + value.substring(start, value.length);
      $scope.textarea.selectionStart = $scope.textarea.selectionEnd = start + opt.line.length + 2;
    }
    if (opt.simple) {
      $scope.textarea.value = value.substring(0, start) + opt.simple + value.substring(start, $scope.payload.content.length);
    }
    $scope.textarea.focus();
  }
  $scope.openUploader = function (context) {
    var modalInstance = $modal.open({
      templateUrl: 'imgUpload.html',
      controller: 'blogImageUploaderCtrl'
    });
    modalInstance.result.then(function (src) {
      if (context == 'editor')
        $scope.insert({simple: '![<alt text>](' + src + ')'});
      else if (context == 'label')
        $scope.newLabel.cover = src;
    }, function () {
    });
  };
  $scope.submit = function (e) {
    if (e) e.preventDefault();
    var d = new Date();
    $scope.payload.displayTitle = $scope.payload.title;
    $scope.payload.title = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + $scope.payload.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    $scope.payload.labels = $scope.selectedLabels.map(function (label) {
      return label.title;
    });
    $scope.payload.content = $scope.textarea.value;
    $http({
      url: '/blog/archive/' + $scope.payload.title,
      data: $scope.payload,
      method: 'post'
    }).then(function () {
      $location.url('/blog/archive/' + $scope.payload.title);
    }, function (res) {
      $rootScope.$broadcast('errorMessage', res.data.message);
    });
  };
  $scope.editLabel = function (i) {
    $scope.newLabel = $scope.labels[i];
    $scope.newLabel.edit = $scope.editingLabel = true;
  };
  $scope.deleteLabel = function (title) {
    $http({
      url: '/blog/labels/' + title,
      method: 'delete'
    }).then(function () {
      $scope.newLabel = {};
      $scope.newLabel.edit = false;
      $scope.retrieveLabels();
    }, function (res) {
      $rootScope.$broadcast('errorMessage', res.data.message);
    });
  };
  $scope.submitLabel = function (e) {
    if (e) e.preventDefault();
    $http({
      url: '/blog/labels/' + $scope.newLabel.title,
      data: $scope.newLabel,
      method: $scope.newLabel.edit?'put':'post'
    }).then(function () {
      $scope.newLabel = {};
      $scope.newLabel.edit = false;
      $scope.retrieveLabels();
    }, function (res) {
      $rootScope.$broadcast('errorMessage', res.data.message);
    });
  };

  $scope.retrieve();
  $scope.retrieveLabels();
}])
.controller('blogImageUploaderCtrl', ['$scope', '$modalInstance', '$rootScope', 'Upload', function ($scope, $modal, $rootScope, $upload) {
  $scope.ok = function () {
    $modal.close();
  };
  $scope.cancel = function () {
    $modal.dismiss('cancel');
  };
  $scope.upload = function ($file) {
    $scope.progress = 0;
    $rootScope.$broadcast('setProgress', 0);
    var upload = $upload.upload({
      url: '/users/usercontent/blog/img',
      file: $file
    })
    .progress(function (e) {
      $rootScope.$broadcast('setProgress', parseInt(100.0 * e.loaded / e.total));
    })
    .success(function (data) {
      $rootScope.$broadcast('setProgress', 100);
      $modal.close(data.path);
    })
    .error(function (err) {
      $rootScope.$broadcast('setProgress', -1);
      if (err) $rootScope.$broadcast('errorMessage', err.message);
    });
  };
}]);
})(window.angular);
