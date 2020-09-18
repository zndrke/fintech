var mysql      = require('mysql');
var connection = mysql.createConnection({
	  host     : 'db-4rgvu.cdb.ntruss.com',
	  user     : 'hospass_db',
	  port	   : '3306',
	  password : 'hospass123!@',
	  database : 'hospass_db'
});

connection.connect();

connection.query('SELECT * FROM user', function(err, results, fields) {
	  if (err) {
		      console.log(err);
		    }
	  console.log(results);
});

connection.end();
