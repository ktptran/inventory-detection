import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import Refrigerator from '../assets/example_image.jpg';

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
const latestEntry = [
  { name: 'Banana', count: 1 },
  { name: 'Apple', count: 2 },
  { name: 'Orange', count: 3 },
];

function Inventory() {
  const [data, setData] = useState(null);

  // Latest values
  const [entryValue, setEntryValue] = useState(null);
  const [entryLabel, setEntryLabel] = useState('Latest Entry');

  const updateSelectedData = (e) => {
    const value = e.activePayload[0].payload;
    setEntryValue([
      { name: 'Banana', count: value['banana'] },
      { name: 'Apple', count: value['apple'] },
      { name: 'Orange', count: value['orange'] },
    ]);
    setEntryLabel(value['name']);
    // TODO: Pulled updated img
  };

  const refreshData = () => {
    setEntryLabel('Latest Entry');
    setEntryValue(latestEntry);
  };

  useEffect(() => {
    // TODO: Backend function to pull in data
    if (data === null) {
      setEntryValue(latestEntry);
      setData(initialData);
    }
  }, [data]);

  return (
    <Grid container spacing={2}>
      {data && <Description data={data} updateSelectedData={updateSelectedData} />}
      <Grid item xs={1}></Grid>
      {data && <Entry entryValue={entryValue} entryLabel={entryLabel} refreshData={refreshData} />}
    </Grid>
  );
}

function Description({ data, updateSelectedData }) {
  return (
    <Grid item xs={5}>
      <div style={{ paddingLeft: '50px' }}>
        <h2>Inventory</h2>
        <p>
          Selecting a bubble on the graph at a specific timeframe will update both the table and photo with the details
          at that time.
        </p>
      </div>
      <div style={{ padding: '20px' }}>
        <LineChart width={600} height={350} data={data} onClick={(e) => updateSelectedData(e)}>
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

function Entry({ entryValue, entryLabel, refreshData }) {
  return (
    <Grid item xs={6}>
      <div>
        <div className="flex-space-between">
          <h2>{entryLabel}</h2>
          <div style={{ padding: '20px' }}>
            <Button variant="outlined" onClick={() => refreshData()}>
              Refresh
            </Button>
          </div>
        </div>
        <div className="flex-space-between">
          <TableContainer component={Paper} style={{ width: '450px' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Fruit</TableCell>
                  <TableCell align="right">Count</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {entryValue &&
                  entryValue.map((row) => (
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
          <img src={Refrigerator} alt="latest" style={{ width: '200px', height: '400px' }} />
        </div>
      </div>
    </Grid>
  );
}

export default Inventory;
