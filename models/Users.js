const db = require("../utils/dataBaseUtils");
const rootDir = require("../utils/pathUtils");

module.exports = class Users {
    constructor(first_name, last_name, email, password) {
        this.first_name = first_name;
        this.last_name = last_name;
        this.email = email;
        this.password = password;
    }

    save() {
        // console.log(this);
        return db.execute(
            "INSERT INTO users (user_id,first_name,last_name, email, password) VALUES (?, ?, ?, ?, ?)",
            [null,this.first_name,this.last_name, this.email, this.password]
        );
    }

    static findUserById(id) {
        return db.execute(`SELECT * FROM users WHERE user_id = ?`, [id]);
    }
}