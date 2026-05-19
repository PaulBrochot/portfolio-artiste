const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

module.exports = async function handler(req, res) {
  const { code, error, error_description } = req.query;
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const origin = `${protocol}://${host}`;

  // GitHub returned an error
  if (error) {
    return res.send(popup(`
      <p style="color:red"><b>Erreur GitHub :</b> ${error}</p>
      <p>${error_description || ''}</p>
    `));
  }

  // Step 1 — no code yet: redirect to GitHub OAuth
  if (!code) {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: `${origin}/api/auth`,
      scope: 'repo,user'
    });
    return res.redirect(302, `https://github.com/login/oauth/authorize?${params}`);
  }

  // Step 2 — exchange code for access token
  try {
    const https = require('https');
    const tokenData = await githubTokenExchange(https, CLIENT_ID, CLIENT_SECRET, code);

    if (tokenData.error || !tokenData.access_token) {
      return res.send(popup(`
        <p style="color:red"><b>Échange de token échoué :</b></p>
        <pre>${JSON.stringify(tokenData, null, 2)}</pre>
        <p>CLIENT_ID défini : ${CLIENT_ID ? 'oui' : 'NON'}</p>
        <p>CLIENT_SECRET défini : ${CLIENT_SECRET ? 'oui' : 'NON'}</p>
      `));
    }

    // Always write to localStorage (window.opener is nulled by GitHub's COOP headers)
    // The admin page polls localStorage and dispatches the message event to Decap
    res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
    res.setHeader('Content-Type', 'text/html');
    res.send(popup(`
      <p>Authentification réussie, fermeture…</p>
      <script>
      (function() {
        var token = ${JSON.stringify(tokenData.access_token)};
        var msg = 'authorization:github:success:' + JSON.stringify({ token: token, provider: 'github' });
        // Store in localStorage — admin page polls for this
        try { localStorage.setItem('decap_token', JSON.stringify({ token: token, ts: Date.now() })); } catch(e) {}
        // Also try postMessage in case opener is available
        if (window.opener) { try { window.opener.postMessage(msg, '*'); } catch(e) {} }
        setTimeout(function() { window.close(); }, 800);
      })();
      </script>
    `));
  } catch (err) {
    res.status(500).send(popup(`<p style="color:red">Erreur serveur : ${err.message}</p>`));
  }
};

function githubTokenExchange(https, clientId, clientSecret, code) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ client_id: clientId, client_secret: clientSecret, code });
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
    const req = https.request(options, (r) => {
      let raw = '';
      r.on('data', chunk => raw += chunk);
      r.on('end', () => { try { resolve(JSON.parse(raw)); } catch(e) { reject(e); } });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function popup(content) {
  return `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:20px">${content}</body></html>`;
}
