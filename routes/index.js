const express = require('express');
const router = express.Router();
const controller = require('../controllers/controller');

router.get('/', controller.show_messages);

router.get("/signup", (req, res) => res.render("sign-up"));

router.post("/signup", controller.create_user);

router.get("/login", (req, res) => res.render("login", {message: req.flash('error') || ''}));

router.post("/login", controller.validate_user);

router.get("/logout", (req, res) => res.render("logout"));

router.post("/logout", (req, res) => {
	req.logout();
	res.redirect('/');
})

router.get("/create_message", (req, res) => res.render('create_message'));

router.post("/create_message", controller.create_message);

router.get("/become_member", (req, res) => res.render('become_member'));

router.post("/become_member", controller.become_member);

router.get("/become_admin", (req, res) => res.render('become_admin'));

router.post("/become_admin", controller.become_admin);

router.get("/delete_message/:id", (req, res) => res.render('delete_message'));

router.post("/delete_message/:id", controller.delete_message);


module.exports = router;