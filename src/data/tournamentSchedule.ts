import { JuniorTournament, Tournament } from "../types/game";

export const TOURNAMENT_SCHEDULE: Record<number, Tournament[]> = {
  "1": [
    {
      "name": "Brisbane International",
      "surface": "hard",
      "level": "atp250",
      "country": "Australia",
      "participants": 32,
      "points": 250,
      "prize_money": 642735
    },
    {
      "name": "Hong Kong Open",
      "surface": "hard",
      "level": "atp250",
      "country": "Hong Kong",
      "participants": 32,
      "points": 250,
      "prize_money": 642735
    },
    {
      "name": "Noumea Challenger",
      "surface": "hard",
      "level": "challenger125",
      "country": "France",
      "participants": 32,
      "points": 125,
      "prize_money": 159360
    },
    {
      "name": "Bangkok Challenger",
      "surface": "hard",
      "level": "challenger75",
      "country": "Thailand",
      "participants": 32,
      "points": 75,
      "prize_money": 53000
    }
  ],
  "2": [
    {
      "name": "Adelaide International",
      "surface": "hard",
      "level": "atp250",
      "country": "Australia",
      "participants": 32,
      "points": 250,
      "prize_money": 642735
    },
    {
      "name": "Canberra Challenger",
      "surface": "hard",
      "level": "challenger100",
      "country": "Australia",
      "participants": 32,
      "points": 100,
      "prize_money": 106240
    },
    {
      "name": "Nonthaburi Challenger",
      "surface": "hard",
      "level": "challenger75",
      "country": "Thailand",
      "participants": 32,
      "points": 75,
      "prize_money": 53000
    }
  ],
  "3": [
    {
      "name": "Australian Open",
      "surface": "hard",
      "level": "grand_slam",
      "country": "Australia",
      "participants": 128,
      "points": 2000,
      "prize_money": 2300000
    }
  ],
  "4": [
    {
      "name": "Traralgon Challenger",
      "surface": "hard",
      "level": "challenger100",
      "country": "Australia",
      "participants": 32,
      "points": 100,
      "prize_money": 106240
    },
    {
      "name": "Bangkok Challenger",
      "surface": "hard",
      "level": "challenger75",
      "country": "Thailand",
      "participants": 32,
      "points": 75,
      "prize_money": 53000
    },
    {
      "name": "Burnie Challenger",
      "surface": "hard",
      "level": "challenger75",
      "country": "Australia",
      "participants": 32,
      "points": 75,
      "prize_money": 53000
    }
  ],
  "5": [
    {
      "name": "Montpellier Open",
      "surface": "hard",
      "level": "atp250",
      "country": "France",
      "participants": 32,
      "points": 250,
      "prize_money": 642735
    },
    {
      "name": "Dallas Open",
      "surface": "hard",
      "level": "atp250",
      "country": "USA",
      "participants": 32,
      "points": 250,
      "prize_money": 642735
    },
    {
      "name": "Pune Open",
      "surface": "hard",
      "level": "atp250",
      "country": "India",
      "participants": 32,
      "points": 250,
      "prize_money": 642735
    },
    {
      "name": "Quimper Challenger",
      "surface": "hard",
      "level": "challenger100",
      "country": "France",
      "participants": 32,
      "points": 100,
      "prize_money": 106240
    },
    {
      "name": "Cherbourg Challenger",
      "surface": "hard",
      "level": "challenger75",
      "country": "France",
      "participants": 32,
      "points": 75,
      "prize_money": 53000
    }
  ],
  "6": [
    {
      "name": "Rotterdam Open",
      "surface": "hard",
      "level": "atp500",
      "country": "Netherlands",
      "participants": 32,
      "points": 500,
      "prize_money": 2074505
    },
    {
      "name": "Cordoba Open",
      "surface": "clay",
      "level": "atp250",
      "country": "Argentina",
      "participants": 32,
      "points": 250,
      "prize_money": 642735
    },
    {
      "name": "Bergamo Challenger",
      "surface": "hard",
      "level": "challenger125",
      "country": "Italy",
      "participants": 32,
      "points": 125,
      "prize_money": 159360
    },
    {
      "name": "Cleveland Challenger",
      "surface": "hard",
      "level": "challenger100",
      "country": "USA",
      "participants": 32,
      "points": 100,
      "prize_money": 106240
    }
  ],
  "7": [
    {
      "name": "Buenos Aires Open",
      "surface": "clay",
      "level": "atp250",
      "country": "Argentina",
      "participants": 32,
      "points": 250,
      "prize_money": 642735
    },
    {
      "name": "Delray Beach Open",
      "surface": "hard",
      "level": "atp250",
      "country": "USA",
      "participants": 32,
      "points": 250,
      "prize_money": 642735
    },
    {
      "name": "Qatar Open",
      "surface": "hard",
      "level": "atp250",
      "country": "Qatar",
      "participants": 32,
      "points": 250,
      "prize_money": 642735
    },
    {
      "name": "Bengaluru Challenger",
      "surface": "hard",
      "level": "challenger100",
      "country": "India",
      "participants": 32,
      "points": 100,
      "prize_money": 106240
    },
    {
      "name": "Chennai Challenger",
      "surface": "hard",
      "level": "challenger75",
      "country": "India",
      "participants": 32,
      "points": 75,
      "prize_money": 53000
    }
  ],
  "8": [
    {
      "name": "Rio Open",
      "surface": "clay",
      "level": "atp500",
      "country": "Brazil",
      "participants": 32,
      "points": 500,
      "prize_money": 2074505
    },
    {
      "name": "Marseille Open",
      "surface": "hard",
      "level": "atp250",
      "country": "France",
      "participants": 32,
      "points": 250,
      "prize_money": 642735
    },
    {
      "name": "Dallas Challenger",
      "surface": "hard",
      "level": "challenger125",
      "country": "USA",
      "participants": 32,
      "points": 125,
      "prize_money": 159360
    },
    {
      "name": "Sao Paulo Challenger",
      "surface": "clay",
      "level": "challenger100",
      "country": "Brazil",
      "participants": 32,
      "points": 100,
      "prize_money": 106240
    }
  ],
  "9": [
    {
      "name": "Dubai Tennis Championships",
      "surface": "hard",
      "level": "atp500",
      "country": "UAE",
      "participants": 32,
      "points": 500,
      "prize_money": 2074505
    },
    {
      "name": "Acapulco Open",
      "surface": "hard",
      "level": "atp500",
      "country": "Mexico",
      "participants": 32,
      "points": 500,
      "prize_money": 2074505
    },
    {
      "name": "Santiago Open",
      "surface": "clay",
      "level": "atp250",
      "country": "Chile",
      "participants": 32,
      "points": 250,
      "prize_money": 642735
    },
    {
      "name": "Monterrey Challenger",
      "surface": "hard",
      "level": "challenger100",
      "country": "Mexico",
      "participants": 32,
      "points": 100,
      "prize_money": 106240
    }
  ],
  "10": [
    {
      "name": "Indian Wells Masters",
      "surface": "hard",
      "level": "masters",
      "country": "USA",
      "participants": 128,
      "points": 1000,
      "prize_money": 8800000
    },
    {
      "name": "Phoenix Challenger",
      "surface": "hard",
      "level": "challenger125",
      "country": "USA",
      "participants": 32,
      "points": 125,
      "prize_money": 159360
    },
    {
      "name": "Irving Challenger",
      "surface": "hard",
      "level": "challenger75",
      "country": "USA",
      "participants": 32,
      "points": 75,
      "prize_money": 53000
    }
  ],
  "11": [
    {
      "name": "Miami Open",
      "surface": "hard",
      "level": "masters",
      "country": "USA",
      "participants": 128,
      "points": 1000,
      "prize_money": 8800000
    },
    {
      "name": "Phoenix Challenger",
      "surface": "hard",
      "level": "challenger125",
      "country": "USA",
      "participants": 32,
      "points": 125,
      "prize_money": 159360
    },
    {
      "name": "Santiago Challenger",
      "surface": "clay",
      "level": "challenger75",
      "country": "Chile",
      "participants": 32,
      "points": 75,
      "prize_money": 53000
    }
  ],
  "12": [
    {
      "name": "Barletta Challenger",
      "surface": "clay",
      "level": "challenger125",
      "country": "Italy",
      "participants": 32,
      "points": 125,
      "prize_money": 159360
    },
    {
      "name": "Sophia Antipolis Challenger",
      "surface": "clay",
      "level": "challenger100",
      "country": "France",
      "participants": 32,
      "points": 100,
      "prize_money": 106240
    }
  ],
  "13": [
    {
      "name": "Madrid Challenger",
      "surface": "clay",
      "level": "challenger100",
      "country": "Spain",
      "participants": 32,
      "points": 100,
      "prize_money": 106240
    },
    {
      "name": "Lille Challenger",
      "surface": "hard",
      "level": "challenger100",
      "country": "France",
      "participants": 32,
      "points": 100,
      "prize_money": 106240
    },
    {
      "name": "Oeiras Challenger",
      "surface": "clay",
      "level": "challenger75",
      "country": "Portugal",
      "participants": 32,
      "points": 75,
      "prize_money": 53000
    }
  ],
  "14": [
    {
      "name": "Monte Carlo Masters",
      "surface": "clay",
      "level": "masters",
      "country": "Monaco",
      "participants": 64,
      "points": 1000,
      "prize_money": 5779335
    },
    {
      "name": "Houston Open",
      "surface": "clay",
      "level": "atp250",
      "country": "USA",
      "participants": 32,
      "points": 250,
      "prize_money": 642735
    },
    {
      "name": "Marrakech Open",
      "surface": "clay",
      "level": "atp250",
      "country": "Morocco",
      "participants": 32,
      "points": 250,
      "prize_money": 642735
    },
    {
      "name": "Alicante Challenger",
      "surface": "clay",
      "level": "challenger75",
      "country": "Spain",
      "participants": 32,
      "points": 75,
      "prize_money": 53000
    }
  ],
  "15": [
    {
      "name": "Barcelona Open",
      "surface": "clay",
      "level": "atp500",
      "country": "Spain",
      "participants": 64,
      "points": 500,
      "prize_money": 2722480
    },
    {
      "name": "Munich Open",
      "surface": "clay",
      "level": "atp250",
      "country": "Germany",
      "participants": 32,
      "points": 250,
      "prize_money": 642735
    },
    {
      "name": "Bucharest Open",
      "surface": "clay",
      "level": "atp250",
      "country": "Romania",
      "participants": 32,
      "points": 250,
      "prize_money": 642735
    },
    {
      "name": "Sarasota Challenger",
      "surface": "clay",
      "level": "challenger100",
      "country": "USA",
      "participants": 32,
      "points": 100,
      "prize_money": 106240
    },
    {
      "name": "Split Challenger",
      "surface": "clay",
      "level": "challenger75",
      "country": "Croatia",
      "participants": 32,
      "points": 75,
      "prize_money": 53000
    }
  ],
  "16": [
    {
      "name": "Madrid Open",
      "surface": "clay",
      "level": "masters",
      "country": "Spain",
      "participants": 64,
      "points": 1000,
      "prize_money": 7705780
    },
    {
      "name": "Zadar Challenger",
      "surface": "clay",
      "level": "challenger75",
      "country": "Croatia",
      "participants": 32,
      "points": 75,
      "prize_money": 53000
    }
  ],
  "17": [
    {
      "name": "Italian Open",
      "surface": "clay",
      "level": "masters",
      "country": "Italy",
      "participants": 64,
      "points": 1000,
      "prize_money": 7705780
    },
    {
      "name": "Rome Challenger",
      "surface": "clay",
      "level": "challenger100",
      "country": "Italy",
      "participants": 32,
      "points": 100,
      "prize_money": 106240
    },
    {
      "name": "Bordeaux Challenger",
      "surface": "clay",
      "level": "challenger75",
      "country": "France",
      "participants": 32,
      "points": 75,
      "prize_money": 53000
    }
  ],
  "18": [
    {
      "name": "Bordeaux Challenger",
      "surface": "clay",
      "level": "challenger125",
      "country": "France",
      "participants": 32,
      "points": 125,
      "prize_money": 159360
    },
    {
      "name": "Aix-en-Provence Challenger",
      "surface": "clay",
      "level": "challenger100",
      "country": "France",
      "participants": 32,
      "points": 100,
      "prize_money": 106240
    },
    {
      "name": "Lisbon Challenger",
      "surface": "clay",
      "level": "challenger75",
      "country": "Portugal",
      "participants": 32,
      "points": 75,
      "prize_money": 53000
    },
    {
      "name": "Rome Challenger",
      "surface": "clay",
      "level": "challenger75",
      "country": "Italy",
      "participants": 32,
      "points": 75,
      "prize_money": 53000
    }
  ],
  "19": [
    {
      "name": "Geneva Open",
      "surface": "clay",
      "level": "atp250",
      "country": "Switzerland",
      "participants": 32,
      "points": 250,
      "prize_money": 642735
    },
    {
      "name": "Lyon Open",
      "surface": "clay",
      "level": "atp250",
      "country": "France",
      "participants": 32,
      "points": 250,
      "prize_money": 642735
    },
    {
      "name": "Heilbronn Challenger",
      "surface": "clay",
      "level": "challenger125",
      "country": "Germany",
      "participants": 32,
      "points": 125,
      "prize_money": 159360
    },
    {
      "name": "Prostejov Challenger",
      "surface": "clay",
      "level": "challenger100",
      "country": "Czech Republic",
      "participants": 32,
      "points": 100,
      "prize_money": 106240
    },
    {
      "name": "Perugia Challenger",
      "surface": "clay",
      "level": "challenger75",
      "country": "Italy",
      "participants": 32,
      "points": 75,
      "prize_money": 53000
    }
  ],
  "20": [
    {
      "name": "Surbiton Challenger",
      "surface": "grass",
      "level": "challenger125",
      "country": "England",
      "participants": 32,
      "points": 125,
      "prize_money": 159360
    },
    {
      "name": "Rosmalen Challenger",
      "surface": "grass",
      "level": "challenger100",
      "country": "Netherlands",
      "participants": 32,
      "points": 100,
      "prize_money": 106240
    }
  ],
  "21": [
    {
      "name": "Bratislava Challenger",
      "surface": "clay",
      "level": "challenger100",
      "country": "Slovakia",
      "participants": 32,
      "points": 100,
      "prize_money": 106240
    },
    {
      "name": "Ludwigshafen Challenger",
      "surface": "clay",
      "level": "challenger75",
      "country": "Germany",
      "participants": 32,
      "points": 75,
      "prize_money": 53000
    }
  ],
  "22": [
    {
      "name": "Stuttgart Challenger",
      "surface": "grass",
      "level": "challenger100",
      "country": "Germany",
      "participants": 32,
      "points": 100,
      "prize_money": 106240
    },
    {
      "name": "Manchester Challenger",
      "surface": "grass",
      "level": "challenger75",
      "country": "England",
      "participants": 32,
      "points": 75,
      "prize_money": 53000
    },
    {
      "name": "Bastad Challenger",
      "surface": "clay",
      "level": "challenger100",
      "country": "Sweden",
      "participants": 32,
      "points": 100,
      "prize_money": 106240
    }
  ],
  "23": [
    {
      "name": "French Open",
      "surface": "clay",
      "level": "grand_slam",
      "country": "France",
      "participants": 128,
      "points": 2000,
      "prize_money": 3150000
    }
  ],
  "24": [
    {
      "name": "Queens Club Championships",
      "surface": "grass",
      "level": "atp500",
      "country": "England",
      "participants": 32,
      "points": 500,
      "prize_money": 2074505
    },
    {
      "name": "Halle Open",
      "surface": "grass",
      "level": "atp500",
      "country": "Germany",
      "participants": 32,
      "points": 500,
      "prize_money": 2074505
    },
    {
      "name": "Nottingham Challenger",
      "surface": "grass",
      "level": "challenger125",
      "country": "England",
      "participants": 32,
      "points": 125,
      "prize_money": 159360
    },
    {
      "name": "Ilkley Challenger",
      "surface": "grass",
      "level": "challenger100",
      "country": "England",
      "participants": 32,
      "points": 100,
      "prize_money": 106240
    }
  ],
  "25": [
    {
      "name": "Mallorca Open",
      "surface": "grass",
      "level": "atp250",
      "country": "Spain",
      "participants": 32,
      "points": 250,
      "prize_money": 642735
    },
    {
      "name": "Eastbourne International",
      "surface": "grass",
      "level": "atp250",
      "country": "England",
      "participants": 32,
      "points": 250,
      "prize_money": 642735
    }
  ],
  "26": [
    {
      "name": "Wimbledon",
      "surface": "grass",
      "level": "grand_slam",
      "country": "England",
      "participants": 128,
      "points": 2000,
      "prize_money": 3150000
    }
  ],
  "27": [
    {
      "name": "Braunschweig Challenger",
      "surface": "clay",
      "level": "challenger125",
      "country": "Germany",
      "participants": 32,
      "points": 125,
      "prize_money": 159360
    },
    {
      "name": "Salzburg Challenger",
      "surface": "clay",
      "level": "challenger75",
      "country": "Austria",
      "participants": 32,
      "points": 75,
      "prize_money": 53000
    }
  ],
  "28": [
    {
      "name": "Hamburg Open",
      "surface": "clay",
      "level": "atp500",
      "country": "Germany",
      "participants": 32,
      "points": 500,
      "prize_money": 2074505
    },
    {
      "name": "Newport Open",
      "surface": "grass",
      "level": "atp250",
      "country": "USA",
      "participants": 32,
      "points": 250,
      "prize_money": 642735
    },
    {
      "name": "Bastad Open",
      "surface": "clay",
      "level": "atp250",
      "country": "Sweden",
      "participants": 32,
      "points": 250,
      "prize_money": 642735
    }
  ],
  "29": [
    {
      "name": "Atlanta Open",
      "surface": "hard",
      "level": "atp250",
      "country": "USA",
      "participants": 32,
      "points": 250,
      "prize_money": 642735
    },
    {
      "name": "Umag Open",
      "surface": "clay",
      "level": "atp250",
      "country": "Croatia",
      "participants": 32,
      "points": 250,
      "prize_money": 642735
    },
    {
      "name": "Kitzbuhel Open",
      "surface": "clay",
      "level": "atp250",
      "country": "Austria",
      "participants": 32,
      "points": 250,
      "prize_money": 642735
    }
  ],
  "30": [
    {
      "name": "Prague Challenger",
      "surface": "clay",
      "level": "challenger100",
      "country": "Czech Republic",
      "participants": 32,
      "points": 100,
      "prize_money": 106240
    },
    {
      "name": "Tampere Challenger",
      "surface": "clay",
      "level": "challenger75",
      "country": "Finland",
      "participants": 32,
      "points": 75,
      "prize_money": 53000
    }
  ],
  "31": [
    {
      "name": "Washington Open",
      "surface": "hard",
      "level": "atp500",
      "country": "USA",
      "participants": 64,
      "points": 500,
      "prize_money": 2074505
    },
    {
      "name": "Los Cabos Open",
      "surface": "hard",
      "level": "atp250",
      "country": "Mexico",
      "participants": 32,
      "points": 250,
      "prize_money": 642735
    }
  ],
  "32": [
    {
      "name": "Canadian Open",
      "surface": "hard",
      "level": "masters",
      "country": "Canada",
      "participants": 64,
      "points": 1000,
      "prize_money": 6573785
    },
    {
      "name": "Vancouver Challenger",
      "surface": "hard",
      "level": "challenger125",
      "country": "Canada",
      "participants": 32,
      "points": 125,
      "prize_money": 159360
    },
    {
      "name": "Calgary Challenger",
      "surface": "hard",
      "level": "challenger75",
      "country": "Canada",
      "participants": 32,
      "points": 75,
      "prize_money": 53000
    }
  ],
  "33": [
    {
      "name": "Cincinnati Masters",
      "surface": "hard",
      "level": "masters",
      "country": "USA",
      "participants": 64,
      "points": 1000,
      "prize_money": 6573785
    },
    {
      "name": "Cleveland Challenger",
      "surface": "hard",
      "level": "challenger100",
      "country": "USA",
      "participants": 32,
      "points": 100,
      "prize_money": 106240
    },
    {
      "name": "Indianapolis Challenger",
      "surface": "hard",
      "level": "challenger75",
      "country": "USA",
      "participants": 32,
      "points": 75,
      "prize_money": 53000
    }
  ],
  "34": [
    {
      "name": "Winston-Salem Open",
      "surface": "hard",
      "level": "atp250",
      "country": "USA",
      "participants": 32,
      "points": 250,
      "prize_money": 642735
    },
    {
      "name": "Vancouver Challenger",
      "surface": "hard",
      "level": "challenger125",
      "country": "Canada",
      "participants": 32,
      "points": 125,
      "prize_money": 159360
    },
    {
      "name": "Winnipeg Challenger",
      "surface": "hard",
      "level": "challenger75",
      "country": "Canada",
      "participants": 32,
      "points": 75,
      "prize_money": 53000
    }
  ],
  "35": [
    {
      "name": "US Open",
      "surface": "hard",
      "level": "grand_slam",
      "country": "USA",
      "participants": 128,
      "points": 2000,
      "prize_money": 3150000
    }
  ],
  "36": [
    {
      "name": "New Haven Challenger",
      "surface": "hard",
      "level": "challenger125",
      "country": "USA",
      "participants": 32,
      "points": 125,
      "prize_money": 159360
    },
    {
      "name": "Columbus Challenger",
      "surface": "hard",
      "level": "challenger100",
      "country": "USA",
      "participants": 32,
      "points": 100,
      "prize_money": 106240
    }
  ],
  "37": [
    {
      "name": "San Diego Open",
      "surface": "hard",
      "level": "atp250",
      "country": "USA",
      "participants": 32,
      "points": 250,
      "prize_money": 642735
    },
    {
      "name": "Zhuhai Championships",
      "surface": "hard",
      "level": "atp250",
      "country": "China",
      "participants": 32,
      "points": 250,
      "prize_money": 642735
    },
    {
      "name": "Como Challenger",
      "surface": "clay",
      "level": "challenger100",
      "country": "Italy",
      "participants": 32,
      "points": 100,
      "prize_money": 106240
    },
    {
      "name": "Genoa Challenger",
      "surface": "clay",
      "level": "challenger75",
      "country": "Italy",
      "participants": 32,
      "points": 75,
      "prize_money": 53000
    }
  ],
  "38": [
    {
      "name": "China Open",
      "surface": "hard",
      "level": "atp500",
      "country": "China",
      "participants": 32,
      "points": 500,
      "prize_money": 2074505
    },
    {
      "name": "Astana Open",
      "surface": "hard",
      "level": "atp250",
      "country": "Kazakhstan",
      "participants": 32,
      "points": 250,
      "prize_money": 642735
    }
  ],
  "39": [
    {
      "name": "Seoul Challenger",
      "surface": "hard",
      "level": "challenger100",
      "country": "South Korea",
      "participants": 32,
      "points": 100,
      "prize_money": 106240
    },
    {
      "name": "Taipei Challenger",
      "surface": "hard",
      "level": "challenger75",
      "country": "Taiwan",
      "participants": 32,
      "points": 75,
      "prize_money": 53000
    }
  ],
  "40": [
    {
      "name": "Shanghai Masters",
      "surface": "hard",
      "level": "masters",
      "country": "China",
      "participants": 64,
      "points": 1000,
      "prize_money": 7705780
    },
    {
      "name": "Ningbo Challenger",
      "surface": "hard",
      "level": "challenger100",
      "country": "China",
      "participants": 32,
      "points": 100,
      "prize_money": 106240
    },
    {
      "name": "Shenzhen Challenger",
      "surface": "hard",
      "level": "challenger75",
      "country": "China",
      "participants": 32,
      "points": 75,
      "prize_money": 53000
    }
  ],
  "41": [
    {
      "name": "Tokyo Open",
      "surface": "hard",
      "level": "atp500",
      "country": "Japan",
      "participants": 32,
      "points": 500,
      "prize_money": 2074505
    },
    {
      "name": "Stockholm Open",
      "surface": "hard",
      "level": "atp250",
      "country": "Sweden",
      "participants": 32,
      "points": 250,
      "prize_money": 642735
    }
  ],
  "42": [
    {
      "name": "Vienna Open",
      "surface": "hard",
      "level": "atp500",
      "country": "Austria",
      "participants": 32,
      "points": 500,
      "prize_money": 2074505
    },
    {
      "name": "Basel Open",
      "surface": "hard",
      "level": "atp500",
      "country": "Switzerland",
      "participants": 32,
      "points": 500,
      "prize_money": 2074505
    }
  ],
  "43": [
    {
      "name": "Brest Challenger",
      "surface": "hard",
      "level": "challenger100",
      "country": "France",
      "participants": 32,
      "points": 100,
      "prize_money": 106240
    },
    {
      "name": "Eckental Challenger",
      "surface": "hard",
      "level": "challenger75",
      "country": "Germany",
      "participants": 32,
      "points": 75,
      "prize_money": 53000
    }
  ],
  "44": [
    {
      "name": "Paris Masters",
      "surface": "hard",
      "level": "masters",
      "country": "France",
      "participants": 64,
      "points": 1000,
      "prize_money": 5415410
    },
    {
      "name": "Mouilleron Challenger",
      "surface": "hard",
      "level": "challenger100",
      "country": "France",
      "participants": 32,
      "points": 100,
      "prize_money": 106240
    }
  ],
  "45": [
    {
      "name": "Bratislava Challenger",
      "surface": "hard",
      "level": "challenger100",
      "country": "Slovakia",
      "participants": 32,
      "points": 100,
      "prize_money": 106240
    },
    {
      "name": "Stockholm Challenger",
      "surface": "hard",
      "level": "challenger75",
      "country": "Sweden",
      "participants": 32,
      "points": 75,
      "prize_money": 53000
    }
  ],
  "46": [
    {
      "name": "ATP Finals",
      "surface": "hard",
      "level": "masters",
      "country": "Other",
      "participants": 8,
      "points": 1500,
      "prize_money": 3975000
    }
  ],
  "47": [
    {
      "name": "Oslo Challenger",
      "surface": "hard",
      "level": "challenger100",
      "country": "Norway",
      "participants": 32,
      "points": 100,
      "prize_money": 106240
    },
    {
      "name": "Helsinki Challenger",
      "surface": "hard",
      "level": "challenger75",
      "country": "Finland",
      "participants": 32,
      "points": 75,
      "prize_money": 53000
    }
  ],
  "48": [
    {
      "name": "Valencia Challenger",
      "surface": "clay",
      "level": "challenger100",
      "country": "Spain",
      "participants": 32,
      "points": 100,
      "prize_money": 106240
    },
    {
      "name": "Maia Challenger",
      "surface": "clay",
      "level": "challenger75",
      "country": "Portugal",
      "participants": 32,
      "points": 75,
      "prize_money": 53000
    }
  ]
} as Record<number, Tournament[]>;

