const locationModel = require("../models/locationModel");
const locationService = require("./locationService");

// Attendance Service - validation ka main logic
// Ye service check karti hai:
//   TIME: lecture ke time mein mark ho rahi hai?
//   LOCATION: user room ke radius mein hai?
//   FRESHNESS: location 5 minute se purani to nahi?
class AttendanceService {

    // Time check
    // Abhi ka server time period ke time ke andar hai ya nahi
    // period example: "08:30:00" se "09:15:00"
    checkTime(start_time, end_time) {
        const now = new Date();

        // Server ka current time "HH:MM:SS" format mein
        const current = now.toTimeString().split(" ")[0];

        // String compare kaam karta hai kyunki format same hai (HH:MM:SS)
        const within = current >= start_time && current <= end_time;

        return {
            time_verified: within,
            current_time: current
        };
    }

    // Location + freshness check
    // User room ke radius mein hai ya nahi
    async checkLocation(userId, roomLat, roomLng, radius) {
        // User ka latest GPS lao (live_locations se)
        const loc = await locationModel.getLatestLocation(userId);

        // Location aayi hi nahi (user ne app kholi hi nahi)
        if (!loc) {
            return {
                ok: false,
                reason: "Location not received - app is not open",
                lat: null,
                lng: null
            };
        }

        // Freshness check
        // 5 minute se purani location accept NAHI hoti
        const updated = new Date(loc.updated_at);
        const now = new Date();
        const minutesDiff = (now - updated) / (1000 * 60);

        if (minutesDiff > 5) {
            return {
                ok: false,
                reason: "Location is stale (older than 5 minutes)",
                lat: loc.latitude,
                lng: loc.longitude
            };
        }

        // Haversine: user GPS vs room GPS ka distance (meters)
        const distance = locationService.calculateDistance(
            loc.latitude,
            loc.longitude,
            roomLat,
            roomLng
        );

        // Radius ke andar hai ya nahi
        const ok = locationService.isWithinRadius(distance, radius);

        return {
            ok,
            distance: Math.round(distance),
            lat: loc.latitude,
            lng: loc.longitude,
            reason: ok ? "Within radius" : "Outside the room radius"
        };
    }
}

module.exports = new AttendanceService();