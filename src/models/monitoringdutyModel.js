const db = require("../../Database");

const assignDuty = (data, callback) => {

    const sql = `
        INSERT INTO monitoring_duties
        (
            monitor_id,
            department_id,
            assigned_by
        )
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [
            data.monitor_id,
            data.department_id,
            data.assigned_by
        ],
        callback
    );
};

const getAllDuties = (callback) => {

    const sql = `
        SELECT
            md.duty_id,
            u.full_name AS monitor_name,
            d.department_name,
            admin.full_name AS assigned_by,
            md.assigned_at

        FROM monitoring_duties md

        JOIN users u
        ON md.monitor_id = u.user_id

        JOIN departments d
        ON md.department_id = d.department_id

        LEFT JOIN users admin
        ON md.assigned_by = admin.user_id
    `;

    db.query(sql, callback);
};

module.exports = {
    assignDuty,
    getAllDuties
};