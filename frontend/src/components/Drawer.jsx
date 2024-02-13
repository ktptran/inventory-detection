import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

function MuiDrawer({ isDrawerOpen, setIsDrawerOpen }) {
  return (
    <>
      <Drawer anchor="left" open={isDrawerOpen}>
        <Box
          width="200px"
          pt={2}
          sx={{ textAlign: 'center', display: 'flex', justifyContent: 'right' }}
          role="presentation"
        >
          <Box width="50px" onClick={() => setIsDrawerOpen(false)}>
            <ArrowBackIosIcon />
          </Box>
        </Box>
        <Box pt={2} paddingBottom={2}>
          <Divider />
        </Box>
        {/* Routing */}
        <Button color="inherit" href="/home">
          Home
        </Button>
        <Button color="inherit" href="/inventory">
          Inventory
        </Button>
      </Drawer>
    </>
  );
}

export default MuiDrawer;
