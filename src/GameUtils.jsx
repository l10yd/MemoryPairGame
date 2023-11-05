//вспомогательные функции 

//перемешивает одномерный массив, используется в shufflePictures и shuffleMatrix
const shuffleArray = (arr) => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

//для перемешивания всех картинок, чтобы при перезапуске игры картинки не повторялись
const shufflePictures = (pictures) => {
  const shuffledPictures = {};

  for (const category in pictures) {
    if (pictures.hasOwnProperty(category)) {
      const originalCategory = pictures[category];

      // Клонируем и перемешиваем массив картинок
      const shuffledContent = shuffleArray([...originalCategory]);

      // Создаем новый объект для категории с перемешанным содержимым и языками
      shuffledPictures[category] = shuffledContent;
    }
  }

  return shuffledPictures;
};


//генерирует новую сетку клеток на основе длины строки и сложности из gameStats
const generateNewGrid = (arraySize, difficulty, gameType) => {

  //заполняем одномерный массив числами от 1 до difficulty (кол-во уникальных элементов)
  const values = Array.from({ length: difficulty }, (_, index) => index + 1);

  //наполняем еще один массив парами или тройками элементов из values, пока его длина не будет равна площади игрового поля (1,1,2,2 и тд)
  const length = gameType === "Pairs" ? (arraySize * arraySize) / 2 : (arraySize * arraySize) / 3;
  const filledValues = Array.from({ length }, (_, i) => {
    const duplicatedValues = Array.from({ length: gameType === "Pairs" ? 2 : 3 }, () => values[i % difficulty]);
    return duplicatedValues;
  }).flat();

  //перемешиваем одномерный массив 
  const shuffled = shuffleArray(filledValues);

  //нарезаем перемешанный одномерный массив равномерными частями и наполняем двумерный массив
  const shuffledMatrix = [];
  for (let i = 0; i < arraySize; i++) {
    shuffledMatrix.push(shuffled.slice(i * arraySize, (i + 1) * arraySize));
  }

  //добавляем в него флаги hidden, получается основа для игровой сетки
  const initialGrid = shuffledMatrix.map(row =>
    row.map(value => ({
      hidden: true,
      value: value,
    }))
  );

  return initialGrid;

}

//переводит строку формата "01:06" в целое число
const stringToSeconds = (time) => {
  const timeParts = time.split(":");
  const minutes = parseInt(timeParts[0], 10);
  const seconds = parseInt(timeParts[1], 10);

  //преобразовываем время в секунды
  const totalSeconds = minutes * 60 + seconds;
  return totalSeconds;
}

//переводит целое число в строку формата "02:15"
const secondsToString = (totalSeconds) => {
  //обрабатываем отрицательные значения
  if (totalSeconds < 0) {
    totalSeconds = 0;
  }
  //рассчитываем минуты и секунды
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

//для обновления таймера 
//получает время строкой ("02:30"), и число, которое нужно добавить
const updateTimer = (time, secondsToAdd) => {

  //переводим строку в секунды
  let totalSeconds = stringToSeconds(time);

  //добавляем или вычитаем секунды
  totalSeconds += secondsToAdd;

  //переводим секунды в строку
  const newTime = secondsToString(totalSeconds);

  return newTime;
}

export { shufflePictures, generateNewGrid, updateTimer, secondsToString, stringToSeconds };