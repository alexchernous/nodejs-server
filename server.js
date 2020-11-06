'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const libPath = require('path');
const fs = require('fs');
const util = require('util');

const app = express();
const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};
var _lastChangedFruitTimestamp = undefined;
var _fruitData = undefined;
var _fruitList = undefined;

app.use(cors(corsOptions));
// app.use(express.static(__dirname + '/'));
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
  extended: true
}));

app.use(async (req, res, next) => {
  const fruitsBaseFilePath = libPath.join(__dirname, 'src/database/fruits.json');

  try {
    const fsStatAsync = util.promisify(fs.stat);
    const fsReadFileAsync = util.promisify(fs.readFile);

    const fruitFileStat = await fsStatAsync(fruitsBaseFilePath);

    if (!_lastChangedFruitTimestamp || (_lastChangedFruitTimestamp !== fruitFileStat.ctimeMs)) {
      _lastChangedFruitTimestamp = fruitFileStat.ctimeMs;
      const fruitFileContent = await fsReadFileAsync(fruitsBaseFilePath, 'utf-8');

      _fruitData = JSON.parse(fruitFileContent);
    }
  } catch (error) {
    console.log(`Can't grab fruit database: ${error}`);
  }

  _fruitList = Object.keys(_fruitData);
  next();
});

// Routes
app.get('/', function (req, res) {
  res.json({
    'Fruit service status': 'RUNNING'
  });
});

app.get('/fruit/fruitList', function (req, res) {
  res.send(JSON.stringify(_fruitList));
});

app.get('/fruit/:id', function (req, res) {
  res.send(JSON.stringify(_fruitData[req.params.id]));
});

app.post('/fruit', function (req, res) {
  let data = {};
  try {
    _fruitData = {..._fruitData, ...req.body};

    const fsWriteFileAsync = util.promisify(fs.writeFile);
    fsWriteFileAsync(libPath.join(__dirname, 'src/database/fruits.json'), JSON.stringify(_fruitData));

    res.status(200).send({ content: [JSON.stringify(_fruitData), req.body] });
  } catch (error) {
    console.log(`Can't write to fruit database: ${error}`);
    res.sendStatus(500);
  }
});

// Start server
if (!module.parent) {
  const port = process.env.PORT || 3001;

  app.listen(port, () => {
    console.log(`Server listening on port ${port}.`);
  });
}