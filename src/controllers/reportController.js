const reportModel = require("../models/reportModel");
const PDFDocument = require("pdfkit");

// ==========================================
// Helper: Shared PDF Generator for All Attendance Reports
// (Department Report, Admin Teacher Report, Teacher Own Report)
// Same neat 7-column layout, blue header & vertical/horizontal grid
// ==========================================
function generateAttendancePDF(res, { title, subTitle, startDate, endDate, rows, fileName }) {
    const doc = new PDFDocument({ margin: 35, size: 'A4' });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    doc.pipe(res);

    const tableLeft = 35;
    // Total = 70 + 90 + 50 + 110 + 70 + 70 + 70 = 530 pt (fits perfectly on A4 595pt width)
    const colWidths = [70, 90, 50, 110, 70, 70, 70];
    const totalWidth = colWidths.reduce((a, b) => a + b, 0);
    const headers = ['Date', 'Class', 'Period', 'Teacher', 'Code', 'Status', 'Substitute'];
    const headerHeight = 24;
    const rowHeight = 20;

    const drawHeader = (topY) => {
        // Blue header background
        doc.fillColor('#1A237E').rect(tableLeft, topY, totalWidth, headerHeight).fill();

        // Header text (White, Bold)
        doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8);
        let currentX = tableLeft;
        headers.forEach((header, i) => {
            doc.text(header, currentX + 5, topY + 7, { width: colWidths[i] - 10, align: 'left' });
            currentX += colWidths[i];
        });

        // Outer border around header
        doc.strokeColor('#1A237E').lineWidth(1)
           .moveTo(tableLeft, topY).lineTo(tableLeft + totalWidth, topY).stroke()
           .moveTo(tableLeft, topY + headerHeight).lineTo(tableLeft + totalWidth, topY + headerHeight).stroke();
    };

    // === TITLE (Left-aligned, Navy Blue, Bold - As in Screenshot) ===
    doc.fillColor('#1A237E').font('Helvetica-Bold').fontSize(14).text(title, tableLeft, 40);
    doc.moveDown(0.4);

    // === SUBTITLE INFO ===
    doc.fillColor('#222222').font('Helvetica-Bold').fontSize(10).text(subTitle, tableLeft);
    doc.fillColor('#444444').font('Helvetica').fontSize(9).text(`Date Range: ${startDate} to ${endDate}`, tableLeft);
    doc.text(`Total Records: ${rows.length}`, tableLeft);
    doc.moveDown(0.8);

    let rowY = doc.y;
    drawHeader(rowY);
    rowY += headerHeight;

    if (rows.length === 0) {
        doc.fillColor('#666666').font('Helvetica').fontSize(9);
        doc.rect(tableLeft, rowY, totalWidth, 30).strokeColor('#cccccc').lineWidth(0.5).stroke();
        doc.text('No attendance records found for this date range.', tableLeft + 10, rowY + 10);
        rowY += 30;
    } else {
        doc.font('Helvetica').fontSize(7.5);

        rows.forEach((row) => {
            // Check for page overflow
            if (rowY + rowHeight > 760) {
                // Close bottom border of current page
                doc.strokeColor('#1A237E').lineWidth(1)
                   .moveTo(tableLeft, rowY).lineTo(tableLeft + totalWidth, rowY).stroke();

                doc.addPage();
                rowY = 40;
                drawHeader(rowY);
                rowY += headerHeight;
                doc.font('Helvetica').fontSize(7.5);
            }

            // Format Date safely
            let dateStr = '-';
            if (row.date) {
                if (typeof row.date === 'string') {
                    dateStr = row.date.split('T')[0];
                } else if (row.date instanceof Date) {
                    const y = row.date.getFullYear();
                    const m = String(row.date.getMonth() + 1).padStart(2, '0');
                    const d = String(row.date.getDate()).padStart(2, '0');
                    dateStr = `${y}-${m}-${d}`;
                }
            }

            const className = `${row.dept || ''} (${row.sem || ''})`.trim() || '-';
            const periodStr = row.period ? `P${row.period}` : '-';
            const teacherStr = row.teacher || '-';
            const codeStr = row.code || '-';
            const statusStr = row.status || '-';
            const subStr = row.substitute || '-';

            const rowData = [dateStr, className, periodStr, teacherStr, codeStr, statusStr, subStr];

            // Draw Text
            doc.fillColor('#222222');
            let cellX = tableLeft;
            rowData.forEach((val, i) => {
                doc.text(val, cellX + 5, rowY + 6, { width: colWidths[i] - 10, align: 'left', lineBreak: false });
                cellX += colWidths[i];
            });

            // Horizontal bottom line of row
            doc.strokeColor('#cccccc').lineWidth(0.5)
               .moveTo(tableLeft, rowY + rowHeight)
               .lineTo(tableLeft + totalWidth, rowY + rowHeight)
               .stroke();

            // Vertical column grid lines
            let lineX = tableLeft;
            for (let i = 0; i <= colWidths.length; i++) {
                doc.strokeColor('#cccccc').lineWidth(0.5)
                   .moveTo(lineX, rowY)
                   .lineTo(lineX, rowY + rowHeight)
                   .stroke();
                if (i < colWidths.length) {
                    lineX += colWidths[i];
                }
            }

            rowY += rowHeight;
        });
    }

    // Final outer table bottom border
    doc.strokeColor('#1A237E').lineWidth(1)
       .moveTo(tableLeft, rowY).lineTo(tableLeft + totalWidth, rowY).stroke();

    doc.end();
}

class ReportController {

