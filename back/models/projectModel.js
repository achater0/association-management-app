const db = require('../config/db');

const Project = {
  create: (projectData) => {
    return new Promise((resolve, reject) => {
      const { title, description, budget, status, start_date, end_date } = projectData;
      const sql = `INSERT INTO projects (title, description, budget, status, start_date, end_date)
                   VALUES (?, ?, ?, ?, ?, ?)`;
      db.run(
        sql,
        [title, description, budget || 0, status || 'Planning', start_date, end_date],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  },

  findAll: () => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM projects ORDER BY id DESC`;
      db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  findById: (id) => {
    return new Promise((resolve, reject) => {
      const projectSql = `SELECT * FROM projects WHERE id = ?`;

      db.get(projectSql, [id], (err, project) => {
        if (err) {
          return reject(err);
        }
        if (!project) {
          return resolve(null); // Added 'return' to stop execution
        }

        const membersSql = `
          SELECT u.id, u.name, u.email, u.phone, pm.committee_role
          FROM project_members pm
          JOIN users u ON pm.user_id = u.id
          WHERE pm.project_id = ?
        `;

        db.all(membersSql, [id], (err, members) => {
          if (err) return reject(err);
          resolve({ ...project, committee_members: members });
        });
      });
    });
  },

  update: (id, projectData) => {
    return new Promise((resolve, reject) => {
      // Fixed: changed updateData to projectData
      const { title, description, budget, status, start_date, end_date } = projectData;
      const sql = `
        UPDATE projects
        SET title = COALESCE(?, title),
            description = COALESCE(?, description),
            budget = COALESCE(?, budget),
            status = COALESCE(?, status),
            start_date = COALESCE(?, start_date),
            end_date = COALESCE(?, end_date)
        WHERE id = ?
      `;
      db.run(sql, [title, description, budget, status, start_date, end_date, id], function (err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  },

  addMember: (projectId, userId, committeeRole) => {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO project_members (project_id, user_id, committee_role)
        VALUES (?, ?, ?)
        ON CONFLICT(project_id, user_id) 
        DO UPDATE SET committee_role = excluded.committee_role
      `;

      db.run(sql, [projectId, userId, committeeRole || 'Member'], function (err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  },

  removeMember: (projectId, userId) => {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM project_members WHERE project_id = ? AND user_id = ?`;

      db.run(sql, [projectId, userId], function (err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  }
};

module.exports = Project;