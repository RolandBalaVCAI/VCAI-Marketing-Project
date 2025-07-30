import React, { useState } from 'react';

const SEOAnalyzer = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const analyzeURL = (inputUrl) => {
    const analysis = {
      url: inputUrl,
      timestamp: new Date().toISOString(),
      criteria: []
    };

    let score = 0;

    // URL Structure Analysis (20 points)
    const urlObj = new URL(inputUrl);
    
    // HTTPS check (10 points)
    if (urlObj.protocol === 'https:') {
      score += 10;
      analysis.criteria.push({
        name: 'HTTPS Protocol',
        score: 10,
        maxScore: 10,
        status: 'pass',
        description: 'Site uses secure HTTPS protocol'
      });
    } else {
      analysis.criteria.push({
        name: 'HTTPS Protocol',
        score: 0,
        maxScore: 10,
        status: 'fail',
        description: 'Site should use HTTPS for security and SEO benefits'
      });
    }

    // URL length check (5 points)
    if (inputUrl.length <= 75) {
      score += 5;
      analysis.criteria.push({
        name: 'URL Length',
        score: 5,
        maxScore: 5,
        status: 'pass',
        description: 'URL length is optimal (under 75 characters)'
      });
    } else if (inputUrl.length <= 100) {
      score += 3;
      analysis.criteria.push({
        name: 'URL Length',
        score: 3,
        maxScore: 5,
        status: 'warning',
        description: 'URL is slightly long (75-100 characters)'
      });
    } else {
      analysis.criteria.push({
        name: 'URL Length',
        score: 0,
        maxScore: 5,
        status: 'fail',
        description: 'URL is too long (over 100 characters)'
      });
    }

    // Clean URL structure (5 points)
    const hasQueryParams = urlObj.search.length > 0;
    const hasSpecialChars = /[^a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]/.test(urlObj.pathname);
    
    if (!hasQueryParams && !hasSpecialChars) {
      score += 5;
      analysis.criteria.push({
        name: 'Clean URL Structure',
        score: 5,
        maxScore: 5,
        status: 'pass',
        description: 'URL has clean structure without unnecessary parameters'
      });
    } else if (!hasSpecialChars) {
      score += 3;
      analysis.criteria.push({
        name: 'Clean URL Structure',
        score: 3,
        maxScore: 5,
        status: 'warning',
        description: 'URL contains query parameters which could be cleaner'
      });
    } else {
      analysis.criteria.push({
        name: 'Clean URL Structure',
        score: 0,
        maxScore: 5,
        status: 'fail',
        description: 'URL contains special characters or complex parameters'
      });
    }

    // Keyword presence in URL (10 points)
    const pathWords = urlObj.pathname.toLowerCase().split(/[-/_]/).filter(word => word.length > 2);
    if (pathWords.length > 0) {
      score += 10;
      analysis.criteria.push({
        name: 'Keywords in URL',
        score: 10,
        maxScore: 10,
        status: 'pass',
        description: 'URL contains meaningful keywords in path'
      });
    } else {
      score += 5;
      analysis.criteria.push({
        name: 'Keywords in URL',
        score: 5,
        maxScore: 10,
        status: 'warning',
        description: 'URL could benefit from more descriptive keywords'
      });
    }

    // Mobile-friendly indicator (10 points)
    const hasMobileSubdomain = urlObj.hostname.includes('m.') || urlObj.hostname.includes('mobile.');
    if (!hasMobileSubdomain) {
      score += 10;
      analysis.criteria.push({
        name: 'Responsive Design Indicator',
        score: 10,
        maxScore: 10,
        status: 'pass',
        description: 'No separate mobile subdomain (good for modern SEO)'
      });
    } else {
      score += 5;
      analysis.criteria.push({
        name: 'Responsive Design Indicator',
        score: 5,
        maxScore: 10,
        status: 'warning',
        description: 'Uses mobile subdomain - consider responsive design instead'
      });
    }

    // Domain authority indicators (15 points)
    const domainAge = urlObj.hostname.split('.').length >= 2;
    const hasWww = urlObj.hostname.startsWith('www.');
    
    if (domainAge) {
      score += 10;
      analysis.criteria.push({
        name: 'Domain Structure',
        score: 10,
        maxScore: 10,
        status: 'pass',
        description: 'Standard domain structure'
      });
    }

    if (!hasWww || hasWww) { // Both are acceptable
      score += 5;
      analysis.criteria.push({
        name: 'WWW Consistency',
        score: 5,
        maxScore: 5,
        status: 'pass',
        description: 'Consistent WWW usage'
      });
    }

    // Page depth (10 points)
    const depth = urlObj.pathname.split('/').filter(segment => segment.length > 0).length;
    if (depth <= 3) {
      score += 10;
      analysis.criteria.push({
        name: 'Page Depth',
        score: 10,
        maxScore: 10,
        status: 'pass',
        description: `Good page depth (${depth} levels deep)`
      });
    } else if (depth <= 5) {
      score += 5;
      analysis.criteria.push({
        name: 'Page Depth',
        score: 5,
        maxScore: 10,
        status: 'warning',
        description: `Deep page structure (${depth} levels) - consider flattening`
      });
    } else {
      analysis.criteria.push({
        name: 'Page Depth',
        score: 0,
        maxScore: 10,
        status: 'fail',
        description: `Very deep page structure (${depth} levels) hurts SEO`
      });
    }

    // File extension check (5 points)
    const hasHtmlExtension = urlObj.pathname.endsWith('.html') || urlObj.pathname.endsWith('.htm');
    const hasTrailingSlash = urlObj.pathname.endsWith('/');
    
    if (!hasHtmlExtension || hasTrailingSlash || urlObj.pathname === '/') {
      score += 5;
      analysis.criteria.push({
        name: 'URL Format',
        score: 5,
        maxScore: 5,
        status: 'pass',
        description: 'Clean URL format without file extensions'
      });
    } else {
      score += 2;
      analysis.criteria.push({
        name: 'URL Format',
        score: 2,
        maxScore: 5,
        status: 'warning',
        description: 'Consider removing .html extensions for cleaner URLs'
      });
    }

    // Readability (10 points)
    const hasUnderscores = urlObj.pathname.includes('_');
    const hasNumbers = /\d{4,}/.test(urlObj.pathname); // Long number sequences
    
    if (!hasUnderscores && !hasNumbers) {
      score += 10;
      analysis.criteria.push({
        name: 'URL Readability',
        score: 10,
        maxScore: 10,
        status: 'pass',
        description: 'URL is human-readable and SEO-friendly'
      });
    } else if (!hasUnderscores) {
      score += 5;
      analysis.criteria.push({
        name: 'URL Readability',
        score: 5,
        maxScore: 10,
        status: 'warning',
        description: 'URL contains long numbers which may hurt readability'
      });
    } else {
      analysis.criteria.push({
        name: 'URL Readability',
        score: 0,
        maxScore: 10,
        status: 'fail',
        description: 'Use hyphens instead of underscores in URLs'
      });
    }

    // Canonical potential (10 points)
    const noDuplicateSlashes = !urlObj.pathname.includes('//');
    const noIndexFiles = !urlObj.pathname.includes('index.');
    
    if (noDuplicateSlashes && noIndexFiles) {
      score += 10;
      analysis.criteria.push({
        name: 'Canonical URL Structure',
        score: 10,
        maxScore: 10,
        status: 'pass',
        description: 'URL follows canonical best practices'
      });
    } else {
      score += 5;
      analysis.criteria.push({
        name: 'Canonical URL Structure',
        score: 5,
        maxScore: 10,
        status: 'warning',
        description: 'URL may have canonicalization issues'
      });
    }

    analysis.totalScore = score;
    analysis.grade = getGrade(score);
    
    return analysis;
  };

  const getGrade = (score) => {
    if (score >= 90) return { letter: 'A+', color: '#22c55e' };
    if (score >= 80) return { letter: 'A', color: '#84cc16' };
    if (score >= 70) return { letter: 'B', color: '#eab308' };
    if (score >= 60) return { letter: 'C', color: '#f97316' };
    if (score >= 50) return { letter: 'D', color: '#ef4444' };
    return { letter: 'F', color: '#dc2626' };
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
      }, 1000);
    } catch (e) {
      setError('Please enter a valid URL');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pass': return '#22c55e';
      case 'warning': return '#eab308';
      case 'fail': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{
      maxWidth: '800px',
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
        SEO URL Analyzer
      </h1>
      <p style={{
        textAlign: 'center',
        color: '#6b7280',
        marginBottom: '40px'
      }}>
        Analyze your URL's SEO score on a scale of 1-100
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
              placeholder="example.com or https://example.com/page"
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
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '30px'
          }}>
            <div>
              <h2 style={{ margin: '0 0 5px 0', color: '#1f2937' }}>SEO Score</h2>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                {results.url}
              </p>
            </div>
            <div style={{
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: results.grade.color
              }}>
                {results.totalScore}
              </div>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: results.grade.color
              }}>
                Grade: {results.grade.letter}
              </div>
            </div>
          </div>

          <div style={{
            marginBottom: '20px',
            padding: '20px',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontWeight: 'bold', color: '#374151' }}>Overall Progress</span>
              <span style={{ fontWeight: 'bold', color: '#374151' }}>{results.totalScore}/100</span>
            </div>
            <div style={{
              marginTop: '10px',
              height: '20px',
              backgroundColor: '#e5e7eb',
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${results.totalScore}%`,
                backgroundColor: results.grade.color,
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>

          <h3 style={{ marginBottom: '20px', color: '#1f2937' }}>Detailed Analysis</h3>
          
          <div style={{ display: 'grid', gap: '15px' }}>
            {results.criteria.map((criterion, index) => (
              <div key={index} style={{
                padding: '20px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px'
                }}>
                  <h4 style={{ margin: 0, color: '#374151' }}>{criterion.name}</h4>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: 'white',
                      backgroundColor: getStatusColor(criterion.status)
                    }}>
                      {criterion.status.toUpperCase()}
                    </span>
                    <span style={{
                      fontWeight: 'bold',
                      color: '#374151'
                    }}>
                      {criterion.score}/{criterion.maxScore}
                    </span>
                  </div>
                </div>
                <p style={{
                  margin: 0,
                  color: '#6b7280',
                  fontSize: '14px'
                }}>
                  {criterion.description}
                </p>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '30px',
            padding: '20px',
            backgroundColor: '#eff6ff',
            borderRadius: '8px',
            border: '1px solid #bfdbfe'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#1e40af' }}>
              SEO Recommendations
            </h4>
            <ul style={{
              margin: 0,
              paddingLeft: '20px',
              color: '#3730a3',
              fontSize: '14px',
              lineHeight: '1.8'
            }}>
              {results.totalScore < 100 && results.criteria.filter(c => c.status !== 'pass').map((criterion, index) => (
                <li key={index}>{criterion.description}</li>
              ))}
              {results.totalScore === 100 && (
                <li>Excellent! Your URL follows all SEO best practices.</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SEOAnalyzer;