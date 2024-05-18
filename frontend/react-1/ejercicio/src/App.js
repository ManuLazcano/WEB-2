import React, { useState } from 'react';

function Game() {
  const [playing, setPlaying] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [timePlayed, setTimePlayed] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [buttonPositions, setButtonPositions] = useState([{ top: '50%', left: '50%' }, { top: '50%', left: '50%' }]);
  const [clickedButtons, setClickedButtons] = useState([false, false]);

  const startGame = () => {
    const waitTime = Math.floor(Math.random() * 5000) + 1000;
    setIsActive(true);
    setTimePlayed(0);
    setClickedButtons([false, false]);

    setTimeout(() => {
      let positions = [];

      // Generar coordenadas aleatorias para ambos botones
      let randomTop1, randomLeft1, randomTop2, randomLeft2;
      do {
        randomTop1 = Math.random() * 80 + 10; // Entre 10% y 90%
        randomLeft1 = Math.random() * 80 + 10; // Entre 10% y 90%
        randomTop2 = Math.random() * 80 + 10; // Entre 10% y 90%
        randomLeft2 = Math.random() * 80 + 10; // Entre 10% y 90%
      } while (
        Math.abs(randomTop1 - randomTop2) < 10 && 
        Math.abs(randomLeft1 - randomLeft2) < 10
      );

      positions.push(
        { top: `${randomTop1}%`, left: `${randomLeft1}%` },
        { top: `${randomTop2}%`, left: `${randomLeft2}%` }
      );

      setButtonPositions(positions);
      setPlaying(true);
      setStartTime(performance.now());
    }, waitTime);
  };

  const finishGame = (index) => {
    let newClickedButtons = [...clickedButtons];
    newClickedButtons[index] = true;
    setClickedButtons(newClickedButtons);

    if (newClickedButtons.every(clicked => clicked)) {
      setPlaying(false);
      const timePlayed = performance.now() - startTime;
      setTimePlayed(timePlayed);
      setIsActive(false);
    }
  };

  return (
    <div style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
      {!playing && !isActive && <button onClick={startGame}>Comenzar</button>}
      {playing && buttonPositions.map((position, index) => (
        !clickedButtons[index] && (
          <button 
            key={index}
            onClick={() => finishGame(index)} 
            style={{ 
              position: 'absolute', 
              top: position.top, 
              left: position.left,
              transform: 'translate(-50%, -50%)'
            }}
          >
            ¡Clic!
          </button>
        )
      ))}
      <p>Tiempo jugado: {timePlayed.toFixed(2)} ms</p>
    </div>
  );
}

export default Game;
