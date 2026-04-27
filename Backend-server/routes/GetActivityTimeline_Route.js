const express = require("express");
const router = express.Router();

const ActivityFeeds = require("../models/ActivityFeedsModel");

router.get("/", async (req, res) => {
    try {
        const { entity_type, entity_id, limit } = req.query;

        const filter = {};

        if (entity_type) filter.entity_type = entity_type;
        if (entity_id) filter.entity_id = entity_id;

        const activities = await ActivityFeeds.find(filter)
            .sort({ action_time: -1 })
            .limit(parseInt(limit) || 50)
            .lean();

        res.status(200).json({
            total: activities.length,
            data: activities
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch activity timeline",
            error: error.message
        });
    }
});

module.exports = router;
