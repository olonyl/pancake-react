import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout'
import TopBar from '../../components/topbar'
import Amplify, { Auth } from 'aws-amplify';
import config from '../../src/aws-exports';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import AddIcon from '@mui/icons-material/Add';
import { API, Storage } from 'aws-amplify';
import { createNote as createNoteMutation } from '../../src/graphql/mutations';
import styles from './create.module.css';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { SUCCESS, INFO, ERROR } from '../../constants';
import Router from 'next/router';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

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

const SignupSchema = Yup.object().shape({
    name: Yup.string()
        .min(2, 'Too Short!')
        .max(50, 'Too Long!')
        .required('Required'),
    description: Yup.string()
        .min(2, 'Too Short!')
        .max(200, 'Too Long!')
        .required('Required')
});

Amplify.configure(config);

export default function Create() {
    const [image, setImage] = useState(null);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(false);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        type: INFO
    });


    async function createNote(note) {
        try {
            if (!note.name || !note.description) return;
            setLoading(true);
            await API.graphql({ query: createNoteMutation, variables: { input: { ...note, image, userId } } });
            displaySnackbar(SUCCESS, "Note Created!");
            Router.push('/notes');
        }
        catch (err) {
            displaySnackbar(ERROR, "Something went wrong!")
            setLoading(false);
        }
    }

    async function onFileChange(e) {
        const imageFile = e.target.files[0];

        if (!imageFile) return;
        if (!imageFile.name.match(/\.(jpg|jpeg|png|gif)$/)) return;

        const file = e.target.files[0];
        setImage(file.name);
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

    useEffect(() => {
        Auth.currentUserInfo()
            .then(data => setUserId(data.id))
            .catch(err => console.log(err));
    }, []);

    return (
        <React.Fragment>
            <Formik
                initialValues={{ name: '', description: '' }}
                validationSchema={SignupSchema}
                onSubmit={values => createNote(values)}
            >
                {({ errors, touched, validateField, validateForm }) => (
                    <Form>
                        <Card sx={{
                            p: 2,
                            margin: 'auto',
                            marginTop: '50px',
                            maxWidth: 500,
                            flexGrow: 1
                        }}>
                            <CardContent>
                                <Typography component="div" variant="h5" marginBottom={4}>
                                    Create a new Note
                                </Typography>

                                <Grid container spacing={4} justifyContent="flex-start" alignItems="center">
                                    <FormControl fullWidth sx={{ m: 2 }} error={errors.name && touched.name}>
                                        <InputLabel htmlFor="name">Name</InputLabel>
                                        <Field as={OutlinedInput}
                                            name="name"
                                            label="Name"
                                            inputProps={{ maxLength: 50 }}

                                        />
                                        {errors.name && touched.name ? (
                                            <div>{errors.name}</div>
                                        ) : null}
                                    </FormControl>

                                    <FormControl fullWidth sx={{ m: 2 }} error={errors.description && touched.description}>
                                        <InputLabel htmlFor="description">Description</InputLabel>
                                        <Field as={OutlinedInput}
                                            name="description"
                                            label="Descripion"
                                            multiline
                                            rows={4}
                                        />
                                        {errors.description && touched.description ? (
                                            <div>{errors.description}</div>
                                        ) : null}
                                    </FormControl>

                                    <Grid container justifyContent="flex-start" sx={{ marginLeft: 2 }} >
                                        <Grid item>
                                            <Button variant="contained" component="label" color="primary" >
                                                {" "}
                                                <AddIcon /> Upload a file
                                                <input type="file" hidden onChange={onFileChange} accept="image/*" />
                                            </Button>
                                            <div className={styles.file__label}>{image}</div>
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
                                        <Button color="success" variant='contained' type="submit" disabled={loading}>Create</Button>
                                    </Grid>
                                </Grid>
                            </CardActions>
                        </Card >
                    </Form>
                )}
            </Formik>
            <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={onCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={onCloseSnackbar} severity={snackbar.type} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </React.Fragment>
    )
}

Create.getLayout = function getLayout(page) {
    return (
        <Layout>
            <TopBar />
            {page}
        </Layout>
    )
}
