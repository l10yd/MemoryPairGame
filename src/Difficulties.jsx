//уровни сложности, используются при рендере настроек (селекторов)
//и при генерации игрового поля
const difficulties = {
  elements: {
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
    },
  languages: {
    english: {
      Easy: "Easy",
      Medium: "Medium",
      Hard: "Hard",
    },
    russian: {
      Easy: "Легко",
      Medium: "Средне",
      Hard: "Хардкор",
    }
  }
};

export default difficulties;