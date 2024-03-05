/******************************************************************************* ITE5315 – Assignment 2* I declare that this assignment is my own work in accordance with Humber Academic Policy.* No part of this assignment has been copied manually or electronically from any other source* (including web sites) or distributed to other students.** Name: Vivek Jethva Student ID: N01579474 Date: 05/03/2024 ********************************************************************************/

var express = require('express'); //import express module
var path = require('path'); // import path
var app = express(); // create express application
app.use(express.urlencoded({ extended: true }));
const exphbs = require('express-handlebars'); // import handlebars middleware
const port = process.env.port || 3000; // set port for application
const fs = require('fs');
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the 'public' directory
// Configure the Express application to use Handlebars as the template engine
app.engine(
  '.hbs',
  exphbs.engine({
    extname: '.hbs',
    helpers: {
      //  helper method to check if average review is empty or not.
      is_avg_reviewEmpty: function (avg_reviews) {
        return avg_reviews !== null &&
          avg_reviews !== undefined &&
          avg_reviews !== ''
          ? avg_reviews
          : 'N/A';
      },
    },
  })
);

app.set('view engine', 'hbs');
// Define a ("/") route for the home page that renders the "index" view
app.get('/', function (req, res) {
  res.render('index', { title: 'Express - Assignment 2' });
});

app.get('/users', function (req, res) {
  res.send('respond with a resource');
});

// Route -> '/data' from Assignment 1
app.get('/data', (req, res) => {
  const filePath = path.join(__dirname, 'datasetA.json'); // Path of datasetA.json in our project folder
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.send('Error reading JSON file');
    } else {
      const parsedData = JSON.parse(data);
      // Render 'data' view and pass data object to it.
      res.render('data', {
        data: parsedData,
        message: 'JSON data is loaded and ready!',
      });
    }
  });
});
// Route -> '/data/isbn/:index' from Assignment 1
app.get('/data/isbn/:index', (req, res) => {
  const index = parseInt(req.params.index);
  // Read file asynchronously
  fs.readFile('datasetA.json', 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading JSON file');
    } else {
      // Parse the data
      const parsedData = JSON.parse(data);
      if (index >= 0 && index < parsedData.length) {
        const bookISBN = parsedData[index].ISBN_13;
        res.render('isbn_page', { isbn: bookISBN, index: index });
      } else {
        res.status(404).send('ISBN number is not found for the given index');
      }
    }
  });
});
// Route -> '/data/search/isbn/' from Assignment 1

//Handle both GET and POST requests for ISBN search
app.all('/data/search/isbn/', (req, res) => {
  if (req.method === 'GET') {
    //use GET method to display form
    res.render('isbn_form_search');
  } else if (req.method === 'POST') {
    //use POST method
    const searchISBN = req.body.isbn;
    console.log(searchISBN);
    const filePath = path.join(__dirname, 'datasetA.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error in searching ISBN in JSON file');
      } else {
        const jsonData = JSON.parse(data);
        const jsonResult = jsonData.find(
          (entry) => entry.ISBN_13 === searchISBN
        );

        if (jsonResult) {
          console.log(jsonResult);
          res.render('isbn_result_search', { jsonResult });
        } else {
          res
            .status(404)
            .send(
              '<h2>There is no isbn has been located for given ISBN number.</h2>'
            );
        }
      }
    });
  } else {
    // Handle other HTTP methods if needed
    res.status(405).send('Method Not Allowed');
  }
});

// GET requests for the title search form
app.get('/data/search/title/', (req, res) => {
  res.render('form_title_search');
});

// POST requests for title search
app.post('/data/search/title/', (req, res) => {
  const searchTitle = req.body.title.toLowerCase();
  const filePath = path.join(__dirname, 'datasetA.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error in searching title in JSON file');
    } else {
      const jsonData = JSON.parse(data);
      const jsonResult = jsonData.filter((entry) =>
        entry.title.toLowerCase().includes(searchTitle)
      );

      if (jsonResult.length > 0) {
        res.render('title_search', { searchTitle, jsonResult });
      } else {
        res
          .status(404)
          .send('<h2>No book located for the provided title.</h2>');
      }
    }
  });
});

app.all('/data/search/title/', (req, res) => {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
  }
});
// GET requests for get the allDate
app.get('/allData', (req, res) => {
  fs.readFile('datasetA.json', 'utf8', (err, data) => {
    if (!err) {
      const jsonResult = JSON.parse(data);
      res.render('allData', { data: jsonResult }); // Render 'allData' view and pass data object to it.
    } else {
      res.status(500).send('Error reading JSON file');
    }
  });
});

// Define a ("/error") route for the error page that renders the "error" view with custom message
app.get('*', function (req, res) {
  res.render('error', { title: 'Error', message: 'Wrong Route' });
});

// server listen on specific port number
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
