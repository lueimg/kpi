var configs = require('../core/config');

module.exports = function (app, fs) {
  var API_PATH = '/downloadPDF/',
      RECEIPT_FILES_PATH = configs.RECEIPT_FILES_PATH;

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
};
