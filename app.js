'use strict';

const express = require('express');
const request = require('request');

const app = express();

/* Static files */
app.use(express.static('dist'))

/* Routes */

// Index page
app.get('/', (req, resp) => {
  resp.sendFile('html/index.html', { root: __dirname });
});

// Messages list from textdoc
const txtFile = 'https://textdoc.co/home/download/7OtmYQ136BXSVjgN'; // file URL
app.get('/messages', (req, resp) => {
  request(txtFile, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      resp.send(body);
    }
  })
});


/* Start the server */
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

module.exports = app;
