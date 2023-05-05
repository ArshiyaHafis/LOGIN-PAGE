const express = require("express");
const mysql = require('mysql');
const app = express();
const path = require('path');
const formidable = require('formidable');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');



const port = 3000;

app.listen(port, () => {
	console.log(`Your server ⚡ is running on http://localhost:${port}`);
  });
  


//sql connection 
var sqlconnect= mysql.createConnection({
  host : 'localhost',
  user:'root',
  password : 'mysqlpython3.764',
  database : 'authentication',
  multipleStatements : true
});

sqlconnect.connect((err)=> {
  if(!err)
  console.log('Connection Established Successfully');
  else
  console.log('Connection Failed!'+ JSON.stringify(err,undefined,2));
});

app.set('view engine', 'hbs');


const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));


app.get('/', (req, res) => {
  res.render("index");
});
app.get('/register', (req, res)=>{
  res.render('register');
})
app.post('/register', (req, res)=>{
  const form = formidable({multiples:true});
  form.parse(req, (err, fields, files)=>{
	console.log(fields);
	let email = fields.email;
	let name = fields.name;
	let password = fields.password;
	let confirmPassword = fields.passwordConfirm;
	console.log(email);
	var query = "SELECT email FROM userinfo WHERE userinfo.email = ?";
	sqlconnect.query(query, [email], async (err, rows)=>{
		if(err){
			console.log(err);
		}
		if(rows.length>0){
			console.log("Yes");
			return res.render('register', {
				message: 'That email already exists'
			})
		}
		else if(password !== confirmPassword){
			console.log("Passwords are not the same");
			return res.render('register', {
				message: 'The passwords dont match'
			})
		}
		console.log('Hashing');
		const hashedPassword = await bcrypt.hash(password, 8);
		console.log(hashedPassword);
		sqlconnect.query("INSERT INTO userinfo (name, email, PASSWORD) VALUES (?, ?, ?)", [name, email, hashedPassword], (err, result)=>{
			if(err){
				console.log(err);
			}
			else{
				console.log(result)
				return res.render('register' ,{
					message: 'User Registered'
				})
			}
		})
	})
  })
})



app.get('/login', (req, res)=>{
	res.render('login');
})
app.post('/login', (req, res)=>{
	const form = formidable({multiples:true});
 	form.parse(req, (err, fields, files)=>{
		console.log(fields);
		let email = fields.email;
		let name = fields.name;
		let password = fields.password;
		var query = "SELECT * FROM userinfo WHERE userinfo.email = ?";
		sqlconnect.query(query, [email], async (err, rows)=>{
			if(err){
				console.log(err);
			}
			else if(rows.length==1){
				// console.log("yes");
				// console.log(rows[0].PASSWORD);
				// const hashedPassword = await bcrypt.hash(password, 8);
				// console.log(hashedPassword);
				if(bcrypt.compare(password,rows[0].PASSWORD)){
					res.render('profile', {
						name: rows[0].NAME,
						email: rows[0].email,
					});
				}
				else{
					return res.render('login', {
						message: 'Invalid Login'
					})
				}
			}
			else{
				return res.render('login', {
					message: 'No user registered with given email'
				})
			}
		})
	})
})