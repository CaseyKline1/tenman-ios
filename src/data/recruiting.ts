import { Surface } from "../types/game";

export interface TerritoryProfile {
  id: number;
  name: string;
  scoutCost: number;
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
    scoutCost: 35000,
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
    scoutCost: 50000,
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
    scoutCost: 50000,
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
    scoutCost: 50000,
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
    scoutCost: 10000,
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
    scoutCost: 50000,
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
    scoutCost: 0,
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
    scoutCost: 100000,
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

export type RecruitTerritoryOption = Pick<TerritoryProfile, "id" | "name" | "scoutCost">;

export const RECRUIT_TERRITORY_OPTIONS: RecruitTerritoryOption[] = TERRITORIES
  .map(({ id, name, scoutCost }) => ({ id, name, scoutCost }))
  .sort((a, b) => a.scoutCost - b.scoutCost || a.name.localeCompare(b.name));

export const NAME_POOL: Record<string, { first: string[]; last: string[] }> = {
  USA: {
    first: ["James", "John", "Michael", "William", "David", "Joseph", "Daniel", "Andrew", "Ryan", "Casey", "Jack", "Tyler", "Christopher", "Matthew", "Anthony", "Joshua", "Nicholas", "Benjamin"],
    last: ["Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Robinson", "Clark", "Lewis", "Walker", "Hall", "Allen"],
  },
  England: {
    first: ["Oliver", "George", "Harry", "Noah", "Liam", "Henry", "Thomas", "Arthur", "Max", "Edward", "Jack", "Charlie", "Theo", "Alfie", "James", "Freddie"],
    last: ["Smith", "Taylor", "Brown", "Wilson", "Davies", "Evans", "Thomas", "Roberts", "Johnson", "Walker", "Wright", "Hall", "Clarke", "Green", "White", "Harris"],
  },
  Argentina: {
    first: ["Santiago", "Mateo", "Thiago", "Benjamin", "Valentino", "Lautaro", "Lucas", "Tomas", "Juan", "Nicolas", "Agustin", "Franco", "Joaquin", "Facundo"],
    last: ["Gonzalez", "Rodriguez", "Garcia", "Martinez", "Lopez", "Perez", "Sanchez", "Romero", "Fernandez", "Gomez", "Diaz", "Alvarez", "Torres", "Acosta"],
  },
  Spain: {
    first: ["Alejandro", "Diego", "Fernando", "Gabriel", "Rafael", "Carlos", "Javier", "Adrian", "Alvaro", "Hugo", "Pablo", "Sergio", "Manuel", "Miguel", "Antonio", "Mario"],
    last: ["Garcia", "Rodriguez", "Gonzalez", "Fernandez", "Lopez", "Martinez", "Sanchez", "Perez", "Alcaraz", "Nadal", "Ruiz", "Moreno", "Jimenez", "Romero", "Navarro", "Vazquez"],
  },
  France: {
    first: ["Alexandre", "Benjamin", "Guillaume", "Hugo", "Louis", "Mathieu", "Nicolas", "Pierre", "Quentin", "Thomas", "Julien", "Antoine", "Adrien", "Leo", "Bastien", "Romain"],
    last: ["Martin", "Bernard", "Dubois", "Thomas", "Robert", "Petit", "Durand", "Leroy", "Laurent", "Mercier", "Moreau", "Simon", "Michel", "Lefebvre", "Fontaine", "Roux"],
  },
  Germany: {
    first: ["Alexander", "Benjamin", "Daniel", "Felix", "Max", "Noah", "Paul", "Samuel", "Tim", "Yannik", "Leon", "Lukas", "Moritz", "Johannes", "Niklas", "Julian"],
    last: ["Mueller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Wolf", "Lange", "Hoffmann", "Schulz", "Koch", "Bauer", "Klein", "Richter"],
  },
  Italy: {
    first: ["Alessandro", "Lorenzo", "Matteo", "Andrea", "Marco", "Giuseppe", "Francesco", "Luca", "Paolo", "Jannik", "Davide", "Simone", "Federico", "Giovanni", "Stefano", "Riccardo"],
    last: ["Rossi", "Ferrari", "Russo", "Bianchi", "Romano", "Ricci", "Greco", "Sinner", "Moretti", "Conti", "Esposito", "Colombo", "Gallo", "Costa", "DeLuca", "Marino"],
  },
  Mexico: {
    first: ["Alejandro", "Diego", "Fernando", "Gabriel", "Juan", "Luis", "Miguel", "Rafael", "Jose", "Carlos", "Manuel", "Javier", "Adrian", "Emiliano"],
    last: ["Garcia", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Perez", "Sanchez", "Ramirez", "Torres", "Flores", "Vargas", "Castillo", "Reyes"],
  },
  Canada: {
    first: ["James", "William", "Oliver", "Lucas", "Ethan", "Alexander", "Henry", "Noah", "Owen", "Daniel", "Liam", "Benjamin", "Jacob", "Samuel", "Nathan", "Logan"],
    last: ["Smith", "Brown", "Wilson", "Johnson", "Williams", "Taylor", "Martin", "Anderson", "Roy", "Tremblay", "Gagnon", "Bouchard", "Pelletier", "Cote", "Belanger", "Lefebvre"],
  },
  Australia: {
    first: ["Oliver", "Noah", "William", "Jack", "Henry", "Leo", "Thomas", "Charlie", "Lucas", "Oscar", "Ethan", "Lachlan", "Mason", "Joshua", "Cooper", "Hudson"],
    last: ["Smith", "Jones", "Williams", "Brown", "Wilson", "Taylor", "White", "Martin", "Anderson", "Lee", "Thompson", "Harris", "Kelly", "Murphy", "Clark", "Evans"],
  },
  Switzerland: {
    first: ["Luca", "Noah", "Leon", "Liam", "David", "Louis", "Julian", "Felix", "Simon", "Roger", "Jan", "Nico", "Raphael", "Jonas", "Marco", "Dominik"],
    last: ["Mueller", "Schmidt", "Schneider", "Keller", "Huber", "Steiner", "Baumann", "Schmid", "Wyss", "Federer", "Frei", "Meier", "Brunner", "Roth", "Graf", "Kunz"],
  },
  China: {
    first: ["Wei", "Ming", "Li", "Jian", "Hui", "Jun", "Xiang", "Yu", "Hao", "Chen", "Tao", "Gang", "Lei", "Peng", "Qiang", "Bo"],
    last: ["Wang", "Li", "Zhang", "Liu", "Chen", "Yang", "Huang", "Zhao", "Wu", "Zhou", "Sun", "Ma", "Zhu", "Guo", "Lin", "He"],
  },
  Portugal: {
    first: ["Joao", "Tiago", "Rafael", "Diogo", "Miguel", "Goncalo", "Pedro", "Andre", "Luis", "Bruno", "Afonso", "Duarte", "Martim", "Tomas", "Rodrigo", "Nuno"],
    last: ["Silva", "Santos", "Ferreira", "Pereira", "Costa", "Oliveira", "Martins", "Rodrigues", "Almeida", "Ribeiro", "Sousa", "Teixeira", "Correia", "Nunes", "Mendes", "Barbosa"],
  },
  Norway: {
    first: ["Lars", "Erik", "Ola", "Magnus", "Andreas", "Kristian", "Marius", "Sindre", "Jonas", "Henrik", "Emil", "Mathias", "Tobias", "Fredrik", "Even", "Martin"],
    last: ["Hansen", "Johansen", "Olsen", "Larsen", "Andersen", "Pedersen", "Nilsen", "Kristiansen", "Berg", "Dahl", "Solberg", "Lunde", "Eide", "Haugen", "Moen", "Aas"],
  },
  Sweden: {
    first: ["Oscar", "William", "Lucas", "Liam", "Oliver", "Hugo", "Alexander", "Elias", "Adam", "Emil", "Gustav", "Viktor", "Anton", "Johan", "Nils", "Felix"],
    last: ["Andersson", "Johansson", "Karlsson", "Nilsson", "Eriksson", "Larsson", "Olsson", "Persson", "Svensson", "Berg", "Lindberg", "Lindstrom", "Holm", "Nyberg", "Lundqvist", "Ekstrom"],
  },
  Serbia: {
    first: ["Stefan", "Aleksandar", "Marko", "Nikola", "Luka", "Dusan", "Filip", "Petar", "Viktor", "Novak", "Milos", "Nemanja", "Bogdan", "Uros", "Ivan", "Mihajlo"],
    last: ["Markovic", "Petrovic", "Djokovic", "Jovanovic", "Nikolic", "Stankovic", "Kovacevic", "Lazarevic", "Vukovic", "Ivanovic", "Milosevic", "Simic", "Savic", "Mitrovic", "Zivkovic", "Pavlovic"],
  },
  Chile: {
    first: ["Matias", "Benjamin", "Vicente", "Martin", "Diego", "Joaquin", "Ignacio", "Francisco", "Sebastian", "Nicolas", "Tomas", "Cristobal", "Felipe", "Agustin"],
    last: ["Gonzalez", "Rojas", "Munoz", "Diaz", "Soto", "Contreras", "Silva", "Martinez", "Perez", "Araya", "Navarro", "Sepulveda", "Fuentes", "Morales"],
  },
  Romania: {
    first: ["Andrei", "Stefan", "Alexandru", "Mihai", "Vlad", "Rares", "Darius", "Cristian", "Bogdan", "Ionut", "Marius", "Florin", "Cosmin", "Gabriel"],
    last: ["Popescu", "Ionescu", "Stan", "Dumitru", "Gheorghe", "Munteanu", "Radu", "Marin", "Ilie", "Stoica", "Ene", "Tudor", "Preda", "Voicu"],
  },
  Cyprus: {
    first: ["Andreas", "Christos", "Nikos", "Panagiotis", "Marios", "Dimitris", "Alexis", "Stelios", "Giorgos", "Michalis", "Antonis", "Yiannis", "Savvas", "Pavlos"],
    last: ["Georgiou", "Christodoulou", "Ioannou", "Hadjicosta", "Kyriakou", "Nicolaou", "Andreou", "Mavris", "Charalambous", "Demetriou", "Michael", "Savvides", "Papadopoulos", "Hadjiyiannis"],
  },
  Denmark: {
    first: ["William", "Noah", "Oscar", "Carl", "Alfred", "Lucas", "Magnus", "Oliver", "Emil", "Mikkel", "Victor", "Frederik", "Andreas", "Jonas"],
    last: ["Jensen", "Nielsen", "Hansen", "Pedersen", "Andersen", "Christensen", "Larsen", "Sorensen", "Madsen", "Kristensen", "Thomsen", "Poulsen", "Rasmussen", "Jorgensen"],
  },
  Monaco: {
    first: ["Louis", "Alexandre", "Hugo", "Theo", "Jules", "Lucas", "Maxime", "Antoine", "Remy", "Jean", "Philippe", "Nicolas", "Sebastien", "Mathis"],
    last: ["Grimaldi", "Mori", "Rossi", "Bianchi", "Dupont", "Bernard", "Martin", "Laurent", "Gastaud", "Pastor", "Armand", "Carre", "Albertini", "Ricci"],
  },
  India: {
    first: ["Raj", "Raghvendra", "Sameer", "Ravi", "Neil", "Neal", "Abhi", "Arjun", "Karan", "Rohan", "Aman", "Akash", "Vikram", "Siddharth", "Pranav", "Rahul"],
    last: ["Kumar", "Singh", "Patel", "Gupta", "Reddy", "Yadav", "Sharma", "Verma", "Bhat", "Malhotra", "Nair", "Iyer", "Menon", "Choudhury", "Saxena", "Kapoor"],
  },
  Austria: {
    first: ["David", "Lukas", "Jakob", "Tobias", "Jonas", "Elias", "Felix", "Simon", "Paul", "Sebastian", "Florian", "Dominik", "Matthias", "Andreas", "Michael", "Stefan"],
    last: ["Schmidt", "Muller", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Bauer", "Richter", "Gruber", "Hofer", "Leitner", "Fuchs", "Eder", "Huber"],
  },
  Poland: {
    first: ["Kacper", "Maksymilian", "Sebastian", "Jan", "Marcin", "Dawid", "Mateusz", "Adrian", "Piotr", "Krzysztof", "Michal", "Lukasz", "Wojciech", "Tomasz"],
    last: ["Kowalski", "Nowak", "Wisniewski", "Wojcik", "Kowalczyk", "Kaminski", "Lewandowski", "Zielinski", "Mazur", "Kaczmarek", "Piotrowski", "Grabowski", "Pawlak", "Michalski"],
  },
  Ireland: {
    first: ["Conor", "Sean", "Cian", "Oisin", "Darragh", "Patrick", "Liam", "Eoin", "Ronan", "Fionn", "Cillian", "Tadhg"],
    last: ["Murphy", "Kelly", "Byrne", "O'Brien", "Ryan", "O'Connor", "Walsh", "Doyle", "McCarthy", "Gallagher", "Brennan", "Quinn"],
  },
  Scotland: {
    first: ["Callum", "Finlay", "Ewan", "Fraser", "Angus", "Hamish", "Alistair", "Lewis", "Rory", "Jamie", "Gregor", "Kieran"],
    last: ["MacDonald", "Campbell", "Stewart", "Robertson", "Murray", "McLean", "Douglas", "Reid", "Fraser", "Cameron", "Morrison", "Sinclair"],
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
