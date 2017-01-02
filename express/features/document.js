var routes = require('express').Router(),
    Record = require('../models/record'),
    Binnacle = require('../models/binnacle'),
    ResponseUtils = require('../core/ResponseUtils.js'),
    Utils = require('../core/utils.js');

routes.route('/')
  .post(function (req, res) {
    var params = req.body;

    params.user_id = req.user.id; // Logged User
    params.code = ''; //@TODO: GENERATE CODE

    // Get location texts
    // Only Cients and Others have Ubigeo
    let ubigeoCode = params.delivery_type_id == 3 ? params.dt_others_ubigeo :
          params.delivery_type_id == 2 ? params.deliveryClient.value.ubigeo_id: '',
        {dpto, prov, dist} = Utils.locationCodes(ubigeoCode),
        locationQueries = `
          select * from ubigeo where code = '${dpto}';
          select * from ubigeo where code = '${prov}';
          select * from ubigeo where code = '${dist}';
          `;

    dbQuery(locationQueries, (error, results) => {
      if (error) {
        printLog(error);
        ResponseUtils.sendInternalServerError(res, error, results);
        return;
      }

      if (params.delivery_type_id > 1) { // Only Cients and Others have Ubigeo
        params.dpto = results[0][0].name;
        params.province = results[1][0].name;
        params.district = results[2][0].name;
      }

      dbQuery('INSERT INTO RECORDS SET ?;', new Record(params), (err, result) => {
        var code,
            userIdSt;

        if (err) {
          printLog(err);
          ResponseUtils.sendInternalServerError(res, err, result);
          return;
        }

        code = '000000000' + result.insertId;
        userIdSt = '0000' + params.user_id;
        // Update record created to set code
        code = code.substr(code.length - 9) + userIdSt.substr(userIdSt.length - 4);

        dbQuery('UPDATE RECORDS SET CODE = ? WHERE IDRECORD = ?;', [code, result.insertId], (errU, resultU) => {
          if (errU) {
            printLog(errU);
            ResponseUtils.sendInternalServerError(res, errU, resultU);
            return;
          }
          res.json({result: {code: '001', message: 'ok', id: code}});
        });
      }); // End Insert
    }); // End locationQuery
  }); // End Post route

routes.route('/list')
  .get(function (req, res) {
    var codes = req.query.codes,
        dataQuery = 'SELECT a.idrecord, a.code, a.document, a.dpto, a.province, ' +
          'a.district, a.address, a.destination, a.sender, a.reference, ' +
          'a.status, a.origin, a.sender_id, a.delivery_type_id, ' +
          'a.dt_user_id, a.dt_client_id, a.document_type_id, a.weight, ' +
          'a.ubigeo_id, ' +
          'a.user_id, ' +
          'DATE_FORMAT(a.created_at, \'%d/%c/%Y - %H:%i:%S\') created_at, ' +
          'CONCAT(b.name, \' \', b.last_name) created_by_name, ' +
          'a.updated_by, ' +
          'DATE_FORMAT(a.updated_at, \'%d/%c/%Y - %H:%i:%S\') updated_at, ' +
          'CONCAT(c.name, \' \', c.last_name) updated_by_name ' +
          'FROM RECORDS a ' +
          'LEFT JOIN USERS b ON a.USER_ID = b.ID ' +
          'LEFT JOIN USERS c ON a.UPDATED_BY = c.ID ' +
          'WHERE a.CODE IN (?) AND a.STATUS <> 2;';

    dbQuery(dataQuery, [codes], function (err, rows) {
      if (err) {
        printLog(err);
        ResponseUtils.sendInternalServerError(res, err, rows);
        return;
      }

      rows = rows || [];

      // Add idx value
      rows = rows.map(function (row, idx) {
        row.idx = idx + 1;
        return row;
      });

      /**
       * Result format: {results:{list:[], count:0}}
       */
      res.json({
        results: {
          list:rows,
          count: rows.length
        }
      });
    });
  });

