import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

const Footer = () => {
  return (
    <Paper
      sx={{
        marginTop: 'calc(10% + 60px)',
        width: '100%',
        position: 'fixed',
        bottom: 0,
        background: '#1876d2',
      }}
      component="footer"
      square
      variant="outlined"
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            flexGrow: 1,
            justifyContent: 'center',
            display: 'flex',
            padding: '10px',
          }}
        >
          <Typography variant="caption" color="initial" sx={{ color: 'white' }}>
            KTPTRAN LLC © 2024
          </Typography>
        </Box>
      </Container>
    </Paper>
  );
};

export default Footer;
