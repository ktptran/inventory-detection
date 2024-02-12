import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

function MuiDrawer({ isDrawerOpen, setIsDrawerOpen }) {
  return (
    <>
      <Drawer anchor="left" open={isDrawerOpen}>
        <Box
          width="250px"
          pt={2}
          sx={{ textAlign: 'center', display: 'flex', justifyContent: 'left' }}
          role="presentation"
        >
          <Box width="50px" onClick={() => setIsDrawerOpen(false)}>
            <ArrowBackIosIcon />
          </Box>

          <Typography variant="h5" component="div">
            Side Panel
          </Typography>
        </Box>
        <Box pt={2} paddingBottom={2}>
          <Divider />
        </Box>
        {/* Routing */}
        <Button color="inherit" href="/">
          Home
        </Button>
        <Button color="inherit" href="/about">
          About
        </Button>
      </Drawer>
    </>
  );
}

export default MuiDrawer;
