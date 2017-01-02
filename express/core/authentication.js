
module.exports = function (app, passport, LocalStrategy, cookieParser, session, connection, bcrypt) {
  // Save the status of logIn
  var isLogginFail = false;

  app.use(cookieParser());
  app.use(session({secret: 'DocumentarioISacmac'}));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser(function (user, done) {
    done(null, user);
  });
  passport.deserializeUser(function (user, done) {
    done(null, user);
  });

  passport.use(new LocalStrategy(
    {
      usernameField: 'userName',
      passwordField: 'password'
    },
    function (username, password, done) {
      // Verify user name
      var usernameLowerCase = username.toLowerCase().trim(),
          query = 'SELECT a.*, CONCAT(c.name, \' - \', b.name) origin FROM USERS a' +
            ' LEFT JOIN AREAS b ON a.locate_area = b.id' +
            ' LEFT JOIN OFFICES c ON b.office_id = c.id' +
            ' WHERE a.STATUS > 0 ' +
            ' AND USERNAME LIKE ?;',
          user = {};

      dbQuery(query, [usernameLowerCase], function (err, rows) {
        if (err) {
          printLog(err);
          done(null, false, {message: 'bad Name'});
          return;
        } else if (rows && rows.length) {
          user = rows[0];

          if (user.status == 2) {
            printLog('User status is inactive');
            done(null, false, {code: 500, msg: 'Usuario inactivo'});
            return;
          }
          // Add allowed clients to the user session
          if (bcrypt.compareSync(password, user.password)) {
            // Add allowed clients to the user session
            dbQuery('select client_id from USERS_CLIENTS where user_id = ?', [user.id], function (err, rows) {
              if (err) {
                printLog(err);
                done(null, false, err);
                return;
              } else if (rows && rows.length) {
                user.clients = rows.map(function (item) {
                  return item.client_id;
                });
              }

              query = 'select e.name, r._view, r._create, r._edit, r._delete  ' +
                    'from ENTITIES e ' +
                    'left join RESTRICTIONS r  on e.id = r.entity_id and r.user_id = ? ';

              dbQuery(query, [user.id], function (err, rows) {
                if (err) {
                  printLog(err);
                  done(null, false, err);
                  return;
                } else {
                  user.restrictions = {};
                  if (rows && rows.length) {
                    rows.forEach(function (item) {
                      user.restrictions[item.name] = item;
                    });
                  }
                  done(null, user);
                }
              });
            });

          } else {
            printLog('Pass: ' + username + ' not found');
            done(null, false, {message: 'bad passoword'});
            isLogginFail = true;
          }
        } else {
          printLog('Username: ' + username + ' not found');
          done(null, false, {code: 500, msg: 'Usuario no encontrado'});
          isLogginFail = true;
        }
      });
    }
  ));

  app.get('/validate', function (req, res) {
    var message = '';

    if (isLogginFail){
      message = 'El usuario o contraseña es incorrecto.';
      // Reset variable for the next request
      isLogginFail = false;
    }
    res.render('login', { message: message});
  });

  // para logear
  app.post('/signIn', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/validate',
    failureUsername: 'Invalid username or password'
  }), function (req, res) {
    res.redirect('/');
  });

  // Destroy session
  app.get('/logout', function (req, res){
    req.logOut();
    res.redirect('/');
  });

};
