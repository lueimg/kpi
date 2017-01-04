var rutas = require('express').Router(),
    extend = require('util')._extend,
    ResponseUtils = require('../core/ResponseUtils.js'),
    TABLE = 'kpi' ;
/**
 * GET    /CLIENTS/ list of active clients
 * POST   /CLIENTS/ save a new client
 */

/**
 * Client Object
 *
 * id
 * legacy_id
 * description
 * status
 * created_by
 * created_at
 * updated_by
 * updated_at
 */



rutas.route('/')
  .get(function (req, res) {
    var filter = {
          nombre: req.query.nombre,
          clasificacion: req.query.clasificacion,
          pageStart: parseInt(req.query.skip || 0, 10),
          pageCount: parseInt(req.query.limit || 0, 10),
          orderBy: ''
        },
        dataQuery = 'SELECT * FROM kpi WHERE 1 ',
        countQuery = 'SELECT COUNT(idkpi) AS COUNTER FROM kpi WHERE 1 ',
        commonQuery = '',
        dataParams = [],
        countParams = [];

    // Set order expression
    if (req.query.sort) {
      filter.orderBy = req.query.sort + ' ' + req.query.sort_dir;
    }

    if (filter.nombre) {
      commonQuery += 'AND nombre LIKE ? ';
      dataParams.push('%' + filter.nombre.replace(/ /g, '%') + '%');
    }

    // Counter doesn't need exta params so make a copy of data params at this point
    countParams = extend([], dataParams);
    // Add conditions
    dataQuery += commonQuery;
    countQuery += commonQuery;

    // Add an ORDER BY sentence
    dataQuery += ' ORDER BY ';
    if (filter.orderBy) {
      dataQuery += filter.orderBy;
    } else {
      dataQuery += 'idkpi ASC ';
    }

    // Set always an start for data
    dataQuery += ' LIMIT ?';
    dataParams.push(filter.pageStart);

    if (filter.pageCount) {
      dataQuery += ', ?';
      dataParams.push(filter.pageCount);
    } else {
      // Request 500 records at most if limit is not specified
      dataQuery += ', 500';
    }

    dataQuery += ';';
    countQuery += ';';

    // Execute both queries at once
    dataParams = dataParams.concat(countParams);

    dbQuery(dataQuery + countQuery, dataParams, function (err, rows) {
      if (err) return ResponseUtils.sendInternalServerError(res, err, rows);

      rows = rows || [{}];

      res.json({
        results: {
          list:rows[0],
          count: rows[1][0].COUNTER
        }
      });
    });
  })
  .post(function (req, res) {
    var kpiData = req.body,
        kpi = {};

    kpi.nombre = kpiData.nombre;
    kpi.clasificacion = kpiData.clasificacion;

    dbQuery('INSERT INTO kpi SET ?;', kpi, function (err, result) {
      if (err) return ResponseUtils.sendInternalServerError(res, err, rows);

      res.json({result: {code: '001', message: 'ok'}});

    });
  });

rutas.route('/:id')
  .get(function (req, res) {
    var idkpi = req.params.id,
        query = 'SELECT * FROM kpi WHERE idkpi = ?';

    dbQuery(query, [idkpi], function (err, rows) {
       if (err) return ResponseUtils.sendInternalServerError(res, err, rows);

      rows = rows || [{}];

      res.json(rows[0]);
    });
  })
  .put(function (req, res) {
    var idkpi = req.params.id,
        kpiData = req.body,
        kpi = {};

    kpi.nombre = kpiData.nombre;
    kpi.clasificacion = kpiData.clasificacion;
    

    dbQuery('UPDATE kpi SET ? WHERE idkpi = ?;', [kpi, idkpi],
      function (err) {
        if (err) return ResponseUtils.sendInternalServerError(res, err, rows);

        res.json({result: {code: '001', message: 'ok'}});
      });
  })
  .delete(function (req, res) {
    var id = req.params.id,
        client = {
          // Set default values
          status: -1,
          updated_at: new Date(),
          updated_by: req.user && req.user.id || -1
        };

    dbQuery('UPDATE CLIENTS SET ? WHERE ID = ?;', [client, id],
      function (err) {
        if (err) {
          printLog(err);
          res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
          return;
        }

        res.json({result: {code: '001', message: 'ok'}});
      });
  });

module.exports = rutas;
