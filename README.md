<h1 align="center">doppel</h1>
<h3 align="center">
Leverage your website with Doppel.
  </h3>
<p align="center">
<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Painting_by_Sebastian_Bieniek._Titled_%E2%80%9EDoppelg%C3%A4nger_No._1%E2%80%9C%2C_2018._Oil_on_canvas._Berlin_based_artist._Painter.jpg/453px-Painting_by_Sebastian_Bieniek._Titled_%E2%80%9EDoppelg%C3%A4nger_No._1%E2%80%9C%2C_2018._Oil_on_canvas._Berlin_based_artist._Painter.jpg"></img></p>
<p align="center">
This example project uses Doppel.
Doppel is a Web Framework that simplifies HTTP2 implementation.
</p>

NOT PRODUTION READY

## Technologies Used

Doppel - Express.js like HTTP2 Web Framework

Gulp - <a href="https://gulpjs.com/">https://gulpjs.com/</a>

Sass - <a href="https://sass-lang.com/">https://sass-lang.com/</a>


# Install

```
npm i -g gulp
```

```
npm i
```

```
npm run generate:ssl
```
Default paths for key and crt are ``` app/keys/ ```

```
npm run start
```

# Doppel Usage

If you are comfortable with Express, then Doppel will come naturally.

```
function Doppel

host:       string  - default "127.0.0.1";
port:       number  - default 443 (http2 port);
http:       boolean - default true (use http port 20)
http2:      boolean - default true (use http2)
key:        string (path)
cert:       string (path)
ca:         string (path)
allowHTTP1: boolean - default true;
```

```
Doppel.prototype.start(host: string, port: number)
```

```
Doppel.prototype.get(path:string, ..., cb: Function)
Doppel.prototype.post(path:string, ..., cb: Function)
Doppel.prototype.put(path:string, ..., cb: Function)
Doppel.prototype.delete(path:string, ..., cb: Function)

All HTTP2_METHODS may be used.
```
