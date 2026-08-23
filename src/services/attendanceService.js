const locationModel = require("../models/locationModel");
const locationService = require("./locationService");

// ============================================
// Attendance Service - VALIDATION KA MAIN LOGIC ⭐
// Ye service check karti hai:
//   1. TIME: lecture ke time mein mark ho rahi hai?
//   2. LOCATION: user room ke radius mein hai?
//   3. FRESHNESS: location 5 minute se purani to nahi?
// ============================================
class AttendanceService {

    // ---------- TIME CHECK ----------
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

    // ---------- LOCATION + FRESHNESS CHECK ----------
    // User room ke radius mein hai ya nahi
    async checkLocation(userId, roomLat, roomLng, radius) {
        // User ka latest GPS lao (live_locations se)
        const loc = await locationModel.getLatestLocation(userId);

        // Location aayi hi nahi (user ne app kholi hi nahi)
        if (!loc) {
            return {
                ok: false,
                reason: "Location not received - app open nahi hai",
                lat: null,
                lng: null
            };
        }

        // FRESHNESS CHECK ⭐ (examiner ko ye zaroor batana)
        // 5 minute se purani location accept NAHI hoti
        const updated = new Date(loc.updated_at);
        const now = new Date();
        const minutesDiff = (now - updated) / (1000 * 60);

        if (minutesDiff > 5) {
            return {
                ok: false,
                reason: "Location purani hai (5 min se zyada)",
                lat: loc.latitude,
                lng: loc.longitude
            };
        }

        // HAVERSINE: user GPS vs room GPS ka distance (meters)
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
            distance: Math.round(distance),   // meters mein (rounded)
            lat: loc.latitude,
            lng: loc.longitude,
            reason: ok ? "Within radius" : "Room ke radius se bahar hai"
        };
    }
}

module.exports = new AttendanceService();