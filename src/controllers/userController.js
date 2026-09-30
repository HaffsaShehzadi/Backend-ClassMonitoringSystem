const userModel = require("../models/userModel");

class UserController {
    async getAllUsers(req, res) {
        try {
            const users = await userModel.getAllUsers();
            res.status(200).json(users);
        } catch (error) {
            console.error("Get All Users Error:", error.message);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }
    async getPendingUsers(req, res) {
        try {
            const users = await userModel.getPendingUsers();
            res.status(200).json(users);
        } catch (error) {
            console.error("Get Pending Users Error:", error.message);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }
    async updateUserStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body; // 'approved' or 'rejected'

            if (!status) {
                return res.status(400).json({ message: "Status is required" });
            }

            await userModel.updateUserStatus(id, status);
            
            const message = status === 'approved' 
                ? "User approved successfully. They can now login." 
                : "User rejected successfully.";

            res.status(200).json({ message });
        } catch (error) {
            console.error("Update User Status Error:", error.message);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }
    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            await userModel.deleteUser(id);
            res.status(200).json({ message: "User and all related records removed successfully" });
        } catch (error) {
            console.error("Delete User Error:", error.message);
            // Agar user not found ka error aya
            if (error.message === "User not found") {
                return res.status(404).json({ message: "User not found" });
            }
            res.status(500).json({ message: "Server error while deleting user", error: error.message });
        }
    }
}
module.exports = new UserController();