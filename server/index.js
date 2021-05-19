const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');

const mysql = require('mysql');

// Database Credentials
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'croochallenge',
    port: 3306 //optional
})

const http = require('http').createServer(app);
var io = require('socket.io')(http);

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}))

// GET Reuqest
app.get('/api/get', (req,res)=>{
    const sqlSelect = "SELECT * FROM customer_comments";
    db.query(sqlSelect, (err,result)=>{
        res.send(result);
    });
});

// POST Request
app.post('/api/insert', (req, res) => {

    const name = req.body.name;
    const email = req.body.email;
    const comment = req.body.comment;
    const currentDate = new Date();
    req.body.date = currentDate;

    const sqlInsert = "INSERT INTO customer_comments (name, email, comment, date) VALUES (?,?,?,?)";
    db.query(sqlInsert, [name, email, comment, currentDate], (err, result) => {
        io.emit('message', req.body);
    });

});

// Port on which server is running
http.listen(3001, () => {
    console.log('listening on port 3001');
})