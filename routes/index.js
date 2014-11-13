var express = require('express'),
	gFit = require('../lib/google-fit.js'),
	config    = require('../config/config.json'),
	models  = require('../models'),
	googleapis = require('googleapis'),
    OAuth2Client = googleapis.auth.OAuth2,
	googleOauth2Client = new OAuth2Client(config.google.clientId,config.google.clientSecret, 'https://localhost:3000/oauth2callback');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
		googleOauth2Client.setCredentials({
		  access_token: config.google.accessToken,
		  refresh_token: config.google.refreshToken
		});
		googleOauth2Client.refreshAccessToken(function(err, tokens){
			if(err){
				res.status(err.status || 500);
				res.send({"error":err});
				return;
			}
			gFit.listDataSources(tokens.access_token,function(status,data) {
				var now = new Date();
				var start = new Date();
					start.setHours(0);
					start.setMinutes(0);
					start.setSeconds(0);
					start.setMilliseconds(0);
				var datasetToday = (start.getTime() * 1000) + '-' + (now.getTime() * 1000);
				gFit.getDataset(tokens.access_token,data.dataSource[0].dataStreamId,datasetToday,function(status,data) {
					console.log('status:',status);
					console.log('data',data);
					res.send(data);
				});
			});
		});
});

router.get('/auth', function(req, res) {
	// generate a url that asks permissions for Google+ and Google Calendar scopes
	var scopes = [
	  'https://www.googleapis.com/auth/fitness.activity.read'
	];

	var url = googleOauth2Client.generateAuthUrl({
	  access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
	  scope: scopes, // If you only need one scope you can pass it as string
	  approval_prompt: 'force'
	});
	
	res.redirect(url);
});

router.get('/oauth2callback', function(req, res) {
	googleOauth2Client.getToken(req.query.code, function(err, tokens) {
	  // Now tokens contains an access_token and an optional refresh_token. Save them.
	  if(!err) {
		googleOauth2Client.setCredentials(tokens);
		  console.log(tokens);
	  }
	});
	
	res.send({"response":"ok"});
});


module.exports = router;