const express = require('express')
const app = express()
const http = require('http');
const url = require('url');
const WebSocket = require('ws');
var mysql = require('mysql');
var bodyParser = require('body-parser');

var con = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "",
	database: "echomote"
  });
  
  con.connect(function(err) {
	if (err) throw err;
	console.log("Connected!");
  });

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// app.use(function (req, res) {
// 	res.setHeader('Content-Type', 'text/plain')
// 	res.write('you posted:\n')
// 	var body = JSON.stringify(req.body, null, 2);
// 	console.log(body)
// 	res.end(body);
//   })

// start the server
app.listen(5000, function() {
	console.log('Listening on port 5000');
});

const wss = new WebSocket.Server({ port: 3000});

function heartbeat() {
	this.isAlive = true;
}

wss.on('connection', function(ws, req) {
	const location = String(url.parse(req.url, true).query['id']);
	if(location != null) {
		let query = "SELECT * FROM pis where piID = '" + location + "'";
		console.log(query);
		con.query(query, (err, result) => {
			if (err) throw err;
			if(result.length === 0) {
				con.query("INSERT INTO pis(piID) values ('" + location + "')", (err, result) => {
					if(err) throw err;
					console.log(result);
				});
			}
		})
		ws.location = location;
	}
	ws.isAlive = true;
	ws.on('pong', heartbeat);
});

const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) return ws.terminate();

    ws.isAlive = false;
    ws.ping('', false, true);
  });
}, 30000);

// base route to navigate to see if it works
app.get('/', function (req, res) {
	var string = '';

	wss.clients.forEach(ws => {
		string += "<li>"+ ws.location + "</li>";
	});
	

	res.send('<div><ul>'+string+'</ul></div>')
})

// power function, req has echo id
app.post('/power', function(req, res) {
	// connect to database, grab all pis associated with this echo
	// Send a power signal to the pi who has this name
	//console.log(req);
	con.query("SELECT * FROM pis WHERE piId = '" + req.body.deviceId + "'", (err, result) => {
		if(err) throw err;
		if(result.length !== 0) {
			wss.clients.forEach(ws => {
				console.log()
				if(ws.location == req.body.deviceId) {
					ws.send('POWER');
					console.log('POWER');
				}
			})
		}
	})
	res.send('success');
})

app.post('/volume', function(req, res) {
	console.log('received power signal');
})

/*
* Used to register a new echo device and pair it with a corresponding pi
* should only need a echo Id, will do a lookup on IP address and try to match it with an pi
*/
app.post('/register', (req, res) =>{

});



// will return a list of devices connected to this IP
app.get('/get-devices', (req, res) => {
	con.query('SELECT piID as piID FROM pis', (err, result) => {
		if(err) {
			res.statusCode = 500;
			res.send('An error occured grabbing the devices');
		}
		var responseObject = [];
		for(var i = 0; i < result.length; i++) {
			responseObject.push({
				applianceId: result[i].piID,
				endpointId: result[i].piID,
				friendlyName: "TV",
				description: "A TV controlled by my echo"
			});
		}
		console.log(JSON.stringify(responseObject));
		res.send(responseObject);
	})
});

function sendRequestToEcho(echoId) {

}

