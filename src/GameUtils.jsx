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
const generateNewGrid = (arraySize, difficulty) => {

//количество уникальных элементов (ребро) 
  const edge = difficulty;

  //на основе ребра заполяем одномерный массив от 1 до длины ребра
  const values = Array.from({ length: edge }, (_, index) => index + 1); 

  //дублируем этот одномерный массив, пока кол-во элементов не будет равно площади квадрата
  //кривой код, потому что у каждого элемента должна быть пара (для сложности 6х6 / 4)
  const pairedValues = [];
  for (let i = 0; i < (arraySize * arraySize)/2; i++) {
    pairedValues.push(values[i % edge]);
    pairedValues.push(values[i % edge]);
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