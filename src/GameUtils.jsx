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

  //заполняем одномерный массив числами от 1 до difficulty (кол-во уникальных элементов)
  const values = Array.from({ length: difficulty }, (_, index) => index + 1); 

  //наполняем еще один массив парами элементов из values, пока его длина не будет равна площади игрового поля (1,1,2,2 и тд)
  const pairedValues = Array.from({ length: (arraySize * arraySize) / 2 }, (_, i) => [values[i % difficulty], values[i % difficulty]]).flat();

  //или можно так
  /*const pairedValues = [];
  for (let i = 0; i < (arraySize * arraySize)/2; i++) {
    pairedValues.push(values[i % edge]);
    pairedValues.push(values[i % edge]);
  }*/
  
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