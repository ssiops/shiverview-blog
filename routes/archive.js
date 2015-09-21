module.exports = [
  {
    url: '/archive',
    method: 'get',
    handler: function (req, res, srv, next) {
      var query = {};
      var opt = {sort: [['date', -1]]};
      if (req.query.label)
        query.labels = req.query.label;
      if (req.query.date) {
        var date = req.query.date.split('-');
        var d0 = new Date(date[0], date[1] - 1, 1);
        var d1 = new Date(date[0], date[1], 1);
        query['$and'] = [{date: {$gte: d0.getTime()}}, {date: {$lte: d1.getTime()}}];
      }
      if (query['$and']) {
        for (var key in query) {
          if (key !== '$and') {
            var o = {};
            o[key] = query[key];
            query['$and'].push(o);
            delete query[key];
          }
        }
      }
      opt.limit = req.query.limit || 5;
      if (req.query.reverse)
        opt.sort = [['date', 1]];
      if (req.query.page > 0)
        opt.range = [(req.query.page - 1) * 5, req.query.page * 5];
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
      delete doc._id;
      srv.db.update({title: req.params.title}, {$set: doc}, 'archive', {})
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
      srv.db.remove({title: req.params.title}, 'archive', {limit: 1})
      .then(function () {
        res.status(204).send();
      }, function (err) {
        next(err);
      });
    }
  },
  {
    url: '/labels',
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
    url: '/labels/:title',
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
    url: '/labels/:title',
    method: 'put',
    handler: function (req, res, srv, next) {
      if (!req.session.user || !req.session.user.admin)
        return res.status(403).send();
      var doc = req.body;
      srv.db.update({title: req.params.title}, {$set: doc}, 'labels', {})
      .then(function () {
        res.status(204).send();
      }, function (err) {
        next(err);
      });
    }
  },
  {
    url: '/labels/:title',
    method: 'delete',
    handler: function (req, res, srv, next) {
      if (!req.session.user || !req.session.user.admin)
        return res.status(403).send();
      srv.db.remove({title: req.params.title}, 'labels', {limit: 1})
      .then(function () {
        res.status(204).send();
      }, function (err) {
        next(err);
      });
    }
  }
]
