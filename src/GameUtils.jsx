import difficulties from "./Difficulties";

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
  //проходим через все темы 
  for (const category in pictures) {
    if (pictures.hasOwnProperty(category)) {
      const originalPictures = pictures[category];
      shuffledPictures[category] = shuffleArray(originalPictures);
    }
  }
  return shuffledPictures;
}

//генерирует новую сетку клеток на основе длины строки и сложности из gameStats
const generateNewGrid = (arraySize, difficulty) => {

//количество уникальных элементов (ребро) берется из объекта difficulties
  const edge = difficulties[arraySize.toString()][difficulty];

  //на основе ребра заполяем одномерный массив от 1 до длины ребра
  const values = Array.from({ length: edge }, (_, index) => index + 1); 

  //дублируем этот одномерный массив, пока кол-во элементов не будет равно площади квадрата
  const pairedValues = [];
  while (pairedValues.length < arraySize * arraySize) {
    pairedValues.push(...values);
  }
  //перемешиваем одномерный массив 
  const shuffled = shuffleArray(pairedValues);
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

export { shuffleArray, shufflePictures, generateNewGrid };