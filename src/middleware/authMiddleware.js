const jwt = require("jsonwebtoken");

// authMiddleware - JWT token verify karta hai
// Ye sirf protected routes pe lagta hai
// (jaise /profile - jahan login hona zaroori hai)
const verifyToken = (req, res, next) => {

    // 1️⃣ Header se token lo
    // Frontend bhejta hai: "Bearer <token>"
    const authHeader = req.headers.authorization;

    // 2️⃣ Agar token hai hi nahi to access mat do
    if (!authHeader) {
        return res.status(401).json({
            message: "Access Denied. No Token Provided"
        });
    }

    // 3️⃣ "Bearer xyz" ko space se todo → [1] wala hissa asli token hai
    // Example: "Bearer abc123" → token = "abc123"
    const token = authHeader.split(" ")[1];

    try {

        // 4️⃣ Token verify karo
        // Agar token nakli ya chhedha hua ho to yahan error aayega
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // 5️⃣ Token ke andar jo user info thi (user_id, role)
        // usko req.user pe laga do taa ke agla controller use kar sake
        req.user = decoded;

        // 6️⃣ Sab theek hai → ab aage controller ko jane do
        next();

    } catch (error) {

        // Token galat/expired hone par yahan aayega
        console.log(error);

        return res.status(401).json({
            message: "Invalid Token"
        });
    }
};

module.exports = verifyToken;