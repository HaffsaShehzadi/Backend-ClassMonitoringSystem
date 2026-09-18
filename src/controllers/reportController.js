const reportModel = require("../models/reportModel");
const PDFDocument = require("pdfkit");

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

            const doc = new PDFDocument({ margin: 40, size: 'A4' });
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename="Department_Attendance_Report.pdf"`);
            doc.pipe(res);

            // === TITLE ===
            doc.fontSize(16).font('Helvetica-Bold').text('Attendance Report - Class Monitoring System', { align: 'center' });
            doc.moveDown(0.5);

            // === DEPARTMENT INFO ===
            const deptName = rows.length > 0 ? rows[0].dept : 'Department';
            doc.fontSize(10).font('Helvetica').text(`${deptName} - 1st Shift`);
            doc.fontSize(9).text(`Date Range: ${startDate} to ${endDate}`);
            doc.fontSize(9).text(`Total Records: ${rows.length}`);
            doc.moveDown(1);

            // === TABLE SETUP (Reference PDF Jaisa) ===
            const tableTop = doc.y;
            const tableLeft = 35;
            const colWidths = [70, 90, 50, 110, 70, 70, 70];
            const totalWidth = colWidths.reduce((a, b) => a + b, 0);
            const rowHeight = 20;

            // 1. Draw Blue Header Background
            doc.fillColor('#1A237E').rect(tableLeft, tableTop, totalWidth, 25).fill();
            
            // 2. Draw Header Text (White)
            doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8);
            const headers = ['Date', 'Class', 'Period', 'Teacher', 'Code', 'Status', 'Substitute'];
            let currentX = tableLeft + 5;
            headers.forEach((header, i) => {
                doc.text(header, currentX, tableTop + 8, { width: colWidths[i] - 5, align: 'left' });
                currentX += colWidths[i];
            });

            // 3. Draw Table Border (Top & Bottom of Header)
            doc.strokeColor('#1A237E').lineWidth(1);
            doc.moveTo(tableLeft, tableTop).lineTo(tableLeft + totalWidth, tableTop).stroke();
            doc.moveTo(tableLeft, tableTop + 25).lineTo(tableLeft + totalWidth, tableTop + 25).stroke();

            // 4. Draw Table Rows
            doc.fillColor('#000000').font('Helvetica').fontSize(7);
            let rowY = tableTop + 25;

            if (rows.length === 0) {
                doc.fontSize(9).text('No attendance records found.', tableLeft + 5, rowY + 5);
                rowY += 30;
            } else {
                rows.forEach((row) => {
                    if (rowY > 750) { // New Page
                        doc.addPage();
                        rowY = 40;
                    }

                    currentX = tableLeft + 5;
                    
                    // Format Data
                    const dateStr = row.date ? new Date(row.date).toISOString().split('T')[0] : '-';
                    const className = `${row.dept || ''} (${row.sem || ''})`.trim();
                    
                    const rowData = [
                        dateStr,
                        className,
                        `P${row.period || ''}`,
                        row.teacher || '-',
                        row.code || '-',
                        row.status || '-',
                        row.substitute || '-'
                    ];

                    // Draw Each Cell
                    rowData.forEach((cell, i) => {
                        doc.text(cell, currentX, rowY + 5, { width: colWidths[i] - 5, align: 'left' });
                        currentX += colWidths[i];
                    });

                    // Draw Horizontal Line After Each Row (Reference PDF Jaisa)
                    doc.strokeColor('#cccccc').lineWidth(0.5)
                       .moveTo(tableLeft, rowY + 20)
                       .lineTo(tableLeft + totalWidth, rowY + 20)
                       .stroke();
                    
                    rowY += rowHeight;
                });
            }

            // Final Bottom Border
            doc.strokeColor('#1A237E').lineWidth(1)
               .moveTo(tableLeft, rowY)
               .lineTo(tableLeft + totalWidth, rowY)
               .stroke();

            doc.end();

        } catch (error) {
            console.error("❌ Error generating Dept PDF:", error);
            res.status(500).json({ message: "Failed to generate PDF", error: error.message });
        }
    }

    // ✅ YEH WO MISSING FUNCTION HAI JO ERROR DE RAHA THA - ADMIN KE LIYE TEACHER WISE PDF
    // GET /api/reports/teacher/:teacher_id/pdf
    async downloadTeacherAttendancePDF(req, res) {
        try {
            const teacherId = req.params.teacher_id;
            const { startDate, endDate } = req.query;

            console.log(" Admin Teacher PDF | Teacher ID:", teacherId, "| Dates:", startDate, "to", endDate);

            if (!startDate || !endDate) {
                return res.status(400).json({ message: "Start date and end date are required" });
            }

            const rows = await reportModel.getTeacherAttendance(teacherId, startDate, endDate);
            console.log("📊 Rows Found:", rows.length);

            const doc = new PDFDocument({ margin: 40, size: 'A4' });
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename="Teacher_Attendance_Report.pdf"`);
            doc.pipe(res);

            // === TITLE ===
            doc.fontSize(16).font('Helvetica-Bold').text('Teacher Attendance Report', { align: 'center' });
            doc.moveDown(0.5);

            // === TEACHER INFO ===
            if (rows.length > 0) {
                doc.fontSize(10).font('Helvetica').text(`Teacher: ${rows[0].teacher}`);
                doc.fontSize(9).text(`Department: ${rows[0].dept}`);
            } else {
                doc.fontSize(9).font('Helvetica').text("No records found for this date range.");
            }
            doc.fontSize(9).text(`Shift: 1st Shift`);
            doc.fontSize(9).text(`Date Range: ${startDate} to ${endDate}`);
            doc.fontSize(9).text(`Total Records: ${rows.length}`);
            doc.moveDown(1);

            // === TABLE SETUP ===
            const tableTop = doc.y;
            const tableLeft = 35;
            const colWidths = [65, 60, 40, 80, 50, 60, 80, 60, 60];
            const totalWidth = colWidths.reduce((a, b) => a + b, 0);
            const rowHeight = 20;

            // Blue Header
            doc.fillColor('#1A237E').rect(tableLeft, tableTop, totalWidth, 25).fill();
            
            // Header Text
            doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(7);
            const headers = ['Date', 'Day', 'Period', 'Timing', 'Room', 'Code', 'Class', 'Status', 'Substitute'];
            let currentX = tableLeft + 3;
            headers.forEach((header, i) => {
                doc.text(header, currentX, tableTop + 8, { width: colWidths[i] - 5 });
                currentX += colWidths[i];
            });

            // Table Borders
            doc.strokeColor('#1A237E').lineWidth(1);
            doc.moveTo(tableLeft, tableTop).lineTo(tableLeft + totalWidth, tableTop).stroke();
            doc.moveTo(tableLeft, tableTop + 25).lineTo(tableLeft + totalWidth, tableTop + 25).stroke();

            // Table Rows
            doc.fillColor('#000000').font('Helvetica').fontSize(6.5);
            let rowY = tableTop + 25;

            if (rows.length === 0) {
                doc.fontSize(9).text('No attendance records found.', tableLeft + 5, rowY + 5);
            } else {
                rows.forEach((row) => {
                    if (rowY > 750) {
                        doc.addPage();
                        rowY = 40;
                    }

                    currentX = tableLeft + 3;
                    
                    const dateStr = row.date ? new Date(row.date).toISOString().split('T')[0] : '-';
                    const timing = `${row.start_time || '08:30'} - ${row.end_time || '09:15'}`;
                    const className = `${row.dept || ''} (${row.sem || ''})`.trim();
                    
                    const rowData = [
                        dateStr,
                        row.day || '-',
                        `P${row.period || ''}`,
                        timing,
                        row.room || '-',
                        row.code || '-',
                        className,
                        row.status || '-',
                        row.substitute || '-'
                    ];

                    rowData.forEach((cell, i) => {
                        doc.text(cell, currentX, rowY + 5, { width: colWidths[i] - 5 });
                        currentX += colWidths[i];
                    });

                    // Horizontal Line
                    doc.strokeColor('#cccccc').lineWidth(0.5)
                       .moveTo(tableLeft, rowY + 20)
                       .lineTo(tableLeft + totalWidth, rowY + 20)
                       .stroke();
                    
                    rowY += rowHeight;
                });
            }

            // Bottom Border
            doc.strokeColor('#1A237E').lineWidth(1)
               .moveTo(tableLeft, rowY)
               .lineTo(tableLeft + totalWidth, rowY)
               .stroke();

            doc.end();

        } catch (error) {
            console.error("❌ Error generating Teacher PDF:", error);
            res.status(500).json({ message: "Failed to generate PDF", error: error.message });
        }
    }

    // GET /api/reports/teacher/my-history/pdf
    async downloadMyTeacherAttendancePDF(req, res) {
        try {
            // ✅ FIX 2: Yahi line Teacher ki PDF ko empty hone se bachayegi
            const teacherId = req.user.user_id || req.user.id;
            const { startDate, endDate } = req.query;

            console.log(" PDF Debug -> Teacher ID:", teacherId, "| Dates:", startDate, "to", endDate);

            if (!startDate || !endDate) {
                return res.status(400).json({
                    message: "Start date and end date are required"
                });
            }

            const rows = await reportModel.getTeacherAttendance(
                teacherId,
                startDate,
                endDate
            );

            console.log("📊 PDF Debug -> Rows Found:", rows.length);

            const doc = new PDFDocument({
                margin: 30,
                size: 'A4'
            });

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader(
                "Content-Disposition",
                `attachment; filename="teacher_attendance_${startDate}_to_${endDate}.pdf"`
            );

            doc.pipe(res);

            // ✅ Title
            doc
                .fontSize(16)
                .font('Helvetica-Bold')
                .text("Teacher Attendance Report", {
                    align: "left"
                });

            doc.moveDown(0.3);

            // ✅ Teacher Info (Safe check added)
            if (rows.length > 0) {
                doc
                    .fontSize(9)
                    .font('Helvetica')
                    .text(`Teacher: ${rows[0].teacher || 'N/A'}`);
                
                doc
                    .fontSize(9)
                    .text(`Department: ${rows[0].dept || 'N/A'}`);
            } else {
                doc
                    .fontSize(9)
                    .font('Helvetica')
                    .text("No records found for this date range.");
            }

            doc
                .fontSize(9)
                .text(`Shift: 1st Shift`);

            doc
                .fontSize(9)
                .text(`Date Range: ${startDate} to ${endDate}`);

            doc
                .fontSize(9)
                .text(`Total Records: ${rows.length}`);

            doc.moveDown(0.8);

            // ✅ Table Headers
            const tableTop = doc.y;
            const tableLeft = 30;
            const colWidths = [70, 60, 40, 80, 50, 60, 80, 60, 60];
            const totalWidth = colWidths.reduce((a, b) => a + b, 0);
            
            // Header background (Blue)
            doc
                .fillColor('#1A237E')
                .rect(tableLeft, tableTop - 20, totalWidth, 25)
                .fill();

            // Header text (White)
            doc
                .fillColor('#ffffff')
                .font('Helvetica-Bold')
                .fontSize(8);

            let currentX = tableLeft + 5;
            const headers = ['Date', 'Day', 'Period', 'Timing', 'Room', 'Code', 'Class', 'Status', 'Substitute'];
            headers.forEach((header, i) => {
                doc.text(header, currentX, tableTop - 15, { width: colWidths[i] - 10 });
                currentX += colWidths[i];
            });

            // ✅ Table rows
            doc
                .fillColor('#000000')
                .font('Helvetica')
                .fontSize(7);

            let rowY = tableTop + 10;
            
            rows.forEach((row, index) => {
                // New page if needed
                if (rowY > 750) {
                    doc.addPage();
                    rowY = 30;
                }

                currentX = tableLeft + 5;
                
                // ✅ Format Date
                const formattedDate = row.date ? 
                    new Date(row.date).toISOString().split('T')[0] : '-';
                
                // Date
                doc.text(formattedDate, currentX, rowY, { width: colWidths[0] - 10 });
                currentX += colWidths[0];
                
                // Day
                doc.text(row.day || '-', currentX, rowY, { width: colWidths[1] - 10 });
                currentX += colWidths[1];
                
                // Period
                doc.text(`P${row.period || ''}`, currentX, rowY, { width: colWidths[2] - 10 });
                currentX += colWidths[2];
                
                // Timing
                const startTime = row.start_time || '08:30';
                const endTime = row.end_time || '09:15';
                doc.text(`${startTime} - ${endTime}`, currentX, rowY, { width: colWidths[3] - 10 });
                currentX += colWidths[3];
                
                // Room
                doc.text(row.room || '-', currentX, rowY, { width: colWidths[4] - 10 });
                currentX += colWidths[4];
                
                // Code
                doc.text(row.code || '-', currentX, rowY, { width: colWidths[5] - 10 });
                currentX += colWidths[5];
                
                // Class
                const className = row.dept && row.sem ? 
                    `${row.dept} (${row.sem})` : '-';
                doc.text(className, currentX, rowY, { width: colWidths[6] - 10 });
                currentX += colWidths[6];
                
                // Status
                doc.text(row.status || '-', currentX, rowY, { width: colWidths[7] - 10 });
                currentX += colWidths[7];
                
                // Substitute
                doc.text(row.substitute || '-', currentX, rowY, { width: colWidths[8] - 10 });

                // Row separator line
                doc
                    .strokeColor('#dddddd')
                    .moveTo(tableLeft, rowY + 12)
                    .lineTo(tableLeft + totalWidth, rowY + 12)
                    .stroke();

                rowY += 18;
            });

            doc.end();

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