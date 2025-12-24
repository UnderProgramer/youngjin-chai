import { useState, useEffect } from "react"
import { login } from "../utils/api"
import { getAccessToken } from "../utils/TokenStore";
import { useNavigate } from "react-router-dom";

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate()

    const handleLogin = async () => {
        try{
            const status = await login({email, password})
            if(status === 200){
                navigate('/')
            }
        }catch (err){
            console.error("[-] handleLogin [ERROR] :" + err)
        }
    }


    return (
        <>
            <div>
                email    <input value={email} onChange={(e) => setEmail(e.target.value)}/>
                <br/>
                password <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                <br />
                <button onClick={handleLogin}>로그인</button>
            </div>

        </>
    )
}