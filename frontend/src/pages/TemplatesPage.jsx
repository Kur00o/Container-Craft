import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Plus } from 'lucide-react';
import { TEMPLATES, SERVICES } from '../services/api';
import toast from 'react-hot-toast';

export default function TemplatesPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredServices = SERVICES.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUseTemplate = (template) => {
    toast.success(`Loaded ${template.name} template!`);
    // In a real implementation this would pass data to /editor
    navigate('/editor');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-docker-bg text-white p-6 overflow-y-auto"
    >
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="flex items-center justify-between">
          <div>
            <Link to="/editor" className="group flex items-center gap-2 text-docker-muted hover:text-white transition-colors mb-4 inline-flex">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Editor
            </Link>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-docker-blue to-[#60a5fa] glow-text">
              Template Library
            </h1>
            <p className="text-docker-muted mt-2">Start with a pre-configured stack or add individual services.</p>
          </div>
        </header>

        <section>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="text-docker-blue">⚡</span> Quick Start Templates
          </h2>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {TEMPLATES.map(template => (
              <motion.div 
                key={template.id} 
                variants={itemVariants}
                className="bg-docker-surface rounded-2xl border border-docker-border p-6 hover:border-docker-blue/50 hover:shadow-[0_0_20px_rgba(29,99,237,0.15)] transition-all hover:-translate-y-1 group flex flex-col h-full"
              >
                <div 
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold mb-4 bg-opacity-20 shadow-inner"
                  style={{ backgroundColor: `${template.color}22`, color: template.color }}
                >
                  {template.letter}
                </div>
                <h3 className="text-lg font-bold mb-2">{template.name}</h3>
                <p className="text-sm text-docker-muted mb-6 flex-1">{template.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {template.tags.map(tag => (
                    <span key={tag} className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-[#111827] text-docker-muted border border-[#1f2937]">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <button 
                  onClick={() => handleUseTemplate(template)}
                  className="w-full py-2.5 bg-docker-blue/10 hover:bg-docker-blue text-docker-blue hover:text-white rounded-lg font-medium transition-colors border border-docker-blue/30 hover:border-transparent group-hover:glow-border"
                >
                  Use Template
                </button>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <section>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="text-docker-blue">📦</span> Individual Services
            </h2>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-docker-muted" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-docker-surface text-white text-sm rounded-lg pl-9 pr-3 py-2.5 border border-docker-border focus:outline-none focus:border-docker-blue focus:ring-1 focus:ring-docker-blue transition-colors shadow-inner"
              />
            </div>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4"
          >
            {filteredServices.map(service => (
              <motion.div 
                key={service.id}
                variants={itemVariants}
                className="bg-docker-surface rounded-xl border border-docker-border p-4 hover:border-docker-blue/30 transition-colors flex flex-col group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => {toast.success("Added to canvas"); navigate('/editor')}} className="p-1.5 bg-docker-blue text-white rounded-md hover:scale-110 transition-transform shadow-md">
                    <Plus size={14} />
                  </button>
                </div>
                
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg"
                    style={{ backgroundColor: service.color }}
                  >
                    {service.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold">{service.name}</h4>
                    <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded text-docker-muted border border-[#1f2937]">
                      {service.version.split(':')[1] || 'latest'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-docker-muted line-clamp-2">{service.description}</p>
                <div className="mt-4 pt-3 border-t border-docker-border/50 text-xs text-docker-muted font-mono truncate">
                  {service.ports?.[0] || 'No exposed ports'}
                </div>
              </motion.div>
            ))}
          </motion.div>
          {filteredServices.length === 0 && (
            <div className="py-20 text-center text-docker-muted">
              <p>No services found matching "{searchTerm}"</p>
            </div>
          )}
        </section>
      </div>
    </motion.div>
  );
}
