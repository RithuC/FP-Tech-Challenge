/*
 * Serve JSON to our AngularJS client
 */
var express     = require('express');
var https       = require('https');
var q           = require('q');
var api         = express.Router();
var db          = require('../config/db').connection;					

// API endpoint for /api/apparel
api.get('/api/apparel/:styleCode?', function(req, res) {
	// Insert Apparel API code here
	db.query('SELECT DISTINCT * from apparel group by style_code', 
		function(err, rows, fields) {
			if (err){
				throw err;
			}
			res.json(rows);
	});
});

// API endpoint for /api/quote
api.post('/api/quote', function(req, res) {
	// Insert Quoting API code here
	var quote = getApparelPrice(req.body.sr, req.body.cc, req.body.sc)
		.then(function(result){
			res.send(result);
		});
});

// Function for making an Inventory API call
var getApparelPrice = function getPrice(style_code, color_code, size_code) {
	var	apparelPriceDeferred = q.defer();
	// Format the Inventory API endpoint as explained in the documentation
	var getLink = "https://www.alphashirt.com/cgi-bin/online/xml/inv-request.w?sr="
					+style_code+"&cc="+color_code+"&sc="+size_code+
					"&pr=y&zp=10002&userName=triggered1111&password=triggered2222";
	https.get(getLink, function(res) {
		res.on('data', function (data) {
			// Parse response XML data here
			/**********************************************************************
			I wasn't sure if we were allowed to download libraries or not but
			I would have probably used the xml2js library to parse the XML data.
			Instead, here I'm just turning the object into a Sting and using String
			operations to get the price instead.
			**********************************************************************/
			var xml = data.toString();
			var start = xml.indexOf('price="$')+8;
			var end = xml.indexOf('" size-code=');
			var price = xml.substring(start, end);
			apparelPriceDeferred.resolve(price);
		});
	}).on('error', function(error) {
		// Handle EDI call errors here
		apparelPriceDeferred.reject("Cannot complete the query");

	});

	return apparelPriceDeferred.promise;
}

module.exports = api;