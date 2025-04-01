'use client'; // This file is a client component
import Image from 'next/image'; // Import the Image component from Next.js
import { useState, useEffect, useRef } from 'react'; // Import useState, useEffect, and useRef
//@ts-expect-error
import confetti from 'canvas-confetti'; // Import confetti library

const IMAGE_PATHS = {
  FLOWER: '/Flower.png',
  WHITE: '/White.png',
};

export default function Home() {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null); // State to track the position of the image
  const [dragOffset, setDragOffset] = useState({ offsetX: 0, offsetY: 0 }); // State to store the drag offset
  const flowerRef = useRef<HTMLDivElement>(null); // Ref for the flower image
  const [initialPosition, setInitialPosition] = useState<{ x: number; y: number } | null>(null); // Store the initial position

  useEffect(() => {
    // Calculate the initial position dynamically after the component mounts
    const initialX = window.innerWidth / 2 - 200; // Center horizontally (assuming image width is 400px)
    const initialY = window.innerHeight / 2; // Lower the image slightly
    setPosition({ x: initialX, y: initialY });
    setInitialPosition({ x: initialX, y: initialY }); // Save the initial position
  }, []); // Empty dependency array ensures this runs only once after the component mounts

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    // Store the initial offset of the mouse relative to the element
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;

    setDragOffset({ offsetX, offsetY }); // Save the offset in state
    event.dataTransfer.setData(
      'application/json',
      JSON.stringify({ offsetX, offsetY })
    );
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // Prevent default to allow dropping

    // Use the dragOffset state as a fallback if dataTransfer is empty
    let offset;
    try {
      offset = JSON.parse(event.dataTransfer.getData('application/json'));
    } catch (error) {
      console.error('Failed to parse dataTransfer JSON:', error);
      offset = dragOffset;
    }

    setPosition({
      x: event.clientX - offset.offsetX,
      y: event.clientY - offset.offsetY,
    });
  };

  const handleDrop = () => {
    if (!position || !initialPosition) return; // Ensure position and initialPosition are not null

    if (flowerRef.current) {
      const flowerRect = flowerRef.current.getBoundingClientRect();
      const bottomImageRect = {
        left: position.x,
        top: position.y,
        right: position.x + 400,
        bottom: position.y + 400,
      };

      // Check for overlap
      if (
        bottomImageRect.left < flowerRect.right &&
        bottomImageRect.right > flowerRect.left &&
        bottomImageRect.top < flowerRect.bottom &&
        bottomImageRect.bottom > flowerRect.top
      ) {
        // Play confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { x: 0.5, y: 0.5 },
        });

        // Play hurray sound
        const audio = new Audio('/hurray.mp3'); // Ensure you have a "hurray.mp3" file in your public folder
        audio.volume = 1.0; // Set volume to maximum
        audio.play().then(() => {
          // Reset position
          if (initialPosition) {
            setPosition(initialPosition);
          } else {
            console.warn('Initial position is null, cannot reset position.');
          }
        }).catch((error) => {
          console.error('Audio playback failed:', error);
        });

        // Reset position
        setPosition(initialPosition);
      }
    }
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const touch = event.touches[0]; // Get the first touch point
    const offsetX = touch.clientX - rect.left;
    const offsetY = touch.clientY - rect.top;

    setDragOffset({ offsetX, offsetY }); // Save the offset in state
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    event.preventDefault(); // Prevent default scrolling behavior
    const touch = event.touches[0]; // Get the first touch point

    setPosition({
      x: touch.clientX - dragOffset.offsetX,
      y: touch.clientY - dragOffset.offsetY,
    });
  };

  const handleTouchEnd = () => {
    handleDrop(); // Check for overlap on touch end
  };

  return (
    <div className="bg-blue-400">
      <div className="grid grid-cols-1 grid-rows-2 gap-28">
        <div>
          <div className="grid grid-cols-2 grid-rows-1 gap-4 pt-6">
            <div
              className="flex justify-center items-center"
              ref={flowerRef} // Attach ref to the flower image
            >
              <Image
                className="rounded-lg" // Add this class to make the image rounded
                src={IMAGE_PATHS.FLOWER} // Use a constant for the image path
                alt="Flower"
                width={400}
                height={400}
              />
            </div>
            <div className="flex justify-center items-center">
              <Image
                className="rounded-lg" // Add this class to make the image rounded
                src={IMAGE_PATHS.WHITE} // Use a constant for the image path
                alt="Flower"
                width={400}
                height={400}
              />
            </div>
          </div>
        </div>
        {position !== null && ( // Conditionally render the draggable element only after the position is set
          <div
            className="flex justify-center items-center"
            draggable // Make the div draggable for mouse interactions
            onDragStart={handleDragStart} // Handle the drag start event
            onDragOver={handleDragOver} // Handle the drag over event
            onDragEnd={handleDrop} // Handle the drop event
            onTouchStart={handleTouchStart} // Handle the touch start event
            onTouchMove={handleTouchMove} // Handle the touch move event
            onTouchEnd={handleTouchEnd} // Handle the touch end event
            style={{
              position: 'absolute', // Position the image absolutely
              left: position.x, // Use the x position from state
              top: position.y, // Use the y position from state
              cursor: 'grab', // Add a grab cursor for better UX
            }}
          >
            <Image
              className="rounded-2xl" // Add this class to make the image rounded
              src="/Flower.png" // Use a relative path starting from the public folder
              alt="Flower"
              width={400}
              height={400}
            />
          </div>
        )}
      </div>
    </div>
  );
}
