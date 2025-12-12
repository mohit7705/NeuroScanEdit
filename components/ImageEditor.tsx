import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, Wand2, Download, RefreshCw, AlertCircle, ImageIcon, Activity } from 'lucide-react';
import { editImageWithGemini } from '../services/geminiService';
import { fileToBase64, base64ToBlobUrl } from '../utils/imageUtils';
import { AppStatus, ProcessedImage } from '../types';

const ImageEditor: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [originalImage, setOriginalImage] = useState<ProcessedImage | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // Simple validation
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit check
         setError('Image size too large. Please use an image under 5MB.');
         return;
      }

      setStatus(AppStatus.UPLOADING);
      setError(null);
      setGeneratedImageUrl(null);

      try {
        const { data, mimeType } = await fileToBase64(file);
        const url = URL.createObjectURL(file);
        setOriginalImage({ originalData: data, mimeType, url });
        setStatus(AppStatus.IDLE);
      } catch (e) {
        console.error(e);
        setError('Failed to process image. Please try again.');
        setStatus(AppStatus.IDLE);
      }
    }
  };

  const handleGenerate = async () => {
    if (!originalImage || !prompt.trim()) return;

    setStatus(AppStatus.PROCESSING);
    setError(null);

    try {
      const generatedBase64 = await editImageWithGemini(
        originalImage.originalData,
        originalImage.mimeType,
        prompt
      );
      const url = base64ToBlobUrl(generatedBase64, 'image/png');
      setGeneratedImageUrl(url);
      setStatus(AppStatus.COMPLETE);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to edit image. The model might be busy or the request invalid.');
      setStatus(AppStatus.IDLE);
    }
  };

  const handleReset = () => {
    setOriginalImage(null);
    setGeneratedImageUrl(null);
    setPrompt('');
    setError(null);
    setStatus(AppStatus.IDLE);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8">
      
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-200/20 rounded-full blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-200/20 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="mb-8 text-center max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-light text-slate-800 mb-4">
          Intelligent <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600">Imaging Analysis</span>
        </h2>
        <p className="text-slate-500 leading-relaxed">
          Enhance and analyze scans using our advanced neural network. 
          Upload an image and describe the adjustment or analysis visualization you require.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-white overflow-hidden relative">
        {/* Connection Lines (Cosmetic) */}
        <div className="absolute top-0 left-1/2 w-px h-full bg-slate-50 hidden md:block"></div>

        <div className="flex flex-col md:flex-row h-full min-h-[500px]">
          
          {/* Left Panel: Input */}
          <div className="flex-1 p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/50">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                Source Input
              </h3>
              {originalImage && (
                <button onClick={handleReset} className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors">
                  <X size={12} /> Clear
                </button>
              )}
            </div>

            {!originalImage ? (
              <div 
                className="w-full h-80 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-teal-400 hover:bg-teal-50 transition-all group relative overflow-hidden"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] opacity-10"></div>
                <div className="bg-white p-4 rounded-full shadow-lg mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="text-teal-500" size={32} />
                </div>
                <p className="text-slate-600 font-medium">Click to Upload Scan</p>
                <p className="text-slate-400 text-sm mt-1">Supports PNG, JPG (Max 5MB)</p>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </div>
            ) : (
              <div className="relative w-full h-80 rounded-2xl overflow-hidden shadow-inner bg-slate-100 group">
                <img 
                  src={originalImage.url} 
                  alt="Original" 
                  className="w-full h-full object-contain" 
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white/90 text-slate-800 px-4 py-2 rounded-full font-medium text-sm hover:bg-white"
                    >
                        Change Image
                    </button>
                </div>
              </div>
            )}

            <div className="mt-6">
              <label htmlFor="prompt" className="block text-sm font-semibold text-slate-700 mb-2">
                Analysis Instruction
              </label>
              <div className="relative">
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., 'Highlight the vascular structure in red', 'Apply a heatmap overlay', 'Enhance contrast for bone density'..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-4 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 resize-none h-32 transition-all shadow-sm"
                  disabled={!originalImage || status === AppStatus.PROCESSING}
                />
                <button
                  onClick={handleGenerate}
                  disabled={!originalImage || !prompt.trim() || status === AppStatus.PROCESSING}
                  className={`absolute bottom-3 right-3 p-2 rounded-lg transition-all ${
                    !originalImage || !prompt.trim() || status === AppStatus.PROCESSING
                      ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                      : 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 hover:scale-105 active:scale-95'
                  }`}
                >
                  {status === AppStatus.PROCESSING ? (
                    <RefreshCw className="animate-spin" size={20} />
                  ) : (
                    <Wand2 size={20} />
                  )}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-sm text-red-600">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </div>

          {/* Right Panel: Output */}
          <div className="flex-1 p-6 md:p-8 bg-white relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                 Processed Result
              </h3>
              {generatedImageUrl && (
                <a 
                  href={generatedImageUrl} 
                  download="neuroscan_analysis.png"
                  className="text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center gap-1 transition-colors bg-teal-50 px-3 py-1.5 rounded-full"
                >
                  <Download size={14} /> Download
                </a>
              )}
            </div>

            <div className="w-full h-full min-h-[300px] rounded-2xl border border-slate-100 bg-slate-50/30 flex items-center justify-center relative overflow-hidden">
               {status === AppStatus.PROCESSING ? (
                 <div className="flex flex-col items-center">
                    <div className="relative w-24 h-24 mb-6">
                        <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-teal-500 rounded-full border-t-transparent animate-spin"></div>
                        <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center shadow-inner">
                            <Activity className="text-teal-500 animate-pulse" size={32} />
                        </div>
                    </div>
                    <p className="text-slate-600 font-medium animate-pulse">Analyzing tissue structures...</p>
                    <p className="text-slate-400 text-xs mt-2">Running Gemini 2.5 Flash Inference</p>
                 </div>
               ) : generatedImageUrl ? (
                 <img 
                    src={generatedImageUrl} 
                    alt="AI Generated" 
                    className="w-full h-full object-contain animate-in fade-in duration-700"
                 />
               ) : (
                 <div className="text-center p-8 opacity-40">
                    <div className="bg-slate-200 w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <ImageIcon size={32} className="text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-medium">No Analysis Generated</p>
                    <p className="text-slate-400 text-sm mt-1 max-w-xs mx-auto">Upload an image and provide instructions to see the AI processed results here.</p>
                 </div>
               )}
            </div>
          </div>

        </div>
      </div>
      
      <div className="mt-8 flex justify-center gap-8 opacity-60">
         {/* Decorative 'Stats' */}
         <div className="text-center">
            <p className="text-2xl font-light text-slate-800">0.4s</p>
            <p className="text-xs uppercase tracking-widest text-slate-400">Latency</p>
         </div>
         <div className="w-px bg-slate-300 h-10"></div>
         <div className="text-center">
            <p className="text-2xl font-light text-slate-800">99.9%</p>
            <p className="text-xs uppercase tracking-widest text-slate-400">Uptime</p>
         </div>
         <div className="w-px bg-slate-300 h-10"></div>
         <div className="text-center">
            <p className="text-2xl font-light text-slate-800">256-bit</p>
            <p className="text-xs uppercase tracking-widest text-slate-400">Encryption</p>
         </div>
      </div>
    </div>
  );
};

export default ImageEditor;