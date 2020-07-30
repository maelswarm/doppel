const http = require("http");
const http2 = require("http2");
const fs = require("fs");
const path = require('path');
const HTTP2_KEYS = Object.keys(http2.constants);
const HTTP2_VALUES = Object.values(http2.constants);
const {
    HTTP2_HEADER_METHOD,
    HTTP2_HEADER_PATH,
    HTTP2_HEADER_AUTHORITY,
    HTTP2_HEADER_SCHEME,
    HTTP2_HEADER_CONTENT_LENGTH,
    NGHTTP2_REFUSED_STREAM,
    NGHTTP2_CANCEL
} = http2.constants;
let decodeURI = true;
let autoPush = true;
const defaultHeaders = {
    ":status": 200,
    "content-type": "*/*; charset=utf-8"
};
const setExpiration = (headers) => {
    let expireDate = new Date();
    expireDate.setHours(expireDate.getHours() + 1);
    headers['expires'] = expireDate;
    headers['last-modified'] = new Date();
    return headers;
}

function Request(headers, data, path) {
    this.headers = headers || '';
    this.body = data === "" ? undefined : data;
    if (this.body !== undefined && this.headers['content-type'] !== undefined && this.headers['content-type'].indexOf('application/json') > -1) {
        try {
            this.body = JSON.parse(this.body);
        } catch {
            this.body = "";
        }
    }
    this.query = path.searchParams;
    this.path = decodeURI ? decodeURIComponent(path.pathname) : path.pathname;
    if (path.pathname.length > 1) {
        this.segments = path.pathname.split("/");
        this.segments.shift();
    }
}
function Response(stream) {
    if (stream.respondWithFile === undefined) { // HTTP/1
        this.send = (data, headers) => {
            if (headers !== undefined) {
                let keys = Object.keys(headers);
                for (let i = 0; i < keys.length; ++i) {
                    if (keys[i].indexOf(':') === 0) {
                        headers[keys[i].substring(1)] = headers[keys[i]];
                        delete headers[keys[i]];
                    }
                }
            }
            stream.writeHead(200, headers);
            stream.end(data);
        }
        this.sendFile = (filepath, headers) => {
            if (headers !== undefined) {
                let keys = Object.keys(headers);
                for (let i = 0; i < keys.length; ++i) {
                    if (keys[i].indexOf(':') === 0) {
                        headers[keys[i].substring(1)] = headers[keys[i]];
                        delete headers[keys[i]];
                    }
                }
            }
            fs.readFile(filepath, (err, buff) => {
                if (err) {
                    stream.writeHead(404);
                    stream.end();
                    return;
                }
                stream.writeHead(200, headers);
                stream.end(buff);
            });
        }
        this.pushFile = () => {
        }
    } else { // HTTP/2
        this.send = (data, headers) => {
            headers = headers ? headers : defaultHeaders;
            headers = setExpiration(headers);
            stream.respond(headers);
            stream.end(data);
        };
        this.sendFile = (filepath, headers) => {
            headers = headers ? headers : defaultHeaders;
            headers = setExpiration(headers);
            if (autoPush && headers['content-type'].indexOf('html') > -1) {
                console.log(filepath);
                fs.readFile(filepath, (err, res) => {
                    let arr = res.toString();
                    arr = arr.match(/(href\=\"[A-Za-z0-9\_\\/.\-]*)|(src\=\"[A-Za-z0-9\_\\/.\-]*)/g);
                    console.log(arr);
                    arr = arr.map((val) => {
                        return path.parse(val.substring(val.indexOf('"') + 1));
                    });
                    arr.forEach((x) => {
                        this.pushFile(x.dir + '/' + x.base, __dirname + x.dir + '/' + x.base, defaultHeaders)
                    });
                    stream.respondWithFile(filepath, headers);
                });
            } else {
                stream.respondWithFile(filepath, headers); 
            }
        };
        this.pushFile = (route, filepath, headers) => {
            stream.pushStream({ ":path": route }, (err, pushStream) => {
                pushStream.on("error", err => {
                    const isRefusedStream =
                        err.code === "ERR_HTTP2_STREAM_ERROR" &&
                        pushStream.rstCode === NGHTTP2_REFUSED_STREAM;
                    if (!isRefusedStream) throw err;
                });
                headers = headers !== undefined ? headers : defaultHeaders;
                headers = setExpiration(headers);
                pushStream.respondWithFile(filepath, headers);
            });
        };
    }
}
let storeRoutes = args => {
    let path = "";
    let callbacks = [];
    for (let i = 0; i < args.length; ++i) {
        if (i === 0) {
            path = args[i];
        } else {
            if (typeof args[i] === "Array") {
                callbacks.concat(args[i]);
            } else {
                callbacks.push(args[i]);
            }
        }
    }
    return { path, callbacks };
};
function Doppel(options) {
    this.routes = {};
    this.host = options.host || "127.0.0.1";
    this.port = options.port || 443;
    this.http = options.http !== undefined ? options.http : true;
    this.http2 = options.http2 !== undefined ? options.http2 : true;
    this.key = options.key ? fs.readFileSync(options.key, "utf8") : undefined;
    this.cert = options.cert ? fs.readFileSync(options.cert, "utf8") : undefined;
    this.ca = options.ca ? fs.readFileSync(options.ca, "utf8") : undefined;
    this.allowHTTP1 = options.allowHTTP1 || true;
    autoPush = options.autoPush || false;
    decodeURI = options.decodeURI || true;
}

HTTP2_KEYS.forEach((key, idx) => {
    if (key.indexOf("HTTP2_METHOD") === 0) {
        Doppel.prototype[HTTP2_VALUES[idx].toLowerCase()] = function () {
            if (this.routes[HTTP2_VALUES[idx]] === undefined) {
                this.routes[HTTP2_VALUES[idx]] = {};
            }
            let { path, callbacks } = storeRoutes(arguments);
            this.routes[HTTP2_VALUES[idx]][path] = { callbacks };
        };
    }
});

let execRoute = (route, i, req, res) => {
    if (i < route.callbacks.length - 1) {
        route.callbacks[i](req, res, (rreq, rres) => {
            execRoute(route, i + 1, rreq, rres);
        });
    } else if (i === route.callbacks.length - 1) {
        route.callbacks[i](req, res);
    }
};
let determineRoute = (routes, headers, data, path, stream) => {
    const list = routes[headers[HTTP2_HEADER_METHOD]];
    const keys = Object.keys(list);
    let route = undefined;
    for (let i = keys.length - 1; i >= 0; --i) {
        let val = keys[i];
        route = list[val];
        let matchRegExp = new RegExp("^" + val + "$", "g");
        if (matchRegExp.test(path.pathname)) {
            break;
        }
        route = undefined;
    }
    if (route === undefined) {
        stream.respond({ ":status": 404 });
        stream.end();
    } else {
        const req = new Request(headers, data, path);
        const res = new Response(stream);
        execRoute(route, 0, req, res);
    }
};
let determineRouteHTTP1 = (routes, req, data, path, res) => {
    const list = routes[req.method];
    const keys = Object.keys(list);
    let route = undefined;
    for (let i = keys.length - 1; i >= 0; --i) {
        let val = keys[i];
        route = list[val];
        let matchRegExp = new RegExp("^" + val + "$", "g");
        if (matchRegExp.test(path.pathname)) {
            break;
        }
        route = undefined;
    }
    if (route === undefined) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end();
    } else {
        const request = new Request(req.headers, data, path);
        const response = new Response(res);
        execRoute(route, 0, request, response);
    }
};
Doppel.prototype.start = function (host, port) {
    let routes = this.routes;
    host = host || this.host;
    port = port || this.port;
    if (this.http2) {
        const server = http2.createSecureServer({ key: this.key, cert: this.cert, allowHTTP1: true }, (req, res) => {
            req.setEncoding('utf8');
            let headers = req.headers;
            let stream = req.stream;
            let path;
            let data = "";
            if (req.httpVersion !== '2.0') {
                path = new URL("https://" + req.headers.host + req.url);
                req.on("data", chunk => {
                    data += chunk;
                });
                req.on("end", () => {
                    determineRouteHTTP1(routes, req, data, path, res);
                });
            } else {
                path = new URL(
                    headers[HTTP2_HEADER_SCHEME] +
                    "://" +
                    headers[HTTP2_HEADER_AUTHORITY] +
                    headers[HTTP2_HEADER_PATH]
                );
                stream.on('readable', () => {
                    let chunk;
                    if (headers[HTTP2_HEADER_METHOD] !== 'GET' && !parseInt(headers[HTTP2_HEADER_CONTENT_LENGTH])) {
                        determineRoute(routes, headers, data, path, stream);
                        return;
                    }
                    while (null !== (chunk = stream.read())) {
                        data += chunk;
                        if (data.length >= parseInt(headers[HTTP2_HEADER_CONTENT_LENGTH])) {
                            if (headers[HTTP2_HEADER_METHOD] !== 'GET') {
                                determineRoute(routes, headers, data, path, stream);
                            }
                        }
                    }
                });
                stream.on('end', () => {
                    if (headers[HTTP2_HEADER_METHOD] === 'GET') {
                        determineRoute(routes, headers, data, path, stream);
                    }
                })
                stream.on("error", err => {
                    console.log(err);
                });
            }
        }).listen(port, host);
    }
    if (this.http) {
        http
            .createServer(function (req, res) {
                if (req.url.indexOf('/.well-known/acme-challenge/') > -1) {
                    let file;
                    try {
                        file = fs.readFileSync('.' + req.url, 'utf8');
                    } catch {
                        res.end();
                        return;
                    }
                    res.setHeader('Content-type', 'text/plain');
                    res.end(file);
                } else {
                    res.writeHead(301, { Location: "https://" + req.headers.host + req.url });
                    res.end();
                }
            })
            .listen(80, host);
    }
};
module.exports = Doppel;