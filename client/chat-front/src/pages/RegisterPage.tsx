import { useState } from "react"
import { login, register } from "../utils/api"

export const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('')
    const [error, setError] = useState('');

    const handleRegister = async () => {
        try{
            await register({username, email, password})
        }catch (err){
            console.error("[-] handleRegister [ERROR] :" + err)
        }
    }

    return (
        <>
            <div>
                email    <input value={email} onChange={(e) => setEmail(e.target.value)}/>
                password <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                username <input value={username} onChange={(e) => setUsername(e.target.value)} />
                <button onClick={handleRegister}>계정 생성</button>
            </div>

        </>
    )
}