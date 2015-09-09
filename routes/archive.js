module.exports = [
  {
    url: '/archive',
    method: 'get',
    handler: function (req, res, srv, next) {
      // TODO: list blog articles
    }
  },
  {
    url: '/archive/:title',
    method: 'get',
    handler: function (req, res, srv, next) {
      // TODO: retrieve an article
    }
  },
  {
    url: '/archive/:title',
    method: 'post',
    handler: function (req, res, srv, next) {
      // TODO: add an article
    }
  },
  {
    url: '/archive/:title',
    method: 'put',
    handler: function (req, res, srv, next) {
      // TODO: update an article
    }
  },
  {
    url: '/archive/:title',
    method: 'delete',
    handler: function (req, res, srv, next) {
      // TODO: delete an article
    }
  },
  {
    url: '/archive/tag',
    method: 'get',
    handler: function (req, res, srv, next) {
      // TODO: retrieve list of tags
    }
  },
  {
    url: '/archive/tag/:title',
    method: 'post',
    handler: function (req, res, srv, next) {
      // TODO: create a tag
    }
  },
  {
    url: '/archive/tag/:title',
    method: 'put',
    handler: function (req, res, srv, next) {
      // TODO: edit a tag
    }
  },
  {
    url: '/archive/tag/:title',
    method: 'delete',
    handler: function (req, res, srv, next) {
      // TODO: delete a tag
    }
  }
]
