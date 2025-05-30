export const APP_NAME = "PlantCare AI";
export const APP_AUTHORS = "Gaganashree, Mithun, and Shahabaz";

export const KARNATAKA_DISTRICTS: string[] = [
  "Bagalkot", "Ballari (Bellary)", "Belagavi (Belgaum)", "Bengaluru Rural", 
  "Bengaluru Urban", "Bidar", "Chamarajanagar", "Chikballapur", 
  "Chikkamagaluru", "Chitradurga", "Dakshina Kannada", "Davanagere", 
  "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi (Gulbarga)", 
  "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru (Mysore)", 
  "Raichur", "Ramanagara", "Shivamogga (Shimoga)", "Tumakuru (Tumkur)", 
  "Udupi", "Uttara Kannada", "Vijayapura (Bijapur)", "Yadgir"
];

export interface PlantCategory {
  name: string;
  emoji: string;
  searchKeywords?: string; // For more detailed category searches if needed later
}

export const PLANT_CATEGORIES: PlantCategory[] = [
  // Fruits
  { name: "Apple", emoji: "🍎" },
  { name: "Banana", emoji: "🍌" },
  { name: "Grapes", emoji: "🍇" },
  { name: "Strawberry", emoji: "🍓" },
  { name: "Orange", emoji: "🍊" },
  { name: "Lemon", emoji: "🍋" },
  { name: "Mango", emoji: "🥭" },
  { name: "Pineapple", emoji: "🍍" },
  { name: "Watermelon", emoji: "🍉" },
  { name: "Pomegranate", emoji: "🔴" }, // Needs better emoji
  { name: "Cherry", emoji: "🍒" },
  { name: "Peach", emoji: "🍑" },
  { name: "Pear", emoji: "🍐" },
  { name: "Kiwi", emoji: "🥝" },
  { name: "Avocado", emoji: "🥑" },
  { name: "Coconut", emoji: "🥥" },
  { name: "Fig", emoji: "🪴" }, // Generic plant for fig
  { name: "Plum", emoji: "🍑" }, // Using peach as similar
  { name: "Guava", emoji: "🍈" }, // Using melon as generic tropical
  { name: "Papaya", emoji: "🥭" }, // Using mango as generic tropical
  // Vegetables
  { name: "Tomato", emoji: "🍅" },
  { name: "Potato", emoji: "🥔" },
  { name: "Carrot", emoji: "🥕" },
  { name: "Broccoli", emoji: "🥦" },
  { name: "Spinach", emoji: "🥬" },
  { name: "Onion", emoji: "🧅" },
  { name: "Garlic", emoji: "🧄" },
  { name: "Eggplant", emoji: "🍆" },
  { name: "Cucumber", emoji: "🥒" },
  { name: "Bell Pepper", emoji: "🌶️" },
  { name: "Lettuce", emoji: "🥬" },
  { name: "Pumpkin", emoji: "🎃" },
  { name: "Zucchini", emoji: "🥒" }, // Using cucumber
  { name: "Cauliflower", emoji: "🥦" }, // Using broccoli
  { name: "Radish", emoji: "🥕" }, // Using carrot for root veg
  { name: "Sweet Potato", emoji: "🍠" },
  { name: "Asparagus", emoji: " asparagus "}, // Text for now
  { name: "Celery", emoji: "🥬" }, // Using lettuce/spinach
  { name: "Mushroom", emoji: "🍄" }, // Fungi
  { name: "Corn (Maize)", emoji: "🌽" },
  // Ornamentals
  { name: "Rose", emoji: "🌹" },
  { name: "Sunflower", emoji: "🌻" },
  { name: "Tulip", emoji: "🌷" },
  { name: "Lily", emoji: "🌸" },
  { name: "Orchid", emoji: "🌺" },
  { name: "Fern", emoji: "🌿" },
  { name: "Bonsai", emoji: "🌳" },
  { name: "Cactus", emoji: "🌵" },
  { name: "Lavender", emoji: "💐" },
  { name: "Marigold", emoji: "🌼" },
  { name: "Hibiscus", emoji: "🌺" },
  { name: "Daisy", emoji: "🌼" }, // Using marigold/sunflower
  { name: "Peony", emoji: "🌸" }, // Using generic flower
  { name: "Succulent", emoji: "🪴" }, // Generic potted plant
  { name: "Ivy", emoji: "🌿" },
  { name: "Fiddle Leaf Fig", emoji: "🌳" },
  { name: "Monstera", emoji: "🍃" },
  { name: "Snake Plant", emoji: "🪴" },
  { name: "Spider Plant", emoji: "🪴" },
  // Herbs
  { name: "Basil", emoji: "🌿" },
  { name: "Mint", emoji: "🍃" },
  { name: "Rosemary", emoji: "🌿" },
  { name: "Thyme", emoji: "🌿" },
  { name: "Cilantro (Coriander)", emoji: "🌿" },
  { name: "Parsley", emoji: "🌿" },
  { name: "Dill", emoji: "🌿" },
  { name: "Oregano", emoji: "🌿" },
  { name: "Sage", emoji: "🌿" },
  { name: "Chamomile", emoji: "🌼" }, // Flower used for tea
  // Grains & Cereals
  { name: "Wheat", emoji: "🌾" },
  { name: "Rice", emoji: "🍚" },
  { name: "Oats", emoji: "🌾" },
  { name: "Barley", emoji: "🌾" },
  { name: "Rye", emoji: "🌾" },
  { name: "Quinoa", emoji: " अनाज "}, // Text for now
  { name: "Millet", emoji: "🌾" },
  // Spices (from plants)
  { name: "Chilli Pepper", emoji: "🌶️" },
  { name: "Turmeric Plant", emoji: "🌿" },
  { name: "Ginger Plant", emoji: "🌿" },
  { name: "Cinnamon Tree", emoji: "🌳" },
  { name: "Cardamom Plant", emoji: "🌿" },
  { name: "Clove Tree", emoji: "🌳" },
  { name: "Nutmeg Tree", emoji: "🌳" },
  // Trees
  { name: "Oak Tree", emoji: "🌳" },
  { name: "Pine Tree", emoji: "🌲" },
  { name: "Maple Tree", emoji: "🍁" },
  { name: "Palm Tree", emoji: "🌴" },
  { name: "Neem Tree", emoji: "🌳" },
  { name: "Eucalyptus Tree", emoji: "🌳" },
  { name: "Willow Tree", emoji: "🌳" },
  { name: "Birch Tree", emoji: "🌳" },
  // Legumes
  { name: "Beans (General)", emoji: "🫘" },
  { name: "Lentils", emoji: "🌿" }, // Plant that produces lentils
  { name: "Peas", emoji: "🫛" },
  { name: "Chickpeas", emoji: "🌿" }, // Plant that produces chickpeas
  { name: "Soybean", emoji: "🌿" },
  // Berries
  { name: "Blueberry", emoji: "🫐" },
  { name: "Raspberry", emoji: "🍓" }, // Using strawberry as stand-in
  { name: "Blackberry", emoji: "🫐" }, // Using blueberry as stand-in
  { name: "Cranberry", emoji: "🍓" },
  // Other Unique/Industrial
  { name: "Coffee Plant", emoji: "☕" },
  { name: "Tea Plant (Camellia sinensis)", emoji: "🫖" },
  { name: "Cotton Plant", emoji: "⚪" },
  { name: "Sugarcane", emoji: "🌿" },
  { name: "Bamboo", emoji: "🎍" },
  { name: "Hops", emoji: "🌿" }, // For beer
  { name: "Agave", emoji: "🌵" }, // For tequila, also ornamental
  { name: "Venus Flytrap", emoji: "🪴" }, // Carnivorous
  { name: "Pitcher Plant", emoji: "🪴" }, // Carnivorous
  { name: "Air Plant (Tillandsia)", emoji: "💨" } // Air + plant emoji
];

