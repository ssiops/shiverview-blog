module.exports = [
  {
    url: '/archive/:title/comment',
    method: 'get',
    handler: function (req, res, srv, next) {
      // TODO: retrieve comments
    }
  },
  {
    url: '/archive/:title/comment',
    method: 'post',
    handler: function (req, res, srv, next) {
      // TODO: post new comment
    }
  },
  {
    url: '/archive/:title/comment/:id',
    method: 'put',
    handler: function (req, res, srv, next) {
      // TODO: edit comment
    }
  },
  {
    url: '/archive/:title/comment/:id',
    method: 'delete',
    handler: function (req, res, srv, next) {
      // TODO: delete a comment
    }
  }
]
