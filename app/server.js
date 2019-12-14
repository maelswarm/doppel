const cluster = require('cluster');
const numCPUs = require("os").cpus().length;
const Doppel = require('./doppel.js');
const app = new Doppel({ "http2": true, "http": true, key: __dirname + '/keys/priv.key', cert: __dirname + '/keys/cert.crt' });

app.get("/.*", (req, res) => {
    res.pushFile("/main.css", __dirname + "/dist/main.css", {
        ":status": 200,
        "content-type": "text/css; charset=utf-8"
    });
    res.pushFile("/main.js", __dirname + "/dist/main.js", {
        ":status": 200,
        "content-type": "application/javascript; charset=utf-8"
    });
    res.sendFile(__dirname + '/dist/main.html', {
        ":status": 200,
        "content-type": "text/html; charset=utf-8"
    });
});

app.get("/.*\\.html", (req, res) => {
    res.sendFile(__dirname + req.path, {
        ":status": 200,
        "content-type": "text/html; charset=utf-8"
    });
});

app.get("/.*\\.js", (req, res) => {
    res.sendFile(__dirname + req.path, {
        ":status": 200,
        "content-type": "application/javascript; charset=utf-8"
    });
});

app.get("/.*\\.css", (req, res) => {
    res.sendFile(__dirname + req.path, {
        ":status": 200,
        "content-type": "text/css; charset=utf-8"
    });
});

app.get("/.*\\.css.map", (req, res) => {
    res.sendFile(__dirname + req.path, {
        ":status": 200,
        "content-type": "text/css; charset=utf-8"
    });
});

if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    cluster.on("exit", (worker, code, signal) => {
        let newWorker = cluster.fork();
        console.log(`worker ${worker.process.pid} died`);
        console.log(`worker ${newWorker.process.pid} born`);
    });
} else {
    app.start("0.0.0.0", "443");
}