    // GET /api/reports/department/:department_id
    async getDepartmentAttendance(req, res) {
        try {
            const departmentId = req.params.department_id;
            const { startDate, endDate } = req.query; 
            
            if (!startDate || !endDate) {
                return res.status(400).json({ message: "Start date and end date are required" });
            }

            const rows = await reportModel.getDepartmentAttendance(departmentId, startDate, endDate);
            res.status(200).json(rows);
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // GET /api/reports/teacher/:teacher_id
    async getTeacherAttendance(req, res) {
        try {
            const requestedTeacherId = req.params.teacher_id;
            const { startDate, endDate } = req.query; 
            
            if (!startDate || !endDate) {
                return res.status(400).json({ message: "Start date and end date are required" });
            }

            const rows = await reportModel.getTeacherAttendance(requestedTeacherId, startDate, endDate);
            res.status(200).json(rows);
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // GET /api/reports/teacher/my-history
    async getMyTeacherAttendance(req, res) {
        try {
            // ✅ FIX 1: Token mein 'id' ki jagah 'user_id' ho sakta hai, isliye fallback lagaya
            const teacherId = req.user.user_id || req.user.id; 
            const { startDate, endDate } = req.query;

            if (!startDate || !endDate) {
                return res.status(400).json({ message: "Start date and end date are required" });
            }

            const rows = await reportModel.getTeacherAttendance(teacherId, startDate, endDate);
            res.status(200).json(rows);
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // GET /api/reports/mo-history
    async getMOHistory(req, res) {
        try {
            const moId = req.user.user_id || req.user.id; 
            
            const { date, department_id } = req.query;

            if (!date) {
                return res.status(400).json({ message: "Date is required" });
            }
            
            const rows = await reportModel.getMOHistory(moId, date, department_id);
            res.status(200).json(rows);
        } catch (error) {
            console.error("❌ Error in getMOHistory:", error);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // GET /api/reports/department/:department_id/pdf
    async downloadDepartmentAttendancePDF(req, res) {
        try {
            const departmentId = req.params.department_id;
            const { startDate, endDate } = req.query;

            if (!startDate || !endDate) {
                return res.status(400).json({ message: "Start date and end date are required" });
            }

            const rows = await reportModel.getDepartmentAttendance(departmentId, startDate, endDate);
            const deptName = rows.length > 0 ? rows[0].dept : 'Department';
            const subTitle = deptName.toLowerCase().includes('dept') 
                ? `${deptName} - 1st Shift` 
                : `${deptName} Department - 1st Shift`;

            generateAttendancePDF(res, {
                title: 'Attendance Report - Class Monitoring System',
                subTitle,
                startDate,
                endDate,
                rows,
                fileName: 'Department_Attendance_Report.pdf'
            });

        } catch (error) {
            console.error("❌ Error generating Dept PDF:", error);
            res.status(500).json({ message: "Failed to generate PDF", error: error.message });
        }
    }

    // GET /api/reports/teacher/:teacher_id/pdf (Admin: Teacher-wise PDF)
    async downloadTeacherAttendancePDF(req, res) {
        try {
            const teacherId = req.params.teacher_id;
            const { startDate, endDate } = req.query;

            console.log(" Admin Teacher PDF | Teacher ID:", teacherId, "| Dates:", startDate, "to", endDate);

            if (!startDate || !endDate) {
                return res.status(400).json({ message: "Start date and end date are required" });
            }

            const rows = await reportModel.getTeacherAttendance(teacherId, startDate, endDate);
            const teacherName = rows.length > 0 ? rows[0].teacher : 'Teacher';
            const deptName = rows.length > 0 ? rows[0].dept : '';
            const subTitle = deptName 
                ? `Teacher: ${teacherName} • ${deptName} - 1st Shift` 
                : `Teacher: ${teacherName} - 1st Shift`;

            generateAttendancePDF(res, {
                title: 'Attendance Report - Class Monitoring System',
                subTitle,
                startDate,
                endDate,
                rows,
                fileName: `Teacher_${teacherName.replace(/\s+/g, '_')}_Report.pdf`
            });

        } catch (error) {
            console.error("❌ Error generating Teacher PDF:", error);
            res.status(500).json({ message: "Failed to generate PDF", error: error.message });
        }
    }

    // GET /api/reports/teacher/my-history/pdf (Teacher: Own PDF)
    async downloadMyTeacherAttendancePDF(req, res) {
        try {
            const teacherId = req.user.user_id || req.user.id;
            const { startDate, endDate } = req.query;

            console.log(" Teacher Own PDF | Teacher ID:", teacherId, "| Dates:", startDate, "to", endDate);

            if (!startDate || !endDate) {
                return res.status(400).json({
                    message: "Start date and end date are required"
                });
            }

            const rows = await reportModel.getTeacherAttendance(teacherId, startDate, endDate);
            const teacherName = rows.length > 0 ? rows[0].teacher : 'Teacher';
            const deptName = rows.length > 0 ? rows[0].dept : '';
            const subTitle = deptName 
                ? `Teacher: ${teacherName} • ${deptName} - 1st Shift` 
                : `Teacher: ${teacherName} - 1st Shift`;

            generateAttendancePDF(res, {
                title: 'Attendance Report - Class Monitoring System',
                subTitle,
                startDate,
                endDate,
                rows,
                fileName: `Teacher_Report_${Date.now()}.pdf`
            });

        } catch (error) {
            console.error("❌ Error generating teacher attendance PDF:", error);
            res.status(500).json({
                message: "Failed to generate teacher attendance PDF",
                error: error.message
            });
        }
    }
}

module.exports = new ReportController();