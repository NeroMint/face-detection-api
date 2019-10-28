const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const Clarifai = require('clarifai');



 

const knex = require('knex');
const db = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'abc',
      password : '',
      database : 'postgres'
    }
  });
//   db.select('*').from('users').then(data => {
//     console.log(data);
//   });

let onUserEmail = '';
 

const app = express();
app.use(bodyParser.json());
app.use(cors());


const appClarifai = new Clarifai.App({
    apiKey: '911b27c66c7c4b67925fbb6d3f2e2396'
   });

app.get('/', (req, res) => {
    console.log(req.params);
    res.json("it is working");
}
);

app.post('/signin',(req,res) =>{
    //get data from req
    //console.log(req.body);
    db.select('*').from('login')
      .where('email','=',req.body.email)
      .then(data => {     
        let login = Object.assign({},data[0]);
        
        let isValid = bcrypt.compareSync(req.body.password, login.hash);
        console.log(isValid); 
        if(isValid){
            onUserEmail = req.body.email;
            return db.select('*').from('users')
                     .where('email','=',req.body.email)
                     .then(data => {
                        res.json(data[0])
                     });                            
        }else{
            res.status(400).json('wrong credential');
        }
      })
      .catch( err => {
        res.status(400).json('wrong credential')});


    // search data from database

    // send response
})

app.post('/register',(req,res) => {
    //get data from req
    const {name,email,password} = req.body;
    const saltRounds = 10;
    let hash = bcrypt.hashSync(password, saltRounds);
    // insert data into database
    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email:email
        })
        .into('login')
        .returning('email')
        .then(loginemail => {
            return trx('users')
            .returning('*')
            .insert({
                name: name,
                email: loginemail[0],
                joined: new Date()
            })
            .then(users => {
                    onUserEmail = email;
                    res.json(users[0]);
                })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(error => res.status(400).json('Unable to register'));
        
    //res.json(req.body);
})

app.get('/profile/:id',(req,res) =>{
    //get data from req
    const {id} = req.params;
})


app.put('/image', (req,res) =>{
    // get data from req
    const {imageURL,useremail} = req.body;
    //console.log(imageURL);
    appClarifai.models.predict(
        Clarifai.FACE_DETECT_MODEL, 
        imageURL)
        .then( data => {
            db('users')
            .where('email', '=', useremail)
            .increment('entries',1)
            .returning('entries')
            .then(userEntries => res.json({
                box: data,
                entries: userEntries[0]
            }))
            .catch(err => res.status(400).json('Cannot get entries'))            
            })
        .catch(err => res.status(400).json('Cannot detect faces'));
    
    //db.('users').update('entries')
    // update entrie of the user
})

app.listen(3001, () => {
    console.log('app is running on port 3001');
});

// res = this is working
// signin --> post  = success/fail
// register --> post = new user
// /profile/:userId --> GET = user
// image --> PUT --> user