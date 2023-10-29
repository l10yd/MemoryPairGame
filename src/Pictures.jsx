//Темы из 16 картинок, будут отображаться по индексу вместо чисел grid
const pictures = {
  Fruits: {
    content: ["🍎", "🍌", "🍇", "🍓", "🍊", "🍉", "🍍", "🥭", "🥑", "🍒", "🥝", "🍈", "🍑", "🍋", "🥥", "🍏"],
    languages: {
      english: "Fruits",
      russian: "Фрукты"
    }
  },
  Cars: {
    content: ["🚗", "🚕", "🚙", "🏎️", "🚓", "🚑", "🚒", "🚐", "🚚", "🚛", "🚜", "🛵", "🏍️", "🚲", "🛴", "🚍"],
    languages: {
      english: "Cars",
      russian: "Машины"
    }
  },
  Nature: {
    content: ["🌲", "🌿", "🌹", "🌻", "🌷", "🌸", "🍁", "🌺", "🌼", "🍂", "🍀", "🍄", "🍃", "🌳", "🌰", "🏞️"],
    languages: {
      english: "Nature",
      russian: "Природа"
    }
  },
  Animals: {
    content: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🦆"],
    languages: {
      english: "Animals",
      russian: "Животные"
    }
  },
  Emojis: {
    content: ["😃", "😍", "🤣", "😎", "😁", "😄", "😅", "😆", "😂", "😊", "😇", "🥰", "😋", "🤩", "🤗", "🙂"],
    languages: {
      english: "Emojis",
      russian: "Эмодзи"
    }
  },
  Sports: {
    content: ["⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏉", "🎱", "🏓", "🏸", "🥊", "🏹", "🎿", "🏂", "🪁", "🏋️"],
    languages: {
      english: "Sports",
      russian: "Спорт"
    }
  },
  Food: {
    content: ["🍕", "🍔", "🍟", "🌭", "🍦", "🍩", "🍪", "🍰", "🥨", "🍗", "🍣", "🍞", "🍝", "🍯", "🍎", "🥦"],
    languages: {
      english: "Food",
      russian: "Еда"
    }
  },
  Weather: {
    content: ["☀️", "🌦️", "🌧️", "❄️", "🌪️", "🌈", "🌊", "🌬️", "⚡", "☔", "🌫️", "🌡️", "🌨️", "🌂", "🌫️", "🌥️"],
    languages: {
      english: "Weather",
      russian: "Погода"
    }
  },
  Sweets: {
    content: ["🍫", "🍬", "🍭", "🍰", "🧁", "🍪", "🍩", "🍦", "🎂", "🍯", "🥤", "🥮", "🍧", "🍮", "🥛", "🍶"],
    languages: {
      english: "Sweets",
      russian: "Сладости"
    }
  },
  Сlothes: {
    content: ["👚", "👕", "👖", "👔", "👗", "👙", "👘", "👠", "👡", "👢", "👞", "🥿", "🧦", "🧤", "🧣", "🧢"],
    languages: {
      english: "Сlothes",
      russian: "Одежда"
    }
  },
  Spooky: {
    content: ["👻", "⛓️", "⚰️", "👽", "😈", "☠️", "🕸️", "🔮", "🩸", "🕷️", "🖕", "🧿", "💀", "🤬", "🥃", "🧠"],
    languages: {
      english: "Spooky",
      russian: "Страшное"
    }
  },
  Horoscope: {
    content: ["⛎", "♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓", "☯️", "☪️", "☮️"],
    languages: {
      english: "Horoscope",
      russian: "Гороскоп"
    }
  },
  "18+": {
    content: ["🔞", "🚫", "🔥", "💋", "🍑", "🍆", "🖕", "🍒", "🤬", "🍌", "💦", "😉", "👙", "🍻", "🍷", "👨‍👨‍👦‍👦"],
    languages: {
      english: "18+",
      russian: "18+"
    }
  },
  Music: {
    content: ["🎸", "🎤", "🎧", "🎼", "🎹", "🥁", "🎷", "🎺", "🪕", "🎻", "🎶", "🎵", "💃", "🎸", "🎛️", "🎚️"],
    languages: {
      english: "Music",
      russian: "Музыка"
    }
  }
};


export default pictures;