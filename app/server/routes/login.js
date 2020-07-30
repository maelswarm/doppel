const db = require('../db/index.js');

module.exports = (app) => {
    app.post('/login', async (req, res) => {
        const token = await db.login(req.body.email, req.body.password);

        res.send(JSON.stringify({msg: token ? 'Success' : 'Failure' }), {
            ":status": 200,
            "content-type": "application/javascript; charset=utf-8",
            "set-cookie": "TOKEN=" + token
        });
    });
}