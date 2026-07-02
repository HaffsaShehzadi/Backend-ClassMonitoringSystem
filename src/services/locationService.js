class LocationService {

    validateCoordinates(
        latitude,
        longitude
    ) {

        if (
            latitude === undefined ||
            longitude === undefined
        ) {
            return {
                success: false,
                message: "Latitude and Longitude are required"
            };
        }

        if (
            latitude < -90 ||
            latitude > 90
        ) {
            return {
                success: false,
                message: "Invalid Latitude"
            };
        }

        if (
            longitude < -180 ||
            longitude > 180
        ) {
            return {
                success: false,
                message: "Invalid Longitude"
            };
        }

        return {
            success: true
        };
    }

}

module.exports = new LocationService();