'use client';

import React, { useState } from 'react';
import { X, Link, ChevronDown, Settings, GripVertical } from 'lucide-react';

export default function DatabaseSchemaEditor() {
  const [columns, setColumns] = useState([
    { id: 1, name: 'id', type: 'int8', defaultValue: 'NULL', isPrimary: true },
    { id: 2, name: 'created_at', type: 'timestamptz', defaultValue: 'now()', isPrimary: false },
    { id: 3, name: 'code', type: 'text', defaultValue: 'NULL', isPrimary: false },
    { id: 4, name: 'name', type: 'text', defaultValue: 'NULL', isPrimary: false },
  ]);

  const handleAddColumn = () => {
    const newId = columns.length > 0 ? Math.max(...columns.map(col => col.id)) + 1 : 1;
    setColumns([...columns, { id: newId, name: '', type: '', defaultValue: 'NULL', isPrimary: false }]);
  };

  const handleRemoveColumn = (id) => {
    setColumns(columns.filter(column => column.id !== id));
  };

  return (
    <div className="bg-zinc-900 text-white rounded-lg overflow-hidden border border-zinc-700 w-full max-w-4xl mx-auto shadow-xl">
      {/* Window header with dots */}
      <div className="bg-zinc-900 px-4 py-2 border-b border-zinc-800 flex items-center">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
      </div>

      <div className="p-6">
        {/* Header */}
        {/* <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Columns</h2>
          <div className="flex space-x-4">
            <button className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg flex items-center space-x-2 text-sm">
              <span>About data types</span>
            </button>
            <button className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg flex items-center space-x-2 text-sm">
              <span>Import data via spreadsheet</span>
            </button>
          </div>
        </div> */}

        {/* Column headers */}
        {/* <div className="grid grid-cols-12 gap-2 mb-2 px-4 text-sm text-zinc-400">
          <div className="col-span-1"></div>
          <div className="col-span-3 flex items-center">
            Name <div className="w-5 h-5 rounded-full border border-zinc-600 ml-1 flex items-center justify-center text-xs">?</div>
          </div>
          <div className="col-span-3">Type</div>
          <div className="col-span-3 flex items-center">
            Default Value <div className="w-5 h-5 rounded-full border border-zinc-600 ml-1 flex items-center justify-center text-xs">?</div>
          </div>
          <div className="col-span-2">Primary</div>
        </div> */}

        {/* Columns */}
        <div className="space-y-4">
          {columns.map((column) => (
            <div key={column.id} className="grid grid-cols-12 gap-2 items-center bg-zinc-800 rounded-lg p-2">
              <div className="col-span-1 flex justify-center">
                <GripVertical className="text-zinc-500 w-5 h-5" />
              </div>
              <div className="col-span-3">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={column.name}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                    placeholder="column_name"
                  />
                  <Link className="absolute right-3 text-zinc-400" size={16} />
                </div>
              </div>
              <div className="col-span-3">
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-zinc-400">#</span>
                  <input
                    type="text"
                    value={column.type}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-8 pr-10 py-2 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                  />
                  <ChevronDown className="absolute right-3 text-zinc-400" size={16} />
                </div>
              </div>
              <div className="col-span-3">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={column.defaultValue}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                  />
                  <ChevronDown className="absolute right-3 text-zinc-400" size={16} />
                </div>
              </div>
              <div className="col-span-1 flex justify-center">
                <div className={`w-6 h-6 rounded ${column.isPrimary ? 'bg-green-600' : 'bg-zinc-800 border border-zinc-600'} flex items-center justify-center`}>
                  {column.isPrimary && <span className="text-white text-xs">✓</span>}
                </div>
              </div>
              <div className="col-span-1 flex items-center space-x-2">
                {column.id === 1 ? (
                  <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-600 flex items-center justify-center text-xs text-white">
                    1
                  </div>
                ) : (
                  <Settings className="text-zinc-500 w-5 h-5" />
                )}
                <button onClick={() => handleRemoveColumn(column.id)}>
                  <X className="text-zinc-500 w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          
        
          <div className="border border-dashed border-zinc-700 rounded-lg p-4 flex justify-center">
            <button 
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm"
              onClick={handleAddColumn}
            >
              Add column
            </button>
          </div>
        </div>

        {/* Footer */}
        {/* <div className="mt-8 border-t border-zinc-800 pt-8">
          <h2 className="text-xl font-semibold mb-6">Foreign keys</h2>
          
          
          <div className="h-16"></div>

          
          <div className="flex justify-end space-x-2 mt-4">
            <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg">
              Cancel
            </button>
            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg">
              Save
            </button>
          </div>
        </div> */}
      </div>
    </div>
  );
}