/**
 * WARNING: This file must NOT contain any HTML elements or style code.
 * All rendering is done solely through JavaScript drawing commands on a viewport.
 * Do NOT create, modify, or reference any DOM elements other than the base canvas.
 * Keep this file strictly free of markup and styling code.
 */

// Main application loader
import { initializeDOM } from './modules/dom.js';
import { TetrisView } from './modules/renderer.js';

// Application initialization
const App = {
    init() {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}]:init:Initializing application modules...`);
        
        // Initialize DOM
        const canvas = initializeDOM();
        
        // Initialize Tetris game
        const tetrisView = new TetrisView(canvas);
        tetrisView.init();
        
        console.log(`[${timestamp}]:init:Application initialized successfully`);
    }
};

// Start the application
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}]:init:DOM loaded, initializing App`);
        App.init();
    });
} else {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}]:init:DOM already loaded, initializing App`);
    App.init();
}