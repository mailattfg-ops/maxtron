import https from 'https';

https.get('https://tyqyefbonftizfbupmzy.supabase.co/rest/v1/', (res) => {
  console.log("HTTPS Status:", res.statusCode);
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log("Body:", body));
}).on('error', (e) => {
  console.error("HTTPS Error:", e);
});
