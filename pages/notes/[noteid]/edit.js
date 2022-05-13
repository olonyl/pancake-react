import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../../components/layout';
import TopBar from '../../../components/topbar';
import Amplify, { Auth } from 'aws-amplify';
import config from '../../../src/aws-exports';
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
import MuiAlert from '@mui/material/Alert';
import { useRouter } from 'next/router'
import { getNote } from '../../../src/graphql/queries';
import { API, Storage } from 'aws-amplify';
import HideImageIcon from '@mui/icons-material/HideImage';
import Snackbar from '@mui/material/Snackbar';
import { SUCCESS, INFO, ERROR } from '../../../constants';
import AddIcon from '@mui/icons-material/Add';
import styles from './edit.module.css';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { updateNote as updateNoteMutation } from '../../../src/graphql/mutations';
import Router from 'next/router';

const Img = styled("img")({
    margin: "auto",
    display: "block",
    maxWidth: "100%",
    maxHeight: "100%"
});

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

export default function Edit() {
    const [note, setNote] = useState({ name: '', description: '' });
    const router = useRouter()
    const { noteid } = router.query;
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState(null);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        type: INFO
    });

    useEffect(() => {
        if (!noteid) return;
        fetchNote(noteid);
    }, [noteid]);

    useEffect(() => {
        Auth.currentUserInfo()
            .then(data => setUserId(data.id))
            .catch(err => console.log(err));
    }, []);

    async function fetchNote(noteId) {
        const apiData = await API.graphql({ query: getNote, variables: { id: noteId } });
        var note = apiData.data.getNote;

        if (note.image) {
            const image = await Storage.get(note.image);
            setNote({ ...note, imageURL: image });
        }
    }

    function renderImage() {
        if (note.imageURL) {
            return <Img alt="complex" src={note.imageURL} width='150px' sx={{ marginTop: 2 }} />
        } else {
            return <HideImageIcon sx={{ display: { xs: 'none', md: 'flex', color: 'grey', fontSize: '50px', margin: 'auto' } }} />
        }
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

    async function saveChanges(modifiedNote) {
        try {
            var { id, image } = note;

            console.log({ id, ...modifiedNote, userId, image })

            if (!note.name || !note.description) return;
            setLoading(true);
            await API.graphql({ query: updateNoteMutation, variables: { input: { id, ...modifiedNote, userId, image } } });
            displaySnackbar(SUCCESS, "Note Updated!");
            Router.push('/notes');
        }
        catch (err) {
            console.log(err);
            displaySnackbar(ERROR, "Something went wrong!")
            setLoading(false);
        }
    }

    async function onFileChange(e) {
        const imageFile = e.target.files[0];

        if (!imageFile) return;
        if (!imageFile.name.match(/\.(jpg|jpeg|png|gif)$/)) return;

        const file = e.target.files[0];
        setNote({ ...note, image: file.name });
        await Storage.put(file.name, file);
    }

    return (

        <React.Fragment>
            <Formik
                initialValues={{ name: note.name, description: note.description }}
                validationSchema={SignupSchema}
                enableReinitialize
                onSubmit={values => saveChanges(values)}
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
                                    {note.description}
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
                                            <div className={styles.file__label}>{note.image}</div>
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
                                        <Button color="success" variant='contained' type="submit" disabled={loading}>Save Changes</Button>
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
        </React.Fragment >
    )
}

Edit.getLayout = function getLayout(page) {
    return (
        <Layout>
            <TopBar />
            {page}
        </Layout>
    )
}
