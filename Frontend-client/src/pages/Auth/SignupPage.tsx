import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { notify } from "../../utils/functions/notify";
import { roleOptions, sendOtpRequest } from "../../utils/hooks/api/useAuthApi";
import type { AccountType, SignupData } from "../../utils/redux-toolkit/authSlice";
import { setLoading, setSignupData } from "../../utils/redux-toolkit/authSlice";
import {
    useAppDispatch,
    useAppSelector,
} from "../../utils/redux-toolkit/reduxHooks";
import "./AuthPages.scss";

const SignupPage = () => {
    const dispatch = useAppDispatch();
    const loading = useAppSelector((state) => state.auth.loading);
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState<SignupData>({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        accountType: "Operator",
        roleSignupSecret: "",
    });

    const setField = (name: keyof SignupData, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            notify("error", "Passwords do not match");
            return;
        }

        dispatch(setLoading(true));

        try {
            await sendOtpRequest(formData.email);
            dispatch(setSignupData(formData));
            notify("success", "OTP sent to your email");
            navigate("/verify-email");
        } catch (error: any) {
            notify(
                "error",
                error.response?.data?.message || error.message || "Could not send OTP"
            );
        } finally {
            dispatch(setLoading(false));
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-panel">
                <p className="auth-eyebrow">Create account</p>
                <h1>Join Task Scheduling</h1>
                <p className="auth-subtitle">
                    Verify your email with an OTP before your account is created.
                </p>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-row">
                        <label>
                            First name
                            <input
                                required
                                value={formData.firstName}
                                onChange={(event) =>
                                    setField("firstName", event.target.value)
                                }
                                placeholder="First name"
                            />
                        </label>
                        <label>
                            Last name
                            <input
                                value={formData.lastName}
                                onChange={(event) =>
                                    setField("lastName", event.target.value)
                                }
                                placeholder="Last name"
                            />
                        </label>
                    </div>

                    <label>
                        Email
                        <input
                            required
                            type="email"
                            value={formData.email}
                            onChange={(event) => setField("email", event.target.value)}
                            placeholder="you@example.com"
                        />
                    </label>

                    <label>
                        Role
                        <select
                            value={formData.accountType}
                            onChange={(event) =>
                                setField("accountType", event.target.value as AccountType)
                            }
                        >
                            {roleOptions.map((role) => (
                                <option key={role} value={role}>
                                    {role}
                                </option>
                            ))}
                        </select>
                    </label>
                    <p className="role-note">
                        Operator signup is open. Admin or Manager signup requires the
                        private role signup secret configured on the backend.
                    </p>

                    {formData.accountType !== "Operator" && (
                        <label>
                            Role signup secret
                            <input
                                type="password"
                                value={formData.roleSignupSecret}
                                onChange={(event) =>
                                    setField("roleSignupSecret", event.target.value)
                                }
                                placeholder="Secret for privileged role"
                            />
                        </label>
                    )}

                    <div className="auth-row">
                        <label className="password-field">
                            Password
                            <input
                                required
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={(event) =>
                                    setField("password", event.target.value)
                                }
                                placeholder="Create password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                aria-label={
                                    showPassword ? "Hide password" : "Show password"
                                }
                            >
                                <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
                            </button>
                        </label>

                        <label className="password-field">
                            Confirm password
                            <input
                                required
                                type={showConfirmPassword ? "text" : "password"}
                                value={formData.confirmPassword}
                                onChange={(event) =>
                                    setField("confirmPassword", event.target.value)
                                }
                                placeholder="Confirm password"
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    setShowConfirmPassword((prev) => !prev)
                                }
                                aria-label={
                                    showConfirmPassword
                                        ? "Hide confirm password"
                                        : "Show confirm password"
                                }
                            >
                                <i className={`fa-solid ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`} />
                            </button>
                        </label>
                    </div>

                    <button className="main-btn green-bg auth-submit" disabled={loading}>
                        {loading ? "Sending OTP..." : "Send OTP"}
                    </button>
                </form>

                <div className="auth-link-row">
                    <span>Already registered?</span>
                    <Link to="/login">Sign in</Link>
                </div>
            </section>
        </main>
    );
};

export default SignupPage;
