// test/all.js
var core = require.context('./app/core', true, /\.js$/);
core.keys().forEach(core);

var app = require.context('./app/features', true, /\.js$/);
app.keys().forEach(app);