routes.route('/:id')
  .get(function (req, res) {
    var id = req.params.id,
        dataQuery = 'SELECT a.idrecord, a.code, a.document, a.dpto, a.province, ' +
          'a.district, a.address, a.destination, a.sender, a.reference, ' +
          'a.status, a.origin, a.sender_id, a.delivery_type_id, ' +
          'a.dt_user_id, a.dt_client_id, a.document_type_id, a.weight, ' +
          'a.ubigeo_id, ' +
          'a.user_id, ' +
          'DATE_FORMAT(a.created_at, \'%d/%c/%Y - %H:%i:%S\') created_at, ' +
          'CONCAT(b.name, \' \', b.last_name) created_by_name, ' +
          'a.updated_by, ' +
          'DATE_FORMAT(a.updated_at, \'%d/%c/%Y - %H:%i:%S\') updated_at, ' +
          'CONCAT(c.name, \' \', c.last_name) updated_by_name ' +
          'FROM RECORDS a ' +
          'LEFT JOIN USERS b ON a.USER_ID = b.ID ' +
          'LEFT JOIN USERS c ON a.UPDATED_BY = c.ID ' +
          'WHERE a.IDRECORD = ?;',
        binnacleQuery = 'SELECT a.action_id, a.assignment_type, a.assigned_id, ' +
          'a.f_description, a.s_description, ' +
          'DATE_FORMAT(a.created_at, \'%d/%c/%Y - %H:%i:%S\') created_at, ' +
          'CONCAT(c.first_name, \' \', c.last_name) created_by_name ' +
          'FROM BINNACLE a ' +
          'LEFT JOIN BINNACLE_RECORDS b ' +
          'ON a.ID = b.BINNACLE_ID ' +
          'LEFT JOIN EMPLOYEES c ' +
          'ON a.ASSIGNED_ID = c.id ' +
          'WHERE b.RECORD_ID LIKE ? ' +
          'AND a.ASSIGNMENT_TYPE = 1 ' +

          'UNION ' +

          'SELECT a.action_id, a.assignment_type, a.assigned_id, ' +
          'a.f_description, a.s_description, ' +
          'DATE_FORMAT(a.created_at, \'%d/%c/%Y - %H:%i:%S\') created_at, ' +
          'c.name created_by_name ' +
          'FROM BINNACLE a ' +
          'LEFT JOIN BINNACLE_RECORDS b ' +
          'ON a.ID = b.BINNACLE_ID ' +
          'LEFT JOIN OFFICES c ' +
          'ON a.ASSIGNED_ID = c.ID ' +
          'WHERE b.RECORD_ID LIKE ? ' +
          'AND a.ASSIGNMENT_TYPE = 2 ' +

          'UNION ' +

          'SELECT a.action_id, a.assignment_type, a.assigned_id, ' +
          'a.f_description, a.s_description, ' +
          'DATE_FORMAT(a.created_at, \'%d/%c/%Y - %H:%i:%S\') created_at, ' +
          'CONCAT(c.name, \' \', c.last_name) created_by_name ' +
          'FROM BINNACLE a ' +
          'LEFT JOIN BINNACLE_RECORDS b ' +
          'ON a.ID = b.BINNACLE_ID ' +
          'LEFT JOIN USERS c ' +
          'ON a.ASSIGNED_ID = c.ID ' +
          'WHERE b.RECORD_ID LIKE ? ' +
          'AND a.ASSIGNMENT_TYPE = 3 ' +

          'UNION ' +

          'SELECT a.action_id, a.assignment_type, a.assigned_id, ' +
          'a.f_description, a.s_description, ' +
          'DATE_FORMAT(a.created_at, \'%d/%c/%Y - %H:%i:%S\') created_at, ' +
          '\'\' created_by_name ' +
          'FROM BINNACLE a ' +
          'LEFT JOIN BINNACLE_RECORDS b ' +
          'ON a.ID = b.BINNACLE_ID ' +
          'WHERE b.RECORD_ID LIKE ? ' +
          'AND a.ASSIGNMENT_TYPE IS NULL ' +

          'ORDER BY ACTION_ID ASC, CREATED_AT ASC;';

    dbQuery(dataQuery, [id], function (err, rows) {
      if (err) {
        printLog(err);
        ResponseUtils.sendInternalServerError(res, err, rows);
        return;
      }

      if (rows.length) {
        // Get first item as the only record
        rows = (rows || [{}])[0];
        dbQuery(binnacleQuery, [rows.code, rows.code, rows.code, rows.code], function (errU, rowsU) {
          if (errU) {
            printLog(errU);
            ResponseUtils.sendInternalServerError(res, errU, rowsU);
            return;
          }

          rows.binnacle = rowsU;

          res.json(rows);
        });
      } else {
        res.json([]);
      }
    });
  })
  .put(function (req, res) {
    var id = req.params.id,
        doc = req.body;

    doc.user_id = req.user.id; // Logged User
    // Set default values
    doc.updated_at = new Date();
    doc.updated_by = req.user && req.user.id || -1;

    // Get location texts
    // Only Cients and Others have Ubigeo
    let ubigeoCode = doc.delivery_type_id == 3 ? doc.dt_others_ubigeo :
          doc.delivery_type_id == 2 ? doc.deliveryClient.value.ubigeo_id: '',
        {dpto, prov, dist} = Utils.locationCodes(ubigeoCode),
        locationQueries = `
          select * from ubigeo where code = '${dpto}';
          select * from ubigeo where code = '${prov}';
          select * from ubigeo where code = '${dist}';
          `;

    dbQuery(locationQueries, {}, (error, results) => {
      if (error) {
        printLog(error);
        ResponseUtils.sendInternalServerError(res, error, results);
        return;
      }

      if (doc.delivery_type_id > 1) { // Only Cients and Others have Ubigeo
        doc.dpto = results[0][0].name;
        doc.province = results[1][0].name;
        doc.district = results[2][0].name;
      }

      dbQuery('UPDATE RECORDS SET ? WHERE IDRECORD = ?;', [new Record(doc), id],
        function (err) {
          if (err) {
            printLog(err);
            res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
            return;
          }

          res.json({result: {code: '001', message: 'ok'}});
        });
    });
  })
  .delete(function (req, res) {
    var id = req.params.id,
        doc = {
          // Set default values
          updated_at: new Date(),
          updated_by: req.user && req.user.id || -1,
          status: 2
        };

    dbQuery('UPDATE RECORDS SET ? WHERE IDRECORD = ?;', [doc, id], function (err) {
      if (err) {
        printLog(err);
        res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
        return;
      }

      res.json({result: {code: '001', message: 'ok'}});
    });
  });

