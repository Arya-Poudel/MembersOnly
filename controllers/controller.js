const bcrypt = require('bcryptjs');
const {body, validationResult} = require('express-validator');
const User = require('../models/user');
const Message = require('../models/message');
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

//set up passport for authentication
passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) { 
        return done(err);
      };
      if (!user) {
        return done(null, false, {message: 'Incorrect username'});
      }
	  bcrypt.compare(password, user.password, (err, res) => {
		  if (res) {
		    // passwords match! log user in
		    return done(null, user)
		  } else {
		    // passwords do not match!
		    return done(null, false, {message: 'Incorrect password'});
		  }
	  })	
    });
  })
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});


exports.show_messages = (req,res, next) => {
	Message.find({})
	.populate('user')
	.exec((err, messages) => {
		if (err) {return next(err); }
		res.render("index" , { user: req.user, messages: messages }) 
		return;
	})
}


exports.create_user = [
	//validate and sanitise
	body('username', 'Username must be unique and non-empty')
	    .trim()
	    .exists() 
	    .escape(),
	body('password', 'Password must be non-empty')
		.trim()
		.exists()
		.escape(),
	body('confirm_password', "Error: The passwords don't match")
		.trim()
		.exists()
		.custom((value, {req}) =>  value === req.body.password)
		.escape(),

	//process request
	(req, res, next) => {

		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			res.render('sign-up',{title: 'Sign Up', errors: errors.array() });
			return;
		}

		User.findOne({'username':req.body.username},(err,result) => {
		  if (err) { return next(err); }
          if(result){ 
              res.render('sign-up',{title:'Sign-Up', error: 'Sorry. This username is already taken'});
              return;
        	} else { 
        		bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
				if (err) { return next(err); }
				const newUser = new User(
					{
						username: req.body.username,
						password: hashedPassword,
						isMember: false,
						isAdmin: false
					})
				newUser.save(err => {
						if (err) { return next(err); }
						res.redirect('/login');
						return;
					})
				})		
        	}
	    	})
	}
]

exports.validate_user = [
	passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true 
  })
]

exports.create_message = [
	//validate and sanitise
	body('title', 'Title must be non-empty')
	    .trim()
	    .exists() 
	    .escape(),
	body('message', 'Message must be non-empty')
		.trim()
		.exists()
		.escape(),
	//process request
	(req, res, next) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			res.render('create_message',{ errors: errors.array() });
			return;
		}

		let date = new Date().toLocaleString();
		const newMessage = new Message(
			{
				title: req.body.title,
				message: req.body.message,
				time: date,
				user: res.locals.currentUser._id
			})
		newMessage.save(err => {
				if (err) { return next(err); }
				res.redirect('/');
				return;
			})
	}
]

exports.become_member = (req, res, next) => {
	let clubPassword = process.env.member_password
	if (req.body.club_password === clubPassword) {
		User.findByIdAndUpdate(
		  res.locals.currentUser._id,
		  { isMember: true },
		  { useFindAndModify: false }, 
		  (err) => {
				if (err) { return next(err); }
				res.redirect('/');
				return;
		})
	} else{
		res.render('become_member', {errormsg: 'Wrong password'})
		return;
	}
}

exports.become_admin = (req, res, next) => {
	let adminPassword = process.env.admin_password
	if (req.body.admin_password === adminPassword) {
		User.findByIdAndUpdate(
		  res.locals.currentUser._id,
		  { isAdmin: true },
		  { useFindAndModify: false }, 
		  (err) => {
				if (err) { return next(err); }
				res.redirect('/');
				return;
		})
	} else{
		res.render('become_admin', {errormsg: 'Wrong password'})
		return;
	}
}

exports.delete_message = (req, res, next) => {
	Message.findByIdAndRemove(req.params.id, (err) => {
		if (err) { return next(err); }
		res.redirect('/');
		return;
	})
}