import { PrismaClient } from "../generated/prisma/client";
import { Difficulty, PuzzleType, QuestionType } from "../generated/prisma/enums";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });
const SETS_PER_CATEGORY = 12;
const QUESTIONS_PER_SET = 2;
const catalogue: any[] = [
  {
    "name": "Brain Puzzles",
    "slug": "brain-puzzles",
    "desc": "Pattern recognition, lateral thinking and classic brain teasers.",
    "icon": "Brain",
    "image": "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
    "type": "BRAIN_PUZZLE",
    "qs": [
      [
        "What comes next? 3, 6, 12, 24, __",
        "48",
        [
          "36",
          "42",
          "48",
          "54"
        ],
        "Each term is doubled."
      ],
      [
        "Which item does not belong: triangle, square, circle, cube?",
        "Cube",
        [
          "Triangle",
          "Square",
          "Circle",
          "Cube"
        ],
        "A cube is three-dimensional; the others are two-dimensional shapes."
      ],
      [
        "A farmer has 17 sheep. All but 9 run away. How many remain?",
        "9",
        [
          "8",
          "9",
          "17",
          "26"
        ],
        "“All but 9” means nine did not run away."
      ],
      [
        "If yesterday was Monday, what day is tomorrow?",
        "Wednesday",
        [
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Sunday"
        ],
        "Yesterday Monday means today Tuesday and tomorrow Wednesday."
      ],
      [
        "Which number is the odd one out: 2, 3, 5, 9, 11?",
        "9",
        [
          "2",
          "3",
          "9",
          "11"
        ],
        "All the others are prime numbers; 9 is composite."
      ],
      [
        "A clock reads 3:00. What is the smaller angle between its hands?",
        "90°",
        [
          "30°",
          "60°",
          "90°",
          "180°"
        ],
        "The minute hand is at 12 and the hour hand at 3."
      ],
      [
        "If all Nors are Veks and all Veks are Lums, which must be true?",
        "All Nors are Lums",
        [
          "All Lums are Nors",
          "All Nors are Lums",
          "No Veks are Lums",
          "All Nors are Veks only"
        ],
        "The relationship is transitive."
      ],
      [
        "How many months have at least 28 days?",
        "12",
        [
          "1",
          "2",
          "11",
          "12"
        ],
        "Every month has at least 28 days."
      ],
      [
        "You overtake the runner in second place. What place are you in?",
        "Second",
        [
          "First",
          "Second",
          "Third",
          "Fourth"
        ],
        "You take the position of the runner you overtook."
      ],
      [
        "Which letter comes next: A, C, F, J, O, __?",
        "U",
        [
          "T",
          "U",
          "V",
          "W"
        ],
        "The gaps grow by one: +2, +3, +4, +5, then +6."
      ],
      [
        "A room has four corners and a cat in each corner. Each cat sees three cats. How many cats?",
        "4",
        [
          "4",
          "8",
          "12",
          "16"
        ],
        "Each of the four cats can see the other three."
      ],
      [
        "Which is heavier: 1 kg of iron or 1 kg of cotton?",
        "They weigh the same",
        [
          "Iron",
          "Cotton",
          "They weigh the same",
          "Cannot be determined"
        ],
        "Both have a mass of one kilogram."
      ],
      [
        "What number completes the pattern 1, 4, 9, 16, __?",
        "25",
        [
          "20",
          "24",
          "25",
          "36"
        ],
        "These are consecutive square numbers: 1², 2², 3², 4², then 5²."
      ],
      [
        "What is 7 × 8?",
        "56",
        [
          "48",
          "54",
          "56",
          "64"
        ],
        "Seven groups of eight make 56."
      ],
      [
        "Using A=1, B=2, and so on, what is the value of CAT?",
        "24",
        [
          "21",
          "22",
          "24",
          "26"
        ],
        "C=3, A=1 and T=20; 3 + 1 + 20 = 24."
      ],
      [
        "Which shape has no straight edges?",
        "Circle",
        [
          "Triangle",
          "Rectangle",
          "Pentagon",
          "Circle"
        ],
        "A circle has a curved boundary and no straight edges."
      ],
      [
        "A grandfather, a father and a son go for a walk. How many people are there?",
        "3",
        [
          "2",
          "3",
          "4",
          "6"
        ],
        "The father is both a son and a father, so three people fit the description."
      ],
      [
        "What comes next in the Fibonacci sequence 1, 1, 2, 3, 5, __?",
        "8",
        [
          "6",
          "7",
          "8",
          "10"
        ],
        "Each term is the sum of the two preceding terms."
      ],
      [
        "You face north and turn right. Which direction are you facing?",
        "East",
        [
          "West",
          "South",
          "East",
          "North"
        ],
        "A right turn from north points east."
      ],
      [
        "If 5 machines make 5 items in 5 minutes, how long do 100 identical machines take to make 100 items?",
        "5 minutes",
        [
          "1 minute",
          "5 minutes",
          "20 minutes",
          "100 minutes"
        ],
        "Each machine makes one item in five minutes, so 100 machines make 100 items in the same time."
      ],
      [
        "Four people each shake hands with every other person once. How many handshakes occur?",
        "6",
        [
          "4",
          "5",
          "6",
          "8"
        ],
        "There are 4×3÷2 = 6 unique pairs."
      ],
      [
        "What comes next: 2, 3, 5, 8, 12, __?",
        "17",
        [
          "15",
          "16",
          "17",
          "18"
        ],
        "The increments are +1, +2, +3, +4, then +5."
      ],
      [
        "Which number is both even and prime?",
        "2",
        [
          "0",
          "1",
          "2",
          "4"
        ],
        "Two is the only even prime number."
      ],
      [
        "If a code reverses the letters in DOG, what does it produce?",
        "GOD",
        [
          "DOG",
          "GDO",
          "GOD",
          "ODG"
        ],
        "Reversing the order of D-O-G gives G-O-D."
      ]
    ]
  },
  {
    "name": "World Geography",
    "slug": "world-geography",
    "desc": "Explore countries, capitals, landforms and world maps.",
    "icon": "Globe2",
    "image": "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1200&q=80",
    "type": "TRIVIA",
    "qs": [
      [
        "What is the capital of Japan?",
        "Tokyo",
        [
          "Kyoto",
          "Tokyo",
          "Osaka",
          "Nagoya"
        ],
        "Tokyo is Japan’s capital and largest metropolitan area."
      ],
      [
        "Which is the largest ocean on Earth?",
        "Pacific Ocean",
        [
          "Atlantic Ocean",
          "Indian Ocean",
          "Arctic Ocean",
          "Pacific Ocean"
        ],
        "The Pacific is the largest and deepest ocean."
      ],
      [
        "Which country is home to the ancient city of Petra?",
        "Jordan",
        [
          "Egypt",
          "Jordan",
          "Greece",
          "Turkey"
        ],
        "Petra is an archaeological city in southern Jordan."
      ],
      [
        "The River Nile flows into which sea?",
        "Mediterranean Sea",
        [
          "Red Sea",
          "Arabian Sea",
          "Mediterranean Sea",
          "Black Sea"
        ],
        "The Nile delta opens into the Mediterranean."
      ],
      [
        "Mount Kilimanjaro is located in which country?",
        "Tanzania",
        [
          "Kenya",
          "Tanzania",
          "Uganda",
          "Ethiopia"
        ],
        "Kilimanjaro is in northeastern Tanzania."
      ],
      [
        "Which country has the largest land area?",
        "Russia",
        [
          "Canada",
          "China",
          "Russia",
          "United States"
        ],
        "Russia spans eastern Europe and northern Asia."
      ],
      [
        "Which is the smallest independent country by area?",
        "Vatican City",
        [
          "Monaco",
          "Malta",
          "San Marino",
          "Vatican City"
        ],
        "Vatican City is the world’s smallest sovereign state by area."
      ],
      [
        "The Sahara Desert is primarily on which continent?",
        "Africa",
        [
          "Asia",
          "Africa",
          "South America",
          "Australia"
        ],
        "The Sahara stretches across northern Africa."
      ],
      [
        "Which city lies on two continents, Europe and Asia?",
        "Istanbul",
        [
          "Lisbon",
          "Istanbul",
          "Cairo",
          "Vienna"
        ],
        "Istanbul spans both sides of the Bosporus."
      ],
      [
        "Which country is famously shaped like a boot?",
        "Italy",
        [
          "Portugal",
          "Italy",
          "Croatia",
          "Greece"
        ],
        "The Italian peninsula resembles a boot on maps."
      ],
      [
        "What is the capital of Canada?",
        "Ottawa",
        [
          "Toronto",
          "Vancouver",
          "Ottawa",
          "Montreal"
        ],
        "Ottawa is Canada’s federal capital."
      ],
      [
        "Which continent contains the most countries?",
        "Africa",
        [
          "Europe",
          "Asia",
          "Africa",
          "South America"
        ],
        "Africa has the highest number of sovereign countries."
      ],
      [
        "What is the capital of Australia?",
        "Canberra",
        [
          "Sydney",
          "Melbourne",
          "Canberra",
          "Perth"
        ],
        "Canberra is Australia's national capital."
      ],
      [
        "What is the currency of Switzerland?",
        "Swiss franc",
        [
          "Euro",
          "Swiss franc",
          "Krone",
          "Pound sterling"
        ],
        "Switzerland uses the Swiss franc."
      ],
      [
        "Mount Everest lies on the border of Nepal and which country?",
        "China",
        [
          "India",
          "Bhutan",
          "China",
          "Pakistan"
        ],
        "The summit sits on the Nepal–China border."
      ],
      [
        "The Amazon River empties into which ocean?",
        "Atlantic Ocean",
        [
          "Pacific Ocean",
          "Indian Ocean",
          "Arctic Ocean",
          "Atlantic Ocean"
        ],
        "The Amazon flows eastward into the Atlantic Ocean."
      ],
      [
        "The Suez Canal connects the Mediterranean Sea with which sea?",
        "Red Sea",
        [
          "Black Sea",
          "Red Sea",
          "Caspian Sea",
          "Arabian Sea"
        ],
        "The canal links the Mediterranean and Red Sea."
      ],
      [
        "The Great Barrier Reef is off the coast of which country?",
        "Australia",
        [
          "Indonesia",
          "Australia",
          "Mexico",
          "South Africa"
        ],
        "The reef lies off Queensland in northeastern Australia."
      ],
      [
        "Machu Picchu is located in which country?",
        "Peru",
        [
          "Chile",
          "Bolivia",
          "Peru",
          "Ecuador"
        ],
        "Machu Picchu is an Inca site in Peru."
      ],
      [
        "What is the capital of Kenya?",
        "Nairobi",
        [
          "Mombasa",
          "Kampala",
          "Nairobi",
          "Dodoma"
        ],
        "Nairobi is Kenya's capital and largest city."
      ],
      [
        "Which country is especially known for its fjords?",
        "Norway",
        [
          "Hungary",
          "Norway",
          "Paraguay",
          "Mali"
        ],
        "Norway's coastline is famous for deep glacial fjords."
      ],
      [
        "Lake Baikal is in which country?",
        "Russia",
        [
          "Canada",
          "Russia",
          "Mongolia",
          "Kazakhstan"
        ],
        "Lake Baikal is in Siberia, Russia."
      ],
      [
        "Which country has the city of Marrakech?",
        "Morocco",
        [
          "Tunisia",
          "Morocco",
          "Jordan",
          "Lebanon"
        ],
        "Marrakech is a major city in Morocco."
      ],
      [
        "Which strait separates Spain from Morocco?",
        "Strait of Gibraltar",
        [
          "Bering Strait",
          "Strait of Malacca",
          "Strait of Gibraltar",
          "Dover Strait"
        ],
        "The Strait of Gibraltar separates Europe and Africa at this point."
      ]
    ]
  },
  {
    "name": "Science & Nature",
    "slug": "science-nature",
    "desc": "Understand the natural world, biology, chemistry and physics.",
    "icon": "Atom",
    "image": "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80",
    "type": "TRIVIA",
    "qs": [
      [
        "Which gas do plants absorb during photosynthesis?",
        "Carbon dioxide",
        [
          "Oxygen",
          "Nitrogen",
          "Carbon dioxide",
          "Hydrogen"
        ],
        "Plants use carbon dioxide, water and light to make sugars."
      ],
      [
        "What is the chemical symbol for gold?",
        "Au",
        [
          "Ag",
          "Au",
          "Gd",
          "Go"
        ],
        "Au comes from the Latin word aurum."
      ],
      [
        "Which organ pumps blood around the human body?",
        "Heart",
        [
          "Liver",
          "Lungs",
          "Heart",
          "Kidney"
        ],
        "The heart circulates blood through the cardiovascular system."
      ],
      [
        "At sea level, water boils at what temperature on the Celsius scale?",
        "100°C",
        [
          "0°C",
          "50°C",
          "100°C",
          "212°C"
        ],
        "At standard atmospheric pressure, water boils at 100°C."
      ],
      [
        "What is the basic unit of life?",
        "Cell",
        [
          "Atom",
          "Tissue",
          "Cell",
          "Organ"
        ],
        "All living organisms are made of one or more cells."
      ],
      [
        "Which planet is known for its prominent ring system?",
        "Saturn",
        [
          "Mars",
          "Venus",
          "Saturn",
          "Mercury"
        ],
        "Saturn’s rings are made mostly of ice and rocky particles."
      ],
      [
        "What force pulls objects toward Earth?",
        "Gravity",
        [
          "Friction",
          "Magnetism",
          "Gravity",
          "Electricity"
        ],
        "Gravity attracts objects with mass toward one another."
      ],
      [
        "Which part of a plant usually absorbs water from soil?",
        "Roots",
        [
          "Leaves",
          "Flowers",
          "Roots",
          "Fruit"
        ],
        "Roots absorb water and minerals from the soil."
      ],
      [
        "How many chambers does a typical human heart have?",
        "Four",
        [
          "Two",
          "Three",
          "Four",
          "Five"
        ],
        "The human heart has two atria and two ventricles."
      ],
      [
        "Which particle has a negative electric charge?",
        "Electron",
        [
          "Proton",
          "Neutron",
          "Electron",
          "Photon"
        ],
        "Electrons carry negative electric charge."
      ],
      [
        "What is the hardest naturally occurring mineral on the Mohs scale?",
        "Diamond",
        [
          "Quartz",
          "Diamond",
          "Topaz",
          "Corundum"
        ],
        "Diamond has Mohs hardness 10."
      ],
      [
        "Which layer of Earth is liquid and surrounds the inner core?",
        "Outer core",
        [
          "Crust",
          "Mantle",
          "Inner core",
          "Outer core"
        ],
        "Earth’s outer core is liquid and mainly iron and nickel."
      ],
      [
        "What does DNA stand for?",
        "Deoxyribonucleic acid",
        [
          "Dynamic nitrogen atom",
          "Deoxyribonucleic acid",
          "Dual nucleus array",
          "Digital nucleic acid"
        ],
        "DNA is short for deoxyribonucleic acid."
      ],
      [
        "A solution with a pH below 7 is generally described as what?",
        "Acidic",
        [
          "Neutral",
          "Alkaline",
          "Acidic",
          "Metallic"
        ],
        "On the usual pH scale, values below 7 are acidic."
      ],
      [
        "Why can sound not travel through a vacuum?",
        "It needs a material medium",
        [
          "It moves too slowly",
          "It needs a material medium",
          "It is made of light",
          "Gravity blocks it"
        ],
        "Sound is a mechanical wave and needs particles to transmit vibrations."
      ],
      [
        "Which vitamin can the human body produce in skin with suitable sunlight exposure?",
        "Vitamin D",
        [
          "Vitamin A",
          "Vitamin B12",
          "Vitamin C",
          "Vitamin D"
        ],
        "UVB exposure helps skin synthesize vitamin D."
      ],
      [
        "Which blood cells mainly carry oxygen using haemoglobin?",
        "Red blood cells",
        [
          "Platelets",
          "Red blood cells",
          "White blood cells",
          "Stem cells"
        ],
        "Red blood cells contain haemoglobin, which transports oxygen."
      ],
      [
        "What is the chemical formula for water?",
        "H₂O",
        [
          "CO₂",
          "O₂",
          "H₂O",
          "NaCl"
        ],
        "A water molecule contains two hydrogen atoms and one oxygen atom."
      ],
      [
        "Which green pigment helps plants capture light for photosynthesis?",
        "Chlorophyll",
        [
          "Melanin",
          "Chlorophyll",
          "Keratin",
          "Haemoglobin"
        ],
        "Chlorophyll absorbs light energy used in photosynthesis."
      ],
      [
        "What is the SI unit of force?",
        "Newton",
        [
          "Joule",
          "Watt",
          "Newton",
          "Pascal"
        ],
        "Force is measured in newtons, named after Isaac Newton."
      ],
      [
        "What is the SI base unit of electric current?",
        "Ampere",
        [
          "Volt",
          "Ohm",
          "Ampere",
          "Coulomb"
        ],
        "The ampere is the SI base unit for electric current."
      ],
      [
        "Which gas makes up the largest share of Earth's atmosphere?",
        "Nitrogen",
        [
          "Oxygen",
          "Carbon dioxide",
          "Nitrogen",
          "Argon"
        ],
        "Nitrogen accounts for about 78% of dry air."
      ],
      [
        "Which organs filter waste from blood to form urine?",
        "Kidneys",
        [
          "Lungs",
          "Kidneys",
          "Pancreas",
          "Stomach"
        ],
        "The kidneys filter blood and produce urine."
      ],
      [
        "How many bones are typically present in an adult human skeleton?",
        "206",
        [
          "106",
          "186",
          "206",
          "306"
        ],
        "A typical adult human skeleton has 206 bones, though variation exists."
      ]
    ]
  },
  {
    "name": "Space & Astronomy",
    "slug": "space-astronomy",
    "desc": "Discover planets, stars, galaxies and space exploration.",
    "icon": "Orbit",
    "image": "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80",
    "type": "TRIVIA",
    "qs": [
      [
        "Which planet is closest to the Sun?",
        "Mercury",
        [
          "Venus",
          "Earth",
          "Mercury",
          "Mars"
        ],
        "Mercury is the innermost planet in the Solar System."
      ],
      [
        "What is the name of our galaxy?",
        "Milky Way",
        [
          "Andromeda",
          "Milky Way",
          "Whirlpool",
          "Sombrero"
        ],
        "Our Solar System is located in the Milky Way."
      ],
      [
        "Which planet is the largest in the Solar System?",
        "Jupiter",
        [
          "Saturn",
          "Earth",
          "Neptune",
          "Jupiter"
        ],
        "Jupiter is the largest planet by diameter and mass."
      ],
      [
        "What causes the phases of the Moon?",
        "Changing views of its sunlit half",
        [
          "Earth’s shadow every night",
          "Clouds covering it",
          "Changing views of its sunlit half",
          "The Moon changing shape"
        ],
        "We see different portions of the Moon’s illuminated hemisphere as it orbits Earth."
      ],
      [
        "What is a light-year a measure of?",
        "Distance",
        [
          "Time",
          "Brightness",
          "Distance",
          "Temperature"
        ],
        "A light-year is the distance light travels in one year."
      ],
      [
        "Which star is closest to Earth after the Sun?",
        "Proxima Centauri",
        [
          "Sirius",
          "Vega",
          "Proxima Centauri",
          "Polaris"
        ],
        "Proxima Centauri is the nearest known star beyond the Sun."
      ],
      [
        "What is the Sun primarily made of?",
        "Hydrogen and helium",
        [
          "Oxygen and nitrogen",
          "Iron and nickel",
          "Hydrogen and helium",
          "Carbon and silicon"
        ],
        "The Sun is composed mostly of hydrogen and helium plasma."
      ],
      [
        "Which planet is famous for its Great Red Spot?",
        "Jupiter",
        [
          "Mars",
          "Jupiter",
          "Neptune",
          "Saturn"
        ],
        "The Great Red Spot is a giant storm in Jupiter’s atmosphere."
      ],
      [
        "What object is at the centre of our Solar System?",
        "The Sun",
        [
          "Earth",
          "Jupiter",
          "The Moon",
          "The Sun"
        ],
        "The planets orbit the Sun due to its gravitational pull."
      ],
      [
        "Which was the first artificial satellite launched into orbit?",
        "Sputnik 1",
        [
          "Apollo 11",
          "Voyager 1",
          "Sputnik 1",
          "Hubble"
        ],
        "The Soviet Union launched Sputnik 1 in 1957."
      ],
      [
        "What is a black hole’s event horizon?",
        "Boundary beyond which light cannot escape",
        [
          "Its brightest ring",
          "A planetary orbit",
          "Boundary beyond which light cannot escape",
          "A solid surface"
        ],
        "Inside the event horizon, escape velocity exceeds the speed of light."
      ],
      [
        "Which planet rotates on its side to a large degree?",
        "Uranus",
        [
          "Mars",
          "Mercury",
          "Uranus",
          "Earth"
        ],
        "Uranus has an extreme axial tilt of about 98 degrees."
      ],
      [
        "Which planet is often called the Red Planet?",
        "Mars",
        [
          "Venus",
          "Mars",
          "Jupiter",
          "Mercury"
        ],
        "Iron-rich dust gives Mars its reddish appearance."
      ],
      [
        "Which planet has a rotation period longer than its orbital period?",
        "Venus",
        [
          "Earth",
          "Mars",
          "Venus",
          "Jupiter"
        ],
        "Venus rotates very slowly; one rotation takes longer than one orbit around the Sun."
      ],
      [
        "Earth's Moon is best described as what?",
        "A natural satellite",
        [
          "A comet",
          "A natural satellite",
          "A dwarf planet",
          "A star"
        ],
        "The Moon naturally orbits Earth."
      ],
      [
        "In which year did Apollo 11 land humans on the Moon?",
        "1969",
        [
          "1959",
          "1965",
          "1969",
          "1975"
        ],
        "Apollo 11 landed on the Moon in July 1969."
      ],
      [
        "Which space telescope launched in 1990 and observes the universe from orbit?",
        "Hubble Space Telescope",
        [
          "Kepler ground array",
          "Hubble Space Telescope",
          "Very Large Telescope",
          "Arecibo Telescope"
        ],
        "The Hubble Space Telescope launched in April 1990."
      ],
      [
        "A comet's tail generally points in which direction?",
        "Away from the Sun",
        [
          "Toward the Sun",
          "Away from the Sun",
          "Always toward Earth",
          "Along its orbit only"
        ],
        "Solar wind and radiation pressure push cometary material away from the Sun."
      ],
      [
        "Which planet appears blue partly because methane absorbs red light in its atmosphere?",
        "Neptune",
        [
          "Mercury",
          "Mars",
          "Neptune",
          "Venus"
        ],
        "Methane in Neptune's atmosphere absorbs red wavelengths, contributing to its blue colour."
      ],
      [
        "The main asteroid belt lies between which two planets?",
        "Mars and Jupiter",
        [
          "Earth and Mars",
          "Mars and Jupiter",
          "Jupiter and Saturn",
          "Venus and Earth"
        ],
        "Most main-belt asteroids orbit between Mars and Jupiter."
      ],
      [
        "During a total solar eclipse, which body moves between Earth and the Sun?",
        "The Moon",
        [
          "Mars",
          "The Moon",
          "Venus",
          "Jupiter"
        ],
        "The Moon blocks the Sun from the observer's view."
      ],
      [
        "Who was the first human to travel into space?",
        "Yuri Gagarin",
        [
          "Neil Armstrong",
          "John Glenn",
          "Yuri Gagarin",
          "Alan Shepard"
        ],
        "Soviet cosmonaut Yuri Gagarin orbited Earth in 1961."
      ],
      [
        "The International Space Station orbits which celestial body?",
        "Earth",
        [
          "The Moon",
          "Mars",
          "Earth",
          "The Sun alone"
        ],
        "The ISS travels in low Earth orbit."
      ],
      [
        "What is the largest moon in the Solar System?",
        "Ganymede",
        [
          "Titan",
          "Europa",
          "Ganymede",
          "Earth's Moon"
        ],
        "Jupiter's moon Ganymede is larger than the planet Mercury by diameter."
      ]
    ]
  },
  {
    "name": "History & Civilizations",
    "slug": "history-civilizations",
    "desc": "Explore ancient societies, major events and world heritage.",
    "icon": "Landmark",
    "image": "https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=1200&q=80",
    "type": "TRIVIA",
    "qs": [
      [
        "The pyramids at Giza are in which modern country?",
        "Egypt",
        [
          "Mexico",
          "Egypt",
          "Iraq",
          "Sudan"
        ],
        "The Giza pyramid complex is on the outskirts of Cairo, Egypt."
      ],
      [
        "The ancient Olympic Games originated in which country?",
        "Greece",
        [
          "Italy",
          "Greece",
          "Turkey",
          "Egypt"
        ],
        "The ancient games were held at Olympia in Greece."
      ],
      [
        "The printing press associated with Johannes Gutenberg developed in which century?",
        "15th century",
        [
          "11th century",
          "13th century",
          "15th century",
          "18th century"
        ],
        "Gutenberg’s movable-type printing press spread in Europe around the mid-15th century."
      ],
      [
        "Which ancient civilization developed cuneiform writing?",
        "Sumerians",
        [
          "Romans",
          "Sumerians",
          "Vikings",
          "Aztecs"
        ],
        "Cuneiform emerged in ancient Mesopotamia."
      ],
      [
        "The Great Wall is most closely associated with which country?",
        "China",
        [
          "India",
          "Japan",
          "China",
          "Mongolia"
        ],
        "Various walls were built and connected by Chinese states and dynasties."
      ],
      [
        "In which year did World War II end?",
        "1945",
        [
          "1918",
          "1939",
          "1945",
          "1950"
        ],
        "The war ended in 1945."
      ],
      [
        "Which city was the centre of the Roman Empire?",
        "Rome",
        [
          "Athens",
          "Carthage",
          "Rome",
          "Alexandria"
        ],
        "Rome was the capital and political centre of the Roman Empire."
      ],
      [
        "The Rosetta Stone helped scholars decipher which writing system?",
        "Egyptian hieroglyphs",
        [
          "Cuneiform",
          "Runes",
          "Egyptian hieroglyphs",
          "Linear B"
        ],
        "Its parallel texts helped decode Egyptian hieroglyphs."
      ],
      [
        "Who was the first person to walk on the Moon?",
        "Neil Armstrong",
        [
          "Yuri Gagarin",
          "Buzz Aldrin",
          "Neil Armstrong",
          "Michael Collins"
        ],
        "Neil Armstrong stepped onto the Moon in July 1969."
      ],
      [
        "The Renaissance began in which region of Europe?",
        "Italy",
        [
          "Scandinavia",
          "Italy",
          "Iberia",
          "Britain"
        ],
        "The Renaissance emerged in Italian city-states before spreading across Europe."
      ],
      [
        "Which civilization built Machu Picchu?",
        "Inca",
        [
          "Maya",
          "Inca",
          "Aztec",
          "Olmec"
        ],
        "Machu Picchu is an Inca site in the Andes of Peru."
      ],
      [
        "The Berlin Wall fell in which year?",
        "1989",
        [
          "1979",
          "1985",
          "1989",
          "1995"
        ],
        "The Berlin Wall opened in November 1989."
      ],
      [
        "In which year did the French Revolution begin?",
        "1789",
        [
          "1689",
          "1776",
          "1789",
          "1815"
        ],
        "The French Revolution began in 1789."
      ],
      [
        "The Magna Carta was sealed in England in which year?",
        "1215",
        [
          "1066",
          "1215",
          "1492",
          "1666"
        ],
        "King John sealed Magna Carta in 1215."
      ],
      [
        "The Maya civilization developed mainly in which broad region?",
        "Mesoamerica",
        [
          "Scandinavia",
          "Mesoamerica",
          "Central Asia",
          "Southern Africa"
        ],
        "Maya societies developed across parts of present-day Mexico and Central America."
      ],
      [
        "The Taj Mahal is located in which country?",
        "India",
        [
          "Pakistan",
          "India",
          "Iran",
          "Bangladesh"
        ],
        "The Taj Mahal stands in Agra, India."
      ],
      [
        "Which region developed early woodblock printing and movable type traditions?",
        "China",
        [
          "China",
          "Iceland",
          "Brazil",
          "Morocco"
        ],
        "Printing technologies including woodblock printing developed in China."
      ],
      [
        "In which year did the United States Declaration of Independence get adopted?",
        "1776",
        [
          "1492",
          "1776",
          "1812",
          "1865"
        ],
        "The Declaration of Independence was adopted on 4 July 1776."
      ],
      [
        "Apartheid was a system of racial segregation associated with which country?",
        "South Africa",
        [
          "Argentina",
          "South Africa",
          "Japan",
          "Canada"
        ],
        "Apartheid was enforced by South Africa's government for decades."
      ],
      [
        "Nelson Mandela became president of South Africa in which year?",
        "1994",
        [
          "1984",
          "1990",
          "1994",
          "2001"
        ],
        "Mandela became president after South Africa's 1994 democratic election."
      ],
      [
        "Viking seafarers originated primarily from which region?",
        "Scandinavia",
        [
          "Scandinavia",
          "West Africa",
          "Polynesia",
          "The Andes"
        ],
        "The Viking Age is associated with Scandinavian peoples."
      ],
      [
        "Mohenjo-daro was part of which ancient civilization?",
        "Indus Valley Civilization",
        [
          "Minoan Civilization",
          "Indus Valley Civilization",
          "Roman Empire",
          "Inca Empire"
        ],
        "Mohenjo-daro was a major urban centre of the Indus Valley Civilization."
      ],
      [
        "Which ancient Greek city is strongly associated with the development of democracy?",
        "Athens",
        [
          "Sparta",
          "Athens",
          "Corinth",
          "Troy"
        ],
        "Classical Athens developed an early form of direct democracy for eligible citizens."
      ],
      [
        "The Cold War was primarily a geopolitical rivalry between the United States and which power?",
        "Soviet Union",
        [
          "Ottoman Empire",
          "Soviet Union",
          "Ming dynasty",
          "Spanish Empire"
        ],
        "The US and Soviet Union were the principal rivals during the Cold War."
      ]
    ]
  },
  {
    "name": "Technology & Computing",
    "slug": "technology-computing",
    "desc": "Test your knowledge of computers, the internet and digital systems.",
    "icon": "Cpu",
    "image": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    "type": "TRIVIA",
    "qs": [
      [
        "What does CPU stand for?",
        "Central Processing Unit",
        [
          "Computer Power Utility",
          "Central Processing Unit",
          "Core Program Upload",
          "Central Peripheral Unit"
        ],
        "The CPU executes instructions and performs core processing tasks."
      ],
      [
        "Which language is primarily used to structure web pages?",
        "HTML",
        [
          "Python",
          "HTML",
          "SQL",
          "Bash"
        ],
        "HTML describes the structure and content of web pages."
      ],
      [
        "What does URL stand for?",
        "Uniform Resource Locator",
        [
          "Universal Record Link",
          "Uniform Resource Locator",
          "Unified Routing Language",
          "User Reference List"
        ],
        "A URL identifies the location of a resource on the web."
      ],
      [
        "Which of these is an operating system?",
        "Linux",
        [
          "HTML",
          "Linux",
          "HTTP",
          "USB"
        ],
        "Linux is an operating system kernel used in many distributions."
      ],
      [
        "What is phishing?",
        "A deceptive attempt to steal sensitive information",
        [
          "A way to cool a CPU",
          "A deceptive attempt to steal sensitive information",
          "A file compression method",
          "A network cable type"
        ],
        "Phishing tricks people into revealing credentials or other sensitive data."
      ],
      [
        "What does RAM mainly provide?",
        "Temporary working memory",
        [
          "Permanent cloud storage",
          "Temporary working memory",
          "Internet access",
          "Graphics output only"
        ],
        "RAM stores data and instructions in active use."
      ],
      [
        "Which protocol is commonly used to load secure websites?",
        "HTTPS",
        [
          "FTP",
          "SMTP",
          "HTTPS",
          "Telnet"
        ],
        "HTTPS encrypts HTTP traffic using TLS."
      ],
      [
        "In programming, what is a loop used for?",
        "Repeating instructions",
        [
          "Encrypting a hard drive",
          "Repeating instructions",
          "Creating a monitor",
          "Connecting a printer only"
        ],
        "Loops repeat a block while a condition or iteration sequence applies."
      ],
      [
        "What does 2FA add to account security?",
        "A second verification factor",
        [
          "A second username",
          "A second verification factor",
          "A larger screen",
          "Automatic public access"
        ],
        "Two-factor authentication requires another proof beyond the password."
      ],
      [
        "Which company created the Python programming language?",
        "No company; it was created by Guido van Rossum",
        [
          "Microsoft",
          "Apple",
          "No company; it was created by Guido van Rossum",
          "IBM"
        ],
        "Python was created by Guido van Rossum and first released in 1991."
      ],
      [
        "What is an IP address used for?",
        "Identifying an interface on a network",
        [
          "Charging a battery",
          "Identifying an interface on a network",
          "Compressing images",
          "Formatting text"
        ],
        "IP addresses help route data to network interfaces."
      ],
      [
        "Which storage type has no moving mechanical parts?",
        "SSD",
        [
          "HDD",
          "DVD drive",
          "SSD",
          "Tape drive"
        ],
        "Solid-state drives use flash memory rather than spinning platters."
      ],
      [
        "The binary number system uses which base?",
        "Base 2",
        [
          "Base 2",
          "Base 8",
          "Base 10",
          "Base 16"
        ],
        "Binary uses only the digits 0 and 1."
      ],
      [
        "What is SQL commonly used for?",
        "Querying and managing relational databases",
        [
          "Editing video",
          "Querying and managing relational databases",
          "Designing circuit boards",
          "Compressing audio"
        ],
        "SQL is a language for working with relational database data."
      ],
      [
        "What does HTTP stand for?",
        "Hypertext Transfer Protocol",
        [
          "High Transfer Text Process",
          "Hypertext Transfer Protocol",
          "Host Text Transmission Program",
          "Hyperlink Tracking Transfer Path"
        ],
        "HTTP is the Hypertext Transfer Protocol used by the web."
      ],
      [
        "In Python, which collection type is ordered and mutable?",
        "List",
        [
          "Tuple",
          "List",
          "String",
          "Frozen set"
        ],
        "Python lists preserve order and can be modified."
      ],
      [
        "What is Git primarily used for?",
        "Version control",
        [
          "Video rendering",
          "Version control",
          "Email hosting",
          "Image scanning"
        ],
        "Git tracks changes to files, especially source code."
      ],
      [
        "What does DNS translate domain names into for internet routing?",
        "IP addresses",
        [
          "Passwords",
          "IP addresses",
          "Image pixels",
          "Keyboard shortcuts"
        ],
        "DNS resolves domain names to records including IP addresses."
      ],
      [
        "Which kind of memory is typically volatile?",
        "RAM",
        [
          "RAM",
          "SSD storage",
          "Blu-ray disc",
          "USB flash drive"
        ],
        "RAM usually loses its stored contents when power is removed."
      ],
      [
        "Machine learning is commonly considered a subfield of what?",
        "Artificial intelligence",
        [
          "Typography",
          "Artificial intelligence",
          "Civil engineering",
          "Accounting"
        ],
        "Machine learning develops systems that learn patterns from data."
      ],
      [
        "Bluetooth is designed primarily for what kind of communication?",
        "Short-range wireless communication",
        [
          "Deep-space radio only",
          "Short-range wireless communication",
          "Undersea fibre links",
          "Satellite navigation only"
        ],
        "Bluetooth connects nearby devices wirelessly."
      ],
      [
        "What does USB stand for?",
        "Universal Serial Bus",
        [
          "Unified Storage Block",
          "Universal Serial Bus",
          "User System Backup",
          "Universal Signal Board"
        ],
        "USB is short for Universal Serial Bus."
      ],
      [
        "Which computer component is especially designed to accelerate graphics processing?",
        "GPU",
        [
          "GPU",
          "Power supply",
          "Keyboard",
          "Ethernet cable"
        ],
        "A graphics processing unit accelerates graphics and parallel workloads."
      ],
      [
        "What does QR in QR code stand for?",
        "Quick Response",
        [
          "Quality Record",
          "Quick Response",
          "Query Route",
          "Quantum Read"
        ],
        "QR stands for Quick Response."
      ]
    ]
  },
  {
    "name": "Animals & Wildlife",
    "slug": "animals-wildlife",
    "desc": "Learn about animal habitats, adaptations and biodiversity.",
    "icon": "PawPrint",
    "image": "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1200&q=80",
    "type": "TRIVIA",
    "qs": [
      [
        "Which mammal is capable of true powered flight?",
        "Bat",
        [
          "Flying squirrel",
          "Bat",
          "Sugar glider",
          "Colugo"
        ],
        "Bats are the only mammals capable of sustained powered flight."
      ],
      [
        "What is the largest animal known to have lived on Earth?",
        "Blue whale",
        [
          "African elephant",
          "Blue whale",
          "Whale shark",
          "Giraffe"
        ],
        "The blue whale is the largest known animal."
      ],
      [
        "Which animal is a marsupial native to Australia?",
        "Kangaroo",
        [
          "Panda",
          "Kangaroo",
          "Tiger",
          "Polar bear"
        ],
        "Kangaroos carry young in a pouch."
      ],
      [
        "What do bees collect from flowers to make honey?",
        "Nectar",
        [
          "Salt water",
          "Nectar",
          "Tree bark",
          "Sand"
        ],
        "Honey bees convert nectar into honey."
      ],
      [
        "Which group of animals has feathers?",
        "Birds",
        [
          "Mammals",
          "Birds",
          "Reptiles",
          "Amphibians"
        ],
        "Feathers are a defining characteristic of birds."
      ],
      [
        "What is a group of lions commonly called?",
        "A pride",
        [
          "A pack",
          "A herd",
          "A pride",
          "A school"
        ],
        "Lions typically live in social groups called prides."
      ],
      [
        "Which ocean animal has three hearts?",
        "Octopus",
        [
          "Dolphin",
          "Octopus",
          "Sea turtle",
          "Seahorse"
        ],
        "An octopus has three hearts and blue, copper-based blood."
      ],
      [
        "Which animal is known for changing colour using specialised skin cells?",
        "Chameleon",
        [
          "Koala",
          "Chameleon",
          "Penguin",
          "Meerkat"
        ],
        "Chameleons can change colour for communication and thermoregulation."
      ],
      [
        "What is the primary food of giant pandas?",
        "Bamboo",
        [
          "Fish",
          "Bamboo",
          "Insects",
          "Grasshoppers"
        ],
        "Giant pandas eat mostly bamboo."
      ],
      [
        "Which is the fastest land animal over short distances?",
        "Cheetah",
        [
          "Lion",
          "Horse",
          "Cheetah",
          "Grey wolf"
        ],
        "Cheetahs are adapted for high-speed sprints."
      ],
      [
        "Amphibians typically begin life in what environment?",
        "Water",
        [
          "Desert sand",
          "Water",
          "Tree bark",
          "Open ocean only"
        ],
        "Many amphibians lay eggs in water and have aquatic larvae."
      ],
      [
        "What do we call animals that are active mainly at night?",
        "Nocturnal",
        [
          "Diurnal",
          "Nocturnal",
          "Aquatic",
          "Arboreal"
        ],
        "Nocturnal animals are primarily active during the night."
      ],
      [
        "Which feature defines mammals?",
        "They produce milk to feed their young",
        [
          "They all lay eggs",
          "They produce milk to feed their young",
          "They all live on land",
          "They all have scales"
        ],
        "Mammary glands producing milk are a defining mammalian trait."
      ],
      [
        "Which bird is flightless and adapted to swimming?",
        "Penguin",
        [
          "Eagle",
          "Penguin",
          "Swallow",
          "Albatross"
        ],
        "Penguins are flightless birds with flipper-like wings for swimming."
      ],
      [
        "Which animal has the longest neck among living land animals?",
        "Giraffe",
        [
          "Camel",
          "Ostrich",
          "Giraffe",
          "Okapi"
        ],
        "Giraffes are known for their exceptionally long necks."
      ],
      [
        "Dolphins belong to which animal group?",
        "Mammals",
        [
          "Fish",
          "Mammals",
          "Reptiles",
          "Amphibians"
        ],
        "Dolphins breathe air, give birth to live young and nurse them."
      ],
      [
        "What do a camel's humps primarily store?",
        "Fat",
        [
          "Water",
          "Fat",
          "Air",
          "Salt"
        ],
        "Camel humps store fat, which can be metabolized for energy."
      ],
      [
        "Adult frogs belong to which animal class?",
        "Amphibians",
        [
          "Reptiles",
          "Birds",
          "Amphibians",
          "Mammals"
        ],
        "Frogs are amphibians, though their life cycle often includes aquatic tadpoles."
      ],
      [
        "Crocodiles belong to which group?",
        "Reptiles",
        [
          "Amphibians",
          "Reptiles",
          "Mammals",
          "Birds"
        ],
        "Crocodilians are reptiles."
      ],
      [
        "Giant pandas are native to which country?",
        "China",
        [
          "India",
          "China",
          "Thailand",
          "Brazil"
        ],
        "Wild giant pandas live in mountain forests in central China."
      ],
      [
        "Which bird is commonly associated with nocturnal hunting?",
        "Owl",
        [
          "Peacock",
          "Owl",
          "Swan",
          "Flamingo"
        ],
        "Many owl species are adapted for hunting at night."
      ],
      [
        "Which fish migrates from the ocean into freshwater to spawn?",
        "Salmon",
        [
          "Clownfish",
          "Salmon",
          "Seahorse",
          "Manta ray"
        ],
        "Many salmon species return from the sea to freshwater spawning grounds."
      ],
      [
        "Polar bears naturally live in which region?",
        "The Arctic",
        [
          "The Antarctic",
          "The Arctic",
          "The Sahara",
          "The Amazon"
        ],
        "Polar bears are native to Arctic regions, not Antarctica."
      ],
      [
        "Corals are made up of colonies of which kind of animal?",
        "Cnidarians",
        [
          "Molluscs",
          "Cnidarians",
          "Crustaceans",
          "Echinoderms"
        ],
        "Coral polyps are cnidarians related to jellyfish and sea anemones."
      ]
    ]
  },
  {
    "name": "Numbers & Math",
    "slug": "numbers-math",
    "desc": "Solve number patterns, arithmetic, geometry and mathematical reasoning.",
    "icon": "Sigma",
    "image": "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80",
    "type": "NUMBER",
    "qs": [
      [
        "What is 15% of 200?",
        "30",
        [
          "15",
          "20",
          "30",
          "45"
        ],
        "0.15 × 200 = 30."
      ],
      [
        "What is the next prime number after 7?",
        "11",
        [
          "9",
          "10",
          "11",
          "13"
        ],
        "11 is the next integer greater than 7 with exactly two positive divisors."
      ],
      [
        "What is the area of a rectangle 8 cm long and 3 cm wide?",
        "24 cm²",
        [
          "11 cm²",
          "22 cm²",
          "24 cm²",
          "48 cm²"
        ],
        "Area equals length multiplied by width: 8 × 3 = 24."
      ],
      [
        "What is 3/4 expressed as a percentage?",
        "75%",
        [
          "25%",
          "50%",
          "75%",
          "80%"
        ],
        "Three quarters equals 0.75 or 75%."
      ],
      [
        "Solve: 5x = 45. What is x?",
        "9",
        [
          "5",
          "8",
          "9",
          "40"
        ],
        "Divide both sides by 5 to get x = 9."
      ],
      [
        "What is the sum of the interior angles of a triangle?",
        "180°",
        [
          "90°",
          "180°",
          "270°",
          "360°"
        ],
        "The interior angles of a Euclidean triangle sum to 180 degrees."
      ],
      [
        "What is the median of 2, 4, 7, 9, 20?",
        "7",
        [
          "4",
          "7",
          "8",
          "9"
        ],
        "The middle value in the ordered list is 7."
      ],
      [
        "What is the square root of 144?",
        "12",
        [
          "10",
          "11",
          "12",
          "14"
        ],
        "12 × 12 = 144."
      ],
      [
        "If a fair coin is flipped once, what is the probability of heads?",
        "1/2",
        [
          "1/4",
          "1/3",
          "1/2",
          "1"
        ],
        "A fair coin has two equally likely outcomes."
      ],
      [
        "What is the perimeter of a square with side 6 cm?",
        "24 cm",
        [
          "12 cm",
          "18 cm",
          "24 cm",
          "36 cm"
        ],
        "A square has four equal sides: 4 × 6 = 24 cm."
      ],
      [
        "What is 2³?",
        "8",
        [
          "6",
          "8",
          "9",
          "12"
        ],
        "2³ means 2 × 2 × 2 = 8."
      ],
      [
        "A price of $80 is reduced by 25%. What is the new price?",
        "$60",
        [
          "$20",
          "$55",
          "$60",
          "$75"
        ],
        "25% of $80 is $20; $80 − $20 = $60."
      ],
      [
        "What is the approximate value of π to two decimal places?",
        "3.14",
        [
          "2.14",
          "3.14",
          "3.41",
          "4.13"
        ],
        "Pi is approximately 3.14159."
      ],
      [
        "What is 7 squared?",
        "49",
        [
          "14",
          "42",
          "49",
          "56"
        ],
        "Seven squared is 7 × 7 = 49."
      ],
      [
        "What is the sum of the interior angles of a quadrilateral?",
        "360°",
        [
          "180°",
          "270°",
          "360°",
          "540°"
        ],
        "A quadrilateral's interior angles sum to 360 degrees."
      ],
      [
        "A prime number has how many positive divisors?",
        "Exactly two",
        [
          "Exactly one",
          "Exactly two",
          "Exactly three",
          "Infinitely many"
        ],
        "A prime number has exactly two positive divisors: 1 and itself."
      ],
      [
        "A 2:3 ratio totals 25. What is the value of the smaller part?",
        "10",
        [
          "5",
          "10",
          "12",
          "15"
        ],
        "There are five equal parts; each is 25 ÷ 5 = 5, so the smaller part is 2 × 5 = 10."
      ],
      [
        "How many feet are in one statute mile?",
        "5,280",
        [
          "1,000",
          "3,280",
          "5,280",
          "6,000"
        ],
        "One statute mile equals 5,280 feet."
      ],
      [
        "Which fraction equals the decimal 0.25?",
        "1/4",
        [
          "1/2",
          "1/3",
          "1/4",
          "3/4"
        ],
        "0.25 is one quarter."
      ],
      [
        "What is the circumference of a circle with radius r?",
        "2πr",
        [
          "πr²",
          "2πr",
          "πd²",
          "r²"
        ],
        "Circumference is 2π times the radius, or π times the diameter."
      ],
      [
        "What is the mean of 2, 4 and 6?",
        "4",
        [
          "3",
          "4",
          "5",
          "6"
        ],
        "The mean is (2 + 4 + 6) ÷ 3 = 4."
      ],
      [
        "What is the sign of a negative number multiplied by another negative number?",
        "Positive",
        [
          "Negative",
          "Positive",
          "Always zero",
          "Cannot be determined"
        ],
        "The product of two negative numbers is positive."
      ],
      [
        "What is 0 factorial (0!) equal to?",
        "1",
        [
          "0",
          "1",
          "Undefined",
          "10"
        ],
        "By definition, 0! equals 1, consistent with factorial identities."
      ],
      [
        "What is the simplified form of the ratio 15:20?",
        "3:4",
        [
          "2:3",
          "3:4",
          "4:5",
          "5:6"
        ],
        "Divide both terms by their greatest common divisor, 5."
      ]
    ]
  }
];

