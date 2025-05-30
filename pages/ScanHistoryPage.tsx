import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { ScanResult } from '../types';
import { getScanHistory, deleteScanHistoryItem, clearScanHistory } from '../services/localStorageService';
import Alert from '../components/Alert';

const ScanHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [selectedScan, setSelectedScan] = useState<ScanResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    setHistory(getScanHistory());
  }, []);

  const viewScanDetails = (scan: ScanResult) => {
    setSelectedScan(scan);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedScan(null);
  };

  const handleDelete = (id: string) => {
    deleteScanHistoryItem(id);
    setHistory(getScanHistory());
  };

  const handleClearAll = () => {
    setShowClearConfirm(true);
  };

  const confirmClearAll = () => {
    clearScanHistory();
    setHistory([]);
    setShowClearConfirm(false);
  };

  const cancelClearAll = () => setShowClearConfirm(false);

  if (history.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-3xl font-bold text-green-700 mb-6">Scan History</h2>
        <Alert type="info" message="No scan history yet. Perform a plant scan to see it here." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-green-700 mb-6 text-center">Scan History</h2>
        {history.length > 0 && (
          <button onClick={handleClearAll} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">Clear All</button>
        )}
      </div>
      <p className="text-gray-600 mb-8 text-center max-w-2xl mx-auto">
        Review your past plant health scans. Click on an entry to see detailed diagnosis and care suggestions.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.map((scan) => (
          <Card 
            key={scan.id} 
            title={`Scan: ${new Date(scan.timestamp).toLocaleDateString()}`}
            onClick={() => viewScanDetails(scan)}
            className="transform hover:scale-105 transition-transform duration-300 relative"
          >
            <button onClick={e => { e.stopPropagation(); handleDelete(scan.id); }} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors" title="Delete">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <img src={scan.imagePreviewUrl} alt="Scanned plant" className="w-full h-48 object-cover rounded-md mb-4" />
            <p className="text-sm text-gray-600 mb-1"><strong>Condition:</strong> {scan.diagnosis.condition || 'N/A'}</p>
            <p className="text-sm text-gray-600"><strong>Disease:</strong> {scan.diagnosis.diseaseName || 'N/A'}</p>
          </Card>
        ))}
      </div>

      {selectedScan && (
        <Modal isOpen={isModalOpen} onClose={closeModal} title={`Scan Details - ${new Date(selectedScan.timestamp).toLocaleString()}`} size="lg">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-green-700 mb-2">Scanned Image</h4>
              <img src={selectedScan.imagePreviewUrl} alt="Scanned plant" className="w-full rounded-lg shadow-md object-contain max-h-96" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-green-700 mb-2">AI Diagnosis</h4>
              <div className="space-y-2 text-gray-700">
                <p><strong>Condition:</strong> {selectedScan.diagnosis.condition || 'N/A'}</p>
                <p><strong>Disease/Issue:</strong> {selectedScan.diagnosis.diseaseName || 'N/A'}</p>
                <div>
                  <strong>Care Suggestions:</strong>
                  {(() => {
                    const suggestionsValue = selectedScan.diagnosis.careSuggestions;
                    if (suggestionsValue && suggestionsValue !== "N/A") {
                      const itemsArray = Array.isArray(suggestionsValue)
                        ? suggestionsValue
                        : (typeof suggestionsValue === 'string' ? suggestionsValue.split('\n') : []);

                      const processedItems = itemsArray
                        .map(item => String(item).trim().replace(/^- /, '')) 
                        .filter(item => item); 

                      if (processedItems.length > 0) {
                        return (
                          <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                            {processedItems.map((item, index) => (
                              <li key={`sugg-hist-${index}`}>{item}</li>
                            ))}
                          </ul>
                        );
                      }
                    }
                    return <span className="ml-1">N/A</span>;
                  })()}
                </div>
                <p><strong>Confidence:</strong> {selectedScan.diagnosis.confidenceLevel || 'N/A'}</p>
                {selectedScan.diagnosis.error && <Alert type="error" message={`AI Response Error: ${selectedScan.diagnosis.error}`} />}
                <p className="text-xs text-gray-500 mt-2">
                  <strong>Original Prompt:</strong> {selectedScan.originalPrompt}
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {showClearConfirm && (
        <Modal isOpen={showClearConfirm} onClose={cancelClearAll} title="Clear All History?">
          <div className="p-4">
            <p>Are you sure you want to clear all scan history? This cannot be undone.</p>
            <div className="flex gap-4 mt-4">
              <button onClick={confirmClearAll} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">Yes, Clear All</button>
              <button onClick={cancelClearAll} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors">Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ScanHistoryPage;
