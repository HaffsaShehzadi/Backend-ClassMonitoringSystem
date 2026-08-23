// ============================================
// RoleMiddleware - role-based access control
// Sirf allowed roles ko route use karne deta hai
// Example: users approve karna sirf ADMIN kar sakta hai
// ============================================
class RoleMiddleware {

    // authorize() - allowed roles ki list leta hai
    // Usage: roleMiddleware.authorize("admin")
    //        roleMiddleware.authorize("admin", "teacher")
    authorize(...allowedRoles) {

        // Ye andar wala function asli middleware hai
        // jo har request pe chalta hai
        return (req, res, next) => {

            // 1️⃣ Pehle check: user login hai ya nahi
            // (req.user authMiddleware set karta hai)
            if (!req.user) {
                return res.status(401).json({
                    message: "Unauthorized"
                });
            }

            // 2️⃣ Check: user ka role allowed list mein hai ya nahi
            // Example: sirf "admin" allowed hai aur user "teacher" hai → reject
            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({
                    message: "Access Denied"
                });
            }

            // 3️⃣ Sab theek hai → aage controller ko jane do
            next();
        };
    }
}

// Ek hi instance sab jagah share hota hai (OOP)
module.exports = new RoleMiddleware();