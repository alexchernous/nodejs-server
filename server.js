'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();

var corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions));
app.use(express.static(__dirname + '/'));
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
  extended: true
}));

var fruits = {
  apple: {
    color: 'green'
  },
  orange: {
    color: 'orange'
  },
  strawberry: {
    color: 'red'
  },
  blueberry: {
    color: 'blue'
  }
};

var fruitList = Object.keys(fruits);

app.get('/', function (req, res) {
  res.json({
    'Fruit service status': 'RUNNING'
  });
});

app.get('/fruit/fruitList', function (req, res) {
  res.send(JSON.stringify(fruitList));
});

app.get('/fruit/:id', function (req, res) {
  res.send(JSON.stringify(fruits[req.params.id]));
});

app.post('/fruit', function (req, res) {
  fruits[req.body.name] = req.body.content;
  res.send(JSON.stringify(fruits));
});

// start server
if (!module.parent) {
  const port = process.env.PORT || 3001;

  app.listen(port, () => {
    console.log(`Server listening on port ${port}.`);
  });
}