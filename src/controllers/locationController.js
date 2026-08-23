const locationModel = require("../models/locationModel");
const locationService = require("../services/locationService");

// ============================================
// Location Controller - GPS update + fetch
// ============================================
class LocationController {

    // POST /api/location/update
    // Teacher YA monitoring - dono ye hi endpoint use karte hain
    // App har 30 second mein GPS bhejti hai
    async updateLocation(req, res) {
        try {
            const { latitude, longitude } = req.body;

            // Coordinates valid hain ya nahi (service se check)
            const validation = locationService.validateCoordinates(latitude, longitude);
            if (!validation.success) {
                return res.status(400).json({ message: validation.message });
            }

            // ✅ User id TOKEN se aati hai (body se nahi)
            // Is tarah koi doosre user ki location fake nahi kar sakta
            const userId = req.user.user_id;

            // live_locations table mein latest GPS save karo
            await locationModel.updateLocation(userId, latitude, longitude);

            res.status(201).json({ message: "Location Updated" });
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // GET /api/location/latest/:userId
    // Kisi user ka latest GPS dekhna (testing + admin ke liye)
    async getLatestLocation(req, res) {
        try {
            const location = await locationModel.getLatestLocation(req.params.userId);

            // Agar user ne abhi tak location nahi bheji
            if (!location) {
                return res.status(404).json({ message: "Location not found" });
            }

            res.json(location);
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }
}

module.exports = new LocationController();