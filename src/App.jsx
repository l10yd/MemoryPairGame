import React, { useState, useEffect } from "react";
import pictures from "./Pictures"; //картинки, по 16 на каждую тему
import messages from "./Messages"; //сообщения об успехе или ошибке
import languages from "./Languages"; //тексты на разных языках
import { shufflePictures, generateNewGrid, updateTimer, secondsToString } from "./GameUtils"; //функции для генерации игрового поля и перемешивания картинок, а еще для обновления таймера и перевода числа в строку времени ("01:06")
import './App.css';

//максимальные значения difficulty для каждого gridSize
const gridSizeMaxes = {
  Pairs: { "4": 8, "6": 16, "8": 16 },
  Triplets: { "3": 3, "6": 12, "9": 16 },
};

//тут звуки
const sounds = {
  click: "https://www.dropbox.com/scl/fi/an5b8c321l40099kn0lnf/cave_crystal_shard_obtain.mp3?rlkey=z2uokoobe28ajvoaaic8ay5z8&dl=1",
  success: "https://codeskulptor-demos.commondatastorage.googleapis.com/descent/gotitem.mp3",
  /* error: "",
   victory: "",
   defeat: "",
   reset: "",
   toggleTheme: "",
   toggleDarkMode: "",
   toggleSound: "",
   settingsOpen: "",
   settingsChange: "",
   settingsClose: "",*/
};

