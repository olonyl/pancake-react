import styles from '../../styles/Home.module.css'
import { API, Storage } from 'aws-amplify';
import React, { useState, useEffect, useRef } from 'react';
import { listNotes } from '../../src/graphql/queries';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from '../../src/graphql/mutations';
import Note from '../../components/note'
import Grid from "@mui/material/Grid";
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import ConfirmationDialog from '../../components/confirmationDialog';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const initialFormState = { name: '', description: '' }
const SUCCESS = "success";
const ERROR = "error";
const INFO = "info";

const fabStyle = {
    position: 'absolute',
    bottom: 16,
    right: 16,
};

export default function Notes() {
    const [notes, setNotes] = useState([]);
    const [showDialog, setShowDialog] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarType, setSnackbarType] = useState(INFO);
    const [formData, setFormData] = useState(initialFormState);
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

    async function createNote() {
        if (!formData.name || !formData.description) return;
        await API.graphql({ query: createNoteMutation, variables: { input: formData } });
        if (formData.image) {
            const image = await Storage.get(formData.image);
            formData.image = image;
        }
        setNotes([...notes, formData]);
        setFormData(initialFormState);
        ref.current.value = "";
    }
    function displaySnackbar(type, message) {
        setSnackbarMessage(message);
        setSnackbarType(type);
        setOpenSnackbar(true);
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

    async function onChange(e) {
        if (!e.target.files[0]) return
        const file = e.target.files[0];
        setFormData({ ...formData, image: file.name });
        await Storage.put(file.name, file);
        fetchNotes();
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
        setOpenSnackbar(false);
    }

    return (
        <div className={styles.container}>
            <h1>My Notes App</h1>
            <input
                onChange={e => setFormData({ ...formData, 'name': e.target.value })}
                placeholder="Note name"
                value={formData.name}
            />
            <input
                onChange={e => setFormData({ ...formData, 'description': e.target.value })}
                placeholder="Note description"
                value={formData.description}
            />
            <input
                type="file"
                onChange={onChange}
                ref={ref}
            />
            <button onClick={createNote}>Create Note</button>
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
            <Snackbar open={openSnackbar} autoHideDuration={2000} onClose={onCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={onCloseSnackbar} severity={snackbarType} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    )
}
