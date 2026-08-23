const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

// Auth Controller - signup + login + profile
class AuthController {

    // POST /api/auth/signup - naya user register karna
    async signup(req, res) {
        try {
            const { name, email, password, role, department } = req.body;

            // Simple validation - sab fields zaroori hain
            if (!name || !email || !password || !role) {
                return res.status(400).json({ message: "All fields are required" });
            }

            // Check: email pehle se registered to nahi?
            const existing = await userModel.findUserByEmail(email);
            if (existing) {
                return res.status(400).json({ message: "Email already exists" });
            }

            // Password ko bcrypt se hash karo (10 rounds = security)
            const hashedPassword = await bcrypt.hash(password, 10);

            // Teacher ke liye department id lana (naya ho to ban jayega)
            let departmentId = null;
            if (department) {
                departmentId = await userModel.getOrCreateDepartment(department);
            }

            // User save karo (status default 'pending' hoga)
            await userModel.createUser({
                name,
                email,
                password: hashedPassword,
                role,
                departmentId
            });

            res.status(201).json({
                message: "User Registered Successfully - admin approval ka wait karein"
            });
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // POST /api/auth/login - email + password se login
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Email se user dhundo
            const user = await userModel.findUserByEmail(email);
            if (!user) {
                return res.status(400).json({ message: "Invalid Email" });
            }

            // Password match karo (bcrypt compare)
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Invalid Password" });
            }

            // ✅ Approval system check (naya database wala)
            if (user.status === "pending") {
                return res.status(200).json({
                    status: "pending",
                    message: "Admin approval ka wait karein"
                });
            }
            if (user.status === "rejected") {
                return res.status(403).json({
                    status: "rejected",
                    message: "Aapki request reject ho gayi hai"
                });
            }

            // ✅ NAYA: expiresIn hataya - token kabhi expire nahi hoga
            // User tab tak login rahega jab tak khud logout na kare
            const token = jwt.sign(
                { user_id: user.id, role: user.role },
                process.env.JWT_SECRET
            );

            res.status(200).json({
                status: "approved",
                message: "Login Successful",
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    department: user.department
                }
            });
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // GET /api/auth/profile - middleware ke baad chalta hai
    profile(req, res) {
        res.status(200).json({
            message: "Profile Loaded",
            user: req.user
        });
    }
}

module.exports = new AuthController();