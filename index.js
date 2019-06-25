const port = process.env.PORT || 3003;
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');

const { decorateApp } = require('@awaitjs/express');



const movies = require('./queries/movies');

const mysql = require('mysql');

var con = mysql.createPool({
	connectionLimit: 10,
	host: "localhost",
	user: "afonsofg",
	password: "root",
	database: "netfliqui"
});

const app = decorateApp(express());

// Security with Helmet
app.use(helmet());

// enable  CORS requests
app.use(cors());

// Log HTTP requests
app.use(morgan('combined'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.listen(port, () => {
	console.log('Listening on port ' + port);
});

app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "http://localhost:3003");
	next();
});


app.get('/v1', function (req, res) {
	var d = new Date();
	var n = d.toLocaleTimeString();
	res.status(69).send(n)
});

app.getAsync('/v1/movies', async (req, res) => {
	try {
		const { data, status, query } = await movies.getMovies(req);
		res.status(200).json(
			{
				success: status.sucess,
				code: status.code,
				message: status.message,
				data_count: data.length,
				data: data,
			}
		);
	} catch(ex) {
		res.status(500).json(
			{
				success: ex.success,
				code: ex.code,
				message: ex.message,
			}
		);
	}	
});

app.get('/v1/movie/:id', function (req, res) {

	const id = parseInt(req.params.id, 10);
	const query = "SELECT movies.*, mpaa_ratings.name as mpaa_rating_name, mpaa_ratings.img as mpaa_rating_img FROM movies LEFT JOIN mpaa_ratings ON movies.mpaa_rating_id = mpaa_ratings.id WHERE movies.id = " + id;

	con.query(query, function (err, result) {
		if (err) {
			res.status(500).json(
				{
					success: false,
					code: 500,
					message: 'An error occured',
					data: []
				}
			);
		} else {
			let mpaa_rating = {
				id: result[0]['mpaa_rating_id'],
				name: result[0]['mpaa_rating_name'],
				img: result[0]['mpaa_rating_img']
			}
			delete (result[0]['mpaa_rating_id']);
			delete (result[0]['mpaa_rating_name']);
			delete (result[0]['mpaa_rating_img']);
			result[0]['mpaa_rating'] = mpaa_rating;
			res.status(200).json(
				{
					success: true,
					code: 200,
					message: 'Data retrieved successfully',
					data_count: result.length,
					data: result[0]
				}
			);
		}
	});
});

app.get('/v1/movie/:movie_id/:relation', function (req, res) {

	const relation = req.params.relation;
	const allowedRelations = ['actors', 'genres', 'producers'];

	if (!allowedRelations.includes(relation)) {
		res.status(500).json(
			{
				success: false,
				code: 500,
				message: 'Invalid relation',
			}
		);
		return;
	}

	const movie_id = parseInt(req.params.movie_id, 10);
	let query;
	if (relation === 'actors') {
		query = "SELECT * FROM actors LEFT JOIN movie_actor ON movie_actor.actor_id = actors.id WHERE movie_actor.movie_id = ?";
	} else if (relation === 'genres') {
		query = "SELECT * FROM genres LEFT JOIN movie_genre ON movie_genre.genre_id = genres.id WHERE movie_genre.movie_id = ?";
	} else if (relation === 'producers') {
		query = "SELECT * FROM producers LEFT JOIN movie_producer ON movie_producer.producer_id = producers.id WHERE movie_producer.movie_id = ?";
	}

	con.query(query, movie_id, function (err, result) {
		if (err) {
			res.status(500).json(
				{
					success: false,
					code: 500,
					message: 'An error occured',
					data: []

				}
			);
		} else {
			res.status(200).json(
				{
					success: true,
					code: 200,
					message: 'Data retrieved successfully',
					data_count: result.length,
					data: result
				}
			);
		}
	});



});


/* A TRATAR */

app.get('/v1/actores', function (req, res) {
	con.query("SELECT * FROM actores", function (err, result) {
		if (err) throw err;
		res.json(result)
	});
});

app.get('/v1/actor/:id', function (req, res) {
	const id = parseInt(req.params.id, 10);
	res.send("Actor id: " + id);
});
