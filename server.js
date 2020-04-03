const express = require('express')

// load all env variables from .env file into process.env object.
require('dotenv').config()
const mustacheExpress = require('mustache-express')
const bodyParser = require('body-parser')
const { Client } = require('pg')

const app = express()
const mustache = mustacheExpress();
mustache.cache = null;
app.engine('mustache', mustache);
app.set('view engine', 'mustache');

//Establishing a connection to the PostGreSQL DATABASE 



app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));

app.get('/', (request, response) => {

    response.render('meds-form')
    
});

// Add Medicine Endpoint

app.get('/add', (request, response) => {

    response.render('meds-form')
    
});

// Homepage Endpoint
   
app.get('/meds', (request, response) => {

    const client = new Client({

        connectionString: process.env.DATABASE_URL,
        ssl: true

    });

     client.connect()
        .then(() => {
       
            return client.query('SELECT * FROM medinventory');
     })
 
        .then((results) => {
         console.log(results)
         response.render('meds', results)
 
     })
 

});


//Endpoint for the Delete Functionality 

app.post('/meds/delete/:id', (request, response) => {

    const client = new Client({

        connectionString: process.env.DATABASE_URL,
        ssl: true
 
    });
 
     client.connect()
        .then(() => {
        
        const sql = 'DELETE FROM medinventory WHERE mid= $1'
        const params = [request.params.id]
        return client.query(sql, params);
    })
 
        .then((results) => {
         
         response.redirect('/meds')
 
     })
 
})

// Endpoint for the Form input processing and Database Management 

app.post('/meds/app', (request, response) => {
    console.log('post-body', request.body)
     //Using JavaScript promise

     const client = new Client({

        connectionString: process.env.DATABASE_URL,
        ssl: true

    });

     client.connect()
        .then(() => {
         console.log('Connection Completed !');
         const sql = 'INSERT INTO medinventory (name,count, brandname) VALUES ($1, $2, $3)'
         const params = [request.body.medName, request.body.count, request.body.brandName]
         return client.query(sql, params);
     })
 
        .then((result) => {
         console.log('results?', result)
         response.redirect('/meds')
 
     })
 

    
});

//Endpoint for the edit app 

app.get('/meds/edit/:id', (request, response) => {

    const client = new Client({

        connectionString: process.env.DATABASE_URL,
        ssl: true
 
    });
 
     client.connect()
        .then(() => {
        const sql = 'SELECT * FROM medinventory WHERE mid =$1'
        const params = [request.params.id]
        return client.query(sql, params);
    })
 
        .then((results) => {
         console.log('?results', results);
         response.render('meds-edit', {med:results.rows[0]})
 
     })
 
})


app.post('/meds/edit/:id', (request, response)=>{

    const client = new Client({

        connectionString: process.env.DATABASE_URL,
        ssl: true
    });
 
     client.connect()
        .then(() => {
        const sql = 'UPDATE medinventory SET name=$1, count=$2, brandname=$3 WHERE mid=$4'
        const params = [request.body.medName, request.body.medCount, request.body.brandName, request.params.id]
        return client.query(sql, params);
    })
 
        .then((results) => {
         response.redirect('/meds')
 
     })

})

//DashBoard setup route

app.get('/dashboard', (request, response)=> {
    
    const client = new Client({

        connectionString: process.env.DATABASE_URL,
        ssl: true
 
    });
 
     client.connect()
        .then(() => {
            return client.query('SELECT SUM(count) FROM medinventory; SELECT DISTINCT COUNT(name) FROM medinventory')
        
    })
 
        .then((results) => {
         
            console.log('?results', results[0])
            console.log('?results', results[1])
            response.render('dashboard', {n1: results[0].rows, n2: results[1].rows})
     });

})



// Listen to the Server 
app.listen(process.env.PORT || 5001 , () => {
    console.log('This application is connected to Port 5001');
})