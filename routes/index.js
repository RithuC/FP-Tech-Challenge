
/*
 * GET home page.
 */
var express = require('express');
var router  = express.Router();
var api     = require('./api');

router.use(api);

router.get('/', function(req, res) {
	res.render('index');
	console.log('in index');
});

router.get('*', function (req, res) {
	res.redirect('/');
	console.log('in *');
});

module.exports = router;