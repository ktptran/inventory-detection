import React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { LineChart } from '@mui/x-charts/LineChart';
import { DataGrid } from '@mui/x-data-grid';
import Refrigerator from '../assets/refrigerator-door.jpeg';

function Inventory() {
  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <div style={{ padding: '20px' }}>
          <Description />
          <CurrentImage />
        </div>
      </Grid>
      <Grid item xs={6}>
        <Box sx={{ s: 2 }}>
          <DataTable />
        </Box>
        <Box>
          <SimpleLineChart />
        </Box>
      </Grid>
    </Grid>
  );
}

function CurrentImage() {
  return (
    <div>
      <h3>Latest Photo</h3>
      <img src={Refrigerator} alt="latest-photo" />
    </div>
  );
}

function Description() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Inventory</h2>
      <p>This graph shows you the history of all three fruits.</p>
      <p>To look at one individually, select the corresponding ID.</p>
      <p>Selecting a bubble on the graph will allow an image to appear of the associated image.</p>
    </div>
  );
}

const columns = [
  { field: 'id', headerName: 'ID' },
  { field: 'fruit', headerName: 'fruit' },
  { field: 'count', headerName: 'count' },
];

const rows = [
  { id: 1, fruit: 'orange', count: 35 },
  { id: 2, fruit: 'apple', count: 42 },
  { id: 3, fruit: 'banana', count: 45 },
];

function DataTable() {
  return (
    <div style={{ height: '300px', width: '500px' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10]}
        checkboxSelection
      />
    </div>
  );
}
const uData = [4000, 3000, 2000, 2780, 1890, 2390, 3490];
const pData = [2400, 1398, 9800, 3908, 4800, 3800, 4300];
const xLabels = ['Page A', 'Page B', 'Page C', 'Page D', 'Page E', 'Page F', 'Page G'];

function SimpleLineChart() {
  return (
    <LineChart
      width={500}
      height={300}
      series={[
        { data: pData, label: 'pv' },
        { data: uData, label: 'uv' },
      ]}
      xAxis={[{ scaleType: 'point', data: xLabels }]}
    />
  );
}

export default Inventory;
