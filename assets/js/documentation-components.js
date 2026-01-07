/**
 * ═══════════════════════════════════════════════════════════════════
 * DOCUMENTATION COMPONENTS - Dynamic Content Generators
 * Generates all tables, cards, stats, and visualizations
 * ═══════════════════════════════════════════════════════════════════
 */

class DocumentationComponents {
    
    // ===== PRICING PLANS GRID =====
    static generatePricingGrid(plans) {
        const grid = document.createElement('div');
        grid.className = 'pricing-grid';
        grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin: 30px 0;';

        plans.forEach(plan => {
            const card = document.createElement('div');
            card.className = 'pricing-card';
            card.style.cssText = `
                background: white;
                border: 3px solid ${plan.color};
                border-radius: 20px;
                padding: 32px;
                position: relative;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                cursor: pointer;
                overflow: hidden;
            `;

            if (plan.popular || plan.premium) {
                const badge = document.createElement('div');
                badge.style.cssText = `
                    position: absolute;
                    top: 20px;
                    right: -35px;
                    background: ${plan.gradient};
                    color: white;
                    padding: 6px 40px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    transform: rotate(45deg);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                `;
                badge.textContent = plan.badge;
                card.appendChild(badge);
            }

            card.innerHTML += `
                <div style="text-align: center; margin-bottom: 24px;">
                    <div style="width: 80px; height: 80px; margin: 0 auto 16px; background: ${plan.gradient}; border-radius: 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px ${plan.color}40;">
                        <span style="font-size: 2rem; font-weight: 900; color: white;">${plan.name.charAt(0)}</span>
                    </div>
                    <h3 style="font-size: 1.8rem; font-weight: 800; margin: 0 0 8px; color: #1e293b;">${plan.name}</h3>
                    <div style="font-size: 3rem; font-weight: 900; background: ${plan.gradient}; -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 4px;">
                        $${plan.price.amount}
                    </div>
                    <div style="color: #64748b; font-size: 0.9rem; font-weight: 600;">per ${plan.price.interval}</div>
                </div>

                <div style="background: ${plan.color}10; border-radius: 12px; padding: 12px 16px; margin-bottom: 20px; text-align: center;">
                    <div style="font-size: 0.85rem; color: #64748b; margin-bottom: 4px;">Pages Unlocked</div>
                    <div style="font-size: 1.8rem; font-weight: 800; color: ${plan.color};">
                        <i class="fas fa-file-alt"></i> ${plan.pages}
                    </div>
                </div>

                <div style="margin: 20px 0;">
                    <div style="font-weight: 700; color: #1e293b; margin-bottom: 12px; font-size: 0.95rem;">
                        <i class="fas fa-check-circle" style="color: ${plan.color};"></i> Features:
                    </div>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        ${plan.features.map(feature => `
                            <li style="padding: 8px 0; color: #475569; font-size: 0.9rem; display: flex; align-items: start; gap: 8px;">
                                <i class="fas fa-check" style="color: ${plan.color}; margin-top: 4px; flex-shrink: 0;"></i>
                                <span>${feature}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>

                ${plan.stripePriceId ? `
                    <div style="margin-top: 24px; padding-top: 20px; border-top: 2px solid #f1f5f9;">
                        <div style="font-size: 0.8rem; color: #94a3b8; font-family: monospace; word-break: break-all;">
                            Stripe ID: ${plan.stripePriceId}
                        </div>
                    </div>
                ` : ''}
            `;

            // Hover effects
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px) scale(1.02)';
                card.style.boxShadow = `0 20px 60px ${plan.color}30`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
                card.style.boxShadow = 'none';
            });

            grid.appendChild(card);
        });

        return grid;
    }

    // ===== PROMO CODES TABLE =====
    static generatePromoCodesTable(codes) {
        const table = document.createElement('table');
        table.className = 'data-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th style="width: 18%;">Code</th>
                    <th style="width: 15%;">Type</th>
                    <th style="width: 12%;">Value</th>
                    <th style="width: 40%;">Description</th>
                    <th style="width: 15%;">Duration</th>
                </tr>
            </thead>
            <tbody>
                ${codes.map(code => `
                    <tr>
                        <td><code style="background: #f1f5f9; padding: 4px 8px; border-radius: 6px; font-weight: 700; color: #3b82f6;">${code.code}</code></td>
                        <td>${this.getPromoTypeBadge(code.type)}</td>
                        <td><strong>${this.getPromoValue(code)}</strong></td>
                        <td>${code.description}</td>
                        <td><span style="color: #64748b; font-weight: 600;">${code.duration}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        return table;
    }

    static getPromoTypeBadge(type) {
        const badges = {
            percentage: '<span class="badge" style="background: rgba(59, 130, 246, 0.1); color: #3b82f6;">Percentage</span>',
            free: '<span class="badge success" style="background: rgba(16, 185, 129, 0.1); color: #10b981;">Free Access</span>',
            trial: '<span class="badge" style="background: rgba(100, 116, 139, 0.1); color: #64748b;">Trial</span>'
        };
        return badges[type] || type;
    }

    static getPromoValue(code) {
        if (code.type === 'percentage') return `${code.value}%`;
        if (code.type === 'trial') return `${code.value} days`;
        if (code.type === 'free') return 'Lifetime';
        return code.value;
    }

    // ===== WORKERS CARDS =====
    static generateWorkersCards(workers) {
        const container = document.createElement('div');
        container.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(450px, 1fr)); gap: 24px; margin: 30px 0;';

        workers.forEach((worker, index) => {
            const card = document.createElement('div');
            card.className = 'worker-card';
            card.style.cssText = `
                background: white;
                border: 2px solid #e2e8f0;
                border-radius: 20px;
                padding: 28px;
                transition: all 0.3s ease;
                cursor: pointer;
                opacity: 0;
                animation: fadeInUp 0.6s ease forwards;
                animation-delay: ${index * 0.1}s;
            `;

            const gradients = [
                'linear-gradient(135deg, #667eea, #764ba2)',
                'linear-gradient(135deg, #f093fb, #f5576c)',
                'linear-gradient(135deg, #4facfe, #00f2fe)',
                'linear-gradient(135deg, #43e97b, #38f9d7)',
                'linear-gradient(135deg, #fa709a, #fee140)',
                'linear-gradient(135deg, #30cfd0, #330867)'
            ];
            const gradient = gradients[index % gradients.length];

            card.innerHTML = `
                <div style="display: flex; align-items: start; gap: 16px; margin-bottom: 20px;">
                    <div style="width: 60px; height: 60px; background: ${gradient}; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; flex-shrink: 0; box-shadow: 0 8px 24px rgba(0,0,0,0.15);">
                        <i class="fas fa-server"></i>
                    </div>
                    <div style="flex: 1;">
                        <h4 style="margin: 0 0 8px; font-size: 1.3rem; color: #1e293b; font-weight: 800;">${worker.name}</h4>
                        <p style="margin: 0; color: #64748b; font-size: 0.9rem; line-height: 1.5;">${worker.purpose}</p>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px;">
                    <div style="background: #f8fafc; border-radius: 12px; padding: 12px; text-align: center;">
                        <div style="font-size: 0.8rem; color: #64748b; margin-bottom: 4px;">Lines of Code</div>
                        <div style="font-size: 1.5rem; font-weight: 800; background: ${gradient}; -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                            ${worker.lines.toLocaleString()}
                        </div>
                    </div>
                    <div style="background: #f8fafc; border-radius: 12px; padding: 12px; text-align: center;">
                        <div style="font-size: 0.8rem; color: #64748b; margin-bottom: 4px;">Endpoints</div>
                        <div style="font-size: 1.5rem; font-weight: 800; background: ${gradient}; -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                            ${worker.endpoints.length}
                        </div>
                    </div>
                </div>

                <div style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05)); border-radius: 12px; padding: 16px; margin-bottom: 16px;">
                    <div style="font-weight: 700; color: #1e293b; margin-bottom: 12px; font-size: 0.9rem;">
                        <i class="fas fa-plug"></i> Endpoints (${worker.endpoints.length}):
                    </div>
                    <div style="max-height: 180px; overflow-y: auto; padding-right: 8px;">
                        ${worker.endpoints.slice(0, 5).map(endpoint => `
                            <div style="margin: 8px 0; padding: 10px; background: white; border-radius: 8px; border-left: 3px solid ${gradient.split(',')[0].split('(')[1]};">
                                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                                    <span style="background: ${gradient}; color: white; padding: 2px 8px; border-radius: 6px; font-size: 0.7rem; font-weight: 700;">${endpoint.method}</span>
                                    <code style="font-size: 0.85rem; color: #3b82f6; font-weight: 600;">${endpoint.path}</code>
                                </div>
                                <div style="font-size: 0.8rem; color: #64748b; margin-left: 8px;">${endpoint.description}</div>
                            </div>
                        `).join('')}
                        ${worker.endpoints.length > 5 ? `<div style="text-align: center; color: #64748b; font-size: 0.85rem; margin-top: 8px;">+ ${worker.endpoints.length - 5} more endpoints</div>` : ''}
                    </div>
                </div>

                ${worker.bindings && worker.bindings.length > 0 ? `
                    <div style="border-top: 2px solid #f1f5f9; padding-top: 16px;">
                        <div style="font-size: 0.8rem; color: #64748b; margin-bottom: 8px; font-weight: 600;">
                            <i class="fas fa-link"></i> Bindings:
                        </div>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                            ${worker.bindings.map(binding => `
                                <span style="background: #f1f5f9; padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; color: #475569; font-weight: 600; font-family: monospace;">
                                    ${binding}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            `;

            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-6px)';
                card.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
                card.style.borderColor = gradient.split(',')[0].split('(')[1];
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = 'none';
                card.style.borderColor = '#e2e8f0';
            });

            container.appendChild(card);
        });

        // Add animation keyframes
        if (!document.getElementById('worker-animations')) {
            const style = document.createElement('style');
            style.id = 'worker-animations';
            style.textContent = `
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `;
            document.head.appendChild(style);
        }

        return container;
    }