routes.route('/assign')
  .post(function (req, res) {
    var params = req.body,
        query = 'INSERT INTO BINNACLE SET ?;',
        queryDetail = 'INSERT INTO BINNACLE_RECORDS (BINNACLE_ID, RECORD_ID) VALUES ?;',
        // TODO: fix update issue only updating first row
        updateRecordsQuery = 'UPDATE RECORDS SET STATUS = 3 WHERE CODE IN (?);',
        binnacle,
        data = [],
        i;

    binnacle = {
      action_id: 1,
      assignment_type: params.assignment_type,
      assigned_id: params.assigned_id,
      f_description: params.service_order,
      s_description: params.shipping_type,
      created_at: new Date(),
      created_by: req.user.id
    };

    dbQuery(query, binnacle, function (err, result) {
      if (err) return ResponseUtils.sendInternalServerError(res, err, result);

      for (i in params.records) { data.push([result.insertId, params.records[i]]);}

      dbQuery(queryDetail, [data], function (errI, resultI) {
        if (errI) return ResponseUtils.sendInternalServerError(res, errI, resultI);

        dbQuery(updateRecordsQuery, [params.records], function (errU, resultU) {
          if (errU) return ResponseUtils.sendInternalServerError(res, errU, resultU);
          res.json({result: {code: '001', message: 'ok', id: ''}});
        });
      });
    });
  });

routes.route('/discharge')
  .post(function (req, res) {
    var params = req.body,
        query = 'INSERT INTO BINNACLE SET ?;',
        queryDetail = 'INSERT INTO BINNACLE_RECORDS (BINNACLE_ID, RECORD_ID) VALUES ?;',
        // TODO: fix update issue only updating first row
        updateRecordsQuery = 'UPDATE RECORDS SET STATUS = 4 WHERE CODE IN (?);',
        binnacle,
        data = [],
        i;

    params.action_id = 2;
    params.created_by = req.user.id;
    binnacle = new Binnacle(params);

    dbQuery(query, binnacle, function (err, result) {
      if (err) return ResponseUtils.sendInternalServerError(res, err, result);

      for (i in params.records) { data.push([result.insertId, params.records[i]]);}

      dbQuery(queryDetail, [data], function (errI, resultI) {
        if (errI) return ResponseUtils.sendInternalServerError(res, errI, resultI);

        dbQuery(updateRecordsQuery, [params.records], function (errU, resultU) {
          if (errU) return ResponseUtils.sendInternalServerError(res, errU, resultU);
          res.json({result: {code: '001', message: 'ok', id: ''}});
        });
      });
    });
  });

module.exports = routes;
