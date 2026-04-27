const express = require("express");
const router = express.Router();
const Machines = require("../models/MachinesModel");

router.delete("/:machine_id", async (req, res) => {
    try {
        const machine = await Machines.findOne({ machine_id: req.params.machine_id });

        if (!machine)
            return res.status(404).json({ message: "Machine not found" });

        if (machine.status === "busy")
            return res.status(400).json({ message: "Machine is busy" });

        await Machines.deleteOne({ machine_id: req.params.machine_id });

        res.json({ message: "Machine deleted" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
