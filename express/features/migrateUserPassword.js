var routes = require('express').Router(),
    db = require('../core/database.js'),
    bcrypt = require('bcrypt');

routes.route('/')
  .get(function (req, res) {
    db.query('select id, password from users', function (err, rows) {
      var new_password,
          sqlQueries = [],
          queryParams = [],
          totalquery;

      if (err) {
        printLog(err);
        res.status(500).send({code: 500, msg: 'Internal Server Error'});
      }

      rows = rows || [];

      rows.forEach(function (item) {
        new_password = bcrypt.hashSync(item.password, 10);

        sqlQueries.push(' update users set password =  ' + db.escape(new_password) + ' where id = ' + item.id + ' ');
        queryParams.push(new_password);
        queryParams.push(item.id);

      });

      totalquery = sqlQueries.join(';');

      db.beginTransaction(function (err) {
        if (err) { throw err; }

        dbQuery(totalquery, function (err, rows) {
          if (err) {
            printLog(err);
            return db.rollback(function () {
              throw err;
            });
          }
          db.commit();
          res.status(200).json({ results: { list:rows } });
        });
      });
    });
  });

module.exports = routes;
