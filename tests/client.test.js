const MaruMoriClient = require('../src/api/client.js');

describe('MaruMoriClient authorization', () => {
  test('sends the API key using the required Bearer scheme', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: [] })
    });
    const client = new MaruMoriClient('test-api-key', fetchMock);

    await client.getVocabulary();

    expect(fetchMock).toHaveBeenCalledWith(
      'https://public-api.marumori.io/known/vocabulary',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer test-api-key' })
      })
    );
  });
});