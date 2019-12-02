// lib/app.ts
import express = require('express');

// Create a new express application instance
const app: express.Application = express();
app.set('view engine', 'ejs');
app.use('/public', express.static('public'));

app.get('/', function (req, res) {
  res.render('index', {someInfo: "Данные для передачи"});
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});