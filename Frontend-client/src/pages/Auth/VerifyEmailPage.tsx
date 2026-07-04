import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { notify } from "../../utils/functions/notify";
import { sendOtpRequest, signupRequest } from "../../utils/hooks/api/useAuthApi";
import { setLoading, setSignupData } from "../../utils/redux-toolkit/authSlice";
import {
    useAppDispatch,
    useAppSelector,
} from "../../utils/redux-toolkit/reduxHooks";
import "./AuthPages.scss";

const VerifyEmailPage = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { signupData, loading } = useAppSelector((state) => state.auth);
    const [digits, setDigits] = useState(["", "", "", "", "", ""]);

    const otp = useMemo(() => digits.join(""), [digits]);

    useEffect(() => {
        if (!signupData) {
            navigate("/signup", { replace: true });
        }
    }, [navigate, signupData]);

    const updateDigit = (index: number, value: string) => {
        const nextValue = value.replace(/\D/g, "").slice(-1);
        setDigits((prev) => {
            const next = [...prev];
            next[index] = nextValue;
            return next;
        });

        if (nextValue && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!signupData || otp.length !== 6) {
            notify("error", "Enter the 6 digit OTP");
            return;
        }

        dispatch(setLoading(true));

        try {
            await signupRequest(signupData, otp);
            dispatch(setSignupData(null));
            notify("success", "Signup successful. Please sign in.");
            navigate("/login", { replace: true });
        } catch (error: any) {
            notify(
                "error",
                error.response?.data?.message || error.message || "Verification failed"
            );
        } finally {
            dispatch(setLoading(false));
        }
    };

    const resendOtp = async () => {
        if (!signupData) return;

        dispatch(setLoading(true));
        try {
            await sendOtpRequest(signupData.email);
            notify("success", "OTP resent");
        } catch (error: any) {
            notify(
                "error",
                error.response?.data?.message || error.message || "Could not resend OTP"
            );
        } finally {
            dispatch(setLoading(false));
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-panel">
                <p className="auth-eyebrow">Email verification</p>
                <h1>Enter your OTP</h1>
                <p className="auth-subtitle">
                    We sent a 6 digit code to {signupData?.email || "your email"}.
                </p>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="otp-inputs">
                        {digits.map((digit, index) => (
                            <input
                                key={index}
                                id={`otp-${index}`}
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(event) =>
                                    updateDigit(index, event.target.value)
                                }
                                onKeyDown={(event) => {
                                    if (
                                        event.key === "Backspace" &&
                                        !digits[index] &&
                                        index > 0
                                    ) {
                                        document.getElementById(`otp-${index - 1}`)?.focus();
                                    }
                                }}
                            />
                        ))}
                    </div>

                    <button className="main-btn green-bg auth-submit" disabled={loading}>
                        {loading ? "Verifying..." : "Verify and create account"}
                    </button>
                </form>

                <div className="auth-link-row">
                    <Link to="/signup">Back to signup</Link>
                    <button type="button" onClick={resendOtp} disabled={loading}>
                        Resend OTP
                    </button>
                </div>
            </section>
        </main>
    );
};

export default VerifyEmailPage;
