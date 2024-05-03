const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
const dbConnect = require('./config/dbConnect');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

// route api
const authRouter = require('./routes/auth.route.js');

const app = express();

dbConnect();

app.use(morgan('dev'));

// config
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser);

// route
app.use('/api/user', authRouter);

const port = process.env.PORT || 5000;

// error handler
app.use(notFound);
app.use(errorHandler);

// app listen
app.listen(port, () => {
    console.log(`listening to port on ${port}`);
});
