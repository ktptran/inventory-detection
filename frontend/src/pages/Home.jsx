import React from 'react';

function Home() {
  return (
    <>
      <Directions />
      <Refrigerator />
    </>
  );
}

function Directions() {
  return (
    <div style={{ padding: 20 }}>
      <h2>Welcome to the Refrigerator Inventory Detection Demo!</h2>
      <p>Open the refrigerator and move the items in and out.</p>
      <p>Once you close the refrigerator, a snapshot will be recorded to count the inventory.</p>
      <p>
        Navigate to the <a href="">inventory page</a> for more information.
      </p>
    </div>
  );
}

function Refrigerator() {
  return (
    <div class="fridge">
      <div class="shelf"></div>
      <div class="shelf"></div>
      <div class="shelf"></div>
      <div class="shelf"></div>
      <div class="shelf"></div>
      <div class="shelf"></div>
      <div class="shelf"></div>
    </div>
  );
}

export default Home;
