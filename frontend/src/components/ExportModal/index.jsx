import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Download, CheckCircle, Rocket } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateYAMLLocally, generateYAML, validateCompose } from '../services/api';

export default function ExportModal({ isOpen, onClose, nodes, edges }) {
  const [activeTab, setActiveTab] = useState('yaml');
  const [yamlContent, setYamlContent] = useState('');
  const [jsonContent, setJsonContent] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      try {
        const yamlStr = generateYAMLLocally(nodes);
        setYamlContent(yamlStr);
        // Quick extraction of nodes data for JSON tab
        const services = nodes.map(n => n.data);
        setJsonContent(JSON.stringify(services, null, 2));
      } catch (err) {
        toast.error("Failed to generate compose file.");
      }
      setValidationResult(null);
    }
  }, [isOpen, nodes]);

  if (!isOpen) return null;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!', { icon: '📋' });
  };

  const handleDownload = (filename, content) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  const handleValidate = async () => {
    setIsValidating(true);
    // In a real app with API: const res = await validateCompose(yamlContent);
    // For local fake validation:
    setTimeout(() => {
      setValidationResult({ valid: true, errors: [] });
      setIsValidating(false);
      toast.success('YAML is valid!');
    }, 800);
  };

  // Syntax highlighting mock
  const highlightYAML = (str) => {
    return str
      .replace(/([^:]+):/g, '<span class="text-docker-blue font-medium">$1</span>:')
      .replace(/:\s*(['"].*?['"])/g, ': <span class="text-green-400">$1</span>')
      .replace(/:\s*([0-9]+)/g, ': <span class="text-yellow-400">$1</span>')
      .replace(/true|false/g, '<span class="text-purple-400">$&</span>');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-3xl bg-docker-surface rounded-2xl border border-docker-border glow-border shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
        >
          <div className="p-4 border-b border-docker-border flex items-center justify-between bg-[#0e172a]">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-docker-blue">{'</>'}</span> Export
            </h2>
            <div className="flex bg-[#111827] rounded-lg p-1 border border-docker-border">
              {['yaml', 'json', 'instructions'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 text-sm rounded-md font-medium capitalize transition-colors ${
                    activeTab === tab ? 'bg-docker-surface text-white shadow-sm' : 'text-docker-muted hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <button onClick={onClose} className="p-1 rounded-md text-docker-muted hover:text-white hover:bg-docker-card transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-4 custom-scrollbar">
            {activeTab === 'yaml' && (
              <div className="space-y-4">
                <div className="relative group">
                  <pre 
                    className="p-4 bg-[#0a0f1e] text-gray-300 rounded-xl overflow-x-auto text-sm font-mono border border-docker-border/50"
                    dangerouslySetInnerHTML={{ __html: highlightYAML(yamlContent || '# Empty compose file\nversion: "3.8"\nservices: {}') }}
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button 
                      onClick={() => handleCopy(yamlContent)}
                      className="p-2 bg-docker-surface/80 backdrop-blur rounded hover:bg-docker-blue text-white transition-colors shadow-sm"
                      title="Copy"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="flex gap-3 justify-end items-center">
                  {validationResult?.valid && (
                    <span className="text-success text-sm flex items-center gap-1">
                      <CheckCircle size={14} /> Valid Compose V3
                    </span>
                  )}
                  <button
                    onClick={handleValidate}
                    disabled={isValidating || !yamlContent}
                    className="px-4 py-2 border border-docker-border text-docker-muted hover:text-white hover:border-gray-500 rounded-lg text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isValidating ? 'Validating...' : 'Validate'}
                  </button>
                  <button
                    onClick={() => handleDownload('docker-compose.yml', yamlContent)}
                    disabled={!yamlContent}
                    className="px-4 py-2 bg-docker-blue hover:bg-blue-500 text-white rounded-lg text-sm transition-colors flex items-center gap-2 glow-border disabled:opacity-50"
                  >
                    <Download size={16} /> Download .yml
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'json' && (
              <div className="space-y-4">
                <div className="relative group">
                  <pre className="p-4 bg-[#0a0f1e] text-green-400 rounded-xl overflow-x-auto text-sm font-mono border border-docker-border/50">
                    {jsonContent}
                  </pre>
                  <button 
                    onClick={() => handleCopy(jsonContent)}
                    className="absolute top-2 right-2 p-2 bg-docker-surface/80 backdrop-blur rounded hover:bg-docker-blue text-white transition-colors opacity-0 group-hover:opacity-100 shadow-sm"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => handleDownload('services.json', jsonContent)}
                    disabled={!jsonContent}
                    className="px-4 py-2 bg-docker-blue hover:bg-blue-500 text-white rounded-lg text-sm transition-colors flex items-center gap-2 glow-border disabled:opacity-50"
                  >
                    <Download size={16} /> Download .json
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'instructions' && (
              <div className="space-y-4 max-w-2xl mx-auto">
                <div className="p-4 bg-docker-card rounded-xl border border-docker-border">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-6 h-6 rounded bg-docker-blue text-white flex items-center justify-center font-bold text-xs">1</div>
                    <h4 className="text-white font-medium">Save the file</h4>
                  </div>
                  <p className="text-docker-muted text-sm ml-9">Download the YAML file and save it as <code className="text-blue-400 bg-blue-400/10 px-1 py-0.5 rounded">docker-compose.yml</code> in your project directory.</p>
                </div>
                
                <div className="p-4 bg-docker-card rounded-xl border border-[rgba(16,185,129,0.2)]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-6 h-6 rounded bg-success text-white flex items-center justify-center font-bold text-xs">2</div>
                    <h4 className="text-white font-medium">Start the stack</h4>
                  </div>
                  <p className="text-docker-muted text-sm ml-9 mb-2">Run this in your terminal to start all services in the background:</p>
                  <pre className="ml-9 p-2 bg-[#0a0f1e] text-gray-300 rounded text-sm font-mono">docker-compose up -d</pre>
                </div>

                <div className="p-4 bg-docker-card rounded-xl border border-docker-border">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-6 h-6 rounded bg-docker-surface border border-docker-border text-white flex items-center justify-center font-bold text-xs">3</div>
                    <h4 className="text-white font-medium">Manage services</h4>
                  </div>
                  <div className="ml-9 space-y-2">
                    <p className="text-docker-muted text-sm">Check status: <code className="text-gray-300">docker-compose ps</code></p>
                    <p className="text-docker-muted text-sm">View logs: <code className="text-gray-300">docker-compose logs -f</code></p>
                    <p className="text-docker-muted text-sm">Stop all: <code className="text-gray-300">docker-compose down</code></p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-docker-border bg-docker-card flex justify-center">
            <button 
              disabled 
              className="py-2.5 px-6 rounded-lg font-medium tracking-wide flex items-center gap-2 bg-[#1e293b] text-gray-400 border border-gray-700 cursor-not-allowed group relative w-full justify-center"
            >
              <Rocket size={18} />
              Deploy to Cloud 
              <span className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-docker-surface text-xs px-2 py-1 rounded border border-docker-border shadow-lg">
                Coming Soon
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
