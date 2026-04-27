const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const activityFeedSchema = new Schema({
    entity_type: {
        type: String,
        enum: ["task", "machine", "system"],
        required: true
    },

    entity_id: {
        type: String,
        required: true
    },

    action: {
        type: String,
        required: true
    },

    related_machine_id: { type: String },
    related_task_id: { type: String },

    details: { type: Object },

    action_time: {
        type: Date,
        default: Date.now
    }
});

const ActivityFeeds = mongoose.model("ActivityFeeds", activityFeedSchema);

module.exports = ActivityFeeds;
