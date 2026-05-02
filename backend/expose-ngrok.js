const ngrok = require('ngrok');

async function startTunnel() {
  try {
    const url = await ngrok.connect({
      proto: 'http',
      addr: 3001,
      authtoken: process.env.NGROK_AUTH_TOKEN
    });
    console.log('=================================');
    console.log('NGROK TUNNEL ACTIVE');
    console.log('Public URL:', url);
    console.log('');
    console.log('UPDATE FRONTEND .env:');
    console.log(`NEXT_PUBLIC_API_URL=${url}`);
    console.log('=================================');
    
    // Keep process alive
    process.on('SIGINT', () => {
      ngrok.disconnect();
      process.exit(0);
    });
  } catch (err) {
    console.error('Ngrok error:', err.message);
    process.exit(1);
  }
}

startTunnel();
