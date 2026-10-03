const locationModel = require("../models/locationModel");
const locationService = require("../services/locationService");

class LocationController {

    async updateLocation(req, res) {
        try {
            const { latitude, longitude } = req.body;

            const validation = locationService.validateCoordinates(latitude, longitude);
            if (!validation.success) {
                return res.status(400).json({ message: validation.message });
            }

            const userId = req.user.user_id;

            await locationModel.updateLocation(userId, latitude, longitude);

            res.status(201).json({ message: "Location Updated" });
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    async getLatestLocation(req, res) {
        try {
            const location = await locationModel.getLatestLocation(req.params.userId);

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