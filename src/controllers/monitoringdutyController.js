const monitoringDutyModel = require("../models/monitoringdutyModel");

// ============================================
// Monitoring Duty Controller
// Admin duty assign karta hai, MO apni duty dekhta hai
// ============================================
class MonitoringDutyController {

    // POST /api/monitoring-duty/assign
    // Admin MO ko duty assign karta hai (sirf admin)
    async assign(req, res) {
        try {
            const { official_id, department_id, shift, duty_date } = req.body;

            // Sab fields zaroori hain
            if (!official_id || !department_id || !shift || !duty_date) {
                return res.status(400).json({ message: "All fields are required" });
            }

            const id = await monitoringDutyModel.assign({
                official_id,
                department_id,
                shift,
                duty_date,
                assigned_by: req.user.user_id   // admin ki id token se
            });

            res.status(201).json({ message: "Duty assigned successfully", id });
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // GET /api/monitoring-duty/my-duty
    // MO apni KHUD ki duties dekhta hai
    async getMyDuty(req, res) {
        try {
            const rows = await monitoringDutyModel.getByOfficial(req.user.user_id);
            res.json(rows);
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // GET /api/monitoring-duty/all
    // Admin sari assignments dekhta hai (sirf admin)
    async getAll(req, res) {
        try {
            const rows = await monitoringDutyModel.getAll();
            res.json(rows);
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // DELETE /api/monitoring-duty/delete/:id
    // Admin duty wapas leta hai (sirf admin)
    async remove(req, res) {
        try {
            await monitoringDutyModel.remove(req.params.id);
            res.json({ message: "Duty removed" });
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }
}

module.exports = new MonitoringDutyController();