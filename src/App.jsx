import React, { useState, useEffect } from "react";
import pictures from "./Pictures"; //картинки, по 16 на каждую тему
import messages from "./Messages"; //сообщения об успехе или ошибке
import languages from "./Languages"; //тексты на разных языках
import { shufflePictures, generateNewGrid } from "./GameUtils"; //функции для генерации игрового поля и перемешивания картинок
import './App.css';

//максимальные значения difficulty для каждого gridSize
const gridSizeMaxes = {
  Pairs: {"4":8, "6":16, "8":16},
  Triplets: {"3":3, "6":12, "9":16},
};

export default function App() {

  const [showSettings, setShowSettings] = useState(false);
  const [grid, setGrid] = useState([]);
  const [gameStats, setGameStats] = useState({
    firstSelected: null,
    secondSelected: null, //можно открыть только 2 клетки за раз
    thirdSelected: null,
    block: false, //блок игры
    gridSize: 4, //длина квадрата поля
    difficulty: 4, //сложность, влияет на количество уникальных элементов
    gameType: "Pairs", //тип игры, пары или тройки
    gameMode: "Classic", //режим игры, обычный или выживание
    theme: 'Fruits', //выбранная тема из Pictures
    stepCounter: 0, //счетчик шагов, обновляется при открытии 2х-3х клеток, выводится при победе
    tileCounter: 0, //счетчик открытых клеток, если равен площади квадрата поля - победа
    survivalLifes: 8, //жизни для режима Survival
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


  })

  //временные значения для окна настроек
  const [tempGameStats, setTempGameStats] = useState({
    gridSize: gameStats.gridSize,
    difficulty: gameStats.difficulty,
    gameMode: gameStats.gameMode,
    gameType: gameStats.gameType,
  })
  //текст под игровой сеткой выводится
  const [displayText, setDisplayText] = useState(`Поле: 4х4, Сложность: 4.`);
  //картинки хранятся в отдельном объекте, но будут перемешиватсья при ресете
  const [pics, setPics] = useState([]);
  //смена языка
  const [currentLanguage, setCurrentLanguage] = useState('russian');
  //размер одной клетки игрового поля
  const [tileSize, setTileSize] = useState(40);

  //для смены языка
  const toggleLanguage = (lang) => {
    setCurrentLanguage(lang);
    localStorage.setItem('language', lang);
  };

  //загрузка из localStorage на старте
  useEffect(() => {
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
      const newGrid = generateNewGrid(4, 4, "Pairs");
      setGrid(newGrid);
      localStorage.setItem('grid', JSON.stringify(newGrid));
    }

    // Получаем и устанавливаем gameStats из localStorage
    const savedGameStats = JSON.parse(localStorage.getItem('gameStats'));
    if (savedGameStats) {
      //блок снимаем на всякий случай
      setGameStats((prevGameStats) => ({ ...savedGameStats, block: false }));
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

  }, []);

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
        block: false,
        tileCounter: 0,
        stepCounter: 0,
        survivalLifes: (parseInt(newGridSize, 10)+parseInt(newDifficulty, 10))*multiplier, //жизней пока что х2
        gridSize: newGridSize,
        difficulty: newDifficulty,
        gameMode: newGameMode,
        gameType: newGameType,
      };
      localStorage.setItem('gameStats', JSON.stringify(newGameStats));
      return newGameStats;
    });

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

  //обработка нажатия на клетку
  const onClickTile = (rowIndex, colIndex) => {
    //если клетка еще закрыта и нету блока
    if (!gameStats.block && grid[rowIndex][colIndex].hidden) {
      const updatedGrid = [...grid];
      updatedGrid[rowIndex][colIndex] = { ...updatedGrid[rowIndex][colIndex], hidden: false };
      setGrid(updatedGrid);
      localStorage.setItem('grid', JSON.stringify(updatedGrid));

      if (gameStats.firstSelected === null) {
        //выбрана первая ячейка
        setGameStats(prevGameStats => {
          const newGameStats = { ...prevGameStats, firstSelected: { rowIndex, colIndex } };
          localStorage.setItem('gameStats', JSON.stringify(newGameStats));
          return newGameStats;
        });
      } else if (gameStats.secondSelected === null) {
        //выбрана вторая ячейка
        setGameStats(prevGameStats => {
          const newGameStats = { ...prevGameStats, secondSelected: { rowIndex, colIndex } };
          localStorage.setItem('gameStats', JSON.stringify(newGameStats));
          return newGameStats;
        });
      } else if (gameStats.thirdSelected === null) {
        //выбрана третья ячейка
        setGameStats(prevGameStats => {
          const newGameStats = { ...prevGameStats, thirdSelected: { rowIndex, colIndex } };
          localStorage.setItem('gameStats', JSON.stringify(newGameStats));
          return newGameStats;
        });
      }
      localStorage.setItem('gameStats', JSON.stringify(gameStats));
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

  //логика для режима Pairs
  //срабатывает после нажатия на любую закрытую клетку
  useEffect(() => {

    const { firstSelected, secondSelected, thirdSelected } = gameStats;

    //если открыты 2 клетки, начинаем сравнивать
    if (firstSelected && secondSelected && gameStats.gameType==="Pairs") {
      const firstCell = grid[firstSelected.rowIndex][firstSelected.colIndex];
      const secondCell = grid[secondSelected.rowIndex][secondSelected.colIndex];
      
      //если равны - получает 2 очка в счетчик, 1 жизнь в выживании и игра продолжается
      if (firstCell.value === secondCell.value) {
        // Совпадение
        setGameStats(prevGameStats => {
          const updatedGameStats = {
            ...prevGameStats,
            tileCounter: prevGameStats.tileCounter + 2,
            survivalLifes: prevGameStats.survivalLifes + 1,
            stepCounter: prevGameStats.stepCounter + 1
          };
          localStorage.setItem('gameStats', JSON.stringify(updatedGameStats));
          return updatedGameStats;
        });
        //выбирает случайное значение из объекта messages в соответствии с выбранным языком
        const randomSuccessMessage =
          messages[currentLanguage].Success[Math.floor(Math.random() * messages[currentLanguage].Success.length)];
        setDisplayText(randomSuccessMessage);

        //две открытые клетки не равны
      } else {
        //блок игры
        setGameStats(prevGameStats => {
          const updatedGameStats = {
            ...prevGameStats,
            block: true,
            survivalLifes: prevGameStats.survivalLifes - 1,
            stepCounter: prevGameStats.stepCounter + 1
          };
          localStorage.setItem('gameStats', JSON.stringify(updatedGameStats));
          return updatedGameStats;
        });
        //если жизни кончились в сурвайвалрежиме, перезапуск игры через 3 сек
        if (gameStats.survivalLifes === 0 && gameStats.gameMode === "Survival") {
          setDisplayText(languages[currentLanguage].gameOverMsg);
          setTimeout(() => {
            gameReset();
          }, 3000);
        }
        //иначе если игра продолжается -  блокирует игру на таймаут, потом закрывает 2 последние клетки обратно   
        else {
          //выбирает случайное значение из объекта messages в соответствии с выбранным языком
          const randomErrorMessage =
            messages[currentLanguage].Error[Math.floor(Math.random() * messages[currentLanguage].Error.length)];
          setDisplayText(randomErrorMessage);

          setTimeout(() => {
            //прячет клетки
            setGrid(prevGrid => {
              const newGrid = [...prevGrid];
              newGrid[firstSelected.rowIndex][firstSelected.colIndex].hidden = true;
              newGrid[secondSelected.rowIndex][secondSelected.colIndex].hidden = true;
              localStorage.setItem('grid', JSON.stringify(newGrid));
              return newGrid;
            });

            // сброс клеток в любом случае
            setGameStats(prevGameStats => {
              const newGameStats = { ...prevGameStats, block: false };
              localStorage.setItem('gameStats', JSON.stringify(newGameStats));
              return newGameStats;
            });
          }, 1000);
        }
      }
      // сброс клеток в любом случае
      setGameStats(prevGameStats => {
        const newGameStats = { ...prevGameStats, firstSelected: null, secondSelected: null };
        localStorage.setItem('gameStats', JSON.stringify(newGameStats));
        return newGameStats;
      });

    }

    //заодно меняем размер клеток игрового поля в зависимости от текущих размеров экрана
    updateTileSize();
    window.addEventListener('resize', updateTileSize);

    return () => {
      window.removeEventListener('resize', updateTileSize);
    };


  }, [grid]);

  
  // та же логика для режима Триплет, нужно переработать!
  useEffect(() => {

      const { firstSelected, secondSelected, thirdSelected } = gameStats;

      // Если открыты 3 клетки, начинаем сравнивать
      if (thirdSelected && gameStats.gameType==="Triplets") {
        const firstCell = grid[firstSelected.rowIndex][firstSelected.colIndex];
        const secondCell = grid[secondSelected.rowIndex][secondSelected.colIndex];
        const thirdCell = grid[thirdSelected.rowIndex][thirdSelected.colIndex];

        // Если все три клетки равны - получаем 3 очка в счетчик, 1 жизнь в выживании и игра продолжается
        if (firstCell.value === secondCell.value && secondCell.value === thirdCell.value) {
          // Совпадение
          setGameStats(prevGameStats => {
            const updatedGameStats = {
              ...prevGameStats,
              tileCounter: prevGameStats.tileCounter + 3,
              survivalLifes: prevGameStats.survivalLifes + 1,
              stepCounter: prevGameStats.stepCounter + 1
            };
            localStorage.setItem('gameStats', JSON.stringify(updatedGameStats));
            return updatedGameStats;
          });
          // Выбираем случайное значение из объекта messages в соответствии с выбранным языком
          const randomSuccessMessage =
            messages[currentLanguage].Success[Math.floor(Math.random() * messages[currentLanguage].Success.length)];
          setDisplayText(randomSuccessMessage);

          // Три открытые клетки не равны
        } else {
          // Блок игры
          setGameStats(prevGameStats => {
            const updatedGameStats = {
              ...prevGameStats,
              block: true,
              survivalLifes: prevGameStats.survivalLifes - 1,
              stepCounter: prevGameStats.stepCounter + 1
            };
            localStorage.setItem('gameStats', JSON.stringify(updatedGameStats));
            return updatedGameStats;
          });
          // Если жизни кончились в режиме "Survival", перезапускаем игру через 3 секунды
          if (gameStats.survivalLifes === 0 && gameStats.gameMode === "Survival") {
            setDisplayText(languages[currentLanguage].gameOverMsg);
            setTimeout(() => {
              gameReset();
            }, 3000);
          }
          // Иначе если игра продолжается - блокируем игру на таймаут, потом закрываем 3 последние клетки обратно
          else {
            // Выбираем случайное значение из объекта messages в соответствии с выбранным языком
            const randomErrorMessage =
              messages[currentLanguage].Error[Math.floor(Math.random() * messages[currentLanguage].Error.length)];
            setDisplayText(randomErrorMessage);

            setTimeout(() => {
              // Прячем клетки
              setGrid(prevGrid => {
                const newGrid = [...prevGrid];
                newGrid[firstSelected.rowIndex][firstSelected.colIndex].hidden = true;
                newGrid[secondSelected.rowIndex][secondSelected.colIndex].hidden = true;
                newGrid[thirdSelected.rowIndex][thirdSelected.colIndex].hidden = true;
                localStorage.setItem('grid', JSON.stringify(newGrid));
                return newGrid;
              });

              // Сбрасываем клетки в любом случае
              setGameStats(prevGameStats => {
                const newGameStats = { ...prevGameStats, block: false };
                localStorage.setItem('gameStats', JSON.stringify(newGameStats));
                return newGameStats;
              });
            }, 1000);
          }
        }
        // Сбрасываем клетки в любом случае
        setGameStats(prevGameStats => {
          const newGameStats = { ...prevGameStats, firstSelected: null, secondSelected: null, thirdSelected: null };
          localStorage.setItem('gameStats', JSON.stringify(newGameStats));
          return newGameStats;
        });
      }
  }, [grid]);
  
  //срабатывает в случае, если счетчик равен площади игрового поля
  useEffect(() => {
    if (gameStats.tileCounter === gameStats.gridSize * gameStats.gridSize) {
      //победа, блок и перезапуск через 3 сек
      setDisplayText(`${languages[currentLanguage].victoryMsg} ${gameStats.stepCounter}`);
      setGameStats(prevGameStats => ({ ...prevGameStats, block: true }));
      setTimeout(() => {
        gameReset();
      }, 3000);
    }
  }, [gameStats.tileCounter, gameStats.gridSize]);

  //смена темы - устанавливается следующее по кругу значение из pictures в gameStats
  const changeTheme = () => {
    const themes = Object.keys(pictures);
    const currentThemeIndex = themes.indexOf(gameStats.theme);
    const nextThemeIndex = (currentThemeIndex + 1) % themes.length; // переход к следующей теме
    const nextTheme = themes[nextThemeIndex];

    //выводит строку по типу Тема: Фрукты
    setDisplayText(`${languages[currentLanguage].currentThemeMsg}${languages[currentLanguage].pictures[nextTheme] || nextTheme}`);

    setGameStats(prevGameStats => {
      const newGameStats = { ...prevGameStats, theme: nextTheme };
      localStorage.setItem('gameStats', JSON.stringify(newGameStats));
      return newGameStats;
    });
  };

  //для селекторов настроек (размер поля, сложность, режим игры)
  //запоминает временные настройки
  const handleSelectChange = (field, value) => {
    setTempGameStats((prevStats) => ({
      ...prevStats,
      [field]: value,
    }));
  };

  //при переключении типа игры устанавливает размер поля как минимальный
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

  return (
    <div>

      {/** кнопки */}
      <div className="button-container">
        {/** кнопка смены темы */}
        <button id="theme-button" onClick={() => changeTheme()}>
          {languages[currentLanguage].theme}: {pictures[gameStats.theme][0]}
        </button>
        {/** кнопка настроек */}
        <button id="settings-button" onClick={() => {
          setShowSettings(!showSettings);

          setGameStats(prevGameStats => ({ ...prevGameStats, block: !prevGameStats.block }));
        }}>
          {languages[currentLanguage].settings}
        </button>
      </div>

      {/** окно настроек */}
      {showSettings && (
        <div className="settings-dialog">
          <div className="settings-header">
            {/** нажатие на крестик закрывает окно и разблокирует игру */}
            <span className="close-button" onClick={() => {
              setShowSettings(false);
              setGameStats(prevGameStats => ({ ...prevGameStats, block: false }));
            }}>
              &#10006;
            </span>
            <h2>{languages[currentLanguage].settings}</h2>
          </div>

          {/** выбор языка */}
          <label>{languages[currentLanguage].language}:</label>
          <select
            value={currentLanguage}
            onChange={(e) => toggleLanguage(e.target.value)}
          >
            {Object.keys(languages).map((lang, index) => (
              <option key={index} value={lang}>
                {languages[lang].name}
              </option>
            ))}
          </select>

          {/** выбор игры - пары или тройки */}
          <label>{languages[currentLanguage].gameTypeLabel}</label>
          <div class="gameType-container">
            {["Pairs", "Triplets"].map((option) => (
              <div key={option}>
                <input
                  type="radio"
                  id={option}
                  name="gameType"
                  value={option}
                  checked={tempGameStats.gameType === option}
                  onChange={() => handleSelectChange('gameType', option)}
                />
                 <span>{languages[currentLanguage].gameTypes[option]}</span>
              </div>
            ))}
          </div>


          {/** размер поля */}
          <label>{languages[currentLanguage].fieldSize}:</label>
          <select
            value={tempGameStats.gridSize}
            onChange={(event) => { handleSelectChange('gridSize', event.target.value) }}
          >
            {([3, 4, 6, 8, 9]
              .filter((size) =>
                tempGameStats.gameType === "Pairs" ? size % 2 === 0 : size % 3 === 0
              )
              .map((size, index) => (
                <option key={index} value={size}>
                  {size}х{size}
                </option>
              )))}
          </select>

          {/** выбор сложности */}
          <label>{languages[currentLanguage].difficultyLabel}:</label>
          <input
            type="range"
            min="2"
            max={gridSizeMaxes[tempGameStats.gameType][tempGameStats.gridSize] || 16}
            step="1"
            value={tempGameStats.difficulty}
            onChange={(event) => handleSelectChange('difficulty', event.target.value)}
          />
          <span>{tempGameStats.gridSize === "4" && tempGameStats.difficulty > 8 ? "8" : tempGameStats.difficulty}</span>

          {/* режим игры */}
          <label>{languages[currentLanguage].gameModeLabel}</label>
          <select
            value={tempGameStats.gameMode}
            onChange={(event) => handleSelectChange('gameMode', event.target.value)}
          >
            {["Classic", "Survival"].map((gameMode, index) => (
              <option key={index} value={gameMode}>
                {languages[currentLanguage].gameMode[gameMode]}
              </option>
            ))}
          </select>

          {/** кнопка Reset */}
          <button onClick={() => {
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
          </button>
        </div>
      )}

      {/** основное игровое поле */}
      <div id="grid-container" style={{}}>

        {grid.map((rowArr, rowIndex) => (
          <div key={rowIndex} style={{ display: "flex" }}>
            {rowArr.map((cell, colIndex) => (
              <div
                className={`tile`}
                style={{ width: tileSize + 'px', height: tileSize + 'px', fontSize: tileSize > 0 ? tileSize / 2 : 0, }}
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

      {/** счетчик жизней, выводится только в режиме Survival */}
      <div className="survival-mode-counter">
        {gameStats.gameMode === "Survival" && `${languages[currentLanguage].survivalMsg}: ${gameStats.survivalLifes + 1}`}
      </div>

      {/** здесь всякий текст, режимы игры, сообщения о прогрессе/завершении */}
      <div className="display-text">
        {displayText}
      </div>

    </div>
  );
}
