// Core game logic
import { COLS, ROWS, SHAPES, COLORS, MONO_COLORS } from './constants.js';
import { SoundManager, MusicManager } from './audio.js';

export class TetrisGame {
    constructor() {
        this.ctx = null;
        this.board = null;
        this.piece = null;
        this.next = null;
        this.score = 0;
        this.lines = 0;
        this.level = 0;
        this.gameOver = false;
        this.isPaused = false;
        this.ghostEnabled = true;
        this.monochromeMode = false;
        this.highContrast = false;
        this.reducedMotion = false;
        this.isClearing = false;
        this.linesBeingCleared = [];
        this.soundManager = new SoundManager();
        this.musicManager = new MusicManager();
        this.stepCounter = 0;
        this.gameLog = [];
        this.logLevel = 9;
        this.logVisible = false;
        this.logScrollPosition = 0;
        this.pieceBag = [];
    }

    getCurrentColors() {
        return this.monochromeMode ? MONO_COLORS : COLORS;
    }

    init(ctx) {
        this.ctx = ctx;
        this.addToLog('TetrisGame initialized', 1);
        this.board = this.createBoard();
        this.reset();
    }

    createBoard() {
        this.addToLog('Creating game board', 3);
        return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }

    reset() {
        this.addToLog('Resetting game state', 2);
        this.board.forEach(row => row.fill(0));
        this.score = 0;
        this.lines = 0;
        this.level = 0;
        this.gameOver = false;
        this.isPaused = false;
        this.isClearing = false;
        this.linesBeingCleared = [];
        this.stepCounter = 0;
        this.logScrollPosition = 0;
        this.pieceBag = [];
        this.addToLog('Game reset', 1);
        this.spawnPiece();
        this.spawnPiece();
    }

