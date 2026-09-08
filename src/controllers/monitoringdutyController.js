const monitoringDutyModel = require("../models/monitoringdutyModel");

class MonitoringDutyController {

    // POST /api/monitoring-duty/assign
        // POST /api/monitoring-duty/assign
    async assign(req, res) {
        try {
            console.log("📥 ASSIGN DUTY REQUEST:", req.body);
            console.log(" USER FROM TOKEN:", req.user);

            const { official_id, department_id, shift, duty_date } = req.body;

            if (!official_id || !shift || !duty_date) {
                return res.status(400).json({ message: "official_id, shift, and duty_date are required" });
            }

            if (!req.user || !req.user.user_id) {
                return res.status(401).json({ message: "Admin not authenticated" });
            }

            let deptIds = [];
            if (Array.isArray(department_id)) {
                deptIds = department_id;
            } else if (typeof department_id === 'number') {
                deptIds = [department_id];
            } else {
                return res.status(400).json({ message: "Invalid department_id format" });
            }

            // ✅ HANDLE "Both" SHIFT: 2 alag entries banayein
            const shiftsToAssign = shift === 'Both' ? ['1st Shift', '2nd Shift'] : [shift];
            
            const allInsertedIds = [];

            for (const singleShift of shiftsToAssign) {
                console.log(`🗑️ Deleting old duties for official ${official_id} on ${duty_date} with shift ${singleShift}`);
                
                // Purani duties delete karein (us date aur shift ki)
                await monitoringDutyModel.deleteByOfficialAndDateAndShift(official_id, duty_date, singleShift);

                console.log(`💾 Inserting duty with shift: ${singleShift}`);

                // Nayi duty insert karein
                const ids = await monitoringDutyModel.assign({
                    official_id,
                    department_ids: deptIds,
                    shift: singleShift,
                    duty_date,
                    assigned_by: req.user.user_id
                });

                allInsertedIds.push(...ids);
            }

            console.log("✅ Duty assigned successfully! Total IDs:", allInsertedIds);

            res.status(201).json({ 
                message: `Duty assigned to ${deptIds.length} department(s) for ${shiftsToAssign.length} shift(s) successfully`, 
                ids: allInsertedIds 
            });
        } catch (error) {
            console.error("❌ ASSIGN DUTY ERROR:", error.message);
            console.error("Stack:", error.stack);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }
    // GET /api/monitoring-duty/my-duty
        // GET /api/monitoring-duty/my-duty
    async getMyDuty(req, res) {
        try {
            const { date, shift } = req.query;
            
            // ✅ FIX: 'user_id' ya 'id' dono check karein kyunke token payload mein 'id' hota hai
            const officialId = req.user.user_id || req.user.id;
            
            console.log("🔍 getMyDuty called with officialId:", officialId, "| Date:", date, "| Shift:", shift);

            const rows = await monitoringDutyModel.getByOfficial(officialId);
            
            console.log("📊 Raw rows from DB for officialId", officialId, ":", rows.length);
            
            let filteredRows = rows;
            
            // ✅ Date ke hisaab se filter karein
            if (date) {
                filteredRows = filteredRows.filter(row => {
                    const dDate = row.duty_date ? String(row.duty_date).split('T')[0] : '';
                    return dDate === date;
                });
            }
            
            // ✅ Shift ke hisaab se filter karein
            if (shift) {
                filteredRows = filteredRows.filter(row => row.shift === shift || row.shift === 'Both');
            }

            const formattedRows = filteredRows.map(row => {
                if (row.duty_date) {
                    const d = new Date(row.duty_date);
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    row.duty_date = `${year}-${month}-${day}`;
                }
                return row;
            });
            
            console.log("✅ Sending formatted rows to frontend:", formattedRows.length);
            res.json(formattedRows);
        } catch (error) {
            console.error("❌ getMyDuty Error:", error);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // GET /api/monitoring-duty/all
     // GET /api/monitoring-duty/all
    async getAll(req, res) {
        try {
            const rows = await monitoringDutyModel.getAll();
            
            // ✅ FIX: UTC date ko wapis local YYYY-MM-DD string mein convert karein
            const formattedRows = rows.map(row => {
                if (row.duty_date) {
                    const d = new Date(row.duty_date);
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    row.duty_date = `${year}-${month}-${day}`;
                }
                return row;
            });
            
            res.json(formattedRows);
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // DELETE /api/monitoring-duty/delete/:id
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