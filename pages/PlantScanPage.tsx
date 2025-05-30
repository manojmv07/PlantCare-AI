import React, { useState, useCallback, useRef, useEffect } from 'react';
import ImageUploader from '../components/ImageUploader';
import LoadingSpinner from '../components/LoadingSpinner';
import Card from '../components/Card';
import Alert from '../components/Alert';
import TTSControls from '../components/TTSControls';
import { PlantDiagnosis, ScanResult } from '../types';
import { diagnosePlant } from '../services/geminiService';
import { addScanResult } from '../services/localStorageService';
import { useLanguage } from '../contexts/LanguageContext';
import { MdMic, MdMicOff } from 'react-icons/md';
import { PLANT_LIST, PLANT_CATEGORIES } from '../constants';
import { FaSearch } from 'react-icons/fa';

const LANGUAGE_OPTIONS = [
  { code: 'en-US', label: 'English' },
  { code: 'hi-IN', label: 'Hindi' },
  { code: 'kn-IN', label: 'Kannada' },
  { code: 'te-IN', label: 'Telugu' },
  { code: 'ta-IN', label: 'Tamil' },
];

const PlantScanPage: React.FC = () => {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [diagnosis, setDiagnosis] = useState<PlantDiagnosis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const { translate, language } = useLanguage();
  const [detectedLang, setDetectedLang] = useState<string>('en');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [rawSTTText, setRawSTTText] = useState<string>("");
  const [aiCorrectedText, setAICorrectedText] = useState<string>("");
  const [sttLangDisplay, setSTTLangDisplay] = useState<string>("");
  const [selectedLang, setSelectedLang] = useState('en-US');
  const [speakActive, setSpeakActive] = useState<'question' | 'answer' | null>(null);
  const [aiPromptActive, setAIPromptActive] = useState(false);
  const [plantSearch, setPlantSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All Plants');
  const [selectedPlant, setSelectedPlant] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // --- Plant Picker Logic ---
  const mainCategories = [
    { name: 'All Plants', emoji: '🪴' },
    { name: 'Cereals & Millets', emoji: '🌾' },
    { name: 'Pulses', emoji: '🫘' },
    { name: 'Vegetables', emoji: '🥦' },
    { name: 'Fruits', emoji: '🍎' },
    { name: 'Spices', emoji: '🌶️' },
    { name: 'Commercial Crops', emoji: '🏭' },
    { name: 'Ornamental Plants', emoji: '🌸' },
    { name: 'Medicinal Plants', emoji: '🌿' },
    { name: 'Trees', emoji: '🌳' },
    { name: 'Unknown Plant', emoji: '🔍' },
  ];

  const getCategoryForPlant = (plant: { name: string; emoji: string; category: string }) => {
    if (mainCategories.some(cat => cat.name === plant.category)) return plant.category;
    return 'All Plants';
  };

  const PLANTS_PER_PAGE = 60;
  useEffect(() => { setCurrentPage(1); }, [activeCategory, plantSearch]);
  const filteredPlants = PLANT_LIST.filter(p =>
    (activeCategory === 'All Plants' || (activeCategory === 'Unknown Plant' ? false : getCategoryForPlant(p) === activeCategory)) &&
    (!plantSearch || p.name.toLowerCase().includes(plantSearch.toLowerCase()))
  );
  const totalPages = Math.ceil(filteredPlants.length / PLANTS_PER_PAGE);
  const paginatedPlants = filteredPlants.slice((currentPage - 1) * PLANTS_PER_PAGE, currentPage * PLANTS_PER_PAGE);

  const handleImageUpload = useCallback((base64: string, file: File) => {
    setImageBase64(base64);
    setImageFile(file);
    setDiagnosis(null); 
    setError(null);
  }, []);

  const handleScanPlant = async () => {
    if (!imageBase64 || !imageFile) {
      setError(translate('errorPleaseUploadImage'));
      return;
    }
    setIsLoading(true);
    setError(null);
    setDiagnosis(null);

    const result = await diagnosePlant(imageBase64, imageFile.type, customPrompt);
    
    if (result.error && !result.condition) { // Prioritize error if no condition is present
      setError(result.error);
      setDiagnosis(null);
    } else if (result.statusTag === "Unknown" && result.condition === "Unknown") {
      setError(translate('errorNotAPlant'));
      // Still set diagnosis to show "Unknown" etc.
      setDiagnosis(result);
    }
    else {
      setDiagnosis(result);
      if (!result.error) { // Only save to history if not an AI-side error within the result
        const scanEntry: ScanResult = {
          id: new Date().toISOString(),
          timestamp: Date.now(),
          imagePreviewUrl: imageBase64,
          diagnosis: result,
          originalPrompt: customPrompt || translate('defaultDiagnosisPrompt'),
        };
        addScanResult(scanEntry);
      }
    }
    setIsLoading(false);
  };
  
  const defaultPromptTextForPlaceholder = `You are a plant health expert... Respond ONLY in JSON format with keys: "condition", "statusTag", "diseaseName", "careSuggestions" (array of strings), "confidenceLevel".`;

  let diagnosisTextForTTS = "";
  if (diagnosis) {
    let ttsParts = [];
    if(diagnosis.condition) ttsParts.push(`${translate('condition')}: ${translate(diagnosis.statusTag ? 'status' + diagnosis.statusTag.charAt(0).toUpperCase() + diagnosis.statusTag.slice(1) : diagnosis.condition)}.`);
    if(diagnosis.diseaseName && diagnosis.diseaseName !== "N/A") ttsParts.push(`${translate('diseaseIssue')}: ${diagnosis.diseaseName}.`);
    if(diagnosis.careSuggestions && Array.isArray(diagnosis.careSuggestions) && diagnosis.careSuggestions.length > 0) {
        ttsParts.push(`${translate('careSuggestions')}: ${diagnosis.careSuggestions.join('. ')}`);
    } else if (typeof diagnosis.careSuggestions === 'string' && diagnosis.careSuggestions !== "N/A") {
        ttsParts.push(`${translate('careSuggestions')}: ${diagnosis.careSuggestions}`);
    }
    diagnosisTextForTTS = ttsParts.join(' ');
  }
  
  const getStatusTagColor = (statusTag?: PlantDiagnosis['statusTag']) => {
    switch (statusTag) {
      case 'Healthy': return 'bg-green-500 text-white';
      case 'Diseased': return 'bg-red-500 text-white';
      case 'NeedsAttention': return 'bg-yellow-500 text-black';
      case 'Unknown': return 'bg-gray-400 text-white';
      default: return 'bg-gray-200 text-gray-700';
    }
  };
  
  const getStatusTagText = (statusTag?: PlantDiagnosis['statusTag']) => {
    if (!statusTag) return diagnosis?.condition || translate('statusUnknown');
    switch (statusTag) {
        case 'Healthy': return translate('statusHealthy');
        case 'Diseased': return translate('statusDiseased');
        case 'NeedsAttention': return translate('statusNeedsAttention');
        case 'Unknown': return translate('statusUnknown');
        default: return diagnosis?.condition || translate('statusUnknown');
    }
  }

  // --- Speech-to-Text (STT) ---
  const handleToggleRecording = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      return;
    }
    setIsRecording(true);
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let mimeType = '';
      if (MediaRecorder.isTypeSupported('audio/wav')) {
        mimeType = 'audio/wav';
      } else if (MediaRecorder.isTypeSupported('audio/pcm')) {
        mimeType = 'audio/pcm';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      } else {
        setIsRecording(false);
        setError('Your browser does not support audio recording in a compatible format.');
        return;
      }
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = async function onStopHandler() {
        setIsRecording(false);
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const arrayBuffer = await audioBlob.arrayBuffer();
        const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        try {
          const res = await fetch('/api/stt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audioContent: base64Audio, mimeType, languageCode: selectedLang })
          });
          if (!res.ok) throw new Error('STT backend error');
          const data = await res.json();
          if (data.text) {
            setCustomPrompt(data.text);
            setRawSTTText(data.text);
            setAICorrectedText("");
          }
          if (data.language) {
            setDetectedLang(data.language);
            setSTTLangDisplay(data.language);
          }
        } catch (err) {
          setError('Speech recognition failed. Please try again.');
        }
      };
      mediaRecorder.start();
    } catch (err) {
      setIsRecording(false);
      setError('Could not access microphone. Please allow mic access and try again.');
    }
  };

  // --- Cloud TTS ---
  const speakWithCloudTTS = async (text: string, lang: string, which: 'question' | 'answer') => {
    if (!text) return;
    setSpeakActive(which);
    try {
      const res = await fetch('/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, languageCode: lang })
      });
      const data = await res.json();
      if (data.audioContent) {
        const audio = new Audio('data:audio/mp3;base64,' + data.audioContent);
        audio.onended = () => setSpeakActive(null);
        audio.play();
      } else {
        setSpeakActive(null);
      }
    } catch {
      setSpeakActive(null);
    }
  };

  // AI Prompt for sentence correction
  const handleAICorrectPrompt = async () => {
    if (!rawSTTText) return;
    setAIPromptActive(true);
    try {
      const aiRes = await diagnosePlant('', '', rawSTTText + '\nRewrite the above as a clear, grammatically correct, natural sentence in the same language. If the text is a question, make it a polite, complete question. Do not translate. Do not add extra information.');
      if (aiRes && aiRes.condition) {
        setCustomPrompt(aiRes.condition);
        setAICorrectedText(aiRes.condition);
      } else if (aiRes && aiRes.diseaseName) {
        setCustomPrompt(aiRes.diseaseName);
        setAICorrectedText(aiRes.diseaseName);
      } else if (aiRes && aiRes.careSuggestions) {
        const careText = Array.isArray(aiRes.careSuggestions)
          ? aiRes.careSuggestions.join('. ')
          : aiRes.careSuggestions;
        setCustomPrompt(careText);
        setAICorrectedText(careText);
      } else {
        setCustomPrompt(rawSTTText);
        setAICorrectedText('');
      }
    } catch (err) {
      setError('AI prompt correction failed.');
    }
    setTimeout(() => setAIPromptActive(false), 1000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-green-700 mb-6 text-center capitalize">Plant Identifier</h2>
      <p className="text-gray-600 mb-8 text-center max-w-2xl mx-auto">
        Select a plant or choose 'Unknown Plant' for identification
      </p>
      {/* Category Buttons */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {mainCategories.map(cat => (
          <button
            key={cat.name}
            onClick={() => { setActiveCategory(cat.name); setSelectedPlant(null); }}
            className={`flex items-center gap-2 px-5 py-2 rounded-2xl text-base font-medium shadow-sm border border-green-200 transition-colors
              ${activeCategory === cat.name
                ? (cat.name === 'Unknown Plant'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-green-600 text-white')
                : 'bg-white text-green-800 hover:bg-green-50'}
            `}
            style={{ minWidth: 120 }}
          >
            <span className="text-xl">{cat.emoji}</span>
            {cat.name}
          </button>
        ))}
      </div>
      {/* Search Bar */}
      <div className="flex justify-center mb-8">
        <div className="relative w-full max-w-lg">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><FaSearch /></span>
          <input
            type="text"
            value={plantSearch}
            onChange={e => setPlantSearch(e.target.value)}
            placeholder="Search plants..."
            className="w-full p-3 pl-12 border border-gray-300 rounded-full shadow-sm focus:ring-green-500 focus:border-green-500 text-base"
          />
        </div>
      </div>
      {/* Plant Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 mb-8">
        {paginatedPlants.map(plant => (
          <button
            key={plant.name}
            onClick={() => {
              setSelectedPlant(plant.name);
              setCustomPrompt(plant.name);
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-md border border-gray-200 bg-white transition-all text-left focus:outline-none focus:ring-2 focus:ring-green-500
              ${selectedPlant === plant.name
                ? 'ring-2 ring-green-600 bg-green-50 scale-105 text-green-900'
                : 'hover:bg-green-100 text-green-800'}
            `}
            style={{ minHeight: 60, transition: 'transform 0.15s, box-shadow 0.15s', boxShadow: selectedPlant === plant.name ? '0 8px 24px rgba(34,197,94,0.15)' : '0 2px 8px rgba(0,0,0,0.04)' }}
          >
            <span className="text-2xl">{plant.emoji}</span>
            <span className="truncate w-full font-medium text-base">{plant.name}</span>
          </button>
        ))}
        {filteredPlants.length === 0 && (
          <div className="col-span-full text-center text-gray-500 text-sm">No plants found for this category/search.</div>
        )}
      </div>
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mb-8">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-green-100 text-green-800 font-semibold shadow hover:bg-green-200 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-green-900 font-medium">Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg bg-green-100 text-green-800 font-semibold shadow hover:bg-green-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
      {filteredPlants.length > PLANTS_PER_PAGE && (
        <div className="text-center text-gray-500 text-sm mb-4">Showing {paginatedPlants.length} of {filteredPlants.length} plants. Use search or next page to see more.</div>
      )}
      {/* Only show upload/scan UI after plant is selected */}
      {selectedPlant && (
        <>
          {error && !diagnosis?.error && <Alert type="error" message={error} onClose={() => setError(null)} />}
          <Card className="mb-8">
            <div className="grid md:grid-cols-2 gap-6 items-start">
              <div>
                <h3 className="text-xl font-semibold text-green-700 mb-3 capitalize">Upload Plant Image</h3>
                <ImageUploader onImageUpload={handleImageUpload} idSuffix="plantscan" enableCamera={true} enablePaste={true} />
                <div className="text-xs text-gray-500 mt-2">
                  <div>Upload a file</div>
                  <div>No file chosen</div>
                  <div>or drag and drop</div>
                  <div>or paste image from clipboard</div>
                  <div>or <span className="text-blue-600 underline cursor-pointer">use camera</span></div>
                  <div>PNG, JPG, GIF up to 5MB</div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-green-700 mb-3 capitalize">Advanced Options (Optional)</h3>
                <div className="flex items-center gap-2 mb-2">
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder={translate('customPromptPlaceholder') + ` ` + translate('defaultPromptExample', {default: defaultPromptTextForPlaceholder.substring(0,100) + "..."})}
                    rows={4}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    aria-label={translate('customPromptPlaceholder')}
                  />
                  <button
                    onClick={handleToggleRecording}
                    className={`p-3 rounded-full shadow-lg border-2 ${isRecording ? 'bg-red-500 border-red-700 animate-pulse' : 'bg-white border-green-500 hover:bg-green-100'} text-green-700 transition-colors`}
                    title={isRecording ? 'Click to stop' : 'Click to speak'}
                    aria-label={isRecording ? 'Click to stop' : 'Click to speak'}
                  >
                    {isRecording ? (
                      <MdMicOff className="w-6 h-6 text-white" />
                    ) : (
                      <MdMic className="w-6 h-6" />
                    )}
                  </button>
                </div>
                {rawSTTText && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500">Detected language: {sttLangDisplay}</span>
                    <button
                      onClick={handleAICorrectPrompt}
                      className={`p-2 rounded-full text-xs ${aiPromptActive ? 'bg-yellow-400 text-white' : 'bg-purple-500 text-white hover:bg-purple-600'} transition-colors`}
                      title="AI: Make it a proper sentence"
                    >
                      AI Prompt
                    </button>
                    {aiCorrectedText && <span className="text-xs text-green-700">AI: {aiCorrectedText}</span>}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {translate('customPromptExampleText')}
                </p>
                {customPrompt && (
                  <button
                    onClick={() => speakWithCloudTTS(customPrompt, selectedLang, 'question')}
                    className={`mt-2 p-2 rounded-full ${speakActive === 'question' ? 'bg-yellow-400 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'} transition-colors`}
                    title="Speak question"
                    aria-label="Speak question"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></svg>
                  </button>
                )}
              </div>
            </div>
            {imageBase64 && (
              <div className="mt-6 text-center">
                <button
                  onClick={handleScanPlant}
                  disabled={isLoading}
                  className="px-8 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">{translate('scanningButton')}</span>
                    </>
                  ) : (
                    translate('scanPlantButton')
                  )}
                </button>
              </div>
            )}
          </Card>
        </>
      )}
      {isLoading && !diagnosis && <LoadingSpinner text={translate('analyzingPlant')} />}
      {diagnosis && (
        <Card title={translate('aiDiagnosisTitle')}>
          <div className="space-y-3">
            <div>
              <strong className="text-green-700 capitalize">{translate('status')}:</strong>
              <span className={`ml-2 px-3 py-1 text-sm font-semibold rounded-full ${getStatusTagColor(diagnosis.statusTag)}`}>
                {getStatusTagText(diagnosis.statusTag)}
              </span>
            </div>
            {diagnosis.diseaseName && diagnosis.diseaseName !== "N/A" && (
              <div>
                <strong className="text-green-700 capitalize">{translate('diseaseIssue')}:</strong>
                <p className="text-gray-700">{diagnosis.diseaseName}</p>
              </div>
            )}
            {diagnosis.careSuggestions && (Array.isArray(diagnosis.careSuggestions) ? diagnosis.careSuggestions.length > 0 : diagnosis.careSuggestions !== "N/A") && (
              <div>
                <strong className="text-green-700 capitalize">{translate('careSuggestions')}:</strong>
                {Array.isArray(diagnosis.careSuggestions) ? (
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1 text-gray-700">
                    {diagnosis.careSuggestions.map((item, index) => item.trim() && <li key={index}>{item.trim()}</li>)}
                  </ul>
                ) : (
                  <p className="text-gray-700 whitespace-pre-line">{diagnosis.careSuggestions}</p>
                )}
              </div>
            )}
            {diagnosis.confidenceLevel && diagnosis.confidenceLevel !== "N/A" && (
               <div>
                <strong className="text-green-700 capitalize">{translate('confidence')}:</strong>
                <p className="text-gray-700">{diagnosis.confidenceLevel}</p>
              </div>
            )}
            {diagnosis.error && <Alert type="warning" message={`${translate('aiResponseWarning')}: ${diagnosis.error}`} />}
          </div>
          <button
            onClick={() => speakWithCloudTTS(diagnosisTextForTTS, selectedLang, 'answer')}
            className={`mt-4 p-2 rounded-full ${speakActive === 'answer' ? 'bg-yellow-400 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'} transition-colors`}
            title="Speak answer"
            aria-label="Speak answer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></svg>
          </button>
        </Card>
      )}
    </div>
  );
};

export default PlantScanPage;