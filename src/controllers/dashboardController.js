const dashboardModel =
require("../models/dashboardModel");

class DashboardController {

    getAdminDashboard(req, res) {

        dashboardModel.getAdminDashboard(

            (err, rows) => {

                if (err) {

                    return res.status(500)
                    .json(err);

                }

                res.status(200)
                .json(rows[0]);

            }

        );

    }

}

module.exports =
new DashboardController();