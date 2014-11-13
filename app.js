var express = require('express'),
	path = require('path'),
	logger = require('morgan'),
	bodyParser = require('body-parser'),
	models = require("./models");

var routes = require('./routes/index');

var app = express();


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express['static'](__dirname + '/public'));

app.use('/', routes);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.send({
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send({
        message: err.message,
        error: {}
    });
});


app.set('port', process.env.PORT || 3000);

models.sequelize.sync().success(function () {
  var server = app.listen(app.get('port'), function() {
    logger('Express server listening on port ' + server.address().port);
  });
});

module.exports = app;