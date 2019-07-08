import React, { Component } from 'react';
import {
  Card,
  CardContent,
  Typography,
  createStyles,
  withStyles,
  Grid
} from '@material-ui/core';
import bg from './img/bg.png';

const styles = createStyles({
  app: {
    backgroundImage: `url(${bg})`,
    height: '100vh',
    backgroundSize: 'cover',
    overflowX: 'hidden',
    overflowY: 'hidden'
  },
  container: {
    height: '100vh'
  },
  inviteMsg: {
    marginTop: 20
  },
  inviteLink: {
    color: 'inherit',
    textDecoration: 'none'
  }
});

class App extends Component {
  render() {
    const { classes } = this.props;

    return (
      <div className={classes.app}>
        <Grid
          container
          spacing={3}
          direction="row"
          justify="center"
          alignItems="center"
          className={classes.container}
        >
          <Grid item xs={10} md={6} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Welcome!
                </Typography>
                <Typography variant="body2">
                  It seems you've stumbled upon Kādo Bot but unfortunately, Kādo
                  Bot is currently under Beta testing and limited to Aldovia
                  server. But hey! You can just join Aldovia and test out Kādo
                  Bot right now!
                </Typography>
                <Typography className={classes.inviteMsg} color="textSecondary">
                  Cya in Aldovia:{' '}
                  <b>
                    <a
                      className={classes.inviteLink}
                      href="https://discord.gg/JGsgBsN"
                    >
                      https://discord.gg/JGsgBsN
                    </a>
                  </b>
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withStyles(styles)(App);
