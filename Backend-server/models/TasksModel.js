const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const taskSchema = new Schema({
    task_id: { 
        type: String, 
        unique: true, 
        required: true 
    }, // Custom ID: TS001, TS002, etc.

    task_name: { 
        type: String, 
        required: true 
    },

    task_type: { 
        type: String, 
        required: true 
    }, 
    // Example: drilling, welding, assembly

    required_machine_type: { 
        type: String, 
        required: true 
    }, 
    // Example: CNC, Lathe, Welding machine

    required_capabilities: {
        type: [String],
        default: []
    }, 
    // Example: ["cutting", "precision-drilling"]

    priority: { 
        type: Number, 
        required: true 
    }, 
    // Higher number = higher priority

    duration: { 
        type: Number, 
        required: true 
    }, 
    // Execution time (in minutes)

    time_unit: { 
        type: String, 
        default: "minutes" 
    },

    arrival_time: { 
        type: Date, 
        default: Date.now 
    },

    deadline: { 
        type: Date ,
        default: new Date("9999-12-31T23:59:59Z")
    },

    status: { 
        type: String, 
        enum: ["pending", "scheduled", "running", "completed"], 
        default: "pending" 
    },

    assignedMachine_id: { 
        type: String 
    }, 

    lastMachine_id: { 
        type: String 
    },

    assigned_at: { 
        type: Date 
    },

    completed_at: { 
        type: Date 
    },

    cost: { 
        type: Number 
    },

    currency: { 
        type: String, 
        default: "INR" 
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
});

const Tasks = mongoose.model("Tasks", taskSchema);

module.exports = Tasks;
