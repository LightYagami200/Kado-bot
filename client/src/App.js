import React, { Component } from 'react';
import {
  Card,
  CardContent,
  Typography,
  createStyles,
  withStyles,
  Grid,
  Button
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
  btns: {
    marginTop: 20
  },
  inviteBtn: {
    marginLeft: 10
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
                <Typography variant="body2" gutterBottom>
                  Kado Bot is a card collecting/dueling bot that allows players
                  to collect anime related cards then duel with other players
                  and climb through the leagues.
                </Typography>
                <Typography color="textSecondary">
                  Type $guide to view usage and further details
                </Typography>
                <Grid item className={classes.btns}>
                  <Button
                    variant="contained"
                    color="primary"
                    href="https://discordapp.com/api/oauth2/authorize?client_id=582271366619725855&permissions=281664&scope=bot"
                  >
                    Invite Bot
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    className={classes.inviteBtn}
                    href="https://discord.gg/JGsgBsN"
                  >
                    Join Aldovia
                  </Button>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withStyles(styles)(App);
