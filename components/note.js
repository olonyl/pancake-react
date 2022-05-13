import * as React from "react";
import { styled } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import ButtonBase from "@mui/material/ButtonBase";
import InsertPhotoOutlinedIcon from '@mui/icons-material/InsertPhotoOutlined';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';

const Img = styled("img")({
    margin: "auto",
    display: "block",
    maxWidth: "100%",
    maxHeight: "100%"
});

export default function ComplexGrid(props) {
    const { note, onDelete } = props;

    function renderImage() {
        if (note.image) {
            return <Img alt="complex" src={note.image} />
        } else {
            return <InsertPhotoOutlinedIcon sx={{ display: { xs: 'none', md: 'flex', color: 'grey', fontSize: '50px' } }} />
        }
    }

    return (
        <Paper
            sx={{
                p: 2,
                margin: "auto",
                maxWidth: 500,
                flexGrow: 1,
                backgroundColor: (theme) =>
                    theme.palette.mode === "dark" ? "#1A2027" : "#fff"

            }}
        >
            <Grid container spacing={2}>
                <Grid item>
                    <Avatar sx={{ width: 128, height: 128 }}>
                        {renderImage()}
                    </Avatar>
                </Grid>
                <Grid item xs={12} sm container>
                    <Grid item xs container direction="column" spacing={2}>
                        <Grid item xs>
                            <Typography gutterBottom variant="subtitle1" component="div">
                                {note.name}
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                {note.description}
                            </Typography>
                        </Grid>
                        <Grid container justifyContent="center" >
                            <Grid item>
                                <Button href={`/notes/${note.id}`}>View</Button>
                            </Grid>
                            <Grid item>
                                <Button color="error" onClick={() => onDelete()}>Remove</Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Paper >
    );
}
