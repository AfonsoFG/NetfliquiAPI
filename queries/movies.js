const mysql = require('mysql');

var con = mysql.createPool({
	connectionLimit: 10,
	host: "localhost",
	user: "afonsofg",
	password: "root",
	database: "netfliqui"
});

const getMovies = (req) => new Promise((resolve, reject) => {

    const status = {
        success: false,
        code: '',
        message: ''
    };
    
    let data;

	let query =
		"SELECT movies.*, mpaa_ratings.name as mpaa_rating_name, mpaa_ratings.img as mpaa_rating_img "
		+ "FROM movies "
		+ "LEFT JOIN mpaa_ratings ON movies.mpaa_rating_id = mpaa_ratings.id";

	let placeholders = [];

	if (req.query.filter) {

		const filterableColumns = ['id', 'year'];

		let [column, value] = req.query.filter.split(':');

		if (!filterableColumns.includes(column)) {
            status.code = 500;
            status.message = 'Invalid filterable column';
			return reject({ data, status, query });
		}

		if (column === 'id') {
			id = parseInt(value, 10);
			query += ' WHERE id = ?';
			placeholders.push(id);
		} else if (column === 'year') {
			year = parseInt(value, 10);
			query += ' WHERE year = ?';
			placeholders.push(year);
		}
	}

	if (req.query.sort === undefined) {
		query += ' order by id asc';
	} else {

		const sortableColumns = ['id', 'title', 'title_oficial', 'imdb_top250', 'year', 'release_date', 'imdb_rating', 'user_rating_avg', 'runtime'];

		let [column, order] = req.query.sort.split(':');

		if (!sortableColumns.includes(column)) {
            status.code = 500;
            status.message = 'Invalid sort column';
			return reject({ data, status, query });
		}

		if (order === undefined) {
			order = 'asc';
		}

		if (order !== 'asc' && order !== 'desc') {
            status.code = 500;
            status.message = 'Invalid sort order';
			return reject({ data, status, query });
		}

		query += ' order by movies.' + column + " " + order;
	}

	if (req.query.offset || req.query.limit) {
		let offset = parseInt(req.query.offset, 10);
		let limit = parseInt(req.query.limit, 10);
		query += " LIMIT ?,?";
		placeholders.push(offset);
		placeholders.push(limit);
	}

	con.query(query, placeholders, function (err, result) {
		if (err) {
            status.code = 500;
            status.message = 'An error occured connecting to the database'
			return reject({ data, status, query });
		} else {
			result.map(item => {
				let mpaa_rating = {
					id: item['mpaa_rating_id'],
					name: item['mpaa_rating_name'],
					img: item['mpaa_rating_img']
				}
				delete (item['mpaa_rating_id']);
				delete (item['mpaa_rating_name']);
				delete (item['mpaa_rating_img']);
				item['mpaa_rating'] = mpaa_rating;
			});
		
            status.success = true;
            status.code = 200;
            status.message = 'Data retrieved successfully';
            data = result;
            
		}
        return resolve({ data, status, query });
    });
});

module.exports = { getMovies };