export const MONTHS: string[] = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

export const GEMINI_TEXT_MODEL = "gemini-2.5-flash-preview-04-17";
// For tasks involving image input, the same model supports multimodal inputs.
export const GEMINI_VISION_MODEL = "gemini-2.5-flash-preview-04-17";

export const OPENWEATHERMAP_API_URL = "https://api.openweathermap.org/data/2.5/weather";

// --- BEGIN MASSIVE PLANT LIST FOR PLANT SCAN PAGE ---
// This list is for the PlantScanPage picker UI. Each entry has a name, emoji, and category.
export const PLANT_LIST: { name: string; emoji: string; category: string }[] = [
  // Fruits
  { name: "Coconut", emoji: "🥥", category: "Fruits" },
  { name: "Tamarind", emoji: "🍈", category: "Fruits" },
  { name: "Apple", emoji: "🍎", category: "Fruits" },
  { name: "Banana", emoji: "🍌", category: "Fruits" },
  { name: "Mango", emoji: "🥭", category: "Fruits" },
  { name: "Orange", emoji: "🍊", category: "Fruits" },
  { name: "Papaya", emoji: "🥭", category: "Fruits" },
  { name: "Guava", emoji: "🍈", category: "Fruits" },
  { name: "Pineapple", emoji: "🍍", category: "Fruits" },
  { name: "Watermelon", emoji: "🍉", category: "Fruits" },
  { name: "Pomegranate", emoji: "🔴", category: "Fruits" },
  { name: "Lychee", emoji: "🍈", category: "Fruits" },
  { name: "Jackfruit", emoji: "🍈", category: "Fruits" },
  { name: "Dragon Fruit", emoji: "🐉", category: "Fruits" },
  { name: "Passion Fruit", emoji: "🍈", category: "Fruits" },
  { name: "Mulberry", emoji: "🫐", category: "Fruits" },
  { name: "Blackberry", emoji: "🫐", category: "Fruits" },
  { name: "Blueberry", emoji: "🫐", category: "Fruits" },
  { name: "Raspberry", emoji: "🍓", category: "Fruits" },
  { name: "Cranberry", emoji: "🍓", category: "Fruits" },
  // Vegetables
  { name: "Tomato", emoji: "🍅", category: "Vegetables" },
  { name: "Potato", emoji: "🥔", category: "Vegetables" },
  { name: "Carrot", emoji: "🥕", category: "Vegetables" },
  { name: "Broccoli", emoji: "🥦", category: "Vegetables" },
  { name: "Spinach", emoji: "🥬", category: "Vegetables" },
  { name: "Onion", emoji: "🧅", category: "Vegetables" },
  { name: "Garlic", emoji: "🧄", category: "Vegetables" },
  { name: "Eggplant", emoji: "🍆", category: "Vegetables" },
  { name: "Cucumber", emoji: "🥒", category: "Vegetables" },
  { name: "Bell Pepper", emoji: "🌶️", category: "Vegetables" },
  { name: "Lettuce", emoji: "🥬", category: "Vegetables" },
  { name: "Pumpkin", emoji: "🎃", category: "Vegetables" },
  { name: "Zucchini", emoji: "🥒", category: "Vegetables" },
  { name: "Cauliflower", emoji: "🥦", category: "Vegetables" },
  { name: "Radish", emoji: "🥕", category: "Vegetables" },
  { name: "Sweet Potato", emoji: "🍠", category: "Vegetables" },
  { name: "Asparagus", emoji: "🥦", category: "Vegetables" },
  { name: "Celery", emoji: "🥬", category: "Vegetables" },
  { name: "Mushroom", emoji: "🍄", category: "Vegetables" },
  { name: "Corn (Maize)", emoji: "🌽", category: "Vegetables" },
  // Pulses
  { name: "Pigeon Pea", emoji: "🫘", category: "Pulses" },
  { name: "Black Gram", emoji: "🫘", category: "Pulses" },
  { name: "Green Gram", emoji: "🫘", category: "Pulses" },
  { name: "Chickpea", emoji: "🫘", category: "Pulses" },
  { name: "Lentil", emoji: "🫘", category: "Pulses" },
  { name: "Kidney Bean", emoji: "🫘", category: "Pulses" },
  { name: "Soybean", emoji: "🫘", category: "Pulses" },
  { name: "Moth Bean", emoji: "🫘", category: "Pulses" },
  { name: "Horse Gram", emoji: "🫘", category: "Pulses" },
  { name: "Field Pea", emoji: "🫘", category: "Pulses" },
  // Cereals & Millets
  { name: "Rice", emoji: "🍚", category: "Cereals & Millets" },
  { name: "Wheat", emoji: "🌾", category: "Cereals & Millets" },
  { name: "Barley", emoji: "🌾", category: "Cereals & Millets" },
  { name: "Oats", emoji: "🌾", category: "Cereals & Millets" },
  { name: "Rye", emoji: "🌾", category: "Cereals & Millets" },
  { name: "Quinoa", emoji: "🍚", category: "Cereals & Millets" },
  { name: "Millet", emoji: "🌾", category: "Cereals & Millets" },
  { name: "Sorghum", emoji: "🌾", category: "Cereals & Millets" },
  { name: "Maize", emoji: "🌽", category: "Cereals & Millets" },
  { name: "Foxtail Millet", emoji: "🌾", category: "Cereals & Millets" },
  // Spices
  { name: "Chilli Pepper", emoji: "🌶️", category: "Spices" },
  { name: "Turmeric", emoji: "🌿", category: "Spices" },
  { name: "Ginger", emoji: "🌿", category: "Spices" },
  { name: "Cinnamon", emoji: "🌳", category: "Spices" },
  { name: "Cardamom", emoji: "🌿", category: "Spices" },
  { name: "Clove", emoji: "🌳", category: "Spices" },
  { name: "Nutmeg", emoji: "🌳", category: "Spices" },
  { name: "Black Pepper", emoji: "⚫", category: "Spices" },
  { name: "Mustard", emoji: "🌱", category: "Spices" },
  { name: "Fenugreek", emoji: "🌱", category: "Spices" },
  // Commercial Crops
  { name: "Cotton", emoji: "⚪", category: "Commercial Crops" },
  { name: "Sugarcane", emoji: "🌿", category: "Commercial Crops" },
  { name: "Tea", emoji: "🫖", category: "Commercial Crops" },
  { name: "Coffee", emoji: "☕", category: "Commercial Crops" },
  { name: "Tobacco", emoji: "🌿", category: "Commercial Crops" },
  { name: "Jute", emoji: "🌿", category: "Commercial Crops" },
  { name: "Rubber", emoji: "🌳", category: "Commercial Crops" },
  { name: "Oil Palm", emoji: "🌴", category: "Commercial Crops" },
  { name: "Groundnut", emoji: "🥜", category: "Commercial Crops" },
  { name: "Sunflower (Oilseed)", emoji: "🌻", category: "Commercial Crops" },
  // Ornamental Plants
  { name: "Rose", emoji: "🌹", category: "Ornamental Plants" },
  { name: "Sunflower", emoji: "🌻", category: "Ornamental Plants" },
  { name: "Tulip", emoji: "🌷", category: "Ornamental Plants" },
  { name: "Lily", emoji: "🌸", category: "Ornamental Plants" },
  { name: "Orchid", emoji: "🌺", category: "Ornamental Plants" },
  { name: "Fern", emoji: "🌿", category: "Ornamental Plants" },
  { name: "Bonsai", emoji: "🌳", category: "Ornamental Plants" },
  { name: "Cactus", emoji: "🌵", category: "Ornamental Plants" },
  { name: "Lavender", emoji: "💐", category: "Ornamental Plants" },
  { name: "Marigold", emoji: "🌼", category: "Ornamental Plants" },
  // Medicinal Plants
  { name: "Neem", emoji: "🌳", category: "Medicinal Plants" },
  { name: "Tulsi (Holy Basil)", emoji: "🌿", category: "Medicinal Plants" },
  { name: "Aloe Vera", emoji: "🪴", category: "Medicinal Plants" },
  { name: "Ashwagandha", emoji: "��", category: "Medicinal Plants" },
  { name: "Brahmi", emoji: "🌱", category: "Medicinal Plants" },
  { name: "Gotu Kola", emoji: "🌱", category: "Medicinal Plants" },
  { name: "Shatavari", emoji: "🌱", category: "Medicinal Plants" },
  { name: "Betel Leaf", emoji: "��", category: "Medicinal Plants" },
  { name: "Stevia", emoji: "🍃", category: "Medicinal Plants" },
  { name: "Moringa (Drumstick)", emoji: "🌿", category: "Medicinal Plants" },
  // Trees
  { name: "Baobab", emoji: "🌳", category: "Trees" },
  { name: "Sandalwood", emoji: "🌳", category: "Trees" },
  { name: "Mahogany", emoji: "��", category: "Trees" },
  { name: "Teak", emoji: "🌳", category: "Trees" },
  { name: "Bamboo", emoji: "🎍", category: "Trees" },
  { name: "Palm", emoji: "🌴", category: "Trees" },
  { name: "Red Maple", emoji: "��", category: "Trees" },
  { name: "Cedar", emoji: "🌲", category: "Trees" },
  { name: "Spruce", emoji: "🌲", category: "Trees" },
  { name: "Fir", emoji: "🌲", category: "Trees" },
  { name: "Hemlock", emoji: "🌲", category: "Trees" },
  { name: "Larch", emoji: "🌲", category: "Trees" },
  { name: "Tamarack", emoji: "🌲", category: "Trees" },
  { name: "Douglas Fir", emoji: "🌲", category: "Trees" },
  { name: "Redwood", emoji: "🌲", category: "Trees" },
  { name: "Sequoia", emoji: "🌲", category: "Trees" },
  { name: "Ginkgo", emoji: "🌳", category: "Trees" },
  { name: "Cycad", emoji: "🌴", category: "Trees" },
  { name: "Sago Palm", emoji: "🌴", category: "Trees" },
  { name: "Rattan", emoji: "🌴", category: "Trees" },
  // Herbs
  { name: "Basil", emoji: "��", category: "Herbs" },
  { name: "Mint", emoji: "🍃", category: "Herbs" },
  { name: "Rosemary", emoji: "🌿", category: "Herbs" },
  { name: "Thyme", emoji: "🌿", category: "Herbs" },
  { name: "Cilantro (Coriander)", emoji: "🌿", category: "Herbs" },
  { name: "Parsley", emoji: "🌿", category: "Herbs" },
  { name: "Dill", emoji: "🌿", category: "Herbs" },
  { name: "Oregano", emoji: "��", category: "Herbs" },
  { name: "Sage", emoji: "🌿", category: "Herbs" },
  { name: "Chamomile", emoji: "🌼", category: "Herbs" },
  // ... (add more as needed for 100+ famous and diverse plants)
];
// --- END MASSIVE PLANT LIST ---