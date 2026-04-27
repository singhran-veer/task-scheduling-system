import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.scss";
import { Suspense, lazy } from "react";

// Toast
import ToastWrapper from "./common/ToastWrapper/ToastWrapper";
import "react-toastify/dist/ReactToastify.css";

// Internet Checker
import { InternetChecker } from "./common/InternetChecker";

// Core
import NotFound from "./pages/NotFound/NotFound";
import Dashboard from "./pages/Dashboard/Dashboard";
import Layout from "./pages/Layout";
import PageLoader from "./components/Loader/PageLoader/PageLoader";
import ErrorPage from "./components/ErrorDetailsPage/ErrorPage";
import { Provider } from "react-redux";
import store from "./utils/redux-toolkit/store";

// =============================
// LAZY PAGES (NEW SYSTEM)
// =============================

const ContactPage = lazy(() => import("./pages/ContactPage/ContactPage"));
const AdminPanelPage = lazy(() => import("./pages/AdminPanelPage/AdminPanelPage"));

// NEW PAGES (YOU WILL CREATE THESE)
const MachinesPage = lazy(() => import("./pages/MachinesPage/MachinesPage"));
const MachineDetailsPage = lazy(() => import("./pages/MachineDetailsPage/MachineDetailsPage"));

const TasksPage = lazy(() => import("./pages/TasksPage/TasksPage"));
const TaskDetailsPage = lazy(() => import("./pages/TaskDetailsPage/TaskDetailsPage"));

const SchedulerPage = lazy(() => import("./pages/SchedulerPage/SchedulerPage"));

const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage/AnalyticsPage"));
const ActivityPage = lazy(() => import("./pages/ActivityPage/ActivityPage"));

function App() {
    const router = createBrowserRouter([
        {
            element: <Layout />,
            children: [
                // =============================
                // Dashboard
                // =============================
                { index: true, element: <Dashboard /> },

                // =============================
                // Machines
                // =============================
                {
                    path: "/machines",
                    element: (
                        <Suspense fallback={<PageLoader />}>
                            <MachinesPage />
                        </Suspense>
                    ),
                },
                {
                    path: "/machines/:machineId",
                    element: (
                        <Suspense fallback={<PageLoader />}>
                            <MachineDetailsPage />
                        </Suspense>
                    ),
                },

                // =============================
                // Tasks
                // =============================
                {
                    path: "/tasks",
                    element: (
                        <Suspense fallback={<PageLoader />}>
                            <TasksPage />
                        </Suspense>
                    ),
                },
                {
                    path: "/tasks/:id",
                    element: (
                        <Suspense fallback={<PageLoader />}>
                            <TaskDetailsPage />
                        </Suspense>
                    ),
                    errorElement: (
                        <ErrorPage message="Task details could not be displayed." />
                    ),
                },

                // =============================
                // Scheduler
                // =============================
                {
                    path: "/scheduler",
                    element: (
                        <Suspense fallback={<PageLoader />}>
                            <SchedulerPage />
                        </Suspense>
                    ),
                },

                // =============================
                // Analytics
                // =============================
                {
                    path: "/analytics",
                    element: (
                        <Suspense fallback={<PageLoader />}>
                            <AnalyticsPage />
                        </Suspense>
                    ),
                },

                // =============================
                // Activity Timeline
                // =============================
                {
                    path: "/activity",
                    element: (
                        <Suspense fallback={<PageLoader />}>
                            <ActivityPage />
                        </Suspense>
                    ),
                },

                // =============================
                // Contact
                // =============================
                {
                    path: "/contact",
                    element: (
                        <Suspense fallback={<PageLoader />}>
                            <ContactPage />
                        </Suspense>
                    ),
                },

                // =============================
                // Admin
                // =============================
                {
                    path: "/admin-panel",
                    element: (
                        <Suspense fallback={<PageLoader />}>
                            <AdminPanelPage />
                        </Suspense>
                    ),
                },

                // =============================
                // Not Found
                // =============================
                { path: "*", element: <NotFound /> },
            ],
        },
    ]);

    return (
        <Provider store={store}>
            <RouterProvider router={router} />
            <ToastWrapper />
            <InternetChecker checkInterval={30000} />
        </Provider>
    );
}

export default App;
