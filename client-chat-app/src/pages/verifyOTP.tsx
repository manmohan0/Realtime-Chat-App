import { useEffect, useState } from "react";
import { SubmitButton } from "../components/SubmitButton";
import { InputBox } from "../components/InputBox";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import Cookies from "js-cookie";
import axios from "axios";

export function VerifyOTP () {

    const [email] = useState<string>(localStorage.getItem("email") || "");
    const [otp, setOtp] = useState<string>("");
    const navigate = useNavigate()

    useEffect(() => {
        if (!email) {
            navigate('/login');
        }
    }, [email, navigate]);

    const verifyOTP = async () => {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/verifyOtp`, { email, otp });
        console.log(res.data);
        if (res && res.data.success && res.data.reason === "") {
            Cookies.set("token", res.data.token);
            toast.success("OTP verified successfully.");
            navigate('/');
        } else if (res && !res.data.success && res.data.reason == "User not found") {
            navigate('/createaccount');
        } else if (res && !res.data.success && res.data.reason === "Invalid OTP") {
            toast.error("Invalid OTP. Please try again.");
        } else if (res && !res.data.success && res.data.reason === "OTP is required") {
            toast.error("OTP is required. Please enter your OTP.");
        } else {
            toast.error("An unexpected error occurred. Please try again later.");
        }
    }

    const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOtp(e.target.value);
    }

    return (
        <>
        <Toaster/>        
            <div className="flex items-center justify-center h-screen bg-electric-blue">
                <div className="bg-white p-8 rounded-lg shadow-md w-96">
                    <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
                    <div>
                        <span className="mx-3 text-lg">OTP</span>
                        <InputBox onInput={handleOTPChange} placeholder={"123456"}/>
                        <SubmitButton onClick={verifyOTP} text="Verify" />
                    </div>
                </div>
            </div>
        </>
    );
}