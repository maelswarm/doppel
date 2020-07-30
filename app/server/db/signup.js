const bcrypt = require('bcrypt');
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";

module.exports = (email, password) => {
    return new Promise((resolve) => {
        MongoClient.connect(url, { useUnifiedTopology: true }, (err, db) => {
            if (err) throw err;
            const dbo = db.db("db");
            password = bcrypt.hashSync(password, 10);
            let query = { email, password };
            dbo.collection("users").find(query).toArray((err, result) => {
                if (err) throw err;
                console.log(result)
                if (!result.length) {
                    dbo.collection("users").insertMany([query], (err, result) => {
                        if (err) throw err;
                        console.log(result);
                        db.close();
                        resolve(true);
                    });
                } else {
                    db.close();
                    resolve(false)
                }
            });
        });
    });
}