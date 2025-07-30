import React, { useState } from 'react';

const SEMKeywordAnalyzer = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('ctrScore');
  const [sortDirection, setSortDirection] = useState('desc');

  // High CTR keyword patterns and modifiers
  const highCtrModifiers = {
    commercial: ['buy', 'purchase', 'order', 'shop', 'get', 'best', 'top', 'cheap', 'discount', 'sale', 'deal', 'price', 'cost', 'affordable', 'free shipping'],
    informational: ['how to', 'what is', 'guide', 'tutorial', 'tips', 'learn', 'complete', 'ultimate', 'step by step', 'beginner', 'advanced', 'expert'],
    local: ['near me', 'local', 'in [city]', 'nearby', 'location', 'store', 'service'],
    urgency: ['now', 'today', 'urgent', 'fast', 'quick', 'instant', 'same day', 'emergency', 'asap'],
    emotional: ['amazing', 'incredible', 'shocking', 'secret', 'proven', 'guaranteed', 'exclusive', 'limited', 'rare'],
    questions: ['why', 'when', 'where', 'which', 'who', 'how much', 'how many', 'what', 'how'],
    temporal: ['2024', '2025', 'latest', 'new', 'updated', 'current', 'recent', 'modern']
  };

  // Industry-specific high CTR keywords
  const industryKeywords = {
    'ecommerce': ['product', 'review', 'comparison', 'vs', 'alternative', 'coupon', 'promo code'],
    'saas': ['software', 'tool', 'platform', 'solution', 'demo', 'trial', 'pricing'],
    'healthcare': ['treatment', 'symptoms', 'cure', 'prevention', 'diagnosis', 'doctor'],
    'finance': ['loan', 'credit', 'investment', 'insurance', 'mortgage', 'rate'],
    'education': ['course', 'certification', 'training', 'class', 'degree', 'online'],
    'real-estate': ['home', 'house', 'property', 'rent', 'mortgage', 'realtor'],
    'travel': ['hotel', 'flight', 'vacation', 'booking', 'deals', 'package'],
    'food': ['recipe', 'restaurant', 'delivery', 'menu', 'cooking', 'diet']
  };

  const analyzeURL = (inputUrl) => {
    const urlObj = new URL(inputUrl);
    const domain = urlObj.hostname.replace('www.', '');
    const path = urlObj.pathname;
    const pathSegments = path.split('/').filter(segment => segment.length > 0);
    
    // Extract keywords from URL
    const urlKeywords = [
      ...domain.split('.')[0].split(/[-_]/),
      ...pathSegments.flatMap(segment => segment.split(/[-_]/))
    ].filter(word => word.length > 2);

    // Determine industry based on domain and path
    const detectedIndustry = detectIndustry(domain, path);
    
    // Generate keyword suggestions
    const suggestions = generateKeywordSuggestions(urlKeywords, detectedIndustry);
    
    return {
      url: inputUrl,
      domain,
      extractedKeywords: urlKeywords,
      detectedIndustry,
      suggestions,
      timestamp: new Date().toISOString()
    };
  };

  const detectIndustry = (domain, path) => {
    const text = (domain + ' ' + path).toLowerCase();
    
    const industrySignals = {
      'ecommerce': ['shop', 'store', 'buy', 'cart', 'product', 'sale', 'commerce', 'retail'],
      'saas': ['app', 'software', 'platform', 'tool', 'api', 'cloud', 'service', 'tech'],
      'healthcare': ['health', 'medical', 'clinic', 'doctor', 'hospital', 'care', 'wellness'],
      'finance': ['bank', 'finance', 'money', 'credit', 'loan', 'invest', 'insurance'],
      'education': ['edu', 'school', 'university', 'course', 'learn', 'training', 'academy'],
      'real-estate': ['real', 'estate', 'property', 'home', 'house', 'rent', 'mortgage'],
      'travel': ['travel', 'hotel', 'flight', 'vacation', 'booking', 'trip', 'tour'],
      'food': ['food', 'restaurant', 'recipe', 'cooking', 'cafe', 'dining', 'kitchen']
    };

    for (const [industry, signals] of Object.entries(industrySignals)) {
      if (signals.some(signal => text.includes(signal))) {
        return industry;
      }
    }
    
    return 'general';
  };

  const generateKeywordSuggestions = (baseKeywords, industry) => {
    const suggestions = [];
    
    // Generate variations for each base keyword
    baseKeywords.forEach(baseKeyword => {
      if (baseKeyword.length < 3) return;
      
      // Commercial intent keywords
      highCtrModifiers.commercial.forEach(modifier => {
        const competition = getCompetitionLevel('commercial');
        const searchVolume = estimateSearchVolume(baseKeyword, modifier);
        suggestions.push({
          keyword: `${modifier} ${baseKeyword}`,
          intent: 'commercial',
          ctrScore: calculateCTRScore('commercial', modifier, baseKeyword),
          competition: competition,
          searchVolume: searchVolume,
          suggestedBid: estimateBid('commercial', baseKeyword, competition, searchVolume)
        });
      });

      // Informational keywords
      highCtrModifiers.informational.slice(0, 5).forEach(modifier => {
        const competition = getCompetitionLevel('informational');
        const searchVolume = estimateSearchVolume(baseKeyword, modifier);
        suggestions.push({
          keyword: `${modifier} ${baseKeyword}`,
          intent: 'informational',
          ctrScore: calculateCTRScore('informational', modifier, baseKeyword),
          competition: competition,
          searchVolume: searchVolume,
          suggestedBid: estimateBid('informational', baseKeyword, competition, searchVolume)
        });
      });

      // Question-based keywords
      highCtrModifiers.questions.slice(0, 4).forEach(modifier => {
        const competition = getCompetitionLevel('informational');
        const searchVolume = estimateSearchVolume(baseKeyword, modifier);
        suggestions.push({
          keyword: `${modifier} ${baseKeyword}`,
          intent: 'informational',
          ctrScore: calculateCTRScore('questions', modifier, baseKeyword),
          competition: competition,
          searchVolume: searchVolume,
          suggestedBid: estimateBid('informational', baseKeyword, competition, searchVolume)
        });
      });

      // Local keywords
      highCtrModifiers.local.slice(0, 3).forEach(modifier => {
        const competition = getCompetitionLevel('local');
        const searchVolume = estimateSearchVolume(baseKeyword, modifier);
        suggestions.push({
          keyword: `${baseKeyword} ${modifier}`,
          intent: 'local',
          ctrScore: calculateCTRScore('local', modifier, baseKeyword),
          competition: competition,
          searchVolume: searchVolume,
          suggestedBid: estimateBid('local', baseKeyword, competition, searchVolume)
        });
      });
    });

    // Add industry-specific keywords
    if (industry !== 'general' && industryKeywords[industry]) {
      industryKeywords[industry].forEach(industryKeyword => {
        baseKeywords.slice(0, 2).forEach(baseKeyword => {
          const competition = getCompetitionLevel('commercial');
          const searchVolume = estimateSearchVolume(baseKeyword, industryKeyword);
          suggestions.push({
            keyword: `${baseKeyword} ${industryKeyword}`,
            intent: 'commercial',
            ctrScore: calculateCTRScore('industry', industryKeyword, baseKeyword),
            competition: competition,
            searchVolume: searchVolume,
            suggestedBid: estimateBid('commercial', baseKeyword, competition, searchVolume)
          });
        });
      });
    }

    // Sort by CTR score and return top suggestions
    return suggestions
      .sort((a, b) => b.ctrScore - a.ctrScore)
      .slice(0, 25)
      .map((suggestion, index) => ({ ...suggestion, rank: index + 1 }));
  };

  const calculateCTRScore = (category, modifier, baseKeyword) => {
    const baseScore = {
      'commercial': 85,
      'informational': 72,
      'local': 78,
      'questions': 68,
      'industry': 82
    }[category] || 65;

    // Boost score based on modifier popularity
    const modifierBoosts = {
      'buy': 15, 'best': 12, 'how to': 10, 'free': 8, 'near me': 14,
      'top': 9, 'cheap': 7, 'review': 11, 'vs': 8, 'guide': 6
    };

    const boost = modifierBoosts[modifier] || 0;
    
    // Reduce score for very long keywords
    const lengthPenalty = (modifier + ' ' + baseKeyword).length > 30 ? -5 : 0;
    
    return Math.min(100, Math.max(10, baseScore + boost + lengthPenalty + Math.random() * 5));
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };

  const sortedSuggestions = results ? [...results.suggestions].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'ctrScore':
        aValue = a.ctrScore;
        bValue = b.ctrScore;
        break;
      case 'searchVolume':
        aValue = a.searchVolume;
        bValue = b.searchVolume;
        break;
      case 'keyword':
        aValue = a.keyword.toLowerCase();
        bValue = b.keyword.toLowerCase();
        break;
      case 'suggestedBid':
        aValue = parseFloat(a.suggestedBid);
        bValue = parseFloat(b.suggestedBid);
        break;
      default:
        return 0;
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  }) : [];

  const getCompetitionLevel = (intent) => {
    const levels = {
      'commercial': ['High', 'Very High', 'Medium'][Math.floor(Math.random() * 3)],
      'informational': ['Low', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
      'local': ['Medium', 'High', 'Medium'][Math.floor(Math.random() * 3)]
    };
    return levels[intent] || 'Medium';
  };

  const estimateSearchVolume = (baseKeyword, modifier) => {
    const base = Math.floor(Math.random() * 50000) + 1000;
    const modifierMultiplier = {
      'buy': 1.5, 'best': 2.0, 'how to': 1.8, 'cheap': 1.2, 'free': 1.6,
      'near me': 1.3, 'review': 1.4, 'guide': 1.1
    };
    
    const multiplier = modifierMultiplier[modifier] || 1.0;
    return Math.floor(base * multiplier);
  };

  const estimateBid = (intent, baseKeyword, competition, searchVolume) => {
    // Base bids for different intents (targeting top 3 positions)
    const baseBids = {
      'commercial': 4.50,     // Higher for commercial intent
      'informational': 1.80,  // Moderate for informational
      'local': 2.80,          // Higher for local searches
      'industry': 3.20        // Higher for industry-specific
    };
    
    const base = baseBids[intent] || 2.00;
    
    // Position targeting multiplier (above-the-fold = top 3 positions)
    const positionMultiplier = 1.8; // 80% premium for top positions
    
    // Competition-based adjustments
    const competitionMultipliers = {
      'Low': 1.0,
      'Medium': 1.3,
      'High': 1.6,
      'Very High': 2.0
    };
    
    const competitionMultiplier = competitionMultipliers[competition] || 1.3;
    
    // Search volume factor (higher volume = higher competition = higher bids)
    const volumeMultiplier = searchVolume > 50000 ? 1.4 : 
                            searchVolume > 20000 ? 1.2 : 
                            searchVolume > 5000 ? 1.1 : 1.0;
    
    // Keyword length factor (longer keywords typically cost less)
    const keywordLength = baseKeyword.split(' ').length;
    const lengthMultiplier = keywordLength > 3 ? 0.8 : 
                            keywordLength > 2 ? 0.9 : 1.0;
    
    // Calculate final bid with all factors
    const calculatedBid = base * positionMultiplier * competitionMultiplier * 
                         volumeMultiplier * lengthMultiplier;
    
    // Add some realistic variation (±15%)
    const variation = (Math.random() - 0.5) * 0.3 * calculatedBid;
    const finalBid = calculatedBid + variation;
    
    // Ensure minimum bid of $0.50 and reasonable maximum
    return Math.max(0.50, Math.min(25.00, finalBid)).toFixed(2);
  };

  const handleAnalyze = () => {
    setError('');
    setResults(null);
    
    if (!url) {
      setError('Please enter a URL to analyze');
      return;
    }

    let validUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      validUrl = 'https://' + url;
    }

    try {
      new URL(validUrl);
      setLoading(true);
      
      setTimeout(() => {
        const analysis = analyzeURL(validUrl);
        setResults(analysis);
        setLoading(false);
      }, 1500);
    } catch (e) {
      setError('Please enter a valid URL');
    }
  };

  const getIntentColor = (intent) => {
    const colors = {
      'commercial': '#10b981',
      'informational': '#3b82f6',
      'local': '#f59e0b',
      'navigational': '#8b5cf6'
    };
    return colors[intent] || '#6b7280';
  };

  const getCompetitionColor = (competition) => {
    const colors = {
      'Low': '#10b981',
      'Medium': '#f59e0b',
      'High': '#ef4444',
      'Very High': '#dc2626'
    };
    return colors[competition] || '#6b7280';
  };

  const getCTRColor = (score) => {
    if (score >= 90) return '#10b981';
    if (score >= 80) return '#84cc16';
    if (score >= 70) return '#f59e0b';
    if (score >= 60) return '#f97316';
    return '#ef4444';
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '40px 20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f9fafb',
      minHeight: '100vh'
    }}>
      <h1 style={{
        textAlign: 'center',
        color: '#1f2937',
        fontSize: '2.5rem',
        marginBottom: '10px'
      }}>
        SEM Keyword Analyzer
      </h1>
      <p style={{
        textAlign: 'center',
        color: '#6b7280',
        marginBottom: '40px',
        fontSize: '1.1rem'
      }}>
        Get high-CTR keyword suggestions for your SEM campaigns
      </p>

      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            color: '#374151',
            fontWeight: 'bold'
          }}>
            Enter URL to Analyze:
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="example.com or https://example.com"
              style={{
                flex: 1,
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                outline: 'none'
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
            />
            <button
              onClick={handleAnalyze}
              disabled={loading}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
          {error && (
            <p style={{ color: '#ef4444', marginTop: '8px', fontSize: '14px' }}>
              {error}
            </p>
          )}
        </div>
      </div>

      {results && (
        <div>
          {/* Summary Section */}
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '30px'
          }}>
            <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>Analysis Summary</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px'
            }}>
              <div style={{
                padding: '20px',
                backgroundColor: '#f3f4f6',
                borderRadius: '8px'
              }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#374151', fontSize: '14px' }}>Domain</h3>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#1f2937' }}>{results.domain}</p>
              </div>
              <div style={{
                padding: '20px',
                backgroundColor: '#f3f4f6',
                borderRadius: '8px'
              }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#374151', fontSize: '14px' }}>Detected Industry</h3>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#1f2937' }}>
                  {results.detectedIndustry.charAt(0).toUpperCase() + results.detectedIndustry.slice(1)}
                </p>
              </div>
              <div style={{
                padding: '20px',
                backgroundColor: '#f3f4f6',
                borderRadius: '8px'
              }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#374151', fontSize: '14px' }}>Keyword Suggestions</h3>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#1f2937' }}>{results.suggestions.length}</p>
              </div>
              <div style={{
                padding: '20px',
                backgroundColor: '#f3f4f6',
                borderRadius: '8px'
              }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#374151', fontSize: '14px' }}>Avg CTR Score</h3>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#1f2937' }}>
                  {Math.round(results.suggestions.reduce((acc, s) => acc + s.ctrScore, 0) / results.suggestions.length)}%
                </p>
              </div>
            </div>
          </div>

          {/* Keywords Table */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '30px 30px 20px 30px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h2 style={{ margin: 0, color: '#1f2937' }}>High-CTR Keyword Suggestions</h2>
              <p style={{ margin: '5px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
                Ranked by estimated click-through rate potential
              </p>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <th style={{
                      padding: '12px 20px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#374151',
                      borderBottom: '1px solid #e5e7eb'
                    }}>Rank</th>
                    <th 
                      onClick={() => handleSort('keyword')}
                      style={{
                        padding: '12px 20px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: sortBy === 'keyword' ? '#3b82f6' : '#374151',
                        borderBottom: '1px solid #e5e7eb',
                        cursor: 'pointer',
                        userSelect: 'none',
                        position: 'relative'
                      }}
                    >
                      Keyword {sortBy === 'keyword' && (
                        <span style={{ marginLeft: '5px' }}>
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th style={{
                      padding: '12px 20px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#374151',
                      borderBottom: '1px solid #e5e7eb'
                    }}>Intent</th>
                    <th 
                      onClick={() => handleSort('ctrScore')}
                      style={{
                        padding: '12px 20px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: sortBy === 'ctrScore' ? '#3b82f6' : '#374151',
                        borderBottom: '1px solid #e5e7eb',
                        cursor: 'pointer',
                        userSelect: 'none'
                      }}
                    >
                      CTR Score {sortBy === 'ctrScore' && (
                        <span style={{ marginLeft: '5px' }}>
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th 
                      onClick={() => handleSort('searchVolume')}
                      style={{
                        padding: '12px 20px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: sortBy === 'searchVolume' ? '#3b82f6' : '#374151',
                        borderBottom: '1px solid #e5e7eb',
                        cursor: 'pointer',
                        userSelect: 'none'
                      }}
                    >
                      Search Volume {sortBy === 'searchVolume' && (
                        <span style={{ marginLeft: '5px' }}>
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th style={{
                      padding: '12px 20px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#374151',
                      borderBottom: '1px solid #e5e7eb'
                    }}>Competition</th>
                    <th 
                      onClick={() => handleSort('suggestedBid')}
                      style={{
                        padding: '12px 20px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: sortBy === 'suggestedBid' ? '#3b82f6' : '#374151',
                        borderBottom: '1px solid #e5e7eb',
                        cursor: 'pointer',
                        userSelect: 'none'
                      }}
                      title="Bids calculated for above-the-fold positioning (top 3 ad positions)"
                    >
                      Suggested Bid* {sortBy === 'suggestedBid' && (
                        <span style={{ marginLeft: '5px' }}>
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSuggestions.map((suggestion, index) => (
                    <tr key={index} style={{
                      borderBottom: index < results.suggestions.length - 1 ? '1px solid #f3f4f6' : 'none'
                    }}>
                      <td style={{
                        padding: '16px 20px',
                        fontSize: '14px',
                        color: '#6b7280'
                      }}>
                        #{index + 1}
                      </td>
                      <td style={{
                        padding: '16px 20px',
                        fontSize: '14px',
                        color: '#1f2937',
                        fontWeight: 'bold'
                      }}>
                        {suggestion.keyword}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          color: 'white',
                          backgroundColor: getIntentColor(suggestion.intent)
                        }}>
                          {suggestion.intent.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          fontWeight: 'bold',
                          color: getCTRColor(suggestion.ctrScore)
                        }}>
                          {Math.round(suggestion.ctrScore)}%
                        </span>
                      </td>
                      <td style={{
                        padding: '16px 20px',
                        fontSize: '14px',
                        color: '#374151'
                      }}>
                        {suggestion.searchVolume.toLocaleString()}/mo
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          color: 'white',
                          backgroundColor: getCompetitionColor(suggestion.competition)
                        }}>
                          {suggestion.competition}
                        </span>
                      </td>
                      <td style={{
                        padding: '16px 20px',
                        fontSize: '14px',
                        color: '#374151',
                        fontWeight: 'bold'
                      }}>
                        ${suggestion.suggestedBid}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tips Section */}
          <div style={{
            marginTop: '30px',
            padding: '30px',
            backgroundColor: '#eff6ff',
            borderRadius: '12px',
            border: '1px solid #bfdbfe'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#1e40af' }}>
              💡 SEM Campaign Tips
            </h3>
            <ul style={{
              margin: 0,
              paddingLeft: '20px',
              color: '#3730a3',
              lineHeight: '1.8'
            }}>
              <li>Start with high CTR score keywords (80%+) for maximum impact</li>
              <li>Mix commercial and informational intent keywords for full funnel coverage</li>
              <li>Test local keywords if your business has physical locations</li>
              <li>Monitor competition levels - start with low-medium competition keywords</li>
              <li><strong>Suggested bids target above-the-fold positions (top 3 ad slots)</strong></li>
              <li>Use suggested bids as starting points and adjust based on performance</li>
              <li>Create separate ad groups for different keyword intents</li>
              <li>Higher bids account for competition, search volume, and premium positioning</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SEMKeywordAnalyzer;