async function main() {
  console.log("Replacing the old catalogue with REASA's curated MCQ collection...");
  // Intentional full content reset: old categories, puzzles, attempts and answers are removed.
  await prisma.puzzle.deleteMany();
  await prisma.category.deleteMany();
  for (const [catIndex, cat] of catalogue.entries()) {
    const category = await prisma.category.create({ data: { name: cat.name, slug: cat.slug, description: cat.desc, icon: cat.icon, image: cat.image, sortOrder: catIndex + 1, isActive: true } });
    for (let setIndex = 0; setIndex < SETS_PER_CATEGORY; setIndex++) {
      const title = `${cat.name}: Challenge ${String(setIndex + 1).padStart(2, "0")}`;
      const slug = `${cat.slug}-${String(setIndex + 1).padStart(2, "0")}`;
      // Each question bank contains 24 unique MCQs. Two different questions go into each set.
      const selectedQuestions = [cat.qs[setIndex], cat.qs[setIndex + SETS_PER_CATEGORY]];
      if (selectedQuestions.length !== QUESTIONS_PER_SET || selectedQuestions.some((q: any) => !q)) throw new Error(`Missing MCQ data for ${slug}`);
      await prisma.puzzle.create({
        data: { title, slug, description: `Two topic-focused multiple-choice questions about ${cat.name.toLowerCase()}.`, type: cat.type as PuzzleType, difficulty: ([Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD][setIndex % 3]), questionCount: selectedQuestions.length, estimatedTime: 2, featured: setIndex < 2, trending: false, published: true, image: cat.image, thumbnail: cat.image, seoTitle: `${title} | REASA`, seoDescription: `Play this ${cat.name.toLowerCase()} multiple-choice challenge on REASA.`, categoryId: category.id, publishedAt: new Date(), questions: { create: selectedQuestions.map((q: any, qIndex: number) => { const [question, correct, options, explanation] = q; if (!options.includes(correct) || options.length !== 4 || new Set(options).size !== 4) throw new Error(`Invalid MCQ options: ${question}`); return { question, type: QuestionType.MULTIPLE_CHOICE, explanation, points: 1, sortOrder: qIndex + 1, options: { create: options.map((text: string, optionIndex: number) => ({ text, isCorrect: text === correct, sortOrder: optionIndex + 1 })) } }; }) } }
      });
    }
    console.log(`Created ${SETS_PER_CATEGORY} unique sets for ${cat.name}`);
  }
  console.log(`Complete: ${catalogue.length} categories, ${catalogue.length * SETS_PER_CATEGORY} quiz sets, ${catalogue.reduce((sum: number, c: any) => sum + c.qs.length, 0)} unique MCQs.`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => prisma.$disconnect());
