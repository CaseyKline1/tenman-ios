import { Surface } from "../types/game";

export interface TerritoryProfile {
  id: number;
  name: string;
  nationalities: string[];
  overallRange: [number, number];
  potentialRange: [number, number];
  ageRange: [number, number];
  hardRange: [number, number];
  clayRange: [number, number];
  grassRange: [number, number];
  clutchRange: [number, number];
}

export const TERRITORIES: TerritoryProfile[] = [
  {
    id: 1,
    name: "Stanford University",
    nationalities: ["USA", "England", "Argentina", "Spain", "France", "Germany", "Italy"],
    overallRange: [55, 69],
    potentialRange: [50, 100],
    ageRange: [18, 22],
    hardRange: [73, 90],
    clayRange: [60, 85],
    grassRange: [55, 85],
    clutchRange: [33, 90],
  },
  {
    id: 2,
    name: "Junior US Open",
    nationalities: ["USA", "England", "Argentina", "Spain", "Mexico", "Canada", "France", "Germany", "Portugal", "Norway", "Australia"],
    overallRange: [45, 60],
    potentialRange: [60, 100],
    ageRange: [16, 18],
    hardRange: [75, 95],
    clayRange: [55, 85],
    grassRange: [55, 85],
    clutchRange: [45, 95],
  },
  {
    id: 3,
    name: "Junior Wimbledon",
    nationalities: ["England", "USA", "Monaco", "Argentina", "Spain", "France", "Germany", "Portugal", "Norway", "Switzerland", "Sweden", "Ireland", "Scotland", "Serbia"],
    overallRange: [45, 60],
    potentialRange: [60, 100],
    ageRange: [16, 18],
    hardRange: [55, 85],
    clayRange: [55, 85],
    grassRange: [75, 95],
    clutchRange: [45, 95],
  },
  {
    id: 4,
    name: "Junior Australian Open",
    nationalities: ["USA", "China", "Switzerland", "Italy", "England", "Argentina", "Spain", "France", "Germany", "Portugal", "Norway", "Australia"],
    overallRange: [45, 60],
    potentialRange: [60, 100],
    ageRange: [16, 18],
    hardRange: [75, 95],
    clayRange: [55, 85],
    grassRange: [55, 85],
    clutchRange: [45, 95],
  },
  {
    id: 5,
    name: "University of North Carolina",
    nationalities: ["USA", "England", "Argentina", "Chile", "Romania", "Switzerland", "Canada", "Cyprus", "Australia", "Denmark", "Spain"],
    overallRange: [50, 62],
    potentialRange: [40, 90],
    ageRange: [18, 22],
    hardRange: [67, 90],
    clayRange: [55, 85],
    grassRange: [55, 85],
    clutchRange: [30, 85],
  },
  {
    id: 6,
    name: "Junior French Open",
    nationalities: ["USA", "England", "Monaco", "Argentina", "Spain", "France", "Italy", "Germany", "Portugal", "Norway", "Australia", "Switzerland", "Sweden", "Serbia"],
    overallRange: [45, 60],
    potentialRange: [60, 100],
    ageRange: [16, 18],
    hardRange: [55, 85],
    clayRange: [75, 95],
    grassRange: [55, 85],
    clutchRange: [45, 95],
  },
  {
    id: 7,
    name: "Challenger Tournaments",
    nationalities: ["USA", "France", "Mexico", "Spain", "Germany", "Italy", "England", "China", "Canada", "Switzerland", "Australia", "Argentina", "Sweden", "Austria", "Poland", "India", "Serbia"],
    overallRange: [55, 70],
    potentialRange: [40, 87],
    ageRange: [18, 22],
    hardRange: [60, 90],
    clayRange: [60, 90],
    grassRange: [60, 90],
    clutchRange: [33, 90],
  },
  {
    id: 8,
    name: "IMG Tennis Academy",
    nationalities: ["USA", "Spain", "France", "England", "Mexico"],
    overallRange: [38, 55],
    potentialRange: [75, 100],
    ageRange: [14, 17],
    hardRange: [55, 90],
    clayRange: [55, 90],
    grassRange: [55, 90],
    clutchRange: [30, 95],
  },
];

