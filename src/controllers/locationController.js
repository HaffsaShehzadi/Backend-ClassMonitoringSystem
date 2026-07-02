const locationModel = require("../models/locationModel");
const locationService = require("../services/LocationService");

class LocationController {

    updateTeacherLocation(req, res) {

        const {
            teacher_id,
            latitude,
            longitude
        } = req.body;

        const validation =
            locationService.validateCoordinates(
                latitude,
                longitude
            );

        if (!validation.success) {
            return res.status(400).json({
                message: validation.message
            });
        }

        locationModel.updateTeacherLocation(
            {
                teacher_id,
                latitude,
                longitude
            },
            (err, result) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.status(201).json({
                    message: "Teacher Location Updated"
                });

            }
        );
    }

    updateMonitorLocation(req, res) {

        const {
            monitor_id,
            latitude,
            longitude
        } = req.body;

        const validation =
            locationService.validateCoordinates(
                latitude,
                longitude
            );

        if (!validation.success) {
            return res.status(400).json({
                message: validation.message
            });
        }

        locationModel.updateMonitorLocation(
            {
                monitor_id,
                latitude,
                longitude
            },
            (err, result) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.status(201).json({
                    message: "Monitor Location Updated"
                });

            }
        );
    }
}

module.exports = new LocationController();