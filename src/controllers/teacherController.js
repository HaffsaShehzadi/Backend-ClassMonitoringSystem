const teacherModel =
require("../models/teacherModel");

class TeacherController {

    getDepartments(req, res) {

        teacherModel.getDepartments(

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
new TeacherController();