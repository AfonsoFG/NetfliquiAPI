const express = require('express');
const port = process.env.PORT || 3003;
const app = express();


app.listen(port, () => {
   console.log('listening on: ' + port);
});

app.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "http://localhost:3000");
   next();
});


app.get('/', function (req, res) {
    var d = new Date();
    var n = d.toLocaleTimeString();
    // console.log(req);
    res.send(n + '<br>Olá <b>mundo</b>!<br>DO GITHUB')
});

app.get('/posts', function (req, res) {
    res.send("Posts");
});

app.get('/post/:id', function (req, res) {
    res.send("Posts id");
});

app.get('/comentarios', function (req, res) {
    res.send("Comentarios");
});

app.get('/comentario/:id', function (req, res) {
    res.send("Comentario ID");
});
