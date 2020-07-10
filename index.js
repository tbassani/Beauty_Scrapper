/* eslint-disable linebreak-style */
const express = require('express');

const app = express();
const cors = require('cors');
const routes = require('./routes');

const corsOptions = {
  origin: 'http://localhost:5000',
  credentials: true,
  exposedHeaders: ['X-Total-Count'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(routes);

app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

// catch all
app.use((error, req, res) => {
  res.status(error.status || 500);
  res.json({ error: error.message });
});

app.listen(5000, () => {
  console.log('Server started on port 5000');
});
