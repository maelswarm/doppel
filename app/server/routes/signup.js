const db = require('../db/index.js');

module.exports = (app) => {
    app.post('/signup', async (req, res) => {
        const result = await db.signup(req.body.email, req.body.password);
        res.send(JSON.stringify({msg: result ? 'Success' : 'Failure'}), {
            ":status": 200,
            "content-type": "application/javascript; charset=utf-8"
        });
    });
}