/**
 * WARNING: This file must NOT contain any HTML elements or style code.
 * All rendering is done solely through JavaScript drawing commands on a viewport.
 * Do NOT create, modify, or reference any DOM elements other than the base canvas.
 * Keep this file strictly free of markup and styling code.
 */

// Game constants and configuration
export const COLS = 10;
export const ROWS = 20;
export const BLOCK_SIZE = 30;

export const COLORS = [
    null,       // 0: Empty
    '#FF0D72',  // 1: Z-piece (Red)
    '#0DC2FF',  // 2: I-piece (Cyan)
    '#0DFF72',  // 3: S-piece (Green)
    '#F538FF',  // 4: T-piece (Purple)
    '#FF8E0D',  // 5: L-piece (Orange)
    '#FFE138',  // 6: O-piece (Yellow)
    '#3877FF',  // 7: J-piece (Blue)
];

export const MONO_COLORS = [
    null,       // 0: Empty
    '#FFFFFF',  // 1: White
    '#FFFFFF',  // 2: White
    '#FFFFFF',  // 3: White
    '#FFFFFF',  // 4: White
    '#FFFFFF',  // 5: White
    '#FFFFFF',  // 6: White
    '#FFFFFF',  // 7: White
];

export const SHAPES = [
    [], // 0: Empty
    [[1, 1, 0], [0, 1, 1], [0, 0, 0]], // Z
    [[0, 0, 0, 0], [2, 2, 2, 2], [0, 0, 0, 0], [0, 0, 0, 0]], // I
    [[0, 3, 3], [3, 3, 0], [0, 0, 0]], // S
    [[0, 4, 0], [4, 4, 4], [0, 0, 0]], // T
    [[0, 0, 5], [5, 5, 5], [0, 0, 0]], // L
    [[6, 6], [6, 6]], // O
    [[7, 0, 0], [7, 7, 7], [0, 0, 0]], // J
];

export const KEY = {
    LEFT: ['arrowleft', 'a', 'j'],
    RIGHT: ['arrowright', 'd', 'l'],
    DOWN: ['arrowdown', 's', 'k'],
    UP: ['arrowup', 'w', 'i'],
    SPACE: [' '],
    R: ['r'],
    PAUSE: ['f', ';', 'shift'],
    TOGGLE_GHOST: ['g'],
    TOGGLE_SOUND: ['m'],
    TOGGLE_LOG: ['tab'],
    ESCAPE: ['escape'],
    ENTER: ['enter']
};

export const FONT_FAMILY = '"Press Start 2P", "Courier New", Courier, monospace';

export const GAME_STATE = {
    SETTINGS: 'settings',
    CREDITS: 'credits',
    PLAYING: 'playing'
};