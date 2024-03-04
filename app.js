const express = require('express')

const {open} = require('sqlite')

const sqlite3 = require('sqlite3')

const path = require('path')

const databasepath = path.join(__dirname, 'moviesData.db')

const app = express()

app.use(express.json())

let database = null

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasepath,

      driver: sqlite3.Database,
    })

    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    )
  } catch (error) {
    console.log(`DB Error: ${error.message}`)

    process.exit(1)
  }
}

initializeDbAndServer()

const consvertingMovieDbObjectToResponse = dbObject => {
  return {
    movieId: dbObject.movie_id,

    directorId: dbObject.director_id,

    movieName: dbObject.movie_name,

    leaddActor: dbObject.lead_actor,
  }
}

const convertingDirectorObjectToResponse = dbObject => {
  return {
    directorId: dbObject.director_id,

    directorName: dbObject.director_name,
  }
}

// API get method

app.get('/movies/', async (request, response) => {
  const getAllmovieObjectQuery = `

        SELECT 

        movie_name

        FROM

        movie;`

  const movieArray = await database.all(getAllmovieObjectQuery)

  response.send(
    movieArray.map(eachMovie => ({movieName: eachMovie.movie_name})),
  )
})

//API POST

app.post('/movies/', async (request, response) => {
  const movieDetials = request.body

  const {directorId, movieName, leadActor} = movieDetials

  const addMovieQuery = `

            INSERT INTO 

            movie (director_id,movie_name,lead_actor)

            VALUES(

            ${directorId},

            "${movieName}",

            "${leadActor}")`

  await database.run(addMovieQuery)

  response.send('Movie Successfully Added')
})

//API GET

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params

  const getMovieQuery = `

        SELECT 
        movie_id AS movieId,
        director_id AS directorId,
        movie_name AS movieName,
        lead_actor AS leadActor

        FROM 

        movie

        WHERE 
        movie_id = ${movieId};`

  const movie = await database.get(getMovieQuery)

  response.send(movie)
})

//API PUT

app.put('/movies/:movieId/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body

  const PutQueryToUpdate = `


    UPDATE


    movie


    SET


    director_id = ${directorId},


    movie_name = "${movieName}",


    lead_actor = "${leadActor}"


    `

  await database.run(PutQueryToUpdate)

  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params

  const deleteQuery = `

    DELETE FROM

    movie

    WHERE

    movie_id = ${movieId};`

  await database.run(deleteQuery)

  response.send('Movie Removed')
})

app.get('/directors/', async (request, response) => {
  const {directorId} = request.body

  const getDirectorQuery = `

    SELECT 

    *

    FROM

    director;`

  const directorsArray = await database.all(getDirectorQuery)

  response.send(
    directorsArray.map(eachDirector =>
      convertingDirectorObjectToResponse(eachDirector),
    ),
  )
})

// problem here

app.get('/directors/:directorId/movies/', async (request, response) => {
  
  const {directorId} = request.params

  const getDirectorMoviesQuery = `
      SELECT 
      movie_name
      FROM
      movie
      WHERE
        director_id = '${directorId}';`
  const moviesArray = await database.all(getDirectorMoviesQuery)

  response.send(
    moviesArray.map(eachMovie => ({movieName: eachMovie.movie_name})),
  )
})

module.exports = app
