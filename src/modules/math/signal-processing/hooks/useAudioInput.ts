/* eslint-disable */

import { useState, useEffect, useRef, useCallback } from 'react';

export const useAudioInput = (isActive: boolean, fftSize: number = 2048) => {
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);

    const dataArrayRef = useRef<any>(null); // Use any to bypass TS ArrayBufferLike mismatch for now

    // Initialize Audio
    useEffect(() => {
        if (!isActive) {
            // Cleanup if deactivated
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                setStream(null);
            }
            if (audioContext && audioContext.state !== 'closed') {
                audioContext.close();
                setAudioContext(null);
            }
            return;
        }

        const initAudio = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                const analyserNode = ctx.createAnalyser();

                analyserNode.fftSize = fftSize;

                const sourceNode = ctx.createMediaStreamSource(stream);
                sourceNode.connect(analyserNode);

                setStream(stream);
                setAudioContext(ctx);
                setAnalyser(analyserNode);
                // Source node typically doesn't need to be kept in state unless we need to disconnect/reconnect

                dataArrayRef.current = new Uint8Array(analyserNode.frequencyBinCount);
                setError(null);

            } catch (err: any) {
                console.error("Error accessing microphone:", err);
                setError("Could not access microphone. Please allow permissions.");
                setStream(null);
            }
        };

        if (isActive && !audioContext) {
            initAudio();
        }

        return () => {
            // Cleanup on unmount or isActive change
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (audioContext && audioContext.state !== 'closed') {
                audioContext.close();
            }
        };

    }, [isActive]);


    const getTimeDomainData = useCallback((): number[] => {
        if (!analyser || !dataArrayRef.current) return [];

        // @ts-ignore
        analyser.getByteTimeDomainData(dataArrayRef.current as Uint8Array);

        // Convert Uint8 (0-255) to Float (-1 to 1)
        // 128 is 0. 
        const floatArray = new Array(dataArrayRef.current.length);
        for (let i = 0; i < dataArrayRef.current.length; i++) {
            floatArray[i] = (dataArrayRef.current[i] - 128) / 128.0;
        }
        return floatArray;

    }, [analyser]);

    /**
    * Returns frequency data directly from AnalyserNode (more efficient than manual DFT for Mic)
    * But for consistency with our manual DFT lab, we might just use time domain data and feed it to our DFT.
    * Let's stick to returning Time Domain so it integrates with existing pipeline.
    */

    return { getTimeDomainData, error, isReady: !!analyser };
};
