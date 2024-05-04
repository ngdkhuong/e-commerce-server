const bodyParser = require('body-parser');
const express = require('express');
const dbConnect = require('./config/dbConnect');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const app = express();
const dotenv = require('dotenv').config();
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const cors = require('cors');

const authRouter = require('./routes/auth.route');
const productRouter = require('./routes/product.route');
// const blogRouter = require('./routes/blogRoute');
// const categoryRouter = require('./routes/prodcategoryRoute');
// const blogcategoryRouter = require('./routes/blogCatRoute');
// const brandRouter = require('./routes/brandRoute');
// const colorRouter = require('./routes/colorRoute');
// const enqRouter = require('./routes/enqRoute');
// const couponRouter = require('./routes/couponRoute');
// const uploadRouter = require('./routes/uploadRoute');

dbConnect();
app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// route
app.use('/api/user', authRouter);
app.use('/api/product', productRouter);

const port = process.env.PORT || 5000;

// error handler
app.use(notFound);
app.use(errorHandler);

// app listen
app.listen(port, () => {
    console.log(`listening to port on ${port}`);
});
