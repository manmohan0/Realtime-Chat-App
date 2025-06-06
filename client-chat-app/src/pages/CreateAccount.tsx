import { useEffect, useState } from "react";
import { SubmitButton } from "../components/SubmitButton";
import { InputBox } from "../components/InputBox";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SubmitButtonDisabled from "../components/SubmitButtonDisabled";
import Cookies from "js-cookie";

export function CreateAccount () {

    const [name, setName] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [allowed, setAllowed] = useState<boolean>(false);
    const [email] = useState<string>(localStorage.getItem("email") || "");

    const navigate = useNavigate()

    useEffect(() => {
        if (!email) {
            navigate('/login');
        }
    }, [email, navigate]);

    const getDetails = async () => {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/createAccount`, { email, name, username });
        
        if (res && res.data.success && res.data.reason === "") {
            Cookies.set("token", res.data.token);
            toast.success("Account created successfully.");
            navigate('/');
        } else if (res && !res.data.success) {
            toast.error(res.data.reason || "An unexpected error occurred. Please try again later.");
        } else {
            toast.error("An unexpected error occurred. Please try again later.");
        }
    }

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    }

    const handleUserNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/check/Username`, { username: e.target.value });
        if (res && res.data.success) {
            setAllowed(true);
            setUsername(e.target.value);
        } else if (res && !res.data.success) {
            toast.error("Username is already taken. Please choose another one.");
        }
    }

    return (
        <>
            <Toaster/>        
            <div className="flex items-center justify-center h-screen bg-electric-blue">
                <div className="bg-white p-8 rounded-lg shadow-md w-96">
                    <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
                    <div>
                        <span className="mx-3 text-lg">Name</span>
                        <InputBox onInput={handleNameChange} placeholder={"ABC XYZ"}/>
                        <span className="mx-3 text-lg">Username</span>
                        <InputBox onInput={handleUserNameChange} placeholder={"ABC_XYZ"}/>
                        {allowed ? <SubmitButton onClick={getDetails} text="Submit" /> : <SubmitButtonDisabled text="Submit" /> }
                    </div>
                </div>
            </div>
        </>
    );
}