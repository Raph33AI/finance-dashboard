/**
 * ═══════════════════════════════════════════════════════════════════
 * FLOW DIAGRAM ENGINE - Interactive SVG Flow Diagrams
 * Replaces ASCII diagrams with modern animated visualizations
 * ═══════════════════════════════════════════════════════════════════
 */

class FlowDiagramEngine {
    constructor(containerId, flowData) {
        this.container = document.getElementById(containerId);
        this.flowData = flowData;
        this.stepWidth = 280;
        this.stepHeight = 140;
        this.verticalGap = 80;
        this.horizontalGap = 40;
    }

    render() {
        if (!this.container) {
            console.error('Container not found:', this.containerId);
            return;
        }

        const totalHeight = (this.flowData.steps.length * (this.stepHeight + this.verticalGap)) + 100;
        
        const svgHTML = `
            <div class="flow-diagram-container" style="background: white; border-radius: 20px; padding: 40px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12); margin: 30px 0;">
                <div class="flow-header" style="margin-bottom: 30px; text-align: center;">
                    <div style="display: inline-flex; align-items: center; gap: 12px; background: ${this.flowData.color}15; padding: 12px 24px; border-radius: 12px; border: 2px solid ${this.flowData.color};">
                        <i class="${this.flowData.icon}" style="font-size: 1.5rem; color: ${this.flowData.color};"></i>
                        <h3 style="margin: 0; font-size: 1.4rem; color: #1e293b; font-weight: 800;">${this.flowData.name}</h3>
                    </div>
                    <div style="margin-top: 12px; color: #64748b; font-size: 0.95rem;">
                        <i class="fas fa-clock"></i> Total Duration: <strong style="color: ${this.flowData.color};">${this.flowData.totalDuration}</strong>
                    </div>
                </div>
                <svg width="100%" height="${totalHeight}" viewBox="0 0 ${this.stepWidth + 100} ${totalHeight}" style="overflow: visible;">
                    ${this.renderSteps()}
                </svg>
            </div>
        `;

        this.container.innerHTML = svgHTML;
        this.addInteractivity();
    }

    renderSteps() {
        let svg = '';
        const centerX = (this.stepWidth + 100) / 2;

        this.flowData.steps.forEach((step, index) => {
            const y = index * (this.stepHeight + this.verticalGap) + 50;
            
            // Arrow connector (except for first step)
            if (index > 0) {
                const prevY = (index - 1) * (this.stepHeight + this.verticalGap) + 50 + this.stepHeight;
                svg += this.renderArrow(centerX, prevY, centerX, y, this.flowData.color);
            }

            // Step box
            svg += this.renderStepBox(step, centerX - this.stepWidth / 2, y, index);
        });

        return svg;
    }

    renderArrow(x1, y1, x2, y2, color) {
        const midY = (y1 + y2) / 2;
        return `
            <g class="flow-arrow" style="opacity: 0; animation: fadeInArrow 0.6s ease forwards; animation-delay: ${y1 / 200}s;">
                <defs>
                    <marker id="arrowhead-${color.replace('#', '')}" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                        <polygon points="0 0, 10 3, 0 6" fill="${color}" />
                    </marker>
                </defs>
                <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
                    stroke="${color}" stroke-width="3" 
                    stroke-dasharray="8,4"
                    marker-end="url(#arrowhead-${color.replace('#', '')})"
                    style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));" />
                <circle cx="${x1}" cy="${midY}" r="4" fill="${color}" opacity="0.8">
                    <animate attributeName="cy" from="${y1}" to="${y2}" dur="2s" repeatCount="indefinite" />
                </circle>
            </g>
        `;
    }

    renderStepBox(step, x, y, index) {
        const gradient = `gradient-${step.id}-${index}`;
        const detailsHTML = step.details.map(d => `<tspan x="20" dy="18" style="font-size: 11px; fill: #475569;">• ${d}</tspan>`).join('');

        return `
            <g class="flow-step" data-step="${step.id}" style="cursor: pointer; opacity: 0; animation: fadeInStep 0.6s ease forwards; animation-delay: ${index * 0.15}s;">
                <defs>
                    <linearGradient id="${gradient}" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color: ${this.flowData.color}; stop-opacity: 0.1" />
                        <stop offset="100%" style="stop-color: ${this.flowData.color}; stop-opacity: 0.05" />
                    </linearGradient>
                    <filter id="shadow-${step.id}">
                        <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.15"/>
                    </filter>
                </defs>
                
                <!-- Main box -->
                <rect x="${x}" y="${y}" width="${this.stepWidth}" height="${this.stepHeight}" 
                    rx="16" ry="16" 
                    fill="url(#${gradient})" 
                    stroke="${this.flowData.color}" 
                    stroke-width="2"
                    filter="url(#shadow-${step.id})"
                    class="step-rect" />
                
                <!-- Step number badge -->
                <circle cx="${x + 20}" cy="${y + 20}" r="16" fill="${this.flowData.color}" opacity="0.9">
                    <animate attributeName="r" values="16;18;16" dur="2s" repeatCount="indefinite" />
                </circle>
                <text x="${x + 20}" y="${y + 26}" text-anchor="middle" fill="white" font-weight="700" font-size="14">${step.id}</text>
                
                <!-- Icon -->
                <foreignObject x="${x + this.stepWidth - 45}" y="${y + 10}" width="35" height="35">
                    <div xmlns="http://www.w3.org/1999/xhtml" style="width: 35px; height: 35px; background: ${this.flowData.color}20; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                        <i class="${step.icon}" style="font-size: 18px; color: ${this.flowData.color};"></i>
                    </div>
                </foreignObject>
                
                <!-- Title -->
                <text x="${x + 45}" y="${y + 24}" font-weight="700" font-size="13" fill="#1e293b">${step.title}</text>
                
                <!-- Component -->
                <text x="${x + 20}" y="${y + 50}" font-weight="600" font-size="11" fill="#64748b">${step.component}</text>
                
                <!-- Duration badge -->
                <rect x="${x + this.stepWidth - 80}" y="${y + this.stepHeight - 28}" width="70" height="20" rx="10" fill="${this.flowData.color}" opacity="0.15" />
                <text x="${x + this.stepWidth - 45}" y="${y + this.stepHeight - 14}" text-anchor="middle" font-size="10" font-weight="700" fill="${this.flowData.color}">
                    <tspan>⏱ ${step.duration}</tspan>
                </text>
                
                <!-- Details (hidden by default, shown on hover) -->
                <g class="step-details" style="opacity: 0; pointer-events: none;">
                    <rect x="${x}" y="${y + this.stepHeight + 10}" width="${this.stepWidth}" height="${step.details.length * 18 + 25}" rx="12" fill="white" stroke="${this.flowData.color}" stroke-width="2" filter="url(#shadow-${step.id})" />
                    <text x="${x + 20}" y="${y + this.stepHeight + 30}" font-size="11" font-weight="600" fill="#1e293b">
                        Details:
                        ${detailsHTML}
                    </text>
                </g>
            </g>
        `;
    }

