(function (angular) {
angular.module('shiverview')
.factory('markdown', ['$sanitize', function ($sanitize) {
  var renderer = new showdown.Converter({
    omitExtraWLInCodeBlocks: true,
    strikethrough: true,
    parseImgDimensions: true,
    tasklists: true
  });
  return {
    render: function (text) {
      return $sanitize(renderer.makeHtml(text));
    }
  };
}]);
})(window.angular);
