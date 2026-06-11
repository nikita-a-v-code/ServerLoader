const express = require("express");
const pool = require("../../config/database");
const router = express.Router();

router.get("/objectid", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const result = await client.query(`
        UPDATE "Enforce".identifier
        SET reserved_at = NOW()
        WHERE id = (
            SELECT id FROM "Enforce".identifier
            WHERE is_used = FALSE 
              AND (reserved_at IS NULL OR reserved_at < NOW() - INTERVAL '10 minutes')
            ORDER BY id
            FOR UPDATE SKIP LOCKED
            LIMIT 1
       )
       RETURNING mrid, id
       `);

    await client.query("COMMIT");

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No available codes left" });
    }

    res.json({ objectID: result.rows[0].mrid });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

router.post("/objectid/mark-used", async (req, res) => {
  try {
    const { objectIDs } = req.body;
    if (!objectIDs || !Array.isArray(objectIDs) || objectIDs.length === 0) {
      return res.status(400).json({ error: "Invalid objectIDs array" });
    }

    await pool.query(
      `UPDATE "Enforce".identifier
       SET is_used = TRUE
       WHERE mrid = ANY($1)`,
      [objectIDs]
    );

    res.json({ success: true, marked: objectIDs.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
