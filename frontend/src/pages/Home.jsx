import React, { useRef, useState, createRef } from 'react';

import apple from '../assets/apple.png';
import orange from '../assets/orange.png';
import banana from '../assets/banana.png';
import door from '../assets/refrigerator-door.jpeg';

import { useDraggable } from 'use-draggable';
import { useScreenshot, createFileName } from 'use-react-screenshot';

function Home() {
  const refrigeratorRef = createRef(null);
  const [image, takeScreenshot] = useScreenshot({
    type: 'image/jpeg',
    quality: 1.0,
  });

  const download = (image, { name = 'img', extension = 'jpg' } = {}) => {
    const a = document.createElement('a');
    a.href = image;
    a.download = createFileName(extension, name);
    a.click();
    // TODO: Upload to Amazon S3
  };

  const downloadScreenShot = () => {
    takeScreenshot(refrigeratorRef.current).then(download);
  };

  return (
    <>
      <Directions />
      <Door downloadScreenShot={downloadScreenShot} />
      <Refrigerator refrigeratorRef={refrigeratorRef} />
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

function Door({ downloadScreenShot }) {
  const divRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);

  function handleAnimation() {
    if (isAnimating) {
      setIsAnimating(false);
      downloadScreenShot();
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
  const { src, alt } = props;
  return (
    <div className="target" ref={targetRef}>
      <img src={src} ref={handleRef} className="fruit" alt={alt} />
    </div>
  );
}

function Refrigerator({ refrigeratorRef }) {
  return (
    <div className="fridge" ref={refrigeratorRef}>
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