    // ===== STATS GRID =====
    static generateStatsGrid(stats) {
        const grid = document.createElement('div');
        grid.className = 'stats-grid';
        grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 24px 0;';

        Object.entries(stats).forEach(([key, data], index) => {
            const card = document.createElement('div');
            card.className = 'stat-card';
            card.style.cssText = `
                background: white;
                border: 2px solid #e2e8f0;
                border-radius: 16px;
                padding: 24px;
                text-align: center;
                transition: all 0.3s ease;
                cursor: pointer;
                opacity: 0;
                animation: statFadeIn 0.6s ease forwards;
                animation-delay: ${index * 0.1}s;
            `;

            const value = typeof data === 'object' ? data.value : data;
            const label = key.split(/(?=[A-Z])/).join(' ');

            card.innerHTML = `
                <div style="font-size: 3rem; font-weight: 900; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px; font-variant-numeric: tabular-nums;">
                    ${typeof value === 'number' ? value.toLocaleString() : value}
                </div>
                <div style="color: #64748b; font-weight: 600; font-size: 0.95rem; text-transform: capitalize;">
                    ${label}
                </div>
                ${typeof data === 'object' && data.size ? `
                    <div style="margin-top: 8px; font-size: 0.85rem; color: #94a3b8; font-weight: 500;">
                        ${data.size}
                    </div>
                ` : ''}
            `;

            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-4px) scale(1.02)';
                card.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.2)';
                card.style.borderColor = '#667eea';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
                card.style.boxShadow = 'none';
                card.style.borderColor = '#e2e8f0';
            });

            grid.appendChild(card);
        });

        if (!document.getElementById('stat-animations')) {
            const style = document.createElement('style');
            style.id = 'stat-animations';
            style.textContent = `
                @keyframes statFadeIn {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
            `;
            document.head.appendChild(style);
        }

        return grid;
    }

    // ===== TECH STACK CARDS =====
    static generateTechStackCards(stack) {
        const container = document.createElement('div');
        container.className = 'card-grid';
        container.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin: 24px 0;';

        stack.forEach((tech, index) => {
            const card = document.createElement('div');
            card.className = 'service-card';
            card.style.cssText = `
                background: white;
                border: 2px solid #e2e8f0;
                border-radius: 16px;
                padding: 24px;
                transition: all 0.3s ease;
                cursor: pointer;
                opacity: 0;
                animation: slideInUp 0.6s ease forwards;
                animation-delay: ${index * 0.15}s;
            `;

            card.innerHTML = `
                <div style="width: 60px; height: 60px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin-bottom: 16px; color: white; background: ${tech.color}; box-shadow: 0 8px 24px ${tech.color}40;">
                    <i class="${tech.icon}"></i>
                </div>
                <div style="font-size: 1.3rem; font-weight: 700; margin-bottom: 8px; color: #1e293b;">
                    ${tech.name}
                </div>
                <div style="color: #64748b; font-size: 0.95rem; line-height: 1.5; margin-bottom: 16px;">
                    ${tech.description}
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    ${tech.features.map(feature => `
                        <span style="background: ${tech.color}15; color: ${tech.color.split(',')[0].split('(')[1]}; padding: 6px 12px; border-radius: 8px; font-size: 0.8rem; font-weight: 600;">
                            ${feature}
                        </span>
                    `).join('')}
                </div>
            `;

            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-6px)';
                card.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
                card.style.borderColor = tech.color.split(',')[0].split('(')[1];
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = 'none';
                card.style.borderColor = '#e2e8f0';
            });

            container.appendChild(card);
        });

        if (!document.getElementById('slide-animations')) {
            const style = document.createElement('style');
            style.id = 'slide-animations';
            style.textContent = `
                @keyframes slideInUp {
                    from { opacity: 0; transform: translateY(40px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `;
            document.head.appendChild(style);
        }

        return container;
    }
}