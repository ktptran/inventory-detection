import Grid from '@mui/material/Grid';
import React, { createRef, useEffect, useRef, useState } from 'react';

import apple from '../assets/apple.png';
import banana from '../assets/banana.png';
import orange from '../assets/orange.png';
import door from '../assets/refrigerator-door.png';

import { Link } from 'react-router-dom';
import { useDraggable } from 'use-draggable';
import { useScreenshot } from 'use-react-screenshot';
import { putImage } from '../api/apiService';
import data from '../data/sampleData.json';

import { v4 as uuidv4 } from 'uuid';

function Home() {
  const refrigeratorRef = createRef(null);
  // eslint-disable-next-line no-unused-vars
  const [_, takeScreenshot] = useScreenshot({
    type: 'image/jpeg',
    quality: 1.0,
  });

  const upload = async (image, { name = 'img', extension = 'jpg' } = {}) => {
    const uuid = uuidv4();
    await putImage(image, uuid);
  };

  const uploadScreenShot = () => {
    takeScreenshot(refrigeratorRef.current).then(upload);
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={8}>
        <Directions />
      </Grid>
      <Grid item xs={4}>
        <Door uploadScreenShot={uploadScreenShot} />
        <Refrigerator refrigeratorRef={refrigeratorRef} />
      </Grid>
    </Grid>
  );
}

function Directions() {
  return (
    <div className="container" style={{ padding: '20px' }}>
      <div className="vertical-center">
        <h2>Welcome to the Refrigerator Inventory Detection Demo!</h2>
        <p>Open the refrigerator and move the items in and out.</p>
        <p>Once you close the refrigerator, a snapshot will be recorded.</p>
        <p>This refrigerator records down the number of apples, oranges, and bananas.</p>
        <p>
          Once you've taken a few snapshots, navigate to the <Link to="/inventory">inventory page</Link> to look at the
          historical average.
        </p>
      </div>
    </div>
  );
}

function Door({ uploadScreenShot }) {
  const divRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);

  function handleAnimation() {
    if (isAnimating) {
      setIsAnimating(false);
      uploadScreenShot();
    } else {
      setIsAnimating(true);
    }
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
  const { src, alt, top, right } = props;

  return (
    <div>
      <div className="target" ref={targetRef}>
        <img src={src} ref={handleRef} className="fruit" alt={alt} style={{ top, right }} />
      </div>
    </div>
  );
}

function Refrigerator({ refrigeratorRef }) {
  const [defaultPosition, setDefaultPosition] = useState([]);

  const getSrc = (alt) => {
    if (alt.includes('apple')) {
      return apple;
    } else if (alt.includes('orange')) {
      return orange;
    } else {
      return banana;
    }
  };

  useEffect(() => {
    setDefaultPosition(data['initialFruitData']);
  }, []);

  return (
    <div className="fridge" ref={refrigeratorRef}>
      {defaultPosition.map((value, index) => {
        const { alt, top, right } = value;
        return <DraggableComponent src={getSrc(alt)} alt={alt} top={`${top}px`} right={`${right}px`} key={index} />;
      })}
    </div>
  );
}

export default Home;
