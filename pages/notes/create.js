import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../components/layout'
import TopBar from '../../components/topbar'
import Amplify from 'aws-amplify';
import config from '../../src/aws-exports';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import AddIcon from '@mui/icons-material/Add';
import { API, Storage } from 'aws-amplify';
import { createNote as createNoteMutation } from '../../src/graphql/mutations';
import styles from './create.module.css';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { SUCCESS, INFO, ERROR } from '../../constants';
import Router from 'next/router';

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));
const initialFormState = { name: '', description: '', image: null }

Amplify.configure(config);

export default function About() {
    const [notes, setNotes] = useState([]);
    const [formData, setFormData] = useState(initialFormState);
    const ref = useRef();

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        type: INFO
    });


    async function createNote() {
        try {
            if (!formData.name || !formData.description) return;
            await API.graphql({ query: createNoteMutation, variables: { input: formData } });
            if (formData.image) {
                const image = await Storage.get(formData.image);
                formData.image = image;
            }
            setFormData(initialFormState);
            displaySnackbar(SUCCCES, "Note Created!");
            Router.push('/notes');
        }
        catch {
            displaySnackbar(ERROR, "Something went wrong!")
        }

    }

    function onNameChange(event) {
        setFormData({ ...formData, 'name': event.target.value });
    }
    function onDescriptionChange(event) {
        setFormData({ ...formData, 'description': event.target.value });
    }

    async function onFileChange(e) {
        if (!e.target.files[0]) return
        const file = e.target.files[0];
        setFormData({ ...formData, image: file.name });
        await Storage.put(file.name, file);
    }

    function onCloseSnackbar() {
        setSnackbar({ ...snackbar, open: false });
    }

    function displaySnackbar(type, message) {
        setSnackbar({
            open: true,
            message: message,
            type: type
        });
    }

    return (
        <React.Fragment>
            <Card sx={{
                p: 2,
                margin: 'auto',
                marginTop: '100px',
                maxWidth: 500,
                flexGrow: 1
            }}>
                <CardContent>
                    <Typography component="div" variant="h5" marginBottom={4}>
                        Create a new Note
                    </Typography>
                    <Grid container spacing={4} justifyContent="flex-start" alignItems="center">
                        <FormControl fullWidth sx={{ m: 2 }}>
                            <InputLabel htmlFor="name">Name</InputLabel>
                            <OutlinedInput
                                id="name"
                                label="Name"
                                value={formData.name}
                                onChange={onNameChange}
                                inputProps={{ maxLength: 50 }}
                            />
                        </FormControl>
                        <FormControl fullWidth sx={{ m: 2 }}>
                            <InputLabel htmlFor="description">Description</InputLabel>
                            <OutlinedInput
                                id="description"
                                label="Descripion"
                                multiline
                                rows={4}
                                value={formData.description}
                                onChange={onDescriptionChange}
                            />
                        </FormControl>

                        <Grid container justifyContent="flex-start" sx={{ marginLeft: 2 }} >
                            <Grid item>
                                <Button variant="contained" component="label" color="primary">
                                    {" "}
                                    <AddIcon /> Upload a file
                                    <input type="file" hidden onChange={onFileChange} ref={ref} />
                                </Button>
                                <div className={styles.file__label}>{formData.image}</div>
                            </Grid>
                        </Grid>

                    </Grid>
                </CardContent>
                <CardActions>
                    <Grid container justifyContent="flex-end" >
                        <Grid item>
                            <Button href='/notes'>Go to Notes</Button>
                        </Grid>
                        <Grid item>
                            <Button color="success" variant='contained' onClick={() => createNote()}>Create</Button>
                        </Grid>
                    </Grid>
                </CardActions>
            </Card >
            <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={onCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={onCloseSnackbar} severity={snackbar.type} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </React.Fragment>
    )
}

About.getLayout = function getLayout(page) {
    return (
        <Layout>
            <TopBar />
            {page}
        </Layout>
    )
}
