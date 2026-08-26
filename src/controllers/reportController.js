const reportModel = require("../models/reportModel");

// Report Controller - handles attendance and performance reports
class ReportController {

    // GET /api/reports/daily
    async getDailyAttendance(req, res) {
        try {
            const rows = await reportModel.getDailyAttendance();
            res.status(200).json(rows);
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // GET /api/reports/weekly
    async getWeeklyAttendance(req, res) {
        try {
            const rows = await reportModel.getWeeklyAttendance();
            res.status(200).json(rows);
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // GET /api/reports/monthly
    async getMonthlyAttendance(req, res) {
        try {
            const rows = await reportModel.getMonthlyAttendance();
            res.status(200).json(rows);
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // GET /api/reports/department/:department_id
    async getDepartmentAttendance(req, res) {
        try {
            const departmentId = req.params.department_id;
            const rows = await reportModel.getDepartmentAttendance(departmentId);
            res.status(200).json(rows);
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // GET /api/reports/teacher/:teacher_id
    async getTeacherAttendance(req, res) {
        try {
            const teacherId = req.params.teacher_id;
            const rows = await reportModel.getTeacherAttendance(teacherId);
            res.status(200).json(rows);
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // GET /api/reports/summary
    async getAttendanceSummary(req, res) {
        try {
            const summary = await reportModel.getAttendanceSummary();
            res.status(200).json(summary);
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }
}

module.exports = new ReportController();