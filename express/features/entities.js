var rutas = require('express').Router();

/**
 * GET    /Entities/  GET USERS LIST ARRAY ** Resource.query() in angular
 */

rutas.route('/')
  .get(function (req, res) {
    var query = 'select e.id, e.`name`, e.display_name, r._view, r._create, r._edit, r._delete ' +
          'from ENTITIES e ' +
          'left join RESTRICTIONS r on r.entity_id = e.id and r.user_id = 0;';

    dbQuery(query, function (err, rows) {
      if (err) {
        printLog(err);
        res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
      }

      res.json({results:{list:rows, totalResults: rows.length}});
    });
  });

module.exports = rutas;
