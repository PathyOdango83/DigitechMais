const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();

app.use(session({ secret: 'ssshhhhh' }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

function createDBConnection() {
  const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'digitechmais'
  });

  con.connect((err) => {
    if (err) {
      console.log('Error connecting to database...', err);
      return;
    }
    console.log('Connection established!');
  });

  return con;
}

app.get('/', (req, res) => {
  var message = '';
  req.session.destroy();
  res.render('cadastro', { message: message });
});

app.get('/cadastro', (req, res) => {
  res.redirect('../');
});

app.get('/index', (req, res) => {
  if (req.session.user) {
    const con = createDBConnection();
    const query2 = 'SELECT * FROM users WHERE email LIKE ?';
    con.query(query2, [req.session.user], (err, results) => {
      res.render('index', { message: results });
    });
  } else {
    res.redirect('/');
  }
});

app.get('/login', (req, res) => {
  var message = '';
  res.render('login', { message: message });
});

app.post('/cadastrar', (req, res) => {
  const nome = req.body.nome;
  const password = req.body.pwd;
  const email = req.body.email;

  const con = createDBConnection();

  const queryConsulta = 'SELECT * FROM users WHERE email LIKE ?';

  con.query(queryConsulta, [email], (err, results) => {
    if (results.length > 0 && results[0].email === email) {
      var message = 'E-mail já cadastrado';
      res.render('cadastro', { message: message });
    } else {
      const query = 'INSERT INTO users (nome, email, password) VALUES (?, ?, ?)';

      con.query(query, [nome, email, password], (err, results) => {
        if (err) {
          throw err;
        } else {
          console.log('Usuário adicionado com email ' + email);
          var message = 'ok';
          res.render('cadastro', { message: message });
        }
      });
    }
  });
});

app.post('/log', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const con = createDBConnection();

  const query = 'SELECT * FROM users WHERE password = ? AND email LIKE ?';

  con.query(query, [password, email], (err, results) => {
    if (results.length > 0) {
      req.session.user = email;
      console.log('Login feito com sucesso!');
      res.render('index', { message: results });
    } else {
      var message = 'Login incorreto!';
      res.render('login', { message: message });
    }
  });
});

app.post('/update', (req, res) => {
  const email = req.body.email;
  const pass = req.body.pwd;
  const username = req.body;
})
