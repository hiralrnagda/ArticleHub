const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator'); //https://flaviocopes.com/express-validate-input/
const flash = require('connect-flash');
const session = require('express-session');
const config = require('./config/database');
const passport = require('passport');


mongoose.connect(config.database);
let db = mongoose.connection;

//check connection
db.once('open', function(){
    // console.log('Connected to MongoDB');
});

//check for db errors
db.on('error',function(err){
    console.log(err);
});

//init app
const app = express();

//Bring in models
let Article = require('./models/article');

//Body parser middleware
//load view engine
app.set('views',path.join(__dirname,'views'));
app.set('view engine', 'pug');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Set public folder
app.use(express.static(path.join(__dirname,'public')));

//express session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true, //false changed to true
    saveUninitialized: true,
    //cookie: { secure: true }
  }));  

//express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator Middleware --https://flaviocopes.com/express-validate-input/
app.use(express.json());

//passport config
require('./config/passport')(passport);

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
    res.locals.user = req.user || null;
    next();
});

//home route
app.get('/', function(req, res){
    Article.find({},function(err,articles){
        if(err){
            console.log(err);
        }else{
            res.render('index', {
                title: 'Articles',
                articles: articles,
            });
        }    
    });
});

//routes file
let articles = require('./routes/articles');
let users = require('./routes/users');
app.use('/articles', articles);
app.use('/users', users);

app.listen(3000, function(){
    console.log('Server started on port 3000.....');
});