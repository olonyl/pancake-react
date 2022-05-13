import styles from '../styles/Home.module.css';
import { API, Storage } from 'aws-amplify';
import React, { useState, useEffect, useRef } from 'react';
import { listNotes } from '../src/graphql/queries';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from '../src/graphql/mutations';
import Note from '../components/note'
import Grid from "@mui/material/Grid";
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import ConfirmationDialog from '../components/confirmationDialog';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Amplify from 'aws-amplify';
import config from '../src/aws-exports';
import Layout from '../components/layout';
import TopBar from '../components/topbar';
import { SUCCESS, INFO, ERROR } from '../constants';

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const fabStyle = {
    position: 'absolute',
    bottom: 16,
    right: 16,
};

Amplify.configure(config);

export default function Notes() {
    const [notes, setNotes] = useState([]);
    const [showDialog, setShowDialog] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        type: INFO
    });
    const [idToDelete, setIdToDelete] = useState(null);
    const ref = useRef();

    useEffect(() => {
        fetchNotes();
    }, []);

    async function fetchNotes() {
        const apiData = await API.graphql({ query: listNotes });
        const notesFromAPI = apiData.data.listNotes.items;
        await Promise.all(notesFromAPI.map(async note => {
            if (note.image) {
                const image = await Storage.get(note.image);
                note.image = image;
            }
            return note;
        }))
        setNotes(apiData.data.listNotes.items);
    }

    function displaySnackbar(type, message) {
        setSnackbar({
            open: true,
            message: message,
            type: type
        });
    }

    async function deleteNote(id) {
        try {
            const newNotesArray = notes.filter(note => note.id !== id);
            setNotes(newNotesArray);
            setIdToDelete(null);
            setShowDialog(false);
            await API.graphql({ query: deleteNoteMutation, variables: { input: { id } } });
            displaySnackbar(SUCCESS, "Note deleted!")
        }
        catch (err) {
            displaySnackbar(ERROR, "Something went wrong");
        }
    }

    function onDeleteNote(note) {
        setShowDialog(true);
        setIdToDelete(note.id);
    }

    function onConfirmDelete() {
        deleteNote(idToDelete);
    }

    function onCancelDelete() {
        setShowDialog(false);
        setIdToDelete(null);
    }

    function onCloseSnackbar() {
        setSnackbar({ ...snackbar, open: false });
    }

    return (
        <div className={styles.container}>
            <h1>My Notes App</h1>
            <Grid container spacing={5}>
                {
                    notes.map(note => (
                        <Grid item md={4}>
                            <Note note={note} onDelete={() => onDeleteNote(note)} />
                        </Grid>
                    ))
                }
            </Grid>
            <Fab sx={fabStyle} aria-label='Add' color='primary' href='/notes/create'>
                <AddIcon />
            </Fab>
            <ConfirmationDialog open={showDialog} onConfirm={onConfirmDelete} onCancel={onCancelDelete} title="Delete Note" />
            <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={onCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={onCloseSnackbar} severity={snackbar.type} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div>
    )
}

Notes.getLayout = function getLayout(page) {
    return (
        <Layout>
            <TopBar />
            {page}
        </Layout>
    )
}
