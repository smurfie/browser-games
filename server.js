const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || 'localhost'; // 'production' in production

let express = require('express'),
  app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');

// set the public folder
app.use(express.static('public'));

// to support JSON-encoded bodies: FIXME
// app.use(express.urlencoded({ extended: true, limit:'1Mb', parameterLimit:10000 }));
// app.use(express.json());

app.get('/', function(req, res) {
  res.render('home');
});

app.get('/home', function(req, res) {
  res.render('home');
});

app.get('/game/snaek', function(req, res) {
  res.render('snaek');
});

app.get('/game/maze', function(req, res) {
  res.render('maze');
});

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
})