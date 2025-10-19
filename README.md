# 🌱 PlantCare AI - Intelligent Agricultural Assistant

[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-ISC-green.svg)](LICENSE)

**PlantCare AI** is a comprehensive agricultural technology platform that combines artificial intelligence, machine learning, and modern web technologies to assist farmers and agricultural enthusiasts in plant identification, disease diagnosis, crop management, and agricultural resource discovery.

## 🚀 Features

### 🔍 **AI-Powered Plant Identification**
- **Smart Plant Recognition** using Google Gemini AI
- **Disease & Pest Detection** with treatment recommendations
- **Real-time Analysis** with confidence scores
- **Comprehensive Reports** with preventive measures

### 📚 **Agricultural Encyclopedia**
- **Extensive Plant Database** with detailed information
- **Advanced Search & Filtering** by categories
- **Cultivation Tips** and care instructions
- **Multi-category Support** (Cereals, Vegetables, Fruits, etc.)

### 📊 **Crop Insights & Analytics**
- **Weather Integration** for farming decisions
- **AI-Powered Crop Recommendations**
- **Market Price Trends** and analytics
- **Seasonal Farming Calendar**

### 🗺️ **Farmer Connect Hub**
- **Interactive Google Maps** integration
- **Agricultural Service Discovery** (Markets, Equipment, etc.)
- **GPS Navigation** and route planning
- **Favorites System** and geofencing alerts

### 🌐 **Multi-Language Support**
- **5 Languages**: English, Hindi, Kannada, Telugu, Tamil
- **Real-time Language Switching**
- **Regional Content Adaptation**

### 📱 **Mobile-First Design**
- **Progressive Web App** (PWA) capabilities
- **Responsive Design** for all devices
- **Touch-Friendly Interface**
- **Offline Functionality**

## 🛠️ Technology Stack

### **Frontend**
- **React 19.1.0** with TypeScript
- **Vite 6.2.0** for build tooling
- **Tailwind CSS** for styling
- **React Router DOM** for navigation
- **React Context API** for state management

### **Backend**
- **Node.js** with Express.js 5.1.0
- **Google Cloud APIs** (Speech, Text-to-Speech, Translation)
- **RESTful API** architecture
- **CORS** enabled for cross-origin requests

### **AI & Machine Learning**
- **Google Gemini Pro Vision** for plant identification
- **Image Processing** with HTML5 Canvas
- **Multi-modal AI** for comprehensive analysis

### **Maps & Location**
- **Google Maps JavaScript API**
- **Places API** for service discovery
- **Directions API** for navigation
- **Geolocation API** for GPS services

## 📦 Installation & Setup

### **Prerequisites**
- Node.js (v16 or higher)
- npm or yarn package manager
- Google Cloud Platform account (for API keys)

### **1. Clone the Repository**
```bash
git clone https://github.com/yourusername/plantcare-ai.git
cd plantcare-ai
```

### **2. Install Dependencies**

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd plantcare-backend
npm install
cd ..
```

### **3. Environment Configuration**

Create a `.env` file in the root directory:
```env
# Google APIs
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key

# Weather API (optional)
VITE_WEATHER_API_KEY=your_weather_api_key

# Pexels API (optional)
VITE_PEXELS_API_KEY=your_pexels_api_key
```

### **4. Google Cloud Setup**

1. **Create a Google Cloud Project**
2. **Enable Required APIs:**
   - Maps JavaScript API
   - Places API
   - Directions API
   - Distance Matrix API
   - Geocoding API
   - Cloud Translation API
   - Text-to-Speech API
   - Speech-to-Text API

3. **Create API Keys** and add them to your `.env` file
4. **Set up Billing** (required for Google Cloud APIs)

### **5. Start the Application**

**Start Backend Server:**
```bash
cd plantcare-backend
node server.js
```
Backend will run on `http://localhost:5001`

**Start Frontend Development Server:**
```bash
npm run dev
```
Frontend will run on `http://localhost:5173`

## 🚀 Usage

### **Plant Identification**
1. Navigate to the **Plant Scan** page
2. Upload or capture a plant image
3. Get instant AI-powered identification and health analysis
4. View detailed reports with treatment recommendations

### **Agricultural Services**
1. Go to **Farmer Connect** page
2. Allow location access or search for a location
3. Browse service categories (Markets, Equipment, etc.)
4. Get directions and contact information

### **Crop Management**
1. Visit **Crop Insights** page
2. View weather data and crop recommendations
3. Access farming calendar and market trends
4. Make informed agricultural decisions

## 📁 Project Structure

```bash
plantcare-ai/
├── 📁 components/           # Reusable UI components
├── 📁 contexts/            # React Context providers
├── 📁 hooks/               # Custom React hooks
├── 📁 i18n/                # Internationalization files
├── 📁 pages/               # Main application pages
├── 📁 services/            # API integrations
├── 📁 utils/               # Utility functions
├── 📁 plantcare-backend/   # Backend server
├── 📄 App.tsx              # Main React component
├── 📄 index.tsx            # Application entry point
├── 📄 constants.ts         # App constants
└── 📄 types.ts             # TypeScript definitions
```

## 🔧 API Endpoints

### **Backend APIs** (`http://localhost:5001`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/translate` | POST | Batch text translation |
| `/api/speak` | POST | Text-to-speech conversion |
| `/api/stt` | POST | Speech-to-text conversion |

### **Request Examples**

**Translation:**
```javascript
POST /api/translate
{
  "texts": ["Hello", "World"],
  "target": "hi"
}
```

**Text-to-Speech:**
```javascript
POST /api/speak
{
  "text": "Hello World",
  "languageCode": "en-US"
}
```

## 🌐 Deployment

### **Production Build**
```bash
npm run build
```

### **Preview Production Build**
```bash
npm run preview
```

### **Deployment Options**
- **Netlify/Vercel** for frontend
- **Heroku/Railway** for backend
- **Google Cloud Platform** for full-stack deployment

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### **Development Guidelines**
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Write descriptive commit messages
- Test your changes thoroughly

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Mithun R** - Developer
- **Manoj M V** - Developer  
- **Veghana N Gowda** - Developer
- **Shahabaz** - Developer

## 📞 Support

For support and questions:
- **Issues**: [GitHub Issues](https://github.com/yourusername/plantcare-ai/issues)
- **Documentation**: [Project Documentation](PROJECT_DOCUMENTATION.md)
- **Email**: support@plantcare-ai.com

## 🙏 Acknowledgments

- **Google Cloud Platform** for AI and mapping services
- **React Community** for excellent documentation
- **Open Source Contributors** for various libraries used

---

**Built with ❤️ for the farming community**
