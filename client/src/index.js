import React from 'react';
import ReactDOM from 'react-dom';
import { createMuiTheme } from '@material-ui/core';
import App from './App';
import { ThemeProvider } from '@material-ui/styles';
import './css/normalize.css';

//Theme
const theme = createMuiTheme({
  typography: {
    h5: {
      fontFamily: 'Pacifico'
    }
  }
});

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <App />
  </ThemeProvider>,
  document.getElementById('root')
);
