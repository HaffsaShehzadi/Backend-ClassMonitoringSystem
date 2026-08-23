// ============================================
// Location Service - GPS ke calculations yahan hote hain
// (Service = business logic ki jagah)
// ============================================
class LocationService {

    // Coordinates valid hain ya nahi check karna
    validateCoordinates(latitude, longitude) {

        // Dono values honi chahiye
        if (latitude === undefined || longitude === undefined) {
            return {
                success: false,
                message: "Latitude and Longitude are required"
            };
        }

        // Latitude ki range: -90 se +90 hoti hai
        if (latitude < -90 || latitude > 90) {
            return {
                success: false,
                message: "Invalid Latitude"
            };
        }

        // Longitude ki range: -180 se +180 hoti hai
        if (longitude < -180 || longitude > 180) {
            return {
                success: false,
                message: "Invalid Longitude"
            };
        }

        // Sab theek hai
        return { success: true };
    }
    // HAVERSINE FORMULA ⭐ (FYP ka main logic)
    // Do GPS points ke darmiyan DISTANCE nikalta hai (meters mein)
    // Example: teacher ka GPS vs room ka GPS
    calculateDistance(lat1, lon1, lat2, lon2) {
        // Zameen ka radius meters mein
        const R = 6371000;

        // Degrees ko radians mein badalna
        const toRad = (value) => (value * Math.PI) / 180;

        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);

        // Haversine formula
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        // Distance meters mein return karo
        return R * c;
    }

    // Distance radius ke andar hai ya nahi
    // Example: teacher 30m door hai, radius 50m hai → true ✅
    isWithinRadius(distanceMeters, radiusMeters) {
        return distanceMeters <= radiusMeters;
    }
}

module.exports = new LocationService();