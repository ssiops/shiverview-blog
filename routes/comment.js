module.exports = [
  {
    url: '/archive/:title/comment',
    method: 'get',
    handler: function (req, res, srv, next) {
      srv.db.find({origin: req.params.title}, 'comments', {})
      .then(function (docs) {
        docs.map(function (doc) {
          doc.date = doc._id.getTimestamp();
          return doc;
        });
        res.send(docs);
      }, function (err) {
        next(err);
      });
    }
  },
  {
    url: '/archive/:title/comment',
    method: 'post',
    handler: function (req, res, srv, next) {
      if (!req.session.user)
        return res.status(403).send();
      var payload = req.body;
      payload.origin = req.params.title;
      payload.author = req.session.user.name;
      srv.db.insert(payload, 'comments', {})
      .then(function () {
        res.status(201).send();
      }, function (err) {
        next(err);
      });
    }
  },
  {
    url: '/archive/:title/comment/:id',
    method: 'put',
    handler: function (req, res, srv, next) {
      if (!req.session.user)
        return res.status(403).send();
      var query = {
        _id: new srv.db.util.ObjectID(req.params.id),
        origin: req.params.title
      };
      srv.db.find(query, 'comments', {})
      .then(function (docs) {
        if (docs.length < 1)
          return res.status(404).send();
        if (docs[0].author != req.session.user.name && !req.session.user.admin)
          return res.status(403).send();
        srv.db.update(query, {$set: {content: req.body.content}}, 'comments', {})
        .then(function () {
          res.send();
        }, function (err) {
          next(err);
        });
      }, function (err) {
        next(err);
      });
    }
  },
  {
    url: '/archive/:title/comment/:id',
    method: 'delete',
    handler: function (req, res, srv, next) {
      if (!req.session.user)
        return res.status(403).send();
      var query = {
        _id: new srv.db.util.ObjectID(req.params.id),
        origin: req.params.title
      };
      srv.db.find(query, 'comments', {})
      .then(function (docs) {
        if (docs.length < 1)
          return res.status(404).send();
        if (docs[0].author != req.session.user.name && !req.session.user.admin)
          return res.status(403).send();
        srv.db.remove(query, 'comments', {})
        .then(function () {
          res.send();
        }, function (err) {
          next(err);
        });
      }, function (err) {
        next(err);
      });
    }
  }
]
