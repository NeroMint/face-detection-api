const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');



 

const knex = require('knex');
const db = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : '',
      password : '',
      database : 'smart-brain'
    }
  });

 

const app = express();
app.use(bodyParser.json());
app.use(cors());


app.get('/', (req, res) => {
    console.log(req.params);
    res.json("it is working");
}
);

app.post('/signin',(req,res) =>{
    //get data from req
    const users = {};
    const login = {};
    db.select('*').from('users').then(data => {
        users = Object.assign({},data);
      });

    db.select('*').from('login').then(data => {
        login = Object.assign({},data);
      });
    if(req.body.email === users.email && req.body.password === login.password){
        res.json('success');    
    }else{
        res.status(400).json('error log in');
    }
    // search data from database

    // send response
})

app.post('/register',(req,res) => {
    //get data from req
    const {name,email} = req.body;
    
    // insert data into database
    db('users')
        .returning('*')
        .insert({
            name: name,
            email: email,
            joined: new Date()
        })
        .then(response => res.json(response))
        .catch(error => res.status(400).json('Unable to register'));
        
    //res.json(req.body);
})

app.get('/profile/:id',(req,res) =>{
    //get data from req
    const {id} = req.params;
})


// app.put('/image', (req,res) =>{
//     // get data from req

//     // update entrie of the user
// })

app.listen(3001, () => {
    console.log('app is running on port 3001');
});

// res = this is working
// signin --> post  = success/fail
// register --> post = new user
// /profile/:userId --> GET = user
// image --> PUT --> user