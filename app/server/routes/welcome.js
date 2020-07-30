const dirpath = 'app/dist/views/welcome';

module.exports = (app) => {
    app.get("/", (req, res) => {
        res.pushFile("/welcome.css", dirpath + "/welcome.css", {
            ":status": 200,
            "content-type": "text/css; charset=utf-8"
        });
        res.pushFile("/welcome.js", dirpath + "/welcome.js", {
            ":status": 200,
            "content-type": "application/javascript; charset=utf-8"
        });
        res.sendFile(dirpath + '/welcome.html', {
            ":status": 200,
            "content-type": "text/html; charset=utf-8",
            "set-cookie": "TOKEN=deleted; expires=Thu, 01 Jan 1970 00:00:00 GMT"
        });
    });
}