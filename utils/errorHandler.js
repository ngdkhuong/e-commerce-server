const errorHandler = (err, req, res, next) => {
    console.log(err);
    if (res.headersSent) {
        next(err);
    } else {
        if (err.message) {
            res.status(500).json(err);
        } else {
            res.status(500).json(err);
        }
    }
};

module.exports = errorHandler;
