//языки, потом надо сюда добавить тексты из Pictures и Difficulties
const languages = {
  english: {
    name: "English",
    settings: 'Settings',
    theme: 'Theme',
    fieldSize: 'Field Size',
    fieldSizeMsg: "Size",
    difficulty: 'Difficulty (Unique elements)',
    difficultyMsg: 'Difficulty',
    reset: 'Save and Reset',
    language: "Language",
    currentThemeMsg: "Current theme: ",
    victoryMsg: "Victory! Yaay!",
    gameOverMsg: "Game Over!",
    returnMsg: "Welcome back!",
    gameModeLabel: "Game Mode",
    gameMode: {Classic: "Classic", Survival: "Survival",},
    survivalMsg: "Lifes left",    
  },
  russian: {
    name: "Русский",
    settings: 'Настройки',
    theme: 'Тема',
    fieldSize: 'Размер поля',
    fieldSizeMsg: "Поле",
    difficulty: 'Сложность (Уникальные элементы)',
    difficultyMsg: 'Сложность',
    reset: 'Сохранение и Перезапуск',
    language: "Язык",
    currentThemeMsg: "Выбрана тема: ",
    victoryMsg: "Победа! Ураа!",
    gameOverMsg: "Жизни кончились!",
    returnMsg: "Рады видеть тебя снова!",
    gameModeLabel: "Режим игры",
    gameMode: {Classic: "Обычный", Survival: "Выживание",},
    survivalMsg: "Осталось жизней"
  },
};

export default languages;