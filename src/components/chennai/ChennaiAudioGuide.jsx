// src/components/chennai/ChennaiAudioGuide.jsx
// 🔊 Listen in Tamil button using Sarvam TTS — fails silently

import { useState } from 'react';
import { Volume2, Loader2, Square } from 'lucide-react';
import { translateWithSarvam, textToSpeechTamil } from '../../services/sarvam';

export default function ChennaiAudioGuide({ text, placeName }) {
    const [state, setState] = useState('idle'); // idle | loading | playing
    const [audio, setAudio] = useState(null);

    const handlePlay = async () => {
        if (state === 'playing' && audio) {
            audio.pause();
            audio.currentTime = 0;
            setState('idle');
            return;
        }

        setState('loading');
        try {
            // Step 1: Translate significance text to Tamil
            const tamilText = await translateWithSarvam(text?.slice(0, 400) || placeName);
            const textForTTS = tamilText || text || placeName;

            // Step 2: TTS — Sarvam Tamil audio
            const audioUri = await textToSpeechTamil(textForTTS);
            if (!audioUri) throw new Error('TTS unavailable');

            // Step 3: Play
            const audioObj = new Audio(audioUri);
            audioObj.onended = () => setState('idle');
            audioObj.onerror = () => setState('idle');
            setAudio(audioObj);
            await audioObj.play();
            setState('playing');
        } catch {
            setState('idle'); // Fail silently — never block UI
        }
    };

    return (
        <button
            onClick={handlePlay}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-all duration-200"
            title={state === 'playing' ? 'Stop audio' : 'Listen in Tamil'}
        >
            {state === 'idle' && <Volume2 className="w-3.5 h-3.5" />}
            {state === 'loading' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {state === 'playing' && <Square className="w-3 h-3 fill-amber-300" />}
            <span>
                {state === 'idle' && '🔊 Listen in Tamil'}
                {state === 'loading' && 'Generating...'}
                {state === 'playing' && 'Playing...'}
            </span>
        </button>
    );
}
