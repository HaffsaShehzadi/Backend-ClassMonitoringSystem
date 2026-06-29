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