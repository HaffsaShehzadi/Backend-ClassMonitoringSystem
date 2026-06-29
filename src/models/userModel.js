const db = require("../../Database");

class UserModel {

    createUser(userData, callback) {

        const sql = `
            INSERT INTO users
            (
                full_name,
                email,
                password,
                role,
                department
            )
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                userData.full_name,
                userData.email,
                userData.password,
                userData.role,
                userData.department
            ],
            callback
        );

    }

    findUserByEmail(email, callback) {

        const sql = `
            SELECT *
            FROM users
            WHERE email = ?
        `;

        db.query(
            sql,
            [email],
            callback
        );

    }

}

module.exports = new UserModel();