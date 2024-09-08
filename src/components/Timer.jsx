import React, { useEffect, useState } from 'react';

function Timer({ duration, onTimeout }) {
    const [timeLeft, setTimeLeft] = useState(duration);

    useEffect(() => {
        // Reset the timer when the duration prop changes
        setTimeLeft(duration);
    }, [duration]);

    useEffect(() => {
        // Stop the timer if time has run out
        if (timeLeft <= 0) {
            onTimeout();
            return;
        }

        // Decrement the timer every second
        const intervalId = setInterval(() => {
            setTimeLeft(prevTime => Math.max(prevTime - 1, 0)); // Ensure it doesn't go below 0
        }, 1000);

        // Clean up the interval on unmount or when timeLeft changes
        return () => clearInterval(intervalId);
    }, [timeLeft, onTimeout]);

    const seconds = Math.floor(timeLeft);  // Round down to the nearest whole second

    return (
        <div>
            <h3>Time Left: {seconds} {seconds === 1 ? 'second' : 'seconds'}</h3>
        </div>
    );
}

export default Timer;