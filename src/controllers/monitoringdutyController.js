const monitoringDutyModel =
require("../models/monitoringDutyModel");

exports.assignDuty = (req, res) => {

    const {
        monitor_id,
        department_id
    } = req.body;

    monitoringDutyModel.assignDuty(
        {
            monitor_id,
            department_id,
            assigned_by: req.user.user_id
        },
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.status(201).json({
                message:
                "Department Assigned Successfully"
            });
        }
    );
};

exports.getAllDuties = (req, res) => {

    monitoringDutyModel.getAllDuties(
        (err, rows) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.status(200).json(rows);
        }
    );
};