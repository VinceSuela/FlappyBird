import React, { useEffect, useRef, useState } from "react";

// components
import Points from "./Points";
import PipeDown from "./PipeDown";
import PipeUp from "./PipeUp";
import Base from "./Base";
import GameOver from "./GameOver";
import Bird from "./Bird";
import StartScreen from "./StartScreen";

// sound
import wing from "./asset/audio/wing.ogg";
import point from "./asset/audio/point.ogg";

// img
import yellowbirddown from "./asset/sprites/yellowbird-downflap.png";
import yellowbirdmid from "./asset/sprites/yellowbird-midflap.png";
import yellowbirdup from "./asset/sprites/yellowbird-upflap.png";
import pipeImg from "./asset/sprites/pipe-green.png";
import gameOverImg from "./asset/sprites/gameover.png";
import base from "./asset/sprites/base.png";
import start from "./asset/sprites/message.png";

// number images
import zero from "./asset/sprites/0.png";
import one from "./asset/sprites/1.png";
import two from "./asset/sprites/2.png";
import three from "./asset/sprites/3.png";
import four from "./asset/sprites/4.png";
import five from "./asset/sprites/5.png";
import six from "./asset/sprites/6.png";
import seven from "./asset/sprites/7.png";
import eight from "./asset/sprites/8.png";
import nine from "./asset/sprites/9.png";

function App() {
  const [gameStatus, setGameStatus] = useState("waiting");
  const [score, setScore] = useState(0);
  const [pipes, setPipes] = useState([]);
  const [birdY, setBirdY] = useState(0);
  const [birdImage, setBirdImage] = useState(yellowbirdmid);
  const [rotation, setRotation] = useState(0);

  const frameRef = useRef(0);
  const birdYRef = useRef(0);
  const timeFlyRef = useRef(false);
  const flapTimeoutRef = useRef(null);
  const gameOverRef = useRef(false);
  const pipesRef = useRef([]);

  const BIRD_X = 170;
  const BIRD_WIDTH = 34;
  const BIRD_HEIGHT = 24;
  const PIPE_WIDTH = 52;
  const GAP_SIZE = 120;
  const GAME_HEIGHT = 667;
  const BASE_HEIGHT = 112;
  const PLAYABLE_HEIGHT = GAME_HEIGHT - BASE_HEIGHT;

  const pointsImages = [
    { digit: "0", image: zero },
    { digit: "1", image: one },
    { digit: "2", image: two },
    { digit: "3", image: three },
    { digit: "4", image: four },
    { digit: "5", image: five },
    { digit: "6", image: six },
    { digit: "7", image: seven },
    { digit: "8", image: eight },
    { digit: "9", image: nine },
  ];

  const animateWings = () => {
    frameRef.current++;
    if (frameRef.current % 5 === 0) {
      setBirdImage((prev) => {
        if (prev === yellowbirdmid) return yellowbirdup;
        if (prev === yellowbirdup) return yellowbirddown;
        return yellowbirdmid;
      });
    }
  };

  const createNewPipe = (x = 400) => {
    const minGapTop = 50;
    const maxGapTop = PLAYABLE_HEIGHT - GAP_SIZE - 50;
    const gapStart = Math.random() * (maxGapTop - minGapTop) + minGapTop;
    return { id: Date.now() + Math.random(), x, gapStart, passed: false };
  };

  const resetGame = () => {
    setScore(0);
    birdYRef.current = 0;
    setBirdY(0);
    setRotation(0);
    gameOverRef.current = false;
    pipesRef.current = [createNewPipe()];
    setPipes(pipesRef.current);
  };

  // mouse and keyboard input
  useEffect(() => {
    const handleInput = (event) => {
      if (
        event.type === "mousedown" ||
        (event.type === "keydown" && event.code === "Space")
      ) {
        if (event.code === "Space") event.preventDefault();

        if (gameStatus === "waiting") {
          setGameStatus("playing");
        } else if (gameStatus === "gameOver") {
          resetGame();
          setGameStatus("waiting");
        } else if (gameStatus === "playing") {
          timeFlyRef.current = true;
          if (flapTimeoutRef.current) clearTimeout(flapTimeoutRef.current);
          flapTimeoutRef.current = setTimeout(() => {
            timeFlyRef.current = false;
          }, 150);
        }
      }
    };

    window.addEventListener("mousedown", handleInput);
    window.addEventListener("keydown", handleInput);
    return () => {
      window.removeEventListener("mousedown", handleInput);
      window.removeEventListener("keydown", handleInput);
    };
  }, [gameStatus]);

  // main logic loop
  useEffect(() => {
    let animId;

    const gameLoop = () => {
      if (gameStatus === "playing" && !gameOverRef.current) {
        // ibon
        birdYRef.current += timeFlyRef.current ? -5 : 4;
        if (birdYRef.current < -270) birdYRef.current = -270;

        const currentBirdTop = 270 + birdYRef.current;
        const currentBirdBottom = currentBirdTop + BIRD_HEIGHT;

        animateWings();

        // animation rotate
        if (timeFlyRef.current) {
          setRotation(-25);
        } else {
          setRotation((prev) => Math.min(prev + 3, 70));
        }

        // pipe movement
        let newPipes = pipesRef.current.map((p) => ({ ...p, x: p.x - 2 }));

        // 'pag nalaglag yung ibon
        if (currentBirdBottom >= PLAYABLE_HEIGHT) {
          setRotation(90);
          gameOverRef.current = true;
          setGameStatus("gameOver");
        }

        // score ta's pipe generation, also pipe collision check
        newPipes.forEach((pipe) => {
          if (BIRD_X + BIRD_WIDTH > pipe.x && BIRD_X < pipe.x + PIPE_WIDTH) {
            if (
              currentBirdTop < pipe.gapStart ||
              currentBirdBottom > pipe.gapStart + GAP_SIZE
            ) {
              gameOverRef.current = true;
              setGameStatus("gameOver");
              setRotation(90);
            }
          }
          if (!pipe.passed && pipe.x < BIRD_X) {
            setScore((prev) => prev + 1);
            pipe.passed = true;
            newPipes.push(createNewPipe(400));
          }
        });

        pipesRef.current = newPipes.filter((p) => p.x > -100);
        setPipes(pipesRef.current);
        setBirdY(birdYRef.current);
      }
      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [gameStatus]);

  // UI
  return (
    <div className="App">
      {gameStatus !== "waiting" &&
        pipes.map((pipe) => (
          <React.Fragment key={pipe.id}>
            <PipeUp image={pipeImg} x={pipe.x} height={pipe.gapStart} />
            <PipeDown
              image={pipeImg}
              x={pipe.x}
              height={PLAYABLE_HEIGHT - (pipe.gapStart + GAP_SIZE)}
            />
          </React.Fragment>
        ))}
      <Bird image={birdImage} rotation={rotation} birdY={birdY} />
      {gameStatus === "waiting" && <StartScreen image={start} />}
      {gameStatus === "gameOver" && <GameOver image={gameOverImg} />}
      <div className="score-container">
        {score
          .toString()
          .split("")
          .map((digit, index) => {
            const pointImg = pointsImages.find((p) => p.digit === digit)?.image;
            return pointImg ? <Points key={index} image={pointImg} /> : null;
          })}
      </div>
      <Base image={base} />
    </div>
  );
}

export default App;
