import axios from "axios";
import { type ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAccessToken, setAccessToken } from "../utils/TokenStore";
import { refresh } from "../utils/api";

interface AuthInitializerProps {
  children: ReactNode;
}

export const AuthInitializer = ({ children }: AuthInitializerProps) => {
    const navigate = useNavigate()
  
    useEffect(() => {
        const initAuth = async () => {
            const token = getAccessToken();

            if (!token) {
                try {
                    const res = await refresh()
                    setAccessToken(res);
                } catch (err){
                    navigate('/login')
                }
            }
        };

        initAuth();
    }, [navigate]);

    return children
}