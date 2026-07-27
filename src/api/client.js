/**
 * MaruMori API Client
 * Communicates with the MaruMori public API v1
 * Reference: https://gist.github.com/Eearslya/d233379c1743f32b4bada4afa542c208
 */

class MaruMoriClient {
  constructor(apiKey, fetchImpl = fetch) {
    if (!apiKey) {
      throw new Error('API key is required.');
    }
    this.apiKey = apiKey;
    this.fetch = fetchImpl;
    this.baseURL = 'https://public-api.marumori.io';
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    try {
      const response = await this.fetch(url, {
        ...options,
        method: options.method || 'GET',
        headers
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Invalid API key or unauthorized access');
        }
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`MaruMori API request failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get user home data with statistics
   * Endpoint: GET /home
   */
  async getHome() {
    return this.request('/home');
  }

  /**
   * Get list of learned vocabulary
   * Endpoint: GET /known/vocabulary
   * @param {Object} options
   * @param {number} options.minLevel - Optional SRS level filter (1-9)
   */
  async getVocabulary(options = {}) {
    const params = new URLSearchParams();
    if (options.minLevel !== undefined) {
      params.append('min-level', options.minLevel);
    }
    const queryString = params.toString();
    const endpoint = `/known/vocabulary${queryString ? '?' + queryString : ''}`;
    const response = await this.request(endpoint);
    return response.items;
  }

  /**
   * Get list of learned kanji
   * Endpoint: GET /known/kanji
   * @param {Object} options
   * @param {number} options.minLevel - Optional SRS level filter (1-9)
   */
  async getKanji(options = {}) {
    const params = new URLSearchParams();
    if (options.minLevel !== undefined) {
      params.append('min-level', options.minLevel);
    }
    const queryString = params.toString();
    const endpoint = `/known/kanji${queryString ? '?' + queryString : ''}`;
    const response = await this.request(endpoint);
    return response.items;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MaruMoriClient;
}
