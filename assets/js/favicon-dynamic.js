/**
 * ═══════════════════════════════════════════════════════════
 * FAVICON DYNAMIQUE ALPHAVAULT AI
 * Favicon intelligent qui s'adapte au contexte de la page
 * ═══════════════════════════════════════════════════════════
 */

class DynamicFavicon {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 32;
        this.canvas.height = 32;
        this.ctx = this.canvas.getContext('2d');
        this.link = null;
        this.defaultColor1 = '#667eea';
        this.defaultColor2 = '#764ba2';
        
        console.log('🎨 DynamicFavicon: Initialisation...');
        this.init();
    }

    /**
     * Initialisation du favicon
     */
    init() {
        // Trouver le lien favicon existant ou en créer un nouveau
        this.link = document.querySelector("link[rel*='icon']");
        
        if (!this.link) {
            this.link = document.createElement('link');
            this.link.type = 'image/x-icon';
            this.link.rel = 'shortcut icon';
            document.head.appendChild(this.link);
            console.log('✅ DynamicFavicon: Nouveau lien créé');
        } else {
            console.log('✅ DynamicFavicon: Lien existant trouvé');
        }
        
        // Dessiner le favicon initial
        this.draw();
        console.log('🎉 DynamicFavicon: Initialisé avec succès !');
    }

    /**
     * Dessiner le favicon de base
     * @param {string} color1 - Couleur de début du gradient
     * @param {string} color2 - Couleur de fin du gradient
     */
    draw(color1 = this.defaultColor1, color2 = this.defaultColor2) {
        const ctx = this.ctx;
        const size = 32;
        
        // Effacer le canvas
        ctx.clearRect(0, 0, size, size);
        
        // ═══ FOND CIRCULAIRE ═══
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.arc(16, 16, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // ═══ GRADIENT POUR LE GRAPHIQUE ═══
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        
        // ═══ LIGNE DU GRAPHIQUE ═══
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.moveTo(4, 26);   // Point de départ
        ctx.lineTo(8, 22);   // Point 1
        ctx.lineTo(12, 24);  // Point 2
        ctx.lineTo(16, 19);  // Point 3
        ctx.lineTo(20, 21);  // Point 4
        ctx.lineTo(24, 14);  // Point 5
        ctx.lineTo(28, 9);   // Point final
        ctx.stroke();
        
        // ═══ POINTS DE DONNÉES ═══
        const points = [
            { x: 8, y: 22, color: color1 },
            { x: 16, y: 19, color: this.blendColors(color1, color2, 0.5) },
            { x: 24, y: 14, color: color2 }
        ];
        
        points.forEach(point => {
            ctx.fillStyle = point.color;
            ctx.beginPath();
            ctx.arc(point.x, point.y, 1.8, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // ═══ POINT FINAL AVEC HALO ═══
        ctx.fillStyle = '#a78bfa';
        ctx.shadowColor = '#a78bfa';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(28, 9, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // ═══ FLÈCHE MONTANTE ═══
        ctx.strokeStyle = '#a78bfa';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(26, 11);
        ctx.lineTo(28, 9);
        ctx.lineTo(26, 7);
        ctx.stroke();
        
        // Mettre à jour le favicon
        this.updateFavicon();
    }

    /**
     * Mettre à jour le favicon dans le DOM
     */
    updateFavicon() {
        this.link.href = this.canvas.toDataURL('image/png');
    }

    /**
     * Changer les couleurs du favicon
     * @param {string} color1 - Première couleur
     * @param {string} color2 - Deuxième couleur
     */
    setColors(color1, color2) {
        console.log(`🎨 Changement de couleurs: ${color1} → ${color2}`);
        this.draw(color1, color2);
    }

    /**
     * Afficher un badge de notification
     * @param {number} count - Nombre de notifications
     */
    notify(count = 1) {
        console.log(`🔔 Notification: ${count}`);
        
        // Redessiner le favicon de base
        this.draw();
        
        const ctx = this.ctx;
        
        if (count > 0) {
            // Badge rouge
            ctx.fillStyle = '#ef4444';
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(24, 8, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Bordure blanche
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(24, 8, 6, 0, Math.PI * 2);
            ctx.stroke();
            
            // Texte du compteur
            ctx.fillStyle = 'white';
            ctx.font = 'bold 9px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(count > 9 ? '9+' : count.toString(), 24, 8);
        }
        
        this.updateFavicon();
    }

    /**
     * Afficher une barre de progression
     * @param {number} percent - Pourcentage (0-100)
     */
    progress(percent) {
        // Redessiner le favicon de base
        this.draw();
        
        const ctx = this.ctx;
        
        // Arc de progression vert
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(16, 16, 14, -Math.PI / 2, 
                -Math.PI / 2 + (Math.PI * 2 * percent / 100));
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        this.updateFavicon();
    }

    /**
     * Mode "Alert" - Favicon rouge clignotant
     */
    alert() {
        console.log('⚠️ Mode Alert activé');
        this.setColors('#ef4444', '#dc2626');
    }

    /**
     * Mode "Success" - Favicon vert
     */
    success() {
        console.log('✅ Mode Success activé');
        this.setColors('#10b981', '#059669');
    }

    /**
     * Mode "Dark" - Adaptation au mode sombre
     */
    darkMode() {
        console.log('🌙 Mode Dark activé');
        this.setColors('#818cf8', '#c084fc');
    }

    /**
     * Mode "Light" - Retour aux couleurs par défaut
     */
    lightMode() {
        console.log('☀️ Mode Light activé');
        this.draw();
    }

    /**
     * Restaurer le favicon par défaut
     */
    reset() {
        console.log('🔄 Reset du favicon');
        this.draw();
    }

    /**
     * Mélanger deux couleurs
     * @param {string} color1 - Première couleur hex
     * @param {string} color2 - Deuxième couleur hex
     * @param {number} ratio - Ratio de mélange (0-1)
     * @returns {string} Couleur mélangée
     */
    blendColors(color1, color2, ratio) {
        const hex = (color) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        };
        
        const c1 = hex(color1);
        const c2 = hex(color2);
        
        if (!c1 || !c2) return color1;
        
        const r = Math.round(c1.r + (c2.r - c1.r) * ratio);
        const g = Math.round(c1.g + (c2.g - c1.g) * ratio);
        const b = Math.round(c1.b + (c2.b - c1.b) * ratio);
        
        return `rgb(${r}, ${g}, ${b})`;
    }
}

// ═══════════════════════════════════════════════════════════
// INITIALISATION AUTOMATIQUE
// ═══════════════════════════════════════════════════════════

(function() {
    'use strict';
    
    // Attendre que le DOM soit chargé
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFavicon);
    } else {
        initFavicon();
    }
    
    function initFavicon() {
        // Créer l'instance globale
        window.dynamicFavicon = new DynamicFavicon();
        
        // Adapter au mode sombre si actif
        if (document.body.classList.contains('dark-mode')) {
            window.dynamicFavicon.darkMode();
        }
        
        // Écouter les changements de mode sombre
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    if (document.body.classList.contains('dark-mode')) {
                        window.dynamicFavicon.darkMode();
                    } else {
                        window.dynamicFavicon.lightMode();
                    }
                }
            });
        });
        
        observer.observe(document.body, { attributes: true });
        
        console.log('💡 Favicon dynamique prêt ! Utilisez window.dynamicFavicon');
    }
})();