const Machines = require("../models/MachinesModel");

async function generateMachineId() {
    const lastMachine = await Machines.findOne({})
        .sort({ created_at: -1 })
        .lean();

    if (!lastMachine || !lastMachine.machine_id) {
        return "MC001";
    }

    const lastNumber = parseInt(
        lastMachine.machine_id.replace("MC", "")
    );

    const newNumber = lastNumber + 1;

    return `MC${String(newNumber).padStart(3, "0")}`;
}

module.exports = generateMachineId;
