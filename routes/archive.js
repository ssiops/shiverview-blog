module.exports = [
  {
    url: '/archive',
    method: 'get',
    handler: function (req, res, srv, next) {
      var query = {};
      var opt = {};
      query.label = req.query.label || undefined;
      opt.limit = req.query.limit || 10;
      srv.db.find(query, 'archive', opt)
      .then(function (docs) {
        res.send(docs);
      }, function (err) {
        next(err);
      });
    }
  },
  {
    url: '/archive/:title',
    method: 'get',
    handler: function (req, res, srv, next) {
      srv.db.find({title: req.params.title}, 'archive', {limit: 1})
      .then(function (docs) {
        if (docs.length < 1)
          res.status(404).send();
        else
          res.send(docs[0]);
      }, function (err) {
        next(err);
      });
    }
  },
  {
    url: '/archive/:title',
    method: 'post',
    handler: function (req, res, srv, next) {
      if (!req.session.user || !req.session.user.admin)
        return res.status(403).send();
      var doc = req.body;
      doc.title = req.params.title;
      srv.db.insert(doc, 'archive', {})
      .then(function () {
        res.status(201).send();
      }, function (err) {
        next(err);
      });
    }
  },
  {
    url: '/archive/:title',
    method: 'put',
    handler: function (req, res, srv, next) {
      if (!req.session.user || !req.session.user.admin)
        return res.status(403).send();
      var doc = req.body;
      srv.db.insert({title: req.params.title}, {$set: doc}, 'archive', {})
      .then(function () {
        res.status(204).send();
      }, function (err) {
        next(err);
      });
    }
  },
  {
    url: '/archive/:title',
    method: 'delete',
    handler: function (req, res, srv, next) {
      if (!req.session.user || !req.session.user.admin)
        return res.status(403).send();
      srv.db.delete({title: req.params.title}, 'archive', {limit: 1})
      .then(function () {
        res.status(204).send();
      }, function (err) {
        next(err);
      });
    }
  },
  {
    url: '/archive/label',
    method: 'get',
    handler: function (req, res, srv, next) {
      srv.db.find({}, 'labels', {})
      .then(function (docs) {
        res.send(docs);
      }, function (err) {
        next(err);
      });
    }
  },
  {
    url: '/archive/label/:title',
    method: 'post',
    handler: function (req, res, srv, next) {
      if (!req.session.user || !req.session.user.admin)
        return res.status(403).send();
      var doc = req.body;
      doc.title = req.params.title;
      srv.db.insert(doc, 'labels', {})
      .then(function () {
        res.status(201).send();
      }, function (err) {
        next(err);
      });
    }
  },
  {
    url: '/archive/label/:title',
    method: 'put',
    handler: function (req, res, srv, next) {
      if (!req.session.user || !req.session.user.admin)
        return res.status(403).send();
      var doc = req.body;
      srv.db.insert({title: req.params.title}, {$set: doc}, 'labels', {})
      .then(function () {
        res.status(204).send();
      }, function (err) {
        next(err);
      });
    }
  },
  {
    url: '/archive/label/:title',
    method: 'delete',
    handler: function (req, res, srv, next) {
      if (!req.session.user || !req.session.user.admin)
        return res.status(403).send();
      srv.db.delete({title: req.params.title}, 'labels', {limit: 1})
      .then(function () {
        res.status(204).send();
      }, function (err) {
        next(err);
      });
    }
  }
]
