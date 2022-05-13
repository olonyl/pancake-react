import React, { useState, useEffect, useRef } from 'react';
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
import MuiAlert from '@mui/material/Alert';
import { useRouter } from 'next/router'
import { getNote } from '../../src/graphql/queries';
import { API, Storage } from 'aws-amplify';
import HideImageIcon from '@mui/icons-material/HideImage';

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

Amplify.configure(config);

export default function View() {
    const [note, setNote] = useState({ name: '', description: '' });
    const router = useRouter()
    const { noteid } = router.query;

    useEffect(() => {
        if (!noteid) return;
        fetchNote(noteid);
    }, [noteid]);

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
    return (
        <React.Fragment>

            <Card sx={{
                p: 2,
                margin: 'auto',
                marginTop: '50px',
                maxWidth: 500,
                flexGrow: 1
            }}>
                <CardContent>
                    <Typography component="div" variant="h5" marginBottom={4}>
                        View Note
                    </Typography>

                    <Grid container spacing={4} justifyContent="flex-start" alignItems="center">
                        <FormControl fullWidth sx={{ m: 2 }} >
                            <InputLabel htmlFor="name">Name</InputLabel>
                            <OutlinedInput
                                name="name"
                                label="Name"
                                inputProps={{ maxLength: 50 }}
                                disabled
                                value={note.name}
                            />
                        </FormControl>

                        <FormControl fullWidth sx={{ m: 2 }} >
                            <InputLabel htmlFor="description">Description</InputLabel>
                            <OutlinedInput
                                name="description"
                                label="Descripion"
                                multiline
                                rows={4}
                                disabled
                                value={note.description}
                            />
                        </FormControl>
                        <Grid container justifyContent="flex-center" sx={{ marginLeft: 2 }} >
                            <Grid container spacing={2}>
                                {renderImage()}
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
                            <Button color="success" variant='outlined' type="submit" href={`/notes/${noteid}/edit`}>Edit</Button>
                        </Grid>
                    </Grid>
                </CardActions>
            </Card >
        </React.Fragment>
    )
}

View.getLayout = function getLayout(page) {
    return (
        <Layout>
            <TopBar />
            {page}
        </Layout>
    )
}
