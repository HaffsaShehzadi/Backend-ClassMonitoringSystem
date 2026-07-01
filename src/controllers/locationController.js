const locationModel =
require("../models/locationModel");

class LocationController {

    updateTeacherLocation(
        req,
        res
    ) {

        const {
            teacher_id,
            latitude,
            longitude
        } = req.body;

        locationModel.updateTeacherLocation(
            {
                teacher_id,
                latitude,
                longitude
            },
            (err, result) => {

                if (err) {
                    return res.status(500)
                    .json(err);
                }

                res.status(201).json({
                    message:
                    "Teacher Location Updated"
                });
            }
        );
    }

    updateMonitorLocation(
        req,
        res
    ) {

        const {
            monitor_id,
            latitude,
            longitude
        } = req.body;

        locationModel.updateMonitorLocation(
            {
                monitor_id,
                latitude,
                longitude
            },
            (err, result) => {

                if (err) {
                    return res.status(500)
                    .json(err);
                }

                res.status(201).json({
                    message:
                    "Monitor Location Updated"
                });
            }
        );
    }
}

module.exports =
new LocationController();