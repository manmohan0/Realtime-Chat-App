import { useState } from "react";
import { SubmitButton } from "../components/SubmitButton";
import { InputBox } from "../components/InputBox";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import SubmitButtonDisabled from "../components/SubmitButtonDisabled";

export function Login () {

    const [email, setEmail] = useState<string>("");
    const [allowed, setAllowed] = useState<boolean>(true);
    const navigate = useNavigate();

    const generateOTP = async () => {
        setAllowed(false);
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/generateOtp`, { email });
        
        if (res && res.data.success && res.data.reason == "") {
            localStorage.setItem("email", email);
            toast.success("OTP generated successfully. Please check your email.");
            navigate('/verifyotp');
        } else if (res && !res.data.success && res.data.reason == "Invalid email") {
            toast.error("Invalid email");
        } else if (res && !res.data.success && res.data.reason == "Failed to send OTP") {
            toast.error("Failed to send OTP. Please try again later.");
        } else {
            toast.error("An unexpected error occurred. Please try again later.");
        }
        setAllowed(true);
    }

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    }

    return (
        <>
        <Toaster/>        
            <div className="flex items-center justify-center h-screen bg-electric-blue">
                <div className="bg-white p-8 rounded-lg shadow-md w-96">
                    <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
                    <div>
                        <span className="mx-3 text-lg">Email</span>
                        <InputBox onInput={handleEmailChange} placeholder={"Email"}/>
                        {allowed ? <SubmitButton onClick={generateOTP} text="Generate OTP" /> : <SubmitButtonDisabled text="Generating OTP..." /> }
                    </div>
                </div>
            </div>
        </>
    );
}