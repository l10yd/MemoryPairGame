import {stringToSeconds} from "./GameUtils";

//сохраняет рекорд в localStorage
const saveRecord = (gameType, gridSize, difficulty, gameMode, record) => {
  const records = JSON.parse(localStorage.getItem('records')) || {};
  records[gameType] = records[gameType] || {};
  records[gameType][gridSize] = records[gameType][gridSize] || {};
  records[gameType][gridSize][difficulty] = records[gameType][gridSize][difficulty] || {};
  records[gameType][gridSize][difficulty][gameMode] = record;
  localStorage.setItem('records', JSON.stringify(records));
};

//загружает рекорд из localStorage
const loadRecord = (gameType, gridSize, difficulty, gameMode) => {
  const records = JSON.parse(localStorage.getItem('records')) || {};
  if (records[gameType] && records[gameType][gridSize] && records[gameType][gridSize][difficulty]) {
    console.log("loaded");
    return records[gameType][gridSize][difficulty][gameMode];
  }
  return null;
};

//проверяет, являются ли результаты победы рекордом
const checkRecord = (gameType, gridSize, difficulty, gameMode, timer, survivalLifes) => {
  const currentRecord = loadRecord(gameType, gridSize, difficulty, gameMode);

  if (!currentRecord) {
    // Если рекорд отсутствует, сохраните текущее время/жизни
    saveRecord(gameType, gridSize, difficulty, gameMode, { timer, survivalLifes });
  } else {
    const recordTime = stringToSeconds(currentRecord.timer);
    console.log(currentRecord.timer, recordTime);
    const currentTime = stringToSeconds(timer);
    console.log(timer, currentTime);

    // Если рекорд существует, сравните текущее время/жизни с рекордом и сохраните лучший результат
    if (gameMode === 'Classic' && currentTime < recordTime) {
      saveRecord(gameType, gridSize, difficulty, gameMode, { timer, survivalLifes });
    } 
      else if ((gameMode === 'TimeRun' || gameMode === 'TimeSurvival') && currentTime > recordTime) {
        saveRecord(gameType, gridSize, difficulty, gameMode, { timer, survivalLifes });
      }
    else if (
      (gameMode === 'Survival' || gameMode === 'TimeSurvival') &&
      survivalLifes > currentRecord.survivalLifes
    ) {
      saveRecord(gameType, gridSize, difficulty, gameMode, { timer, survivalLifes });
    } 
  }
};

export { saveRecord, loadRecord, checkRecord };