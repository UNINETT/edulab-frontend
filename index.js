var
	express = require('express'),
	app = express(),

	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser')
	session = require('express-session'),
	Dataporten = require('passport-dataporten'),
    mustacheExpress = require('mustache-express'),

    EduLab = require('./lib/EduLab').EduLab,

	morgan = require('morgan'),
    nconf = require('nconf'),

	Health = require('./lib/Health').Health;

nconf.argv()
    .env()
    .file({ file: 'etc/config.json' })
    .defaults({
		"http": {
			"port": 8080,
			"enforceHTTPS": false
		},
		"dataporten": {
			"enableAuthentication": false
		}
    });

var shouldRedirect = function(req) {
	if (req.headers["user-agent"].match(/GoogleHC/)) {
		return false
	}
    if (!nconf.get('http:enforceHTTPS', false)) {
        return false;
    }
	if (req.protocol === 'https') {
		return false
	}
	return true
}

var dpsetup = new Dataporten.Setup(nconf.get('dataporten'));
var doAuth = nconf.get('dataporten:enableAuthentication');

app.set('json spaces', 2);
app.set('port', nconf.get('http:port'));
app.enable('trust proxy');

app.engine('mustache', mustacheExpress(__dirname + '/views/partials', '.mustache'));
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');
app.disable('view cache');

app.use(cookieParser())
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(session({
	secret: nconf.get('dataporten:sessionkey'),
	resave: false,
	saveUninitialized: false
}));

app.use(morgan('combined'));
app.use((req, res, next) => {
	if (shouldRedirect(req)) {
		return res.redirect('https://' + req.get('host') + req.originalUrl)
	}
	next()
})

if (doAuth) {
	app.use(dpsetup.passport.initialize());
	app.use(dpsetup.passport.session());

	dpsetup.setupAuthenticate(app, '/login');
	dpsetup.setupLogout(app, '/logout');
	dpsetup.setupCallback(app);

	// var authzConfig = {"redirectOnNoAccess": "/login"};
	// var aclSolberg = (new Dataporten.Authz(authzConfig))
	// 	.allowUsers(['9f70f418-3a75-4617-8375-883ab6c2b0af'])
	// 	.allowGroups(['fc:adhoc:892fe78e-14cd-43b1-abf8-b453a2c7758d'])
	// 	.middleware();

	app.use('/', Health);
	// app.use('/', aclSolberg);
}

app.use('/static/uninett-theme', express.static('node_modules/uninett-bootstrap-theme'));

app.get('/test', function(req, res) {
	var data = {
		"status": "Hello World",
		"descr": "Nothing here...",
	};
    if (req.user) {
        data.user = req.user;
        data.u = JSON.stringify(data.user, undefined, 3);
    }

    res.render('frontpage', data);

	// res.writeHead(200, {
	// 	'Content-Type': 'application/json'
	// });
	// res.end(JSON.stringify(data, undefined, 2));
});


var el = new EduLab();
app.use('/', el.getRouter());
app.use('/', express.static('public'));

// app.get('/', function(req, res) {
// 	var data = {
// 		"status": "Hello World",
// 		"descr": "Nothing here...",
// 	};
// 	res.writeHead(200, {
// 		'Content-Type': 'application/json'
// 	});
// 	res.write(JSON.stringify(data, undefined, 2));
// 	res.end();
// 	console.log("GET /");
// });

app.get('*', function(req, res){
	res.status(404).send('404 Not found');
});


app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});
