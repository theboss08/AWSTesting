import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { cognitoLink, apiUrl } from "../config/config";
import axios from "axios";

const Home = () => {
    const location = useLocation();
    const axiosConfig = {
        headers : {
            Authorization : "ABCD"
        }
    }

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState('');

    useEffect(() => {
        let access_token = '';
        localStorage.setItem('authToken', access_token);

        // Checking if authorized or not
        setToken(localStorage.getItem('authToken'));
        console.log('token = ', access_token)
        axios.get(`${apiUrl}/items`).then(response => {
            setIsLoggedIn(true);
            console.log(response);
        }).catch((res) => {
            if (res.response.data.message === 'Unauthorized') {
                setIsLoggedIn(false);
            }
        })
    }, []);

    return (
        <>
            {isLoggedIn ? <h1>Logged In</h1> : <a href={cognitoLink}>Login</a> }
        </>
    )
}

export default Home;
