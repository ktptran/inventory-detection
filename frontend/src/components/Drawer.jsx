import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { Link } from 'react-router-dom';

const linkStyle = {
  textDecoration: 'none',
  color: 'black',
};

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
        <Button color="inherit" onClick={() => setIsDrawerOpen(false)}>
          <Link to="/home" style={linkStyle}>
            Home
          </Link>
        </Button>
        <Button color="inherit" onClick={() => setIsDrawerOpen(false)}>
          <Link to="/inventory" style={linkStyle}>
            Inventory
          </Link>
        </Button>
      </Drawer>
    </>
  );
}

export default MuiDrawer;
