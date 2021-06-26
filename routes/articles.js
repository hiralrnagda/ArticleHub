const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator'); //https://flaviocopes.com/express-validate-input/
const article = require('../models/article');

//Bring in article models
let Article = require('../models/article');

//bring in user model
let User = require('../models/user');

// Add Route
router.get('/add',  ensureAuthenticated, (req, res) => {
    res.render('add_article', {
      title: 'Add Article'
    });
  });

//get single article
router.get('/:id', function(req,res){
    Article.findById(req.params.id,function(err, article){
        User.findById(article.author, function(err, user){
            res.render('article', {
                article: article,
                author: user.name
            });
        }); 
    });   
});

//hiral remember this -- https://flaviocopes.com/express-validate-input/
//add submit POST route
router.post('/add', [
    check('req.body.title','Title is Required').exists(),
    check('req.body.body','Body is Required').exists()
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty) 
    {
        errors.forEach((error) => {
            req.flash('danger', error.msg);
        }
        );
        res.render('add_article', {
            title: 'Add Article',
            errors: errors
        });
    }
    else
    {
        let article = new Article();
        article.title = req.body.title;
        article.author = req.user._id;
        article.body = req.body.body;

        article.save(function(err){
            if(err){
                console.log(err);
                return;
            } else{
                req.flash('success','Article Added');
                res.redirect('/');
            }
        });
    }  
});

//load edit form
router.get('/edit/:id', ensureAuthenticated, function(req,res,next){ //remember to add next
    Article.findById(req.params.id,function(err, article){
        if (article.author != req.user._id){
            req.flash('danger', 'Not Authorized');
            res.redirect('/');
            return next(); //and return next here
        }
        res.render('edit_article', {
            title:'Edit Article',
            article:article
        });  
    });
});

//update submit POST route
router.post('/edit/:id', function(req,res){
    let article = {};
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    let query = {_id:req.params.id}

    Article.updateOne(query, article, function(err){
        if(err){
            console.log(err);
            return;
        } else{
            req.flash('success','Article Updated');
            res.redirect('/');
        }
    });
});

//deleting an article .. please check the main.js file js folder of public folder update to articles
router.delete('/:id', function(req,res){

    if(!req.user._id){
        res.status(500).send();
    }
    let query = { _id: req.params.id };
    Article.findById(req.params.id, function(err, article){
        if(article.author != req.user._id){
            res.status(500).send();
        } else {
            Article.remove(query, function(err){
                if(err){
                    console.log(err);
                    return;
                }else{
                    res.send('Success');
                }
            });
        }
    });
});

//access control
function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else {
        req.flash('danger', 'Please login');
        res.redirect('/users/login');
    }
}

module.exports = router;