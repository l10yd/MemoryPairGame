import React, { useState, useEffect } from "react";
import './App.css';

//уровни сложности, используются при рендере настроек (селекторов)
//и при генерации игрового поля
const difficulties = {
  "4": {
    Easy: 2,
    Medium: 4,
    Hard: 8,
  },
  "6": {
    Easy: 4,
    Medium: 6,
    Hard: 9,
  },
  "8": {
    Easy: 4,
    Medium: 8,
    Hard: 16,
  },
  /*"10": {
    Easy: 5,
    Medium: 10,
    Hard: 25,
  }*/
};

//Темы из 16 картинок, будут отображаться по индексу вместо чисел grid
const pictures = {
  Fruits: ["🍎", "🍌", "🍇", "🍓", "🍊", "🍉", "🍍", "🥭", "🥑", "🍒", "🥝", "🍈", "🍑", "🍋", "🥥", "🍏"],
  Cars: ["🚗", "🚕", "🚙", "🏎️", "🚓", "🚑", "🚒", "🚐", "🚚", "🚛", "🚜", "🛵", "🏍️", "🚲", "🛴", "🚍"],
  Nature: ["🌿", "🌲", "🌹", "🌻", "🌷", "🌸", "🍁", "🌺", "🌼", "🍂", "🍀", "🍄", "🍃", "🌳", "🌰", "🏞️"],
  Animals: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🦆"],
  Emojis: ["😃", "😍", "🤣", "😎", "😁", "😄", "😅", "😆", "😂", "😊", "😇", "🥰", "😋", "🤩", "🤗", "🙂"],
  Sports: ["⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏉", "🎱", "🏓", "🏸", "🥊", "🏹", "🎿", "🏂", "🪁", "🏋️"],
}

//генерирует новую сетку клеток на основе длины строки и сложности из gameStats
const generateNewGrid = (arraySize, difficulty) => {

  //перемешивает значения одномерного массива и возвращает матрицу на основе rowLength
  function shuffleMatrix(arr, rowLength) {
    const shuffled = [...arr];
    //перемешиваем одномерный массив
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const shuffledMatrix = [];
    //нарезаем перемешанный одномерный массив равномерными частями и наполняем двумерный массив
    for (let i = 0; i < arr.length / rowLength; i++) {
      shuffledMatrix.push(shuffled.slice(i * rowLength, (i + 1) * rowLength));
    }

    return shuffledMatrix;
  }

//количество уникальных элементов (ребро) берется из объекта difficulties
  const edge = difficulties[arraySize.toString()][difficulty];

  //на основе ребра заполяем одномерный массив от 1 до длины ребра
  const values = Array.from({ length: edge }, (_, index) => index + 1); 
  const pairedValues = [];
  //дублируем этот одномерный массив, пока кол-во элементов не будет равно площади квадрата
  while (pairedValues.length < arraySize * arraySize) {
    pairedValues.push(...values);
  }
  //перемешиваем одномерный массив и получаем двумерный
  const shuffledValues = shuffleMatrix(pairedValues, arraySize); 
  //добавляем в него флаги hidden, получается основа для игровой сетки
  const initialGrid = shuffledValues.map(row =>
      row.map(value => ({
        hidden: true,
        value: value,
      }))
    );
  
  return initialGrid;

}

