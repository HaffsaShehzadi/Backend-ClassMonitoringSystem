
class LocationService {
    validateCoordinates(latitude, longitude) {
    
        if (latitude === undefined || longitude === undefined) {
            return {
                success: false,
                message: "Latitude and Longitude are required"
            };
        }
        if (latitude < -90 || latitude > 90) {
            return {
                success: false,
                message: "Invalid Latitude"
            };
        }
        if (longitude < -180 || longitude > 180) {
            return {
                success: false,
                message: "Invalid Longitude"
            };
        }
    
        return { success: true };
    }
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371000;

        const toRad = (value) => (value * Math.PI) / 180;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
       
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
       
        return R * c;
    }
    isWithinRadius(distanceMeters, radiusMeters) {
        return distanceMeters <= radiusMeters;
    }
}
module.exports = new LocationService();