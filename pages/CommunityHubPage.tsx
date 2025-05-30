import React, { useState, useEffect, useCallback } from 'react';
import ImageUploader from '../components/ImageUploader';
import LoadingSpinner from '../components/LoadingSpinner';
import Card from '../components/Card';
import Alert from '../components/Alert';
import { GreenGramPost } from '../types';
import { generateCaptionForImage } from '../services/geminiService';
import { getGreenGramPosts, addGreenGramPost, deleteGreenGramPost, clearGreenGramPosts } from '../services/localStorageService';
import Modal from '../components/Modal';

const CommunityHubPage: React.FC = () => {
  const [posts, setPosts] = useState<GreenGramPost[]>([]);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [caption, setCaption] = useState<string>('');
  const [isPosting, setIsPosting] = useState<boolean>(false);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    setPosts(getGreenGramPosts());
  }, []);

  const handleImageUpload = useCallback((base64: string, file: File) => {
    setImageBase64(base64);
    setImageFile(file);
    setError(null);
  }, []);

  const handleGenerateCaption = async () => {
    if (!imageBase64 || !imageFile) {
      setError("Please upload an image first to generate a caption.");
      return;
    }
    setIsGeneratingCaption(true);
    setError(null);
    const result = await generateCaptionForImage(imageBase64, imageFile.type);
    if (result.error) {
      setError(result.error);
    } else {
      setCaption(result.caption);
    }
    setIsGeneratingCaption(false);
  };

  const handlePost = () => {
    if (!imageBase64) {
      setError("Please upload an image.");
      return;
    }
    if (!caption.trim()) {
      setError("Please enter a caption or generate one.");
      return;
    }
    setIsPosting(true);
    setError(null);

    const newPost: GreenGramPost = {
      id: new Date().toISOString(),
      imageUrl: imageBase64,
      caption: caption,
      timestamp: Date.now(),
    };

    addGreenGramPost(newPost);
    setPosts(prevPosts => [newPost, ...prevPosts]);
    
    // Reset form
    setImageBase64(null);
    setImageFile(null);
    setCaption('');
    // Manually clear the uploader preview if possible, or instruct user
    // For this example, the ImageUploader's own clear button can be used by user.
    
    setIsPosting(false);
  };
  
  const handleDeletePost = (postId: string) => {
    deleteGreenGramPost(postId);
    setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
  };

  const handleClearAll = () => setShowClearConfirm(true);
  const confirmClearAll = () => {
    clearGreenGramPosts();
    setPosts([]);
    setShowClearConfirm(false);
  };
  const cancelClearAll = () => setShowClearConfirm(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-green-700 mb-6 text-center">GreenGram Community Hub</h2>
      <p className="text-gray-600 mb-8 text-center max-w-2xl mx-auto">
        Share your plant journey! Post photos of your beloved plants, write captions, or let AI help you create one.
      </p>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <Card title="Create a New Post" className="mb-10">
        <div className="grid md:grid-cols-2 gap-6">
          <ImageUploader onImageUpload={handleImageUpload} idSuffix="greengram"/>
          <div className="space-y-4">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption for your plant..."
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleGenerateCaption}
                disabled={isGeneratingCaption || !imageBase64}
                className="flex-1 px-6 py-3 bg-yellow-500 text-white font-semibold rounded-md shadow-md hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isGeneratingCaption ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Generating...</span>
                  </>
                ) : "Generate Caption with AI"}
              </button>
              <button
                onClick={handlePost}
                disabled={isPosting || !imageBase64 || !caption.trim()}
                className="flex-1 px-6 py-3 bg-green-500 text-white font-semibold rounded-md shadow-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isPosting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Posting...</span>
                  </>
                ) : "Post to GreenGram"}
              </button>
            </div>
          </div>
        </div>
      </Card>

      <h3 className="text-2xl font-semibold text-green-700 mb-6 flex justify-between items-center">
        <span>Community Feed</span>
        {posts.length > 0 && (
          <button onClick={handleClearAll} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">Clear All Posts</button>
        )}
      </h3>
      {posts.length === 0 && !isPosting ? (
        <Alert type="info" message="No posts yet. Be the first to share!" />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Card key={post.id} className="relative group">
              <img src={post.imageUrl} alt="Plant post" className="w-full h-64 object-cover rounded-t-xl" />
              <div className="p-4">
                <p className="text-gray-700 mb-2 whitespace-pre-line">{post.caption}</p>
                <p className="text-xs text-gray-400">{new Date(post.timestamp).toLocaleString()}</p>
              </div>
              <button 
                onClick={() => handleDeletePost(post.id)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                title="Delete post"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.24.03 3.22.077m3.22-.077L10.879 3.28a2.25 2.25 0 012.244-2.077h.07a2.25 2.25 0 012.244 2.077L14.74 5.79m-4.858 0l-2.927-2.249m5.854 2.249L10.879 3.28m0 0L9.26 9" />
                </svg>
              </button>
            </Card>
          ))}
        </div>
      )}

      {showClearConfirm && (
        <Modal isOpen={showClearConfirm} onClose={cancelClearAll} title="Clear All Posts?">
          <div className="p-4">
            <p>Are you sure you want to clear all GreenGram posts? This cannot be undone.</p>
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

export default CommunityHubPage;