export default function App() {
  
  const [showSettings, setShowSettings] = useState(false);
  const [grid, setGrid] = useState(generateNewGrid(4,"Medium"));
  const [gameStats, setGameStats] = useState({
      firstSelected: null, //запоминаем последние две открытые клетки
      secondSelected: null,
      block: false, //для пауз, блокирует нажатия на клетки
    gridSize: 4, //размер поля - N*N
    difficulty: "Medium",
    theme: "Fruits",
    tileCounter: 0, //счетчик открытых клеток, при gridSize*gridSize - победа
  });
  //временные значения для окна настроек
  const [tempGameStats, setTempGameStats] = useState({
    gridSize: gameStats.gridSize,
    difficulty: gameStats.difficulty,
  })
  //текст под игровой сеткой выводится
  const [displayText, setDisplayText] = useState(`Size: ${gameStats.gridSize}x${gameStats.gridSize}, Difficulty: ${gameStats.difficulty}.`);

  //перезагрузка игры с сохранением настроек
  const gameReset = () => {
    //берем настройки из временных значений
    const newGridSize = tempGameStats.gridSize; 
    const newDifficulty = tempGameStats.difficulty; 

    setGameStats(prevGameStats => ({
      ...prevGameStats,
      firstSelected: null,
      secondSelected: null,
      block: false,
      tileCounter: 0,
      gridSize: newGridSize, 
      difficulty: newDifficulty, 
    }));

    setGrid(generateNewGrid(newGridSize, newDifficulty)); 
    setDisplayText(`Size: ${newGridSize}x${newGridSize}, Difficulty: ${newDifficulty}.`);
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

      if (gameStats.firstSelected === null) {
        //выбрана первая ячейка
        setGameStats(prevGameStats => ({ ...prevGameStats, firstSelected: { rowIndex, colIndex } }));
      } else if (gameStats.secondSelected === null) {
        //выбрана вторая ячейка
        setGameStats(prevGameStats => ({ ...prevGameStats, secondSelected: { rowIndex, colIndex } }));
      }
    }
  };

  //срабатывает после нажатия на любую закрытую клетку
  useEffect(() => {
    const { firstSelected, secondSelected, block } = gameStats;

    //если открыты 2 клетки, начинаем сравнивать
    if (firstSelected && secondSelected) {
      const firstCell = grid[firstSelected.rowIndex][firstSelected.colIndex];
      const secondCell = grid[secondSelected.rowIndex][secondSelected.colIndex];

      //если равны - получает 2 очка в счетчик и игра продолжается
      if (firstCell.value === secondCell.value) {
        // Совпадение
        setGameStats(prevGameStats => ({ ...prevGameStats, tileCounter: prevGameStats.tileCounter+2 }));
        setDisplayText("Nice!");
      //иначе - блокирует игру на таймаут, потом закрывает эти 2 клетки обратно      
      } else {
        setDisplayText("Oof..");
        //блок игры
        setGameStats(prevGameStats => ({ ...prevGameStats, block: true }));
        setTimeout(() => {
          //прячет клетки
          firstCell.hidden = true;
          secondCell.hidden = true;
          setGrid([...grid]);
          setGameStats(prevGameStats => ({
            ...prevGameStats,
            //сброс 2х выбранных клеток
            firstSelected: null,
            secondSelected: null,
            //разблокирует игру
            block: false
          }));
        }, 1000);
      }
      // сброс клеток в любом случае
      setGameStats(prevGameStats => ({
        ...prevGameStats,
        firstSelected: null,
        secondSelected: null
      }));
    }
  }, [grid]);

  //срабатывает в случае, если счетчик равен площади игрового поля
  useEffect(() => {
    if (gameStats.tileCounter === gameStats.gridSize * gameStats.gridSize) {
      setDisplayText("Victory! Yaay!");
      setGameStats(prevGameStats => ({ ...prevGameStats, block: true }));

      setTimeout(() => {
        gameReset();
      }, 3000);
    }
  }, [gameStats.tileCounter, gameStats.gridSize]);

  //смена темы - устанавливается следующее по кругу значение из pictures в gameStats
  const changeTheme = () => {
    const themes = Object.keys(pictures);
    const totalThemes = themes.length;
    const currentThemeIndex = themes.indexOf(gameStats.theme);
    const nextThemeIndex = (currentThemeIndex + 1) % totalThemes; // переход к следующей теме
    const nextTheme = themes[nextThemeIndex];

    setDisplayText(`Current theme: ${nextTheme}`);
    setGameStats(prevGameStats => ({ ...prevGameStats, theme: nextTheme }));
  };

  return (
    <div>

      <div id="button-container" style={{ display: "flex" }}>
      {/* кнопка для открытия окна настроек */}
      <button id="settings-button" onClick={() => {
      //открывает окно, запоминает временные настройки, блокирует игру
        setShowSettings(!showSettings);
        setTempGameStats({ gridSize: gameStats.gridSize, difficulty: gameStats.difficulty });
        setGameStats(prevGameStats => ({ ...prevGameStats, block: !prevGameStats.block }));
      }}>
      Settings
      </button>

      {/* кнопка для смены темы */}
      <button id="theme-button" onClick={() => changeTheme()}>
      Theme
      </button>
        </div>

      {/* всплывающее окно настроек */}
      {showSettings && (
        <div className="settings-dialog">
          <div className="settings-header">
          <span className="close-button" onClick={() => {
          //кнока закрыть закрывает окно и разблокирует игру
            setShowSettings(false);
            setGameStats(prevGameStats => ({ ...prevGameStats, block: false }));
          }}>
            &#10006;
          </span>
          <h2>Settings</h2>
          </div>
          <label>Field Size:</label>
          {/* селектор размера поля */}
          <select 
            value={tempGameStats.gridSize} 
            onChange={(event) => {
              const newGridSize = event.target.value;
              const newDifficulty = newGridSize === "4" ? "Easy" : tempGameStats.difficulty;
              setTempGameStats({ gridSize: newGridSize, difficulty: newDifficulty });
            }}
          >
            {[4, 6, 8].map((size, index) => (
              <option key={index} value={size}>
                {size}
              </option>
            ))}
          </select>
          <label>Difficulty (Unique elements):</label>
          {/* селектор сложности - количества уникальных элементов */}
          <select
            value={tempGameStats.difficulty}
            onChange={(event) => {
              const newDifficulty = event.target.value;
              setTempGameStats((prevStats) => ({
                ...prevStats,
                difficulty: newDifficulty,
              }));
            }}
          >
            {/* маппим опции в селекте через объект difficulties */}
            {Object.keys(difficulties[tempGameStats.gridSize.toString()]).map(
              (difficulty, index) => (
                <option key={index} value={difficulty}>
                  {difficulty} (
                  {difficulties[tempGameStats.gridSize.toString()][difficulty]})
                </option>
              )
            )}
          </select>

          {/* кнопка Reset */}
          <button onClick={() => {
            setGameStats({
              ...gameStats,
              gridSize: tempGameStats.gridSize,
              difficulty: tempGameStats.difficulty
            });
            gameReset();
          }}>
          Reset
          </button>
        </div>
      )}

      <div>
        
      {/* основное игровое поле */}

      {grid.map((rowArr, rowIndex) => (
        <div key={rowIndex} style={{ display: "flex" }}>
          {rowArr.map((cell, colIndex) => (
            <div
              className={`tile`}
              key={colIndex}
              onClick={() => !gameStats.block && onClickTile(rowIndex, colIndex)}
            >
              <div className="tile-picture" style={{opacity: cell.hidden ? 0 : 1}}>
              {cell.hidden ? null : pictures[gameStats.theme][cell.value-1]}
                </div>
            </div>
          ))}
        </div>
      ))}
        </div>


      <div className="display-text">
        {displayText}
      </div>

      
    </div>
  );
}
