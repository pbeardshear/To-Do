var exp = require('express');
var mongoose = require('mongoose');
var schema = require('./schema.js');
var mongoStore = require('connect-mongodb');

/** Defining the models */
var db = mongoose.connect('mongodb://localhost/todo');
var User, Task;
schema.defineModels(mongoose, function() {
	User = mongoose.model('User');
	Task = mongoose.model('Task');
});

function loadUser (req, res, next) {
	res.local('header', '');
	res.local('title', '<title>To Do</title>');
	User.findById(req.session.userID, function (err, user) {
		if (err) {
			console.error(err);
		}
		if (user) {
			req.currentUser = user;
			req.isLoggedIn = true;
			res.local('isLoggedIn', true);
		} else {
			res.local('isLoggedIn', false);
		}
		next();
	});
}

var app = exp.createServer(exp.logger(), exp.bodyParser(), exp.static(__dirname + '/public'), exp.cookieParser(),
			exp.session({ secret: 'secret', store: mongoStore(db) }), loadUser);
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.get('/', function(request, response) {
	var tasks;
	if (response.isLoggedIn) {
		// Retrieve the list of tasks for this user
		tasks = Task.find({ owner: response.currentUser._id });
	}
	response.render('index', { tasks: tasks });
});

app.post('/', function(request, response) {
	response.send(request.body.data);
});

app.get('/newTask', function (request, response) {
	response.render('newTask');
});

app.post('/newTask', function (request, response) {
	// TODO: validation check
	// Get the post data
	var body = request.body;
	(new Task({ owner: request.currentUser, name: body.name, due: body.dueDate, estimate: body.estimate, autoUpdate: body.autoUpdate })
		.save(function (err, cost) {
			if (err) {
				console.error(err);
				response.render('newTask', { error: err });
			} else {
				// Redirect to the main page to display the list of tasks
				response.redirect('/');
			}
		})
	);
});

app.get('/:id', function(request, response) {
	response.send(request.params.id);
});

var port = process.env.PORT || 1337;
app.listen(port, function() {
	console.log("Server started");
});
