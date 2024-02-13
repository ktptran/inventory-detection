import React, { useRef, useState } from 'react';

import apple from '../assets/apple.png';
import orange from '../assets/orange.png';
import banana from '../assets/banana.png';
import door from '../assets/refrigerator-door.jpeg';

import { useDraggable } from 'use-draggable';

function Home() {
  return (
    <>
      <Directions />
      <Door />
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

function Door() {
  const divRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);

  function handleAnimation() {
    isAnimating ? setIsAnimating(false) : setIsAnimating(true);
  }

  return (
    <img
      src={door}
      alt="door"
      className={`door ${isAnimating ? 'doorOpen' : ''}`}
      ref={divRef}
      onClick={handleAnimation}
    />
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
    <div className="fridge">
      <div className="shelf">
        <DraggableComponent src={apple} alt="apple-1" />
        <DraggableComponent src={orange} alt="orange-1" />
      </div>
      <div className="shelf">
        <DraggableComponent src={orange} alt="orange-2" />
        <DraggableComponent src={apple} alt="apple-2" />
      </div>
      <div className="shelf">
        <DraggableComponent src={banana} alt="banana-1" />
        <DraggableComponent src={banana} alt="banana-2" />
      </div>
      <div className="shelf">
        <DraggableComponent src={banana} alt="banana-3" />
        <DraggableComponent src={orange} alt="orange-4" />
      </div>
    </div>
  );
}

export default Home;
