/**
 * WARNING: This file must NOT contain any HTML elements or style code.
 * All rendering is done solely through JavaScript drawing commands on a viewport.
 * Do NOT create, modify, or reference any DOM elements other than the base canvas.
 * Keep this file strictly free of markup and styling code.
 */

// Rendering and view management
import { COLS, ROWS, BLOCK_SIZE, FONT_FAMILY, GAME_STATE, KEY } from './constants.js';
import { TetrisGame } from './game.js';
import { BrowserRedirect } from './dom.js';

export class TetrisView {
    constructor(canvas) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}]:renderer/view:TetrisView constructor called`);
        
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        
        // Disable image smoothing for pixel-perfect rendering
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;
        
        this.game = new TetrisGame();
        
        this.animationFrameId = null;
        this.lastTime = 0;
        this.dropCounter = 0;
        this.dropInterval = 1000;
        this.lineClearAnimationTime = 500;
        this.lineClearTimer = 0;

        this.actionLock = false;
        
        this.gameState = GAME_STATE.PLAYING;
        this.settingsSelection = 0;
        
        this.mouseX = 0;
        this.mouseY = 0;
        this.isMouseDown = false;
        
        this.browserRedirect = new BrowserRedirect();
        
        // Mobile support
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchSensitivity = 50;
        
        // Button areas for click detection
        this.buttonAreas = [];
        
        console.log(`[${timestamp}]:renderer/view:TetrisView initialized with mobile support: ${this.isMobile}`);
    }

    addToLog(message, level = 1) {
        const timestamp = new Date().toLocaleTimeString();
        const consoleMessage = `[${timestamp}]:renderer/view:${message}`;
        console.log(consoleMessage);
        
        if (level <= this.game.logLevel) {
            this.game.gameLog.push(`[${timestamp}]:renderer/view:${message}`);
            if (this.game.gameLog.length > 100) {
                this.game.gameLog.shift();
            }
        }
    }

    init() {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}]:renderer/view:TetrisView init() called`);
        
        console.log(`[${timestamp}]:renderer/view:Canvas initialized`);
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.game.init(this.ctx);
        console.log(`[${timestamp}]:renderer/view:Game initialized with canvas context`);
        
        document.addEventListener('keydown', e => this.handleKeyPress(e));
        
        this.canvas.addEventListener('mousemove', e => this.handleMouseMove(e));
        this.canvas.addEventListener('mousedown', e => this.handleMouseDown(e));
        this.canvas.addEventListener('mouseup', e => this.handleMouseUp(e));
        this.canvas.addEventListener('click', e => this.handleClick(e));
        
        this.canvas.addEventListener('touchstart', e => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', e => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', e => this.handleTouchEnd(e));

        console.log(`[${timestamp}]:renderer/view:Event listeners attached`);

        console.log(`[${timestamp}]:renderer/view:Initialization completed`);
        
        setTimeout(() => {
            console.log(`[${timestamp}]:renderer/view:Starting game`);
            // Auto-start the game
            this.game.reset();
            this.game.musicManager.play();
            this.animate(0);
        }, 100);
    }
    
    resizeCanvas() {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}]:renderer/canvas:Resizing canvas`);
        
        const logPanelWidth = this.game.logVisible ? Math.min(400, window.innerWidth * 0.3) : 0;
        const topBarHeight = 60;
        
        // Calculate available space - minimize margins
        const availableWidth = window.innerWidth - logPanelWidth - 20;
        const availableHeight = window.innerHeight - topBarHeight - 2;
        
        // Calculate optimal block size
        const optimalBlockSizeW = Math.floor(availableWidth / (COLS + 8));
        const optimalBlockSizeH = Math.floor(availableHeight / ROWS);
        const optimalBlockSize = Math.max(15, Math.min(optimalBlockSizeW, optimalBlockSizeH, 40));
        
        // Update block size
        this.blockSize = optimalBlockSize;
        
        const gameAreaWidth = COLS * this.blockSize;
        const uiPanelWidth = this.blockSize * 8;
        const gameAreaHeight = ROWS * this.blockSize;
        
        // Set canvas size with device pixel ratio for crisp rendering
        const dpr = window.devicePixelRatio || 1;
        const canvasWidth = gameAreaWidth + uiPanelWidth + logPanelWidth;
        const canvasHeight = gameAreaHeight + topBarHeight;
        
        this.canvas.width = canvasWidth * dpr;
        this.canvas.height = canvasHeight * dpr;
        this.canvas.style.width = canvasWidth + 'px';
        this.canvas.style.height = canvasHeight + 'px';
        
        // Scale context for high DPI displays
        this.ctx.scale(dpr, dpr);
        
        // Re-disable image smoothing after scaling
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;
        
        console.log(`[${timestamp}]:renderer/canvas:Canvas resized to ${canvasWidth}x${canvasHeight}, blockSize: ${this.blockSize}, DPR: ${dpr}`);
        
        if (this.game.ctx) {
            this.draw();
        }
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
    }

    handleMouseDown(e) {
        this.isMouseDown = true;
    }

    handleMouseUp(e) {
        this.isMouseDown = false;
    }

    handleClick(e) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}]:renderer/input:Click event at (${this.mouseX}, ${this.mouseY})`);
        
        // Initialize audio context on first user interaction
        if (this.game.soundManager.audioContext && this.game.soundManager.audioContext.state === 'suspended') {
            this.game.soundManager.audioContext.resume();
        }
        
        // Check button areas
        for (let area of this.buttonAreas) {
            if (this.mouseX >= area.x && this.mouseX <= area.x + area.width &&
                this.mouseY >= area.y && this.mouseY <= area.y + area.height) {
                area.callback();
                return;
            }
        }
        
        if (this.gameState === GAME_STATE.CREDITS) {
            this.gameState = GAME_STATE.PLAYING;
        }
    }

    handleTouchStart(e) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}]:renderer/input:Touch start event`);
        
        e.preventDefault();
        if (e.touches.length > 0) {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.touches[0].clientX - rect.left;
            this.mouseY = e.touches[0].clientY - rect.top;
            this.touchStartX = this.mouseX;
            this.touchStartY = this.mouseY;
            this.isMouseDown = true;
        }
    }

    handleTouchMove(e) {
        e.preventDefault();
        if (e.touches.length > 0) {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.touches[0].clientX - rect.left;
            this.mouseY = e.touches[0].clientY - rect.top;
        }
    }

    handleTouchEnd(e) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}]:renderer/input:Touch end event`);
        
        e.preventDefault();
        
        // Initialize audio context on first user interaction
        if (this.game.soundManager.audioContext && this.game.soundManager.audioContext.state === 'suspended') {
            this.game.soundManager.audioContext.resume();
        }
        
        if (this.mouseY > 60 && this.gameState === GAME_STATE.PLAYING) {
            // Game area touch controls
            const touchEndX = this.mouseX;
            const touchEndY = this.mouseY;
            const deltaX = touchEndX - this.touchStartX;
            const deltaY = touchEndY - this.touchStartY;
            
            if (Math.abs(deltaX) > this.touchSensitivity || Math.abs(deltaY) > this.touchSensitivity) {
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    // Horizontal swipe
                    if (deltaX > 0) {
                        this.handleGameInput('right');
                    } else {
                        this.handleGameInput('left');
                    }
                } else {
                    // Vertical swipe
                    if (deltaY > 0) {
                        this.handleGameInput('down');
                    } else {
                        this.handleGameInput('rotate');
                    }
                }
            } else {
                // Tap
                this.handleGameInput('rotate');
            }
        }
        
        this.isMouseDown = false;
        this.handleClick(e);
    }

    handlePostMove() {
        if (this.game.isClearing) {
            this.lineClearTimer = 0;
        }
    }
    
    animate(time = 0) {
        if (this.gameState !== GAME_STATE.PLAYING) {
            this.draw();
            this.animationFrameId = requestAnimationFrame(time => this.animate(time));
            return;
        }

        if (this.game.gameOver) {
            this.draw();
            this.animationFrameId = requestAnimationFrame(time => this.animate(time));
            return;
        }

        if (this.game.isPaused) {
            this.draw();
            this.animationFrameId = requestAnimationFrame(time => this.animate(time));
            return;
        }

        const deltaTime = time - this.lastTime;
        this.lastTime = time;
        
        if (this.game.isClearing) {
            this.lineClearTimer += deltaTime;
            if (this.lineClearTimer >= this.lineClearAnimationTime) {
                this.game.finishClearingLines();
                this.lineClearTimer = 0;
            }
        } else {
            if (!this.game.piece) {
                this.game.spawnPiece();
            }
            
            // Continue normal piece dropping and check for line clearing
            if (this.game.piece) {
                this.dropCounter += deltaTime;
                this.dropInterval = 1000 / (this.game.level + 1);
     
                if (this.dropCounter > this.dropInterval) {
                    this.game.drop();
                    this.dropCounter = 0;
                }
            }
        }
        
        this.draw();
        this.animationFrameId = requestAnimationFrame(time => this.animate(time));
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.buttonAreas = []; // Clear button areas
        
        this.drawTopBar();
        
        switch (this.gameState) {
            case GAME_STATE.SETTINGS:
                this.drawSettings();
                break;
            case GAME_STATE.CREDITS:
                this.drawCredits();
                break;
            case GAME_STATE.PLAYING:
                this.drawGame();
                break;
        }
    }

    drawTopBar() {
        const topBarHeight = 60;
        const scaleFactor = this.blockSize / 30;
        
        // Top bar background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        this.ctx.fillRect(0, 0, this.canvas.width, topBarHeight);
        
        // Title
        this.ctx.fillStyle = '#FFE138';
        this.ctx.font = `bold ${Math.floor(18 * scaleFactor)}px ${FONT_FAMILY}`;
        this.ctx.textAlign = 'left';
        this.ctx.fillText('YET ANOTHER TETRIS CLONE', 20, 30);
        
        // Buttons
        const buttonWidth = Math.floor(40 * scaleFactor);
        const buttonHeight = Math.floor(18 * scaleFactor);
        const buttonY = Math.floor(22 * scaleFactor);
        const spacing = Math.floor(10 * scaleFactor);
        
        let currentX = this.canvas.width - 20;
        
        // Settings button
        currentX -= buttonWidth;
        this.drawButton('SET', currentX, buttonY, buttonWidth, buttonHeight, false);
        this.buttonAreas.push({
            x: currentX,
            y: buttonY,
            width: buttonWidth,
            height: buttonHeight,
            callback: () => {
                this.gameState = GAME_STATE.SETTINGS;
                this.settingsSelection = 0;
                this.addToLog('Settings opened', 2);
            }
        });
        
        // Separator
        currentX -= spacing;
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(currentX - 1, buttonY - 2, 2, buttonHeight + 4);
        
        // Credits button
        currentX -= buttonWidth + spacing;
        this.drawButton('CRED', currentX, buttonY, buttonWidth, buttonHeight, false);
        this.buttonAreas.push({
            x: currentX,
            y: buttonY,
            width: buttonWidth,
            height: buttonHeight,
            callback: () => {
                this.gameState = GAME_STATE.CREDITS;
                this.addToLog('Credits opened', 2);
            }
        });
        
        // Separator
        currentX -= spacing;
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(currentX - 1, buttonY - 2, 2, buttonHeight + 4);
        
        // Log button
        currentX -= buttonWidth + spacing;
        this.drawButton('LOG', currentX, buttonY, buttonWidth, buttonHeight, this.game.logVisible);
        this.buttonAreas.push({
            x: currentX,
            y: buttonY,
            width: buttonWidth,
            height: buttonHeight,
            callback: () => {
                this.game.logVisible = !this.game.logVisible;
                this.addToLog(`Log panel ${this.game.logVisible ? 'shown' : 'hidden'}`, 2);
                this.resizeCanvas();
            }
        });
        
        // Mobile instructions
        if (this.isMobile && this.gameState === GAME_STATE.PLAYING) {
            this.ctx.fillStyle = '#888';
            this.ctx.font = `${Math.floor(10 * scaleFactor)}px ${FONT_FAMILY}`;
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Swipe to move • Tap to rotate', this.canvas.width / 2, 50);
        }
    }

    drawButton(text, x, y, width, height, active) {
        // Button background
        this.ctx.fillStyle = active ? '#FFE138' : 'rgba(255, 255, 255, 0.1)';
        this.ctx.fillRect(x, y, width, height);
        
        // Button border
        this.ctx.strokeStyle = active ? '#FF8E0D' : '#666';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, width, height);
        
        // Button text
        this.ctx.fillStyle = active ? '#000' : '#FFF';
        this.ctx.font = `${Math.floor(10 * (this.blockSize / 30))}px ${FONT_FAMILY}`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, x + width / 2, y + height / 2 + 3);
    }

    drawSettings() {
        // Draw the game in background first
        this.drawGame();
        
        // Draw overlay
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const scaleFactor = this.blockSize / 30;
        
        const overlayWidth = Math.floor(400 * scaleFactor);
        const overlayHeight = Math.floor(350 * scaleFactor);
        const overlayX = centerX - overlayWidth / 2;
        const overlayY = centerY - overlayHeight / 2;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
        this.ctx.fillRect(overlayX, overlayY, overlayWidth, overlayHeight);
        
        this.ctx.strokeStyle = '#FFE138';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(overlayX, overlayY, overlayWidth, overlayHeight);
        
        this.ctx.textAlign = 'center';
        
        this.ctx.font = `bold ${Math.floor(24 * scaleFactor)}px ${FONT_FAMILY}`;
        this.ctx.fillStyle = '#FFE138';
        this.ctx.fillText('SETTINGS', centerX, overlayY + 40);
        
        this.ctx.font = `${Math.floor(14 * scaleFactor)}px ${FONT_FAMILY}`;
        const settingsOptions = [
            `Ghost Blocks: ${this.game.ghostEnabled ? 'ON' : 'OFF'}`,
            `Monochrome: ${this.game.monochromeMode ? 'ON' : 'OFF'}`,
            `High Contrast: ${this.game.highContrast ? 'ON' : 'OFF'}`,
            `Reduced Motion: ${this.game.reducedMotion ? 'ON' : 'OFF'}`
        ];
        
        const buttonHeight = Math.floor(30 * scaleFactor);
        const buttonWidth = Math.floor(250 * scaleFactor);
        
        settingsOptions.forEach((option, index) => {
            const y = overlayY + 80 + (index * 40);
            const isSelected = index === this.settingsSelection;
            
            this.ctx.fillStyle = isSelected ? '#FFE138' : 'rgba(255, 255, 255, 0.1)';
            this.ctx.fillRect(centerX - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight);
            
            this.ctx.strokeStyle = isSelected ? '#FF8E0D' : '#666';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(centerX - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight);
            
            this.ctx.fillStyle = isSelected ? '#000' : '#FFF';
            this.ctx.fillText(option, centerX, y + 4);
            
            // Add click area
            this.buttonAreas.push({
                x: centerX - buttonWidth/2,
                y: y - buttonHeight/2,
                width: buttonWidth,
                height: buttonHeight,
                callback: () => this.handleSettingsSelection(index)
            });
        });
        
        const backY = overlayY + 280;
        const backSelected = this.settingsSelection === 4;
        
        this.ctx.fillStyle = backSelected ? '#FF8E0D' : 'rgba(255, 255, 255, 0.1)';
        this.ctx.fillRect(centerX - 80, backY - 20, 160, 40);
        
        this.ctx.strokeStyle = backSelected ? '#FFE138' : '#666';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(centerX - 80, backY - 20, 160, 40);
        
        this.ctx.font = `${Math.floor(14 * scaleFactor)}px ${FONT_FAMILY}`;
        this.ctx.fillStyle = backSelected ? '#000' : '#FFF';
        this.ctx.fillText('BACK', centerX, backY + 4);
        
        // Add click area for back button
        this.buttonAreas.push({
            x: centerX - 80,
            y: backY - 20,
            width: 160,
            height: 40,
            callback: () => this.handleSettingsSelection(4)
        });
        
        this.ctx.font = `${Math.floor(10 * scaleFactor)}px ${FONT_FAMILY}`;
        this.ctx.fillStyle = '#888888';
        this.ctx.fillText('Use arrow keys or click to navigate • Enter/Click to select • ESC to return', centerX, overlayY + overlayHeight - 15);
    }

    drawCredits() {
        // Draw the game in background first
        this.drawGame();
        
        // Draw overlay
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const scaleFactor = this.blockSize / 30;
        
        const overlayWidth = Math.floor(400 * scaleFactor);
        const overlayHeight = Math.floor(350 * scaleFactor);
        const overlayX = centerX - overlayWidth / 2;
        const overlayY = centerY - overlayHeight / 2;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
        this.ctx.fillRect(overlayX, overlayY, overlayWidth, overlayHeight);
        
        this.ctx.strokeStyle = '#FFE138';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(overlayX, overlayY, overlayWidth, overlayHeight);
        
        this.ctx.textAlign = 'center';
        
        this.ctx.font = `bold ${Math.floor(24 * scaleFactor)}px ${FONT_FAMILY}`;
        this.ctx.fillStyle = '#FFE138';
        this.ctx.fillText('CREDITS', centerX, overlayY + 40);
        
        this.ctx.font = `${Math.floor(14 * scaleFactor)}px ${FONT_FAMILY}`;
        this.ctx.fillStyle = '#FFF';
        this.ctx.fillText('TETRIS was created by', centerX, overlayY + 80);
        this.ctx.font = `bold ${Math.floor(16 * scaleFactor)}px ${FONT_FAMILY}`;
        this.ctx.fillStyle = '#FFE138';
        this.ctx.fillText('ALEXEY PAJITNOV', centerX, overlayY + 100);
        this.ctx.font = `${Math.floor(14 * scaleFactor)}px ${FONT_FAMILY}`;
        this.ctx.fillStyle = '#FFF';
        this.ctx.fillText('in 1984', centerX, overlayY + 120);
        
        this.ctx.font = `${Math.floor(12 * scaleFactor)}px ${FONT_FAMILY}`;
        this.ctx.fillStyle = '#CCC';
        this.ctx.fillText('Original concept and gameplay', centerX, overlayY + 160);
        this.ctx.fillText('© The Tetris Company', centerX, overlayY + 180);
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.fillRect(centerX - 120, overlayY + 200, 240, 60);
        this.ctx.strokeStyle = '#666';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(centerX - 120, overlayY + 200, 240, 60);
        
        this.ctx.font = `${Math.floor(12 * scaleFactor)}px ${FONT_FAMILY}`;
        this.ctx.fillStyle = '#FFE138';
        this.ctx.fillText('This implementation:', centerX, overlayY + 220);
        this.ctx.font = `${Math.floor(10 * scaleFactor)}px ${FONT_FAMILY}`;
        this.ctx.fillStyle = '#FFF';
        this.ctx.fillText('NO LICENSE', centerX, overlayY + 240);
        this.ctx.fillText('Do whatever you want with it!', centerX, overlayY + 255);
        
        this.ctx.font = `${Math.floor(10 * scaleFactor)}px ${FONT_FAMILY}`;
        this.ctx.fillStyle = '#888888';
        this.ctx.fillText('Click anywhere to return • Press ESC to go back', centerX, overlayY + overlayHeight - 15);
    }

    drawLogPanel() {
        if (!this.game.logVisible) return;

        const logPanelWidth = Math.min(400, this.canvas.width * 0.3);
        const logPanelHeight = this.canvas.height - 60;
        const logPanelX = this.canvas.width - logPanelWidth;
        const logPanelY = 60;
        const scaleFactor = this.blockSize / 30;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
        this.ctx.fillRect(logPanelX, logPanelY, logPanelWidth, logPanelHeight);
        
        this.ctx.strokeStyle = '#FFE138';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(logPanelX, logPanelY, logPanelWidth, logPanelHeight);
        
        this.ctx.fillStyle = '#FFE138';
        this.ctx.font = `bold ${Math.floor(16 * scaleFactor)}px ${FONT_FAMILY}`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME LOG', logPanelX + logPanelWidth / 2, logPanelY + 25);
        
        this.ctx.fillStyle = '#888';
        this.ctx.font = `${Math.floor(12 * scaleFactor)}px ${FONT_FAMILY}`;
        this.ctx.fillText(`Level: ${this.game.logLevel}`, logPanelX + logPanelWidth / 2, logPanelY + 45);
        
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = `${Math.floor(10 * scaleFactor)}px ${FONT_FAMILY}`;
        this.ctx.textAlign = 'left';
        
        const logStartY = logPanelY + 60;
        const lineHeight = Math.floor(12 * scaleFactor);
        const maxLines = Math.floor((logPanelHeight - 100) / lineHeight);
        
        const startIndex = Math.max(0, this.game.gameLog.length - maxLines);
        const visibleLogs = this.game.gameLog.slice(startIndex);
        
        visibleLogs.forEach((logEntry, index) => {
            const y = logStartY + (index * lineHeight);
            
            const maxWidth = logPanelWidth - 20;
            const words = logEntry.split(' ');
            let line = '';
            let lineY = y;
            
            for (let i = 0; i < words.length; i++) {
                const testLine = line + words[i] + ' ';
                const testWidth = this.ctx.measureText(testLine).width;
                
                if (testWidth > maxWidth && i > 0) {
                    this.ctx.fillText(line, logPanelX + 10, lineY);
                    line = words[i] + ' ';
                    lineY += lineHeight;
                } else {
                    line = testLine;
                }
            }
            this.ctx.fillText(line, logPanelX + 10, lineY);
        });
        
        this.ctx.fillStyle = '#888';
        this.ctx.font = `${Math.floor(10 * scaleFactor)}px ${FONT_FAMILY}`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText('TAB: Toggle | 1-9: Level', logPanelX + logPanelWidth / 2, logPanelY + logPanelHeight - 10);
    }

    drawGame() {
        const topBarHeight = 60;
        this.ctx.save();
        this.ctx.translate(0, topBarHeight);
        
        this.drawBoard();
        if (this.game.ghostEnabled) {
            this.drawGhostPiece();
        }
        // Only draw the piece if it exists (not null during line clearing)
        if (this.game.piece) {
            this.drawPiece(this.game.piece);
        }
        this.drawUI();
        
        this.ctx.restore();
        
        if (this.game.logVisible) {
            this.drawLogPanel();
        }
    }

    drawUI() {
        const gameAreaWidth = COLS * this.blockSize;
        const lineX = gameAreaWidth + 1;
        const scaleFactor = this.blockSize / 30;
        
        const uiX = gameAreaWidth + 20;
        
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(lineX - 2, 0, 2, ROWS * this.blockSize);

        this.ctx.fillStyle = 'white';
        
        this.ctx.font = `${Math.floor(10 * scaleFactor)}px ${FONT_FAMILY}`;
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`Step: ${this.game.stepCounter}`, this.canvas.width - (this.game.logVisible ? Math.min(400, this.canvas.width * 0.3) : 0) - 10, 15);
        
        this.ctx.textAlign = 'left';
        
        // Score section
        this.ctx.font = `${Math.floor(12 * scaleFactor)}px ${FONT_FAMILY}`;
        this.ctx.fillText(`SCORE`, uiX, 40);
        this.ctx.font = `${Math.floor(16 * scaleFactor)}px ${FONT_FAMILY}`;
        this.ctx.fillText(`${this.game.score}`, uiX, 65);
        
        // Separator line
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(uiX, 80, 120, 2);
        this.ctx.fillStyle = 'white';
        
        // Lines section
        this.ctx.font = `${Math.floor(12 * scaleFactor)}px ${FONT_FAMILY}`;
        this.ctx.fillText(`LINES`, uiX, 100);
        this.ctx.font = `${Math.floor(16 * scaleFactor)}px ${FONT_FAMILY}`;
        this.ctx.fillText(`${this.game.lines}`, uiX, 125);

        // Separator line
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(uiX, 140, 120, 2);
        this.ctx.fillStyle = 'white';

        // Level section
        this.ctx.font = `${Math.floor(12 * scaleFactor)}px ${FONT_FAMILY}`;
        this.ctx.fillText(`LEVEL`, uiX, 160);
        this.ctx.font = `${Math.floor(16 * scaleFactor)}px ${FONT_FAMILY}`;
        this.ctx.fillText(`${this.game.level}`, uiX, 185);
        
        // Separator line
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(uiX, 200, 120, 2);
        this.ctx.fillStyle = 'white';

        // Next piece section
        this.ctx.font = `${Math.floor(12 * scaleFactor)}px ${FONT_FAMILY}`;
        this.ctx.fillText('NEXT', uiX, 220);
        if (this.game.next) {
            this.ctx.save();
            this.ctx.translate(uiX, 235);
            const tempPiece = { ...this.game.next, x: 0, y: 0 };
            this.drawPiece(tempPiece);
            this.ctx.restore();
        }

        // Controls section - moved to bottom of sidebar
        const controlsY = ROWS * this.blockSize - 180;
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(uiX, controlsY - 10, 120, 2);
        this.ctx.fillStyle = 'white';

        this.ctx.font = `bold ${Math.floor(12 * scaleFactor)}px ${FONT_FAMILY}`;
        this.ctx.fillText('CONTROLS', uiX, controlsY + 10);
        
        this.ctx.font = `${Math.floor(10 * scaleFactor)}px ${FONT_FAMILY}`;
        this.ctx.fillText('Move:  Arrows/A,D,J,L', uiX, controlsY + 30);
        this.ctx.fillText('Rotate:   Up/W/I', uiX, controlsY + 50);
        this.ctx.fillText('Drop:   Down/S/K', uiX, controlsY + 70);
        this.ctx.fillText('Hard:     Spacebar', uiX, controlsY + 90);
        this.ctx.fillText('Pause: F/;/Shift', uiX, controlsY + 110);
        this.ctx.fillText('Restart:      R', uiX, controlsY + 130);
        this.ctx.fillText('Log:         TAB', uiX, controlsY + 150);

        if (this.game.gameOver) {
            const boardWidthPx = COLS * this.blockSize;
            const boardHeightPx = ROWS * this.blockSize;
            this.ctx.fillStyle = 'rgba(0,0,0,0.75)';
            this.ctx.fillRect(0, 0, boardWidthPx, boardHeightPx);
            
            this.ctx.fillStyle = 'white';
            this.ctx.textAlign = 'center';
            this.ctx.font = `bold ${Math.floor(30 * scaleFactor)}px ${FONT_FAMILY}`;
            this.ctx.fillText('GAME OVER', boardWidthPx / 2, boardHeightPx / 2 - 20);
            
            this.ctx.font = `${Math.floor(12 * scaleFactor)}px ${FONT_FAMILY}`;
            this.ctx.fillText('Press "R" to Restart', boardWidthPx / 2, boardHeightPx / 2 + 20);
        }

        if (this.game.isPaused) {
            const boardWidthPx = COLS * this.blockSize;
            const boardHeightPx = ROWS * this.blockSize;
            this.ctx.fillStyle = 'rgba(0,0,0,0.75)';
            this.ctx.fillRect(0, 0, boardWidthPx, boardHeightPx);
            
            this.ctx.fillStyle = 'white';
            this.ctx.textAlign = 'center';
            this.ctx.font = `bold ${Math.floor(30 * scaleFactor)}px ${FONT_FAMILY}`;
            this.ctx.fillText('PAUSED', boardWidthPx / 2, boardHeightPx / 2);
        }
    }

    drawBoard() {
        const currentColors = this.game.getCurrentColors();
        this.game.board.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0) {
                    this.drawBlock(x, y, currentColors[value]);
                }
            });
        });
    }

    drawGhostPiece() {
        const ghost = this.game.getGhostPiece();
        if (!ghost) return;
        
        const originalColor = ghost.color;
        const r = parseInt(originalColor.slice(1, 3), 16);
        const g = parseInt(originalColor.slice(3, 5), 16);
        const b = parseInt(originalColor.slice(5, 7), 16);
        const transparentColor = `rgba(${r}, ${g}, ${b}, 0.3)`;

        ghost.color = transparentColor;
        this.drawPiece(ghost, true);
    }

    drawPiece(piece, isGhost = false) {
        if (!piece) return;
        
        const currentColors = this.game.getCurrentColors();
        let color = piece.color;
        
        // Don't apply clearing animation to pieces - only board blocks get animated
        if (this.game.highContrast && !isGhost) {
            color = '#FFFFFF';
        }
        
        piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0) {
                    this.drawBlock(piece.x + x, piece.y + y, color, isGhost);
                }
            });
        });
    }

    drawBlock(x, y, color, isGhost = false) {
        // Handle line clearing animation
        if (this.game.isClearing && this.game.linesBeingCleared.includes(y)) {
            if (this.game.reducedMotion) {
                color = '#FFFFFF';
            } else {
                const flash = Math.floor(this.lineClearTimer / 100) % 2 === 0;
                color = flash ? '#FFFFFF' : '#888888';
            }
        }
        
        // Handle high contrast mode
        if (this.game.highContrast && !isGhost) {
            color = '#FFFFFF';
        }
        
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize);
        
        if (!isGhost) {
            this.ctx.strokeStyle = '#222';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize);
        }
    }
    
    handleKeyPress(e) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}]:renderer/input:Key pressed: ${e.key}`);
        
        // Initialize audio context on first user interaction
        if (this.game.soundManager.audioContext && this.game.soundManager.audioContext.state === 'suspended') {
            this.game.soundManager.audioContext.resume();
        }
        
        const key = e.key.toLowerCase();
        
        // Handle numeric keys for log level
        if (key >= '1' && key <= '9') {
            this.game.logLevel = parseInt(key);
            this.addToLog(`Log level set to ${this.game.logLevel}`, 1);
            return;
        }
        
        // Handle different game states
        if (this.gameState === GAME_STATE.SETTINGS) {
            this.handleSettingsKeyPress(e);
            return;
        }
        
        if (this.gameState === GAME_STATE.CREDITS) {
            if (KEY.ESCAPE.includes(key)) {
                this.gameState = GAME_STATE.PLAYING;
                this.addToLog('Exited credits', 2);
            }
            return;
        }
        
        // Main game controls
        if (KEY.TOGGLE_LOG.includes(key)) {
            this.game.logVisible = !this.game.logVisible;
            this.addToLog(`Log panel ${this.game.logVisible ? 'shown' : 'hidden'}`, 2);
            this.resizeCanvas();
            return;
        }
        
        if (KEY.R.includes(key)) {
            this.game.reset();
            this.addToLog('Game reset', 2);
            return;
        }
        
        if (KEY.PAUSE.includes(key)) {
            this.game.isPaused = !this.game.isPaused;
            this.addToLog(`Game ${this.game.isPaused ? 'paused' : 'resumed'}`, 2);
            return;
        }
        
        if (KEY.TOGGLE_GHOST.includes(key)) {
            this.game.ghostEnabled = !this.game.ghostEnabled;
            this.addToLog(`Ghost pieces ${this.game.ghostEnabled ? 'enabled' : 'disabled'}`, 2);
            return;
        }
        
        if (KEY.TOGGLE_SOUND.includes(key)) {
            const soundEnabled = this.game.soundManager.toggle();
            this.addToLog(`Sound ${soundEnabled ? 'enabled' : 'disabled'}`, 2);
            return;
        }
        
        if (this.game.gameOver || this.game.isPaused) {
            return;
        }
        
        // Game piece controls
        if (KEY.LEFT.includes(key)) {
            this.handleGameInput('left');
        } else if (KEY.RIGHT.includes(key)) {
            this.handleGameInput('right');
        } else if (KEY.DOWN.includes(key)) {
            this.handleGameInput('down');
        } else if (KEY.UP.includes(key)) {
            this.handleGameInput('rotate');
        } else if (KEY.SPACE.includes(key)) {
            this.handleGameInput('hardDrop');
        }
    }

    handleSettingsKeyPress(e) {
        const key = e.key.toLowerCase();
        
        if (KEY.ESCAPE.includes(key)) {
            this.gameState = GAME_STATE.PLAYING;
            this.addToLog('Exited settings', 2);
            return;
        }
        
        if (key === 'arrowup') {
            this.settingsSelection = Math.max(0, this.settingsSelection - 1);
        } else if (key === 'arrowdown') {
            this.settingsSelection = Math.min(4, this.settingsSelection + 1);
        } else if (KEY.ENTER.includes(key)) {
            this.handleSettingsSelection(this.settingsSelection);
        }
    }

    handleSettingsSelection(index) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}]:renderer/input:Settings selection: ${index}`);
        
        switch (index) {
            case 0:
                this.game.ghostEnabled = !this.game.ghostEnabled;
                this.addToLog(`Ghost pieces ${this.game.ghostEnabled ? 'enabled' : 'disabled'}`, 2);
                break;
            case 1:
                this.game.monochromeMode = !this.game.monochromeMode;
                this.addToLog(`Monochrome mode ${this.game.monochromeMode ? 'enabled' : 'disabled'}`, 2);
                break;
            case 2:
                this.game.highContrast = !this.game.highContrast;
                this.addToLog(`High contrast ${this.game.highContrast ? 'enabled' : 'disabled'}`, 2);
                break;
            case 3:
                this.game.reducedMotion = !this.game.reducedMotion;
                this.addToLog(`Reduced motion ${this.game.reducedMotion ? 'enabled' : 'disabled'}`, 2);
                break;
            case 4:
                this.gameState = GAME_STATE.PLAYING;
                this.addToLog('Exited settings', 2);
                break;
        }
    }

    handleGameInput(action) {
        if (this.game.gameOver || this.game.isPaused || this.game.isClearing) {
            return;
        }
        
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}]:renderer/input:Game input: ${action}`);
        
        switch (action) {
            case 'left':
                this.game.move({ ...this.game.piece, x: this.game.piece.x - 1 });
                this.handlePostMove();
                break;
            case 'right':
                this.game.move({ ...this.game.piece, x: this.game.piece.x + 1 });
                this.handlePostMove();
                break;
            case 'down':
                this.game.drop();
                this.handlePostMove();
                break;
            case 'rotate':
                this.game.rotate();
                this.handlePostMove();
                break;
            case 'hardDrop':
                this.game.hardDrop();
                this.handlePostMove();
                break;
        }
    }

    destroy() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }
}