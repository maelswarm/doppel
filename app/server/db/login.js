const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";

module.exports = (email, password) => {
    return new Promise((resolve) => {
        MongoClient.connect(url, { useUnifiedTopology: true }, (err, db) => {
            if (err) throw err;
            const dbo = db.db("db");
            let query = { email };
            dbo.collection("users").find(query).toArray((err, result) => {
                if (err) throw err;
                console.log(result);
                const encryptedPassword = result[0]?.password;
                if(!encryptedPassword) {
                  return resolve(false);
                }
                const isValid = bcrypt.compareSync(password, encryptedPassword);
                if(isValid) {
                  const token = jwt.sign({}, 'mysecret', { algorithm: 'HS512' });
                  resolve(token);
                } else {
                  resolve(false);
                }
            });
        });
    });
}