export default function App() {

  const [showSettings, setShowSettings] = useState(false);
  const [grid, setGrid] = useState([]);

  //время игры, выводится при победе, сбрасывается при перезапуске
  const [timer, setTimer] = useState({
    timePassed: "00:00",

  });



  //надо переработать все в redux toolkit
  //1 - просто статы текущей игры
  const [gameStats, setGameStats] = useState({
    soundOn: false, //-
    darkmode: false, //-
    theme: 'Fruits', //-
    firstSelected: null,
    secondSelected: null, //можно открыть только 2-3 клетки за раз
    thirdSelected: null,
    block: false, //блок игры
    gameOver: false, //если true, то показывается иконка перезапуска
    gridSize: 4, //-
    difficulty: 3, //-
    gameType: "Pairs", //-
    gameMode: "Classic", //-
    stepCounter: 0, //счетчик шагов, обновляется при открытии 2х-3х клеток, выводится при победе
    tileCounter: 0, //счетчик открытых клеток, если равен площади квадрата поля - победа
    survivalLifes: 8, //жизни для режима Survival
  });

  /*
   //2 - настройки, влияющие на логику
   const [gameSettings, setGameSettings] = useState({
     gridSize: 4, //длина квадрата поля
     difficulty: 3, //сложность, влияет на количество уникальных элементов
     gameType: "Pairs", //тип игры, пары или тройки
     gameMode: "Classic", //режим игры, обычный или выживание или TimeRun
   })
 
   //3 - настройки, не относящиеся к логике
   const [miscSettings, setMiscSettings] = useState({
     showSettings: false,
     language: "russian",
     soundOn: false,
     darkmode: false, //нужны будут отдельные статы под даркмод, это будет объект dark/light
     theme: 'Fruits',
   })
 
   //4 - для сетки клеток
   const [tileMap, setTileMap] = useState({
     grid: [],
     pics: [],
     tileSize: "40",  
     displayText: "", //хз, ну а куда его
   });
 
   //надо еще сделать статистику
   const [score, setScore] = useState({
     difficulties: {
       "4": {
         Easy: 0,
         Medium: 0,
         Hard: 0,
       },
       "6": {
         Easy: 0,
         Medium: 0,
         Hard: 0,
       },
       "8": {
         Easy: 0,
         Medium: 0,
         Hard: 0,
       },
     },
     totalClicks: 0,
     themeChanges: 0,
   })*/

  //временные значения для окна настроек
  const [tempGameStats, setTempGameStats] = useState({
    gridSize: gameStats.gridSize,
    difficulty: gameStats.difficulty,
    gameMode: gameStats.gameMode,
    gameType: gameStats.gameType,
  })
  //текст под игровой сеткой выводится
  const [displayText, setDisplayText] = useState(`Поле: 4х4, Сложность: 3.`);
  //картинки хранятся в отдельном объекте, но будут перемешиватсья при ресете
  const [pics, setPics] = useState([]);
  //смена языка
  const [currentLanguage, setCurrentLanguage] = useState('russian');
  //размер одной клетки игрового поля
  const [tileSize, setTileSize] = useState(74);

  //для смены языка
  const toggleLanguage = (lang) => {
    setCurrentLanguage(lang);
    localStorage.setItem('language', lang);
  };

  //для проигрывания звуков
  const playSound = (audioSrc) => {
    if (gameStats.soundOn) {
      const audioElement = new Audio(audioSrc);
      audioElement.play();
    }
  };

  //загрузка из localStorage на старте
  useEffect(() => {
    //стереть все сейвы   
    /*localStorage.clear(); */

    const savedPictures = JSON.parse(localStorage.getItem('pics'));
    if (savedPictures) {
      setPics(savedPictures)
    }
    else {
      const pics = shufflePictures(pictures);
      setPics(pics);
      localStorage.setItem('pics', JSON.stringify(pics));
    }
    // Получаем и устанавливаем grid из localStorage
    const savedGrid = JSON.parse(localStorage.getItem('grid'));
    if (savedGrid) {
      setGrid(savedGrid);
    } else {
      const newGrid = generateNewGrid(4, 3, "Pairs");
      setGrid(newGrid);
      localStorage.setItem('grid', JSON.stringify(newGrid));
    }

    // Получаем и устанавливаем gameStats из localStorage
    const savedGameStats = JSON.parse(localStorage.getItem('gameStats'));
    if (savedGameStats) {
      //блок снимаем на всякий случай
      setGameStats((prevGameStats) => ({ ...savedGameStats, block: false, darkmode: false }));
    }

    //тоже загружаем, иначе после загрузки -> победе/поражении слетают настройки при перезапуске игры
    const savedTempGameStats = JSON.parse(localStorage.getItem('tempGameStats'));
    if (savedTempGameStats) {
      setTempGameStats(savedTempGameStats);
    }


    //загрузка языка
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    }

    //загрузка текста с текущим размером поля и сложностью
    const savedText = localStorage.getItem('settingsText');
    if (savedText) {
      setDisplayText(savedText);
    }

    //загрузка времени текущей игровой сессии
    const savedTimer = JSON.parse(localStorage.getItem('timer'));
    if (savedTimer) {
      setTimer(savedTimer);
    }

  }, []);

  //таймер, считает время в строку "00:00"
  useEffect(() => {
    let intervalId;

    if (!gameStats.gameOver && !showSettings) {
      intervalId = setInterval(() => {
        setTimer((prevTimer) => {
          // передаем время ("00:05") и +1/-1 секунду в зависимости от режима
          const sec = gameStats.gameMode === "TimeRun" ? (-1) : 1;
          const newTime = updateTimer(prevTimer.timePassed, sec)
          const newTimer = { ...prevTimer, timePassed: newTime };
          localStorage.setItem('timer', JSON.stringify(newTimer));
          //время кончилось - геймовер
          if (newTime === "00:00") {
            setGameStats((prevGameStats) => {
              const updatedGameStats = {
                ...prevGameStats,
                gameOver: true,
              };
              localStorage.setItem('gameStats', JSON.stringify(updatedGameStats));
              return updatedGameStats;
            });
            setDisplayText(languages[currentLanguage].timeOverMsg);
          }
          return newTimer;
        });
      }, 1000); //каждую секунду
    }

    return () => {
      clearInterval(intervalId);
    };
    //останавливается, если открыты настройки или игра окончена
  }, [gameStats.gameOver, showSettings]);

  //перезагрузка игры с сохранением настроек
  const gameReset = () => {
    //берем настройки из временных значений
    const newGridSize = tempGameStats.gridSize;
    const newDifficulty = tempGameStats.difficulty;
    const newGameMode = tempGameStats.gameMode;
    const newGameType = tempGameStats.gameType;

    localStorage.setItem('tempGameStats', JSON.stringify(tempGameStats));

    const multiplier = newGameType === "Pairs" ? 1 : 2;

    setGameStats(prevGameStats => {
      const newGameStats = {
        ...prevGameStats,
        firstSelected: null,
        secondSelected: null,
        thirdSelected: null,
        gameOver: false,
        block: false,
        tileCounter: 0,
        stepCounter: 0,
        survivalLifes: (parseInt(newGridSize, 10) + parseInt(newDifficulty, 10)) * multiplier, //жизней пока что х2
        gridSize: newGridSize,
        difficulty: newDifficulty,
        gameMode: newGameMode,
        gameType: newGameType,
      };
      localStorage.setItem('gameStats', JSON.stringify(newGameStats));
      return newGameStats;
    });

    //в режиме таймран время идет в обратную сторону
    if (newGameMode !== "TimeRun") {
      setTimer({ timePassed: "00:00" });
    }
    else {
      //хз сколько тут дать времени, ну пока так
      const newTime = secondsToString(newGridSize*newDifficulty+5);
      setTimer({ timePassed: newTime });
    }

    const newGrid = generateNewGrid(newGridSize, newDifficulty, newGameType);
    setGrid(newGrid);
    localStorage.setItem('grid', JSON.stringify(newGrid));

    //Выводит строку по типу Игра: Пары, Поле: 4x4, Сложность: 4, Режим: Обычный. - в соответствии с выбранным языком
    const settingsText = `${languages[currentLanguage].gameTypeLabel}: ${languages[currentLanguage].gameTypes[newGameType]}, ${languages[currentLanguage].fieldSizeMsg}: ${newGridSize}x${newGridSize}, ${languages[currentLanguage].difficultyMsg}: ${newDifficulty}, ${languages[currentLanguage].gameModeLabel}:  ${languages[currentLanguage].gameMode[newGameMode]}.`
    setDisplayText(settingsText);
    localStorage.setItem('settingsText', settingsText);

    //перемешиваем картинки при перезапуске
    const newPics = shufflePictures(pictures);
    setPics(newPics);
    localStorage.setItem('pics', JSON.stringify(newPics));
    //окно настроек закрываем
    setShowSettings(false);
  }

  // функция для обновления выбранной клетки в gameStats и сохранения в localStorage
  //вызывается при нажатии на клетку в onClickTile
  const updateSelectedCell = (cellName, rowIndex, colIndex) => {
    setGameStats((prevGameStats) => {
      const newGameStats = { ...prevGameStats, [cellName]: { rowIndex, colIndex } };
      localStorage.setItem('gameStats', JSON.stringify(newGameStats));
      return newGameStats;
    });
  };

  // Обработка нажатия на клетку
  const onClickTile = (rowIndex, colIndex) => {
    //только если нет блока и клетка скрыта
    if (!gameStats.block && grid[rowIndex][colIndex].hidden) {
      const updatedGrid = [...grid];
      updatedGrid[rowIndex][colIndex] = { ...updatedGrid[rowIndex][colIndex], hidden: false };
      setGrid(updatedGrid);
      localStorage.setItem('grid', JSON.stringify(updatedGrid));

      playSound(sounds.success);

      if (gameStats.firstSelected === null) {
        updateSelectedCell('firstSelected', rowIndex, colIndex);
      } else if (gameStats.secondSelected === null) {
        updateSelectedCell('secondSelected', rowIndex, colIndex);
      } else if (gameStats.thirdSelected === null) {
        updateSelectedCell('thirdSelected', rowIndex, colIndex);
      }
    }
  };

  // функция для обновления размера клеток, вызывается в useEffect при изменении grid или размеров окна
  const updateTileSize = () => {
    const gridLength = grid.length;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Определение минимальных размеров в зависимости от размера сетки
    const minTileSize = {
      3: 100,
      4: 74,
      6: 50,
      8: 40,
      9: 35,
    };

    // Рассчитываем новый размер клетки, который зависит от размера экрана и длины сетки
    let newTileSize = Math.min((screenWidth / gridLength) * 0.3, (screenHeight / gridLength) * 0.5);

    // Устанавливаем минимальное значение на основе размера сетки
    newTileSize = Math.max(newTileSize, minTileSize[gridLength] || 40);

    setTileSize(newTileSize);
  };

  //логика проверки совпадений открытых клеток
  //срабатывает после открытия 2 или 3 клеток (в зависимости от режима)
  useEffect(() => {
    const { firstSelected, secondSelected, thirdSelected } = gameStats;

    if (secondSelected && gameStats.gameType === "Pairs") {
      // логика для режима Pairs
      const firstCell = grid[firstSelected.rowIndex][firstSelected.colIndex];
      const secondCell = grid[secondSelected.rowIndex][secondSelected.colIndex];

      if (firstCell.value === secondCell.value) {
        // совпадение
        handleMatch();
      } else {
        // не совпадение
        handleMismatch();
      }
    }

    if (thirdSelected && gameStats.gameType === "Triplets") {
      // логика для режима Triplets
      const firstCell = grid[firstSelected.rowIndex][firstSelected.colIndex];
      const secondCell = grid[secondSelected.rowIndex][secondSelected.colIndex];
      const thirdCell = grid[thirdSelected.rowIndex][thirdSelected.colIndex];

      if (firstCell.value === secondCell.value && secondCell.value === thirdCell.value) {
        // совпадение
        handleMatch();
      } else {
        // не совпадение
        handleMismatch();
      }
    }

    //обновляем размер клеток в зависимости от размера окна браузера
    updateTileSize();
    window.addEventListener('resize', updateTileSize);

    return () => {
      window.removeEventListener('resize', updateTileSize);
    };

    // общая логика для обоих режимов
    //вызывается, если открытые клетки совпали
    function handleMatch() {
      //обновляем счетчики открытых клеток, шагов, +1 жизнь в режиме Survival
      setGameStats((prevGameStats) => {
        const updatedGameStats = {
          ...prevGameStats,
          tileCounter: prevGameStats.tileCounter + (gameStats.gameType === "Pairs" ? 2 : 3),
          survivalLifes: prevGameStats.survivalLifes + 1,
          stepCounter: prevGameStats.stepCounter + 1,
        };
        localStorage.setItem('gameStats', JSON.stringify(updatedGameStats));
        return updatedGameStats;
      });

      //в режиме TimeRun получает +N (пока что gridSize) сек
      if (gameStats.gameMode === "TimeRun") {
        setTimer((prevTimer) => {
          const updatedTime = updateTimer(prevTimer.timePassed, parseInt(gameStats.gridSize, 10));
          const updatedTimer = {
            ...prevTimer,
            timePassed: updatedTime,
          };
          localStorage.setItem('timer', JSON.stringify(updatedTimer));
          return updatedTimer;
        });
      }

      //выводим случайное сообщение об успехе на выбранном языке
      const randomSuccessMessage = messages[currentLanguage].Success[
        Math.floor(Math.random() * messages[currentLanguage].Success.length)
      ];
      setDisplayText(randomSuccessMessage);
      //сброс выбранных клеток и разблокировка игры
      resetGameStats();
    }

    //вызывается, если открытые клетки не совпали
    function handleMismatch() {
      //блок игры на 1 сек, +1 к счетчику шагов, -1 жизнь в режиме Survival
      setGameStats((prevGameStats) => {
        const updatedGameStats = {
          ...prevGameStats,
          block: true,
          survivalLifes: prevGameStats.survivalLifes - 1,
          stepCounter: prevGameStats.stepCounter + 1,
        };
        localStorage.setItem('gameStats', JSON.stringify(updatedGameStats));
        return updatedGameStats;
      });

      //геймовер в режиме Survival, если жизни кончились
      if (gameStats.survivalLifes === 0 && gameStats.gameMode === "Survival") {
        setDisplayText(languages[currentLanguage].gameOverMsg);
        setGameStats((prevGameStats) => {
          const updatedGameStats = {
            ...prevGameStats,
            gameOver: true,
          };
          localStorage.setItem('gameStats', JSON.stringify(updatedGameStats));
          return updatedGameStats;
        });
      } else {
        //иначе выводим случайное сообщение об ошибке на выбранном языке
        const randomErrorMessage = messages[currentLanguage].Error[
          Math.floor(Math.random() * messages[currentLanguage].Error.length)
        ];
        setDisplayText(randomErrorMessage);

        setTimeout(() => {
          setGrid((prevGrid) => {
            //прячем клетки обратно 
            const newGrid = [...prevGrid];
            newGrid[firstSelected.rowIndex][firstSelected.colIndex].hidden = true;
            newGrid[secondSelected.rowIndex][secondSelected.colIndex].hidden = true;
            if (gameStats.gameType === "Triplets") {
              newGrid[thirdSelected.rowIndex][thirdSelected.colIndex].hidden = true;
            }
            localStorage.setItem('grid', JSON.stringify(newGrid));
            return newGrid;
          });
          //сбрасываем значения выбранных клеток
          resetGameStats();
        }, 1000);
      }
    }

    //вызывается после проверки совпадений, сбрасывает значения и разблокирует игру
    function resetGameStats() {
      setGameStats((prevGameStats) => {
        const newGameStats = {
          ...prevGameStats,
          block: false,
          firstSelected: null,
          secondSelected: null,
          thirdSelected: null,
        };
        localStorage.setItem('gameStats', JSON.stringify(newGameStats));
        return newGameStats;
      });
    }
  }, [grid]);


  //срабатывает в случае, если счетчик равен площади игрового поля - победа в игре
  useEffect(() => {
    if (gameStats.tileCounter === gameStats.gridSize * gameStats.gridSize) {
      //победа, блок и перезапуск через 3 сек
      //строка типа "Победа! Шаги: 10"(если не TimeRun: +" , Время: 01:04")
      setDisplayText(
        `${languages[currentLanguage].victoryMsg} ${gameStats.stepCounter}${gameStats.gameMode !== "TimeRun"
          ? `, ${languages[currentLanguage].timePassed} ${timer.timePassed}`
          : ""
        }`
      );
      setGameStats((prevGameStats) => {
        const updatedGameStats = {
          ...prevGameStats,
          gameOver: true,
          block: true,
        };
        localStorage.setItem('gameStats', JSON.stringify(updatedGameStats));
        return updatedGameStats;
      });
    }

  }, [gameStats.tileCounter, gameStats.gridSize]);

  //смена темы - устанавливается следующее по кругу значение из pictures в gameStats
  const changeTheme = () => {
    const themes = Object.keys(pictures);
    const currentThemeIndex = themes.indexOf(gameStats.theme);
    const nextThemeIndex = (currentThemeIndex + 1) % themes.length; // переход к следующей теме
    const nextTheme = themes[nextThemeIndex];

    //выводит строку по типу Выбрана тема: Фрукты
    setDisplayText(`${languages[currentLanguage].currentThemeMsg}${languages[currentLanguage].pictures[nextTheme] || nextTheme}`);

    setGameStats(prevGameStats => {
      const newGameStats = { ...prevGameStats, theme: nextTheme };
      localStorage.setItem('gameStats', JSON.stringify(newGameStats));
      return newGameStats;
    });
  };

  //смена - ночной/дневной режим, надо переработать
  const toggleDarkMode = () => {
    setGameStats(prevGameStats => {
      const newGameStats = { ...prevGameStats, darkmode: !prevGameStats.darkmode };
      localStorage.setItem('gameStats', JSON.stringify(newGameStats));
      document.body.style.backgroundColor = newGameStats.darkmode ? "black" : "white";
      document.body.style.color = newGameStats.darkmode ? "#777" : "black";
      return newGameStats;
    });
  }

  //для селекторов настроек (размер поля, сложность, режим игры)
  //запоминает временные настройки
  const handleSelectChange = (field, value) => {
    setTempGameStats((prevStats) => ({
      ...prevStats,
      [field]: value,
    }));
  };

  //при переключении типа игры устанавливает размер поля как минимальный
  //надо это пофиксить для 6х6 - не должен меняться
  useEffect(() => {
    const minGridSize = tempGameStats.gameType === "Pairs" ? 4 : 3;
    if (tempGameStats.gridSize !== minGridSize) {
      setTempGameStats((prevStats) => ({
        ...prevStats,
        gridSize: minGridSize,
      }));
    }
  }, [tempGameStats.gameType]);

  //при переключении размера поля обновляет максимальную сложность
  useEffect(() => {

    const gridSize = tempGameStats.gridSize;
    const gameType = tempGameStats.gameType;
    const maxDifficulty = gridSizeMaxes[gameType][gridSize] || 16;

    setTempGameStats((prevStats) => ({
      ...prevStats,
      difficulty:
        prevStats.difficulty > maxDifficulty
          ? maxDifficulty
          : prevStats.difficulty,
    }));
  }, [tempGameStats.gridSize]);

  //рендер
  return (
    <div className="App">

      {/** кнопки */}

      <div className="button-container">

        {/** кнопка выключения/включения звука */}
        {gameStats.soundOn ? (
          <svg onClick={() => setGameStats((prevStats) => ({
            ...prevStats,
            soundOn: !prevStats.soundOn,
          }))} className="sound-button" enableBackground="new 0 0 91 91" height="50px" id="Layer_1" version="1.1" viewBox="0 0 91 91" width="50px" xmlSpace="preserve" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"><g stroke={gameStats.darkmode ? "#555" : "black"} strokeWidth="4"><path d="M4.025,33.079c0.282-0.031,0.243,7.27,0.074,10.954c-0.25,5.51-1.105,11.436-0.654,16.933   c0.404,4.934,4.519,5.317,8.58,5.362c2.753,0.031,10.481,0.035,11.479-0.234c8.647,6.077,18.8,9.523,27.329,15.801   c2.006,1.476,4.895-0.519,4.85-2.784c-0.441-22.71-1.446-45.437-0.958-68.155c0.041-1.918-2.223-3.238-3.865-2.216   c-8.727,5.424-17.556,10.639-25.764,16.808c-0.76-0.95-1.926-1.563-3.757-1.593c-5.691-0.098-11.62,0.913-17.313,1.256   C-1.074,25.518-0.935,33.64,4.025,33.079z M49.333,15.457c-0.932,19.176,0.059,38.327-0.031,57.51   c-7.274-4.67-15.243-8.229-22.019-13.654c-0.121-0.096-0.243-0.184-0.366-0.266c0.045-3.025,0.065-6.049,0.055-9.074   c-0.019-5.659-0.149-11.319-0.372-16.974c-0.055-1.442-0.073-2.983-0.302-4.378C33.736,23.851,41.586,19.714,49.333,15.457z    M19.577,31.293c0.284,2.656,0.053,5.583,0.137,8.069c0.117,3.536-0.09,18.555,0.202,20.102c-1.503-0.292-10.204,0.104-10.3,0.096   c-0.045-0.758-1.115-21.999-1.624-26.953C9.77,32.396,18.784,31.367,19.577,31.293z" /><path d="M65.214,69.996c-5.53,2.229-2.352,10.071,3.207,7.607c14.949-6.627,24.813-21.748,21.776-38.201   c-1.354-7.34-5.366-14.036-11.28-18.594c-2.408-1.857-5.031-3.371-7.808-4.606c-1.824-0.811-4.249-2.166-6.26-1.401   c-0.77,0.294-1.108,1.044-0.733,1.802c0.776,1.557,2.595,2.188,4.054,2.975c2.108,1.136,4.148,2.422,5.995,3.953   c4.891,4.047,8.314,9.35,9.454,15.642C86.061,52.645,77.475,65.057,65.214,69.996z" /></g></svg>
        ) : (
          <svg onClick={() => setGameStats((prevStats) => ({
            ...prevStats,
            soundOn: !prevStats.soundOn,
          }))} className="sound-button" enableBackground="new 0 0 91 91" height="50" id="Layer_1" version="1.1" viewBox="0 0 91 91" width="50" xmlSpace="preserve" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"><g stroke={gameStats.darkmode ? "#555" : "black"} strokeWidth="4"><path d="M11.459,65.569c2.541,0.028,9.67,0.032,10.591-0.217c7.978,5.607,17.348,8.788,25.219,14.58   c1.852,1.361,4.515-0.479,4.475-2.569c-0.408-20.955-1.334-41.926-0.884-62.889c0.036-1.77-2.051-2.988-3.566-2.045   c-8.054,5.004-16.203,9.817-23.777,15.509c-0.701-0.875-1.776-1.442-3.465-1.47c-5.251-0.09-10.722,0.843-15.975,1.159   c-4.705,0.285-4.577,7.779,0,7.261c0.258-0.028,0.519-0.063,0.777-0.092c-0.36,3.389-0.554,6.801-0.709,10.199   c-0.23,5.084-1.02,10.553-0.603,15.625C3.915,65.174,7.711,65.528,11.459,65.569z M45.886,18.629   c-0.862,17.694,0.055,35.367-0.028,53.068C39.144,67.387,25.313,58.927,25.2,58.852c0.042-2.792,0.059-5.582,0.051-8.373   c-0.017-5.222-0.138-10.445-0.343-15.663c-0.051-1.331-0.068-2.752-0.279-4.04C31.492,26.375,38.736,22.558,45.886,18.629z    M18.43,33.242c0.258,2.45,0.047,5.151,0.123,7.445c0.109,3.263-0.081,17.122,0.187,18.549c-1.386-0.27-9.414,0.096-9.504,0.088   c-0.04-0.699-1.027-20.299-1.497-24.871C9.376,34.259,17.696,33.31,18.43,33.242z" /><path d="M89.568,30.554c0.666-1.103-0.665-2.438-1.768-1.768c-5.641,3.412-10.476,8.761-15.282,13.368   c-4.809-4.609-9.644-9.957-15.283-13.368c-1.104-0.667-2.434,0.665-1.768,1.768c3.378,5.591,8.778,10.318,13.49,14.946   c-4.604,4.313-9.176,8.655-13.619,13.141c-2.458,2.48,1.354,6.294,3.832,3.832c4.476-4.441,8.909-8.922,13.348-13.4   c4.438,4.479,8.871,8.959,13.346,13.4c2.479,2.462,6.29-1.35,3.834-3.832c-4.446-4.486-9.016-8.828-13.62-13.141   C80.792,40.872,86.19,36.145,89.568,30.554z" /></g></svg>
        )}

        {/** кнопка темной/светлой темы */}

        <svg onClick={toggleDarkMode} className="darkmode-button" fill="none" height="50" viewBox="0 0 116 160" width="50" xmlns="http://www.w3.org/2000/svg"><g stroke={gameStats.darkmode ? "#555" : "black"} strokeWidth="4" clipPath="url(#clip0)"><path d="M100.403 93.9723C108.026 84.5791 112.923 73.2919 114.57 61.329C117.808 37.543 108.046 18.7158 87.0831 8.31582C80.6111 5.10476 73.5628 3.37841 66.8993 1.88638C49.8317 -1.93541 34.2043 1.0261 20.448 10.6853C9.25384 18.5468 3.10338 28.1492 1.64562 40.0425C0.546596 49.1026 1.14208 58.2869 3.40198 67.1313C7.96277 85.1859 16.123 99.3758 28.3483 110.51C28.6528 110.788 28.9613 111.064 29.2704 111.34C30.6314 112.484 31.8855 113.749 33.0175 115.118C34.0539 116.46 35.2477 118.193 35.2764 119.685C35.3816 125.287 35.0538 130.807 34.6839 135.935C34.4546 139.109 34.0874 142.334 33.7319 145.453C33.5143 147.359 33.2973 149.265 33.1085 151.177C32.6877 155.421 34.1417 157.544 38.1268 158.505C40.4909 159.09 42.9164 159.393 45.3523 159.409H45.5762C53.6471 159.341 61.8461 159.157 69.7802 158.978L75.0728 158.861C80.2099 158.749 82.2799 156.887 82.7105 151.99C83.4645 143.414 83.8265 136.828 83.882 130.636L83.8899 129.974C83.9343 126.301 83.984 122.157 80.7679 118.614L86.7525 111.103C91.3146 105.375 95.8649 99.6653 100.403 93.9723ZM75.1669 117.569L66.2054 116.895C66.193 116.822 66.191 116.749 66.1988 116.676C67.5194 111.62 68.8536 106.569 70.201 101.522C73.1982 90.2311 76.2966 78.5563 79.1102 67.0129C81.2815 58.1071 81.3507 50.2149 79.3199 42.8867C78.3209 39.2809 76.4234 36.6176 73.8313 35.1848C72.5826 34.5334 71.2151 34.1405 69.8102 34.03C68.4054 33.9196 66.9921 34.0937 65.6568 34.542C64.5923 34.8947 63.5669 35.3552 62.5968 35.9159L62.1983 36.1277C61.571 36.46 60.9889 36.8433 60.3727 37.2446L60.0335 37.4657C59.8643 37.2536 59.6989 37.0421 59.5342 36.832C58.9319 36.0345 58.2889 35.2682 57.6075 34.5363C53.9856 30.7698 48.774 30.403 44.636 33.6258C41.8354 35.8836 39.7128 38.8648 38.5004 42.243C34.2336 53.1406 33.9168 64.5031 37.5589 76.0139C39.4649 82.038 41.4839 88.1349 43.4395 94.0302C44.1766 96.2545 44.9119 98.4796 45.6455 100.705C47.2413 105.698 48.1749 110.876 48.4225 116.11H41.5865C41.2056 111.198 37.9273 107.868 34.7576 104.642C34.1696 104.046 33.5816 103.448 33.0112 102.839C19.9208 88.8971 12.7372 73.9651 11.0514 57.19C10.4706 51.4131 10.0406 45.262 10.8201 39.4213C11.9963 30.6083 17.0477 23.2264 26.2621 16.8524C37.485 9.08915 49.9659 6.58183 63.351 9.40004C70.4081 10.8849 77.2643 12.4843 83.5723 15.6992C99.903 24.0244 107.371 38.5122 105.166 57.5971C103.646 70.7567 97.5605 82.3599 85.4326 95.221C82.2485 98.5999 78.692 102.745 76.4587 107.873C75.2989 110.536 74.1698 113.679 75.1669 117.569ZM75.5746 133.886L75.2009 139.631H41.4095V132.867L75.5746 133.886ZM74.5285 146.977L74.3331 151.391C64.2234 151.838 52.5683 152.215 41.0617 151.341C41.0389 151.184 41.0155 151.036 40.9966 150.896C40.9136 150.484 40.8711 150.065 40.8703 149.645C40.9154 148.666 41.0109 147.682 41.1109 146.64C41.1344 146.4 41.1576 146.156 41.1807 145.909L74.5285 146.977ZM40.8227 121.832L41.7866 121.86C53.4133 122.2 64.4049 122.521 75.6445 123.687L75.8079 126.452C64.2955 127.086 52.7562 127.059 41.2474 126.368L40.8227 121.832ZM49.5229 92.2123C49.0994 90.8731 48.6734 89.5339 48.2703 88.1908C46.0748 80.9134 43.9636 73.7739 42.2674 66.4386C40.6907 59.625 41.6141 52.4138 45.1634 43.7446C45.9469 42.0089 47.0673 40.4448 48.4604 39.1418C48.7186 38.8346 49.039 38.5847 49.4007 38.4089C49.7623 38.233 50.1569 38.135 50.5591 38.1212C51.321 38.1563 52.1108 38.6553 52.906 39.6036C54.9571 42.0498 55.0012 42.6681 53.3291 45.6151C49.9274 51.6119 48.5419 57.3726 49.094 63.2256C49.2234 65.0669 49.6552 66.8737 50.3722 68.5759C50.6604 69.4331 51.1794 70.1954 51.8726 70.7794C52.5658 71.3635 53.4068 71.7472 54.3038 71.889C55.2007 72.0308 56.1195 71.9248 56.9602 71.5827C57.8008 71.2406 58.531 70.6754 59.0716 69.9489C60.2834 68.5407 61.2333 66.9284 61.8767 65.1885C64.3123 59.0183 64.7819 52.2516 63.2214 45.8066C62.7294 43.6954 64.2292 41.9221 67.3384 40.9406C68.6008 40.5419 69.5926 40.5414 70.2846 40.9362C70.6433 41.1861 70.9459 41.5077 71.1726 41.8804C71.4 42.253 71.5463 42.6687 71.6025 43.1008C72.3866 46.5382 73.3569 50.816 72.8675 54.6586C72.0181 61.3038 70.5721 68.0015 69.1719 74.4783C68.9105 75.6965 68.6498 76.9141 68.3884 78.131C67.5494 82.0692 66.6327 86.0627 65.7458 89.9241C64.5559 95.1105 63.3281 100.474 62.263 105.782C61.813 108.387 61.562 111.02 61.5123 113.662C61.464 114.722 61.4148 115.808 61.3417 116.922L53.3766 116.434C54.4606 107.823 51.9528 99.8897 49.5247 92.2123H49.5229ZM56.2732 58.6877L56.7346 55.8619C56.7328 56.8222 56.5777 57.7759 56.2752 58.6877H56.2732Z" fill="black" /></g><defs><clipPath id="clip0"><rect fill="white" height="160" transform="translate(0.777344)" width="115" /></clipPath></defs></svg>

        {/** кнопка смены темы (картинки) */}
        <div className="theme-button" onClick={() => changeTheme()}>
          {pictures[gameStats.theme][0]}
        </div>

        {/** кнопка настроек */}
        <svg className="settings-button" onClick={() => {
          setShowSettings(!showSettings);
          setGameStats(prevGameStats => ({ ...prevGameStats, block: !prevGameStats.block }));
        }} enableBackground="new 0 0 91 91" height="50px" version="1.1" viewBox="0 0 91 91" width="50px" xmlSpace="preserve" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"><g stroke={gameStats.darkmode ? "#555" : "black"} strokeWidth="4"><path d="M0.553,40.656c-0.878,6.689,3.811,12.924,10.273,14.14c-0.588,4.404-0.541,8.957-0.76,13.348   C9.774,74.012,8.754,80.368,9.45,86.182c0.586,4.897,7.045,4.906,7.633,0c0.698-5.813-0.324-12.17-0.616-18.038   c-0.217-4.376-0.171-8.915-0.754-13.309c6.126-0.909,11.207-5.365,11.572-12.029c0.374-6.82-4.081-11.881-9.983-13.928   c0.174-4.829-0.454-9.983-0.898-14.692c-0.346-3.67-0.372-7.513-1.56-11.018c-0.525-1.55-2.63-1.554-3.154,0   c-1.194,3.533-1.165,7.324-1.274,11.018c-0.161,5.337-1.283,10.851-1.063,16.187C4.891,31.165,1.095,36.539,0.553,40.656z    M6.157,40.328c0.564-2.598,2.309-4.092,4.169-5.526c0.65,0.807,1.641,1.343,2.98,1.32c3.906-0.068,8.037,2.391,7.551,6.771   c-0.512,4.601-5.636,6.607-9.791,5.565C7.631,47.596,5.411,43.756,6.157,40.328z" /><path d="M32.343,65.47c-0.867,6.613,3.708,12.772,10.057,14.086c-0.04,0.265-1.211,5.969-1.2,6.365c0,0.2,0.017,0.396,0.047,0.589   c0.101,2.715,3.452,4.345,5.737,2.968c3.395-2.046,1.92-6.779,1.289-9.953c5.777-1.154,10.452-5.521,10.802-11.907   c0.358-6.521-3.702-11.426-9.221-13.635c0.292-8.057-0.568-16.348-0.828-24.344c-0.29-8.936-0.125-18.026-1.616-26.857   c-0.263-1.563-2.891-1.563-3.155,0c-1.491,8.831-1.326,17.922-1.615,26.857c-0.264,8.111-1.143,16.533-0.812,24.698   c-0.156,0.25-0.286,0.521-0.387,0.807C36.852,55.743,32.898,61.261,32.343,65.47z M52.648,67.704   c-0.511,4.601-5.637,6.607-9.79,5.565c-3.437-0.86-5.656-4.699-4.911-8.13c0.564-2.598,2.309-4.09,4.17-5.526   c0.526,0.654,1.279,1.123,2.256,1.27c0.748,0.301,1.577,0.356,2.359,0.174C50.066,61.596,53.066,63.936,52.648,67.704z" /><path d="M75.712,3.907c-0.18,0.496-2.262,12.622-2.48,13.242c-4.589,0.6-8.544,6.117-9.096,10.327   c-0.926,7.043,4.324,13.57,11.313,14.278c-0.845,6.583-0.776,13.322-1.02,19.936c-0.298,8.026-1.383,16.498-0.621,24.492   c0.465,4.902,7.165,4.91,7.63,0c0.762-7.996-0.324-16.464-0.619-24.492c-0.246-6.67-0.172-13.468-1.042-20.107   c5.907-1.067,10.731-5.467,11.088-11.957c0.354-6.452-3.615-11.322-9.04-13.563c-0.121-1.791-0.493-3.611-0.673-5.094   c-0.251-2.045-0.168-8.363-3.094-8.944C76.738,1.764,76.16,2.672,75.712,3.907z M84.438,29.71   c-0.511,4.601-5.635,6.607-9.789,5.565c-3.438-0.861-5.657-4.7-4.91-8.128c0.564-2.6,2.309-4.091,4.169-5.528   c0.649,0.806,3.724,1.346,3.783,1.346C81.339,23.219,84.893,25.63,84.438,29.71z" /></g></svg>

      </div>

      {/** основное игровое поле */}
      <div id="grid-container" style={{}}>

        {/** кнопка перезагрузки, если игра закончена */}
        <div className={`overlay animated ${gameStats.gameOver && !showSettings ? "show" : ""}`}>
          <svg className="gameOver-button" onClick={gameReset} style={{ backgroundColor: gameStats.darkmode ? "darkgreen" : "forestgreen", fill: gameStats.darkmode ? "#ccc" : "white" }} height="32px" version="1.1" viewBox="0 0 32 32" width="32px" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"><path d="M28,16c-1.219,0-1.797,0.859-2,1.766C25.269,21.03,22.167,26,16,26c-5.523,0-10-4.478-10-10S10.477,6,16,6  c2.24,0,4.295,0.753,5.96,2H20c-1.104,0-2,0.896-2,2s0.896,2,2,2h6c1.104,0,2-0.896,2-2V4c0-1.104-0.896-2-2-2s-2,0.896-2,2v0.518  C21.733,2.932,18.977,2,16,2C8.268,2,2,8.268,2,16s6.268,14,14,14c9.979,0,14-9.5,14-11.875C30,16.672,28.938,16,28,16z" /></svg>
        </div>

        {/** маппятся все клетки */}
        {grid.map((rowArr, rowIndex) => (
          <div key={rowIndex} style={{ display: "flex" }}>
            {rowArr.map((cell, colIndex) => (
              <div
                className={`tile`}
                style={{ width: tileSize + 'px', height: tileSize + 'px', fontSize: tileSize > 0 ? tileSize / 2 : 0, borderColor: gameStats.darkmode ? "#555" : "#ccc" }}
                key={colIndex}
                onClick={() => !gameStats.block && onClickTile(rowIndex, colIndex)}
              >
                <div className="tile-picture" style={{ opacity: cell.hidden ? 0 : 1 }}>
                  {cell.hidden ? null : pics[gameStats.theme][cell.value - 1]}
                </div>
              </div>
            ))}
          </div>
        ))}

      </div>

      {/** счетчик жизней для Survival и таймер для TimeRun */}
      <div className="text-container">
      <div className="gamemode-counter">
        {gameStats.gameMode === "Survival" && `${languages[currentLanguage].survivalMsg} ${gameStats.survivalLifes + 1}`}
        {gameStats.gameMode === "TimeRun" && `${languages[currentLanguage].timeRunMsg} ${timer.timePassed}`}
      </div>

      {/** здесь всякий текст, режимы игры, сообщения о прогрессе/завершении */}
      <div className="display-text">
        {displayText}
      </div>
        </div>

      {/** окно настроек */}
      <div className="wrapper">
        <div className={`overlay animated ${showSettings ? "show" : ""}`}>
          <div className="settings-dialog" style={{ color: gameStats.darkmode ? "#555" : "black", backgroundColor: gameStats.darkmode ? "black" : "white" }}>
            <div className="settings-header">
              {/** нажатие на крестик закрывает окно и разблокирует игру */}
              <span className="close-button" onClick={() => {
                setShowSettings(false);
                setGameStats(prevGameStats => ({ ...prevGameStats, block: false }));
              }}>
                &#10006;
              </span>
              <h2 className="settings-label">{languages[currentLanguage].settings}</h2>
            </div>

            {/** выбор языка - меняется мгновенно */}
            <div className="menu-item">
              <label>{languages[currentLanguage].language}</label>
              <ul>
                {Object.keys(languages).map((lang, index) => (
                  <li key={index} className={currentLanguage === lang ? "selected" : ""} onClick={() => toggleLanguage(lang)} >
                    {languages[lang].name}
                  </li>
                ))}
              </ul>
            </div>

            {/** выбор игры - пары или тройки */}
            <div className="menu-item">
              <label>{languages[currentLanguage].gameTypeLabel}</label>
              <ul>
                {["Pairs", "Triplets"].map((option) => (
                  <li key={option} className={tempGameStats.gameType === option ? "selected" : ""} onClick={() => handleSelectChange('gameType', option)}>
                    {languages[currentLanguage].gameTypes[option]}
                  </li>
                ))}
              </ul>
            </div>

            {/** выбор размера поля - по 3 на каждый тип игры */}
            <div className="menu-item">
              <label>{languages[currentLanguage].fieldSize}</label>
              <ul>
                {([3, 4, 6, 8, 9]
                  .filter((size) =>
                    tempGameStats.gameType === "Pairs" ? size % 2 === 0 : size % 3 === 0
                  )
                  .map((size, index) => (
                    <li key={index} className={parseInt(tempGameStats.gridSize, 10) === size ? "selected" : ""} onClick={() => handleSelectChange('gridSize', size)}>
                      {size}х{size}
                    </li>
                  )))}
              </ul>
            </div>

            {/** выбор сложности - от 2 до max */}
            <div className="menu-item">
              <label>{languages[currentLanguage].difficultyLabel}</label>
              <ul>
                <li>
                  <input
                    type="range"
                    min="2"
                    max={gridSizeMaxes[tempGameStats.gameType][tempGameStats.gridSize] || 16}
                    step="1"
                    value={tempGameStats.difficulty}
                    onChange={(event) => handleSelectChange('difficulty', event.target.value)}
                  />
                  <span>{tempGameStats.gridSize === "4" && tempGameStats.difficulty > 8 ? "8" : tempGameStats.difficulty}</span>
                </li>
              </ul>
            </div>

            {/** выбор режима игры - обычный или выживание */}
            <div className="menu-item">
              <label>{languages[currentLanguage].gameModeLabel}</label>
              <ul>
                {["Classic", "Survival", "TimeRun"].map((gameMode, index) => (
                  <li key={index} className={tempGameStats.gameMode === gameMode ? "selected" : ""} onClick={() => handleSelectChange('gameMode', gameMode)}>
                    {languages[currentLanguage].gameMode[gameMode]}
                  </li>
                ))}
              </ul>
            </div>

            {/** кнопка Reset */}
            <div className="reset-button" onClick={() => {
              setGameStats({
                ...gameStats,
                gridSize: tempGameStats.gridSize,
                difficulty: tempGameStats.difficulty,
                gameMode: tempGameStats.gameMode,
                gameType: tempGameStats.gameType,
              });
              gameReset();
            }}>
              {languages[currentLanguage].reset}
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}
