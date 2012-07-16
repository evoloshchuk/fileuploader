
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 8080);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.show_form);
app.post('/', routes.post_form);
app.post('/upload_file', routes.upload_file);

var server = http.createServer(app)

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

require('./websockets.js').attach(server)
