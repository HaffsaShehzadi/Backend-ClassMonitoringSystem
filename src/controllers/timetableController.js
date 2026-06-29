const timetableModel =
require("../models/timetableModel");

exports.createTimetable = (req, res) => {

    const {
        lecture_date,
        day_name,
        lecture_no,
        start_time,
        end_time,
        room_id,
        teacher_id,
        department_id,
        semester_no,
        subject_name
    } = req.body;

    timetableModel.createTimetable(
        {
            lecture_date,
            day_name,
            lecture_no,
            start_time,
            end_time,
            room_id,
            teacher_id,
            department_id,
            semester_no,
            subject_name
        },
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.status(201).json({
                message:
                "Timetable Created Successfully"
            });
        }
    );
};

exports.updateTimetable = (req, res) => {

    const id = req.params.id;

    timetableModel.updateTimetable(
        id,
        req.body,
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json({
                message: "Timetable Updated Successfully"
            });
        }
    );
};

exports.deleteTimetable = (req, res) => {

    const id = req.params.id;

    timetableModel.deleteTimetable(
        id,
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json({
                message: "Timetable Deleted Successfully"
            });
        }
    );
};

exports.getAllTimetables = (req, res) => {

    timetableModel.getAllTimetables(
        (err, rows) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.status(200).json(rows);
        }
    );
};