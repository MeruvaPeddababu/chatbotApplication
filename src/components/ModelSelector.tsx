import React from 'react';
import { ChevronDown, Cpu } from 'lucide-react';
import type { Model } from '../types';

interface ModelSelectorProps {
  models: Model[];
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  disabled?: boolean;
}

export function ModelSelector({ models, selectedModel, onModelChange, disabled }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectedModelData = models.find(m => m.id === selectedModel);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-2.5 text-left focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/95"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${selectedModelData?.color || 'bg-gray-400'}`} />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {selectedModelData?.name || 'Select Model'}
              </p>
              <p className="text-xs text-gray-500">
                {selectedModelData?.provider || 'No provider'}
              </p>
            </div>
          </div>
          <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="py-1">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  onModelChange(model.id);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${model.color}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{model.name}</p>
                    <p className="text-xs text-gray-500">{model.description}</p>
                  </div>
                  <Cpu className="h-4 w-4 text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}