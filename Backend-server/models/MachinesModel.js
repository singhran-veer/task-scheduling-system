const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const machineSchema = new Schema({
    machine_id: { 
        type: String, 
        unique: true, 
        required: true 
    }, // Custom ID: MC001, MC002, etc.

    machine_name: { 
        type: String, 
        required: true 
    },

    machine_type: { 
        type: String, 
        required: true 
    }, // Example: CNC, Lathe, Welding, Assembly

    capabilities: {
        type: [String],
        default: []
    }, // Example: ["drilling", "cutting", "polishing"]

    location: { 
        type: String 
    }, // Factory floor / unit

    status: { 
        type: String, 
        enum: ["idle", "busy", "maintenance"], 
        default: "idle" 
    },

    max_operating_hours_per_day: {
        type: Number,
        default: 8
    },

    // 🔹 CURRENT ASSIGNED TASK
    assignedTask_id: { 
        type: String 
    },

    // 🔹 SCHEDULING HISTORY
    pastAssignedTasks: {
        type: [
            {
                task_id: { type: String },
                assigned_at: { type: Date },
                completed_at: { type: Date },
                duration: { type: Number } // in minutes or hours
            }
        ],
        default: []
    },

    // 🔹 PERFORMANCE METRICS
    total_working_time: { 
        type: Number, 
        default: 0 
    }, // in minutes

    total_idle_time: { 
        type: Number, 
        default: 0 
    },

    total_maintenance_time: {
        type: Number,
        default: 0
    },

    efficiency: { 
        type: Number, 
        default: 0 
    }, // calculated later

    breakdown_count: {
        type: Number,
        default: 0
    },

    installation_date: {
        type: Date
    },

    last_maintenance_date: {
        type: Date
    },

    notes: { 
        type: String 
    },

    created_at: { 
        type: Date, 
        default: Date.now 
    },

    updated_at: { 
        type: Date, 
        default: Date.now 
    },
    last_status_change: { type: Date, default: Date.now },


});

const Machines = mongoose.model("Machines", machineSchema);

module.exports = Machines;
