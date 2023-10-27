import React, { useState, useEffect } from "react";
import './App.css';

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

  //если легкая сложность - количество пар элементов в массиве равно количеству строк
  //иначе, если 4х4 - 8 пар, если больше - кол-во элементов / 4
  const edge = difficulty === "Easy" ? arraySize : (arraySize === 4 ? arraySize * 2 : (arraySize / 2) * (arraySize / 2));
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
  const [grid, setGrid] = useState(generateNewGrid(4,"Easy"));
  const [gameStats, setGameStats] = useState({
      firstSelected: null, //запоминаем последние две открытые клетки
      secondSelected: null,
      block: false, //для пауз, блокирует нажатия на клетки
    gridSize: 4, //размер поля N*N
    difficulty: "Easy",
    tileCounter: 0, //счетчик открытых клеток, при gridSize*gridSize - победа
  });
  //временные значения для окна настроек
  const [tempGameStats, setTempGameStats] = useState({
    gridSize: gameStats.gridsize,
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

  return (
    <div>

      {/* кнопка для открытия окна настроек */}
      <button onClick={() => {
      //открывает окно, запоминает временные настройки, блокирует игру
        setShowSettings(!showSettings);
        setTempGameStats({ gridSize: gameStats.gridSize, difficulty: gameStats.difficulty });
        setGameStats(prevGameStats => ({ ...prevGameStats, block: !prevGameStats.block }));
      }}>
      Settings
      </button>

      {/* всплывающее окно настроек */}
      {showSettings && (
        <div className="settings-dialog">
          <span className="close-button" onClick={() => {
          //кнока закрыть закрывает окно и разблокирует игру
            setShowSettings(false);
            setGameStats(prevGameStats => ({ ...prevGameStats, block: false }));
          }}>
            &#10006;
          </span>
          <h2>Settings</h2>
          <label>Field Size:</label>
          <select 
            value={tempGameStats.gridSize} 
            onChange={(event) => setTempGameStats({ ...tempGameStats, gridSize: event.target.value })}
          >
            <option value="4">4</option>
            <option value="6">6</option>
            <option value="8">8</option>
          </select>
          <label>Difficulty:</label>
          <select 
            value={tempGameStats.difficulty} 
            onChange={(event) => {
              setTempGameStats({ ...tempGameStats, difficulty: event.target.value });
            }}
          >
            <option value="Easy">Easy</option>
            <option value="Hard">Hard</option>
          </select>
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
              style={{
                backgroundColor: "transparent",
                borderColor: "black",
              }}
              onClick={() => !gameStats.block && onClickTile(rowIndex, colIndex)}
            >
              {cell.hidden ? null : cell.value}
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
