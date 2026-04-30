const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./utils/dbConnect");
const startServerWithDB = require("./utils/serverManager");


// Load environment variables
dotenv.config();
const PORT = process.env.PORT || 6060;

// Initialize Express
const app = express();


// =======================
// MIDDLEWARES 
// =======================
app.use(express.json({ limit: "50mb" }));
app.use(express.static("views/staticFiles"));
app.use("/uploads", express.static("uploads"));

// CORS Middleware
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );

    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }

    next();
});


// =======================
// IMPORT MACHINE–TASK ROUTES
// =======================

// MACHINE ROUTES
const addNewMachineRoute = require("./routes/AddNewMachine_Route");
const getAllMachinesRoute = require("./routes/GetAllMachines_Route");
const editMachineRoute = require("./routes/EditMachine_Route");
const deleteMachineRoute = require("./routes/DeleteMachine_Route");
const getMachineDetailsRoute = require("./routes/GetMachineDetails_Route");




// TASK ROUTES
const addNewTaskRoute = require("./routes/AddNewTask_Route");
const getAllTasksRoute = require("./routes/GetAllTasks_Route");
const getTaskDetailsRoute = require("./routes/GetTaskDetails_Route");
const editTaskRoute = require("./routes/EditTask_Route");
const deleteTaskRoute = require("./routes/DeleteTask_Route");
const deleteBulkTasksRoute = require("./routes/DeleteBulkTasks_Route");
const completeTaskRoute = require("./routes/CompleteTask_Route");

// SCHEDULER ROUTES
const runSchedulerRoute = require("./routes/RunScheduler_Route");
const resetSchedulerRoute = require("./routes/ResetScheduler_Route");

// ANALYTICS ROUTES
const machineUtilizationRoute = require("./routes/GetMachineUtilization_Route");
const systemEfficiencyRoute = require("./routes/GetSystemEfficiency_Route");
const dashboardRoute = require("./routes/GetDashboard_Route");
const activityTimelineRoute = require("./routes/GetActivityTimeline_Route");




// =======================
// HOME PAGE
// =======================
app.get("/", (req, res) => {
    res.sendFile(`${__dirname}/views/homePage.html`);
});


// =======================
// API ROUTES
// =======================

// Machines
app.use("/api/machines", addNewMachineRoute);
app.use("/api/machines", getAllMachinesRoute);
app.use("/api/machines", editMachineRoute);
app.use("/api/machines", deleteMachineRoute);
app.use("/api/machines", getMachineDetailsRoute);

// Tasks
app.use("/api/tasks", addNewTaskRoute);
app.use("/api/tasks", getAllTasksRoute);
app.use("/api/tasks", getTaskDetailsRoute);
app.use("/api/tasks", editTaskRoute);
app.use("/api/tasks", deleteTaskRoute);
app.use("/api/tasks", deleteBulkTasksRoute);
app.use("/api/tasks", completeTaskRoute);

// Scheduler
app.use("/api/scheduler", runSchedulerRoute);
app.use("/api/scheduler", resetSchedulerRoute);
app.post("/api/run-scheduler", (req, res, next) => {
    req.url = "/run";
    next();
}, runSchedulerRoute);

// Analytics
app.use("/api/analytics", machineUtilizationRoute);
app.use("/api/analytics", systemEfficiencyRoute);
app.use("/api/dashboard", dashboardRoute);
app.use("/api/activity", activityTimelineRoute);



// =======================
// 404 HANDLER (MUST BE LAST)
// =======================
app.use((req, res) => {
    res.status(404);
    res.sendFile(`${__dirname}/views/notFound.html`);
});


// =======================
// START SERVER
// =======================
if (process.env.NODE_ENV === "production") {
    connectDB();
    module.exports = app;
} else {
    startServerWithDB(app, PORT);
}
