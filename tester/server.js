// server.js

// DEPENDENCIES
// ===============================================

var express = require('express'),
  app = express(),
  bodyParser = require('body-parser'), // Middleware to read POST data
  exphbs = require('express-handlebars');

// SETUP
// ===============================================

// Set the port number.
var   port = Number(process.env.PORT || 8080);

// Set up body-parser.
// To parse JSON:
app.use(bodyParser.json());
// To parse form data:
app.use(bodyParser.urlencoded({
  extended: true
}));


// Tell the app that the templating engine is Handlebars.
app.engine('handlebars',
  // Pass default configuration to express-handlebars module.
  exphbs({
    defaultLayout: 'main'
  }));

// Tell the app that the view engine is also Handlebars.
app.set('view engine', 'handlebars');

// DATABASE
// ===============================================

// Setup the database.
var Datastore = require('nedb');
var db = new Datastore({
  filename: 'goals.db', // Provide a path to the database file.
  autoload: true, // Automatically load the database.
  timestampData: true // Add and manage the fields createdAt and updatedAt.
});

// ROUTES
// ===============================================

// GET all goals.
// (Accessed at GET http://localhost:8080/goals)
app.get('/goals', function(req, res) {
  db.find({}).sort({
    updatedAt: -1
  }).exec(function(err, goals) {
    if (err) res.send(err);
    res.json(goals);
  });
});

// POST a new goal.
// (Accessed at POST http://localhost:8080/goals)
app.post('/goals', function(req, res) {
  var goal = {
    description: req.body.description,
  };
  db.insert(goal, function(err, goal) {
    if (err) res.send(err);
   // to use this route directly for the view 
    // until cleaner solution is implemented 
    // redirect instead of res.json 
    // res.json(goal);
    res.redirect('/');
  });
});


// GET a goal.
// (Accessed at GET http://localhost:8080/goals/goal_id)
app.get('/goals/:id', function(req, res) {
  var goal_id = req.params.id;
  db.findOne({
    _id: goal_id
  }, {}, function(err, goal) {
    if (err) res.send(err);
    res.json(goal);
  });
});

// DELETE a goal.
// (Accessed at DELETE http://localhost:8080/goals/goal_id)
app.delete('/goals/:id', function(req, res) {
  var goal_id = req.params.id;
  db.remove({
    _id: goal_id
  }, {}, function(err, goal) {
    if (err) res.send(err);
    res.sendStatus(200);
  });
});

// GET the home page
// (Accessed at GET http://localhost:8080/)
app.get('/', function(req, res) {
  db.find({}).sort({
    updatedAt: -1
  }).exec(function(err, goals) {
    if (err) res.send(err);
    var obj = {
      goals: goals,
      helpers: {
        formatCreatedAt: function() {
          return this.createdAt.toLocaleDateString();
        }
      }
    };
    res.render('index', obj);
  });
});

// START THE SERVER
// ===============================================

app.listen(port, function() {
  console.log('Listening on port ' + port);
});