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

}

module.exports =
new ReportController();