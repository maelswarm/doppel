const cluster = require('cluster');
const numCPUs = require("os").cpus().length;
const Doppel = require('./doppel.js');
const app = new Doppel({ "http2": true, "http": true, key: __dirname + '/keys/priv.key', cert: __dirname + '/keys/cert.crt' });

// const autoPush = () => {
//     const fs = require('fs');
//     const path = require('path');
//     fs.readFile(__dirname + '/dist/main.html', (err, res) => {
//         //console.log(res.toString());
//         let arr = res.toString();
//         arr = arr.match(/(href\=\"[A-Za-z0-9\_\\/.\-]*\")|(src\=\"[A-Za-z0-9\_\\/.\-]*\")/g);
//         console.log(arr);
//         arr = arr.map((val) => {
//             return path.parse(val.substring(val.indexOf('"') + 1), val.lastIndexOf('"') - 1);
//         });

//     });
// }

// autoPush();

app.get("/.*", (req, res) => {
    // res.pushFile("/dist/main.css", __dirname + "/dist/main.css", {
    //     ":status": 200,
    //     "content-type": "text/css; charset=utf-8"
    // });
    // res.pushFile("/dist/main.js", __dirname + "/dist/main.js", {
    //     ":status": 200,
    //     "content-type": "application/javascript; charset=utf-8"
    // });
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