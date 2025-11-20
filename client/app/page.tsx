"use client";
import { useState, useEffect, ChangeEvent } from "react";
import { Upload, Activity, AlertCircle, History, Check, X, FileText } from "lucide-react";

interface DiagnosticResult {
  _id: string; // MongoDB ID
  diagnosis: string;
  confidence: number;
  heatmap: string;
  imagePath: string;
  status: 'Pending' | 'Correct' | 'Incorrect';
  createdAt: string;
}

export default function Home() {
  // State
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [history, setHistory] = useState<DiagnosticResult[]>([]);

  // 1. Fetch History on Load
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/history");
      const json = await res.json();
      setHistory(json.data);
    } catch (err) {
      console.error("Failed to load history");
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/analyze", { method: "POST", body: formData });
      const json = await response.json();
      setResult(json.data);
      setShowHeatmap(true);
      fetchHistory(); // Refresh sidebar
    } catch (error) {
      alert("Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Doctor Feedback
  const sendFeedback = async (status: 'Correct' | 'Incorrect') => {
    if (!result) return;
    try {
      await fetch(`/api/reports/${result._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes: "Doctor validation" })
      });
      // Update UI locally
      setResult({ ...result, status });
      fetchHistory(); // Refresh sidebar status
    } catch (err) {
      alert("Failed to save feedback");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      
      {/* SIDEBAR: Patient History */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 hidden md:flex">
        <div className="p-6 border-b border-slate-100">
          <h2 className="font-bold text-slate-700 flex items-center gap-2">
            <History className="w-5 h-5" /> Recent Scans
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.map((item) => (
            <div 
              key={item._id} 
              onClick={() => { setResult(item); setPreview(null); setShowHeatmap(true); }}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                result?._id === item._id ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100 hover:border-blue-300'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-sm text-slate-700">{item.diagnosis}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  item.status === 'Correct' ? 'bg-green-100 text-green-700' :
                  item.status === 'Incorrect' ? 'bg-red-100 text-red-700' :
                  'bg-slate-100 text-slate-500'
                }`}>
                  {item.status}
                </span>
              </div>
              <p className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleTimeString()}</p>
            </div>
          ))}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <header className="flex items-center gap-3 mb-8 border-b pb-4 border-slate-200">
            <Activity className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-800">
              MediSight <span className="text-slate-400 font-normal">Doctor Workspace</span>
            </h1>
          </header>

          <div className="grid md:grid-cols-2 gap-8">
            
            {/* LEFT: Upload & Viz */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-slate-500" /> X-Ray Analysis
                </h2>
                
                <div className="relative min-h-[300px] bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center border-2 border-dashed border-slate-300">
                  {!preview && !result ? (
                     <div className="text-center p-8">
                       <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" id="upload" />
                       <label htmlFor="upload" className="cursor-pointer bg-white text-slate-700 px-4 py-2 rounded-md font-medium hover:bg-slate-50 border shadow-sm">
                         Select X-Ray
                       </label>
                     </div>
                  ) : (
                    <div className="relative w-full h-full min-h-[300px]">
                      <img 
                        src={preview || result?.imagePath} 
                        alt="Scan" 
                        className="absolute inset-0 w-full h-full object-contain" 
                      />
                      {result && showHeatmap && (
                        <img 
                          src={result.heatmap} 
                          alt="Heatmap" 
                          className="absolute inset-0 w-full h-full object-contain mix-blend-multiply opacity-80" 
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-3">
                  {!result ? (
                    <button 
                      onClick={handleAnalyze} disabled={!file || loading}
                      className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium disabled:opacity-50 hover:bg-blue-700"
                    >
                      {loading ? "Processing..." : "Run AI Analysis"}
                    </button>
                  ) : (
                    <button 
                      onClick={() => setShowHeatmap(!showHeatmap)}
                      className="flex-1 border border-slate-300 text-slate-700 py-2.5 rounded-lg font-medium hover:bg-slate-50"
                    >
                      {showHeatmap ? "Hide Heatmap" : "Show Heatmap"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: Report & Feedback */}
            <div className="space-y-6">
              {result ? (
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <p className="text-sm text-slate-500 font-semibold uppercase">AI Diagnosis</p>
                      <p className="text-3xl font-bold text-slate-800">{result.diagnosis}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500 font-semibold uppercase">Confidence</p>
                      <p className="text-xl font-bold text-blue-600">{(result.confidence * 100).toFixed(1)}%</p>
                    </div>
                  </div>

                  {/* DOCTOR VALIDATION LOOP */}
                  <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
                    <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Doctor Validation
                    </h3>
                    
                    {result.status === 'Pending' ? (
                      <div>
                        <p className="text-sm text-slate-600 mb-4">Do you agree with the AIs assessment?</p>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => sendFeedback('Correct')}
                            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded-md text-sm font-medium transition-colors"
                          >
                            <Check className="w-4 h-4" /> Agree
                          </button>
                          <button 
                            onClick={() => sendFeedback('Incorrect')}
                            className="flex-1 flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 py-2 rounded-md text-sm font-medium transition-colors"
                          >
                            <X className="w-4 h-4" /> Disagree
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={`p-3 rounded-md text-sm font-medium text-center ${
                        result.status === 'Correct' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        You marked this diagnosis as {result.status}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                  <Activity className="w-12 h-12 mb-4 opacity-20" />
                  <p>Select an X-Ray to begin</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}