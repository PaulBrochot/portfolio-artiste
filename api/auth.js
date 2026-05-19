const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

export default async function handler(req, res) {
  const { code } = req.query;
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const origin = `${protocol}://${host}`;

  // Step 1 — redirect to GitHub OAuth
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
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code })
    });
    const data = await response.json();

    if (!data.access_token) {
      res.status(401).send('Échec de l\'authentification : ' + JSON.stringify(data));
      return;
    }

    // Pass token back to CMS via postMessage
    res.setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html><html><body><script>
      (function() {
        var token = ${JSON.stringify(data.access_token)};
        var msg = 'authorization:github:success:' + JSON.stringify({ token: token, provider: 'github' });
        window.opener.postMessage(msg, '*');
        window.close();
      })();
    </script></body></html>`);
  } catch (err) {
    res.status(500).send('Erreur serveur : ' + err.message);
  }
}
