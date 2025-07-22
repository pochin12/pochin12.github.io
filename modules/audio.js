/**
 * WARNING: This file must NOT contain any HTML elements or style code.
 * All rendering is done solely through JavaScript drawing commands on a viewport.
 * Do NOT create, modify, or reference any DOM elements other than the base canvas.
 * Keep this file strictly free of markup and styling code.
 */

// Audio management module
export class MusicManager {
    constructor() {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}]:audio/music:MusicManager initialized`);
        
        this.audio = new Audio('https://project-assets.websim.com/0196cbb6-be69-7446-91a9-ff57a825384d');
        this.audio.loop = true;
        this.audio.volume = 0.3;
        this.enabled = true;
    }

    play() {
        if (this.enabled) {
            const timestamp = new Date().toLocaleTimeString();
            console.log(`[${timestamp}]:audio/music:Starting music playback`);
            this.audio.play().catch(e => {
                console.log(`[${timestamp}]:audio/music:Audio play failed: ${e}`);
            });
        }
    }

    stop() {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}]:audio/music:Stopping music playback`);
        this.audio.pause();
        this.audio.currentTime = 0;
    }

    toggle() {
        this.enabled = !this.enabled;
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}]:audio/music:Music ${this.enabled ? 'enabled' : 'disabled'}`);
        if (this.enabled) {
            this.play();
        } else {
            this.stop();
        }
        return this.enabled;
    }
}

export class SoundManager {
    constructor() {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}]:audio/sound:SoundManager initialized`);
        
        this.enabled = true;
        this.audioContext = null;
        this.initAudioContext();
    }

    initAudioContext() {
        const timestamp = new Date().toLocaleTimeString();
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log(`[${timestamp}]:audio/sound:AudioContext initialized`);
            
            // Don't resume context immediately - wait for user interaction
            if (this.audioContext.state === 'suspended') {
                console.log(`[${timestamp}]:audio/sound:AudioContext suspended, awaiting user interaction`);
            }
        } catch (e) {
            console.warn(`[${timestamp}]:audio/sound:Web Audio API not supported`);
            this.enabled = false;
        }
    }

    createTone(frequency, duration = 0.1, type = 'sine') {
        if (!this.audioContext || !this.enabled) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    play(soundName) {
        // Sound effects disabled - only background music plays
        return;
    }

    playSound(soundName) {
        switch (soundName) {
            case 'DROP':
                this.createTone(220, 0.15, 'square');
                break;
            case 'LINE_CLEAR':
                this.createTone(262, 0.12, 'square');
                setTimeout(() => this.createTone(330, 0.12, 'square'), 60);
                setTimeout(() => this.createTone(392, 0.12, 'square'), 120);
                setTimeout(() => this.createTone(523, 0.15, 'square'), 180);
                break;
            case 'MOVE':
                this.createTone(349, 0.08, 'square');
                break;
            case 'ROTATE':
                this.createTone(440, 0.1, 'square');
                break;
            case 'HARD_DROP':
                this.createTone(131, 0.08, 'square');
                setTimeout(() => this.createTone(98, 0.2, 'square'), 50);
                break;
            case 'LEVEL_UP':
                this.createTone(262, 0.2, 'square');
                setTimeout(() => this.createTone(330, 0.2, 'square'), 120);
                setTimeout(() => this.createTone(392, 0.2, 'square'), 240);
                setTimeout(() => this.createTone(523, 0.3, 'square'), 360);
                break;
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}]:audio/sound:Sound effects ${this.enabled ? 'enabled' : 'disabled'}`);
        return this.enabled;
    }
}