'use strict'
const express = require('express');
const server = express();
const data = require('../MovieData/data.json');
const cors = require('cors');
const axios = require('axios');
const pg= require('pg');
server.use(cors());
require('dotenv').config();
const apiKey = process.env.api_key;
server.use(express.json());
const PORT = 3000;


const client = new pg.Client(process.env.Data_base_url);
function Movie(title, poster_path, overview) {
    this.title = title;
    this.poster_path = poster_path;
    this.overview = overview
}
function MovieApi(id, title, release_date, poster_path, overview) {
    this.id = id;
    this.title = title;
    this.release_date = release_date;
    this.poster_path = poster_path;
    this.overview = overview
}

let firstMovie = new Movie(data.title, data.poster_path, data.overview);
server.get('/', (req, res) => {
    res.send(JSON.stringify(firstMovie));
});
server.get('/favorite', (req, res) => {
    res.send("Welcome to Favorite Page");
});



let obj = {
    status: 500,
    resonseText: "Sorry, something went wrong"
};

server.get('/trending', TrendyMoviesEveryWeek);
server.get('/search', SearchForMovies);
server.get('/ReleasDate', SearchReleasDate);
server.get('/SimilarMovies', SimilarMovies);
server.get('/getMovies', gitMoviesHandelar);
server.post('/addMovie' , postMovies);
server.delete('/DELETE/:id' ,dELETEByid);
server.put('/UPDATE/:id',updateMovies);
server.get('/getMovie/:id',getMovieById)

server.get('/servererror', (req, res) => {
    res.status(500).send("Page Not Found");
});
server.get('*', (req, res) => {
    res.status(404).send(JSON.stringify(obj));
});
server.use(errorHandler)

function TrendyMoviesEveryWeek(req, res) {
    try{

    let url = `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`;
    axios.get(url)
        .then(result => {
           
            let MovieApiList = result.data.results.map(item => {
                let movie = new MovieApi(item.id, item.title, item.release_date, item.poster_path, item.overview)
                return movie;
            })
            res.send(MovieApiList);
        })
        .catch((error) => {
            res.status(500).send(error);
        })
    }
        catch(error){
            errorHandler(error,req,res);
        }
}
function SearchForMovies(req, res) {
   try{
    let url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=en-US&query=2&page=1&include_adult=false&primary_release_year=2000`;
    axios.get(url)
        .then(result => {
            
            let MovieApiListIn2000 = result.data.results.map(item => {
                let movie = new MovieApi(item.id, item.title, item.release_date, item.poster_path, item.overview)
                return movie;
            })
            res.send(MovieApiListIn2000);
        })
        .catch((error) => {
            res.status(500).send(error);
        })
    }
    catch(error){
        errorHandler(error,req,res);
    }
}

 
function SearchReleasDate(req, res) {
try{
    let url = `https://api.themoviedb.org/3/movie/10468/release_dates?api_key=${apiKey}`;
    axios.get(url)
        .then(result => {
            
            let Movie= result.data.results;
        
        
            res.send(Movie);
        })
        .catch((error) => {
            res.status(500).send(error);
        })
    }
    catch(error){
        errorHandler(error,req,res);
    }
}

function dELETEByid(req , res){
    const id= req.params.id;
    console.log(req.params.id);
    const sql = `DELETE FROM movies WHERE di=${id};`
    client.query(sql)
    .then((data3)=>{
        res.status(202).send(data3)
    })
    .catch((error)=>{
        errorHandler(error,req,res)
    })
}
 
function updateMovies(req,res){
   
    const id= req.params.id;
    console.log(req.params.id);

    const sql = `UPDATE movies
    SET title = $1
    WHERE di = ${id};`
    const {title} = req.body;
    const values = [title];
    client.query(sql,values).then((data5)=>{
        res.send(data5)
    })
    .catch((error)=>{
        errorHandler(error,req,res)
    })
}

function getMovieById(req , res){

    const id = req.params.id;
    const sql=`SELECT * FROM movies WHERE di =${id}
    ;`
    client.query(sql).then((data6)=>{
        res.send(data6)
    })
    .catch((error)=>{
        errorHandler(error,req,res)
    })

}
   
function SimilarMovies(req, res) {
try{
    let url = `https://api.themoviedb.org/3/movie/10468/similar?api_key=${apiKey}&language=en-US&page=1`;
    axios.get(url)
        .then(result => {
            
            let MovieApiListIn2000 = result.data.results.map(item => {
                let movie = new MovieApi(item.id, item.title, item.release_date, item.poster_path, item.overview)
                return movie;
            })
            res.send(MovieApiListIn2000);
        })
        .catch((error) => {
            res.status(500).send(error);
        })
    }
    catch(error){
        errorHandler(error,req,res);
    }
}

function gitMoviesHandelar(req,res){
const sql = `SELECT * FROM movies`;
client.query(sql)
.then(data1 =>{
res.send(data1.rows);
})

.catch((error)=>{
   errorHandler(error,req,res);
})
}

function postMovies(req, res){
   const mov = req.body;

   console.log(mov);

   const sqlInsert = `INSERT INTO movies (title , overview)
   VALUES($1,$2)`;
   const value= [mov.title , mov.overview];
   client.query(sqlInsert,value)
   .then( data2 =>{
      res.send("Data has been added susccefull")
   }).catch((error)=>{
      errorHandler(error,req,res);
   })

}
 


client.connect()
.then(() =>{
   server.listen(PORT, () => {
      console.log('server')
     });
})
function errorHandler(error,req,res){
    const err={
        errNum:500,
        msg:error
    }
    res.status(500).send(err);
}