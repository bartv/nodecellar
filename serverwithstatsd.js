var express = require('express'),
    path = require('path'),
    http = require('http'),
    wine = require('./routes/wines');

var os = require("os");

var Lynx = require('lynx');
var LynxExpress = require('lynx-express');

var metrics = new Lynx('localhost', 8125, {prefix: os.hostname().replace(/[.]/g,'_')+'.nodecellar'});
var statsdMiddleware = LynxExpress(metrics);

var timeout = express.timeout

var app = express();

app.use(timeout(1000));
app.use(haltOnTimedout);

function haltOnTimedout(req, res, next){
  if (!req.timedout) next();
}

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.use(express.logger('dev'));
    app.use(express.bodyParser())
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(statsdMiddleware({timeByUrl: true}));
   

});

var server = http.createServer(app);

server.listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});

app.get('/wines', wine.findAll);
app.get('/wines/:id', wine.findById);
app.post('/wines', wine.addWine);
app.put('/wines/:id', wine.updateWine);
app.delete('/wines/:id', wine.deleteWine);

me = function(req, res) {
        res.send( os.hostname());
};

app.get('/origin', me);
