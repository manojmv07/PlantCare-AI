
import React, { useState, useCallback, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import Card from '../components/Card';
import Alert from '../components/Alert';
import { CropInsight } from '../types';
import { getCropInsights } from '../services/geminiService';
import { KARNATAKA_DISTRICTS, MONTHS } from '../constants';

const CropInsightsPage: React.FC = () => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>(KARNATAKA_DISTRICTS[0]);
  const [selectedMonth, setSelectedMonth] = useState<string>(MONTHS[new Date().getMonth()]);
  const [insights, setInsights] = useState<CropInsight | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    if (!selectedDistrict || !selectedMonth) {
      setError("Please select a district and month.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setInsights(null);

    const result = await getCropInsights(selectedDistrict, selectedMonth);
    if (result.error) {
      setError(result.error);
    } else {
      setInsights(result);
    }
    setIsLoading(false);
  }, [selectedDistrict, selectedMonth]);
  
  // Fetch insights on initial load or when district/month changes
  useEffect(() => {
    fetchInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDistrict, selectedMonth]);


  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-green-700 mb-6 text-center">Crop Insights for Karnataka</h2>
      <p className="text-gray-600 mb-8 text-center max-w-2xl mx-auto">
        Select a district and month to get AI-powered recommendations for suitable crops, farming tips, and climate patterns.
      </p>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <Card className="mb-8">
        <div className="grid md:grid-cols-3 gap-6 mb-6 items-end">
          <div>
            <label htmlFor="district-select" className="block text-sm font-medium text-gray-700 mb-1">
              Select District
            </label>
            <select
              id="district-select"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            >
              {KARNATAKA_DISTRICTS.map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="month-select" className="block text-sm font-medium text-gray-700 mb-1">
              Select Month
            </label>
            <select
              id="month-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            >
              {MONTHS.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
          <button
            onClick={fetchInsights} // Manual refresh still possible
            disabled={isLoading}
            className="w-full md:w-auto px-6 py-3 bg-green-500 text-white font-semibold rounded-md shadow-md hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : 'Get Insights'}
          </button>
        </div>
      </Card>

      {isLoading && !insights && <LoadingSpinner text="Fetching crop insights..." />}

      {insights && (
        <Card title={`Crop Insights for ${insights.district} - ${insights.month}`}>
          {insights.suitableCrops && insights.suitableCrops.length > 0 && (
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-green-600 mb-1">Suitable Crops:</h4>
              <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                {insights.suitableCrops.map((crop, index) => <li key={index}>{crop}</li>)}
              </ul>
            </div>
          )}
          {insights.tips && (
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-green-600 mb-1">Farming Tips:</h4>
              <p className="text-gray-700 whitespace-pre-line">{insights.tips}</p>
            </div>
          )}
          {insights.climatePatterns && (
            <div>
              <h4 className="text-lg font-semibold text-green-600 mb-1">Typical Climate Patterns:</h4>
              <p className="text-gray-700 whitespace-pre-line">{insights.climatePatterns}</p>
            </div>
          )}
           {insights.error && <Alert type="error" message={`AI Response Error: ${insights.error}`} />}
        </Card>
      )}
    </div>
  );
};

export default CropInsightsPage;
