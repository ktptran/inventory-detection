import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import Refrigerator from '../assets/example_image.jpg';

const rows = [
  { name: 'Banana', count: 1 },
  { name: 'Apple', count: 2 },
  { name: 'Orange', count: 3 },
];

function Inventory() {
  const [data, setData] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  useEffect(() => {
    // TODO: Backend function to pull in data
    const initialData = [
      {
        name: '15:00',
        orange: 4,
        banana: 2,
        apple: 2,
      },
      {
        name: '16:00',
        orange: 3,
        banana: 1,
        apple: 2,
      },
      {
        name: '17:00',
        orange: 2,
        banana: 9,
        apple: 2,
      },
      {
        name: '18:00',
        orange: 2,
        banana: 3,
        apple: 2,
      },
      {
        name: '19:00',
        orange: 1,
        banana: 4,
        apple: 2,
      },
      {
        name: '20:00',
        orange: 2,
        banana: 3,
        apple: 2,
      },
      {
        name: '21:00',
        orange: 3,
        banana: 4,
        apple: 2,
      },
    ];
    setData(initialData);
    setSelectedTime(initialData);
  }, [data]);

  return (
    <Grid container spacing={2}>
      {data && <Description data={data} />}
      <Grid item xs={1}></Grid>
      {data && <Photo selectedTime={selectedTime} data={data} />}
    </Grid>
  );
}

function Description({ data }) {
  return (
    <Grid item xs={5}>
      <div style={{ paddingLeft: '50px' }}>
        <h2>Inventory</h2>
        <p>This page includes a photo, table, and graph.</p>
        <p>
          Selecting a bubble on the graph at a specific timeframe will update both the table and photo with the details
          at that time.
        </p>
      </div>
      <div style={{ padding: '20px' }}>
        <LineChart width={500} height={300} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="apple" stroke="blue" />
          <Line type="monotone" dataKey="orange" stroke="green" />
          <Line type="monotone" dataKey="banana" stroke="red" />
        </LineChart>
      </div>
    </Grid>
  );
}

function Photo({ selectedTime, data }) {
  const [photoLabel, setPhotoLabel] = useState('Latest Entry');

  return (
    <Grid item xs={6}>
      <div>
        <h2>{photoLabel}</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingRight: '50px' }}>
          <DataTable data={data} selectedTime={selectedTime} />
          <img src={Refrigerator} alt="latest" style={{ width: '200px', height: '400px' }} />
        </div>
      </div>
    </Grid>
  );
}

function DataTable({ data, selectedTime }) {
  return (
    <TableContainer component={Paper} style={{ width: '450px' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Fruit</TableCell>
            <TableCell align="right">Count</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.name}>
              <TableCell component="th" scope="row">
                {row.name}
              </TableCell>
              <TableCell align="right">{row.count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default Inventory;
