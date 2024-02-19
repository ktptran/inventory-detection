import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import React, { useEffect, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';
import { getImage, getInventory } from '../api/apiService';

function Inventory() {
  const [data, setData] = useState(null);
  const [entryValue, setEntryValue] = useState(null);
  const [entryLabel, setEntryLabel] = useState('Latest Entry');
  const [latestEntry, setLatestEntry] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);

  const updateSelectedData = (e) => {
    async function getSelectedData() {
      if (e && e.activePayload) {
        const value = e.activePayload[0].payload;
        const imageUrl = await getImage(value['key']);
        setImage(imageUrl);
        setEntryValue([
          { name: 'Banana', count: value['banana'] },
          { name: 'Apple', count: value['apple'] },
          { name: 'Orange', count: value['orange'] },
        ]);
        setEntryLabel(value['time']);
      }
    }
    getSelectedData();
  };

  const refreshData = () => {
    async function refreshSelectedData() {
      setEntryLabel('Latest Entry');
      setEntryValue(createEntrySample(latestEntry));
      const imageUrl = await getImage(latestEntry['key']);
      setImage(imageUrl);
      setLoading(false);
    }
    setLoading(true);
    refreshSelectedData();
  };

  const createEntrySample = (entry) => {
    return [
      { name: 'Banana', count: entry['banana'] },
      { name: 'Apple', count: entry['apple'] },
      { name: 'Orange', count: entry['orange'] },
    ];
  };

  useEffect(() => {
    async function getData() {
      if (data === null) {
        const response = await getInventory();
        const lastEntry = response[response.length - 1];
        const sample = createEntrySample(lastEntry);
        setLatestEntry(lastEntry);
        setEntryValue(sample);
        setData(response);
        const imageUrl = await getImage(lastEntry['key']);
        setImage(imageUrl);
        setLoading(false);
      }
    }
    getData();
  }, [data]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '100px' }}>
        <CircularProgress />
      </div>
    );
  } else {
    return (
      <Grid container spacing={2}>
        {data && <Description data={data} updateSelectedData={updateSelectedData} />}
        <Grid item xs={1}></Grid>
        {data && <Entry entryValue={entryValue} entryLabel={entryLabel} refreshData={refreshData} image={image} />}
      </Grid>
    );
  }
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
          <XAxis dataKey="time" />
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

function Entry({ entryValue, entryLabel, refreshData, image }) {
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
          <img src={image} alt="latest" style={{ width: '200px', height: '400px' }} />
        </div>
      </div>
    </Grid>
  );
}

export default Inventory;
