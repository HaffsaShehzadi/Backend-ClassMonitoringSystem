const reportModel =
require("../models/reportModel");

class ReportController {

    getDailyAttendance(req, res) {

        reportModel.getDailyAttendance(

            (err, rows) => {

                if (err) {

                    return res.status(500)
                    .json(err);

                }

                res.status(200)
                .json(rows);

            }

        );

    }
    getWeeklyAttendance(req, res) {

    reportModel.getWeeklyAttendance(

        (err, rows) => {

            if (err) {

                return res.status(500)
                .json(err);

            }

            res.status(200)
            .json(rows);

        }

    );

}
getMonthlyAttendance(req,res){

    reportModel.getMonthlyAttendance(

        (err,rows)=>{

            if(err){

                return res.status(500).json(err);

            }

            res.status(200).json(rows);

        }

    );

}
getDepartmentAttendance(req, res) {

    const department_id =
    req.params.department_id;

    reportModel.getDepartmentAttendance(

        department_id,

        (err, rows) => {

            if (err) {

                return res.status(500)
                .json(err);

            }

            res.status(200)
            .json(rows);

        }

    );

}
getTeacherAttendance(req, res) {

    const teacher_id =
    req.params.teacher_id;

    reportModel.getTeacherAttendance(

        teacher_id,

        (err, rows) => {

            if (err) {

                return res.status(500)
                .json(err);

            }

            res.status(200)
            .json(rows);

        }

    );

}

}

module.exports =
new ReportController();