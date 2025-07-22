/**
 * WARNING: This file must NOT contain any HTML elements or style code.
 * All rendering is done solely through JavaScript drawing commands on a viewport.
 * Do NOT create, modify, or reference any DOM elements other than the base canvas.
 * Keep this file strictly free of markup and styling code.
 */

// Browser detection utilities only
export class BrowserRedirect {
    constructor() {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}]:dom/browser:BrowserRedirect initialized`);
        
        this.userAgent = navigator.userAgent;
        this.isFirefox = this.userAgent.includes('Firefox');
        this.isChrome = this.userAgent.includes('Chrome') && !this.userAgent.includes('Edge');
        this.isEdge = this.userAgent.includes('Edge') || this.userAgent.includes('Edg/');
        this.isBrave = this.userAgent.includes('Brave') || navigator.brave;
        this.isOpera = this.userAgent.includes('Opera') || this.userAgent.includes('OPR');
        this.isSafari = this.userAgent.includes('Safari') && !this.userAgent.includes('Chrome');
        
        console.log(`[${timestamp}]:dom/browser:Browser detected: ${this.getBrowserName()}`);
    }

    getBrowserName() {
        if (this.isFirefox) return 'Firefox';
        if (this.isChrome) return 'Chrome';
        if (this.isEdge) return 'Edge';
        if (this.isBrave) return 'Brave';
        if (this.isOpera) return 'Opera';
        if (this.isSafari) return 'Safari';
        return 'Unknown';
    }

    redirectToNewTab() {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}]:dom/browser:Attempting to redirect to new tab`);
        
        try {
            if (this.isFirefox) {
                window.location.href = 'about:newtab';
            } else if (this.isEdge) {
                window.location.href = 'edge://newtab/';
            } else if (this.isBrave) {
                window.location.href = 'brave://newtab/';
            } else if (this.isOpera) {
                window.location.href = 'opera://newtab/';
            } else if (this.isChrome) {
                window.location.href = 'chrome://newtab/';
            } else if (this.isSafari) {
                window.location.href = 'about:blank';
            } else {
                try {
                    window.location.href = 'chrome://newtab/';
                } catch (e) {
                    window.location.href = 'about:newtab';
                }
            }
            console.log(`[${timestamp}]:dom/browser:Redirect successful`);
        } catch (error) {
            console.warn(`[${timestamp}]:dom/browser:Unable to redirect to new tab page:`, error);
            window.open('about:blank', '_self');
        }
    }
}

export function initializeDOM() {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}]:dom/init:Initializing DOM`);
    
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    
    console.log(`[${timestamp}]:dom/init:DOM initialized successfully`);
    return canvas;
}