    fillPieceBag() {
        // Fill bag with all 7 piece types (indices 1-7)
        this.pieceBag = [1, 2, 3, 4, 5, 6, 7];
        // Shuffle the bag
        for (let i = this.pieceBag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.pieceBag[i], this.pieceBag[j]] = [this.pieceBag[j], this.pieceBag[i]];
        }
        this.addToLog('Piece bag filled and shuffled', 3);
    }

    getNextPieceType() {
        if (this.pieceBag.length === 0) {
            this.fillPieceBag();
        }
        return this.pieceBag.pop();
    }

    spawnPiece() {
        this.piece = this.next;
        const rand = this.getNextPieceType();
        const newMatrix = SHAPES[rand];
        const currentColors = this.getCurrentColors();
        this.next = {
            x: Math.floor(COLS / 2) - Math.floor(newMatrix[0].length / 2),
            y: 0,
            shape: newMatrix,
            color: currentColors[rand]
        };

        if (this.piece) {
            // Check if the piece can be placed at its spawn position
            if (!this.isValid(this.piece)) {
                this.gameOver = true;
                this.addToLog('Game Over - spawn collision', 2);
                return;
            }
            this.addToLog(`New piece spawned: type ${rand}, bag remaining: ${this.pieceBag.length}`, 4);
        }
    }

    getGhostPiece() {
        if (!this.piece) return null;
        let ghost = JSON.parse(JSON.stringify(this.piece));
        while (this.isValid(ghost)) {
            ghost.y++;
        }
        ghost.y--;
        return ghost;
    }

    isValid(p) {
        for (let y = 0; y < p.shape.length; y++) {
            for (let x = 0; x < p.shape[y].length; x++) {
                if (p.shape[y][x] > 0) {
                    let newX = p.x + x;
                    let newY = p.y + y;
                    if (newX < 0 || newX >= COLS || newY >= ROWS) {
                        return false;
                    }
                    if (newY >= 0 && this.board[newY][newX] > 0) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    rotate() {
        const p = JSON.parse(JSON.stringify(this.piece));
        for (let y = 0; y < p.shape.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [p.shape[x][y], p.shape[y][x]] = [p.shape[y][x], p.shape[x][y]];
            }
        }
        p.shape.forEach(row => row.reverse());
        
        if (this.isValid(p)) {
            this.piece.shape = p.shape;
            this.soundManager.play('ROTATE');
            this.stepCounter++;
            this.addToLog('Piece rotated', 5);
            this.checkAndClearLines();
        } else {
            this.addToLog('Rotation blocked', 4);
        }
    }

    move(p) {
        if (this.isValid(p)) {
            this.piece.x = p.x;
            this.piece.y = p.y;
            this.soundManager.play('MOVE');
            this.stepCounter++;
            this.addToLog(`Piece moved to (${p.x}, ${p.y})`, 5);
            this.checkAndClearLines();
            return true;
        } else {
            this.addToLog('Movement blocked', 4);
        }
        return false;
    }

    drop() {
        const p = { ...this.piece, y: this.piece.y + 1 };
        if (this.isValid(p)) {
            this.piece.y++;
            this.stepCounter++;
            this.addToLog(`Piece dropped to y=${this.piece.y}`, 5);
            this.checkAndClearLines();
            return true;
        } else {
            this.addToLog('Drop blocked - locking piece', 4);
            this.lock();
            return false;
        }
    }

    hardDrop() {
        let p = { ...this.piece };
        let dropDistance = 0;
        while (this.isValid(p)) {
            this.piece.y = p.y;
            p.y++;
            dropDistance++;
        }
        this.soundManager.play('HARD_DROP');
        this.stepCounter++;
        this.addToLog(`Hard drop: fell ${dropDistance} rows`, 3);
        this.lock();
    }
    
    lock() {
        // Lock the piece to the board
        for (let y = 0; y < this.piece.shape.length; y++) {
            for (let x = 0; x < this.piece.shape[y].length; x++) {
                if (this.piece.shape[y][x] > 0) {
                    let boardX = this.piece.x + x;
                    let boardY = this.piece.y + y;
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.piece.shape[y][x];
                    }
                }
            }
        }
        
        this.soundManager.play('DROP');
        this.stepCounter++;
        this.addToLog('Piece locked', 3);
        
        const linesCleared = this.checkAndClearLines();
        if (linesCleared === 0) {
            this.spawnPiece();
        }
    }

    checkAndClearLines() {
        let linesToClear = [];
        for (let y = ROWS - 1; y >= 0; y--) {
            if (this.board[y].every(value => value > 0)) {
                linesToClear.push(y);
            }
        }
        
        if (linesToClear.length > 0) {
            this.soundManager.play('LINE_CLEAR');
            this.isClearing = true;
            this.linesBeingCleared = linesToClear;
            this.addToLog(`${linesToClear.length} line(s) cleared`, 2);
            this.stepCounter++;
            
            // Clear the piece since it's now locked to the board
            this.piece = null;
            
            return linesToClear.length;
        }
        
        return 0;
    }

    finishClearingLines() {
        this.isClearing = false;
        const linesCleared = this.linesBeingCleared.length;

        this.linesBeingCleared.forEach(y => {
            this.board.splice(y, 1);
            this.board.unshift(Array(COLS).fill(0));
        });
        this.linesBeingCleared = [];

        this.score += this.getLinePoints(linesCleared);
        this.lines += linesCleared;
        this.addToLog(`Score: ${this.score} (+${this.getLinePoints(linesCleared)})`, 3);
        
        const oldLevel = this.level;
        if (this.lines >= (this.level + 1) * 10) {
            this.level++;
            if (this.level > oldLevel) {
                this.soundManager.play('LEVEL_UP');
                this.addToLog(`Level up! Now level ${this.level}`, 1);
            }
        }
        
        // Only spawn new piece if we don't have one already
        if (!this.piece) {
            this.spawnPiece();
        }
    }

    getLinePoints(lines) {
        const linePoints = [0, 40, 100, 300, 1200];
        return linePoints[lines] * (this.level + 1);
    }

    addToLog(message, level = 1) {
        if (level <= this.logLevel) {
            const timestamp = new Date().toLocaleTimeString();
            const formattedMessage = `[${timestamp}]:game/logic:${message}`;
            this.gameLog.push(formattedMessage);
            
            // Also log to developer console
            console.log(formattedMessage);
            
            if (this.gameLog.length > 100) {
                this.gameLog.shift();
            }
        }
    }
}