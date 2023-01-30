import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { cognitoLink, apiUrl } from "../config/config";
import axios from "axios";
import { TextField, Button, Stack } from "@mui/material";

const Home = () => {
    const location = useLocation();

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState('');

    useEffect(() => {
        //Fetching ID token from url returned from cognito since the cognito hosted UI redirects to home page after authentication
        let id_token = '';
        if (location.hash !== '') {
            id_token = new URL(window.location).hash.split('&').filter(function(el) { if(el.match('id_token') !== null) return true; })[0].split('=')[1];
            localStorage.setItem('authToken', id_token);
        }

        // Checking if authorized or not
        setToken(localStorage.getItem('authToken'));
        axios.get(`${apiUrl}/items`, {headers : {Authorization : localStorage.getItem('authToken')}}).then(response => {
            setIsLoggedIn(true);
        }).catch((res) => {
            setIsLoggedIn(false);
        });
    }, []);

    return (
        <>
            {isLoggedIn ? <InsertItemForm /> : <a href={cognitoLink}>Login</a> }
        </>
    )
}

const InsertItemForm = () => {

    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState();
    const [quantity, setQuantity] = useState();
    const [category, setCategory] = useState('');

    const handleInsertItemSubmit = event => {
        event.preventDefault();
        axios.put(`${apiUrl}/items`, {id, name, description, price, quantity, category}, {headers : {Authorization : localStorage.getItem('authToken')}}).then(response => {
            console.log(response);
        })
    }

    return (
        <div id="form_div">
            <form onSubmit={handleInsertItemSubmit}>
                <Stack width={400} spacing={2} >
                    <TextField label="Enter Id" variant="outlined" type='text' size="small" value={id} onChange={e => setId(e.target.value)} />
                    <TextField label="Enter name" variant="outlined" type='text' size="small" value={name} onChange={e => setName(e.target.value)} />
                    <TextField label="Enter description" variant="outlined" type='text' size="small" value={description} onChange={e => setDescription(e.target.value)} />
                    <TextField label="Enter price" variant="outlined" type='number' size="small" value={price} onChange={e => setPrice(e.target.value)} />
                    <TextField label="Enter quantity" variant="outlined" type='number' size="small" value={quantity} onChange={e => setQuantity(e.target.value)} />
                    <TextField label="Enter Category" variant="outlined" type='text' size="small" value={category} onChange={e => setCategory(e.target.value)} />
                    <Button variant="contained" type='submit' >Submit</Button>
                </Stack>
            </form>
        </div>
    );
}

export default Home;