export const JUNIOR_TOURNAMENT_SCHEDULE: Record<number, JuniorTournament> = {
  "1": {
    "name": "Australian Open Junior",
    "surface": "hard",
    "level": "junior_grand_slam",
    "country": "Australia",
    "participants": 64,
    "points": 1000,
    "prize_money": 0
  },
  "2": {
    "name": "Darwin Junior Open",
    "surface": "hard",
    "level": "grade_3",
    "country": "Australia",
    "participants": 32,
    "points": 100,
    "prize_money": 0
  },
  "4": {
    "name": "Coffee Bowl",
    "surface": "clay",
    "level": "grade_1",
    "country": "Costa Rica",
    "participants": 32,
    "points": 300,
    "prize_money": 0
  },
  "5": {
    "name": "Copa Gerdau",
    "surface": "clay",
    "level": "grade_a",
    "country": "Brazil",
    "participants": 64,
    "points": 500,
    "prize_money": 0
  },
  "6": {
    "name": "Barranquilla Junior Open",
    "surface": "clay",
    "level": "grade_2",
    "country": "Colombia",
    "participants": 32,
    "points": 200,
    "prize_money": 0
  },
  "8": {
    "name": "Banana Bowl",
    "surface": "clay",
    "level": "grade_1",
    "country": "Brazil",
    "participants": 32,
    "points": 300,
    "prize_money": 0
  },
  "9": {
    "name": "Santiago Junior Cup",
    "surface": "clay",
    "level": "grade_3",
    "country": "Chile",
    "participants": 32,
    "points": 100,
    "prize_money": 0
  },
  "12": {
    "name": "International Spring Championships",
    "surface": "hard",
    "level": "grade_1",
    "country": "United States",
    "participants": 32,
    "points": 300,
    "prize_money": 0
  },
  "13": {
    "name": "Cancun Tennis Cup",
    "surface": "hard",
    "level": "grade_2",
    "country": "Mexico",
    "participants": 32,
    "points": 200,
    "prize_money": 0
  },
  "14": {
    "name": "Trofeo Bonfiglio",
    "surface": "clay",
    "level": "grade_a",
    "country": "Italy",
    "participants": 64,
    "points": 500,
    "prize_money": 0
  },
  "16": {
    "name": "Astrid Bowl",
    "surface": "clay",
    "level": "grade_1",
    "country": "Belgium",
    "participants": 32,
    "points": 300,
    "prize_money": 0
  },
  "17": {
    "name": "Luxembourg Junior Open",
    "surface": "clay",
    "level": "grade_3",
    "country": "Luxembourg",
    "participants": 32,
    "points": 100,
    "prize_money": 0
  },
  "20": {
    "name": "Junior International Roehampton",
    "surface": "grass",
    "level": "grade_1",
    "country": "United Kingdom",
    "participants": 32,
    "points": 300,
    "prize_money": 0
  },
  "22": {
    "name": "French Open Junior",
    "surface": "clay",
    "level": "junior_grand_slam",
    "country": "France",
    "participants": 64,
    "points": 1000,
    "prize_money": 0
  },
  "27": {
    "name": "Wimbledon Junior",
    "surface": "grass",
    "level": "junior_grand_slam",
    "country": "United Kingdom",
    "participants": 64,
    "points": 1000,
    "prize_money": 0
  },
  "30": {
    "name": "European Junior Championships",
    "surface": "clay",
    "level": "grade_1",
    "country": "Switzerland",
    "participants": 32,
    "points": 300,
    "prize_money": 0
  },
  "31": {
    "name": "Nordic Junior Championships",
    "surface": "clay",
    "level": "grade_2",
    "country": "Sweden",
    "participants": 32,
    "points": 200,
    "prize_money": 0
  },
  "32": {
    "name": "Canadian World Junior Tennis",
    "surface": "hard",
    "level": "grade_1",
    "country": "Canada",
    "participants": 32,
    "points": 300,
    "prize_money": 0
  },
  "35": {
    "name": "US Open Junior",
    "surface": "hard",
    "level": "junior_grand_slam",
    "country": "United States",
    "participants": 64,
    "points": 1000,
    "prize_money": 0
  },
  "37": {
    "name": "Pan American Championships",
    "surface": "hard",
    "level": "grade_1",
    "country": "United States",
    "participants": 32,
    "points": 300,
    "prize_money": 0
  },
  "38": {
    "name": "Vancouver Junior Open",
    "surface": "hard",
    "level": "grade_3",
    "country": "Canada",
    "participants": 32,
    "points": 100,
    "prize_money": 0
  },
  "40": {
    "name": "Osaka Mayor Cup",
    "surface": "hard",
    "level": "grade_a",
    "country": "Japan",
    "participants": 64,
    "points": 500,
    "prize_money": 0
  },
  "41": {
    "name": "Seoul Junior Cup",
    "surface": "hard",
    "level": "grade_2",
    "country": "South Korea",
    "participants": 32,
    "points": 200,
    "prize_money": 0
  },
  "42": {
    "name": "Yucatan Cup",
    "surface": "hard",
    "level": "grade_1",
    "country": "Mexico",
    "participants": 32,
    "points": 300,
    "prize_money": 0
  },
  "44": {
    "name": "Junior Orange Bowl",
    "surface": "hard",
    "level": "grade_a",
    "country": "United States",
    "participants": 64,
    "points": 500,
    "prize_money": 0
  },
  "45": {
    "name": "Eddie Herr International",
    "surface": "hard",
    "level": "grade_1",
    "country": "United States",
    "participants": 32,
    "points": 300,
    "prize_money": 0
  },
  "48": {
    "name": "Abierto Juvenil Mexicano",
    "surface": "hard",
    "level": "grade_a",
    "country": "Mexico",
    "participants": 64,
    "points": 500,
    "prize_money": 0
  },
  "49": {
    "name": "Copa del Cafe Junior",
    "surface": "hard",
    "level": "grade_2",
    "country": "Costa Rica",
    "participants": 32,
    "points": 200,
    "prize_money": 0
  }
} as Record<number, JuniorTournament>;
