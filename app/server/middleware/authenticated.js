const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    console.log(req);
    if (!req.headers.cookie) {
        res.send(null, {
            ":status": 403,
        });
        return;
    }
    const token = req.headers.cookie.substring(req.headers.cookie.indexOf('TOKEN=') + 6);
    if (!token) {
        res.send(null, {
            ":status": 403,
        });
        return;
    }
    jwt.verify(token, 'mysecret', { algorithm: 'HS512' }, function (err, decoded) {
        if (err) {
            res.send(null, {
                ":status": 403,
            });
            return;
        }
        next(req, res);
    });
}