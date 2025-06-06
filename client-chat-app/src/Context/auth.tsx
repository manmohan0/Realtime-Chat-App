"use client"
import type { AuthContextType } from "../types";
import type { User } from "../types";
import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode"
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie"

export const AuthContext = createContext<AuthContextType>({
    user: null,
    setUser: () => { },
    fetchData: async () => { },
    loading: true,
    logout: async () => { }
})

export const AuthProvider = ({ children } : { children : React.ReactNode}) => {
    
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const navigate = useNavigate()

    async function fetchData() {
        const token = Cookies.get("token")
        
        if (!token) {
            setUser(null)
            navigate("/login")
            return
        }
        
        const user = jwtDecode<User>(token ?? "")
        
        if (user) {
            setUser(user)
        } else {
            setUser(null)
            return
        }
    }

    
    async function logout() {
        Cookies.remove("token")
        setUser(null)
        navigate("/login")
    }

    useEffect(() => {
        (async () => {
            setLoading(true)
            await fetchData()    
            setLoading(false)   
        })()
    }, [])

    return <AuthContext.Provider value={{ user, setUser, loading, fetchData, logout }}>
        { children }
    </AuthContext.Provider>
}

export const useAuth = () => {
    const authContext = useContext(AuthContext)
    return authContext
}