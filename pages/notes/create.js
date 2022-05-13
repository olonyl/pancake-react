import React from 'react';
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

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

Amplify.configure(config);

export default function About() {
    return (

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
                    <Grid item >
                        <TextField id="outlined-search" label="Name" type="search" />
                    </Grid>
                    <Grid item >
                        <TextField id="outlined-basic" label="Description" variant="outlined" multiline rows={4} />
                    </Grid>
                    <Grid item >
                        <TextField id="outlined-basic" label="Outlined" variant="outlined" />
                    </Grid>
                </Grid>
            </CardContent>
            <CardActions>
                <Grid container justifyContent="flex-end" >
                    <Grid item>
                        <Button href='/notes'>Cancel</Button>
                    </Grid>
                    <Grid item>
                        <Button color="success">Create</Button>
                    </Grid>
                </Grid>
            </CardActions>
        </Card >
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