    addInteractivity() {
        const steps = this.container.querySelectorAll('.flow-step');
        
        steps.forEach(step => {
            const rect = step.querySelector('.step-rect');
            const details = step.querySelector('.step-details');
            
            step.addEventListener('mouseenter', () => {
                rect.style.filter = 'drop-shadow(0 8px 24px rgba(0,0,0,0.2))';
                rect.style.transform = 'scale(1.02)';
                rect.style.transformOrigin = 'center';
                if (details) {
                    details.style.opacity = '1';
                    details.style.transition = 'opacity 0.3s ease';
                }
            });
            
            step.addEventListener('mouseleave', () => {
                rect.style.filter = '';
                rect.style.transform = 'scale(1)';
                if (details) {
                    details.style.opacity = '0';
                }
            });

            step.addEventListener('click', () => {
                this.showStepModal(step.dataset.step);
            });
        });
    }

    showStepModal(stepId) {
        const step = this.flowData.steps.find(s => s.id == stepId);
        if (!step) return;

        const modal = document.createElement('div');
        modal.className = 'flow-modal';
        modal.innerHTML = `
            <div class="flow-modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="flow-modal-content">
                <button class="flow-modal-close" onclick="this.closest('.flow-modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
                <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px;">
                    <div style="width: 60px; height: 60px; background: ${this.flowData.color}; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.8rem; font-weight: 800; box-shadow: 0 8px 24px ${this.flowData.color}40;">
                        ${step.id}
                    </div>
                    <div>
                        <h3 style="margin: 0; font-size: 1.6rem; color: #1e293b;">${step.title}</h3>
                        <p style="margin: 4px 0 0; color: #64748b; font-size: 1rem;">${step.component}</p>
                    </div>
                </div>
                
                <div style="background: ${this.flowData.color}10; border-left: 4px solid ${this.flowData.color}; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                        <i class="${step.icon}" style="font-size: 1.3rem; color: ${this.flowData.color};"></i>
                        <strong style="color: #1e293b; font-size: 1.1rem;">Processing Details</strong>
                    </div>
                    <ul style="margin: 0; padding-left: 20px; color: #475569; line-height: 1.8;">
                        ${step.details.map(d => `<li>${d}</li>`).join('')}
                    </ul>
                </div>
                
                <div style="display: flex; gap: 20px;">
                    <div style="flex: 1; background: #f8fafc; border-radius: 12px; padding: 16px; text-align: center;">
                        <div style="font-size: 0.85rem; color: #64748b; margin-bottom: 4px;">Duration</div>
                        <div style="font-size: 1.5rem; font-weight: 800; color: ${this.flowData.color};">
                            <i class="fas fa-clock"></i> ${step.duration}
                        </div>
                    </div>
                    <div style="flex: 1; background: #f8fafc; border-radius: 12px; padding: 16px; text-align: center;">
                        <div style="font-size: 0.85rem; color: #64748b; margin-bottom: 4px;">Step</div>
                        <div style="font-size: 1.5rem; font-weight: 800; color: ${this.flowData.color};">
                            ${step.id} / ${this.flowData.steps.length}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Add CSS if not already present
        if (!document.getElementById('flow-modal-styles')) {
            const style = document.createElement('style');
            style.id = 'flow-modal-styles';
            style.textContent = `
                .flow-modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 10000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.3s ease; }
                .flow-modal-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(8px); }
                .flow-modal-content { position: relative; background: white; border-radius: 24px; padding: 40px; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); animation: slideUp 0.3s ease; }
                .flow-modal-close { position: absolute; top: 20px; right: 20px; background: #f1f5f9; border: none; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; }
                .flow-modal-close:hover { background: #e2e8f0; transform: rotate(90deg); }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeInStep { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes fadeInArrow { from { opacity: 0; } to { opacity: 1; } }
            `;
            document.head.appendChild(style);
        }
    }
}

// Auto-initialize all flows on page load
document.addEventListener('DOMContentLoaded', () => {
    if (typeof DocumentationData !== 'undefined' && DocumentationData.dataFlows) {
        DocumentationData.dataFlows.forEach(flow => {
            const containerId = `flow-${flow.id}`;
            if (document.getElementById(containerId)) {
                new FlowDiagramEngine(containerId, flow).render();
            }
        });
    }
});