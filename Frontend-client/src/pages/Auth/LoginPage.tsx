import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { notify } from "../../utils/functions/notify";
import { loginRequest } from "../../utils/hooks/api/useAuthApi";
import {
    useAppDispatch,
    useAppSelector,
} from "../../utils/redux-toolkit/reduxHooks";
import { setCredentials, setLoading } from "../../utils/redux-toolkit/authSlice";
import "./AuthPages.scss";

const LoginPage = () => {
    const dispatch = useAppDispatch();
    const loading = useAppSelector((state) => state.auth.loading);
    const navigate = useNavigate();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: "", password: "" });

    const from =
        (location.state as { from?: { pathname?: string } } | null)?.from
            ?.pathname || "/";

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        dispatch(setLoading(true));

        try {
            const response = await loginRequest(formData.email, formData.password);
            const { token, user } = response.data;

            if (!token || !user) {
                throw new Error(response.data.message || "Login failed");
            }

            localStorage.setItem("token", JSON.stringify(token));
            localStorage.setItem("user", JSON.stringify(user));
            dispatch(setCredentials({ token, user }));
            notify("success", "Login successful");
            navigate(from, { replace: true });
        } catch (error: any) {
            notify(
                "error",
                error.response?.data?.message || error.message || "Login failed"
            );
        } finally {
            dispatch(setLoading(false));
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-panel">
                <p className="auth-eyebrow">Welcome back</p>
                <h1>Sign in to Task Scheduling</h1>
                <p className="auth-subtitle">
                    Use your verified account to manage machines, tasks, and scheduler
                    operations.
                </p>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <label>
                        Email
                        <input
                            required
                            type="email"
                            name="email"
                            value={formData.email}
                            placeholder="you@example.com"
                            onChange={(event) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    email: event.target.value,
                                }))
                            }
                        />
                    </label>

                    <label className="password-field">
                        Password
                        <input
                            required
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            placeholder="Enter your password"
                            onChange={(event) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    password: event.target.value,
                                }))
                            }
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
                        </button>
                    </label>

                    <button className="main-btn green-bg auth-submit" disabled={loading}>
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                </form>

                <div className="auth-link-row">
                    <span>Need an account?</span>
                    <Link to="/signup">Create one</Link>
                </div>
            </section>
        </main>
    );
};

export default LoginPage;
