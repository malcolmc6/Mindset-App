export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { type, ...body } = req.body;

  // Handle ElevenLabs TTS
  if (type === 'tts') {
    const { text, voiceId } = body;
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
       model_id: 'eleven_flash_v2_5',
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.85,
          style: 0.3,
          use_speaker_boost: true,
        },
      }),
    });

   if (!response.ok) {
  const err = await response.text();
  console.log('ElevenLabs error:', err);
  return res.status(500).json({ error: err });
}

    const audioBuffer = await response.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.byteLength);
    return res.send(Buffer.from(audioBuffer));
  }

  // Handle Anthropic script generation
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  res.status(200).json(data);
}
