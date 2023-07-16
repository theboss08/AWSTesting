import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { cognitoLink, apiUrl } from "../config/config";
import axios from "axios";
import { TextField, Button, Stack } from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';

const Home = () => {
    const location = useLocation();

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState('');

    useEffect(() => {
        //Fetching ID token from url returned from cognito since the cognito hosted UI redirects to home page after authentication
        let id_token = '';
        let access_token = '';
        if (location.hash !== '') {
            id_token = new URL(window.location).hash.split('&').filter(function(el) { if(el.match('id_token') !== null) return true; })[0].split('=')[1];
            access_token = new URL(window.location).hash.split('&').filter(function(el) { if(el.match('access_token') !== null) return true; })[0].split('=')[1];
            localStorage.setItem('authToken', id_token);
            localStorage.setItem('access_token', access_token);
        }

        // Checking if authorized or not
        setToken(localStorage.getItem('authToken'));
        axios.get(`${apiUrl}/items`, {headers : {Authorization : localStorage.getItem('authToken'), 'X-Amz-Security-Token' : localStorage.getItem('access_token')}}).then(response => {
            setIsLoggedIn(true);
        }).catch((res) => {
            setIsLoggedIn(false);
        });
    }, []);

    return (
        <>
            {isLoggedIn ? <Dashboard /> : <a href={cognitoLink}>Login</a> }
        </>
    )
}

const Dashboard = () => {
    return (
        <>
            <ItemsTable />
            <InsertItemForm />
        </>
    )
}
  
const ItemsTable = () => {

    const [items, setItems] = useState([]);
    const [lastEvaluated, setLastEvaluated] = useState({isPresent : false});

    useEffect(() => {
        axios.get(`${apiUrl}/items`, {headers : {Authorization : localStorage.getItem('authToken'), 'X-Amz-Security-Token' : localStorage.getItem('access_token')}}).then(response => {
                setItems([...response.data.Items]);
                if("LastEvaluatedKey" in response.data) {
                    setLastEvaluated({...response.data.LastEvaluatedKey, isPresent : true});
                }
                else {
                    setLastEvaluated({isPresent : false});
                }
            }).catch((res) => {
                console.log('error fetching items');
            });
    }, []);

    const fetchMoreItems = () => {
        axios.get(`${apiUrl}/items?lastEvaluatedKey=${lastEvaluated.id}`, {headers : {Authorization : localStorage.getItem('authToken'), 'X-Amz-Security-Token' : localStorage.getItem('access_token')}}).then(response => {
            setItems([...items, ...response.data.Items]);
            if("LastEvaluatedKey" in response.data) {
                setLastEvaluated({isPresent : true, ...response.data.LastEvaluatedKey});
            }
            else {
                setLastEvaluated({isPresent : false});
            }
        }).catch((res) => {
            console.log('error fetching items');
        });
    }

    const columns = [
        { field: 'name', headerName: 'Name', width : 200 },
        { field: 'description', headerName: 'Description', sortable : false, width : 200},
        {
          field: 'price',
          headerName: 'Price',
          type: 'number', width : 200
        },
        {
            field: 'quantity',
            headerName: 'Quantity',
            type: 'number', width : 200
        },
        {
            field: 'category',
            headerName: 'Category', width : 200
        },
      ];

    return (
    <div style={{ height: 371, width: '70%', margin: "auto", padding: "1rem" }}>
        <h1>My Items</h1>
        <DataGrid
        rows={items}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        />
        {lastEvaluated.isPresent ? <Button style={{float: "right", marginTop: "1rem"}} onClick={fetchMoreItems} variant="outlined">Fetch More</Button> : ''}
    </div>
    );
}

const InsertItemForm = () => {

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState(0);
    const [quantity, setQuantity] = useState(0);
    const [category, setCategory] = useState('');

    const handleInsertItemSubmit = event => {
        event.preventDefault();
        axios.put(`${apiUrl}/items`, {name, description, price, quantity, category}, {headers : {Authorization : localStorage.getItem('authToken'), 'X-Amz-Security-Token' : localStorage.getItem('access_token')}}).then(response => {
            setName('');
            setDescription('');
            setPrice(0);
            setQuantity(0);
            setCategory('');
        })
    }

    return (
        <div id="form_div">
            <h1>Add more ...</h1>
            <form onSubmit={handleInsertItemSubmit}>
                <Stack width={400} spacing={2} >
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
