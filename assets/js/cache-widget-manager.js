/* ==============================================
   🗄 CACHE WIDGET MANAGER
   Gestion complète du widget de monitoring
   ============================================== */

let cacheWidgetOpen = false;
let cacheStats = {
    hits: 0,
    misses: 0,
    entries: 0,
    size: 0
};

/**
 * Toggle l'affichage du cache widget
 */
function toggleCacheWidget() {
    const widget = document.getElementById('cacheWidget');
    if (!widget) return;
    
    cacheWidgetOpen = !cacheWidgetOpen;
    
    if (cacheWidgetOpen) {
        widget.classList.add('active');
        refreshCacheStats();
    } else {
        widget.classList.remove('active');
    }
}

/**
 * Rafraîchit les statistiques du cache
 */
function refreshCacheStats() {
    console.log('🔄 Refreshing cache stats...');
    
    let entries = 0;
    let totalSize = 0;
    
    // Compter les entrées de cache
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('tp_cache_')) {
            entries++;
            const value = localStorage.getItem(key);
            if (value) {
                totalSize += value.length;
            }
        }
    }
    
    cacheStats.entries = entries;
    cacheStats.size = totalSize;
    
    // Mettre à jour l'UI
    updateCacheUI();
    
    console.log('✅ Cache stats refreshed:', cacheStats);
}

/**
 * Met à jour l'UI avec les stats actuelles
 */
function updateCacheUI() {
    const entriesEl = document.getElementById('cacheEntriesCount');
    const sizeEl = document.getElementById('cacheSize');
    const hitRateEl = document.getElementById('cacheHitRate');
    const badgeEl = document.getElementById('cacheBadge');
    const badgeMiniEl = document.getElementById('cacheBadgeMini');
    
    if (entriesEl) entriesEl.textContent = cacheStats.entries;
    if (sizeEl) sizeEl.textContent = (cacheStats.size / 1024).toFixed(2) + ' KB';
    if (badgeEl) badgeEl.textContent = cacheStats.entries;
    if (badgeMiniEl) badgeMiniEl.textContent = cacheStats.entries;
    
    const total = cacheStats.hits + cacheStats.misses;
    if (total > 0 && hitRateEl) {
        const hitRate = (cacheStats.hits / total * 100).toFixed(1);
        hitRateEl.textContent = hitRate + '%';
    }
}

/**
 * Vide le cache local
 */
function clearLocalCache() {
    if (!confirm('Are you sure you want to clear the local cache? This will remove all cached stock data.')) {
        return;
    }
    
    console.log('🗑 Clearing local cache...');
    
    let cleared = 0;
    const keys = [];
    
    // Collecter toutes les clés de cache
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('tp_cache_')) {
            keys.push(key);
        }
    }
    
    // Supprimer toutes les clés
    keys.forEach(key => {
        localStorage.removeItem(key);
        cleared++;
    });
    
    // Reset des stats
    cacheStats.hits = 0;
    cacheStats.misses = 0;
    
    console.log(`✅ Cleared ${cleared} cache entries`);
    
    refreshCacheStats();
    
    // Notification
    if (window.TrendPrediction && window.TrendPrediction.showNotification) {
        window.TrendPrediction.showNotification(`Cache cleared: ${cleared} entries removed`, 'success');
    } else {
        alert(`Cache cleared: ${cleared} entries removed`);
    }
}

/**
 * Exporte les données du cache en JSON
 */
function exportCacheData() {
    console.log('📤 Exporting cache data...');
    
    const cacheData = {};
    
    // Collecter toutes les données de cache
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('tp_cache_')) {
            try {
                const value = localStorage.getItem(key);
                cacheData[key] = JSON.parse(value);
            } catch (e) {
                cacheData[key] = localStorage.getItem(key);
            }
        }
    }
    
    // Créer l'objet d'export
    const exportObj = {
        exportDate: new Date().toISOString(),
        stats: cacheStats,
        data: cacheData
    };
    
    // Télécharger le fichier JSON
    const json = JSON.stringify(exportObj, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trend_cache_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log('✅ Cache data exported');
    
    if (window.TrendPrediction && window.TrendPrediction.showNotification) {
        window.TrendPrediction.showNotification('Cache data exported successfully!', 'success');
    }
}

/**
 * Met à jour les stats de rate limit
 */
function updateRateLimitStats(remaining, max) {
    const remainingEl = document.getElementById('rateLimitRemaining');
    const progressEl = document.getElementById('rateLimitProgress');
    
    if (remainingEl) {
        remainingEl.textContent = remaining;
    }
    
    if (progressEl) {
        const percentage = (remaining / max) * 100;
        progressEl.style.width = percentage + '%';
        
        // Couleur selon le niveau
        if (percentage > 50) {
            progressEl.style.background = 'linear-gradient(90deg, #10b981, #059669)';
        } else if (percentage > 25) {
            progressEl.style.background = 'linear-gradient(90deg, #f59e0b, #d97706)';
        } else {
            progressEl.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
        }
    }
}

/**
 * Met à jour le statut de la queue
 */
function updateQueueStatus(length, waitTime) {
    const queueEl = document.getElementById('queueLength');
    
    if (queueEl) {
        queueEl.textContent = length;
        
        if (length > 0) {
            queueEl.style.color = '#ef4444';
            queueEl.style.fontWeight = '700';
        } else {
            queueEl.style.color = '';
            queueEl.style.fontWeight = '';
        }
    }
}

/**
 * Ajoute une entrée dans le log d'activité
 */
function logCacheActivity(type, symbol, fromCache) {
    const activityEl = document.getElementById('cacheActivity');
    if (!activityEl) return;
    
    const now = new Date().toLocaleTimeString('fr-FR');
    const icon = fromCache ? '💾' : '🌐';
    const source = fromCache ? 'Cache' : 'API';
    
    const entry = document.createElement('div');
    entry.className = 'cache-activity-entry';
    entry.innerHTML = `
        <span class='cache-activity-time'>${now}</span>
        <span class='cache-activity-icon'>${icon}</span>
        <span class='cache-activity-text'>${type} ${symbol} from ${source}</span>
    `;
    
    // Retirer le message "No recent activity" s'il existe
    const emptyState = activityEl.querySelector('.cache-empty-state');
    if (emptyState) {
        activityEl.innerHTML = '';
    }
    
    // Ajouter la nouvelle entrée au début
    activityEl.insertBefore(entry, activityEl.firstChild);
    
    // Garder seulement les 10 dernières entrées
    while (activityEl.children.length > 10) {
        activityEl.removeChild(activityEl.lastChild);
    }
    
    // Mettre à jour les stats
    if (fromCache) {
        cacheStats.hits++;
    } else {
        cacheStats.misses++;
    }
}

/**
 * Objet global pour le cache widget
 */
window.cacheWidget = {
    updateRateLimitStatus: updateRateLimitStats,
    updateQueueStatus: updateQueueStatus,
    logActivity: logCacheActivity
};

/**
 * Monitoring automatique du cache
 */
setInterval(() => {
    if (cacheWidgetOpen) {
        refreshCacheStats();
    } else {
        // Mise à jour du badge même quand le widget est fermé
        let entries = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('tp_cache_')) {
                entries++;
            }
        }
        const badgeMiniEl = document.getElementById('cacheBadgeMini');
        if (badgeMiniEl) badgeMiniEl.textContent = entries;
    }
}, 5000);

/**
 * Initialisation au chargement de la page
 */
document.addEventListener('DOMContentLoaded', () => {
    refreshCacheStats();
    console.log('✅ Cache Widget Manager initialized');
});

console.log('✅ cache-widget-manager.js loaded');