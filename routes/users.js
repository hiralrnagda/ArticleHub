const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator'); //https://flaviocopes.com/express-validate-input/
const bcrypt = require('bcryptjs');
const passport = require('passport');

//Bring in user models
let User = require('../models/user');
const { render } = require('pug');

//register form
router.get('/register', function(req, res){
    res.render('register', {
        title: 'Register'
    });
});

//register process
router.post('/register', [
    check('req.body.name',)
        .isEmpty()
        .withMessage('Name is required'),
    check('req.body.email',)
        .isEmpty()
        .withMessage('Email is required'),
    check('req.body.username',)
        .isEmpty()
        .withMessage('Username is required'),
    check('req.body.password','Password is required')
        .isEmpty()
        .equals('req.body.password2')
        .withMessage("Passwords didn't match")
  ], (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty) 
    {
        console.log(errors);
        errors.forEach((error) => {
            req.flash('danger', error.msg);
        }
        );
        res.render('register', {
            title: 'Register',
            errors: errors
        });
    }
    else
    {
        let newUser = new User({
            name: req.body.name,
            email: req.body.email,
            username: req.body.username,
            password: req.body.password
        });
        
        bcrypt.genSalt(10, function(err, salt){
            bcrypt.hash(newUser.password, salt, function(err,hash){
                if(err){
                    console.log(err);
                }
                newUser.password = hash;
                newUser.save(function(err){
                    if(err){
                        console.log(err);
                        return;
                    } else {
                        req.flash('success','You are now registered and can login');
                        res.redirect('/users/login');
                    }
                });
            });
        });
    }  
});

//login form
router.get('/login', function(req, res){
    res.render('login');
});

//login process
router.post('/login', function(req, res, next){
    passport.authenticate('local',{
        successRedirect: '/',
        failureRedirect:'/users/login',
        failureFlash: true
    })(req, res, next);
    //res.redirect('/');
});

//logout
router.get('/logout', function(req, res){
    req.logout();
    req.flash('success', 'You are logged out');
    res.redirect('/users/login');
});

module.exports = router;