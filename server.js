var exp = require('express');
var mongoose = require('mongoose');
var schema = require('./schema.js');
var mongoStore = require('connect-mongodb');

/** Defining the models **/
var db = mongoose.connect('mongodb://localhost/todo');
var User, Task;
schema.defineModels(mongoose, function() {
	User = mongoose.model('User');
	Task = mongoose.model('Task');
});

var TIME_CONSTANTS = {
	msInDay: 1000*60*60*24,
	msInHour: 1000*60*60
};

// Returns the amount of time between the start and end dates, normalized to a particular unit of time
function getTimeDifference (start, end, normalize) {
	return (end.getTime() - start.getTime())/normalize;
}

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
	console.log('home page');
	if (request.isLoggedIn) {
		console.log('im logged in');
		// Retrieve the list of tasks for this user
		Task.find({ owner: request.currentUser }, function (err, tasks) {
			var today = new Date();
			// Sort the tasks by due date, and add some meta info so that the client can render them more easily
			var bins = { today: [], tomorrow: [], thisWeek: [], nextWeek: [], thisMonth: [], future: [] };
			for (var i = 0; i < tasks.length; i++) {
				var difference = getTimeDifference(today, tasks[i].due, TIME_CONSTANTS.msInDay);
				if (difference <= 1) {
					bins[today.getDate() == tasks[i].due.getDate() ? 'today' : 'tomorrow'].push(tasks[i]);
				} else if (difference > 1 && tasks[i].due.getDay() > today.getDay()) {
					bins.thisWeek.push(tasks[i]);
				} else if (difference > 1 && difference < (14 - today.getDay())) {
					bins.nextWeek.push(tasks[i]);
				} else if (today.getMonth() == tasks[i].due.getMonth()) {
					bins.thisMonth.push(tasks[i]);
				} else {
					bins.future.push(tasks[i]);s
				}
			}
			response.render('index', { tasks: tasks, test: bins });
		});
	} else {
		response.render('index', { tasks: [] });
	}
});

app.post('/', function(request, response) {
	response.send(request.body.data);
});

app.get('/login', function (request, response) {
	response.render('login');
});

app.post('/login', function (request, response) {
	console.log(request.body);
	var body = request.body;
	// Perform some sanity checks
	if (body.user && body.password) {
		// Passed good info, log the user in, or create one if one doesn't exist
		User.findOne({ username: body.user }, function (err, user ) {
			if (user) {
				// Matched a user, make sure the passwords are the same
				if (user.password == body.password) {
					// Log the user in
					request.session.userID = user._id;
					response.redirect('/');
				} else {
					response.redirect('/login', { error: 'bad password' });
				}
			} else {
				// Create a user, since one doesn't exist with this username
				(new User({ username: body.user, password: body.password }))
					.save(function (err, user) {
						if (err) {
							console.error(err);
							response.redirect('/login', { error: err });
						} else {
							request.session.userID = user._id;
							response.redirect('/');
						}
					});
			}
		});
	}
});

app.get('/newTask', function (request, response) {
	response.render('newTask');
});

app.post('/newTask', function (request, response) {
	// TODO: validation check
	// Get the post data
	var body = request.body;
	console.log(body);
	(new Task({ owner: request.currentUser, name: body.name, due: body.dueDate, estimate: body.estimate, autoUpdate: body.autoUpdate })
		.save(function (err, cost) {
			console.log('got here', cost);
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
