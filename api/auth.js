const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

module.exports = async function handler(req, res) {
  const { code } = req.query;
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const origin = `${protocol}://${host}`;

  // Step 1 — no code yet: redirect to GitHub OAuth
  if (!code) {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: `${origin}/api/auth`,
      scope: 'repo,user'
    });
    res.redirect(302, `https://github.com/login/oauth/authorize?${params}`);
    return;
  }

  // Step 2 — exchange code for access token
  try {
    const https = require('https');

    const tokenData = await new Promise((resolve, reject) => {
      const body = JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code });
      const options = {
        hostname: 'github.com',
        path: '/login/oauth/access_token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        }
      };
      const req2 = https.request(options, (r) => {
        let raw = '';
        r.on('data', chunk => raw += chunk);
        r.on('end', () => { try { resolve(JSON.parse(raw)); } catch(e) { reject(e); } });
      });
      req2.on('error', reject);
      req2.write(body);
      req2.end();
    });

    if (!tokenData.access_token) {
      res.status(401).send('Auth failed: ' + JSON.stringify(tokenData));
      return;
    }

    // Send token back to Decap CMS via postMessage then close popup
    res.setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html><html><body><script>
(function() {
  var token = ${JSON.stringify(tokenData.access_token)};
  var msg = 'authorization:github:success:' + JSON.stringify({ token: token, provider: 'github' });
  if (window.opener) {
    window.opener.postMessage(msg, '*');
    setTimeout(function() { window.close(); }, 500);
  } else {
    document.body.innerText = 'Connecté. Vous pouvez fermer cette fenêtre.';
  }
})();
</script></body></html>`);
  } catch (err) {
    res.status(500).send('Erreur: ' + err.message);
  }
};
