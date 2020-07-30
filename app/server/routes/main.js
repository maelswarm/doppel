const authenticated = require('../middleware/authenticated.js');
const dirpath = 'app/dist/views/main';

module.exports = (app) => {
    app.get("/app", authenticated, (req, res) => {
        res.pushFile("/main.css", dirpath + "/main.css", {
            ":status": 200,
            "content-type": "text/css; charset=utf-8"
        });
        res.pushFile("/main.js", dirpath + "/main.js", {
            ":status": 200,
            "content-type": "application/javascript; charset=utf-8"
        });
        res.sendFile(dirpath + '/main.html', {
            ":status": 200,
            "content-type": "text/html; charset=utf-8"
        });
    });
}