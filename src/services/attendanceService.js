const locationModel = require("../models/locationModel");
const locationService = require("./locationService");

class AttendanceService {

    checkTime(start_time, end_time) {
        const now = new Date();
    
        const pktTime = now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Karachi' });
        
        return {
            time_verified: true,
            current_time: pktTime
        };
    }
    async checkLocation(userId, roomLat, roomLng, radius) {
        const loc = await locationModel.getLatestLocation(userId);

        if (!loc) {
            return {
                ok: false,
                reason: "Location not received - app is not open",
                lat: null,
                lng: null
            };
        }

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

        const distance = locationService.calculateDistance(
            loc.latitude,
            loc.longitude,
            roomLat,
            roomLng
        );
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