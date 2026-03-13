export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  const endpoint = req.query.endpoint || '/api/option-trades/flow-alerts';
  
  const response = await fetch(`https://api.unusualwhales.com${endpoint}`, {
    headers: {
      'Authorization': 'Bearer 9dbba67b-0135-4101-94cc-cd7a91f7a40f',
      'Accept': 'application/json'
    }
  });
  
  const data = await response.json();
  res.status(200).json(data);
}