export const NAME_POOL: Record<string, { first: string[]; last: string[] }> = {
  USA: {
    first: ["James", "John", "Michael", "William", "David", "Joseph", "Daniel", "Andrew", "Ryan", "Casey", "Jack", "Tyler"],
    last: ["Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor"],
  },
  England: {
    first: ["Oliver", "George", "Harry", "Noah", "Liam", "Henry", "Thomas", "Arthur", "Max", "Edward"],
    last: ["Smith", "Taylor", "Brown", "Wilson", "Davies", "Evans", "Thomas", "Roberts", "Johnson", "Walker"],
  },
  Argentina: {
    first: ["Santiago", "Mateo", "Thiago", "Benjamin", "Valentino", "Lautaro", "Lucas", "Tomas"],
    last: ["Gonzalez", "Rodriguez", "Garcia", "Martinez", "Lopez", "Perez", "Sanchez", "Romero"],
  },
  Spain: {
    first: ["Alejandro", "Diego", "Fernando", "Gabriel", "Rafael", "Carlos", "Javier", "Adrian", "Alvaro", "Hugo"],
    last: ["Garcia", "Rodriguez", "Gonzalez", "Fernandez", "Lopez", "Martinez", "Sanchez", "Perez", "Alcaraz", "Nadal"],
  },
  France: {
    first: ["Alexandre", "Benjamin", "Guillaume", "Hugo", "Louis", "Mathieu", "Nicolas", "Pierre", "Quentin", "Thomas"],
    last: ["Martin", "Bernard", "Dubois", "Thomas", "Robert", "Petit", "Durand", "Leroy", "Laurent", "Mercier"],
  },
  Germany: {
    first: ["Alexander", "Benjamin", "Daniel", "Felix", "Max", "Noah", "Paul", "Samuel", "Tim", "Yannik"],
    last: ["Mueller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Wolf", "Lange"],
  },
  Italy: {
    first: ["Alessandro", "Lorenzo", "Matteo", "Andrea", "Marco", "Giuseppe", "Francesco", "Luca", "Paolo", "Jannik"],
    last: ["Rossi", "Ferrari", "Russo", "Bianchi", "Romano", "Ricci", "Greco", "Sinner", "Moretti", "Conti"],
  },
  Mexico: {
    first: ["Alejandro", "Diego", "Fernando", "Gabriel", "Juan", "Luis", "Miguel", "Rafael"],
    last: ["Garcia", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Perez", "Sanchez"],
  },
  Canada: {
    first: ["James", "William", "Oliver", "Lucas", "Ethan", "Alexander", "Henry", "Noah", "Owen", "Daniel"],
    last: ["Smith", "Brown", "Wilson", "Johnson", "Williams", "Taylor", "Martin", "Anderson", "Roy", "Tremblay"],
  },
  Australia: {
    first: ["Oliver", "Noah", "William", "Jack", "Henry", "Leo", "Thomas", "Charlie", "Lucas", "Oscar"],
    last: ["Smith", "Jones", "Williams", "Brown", "Wilson", "Taylor", "White", "Martin", "Anderson", "Lee"],
  },
  Switzerland: {
    first: ["Luca", "Noah", "Leon", "Liam", "David", "Louis", "Julian", "Felix", "Simon", "Roger"],
    last: ["Mueller", "Schmidt", "Schneider", "Keller", "Huber", "Steiner", "Baumann", "Schmid", "Wyss", "Federer"],
  },
  China: {
    first: ["Wei", "Ming", "Li", "Jian", "Hui", "Jun", "Xiang", "Yu", "Hao", "Chen"],
    last: ["Wang", "Li", "Zhang", "Liu", "Chen", "Yang", "Huang", "Zhao", "Wu", "Zhou"],
  },
  Portugal: {
    first: ["Joao", "Tiago", "Rafael", "Diogo", "Miguel", "Goncalo", "Pedro", "Andre", "Luis", "Bruno"],
    last: ["Silva", "Santos", "Ferreira", "Pereira", "Costa", "Oliveira", "Martins", "Rodrigues", "Almeida", "Ribeiro"],
  },
  Norway: {
    first: ["Lars", "Erik", "Ola", "Magnus", "Andreas", "Kristian", "Marius", "Sindre", "Jonas", "Henrik"],
    last: ["Hansen", "Johansen", "Olsen", "Larsen", "Andersen", "Pedersen", "Nilsen", "Kristiansen", "Berg", "Dahl"],
  },
  Sweden: {
    first: ["Oscar", "William", "Lucas", "Liam", "Oliver", "Hugo", "Alexander", "Elias", "Adam", "Emil"],
    last: ["Andersson", "Johansson", "Karlsson", "Nilsson", "Eriksson", "Larsson", "Olsson", "Persson", "Svensson", "Berg"],
  },
  Serbia: {
    first: ["Stefan", "Aleksandar", "Marko", "Nikola", "Luka", "Dusan", "Filip", "Petar", "Viktor", "Novak"],
    last: ["Markovic", "Petrovic", "Djokovic", "Jovanovic", "Nikolic", "Stankovic", "Kovacevic", "Lazarevic", "Vukovic", "Ivanovic"],
  },
  Chile: {
    first: ["Matias", "Benjamin", "Vicente", "Martin", "Diego", "Joaquin", "Ignacio", "Francisco"],
    last: ["Gonzalez", "Rojas", "Munoz", "Diaz", "Soto", "Contreras", "Silva", "Martinez"],
  },
  Romania: {
    first: ["Andrei", "Stefan", "Alexandru", "Mihai", "Vlad", "Rares", "Darius", "Cristian"],
    last: ["Popescu", "Ionescu", "Stan", "Dumitru", "Gheorghe", "Munteanu", "Radu", "Marin"],
  },
  Cyprus: {
    first: ["Andreas", "Christos", "Nikos", "Panagiotis", "Marios", "Dimitris", "Alexis", "Stelios"],
    last: ["Georgiou", "Christodoulou", "Ioannou", "Hadjicosta", "Kyriakou", "Nicolaou", "Andreou", "Mavris"],
  },
  Denmark: {
    first: ["William", "Noah", "Oscar", "Carl", "Alfred", "Lucas", "Magnus", "Oliver"],
    last: ["Jensen", "Nielsen", "Hansen", "Pedersen", "Andersen", "Christensen", "Larsen", "Sorensen"],
  },
  Monaco: {
    first: ["Louis", "Alexandre", "Hugo", "Theo", "Jules", "Lucas", "Maxime", "Antoine"],
    last: ["Grimaldi", "Mori", "Rossi", "Bianchi", "Dupont", "Bernard", "Martin", "Laurent"],
  },
  India: {
    first: ["Raj", "Raghvendra", "Sameer", "Ravi", "Neil", "Neal", "Abhi", "Arjun", "Karan", "Rohan"],
    last: ["Kumar", "Singh", "Patel", "Gupta", "Reddy", "Yadav", "Sharma", "Verma", "Bhat", "Malhotra"],
  },
  Austria: {
    first: ["David", "Lukas", "Jakob", "Tobias", "Jonas", "Elias", "Felix", "Simon", "Paul", "Sebastian"],
    last: ["Schmidt", "Muller", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Bauer", "Richter"],
  },
  Poland: {
    first: ["Kacper", "Maksymilian", "Sebastian", "Jan", "Marcin", "Dawid", "Mateusz", "Adrian"],
    last: ["Kowalski", "Nowak", "Wisniewski", "Wojcik", "Kowalczyk", "Kaminski", "Lewandowski", "Zielinski"],
  },
};

export const QUALIFICATION_LABELS: Record<number, string> = {
  [-1]: "Mandatory",
  0: "Not Invited",
  1: "Accepted",
  2: "Wildcard",
  3: "Qualifying Tournament",
};

export const TRAINING_OPTIONS = [
  "Overall",
  "Serve",
  "Stamina",
  "Clutch",
  "Hard Court Play",
  "Clay Court Play",
  "Grass Court Play",
];

export const EXHIBITION_FOCUSES = ["court", "serve", "stamina", "clutch"] as const;

export type ExhibitionFocus = (typeof EXHIBITION_FOCUSES)[number];

export const SURFACES: Surface[] = ["hard", "clay", "grass"];
