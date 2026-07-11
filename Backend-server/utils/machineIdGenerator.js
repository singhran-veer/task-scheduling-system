const Machines = require("../models/MachinesModel");

async function generateMachineId() {
    const machines = await Machines.find(
        { machine_id: /^MC\d+$/ },
        { machine_id: 1, _id: 0 }
    ).lean();

    const maxNumber = machines.reduce((max, machine) => {
        const number = parseInt(machine.machine_id.replace("MC", ""), 10);
        return Number.isNaN(number) ? max : Math.max(max, number);
    }, 0);

    let nextNumber = maxNumber + 1;
    let nextMachineId = `MC${String(nextNumber).padStart(3, "0")}`;

    while (await Machines.exists({ machine_id: nextMachineId })) {
        nextNumber += 1;
        nextMachineId = `MC${String(nextNumber).padStart(3, "0")}`;
    }

    return nextMachineId;
}

module.exports = generateMachineId;
