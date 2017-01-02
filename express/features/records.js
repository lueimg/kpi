var extend = require('util')._extend,
    xlsx = require('node-xlsx'),
    configs = require('../core/config'),
    moment = require('moment');

module.exports = function (app, fs) {
  var API_PATH = '/records/',
      //RECEIPT_FILES_PATH = '/Users/macoy/Repositories/Consolidado/';
      RECEIPT_FILES_PATH = configs.RECEIPT_FILES_PATH;

  // Error handling middleware.
  app.use(function (err, req, res, next){
    if (err.status === 404) {
      printLog(err);
      res.statusCode = err.status;
      res.send({code: err.status, msg: 'File not found.', dev: err});
      return;
    } else {
      next(err);
    }
  });

  app.post(API_PATH + 'upload', function (req, res) {
    var FILES_PATH,
        WORK_SHEETS,
        records = [],
        user_id,
        data,
        record,
        query = 'INSERT INTO RECORDS(PROVINCE, DOCUMENT, DATE, DESTINATION, ADDRESS, DISTRICT, SENDER, ' +
          'CODE, REFERENCE, CREATED_AT, CREATIONCODE, USER_ID, CREATED_BY) ' +
          'VALUES ?;',
        // Set date for all the records
        created_at = new Date(),
        // Set it's creation date as a code to identify
        creationCode = moment(created_at).format('YYYYMMDDHHmmss'),
        result,
        formatDate,
        i,
        cell;

    if (!req.body.user_id) {
      res.status(500).send({code: 500, msg: 'Error, falta id usuario.', dev: {}});
    }

    user_id = req.body.user_id;

    try {
      FILES_PATH = req.files.uploadFile.path;
      WORK_SHEETS = xlsx.parse(FILES_PATH);

      // Get data from worksheet
      if (WORK_SHEETS && WORK_SHEETS.length) {
        // Get info from first sheet
        data = WORK_SHEETS[0].data;
        if (data && data.length > 1) {
          // Remove sheet headers
          data.shift();
          data.forEach(function (row) {
            var pattern;

            if (row && row.length) {
              record = [];
              for (i = 0; i < row.length; i++) {
                cell = row[i] || '';

                switch (i) {
                  case 0: // Month
                    // Do not push month
                    break;
                  case 1: // Province
                    record.push(cell);
                    break;
                  case 2: // Document
                    record.push(cell);
                    break;
                  case 3: // Date
                    formatDate = undefined;
                    // Get correct date
                    // Format wether it's a time number or a String in format dd/mm/yyyy
                    if (typeof cell == 'number') {
                      formatDate = new Date(1900, 0, cell-1);
                    } else if (typeof cell == 'string') {
                      // If '/' is found in the cell use it as separator, otherwise use '-'
                      pattern = cell.indexOf('/') > -1 ?
                        /(\d{2})\/(\d{2})\/(\d{4})/ :
                        /(\d{2})\-(\d{2})\-(\d{4})/;

                      formatDate = new Date(cell.replace(pattern, '$2-$1-$3'));
                    }

                    record.push(formatDate);
                    break;
                  case 4: // Destination
                    record.push(cell);
                    break;
                  case 5: // Address
                    record.push(cell);
                    break;
                  case 6: // District
                    record.push(cell);
                    break;
                  case 7: // Sender
                    record.push(cell);
                    break;
                  case 8: // Code
                    record.push(cell);
                    break;
                  case 9: // Reference
                    record.push(cell);
                }
              }
              record.push(created_at, creationCode, user_id, user_id);
              records.push(record);
            }
          });
        }
      }

      dbQuery(query, [records], function (err, data) {
        if (err) {
          printLog(err);
          res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
          return;
        } else {
          result = data.affectedRows;

          // Delete file after it was used
          fs.unlink(FILES_PATH, function (err) {
            if (err) {
              printLog(err);
              res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
              return;
            } else {
              printLog('File successfully deleted ' + req.files.uploadFile.path);
            }

            res.json({count: result});
          });
        }
      });
    } catch (err) {
      printLog(err);
      res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
      return;
    }
  });

  /*
   * Params definition
   * @QueryParam('pageStart')
   * @QueryParam('pageCount')
   * @QueryParam('orderBy')
   * @QueryParam('code')
   * @QueryParam('document')
   * @QueryParam('destination')
   * @QueryParam('address')
   * @QueryParam('district')
   * @QueryParam('sender')
   * @QueryParam('startDate')
   * @QueryParam('endDate')
   */
  app.get(API_PATH + 'list', function (req, res) {
    var record = {
          code: req.query.code,
          document: req.query.document,
          destination: req.query.destination,
          address: req.query.address,
          district: req.query.district,
          sender: req.query.sender,
          province: req.query.province,
          reference: req.query.reference,
          client_id: req.query.client_id
        },
        filter = {
          pageStart: parseInt(req.query.pageStart || req.query.skip || 0, 10),
          pageCount: parseInt(req.query.pageCount || req.query.limit || 0, 10),
          orderBy: req.query.orderBy,
          startDate: parseFloat(req.query.startDate || 0),
          endDate: parseFloat(req.query.endDate || 0)
        },
        // Build commonQuery
        usersQuery = 'SELECT U.ID id FROM USERS U ' +
          'LEFT JOIN AREAS A ON U.LOCATE_AREA = A.ID ' +
          'LEFT JOIN OFFICES O ON A.OFFICE_ID = O.ID ' +
          'WHERE 1 ',
        dataQuery = 'SELECT idrecord, code, document, province, ' +
          'district, R.address, destination, sender, reference, ' +
          'DATE_FORMAT(date,\'%d/%c/%Y\') as date, ' +
          'DATE_FORMAT(created_at,\'%d/%c/%Y - %H:%i:%S\') as created_at, ' +
          'creationCode, R.status, R.origin FROM RECORDS R ',
        countQuery = 'SELECT 1 FROM RECORDS R ',
        // Filter only available records (status <> 2)
        commonQuery = 'WHERE 1 AND R.STATUS <> 2 AND R.USER_ID IN (?) ',
        dataParams = [],
        countParams = [],
        users = [];

    // Set order expression
    if (req.query.sort) {
      filter.orderBy = req.query.sort + ' ' + req.query.sort_dir;
    }

    if (record.client_id > 0) {
      usersQuery += ' AND O.CLIENT_ID = ? ';
      dataParams.push(record.client_id);
    } else {
      // If there's no client_id, return empty array
      res.json({count: 0, list: []});
      return;
    }

    // In order to optimize queries, first get the users' ids, then query for the records
    dbQuery(usersQuery, dataParams, function (err, data) {
      var i;

      if (err) {
        printLog(err);
        res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
        return;
      }

      dataParams = [];
      countParams = [];
      if (!data || !data.length) {
        printLog('No user found.');
        res.json({
          count: 0,
          list: []
        });
        return;
      }

      // Include ids returned
      for (i in data) {
        users.push(data[i].id);
      }
      dataParams.push(users);

      if (record.code) {
        commonQuery += ' AND CODE LIKE ? ';
        dataParams.push('%' + record.code + '%');
      }

      if (record.document) {
        commonQuery += ' AND DOCUMENT LIKE ? ';
        dataParams.push('%' + record.document + '%');
      }

      if (record.destination) {
        commonQuery += ' AND DESTINATION LIKE ? ';
        dataParams.push('%' + record.destination + '%');
      }

      if (record.address) {
        commonQuery += ' AND ADDRESS LIKE ? ';
        dataParams.push('%' + record.address + '%');
      }

      if (record.district) {
        commonQuery += ' AND DISTRICT LIKE ? ';
        dataParams.push('%' + record.district + '%');
      }

      if (record.province) {
        commonQuery += ' AND PROVINCE LIKE ? ';
        dataParams.push('%' + record.province + '%');
      }

      if (record.sender) {
        commonQuery += ' AND SENDER LIKE ? ';
        dataParams.push('%' + record.sender + '%');
      }

      if (record.reference) {
        commonQuery += ' AND REFERENCE LIKE ? ';
        dataParams.push('%' + record.reference + '%');
      }

      if (filter.startDate) {
        commonQuery += ' AND DATE >= ? ';
        dataParams.push(new Date(filter.startDate));
      }

      if (filter.endDate) {
        commonQuery += ' AND DATE <= ? ';
        dataParams.push(new Date(filter.endDate));
      }

      // Counter doesn't need exta params so make a copy of data params at this point
      countParams = extend([], dataParams);
      countQuery += commonQuery;
      dataQuery += commonQuery;

      // Add an ORDER BY sentence
      dataQuery += ' ORDER BY ';
      if (filter.orderBy) {
        dataQuery += filter.orderBy;
      } else {
        dataQuery += 'R.DATE DESC';
      }

      // Set always an start for data
      dataQuery += ' LIMIT ?';
      countQuery += ' LIMIT ?';
      dataParams.push(filter.pageStart);
      countParams.push(filter.pageStart);

      if (filter.pageCount) {
        dataQuery += ', ?';
        countQuery += ', ?';
        dataParams.push(filter.pageCount);
        countParams.push(filter.pageCount * 5 + filter.pageStart);
      } else {
        // Request 500 records at most if limit is not specified
        dataQuery += ', 500';
        countQuery += ', 500';
      }

      dataQuery += ';';
      countQuery = 'SELECT COUNT(1) AS COUNTER FROM (' + countQuery + ') a;';

      // Execute both queries at once
      dataParams = dataParams.concat(countParams);

      dbQuery(dataQuery + countQuery, dataParams, function (err, data) {
        var result;

        if (err) {
          printLog(err);
          res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
          return;
        } else if (data && data.length === 2) {
          result = {
            count: data[1][0].COUNTER,
            list: data[0]
          };
        }

        res.json(result);
      });
    });
  });

  app.get(API_PATH + 'getFilesName', function (req, res) {
    var fileCode = req.query.code,
        result = [];

    try {
      fs.readdir(RECEIPT_FILES_PATH, function (err, files) {
        if (err) {
          // If file not found, return success
          if ([-4058, -2].indexOf(err.errno) > -1) {
            printLog(err);
            res.status(200).send({code: 200, msg: 'File not found', dev: err});
            return;
          }
          res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
          return;
        }
        if (files && files.length) {
          files.forEach(function (fileName) {
            if (fileName.indexOf(fileCode) > -1) {
              result.push(fileName);
            }
          });

          res.status(200).json(result);
        }
      });
    } catch (err) {
      printLog(err);
      res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
    }
  });

  app.get(API_PATH + 'download', function (req, res) {
    var file = RECEIPT_FILES_PATH + req.query.code;

    try {
      res.download(file);
    } catch (err) {
      // If file not found, return success
      if (err && err.errno == -4058) {
        printLog(err);
        res.status(200).send({code: 200, msg: 'File not found', dev: err});
        return;
      }
      printLog(err);
      res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
      return;
    }
  });

  app.put(API_PATH + 'update', function (req, res) {
    var record = req.body,
        query = 'UPDATE RECORDS SET DOCUMENT = ?, ADDRESS = ?, ' +
        ' DISTRICT = ?, PROVINCE = ?, SENDER = ?, DESTINATION = ?, ' +
        ' REFERENCE = ? WHERE IDRECORD = ?; ',
        params = [
          record.document,
          record.address,
          record.district,
          record.province,
          record.sender,
          record.destination,
          record.reference,
          record.id
        ],
        result;

    try {
      dbQuery(query, params, function (err, data) {
        if (err) {
          printLog(err);
          res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
          return;
        } else {
          result = {
            count: data.affectedRows
          };
        }

        res.json(result);
      });
    } catch (err) {
      printLog(err);
      res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
    }
  });

  app.get(API_PATH + 'creation_code_list', function (req, res) {
    var query = 'SELECT creationCode, ' +
          'DATE_FORMAT(CREATED_AT,\'%d/%c/%Y - %H:%i:%S\') as created_at ' +
          'FROM RECORDS WHERE STATUS <> 1 ' +
          'AND creationCode <> \'\'' +
          'GROUP BY creationCode, created_at;';

    try {
      dbQuery(query, {}, function (err, data) {
        if (err) {
          printLog(err);
          res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
          return;
        }

        res.json(data);
      });
    } catch (err) {
      printLog(err);
      res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
    }
  });

  app.put(API_PATH + 'assign', function (req, res) {
    var record = req.query,
        query = 'UPDATE RECORDS SET USER_ID = ? ' +
        ' WHERE CREATIONCODE = ?; ',
        params = [
          record.user_id,
          record.creationCode
        ],
        result;

    try {
      dbQuery(query, params, function (err, data) {
        if (err) {
          printLog(err);
          res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
          return;
        } else {
          result = {
            count: data.affectedRows
          };
        }

        res.json(result);
      });
    } catch (err) {
      printLog(err);
      res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
    }
  });

  app.delete(API_PATH + 'delete', function (req, res) {
    var creationCode = req.query.creationCode,
        query = 'UPDATE RECORDS SET STATUS = 2 WHERE CREATIONCODE = ?;',
        result;

    try {
      dbQuery(query, [creationCode], function (err, data) {
        if (err) {
          printLog(err);
          res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
          return;
        } else {
          result = {
            count: data.affectedRows
          };
        }

        res.json(result);
      });
    } catch (err) {
      printLog(err);
      res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
      return;
    }
  });
};
