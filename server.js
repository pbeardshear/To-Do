var exp = require('express');
var mongoose = require('mongoose');
var schema = require('./schema.js');

/** Defining the models */
mongoose.connect('mongodb://localhost/');
schema.defineModels(mongoose, function(){
	User = mongoose.model('User');
    });

var app = exp.createServer(exp.logger(), exp.bodyParser(), exp.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.get('/', function(request, response){
	response.render('index');
    });

app.post('/', function(request, response){
	response.send(request.body.data);
    });

app.get('/:id', function(request, response){
	response.send(request.params.id);
    });

var port = process.env.PORT || 1337;
app.listen(port, function(){
	console.log("Server started");
    });
