import React from 'react';

import apple from '../assets/apple.png';
import orange from '../assets/orange.jpeg';
import banana from '../assets/banana.png';

import { useDraggable } from 'use-draggable';

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
        Navigate to the <a href="/inventory">inventory page</a> for more information.
      </p>
    </div>
  );
}

function DraggableComponent(props) {
  const { targetRef, handleRef } = useDraggable({ controlStyle: true });
  const { src, alt } = props;
  return (
    <div className="target" ref={targetRef}>
      <img src={src} ref={handleRef} className="fruit" alt={alt} />
    </div>
  );
}

function Refrigerator() {
  return (
    <div class="fridge">
      <div class="shelf">
        <DraggableComponent src={apple} alt="apple-1" />
        <DraggableComponent src={orange} alt="orange-1" />
      </div>
      <div class="shelf">
        <DraggableComponent src={orange} alt="orange-2" />
        <DraggableComponent src={apple} alt="apple-2" />
      </div>
      <div class="shelf">
        <DraggableComponent src={banana} alt="banana-1" />
        <DraggableComponent src={banana} alt="banana-2" />
      </div>
      <div class="shelf">
        <DraggableComponent src={banana} alt="banana-3" />
        <DraggableComponent src={orange} alt="orange-4" />
      </div>
    </div>
  );
}

export default Home;
