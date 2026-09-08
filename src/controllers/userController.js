const userModel = require("../models/userModel");

class UserController {
    // GET /api/users/all - Admin ke liye
    async getAllUsers(req, res) {
        try {
            const users = await userModel.getAllUsers();
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // DELETE /api/users/:id - Admin ke liye
    async deleteUser(req, res) {
        try {
            await userModel.deleteUser(req.params.id);
            res.json({ message: "User removed successfully" });
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }
}

module.exports = new UserController();