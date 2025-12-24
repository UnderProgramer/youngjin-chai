import axios from "axios";
import { getAccessToken, setAccessToken } from "./TokenStore";
import type { LoginDTO } from "../types/LoginDTO";
import type { RegisterDTO } from "../types/RegisterDTO";

export const api = axios.create({
    baseURL: "http://localhost:3333",
    withCredentials: true,
})

api.interceptors.request.use((config) => {
    const token = getAccessToken();
    if(token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export const login = async (data: LoginDTO) => {
    const res = await api.post("/login",{
        email: data.email,
        password: data.password
    })

    console.log(res)
    setAccessToken(res.data.access_token);
    return res.status
}

export const register = async (data: RegisterDTO) => {
    const res = await api.post("/register",{
        username: data.username,
        email: data.email,
        password: data.password
    })

    return res
}

export const refresh = async () => {
    const res = (await api.post("/refresh",
        {},
        {withCredentials: true}
    ))

    return res.data.access_token
}