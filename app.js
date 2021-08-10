'use strict';

const express = require('express');

const app = express();

/* Static files */
app.use(express.static('public'))

/* Routes */
app.get('/', (request, response) => {
  response.sendFile('html/index.html', { root: __dirname });
});

/* Start the server */
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

module.exports = app;
