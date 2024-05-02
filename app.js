const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const errorHandler = require('./utils/errorHandler');
const cookieParser = require('cookie-parser')

dotenv.config();

// route api
const userRouter = require('./routes/user.route');

const app = express();

//common middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const port = process.env.PORT || 5000;

//static folder
app.use('/api/uploads', express.static('./uploads'));

// Database connection
mongoose
    .connect(process.env.MONGODB_URL)
    .then(() => console.log('database connection successfully'))
    .catch((err) => console.log(err));

app.use('/api/user', userRouter);

// error handler
app.use(errorHandler);

// app listen
app.listen(port, () => {
    console.log(`listening to port on ${port}`);
});
