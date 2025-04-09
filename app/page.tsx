'use client'

import React, { JSX } from 'react';
import { useState, useEffect, KeyboardEvent, ChangeEvent, MouseEvent } from 'react';
import { Search, Download, X, ChevronDown, ChevronUp, Loader, ExternalLink } from 'lucide-react';

// Define types for result items
interface DownloadItem {
  title: string;
  url: string;
  language: string;
}

interface ResultItem {
  name: string;
  description?: string;
  test_types?: string;
  remote_testing?: string;
  duration?: string;
  job_levels?: string;
  adaptive_irt?: string;
  languages?: string;
  url?: string;
  downloads?: DownloadItem[];
  [key: string]: any; // For dynamic sorting
}

// Define type for sort configuration
interface SortConfig {
  key: string | null;
  direction: 'ascending' | 'descending';
}

export default function SearchApp(): JSX.Element {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'ascending' });

  const handleSearch = async (): Promise<void> => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://test-kappa-dun-81.vercel.app/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch results');
      }
      
      setResults(data.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSort = (key: string): void => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig.key === key) {
      direction = sortConfig.direction === 'ascending' ? 'descending' : 'ascending';
    }
    
    setSortConfig({ key, direction });
  };

  const sortedResults = [...results].sort((a: ResultItem, b: ResultItem) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key] || '';
    const bValue = b[sortConfig.key] || '';
    
    if (aValue < bValue) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const toggleRowExpansion = (index: number): void => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 text-gray-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          Solution Finder
        </h1>
        
        <div className="mb-10 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your search query..."
              className="bg-gray-800/70 backdrop-blur-sm text-gray-100 w-full pl-12 pr-12 py-4 rounded-xl border border-gray-700/50 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500 shadow-md transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-3 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search className="h-5 w-5" />
                <span>Search</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mb-8 p-5 bg-red-900/30 border border-red-700/50 rounded-xl text-red-200 shadow-md">
            <p className="font-medium">Error: {error}</p>
          </div>
        )}

        {results.length > 0 ? (
          <div className="overflow-x-auto rounded-xl shadow-xl border border-gray-800/50">
            <table className="w-full border-collapse">
              <thead className="bg-gradient-to-r from-gray-800 to-gray-800/80">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200 uppercase tracking-wider cursor-pointer hover:bg-gray-700/40 transition-colors" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-2">
                      Name
                      {sortConfig.key === 'name' && (
                        sortConfig.direction === 'ascending' ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200 uppercase tracking-wider cursor-pointer hover:bg-gray-700/40 transition-colors" onClick={() => handleSort('test_types')}>
                    <div className="flex items-center gap-2">
                      Test Types
                      {sortConfig.key === 'test_types' && (
                        sortConfig.direction === 'ascending' ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200 uppercase tracking-wider cursor-pointer hover:bg-gray-700/40 transition-colors" onClick={() => handleSort('remote_testing')}>
                    <div className="flex items-center gap-2">
                      Remote Testing
                      {sortConfig.key === 'remote_testing' && (
                        sortConfig.direction === 'ascending' ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {sortedResults.map((item, index) => (
                  <React.Fragment key={index}>
                    <tr 
                      className={`bg-gray-800/30 hover:bg-gray-700/20 transition-colors cursor-pointer ${expandedRow === index ? 'bg-gray-700/40' : ''}`}
                      onClick={() => toggleRowExpansion(index)}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-200">{item.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{item.test_types || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${item.remote_testing === 'Yes' ? 'bg-green-900/30 text-green-200 border border-green-700/50' : 'bg-red-900/30 text-red-200 border border-red-700/50'}`}>
                          {item.remote_testing || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        <div className="flex gap-3">
                          <button 
                            onClick={(e: MouseEvent) => {
                              e.stopPropagation();
                              if (item.url) window.open(item.url, '_blank');
                            }}
                            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span>Visit</span>
                          </button>
                          <button
                            onClick={(e: MouseEvent) => {
                              e.stopPropagation();
                              toggleRowExpansion(index);
                            }}
                            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                            aria-label={expandedRow === index ? "Collapse details" : "Expand details"}
                          >
                            {expandedRow === index ? 
                              <ChevronUp className="h-5 w-5" /> : 
                              <ChevronDown className="h-5 w-5" />
                            }
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedRow === index && (
                      <tr className="bg-gray-800/50 border-b border-gray-700/50">
                        <td colSpan={5} className="px-6 py-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-semibold text-blue-400 mb-2">Description</h4>
                                <p className="text-sm text-gray-300 leading-relaxed">{item.description || 'No description available'}</p>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold text-blue-400 mb-2">Key Details</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div className="text-gray-400">Duration:</div>
                                  <div className="text-gray-200">{item.duration || 'N/A'}</div>
                                  
                                  <div className="text-gray-400">Job Levels:</div>
                                  <div className="text-gray-200">{item.job_levels || 'N/A'}</div>
                                  
                                  <div className="text-gray-400">Adaptive IRT:</div>
                                  <div className="text-gray-200">{item.adaptive_irt || 'N/A'}</div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              {item.downloads && item.downloads.length > 0 && (
                                <div>
                                  <h4 className="font-semibold text-blue-400 mb-2">Downloads</h4>
                                  <ul className="space-y-2">
                                    {item.downloads.map((download, i) => (
                                      <li key={i} className="flex items-center gap-2">
                                        <Download className="h-4 w-4 text-blue-400" />
                                        <a 
                                          href={download.url} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                                          onClick={(e: MouseEvent) => e.stopPropagation()}
                                        >
                                          {download.title} ({download.language})
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !loading && (
            <div className="text-center p-8 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-inner">
              {query.trim() ? (
                <p className="text-gray-300">No results found. Try a different search term.</p>
              ) : (
                <p className="text-gray-300">Enter a search term and click Search to find solutions.</p>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}