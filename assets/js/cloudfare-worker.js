/* =====================================================
   CLOUDFLARE WORKER - Finance Dashboard API
   Gestion des simulations ET portfolios multi-utilisateurs
   ===================================================== */

// ========== CONFIGURATION FIREBASE ==========
const FIREBASE_PROJECT_ID = 'financepro-220ba';
const FIREBASE_API_KEY = 'AIzaSyD9kQ3nyYbYMU--_PsMOtuqtMKlt3gmjRM';

// ========== HEADERS CORS ==========
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': 'https://raph33ai.github.io', // ⚠️ En production, remplacer par : 'https://TON-DOMAINE.github.io'
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
};

/**
 * Point d'entrée principal
 */
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

/**
 * Gestion des requêtes
 */
async function handleRequest(request) {
    // Gérer les requêtes OPTIONS (CORS preflight)
    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: CORS_HEADERS });
    }

    try {
        const url = new URL(request.url);
        const path = url.pathname;

        console.log(`📨 Incoming request: ${request.method} ${path}`);

        // ========== ROUTES SIMULATIONS (Dashboard) ==========
        if (path === '/api/simulations' && request.method === 'GET') {
            return await getSimulationsList(request);
        }
        
        if (path === '/api/simulations' && request.method === 'POST') {
            return await createSimulation(request);
        }
        
        if (path.match(/^\/api\/simulations\/[^/]+$/) && request.method === 'GET') {
            return await getSimulation(request);
        }
        
        if (path.match(/^\/api\/simulations\/[^/]+$/) && request.method === 'PUT') {
            return await updateSimulation(request);
        }
        
        if (path.match(/^\/api\/simulations\/[^/]+$/) && request.method === 'DELETE') {
            return await deleteSimulation(request);
        }

        // ========== ✨ ROUTES PORTFOLIOS (Market Data) ✨ ==========
        if (path === '/api/portfolios' && request.method === 'GET') {
            return await getPortfoliosList(request);
        }
        
        if (path === '/api/portfolios' && request.method === 'POST') {
            return await createPortfolio(request);
        }
        
        if (path.match(/^\/api\/portfolios\/[^/]+$/) && request.method === 'GET') {
            return await getPortfolio(request);
        }
        
        if (path.match(/^\/api\/portfolios\/[^/]+$/) && request.method === 'PUT') {
            return await updatePortfolio(request);
        }
        
        if (path.match(/^\/api\/portfolios\/[^/]+$/) && request.method === 'DELETE') {
            return await deletePortfolio(request);
        }

        // Health check endpoint
        if (path === '/health' || path === '/') {
            return jsonResponse({ 
                status: 'ok', 
                message: 'Finance Hub API is running',
                version: '2.0.0',
                features: ['simulations', 'portfolios'],
                timestamp: new Date().toISOString()
            });
        }

        return jsonResponse({ error: 'Route not found' }, 404);

    } catch (error) {
        console.error('❌ Error handling request:', error);
        return jsonResponse({ 
            error: 'Internal server error', 
            message: error.message 
        }, 500);
    }
}

/**
 * Vérifie le token Firebase et retourne l'UID
 */
async function verifyFirebaseToken(request) {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);

    // Vérifier le token avec l'API Firebase
    const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: token })
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Firebase token verification failed:', errorData);
        throw new Error('Invalid Firebase token');
    }

    const data = await response.json();
    
    if (!data.users || data.users.length === 0) {
        throw new Error('User not found');
    }

    const uid = data.users[0].localId;
    console.log(`✅ User authenticated: ${uid}`);
    
    return uid;
}

// =====================================================
// SIMULATIONS ENDPOINTS (Dashboard)
// =====================================================

/**
 * GET /api/simulations - Liste toutes les simulations de l'utilisateur
 */
async function getSimulationsList(request) {
    try {
        const uid = await verifyFirebaseToken(request);
        
        console.log(`📋 Fetching simulations list for user: ${uid}`);
        
        // Lister toutes les clés de l'utilisateur
        const listResult = await SIMULATIONS_KV.list({ 
            prefix: `user:${uid}:simulation:` 
        });
        
        const simulations = listResult.keys.map(key => {
            const name = key.name.replace(`user:${uid}:simulation:`, '');
            return {
                name: name,
                key: key.name,
                metadata: key.metadata || {}
            };
        });

        console.log(`✅ Found ${simulations.length} simulations`);

        return jsonResponse({ 
            success: true, 
            simulations: simulations,
            count: simulations.length
        });

    } catch (error) {
        console.error('❌ Error in getSimulationsList:', error);
        return jsonResponse({ 
            error: 'Authentication failed', 
            message: error.message 
        }, 401);
    }
}

/**
 * GET /api/simulations/:name - Récupère une simulation spécifique
 */
async function getSimulation(request) {
    try {
        const uid = await verifyFirebaseToken(request);
        const url = new URL(request.url);
        const simulationName = decodeURIComponent(url.pathname.split('/').pop());
        
        console.log(`📥 Loading simulation "${simulationName}" for user: ${uid}`);
        
        const key = `user:${uid}:simulation:${simulationName}`;
        const data = await SIMULATIONS_KV.get(key, { type: 'json' });

        if (!data) {
            console.log(`⚠️ Simulation "${simulationName}" not found`);
            return jsonResponse({ 
                error: 'Simulation not found' 
            }, 404);
        }

        console.log(`✅ Simulation "${simulationName}" loaded successfully`);

        return jsonResponse({ 
            success: true, 
            simulation: {
                name: simulationName,
                data: data
            }
        });

    } catch (error) {
        console.error('❌ Error in getSimulation:', error);
        return jsonResponse({ 
            error: 'Authentication failed', 
            message: error.message 
        }, 401);
    }
}

/**
 * POST /api/simulations - Crée une nouvelle simulation
 */
async function createSimulation(request) {
    try {
        const uid = await verifyFirebaseToken(request);
        const body = await request.json();
        
        if (!body.name) {
            return jsonResponse({ 
                error: 'Simulation name is required' 
            }, 400);
        }

        console.log(`➕ Creating simulation "${body.name}" for user: ${uid}`);

        const key = `user:${uid}:simulation:${body.name}`;
        
        // Vérifier si la simulation existe déjà
        const existing = await SIMULATIONS_KV.get(key);
        if (existing) {
            console.log(`⚠️ Simulation "${body.name}" already exists`);
            return jsonResponse({ 
                error: 'Simulation already exists' 
            }, 409);
        }

        const simulationData = {
            monthlyEstYield: body.monthlyEstYield || 8,
            inflationRate: body.inflationRate || 2.5,
            data: body.data || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await SIMULATIONS_KV.put(
            key, 
            JSON.stringify(simulationData),
            {
                metadata: {
                    createdAt: simulationData.createdAt,
                    updatedAt: simulationData.updatedAt,
                    dataCount: simulationData.data.length
                }
            }
        );

        console.log(`✅ Simulation "${body.name}" created successfully`);

        return jsonResponse({ 
            success: true, 
            message: 'Simulation created successfully',
            simulation: {
                name: body.name,
                data: simulationData
            }
        }, 201);

    } catch (error) {
        console.error('❌ Error in createSimulation:', error);
        return jsonResponse({ 
            error: 'Failed to create simulation', 
            message: error.message 
        }, 500);
    }
}

/**
 * PUT /api/simulations/:name - Met à jour une simulation existante
 */
async function updateSimulation(request) {
    try {
        const uid = await verifyFirebaseToken(request);
        const url = new URL(request.url);
        const simulationName = decodeURIComponent(url.pathname.split('/').pop());
        const body = await request.json();
        
        console.log(`📝 Updating simulation "${simulationName}" for user: ${uid}`);
        
        const key = `user:${uid}:simulation:${simulationName}`;
        
        // Vérifier si la simulation existe
        const existing = await SIMULATIONS_KV.get(key, { type: 'json' });
        if (!existing) {
            console.log(`⚠️ Simulation "${simulationName}" not found`);
            return jsonResponse({ 
                error: 'Simulation not found' 
            }, 404);
        }

        const simulationData = {
            monthlyEstYield: body.monthlyEstYield ?? existing.monthlyEstYield,
            inflationRate: body.inflationRate ?? existing.inflationRate,
            data: body.data ?? existing.data,
            createdAt: existing.createdAt,
            updatedAt: new Date().toISOString()
        };

        await SIMULATIONS_KV.put(
            key, 
            JSON.stringify(simulationData),
            {
                metadata: {
                    createdAt: simulationData.createdAt,
                    updatedAt: simulationData.updatedAt,
                    dataCount: simulationData.data.length
                }
            }
        );

        console.log(`✅ Simulation "${simulationName}" updated successfully`);

        return jsonResponse({ 
            success: true, 
            message: 'Simulation updated successfully',
            simulation: {
                name: simulationName,
                data: simulationData
            }
        });

    } catch (error) {
        console.error('❌ Error in updateSimulation:', error);
        return jsonResponse({ 
            error: 'Failed to update simulation', 
            message: error.message 
        }, 500);
    }
}

/**
 * DELETE /api/simulations/:name - Supprime une simulation
 */
async function deleteSimulation(request) {
    try {
        const uid = await verifyFirebaseToken(request);
        const url = new URL(request.url);
        const simulationName = decodeURIComponent(url.pathname.split('/').pop());
        
        console.log(`🗑️ Deleting simulation "${simulationName}" for user: ${uid}`);
        
        const key = `user:${uid}:simulation:${simulationName}`;
        
        await SIMULATIONS_KV.delete(key);

        console.log(`✅ Simulation "${simulationName}" deleted successfully`);

        return jsonResponse({ 
            success: true, 
            message: 'Simulation deleted successfully'
        });

    } catch (error) {
        console.error('❌ Error in deleteSimulation:', error);
        return jsonResponse({ 
            error: 'Failed to delete simulation', 
            message: error.message 
        }, 500);
    }
}

// =====================================================
// ✨ PORTFOLIOS ENDPOINTS (Market Data) ✨
// =====================================================

/**
 * GET /api/portfolios - Liste tous les portfolios de l'utilisateur
 */
async function getPortfoliosList(request) {
    try {
        const uid = await verifyFirebaseToken(request);
        
        console.log(`📋 Fetching portfolios list for user: ${uid}`);
        
        // Lister toutes les clés de l'utilisateur
        const listResult = await SIMULATIONS_KV.list({ 
            prefix: `user:${uid}:portfolio:` 
        });
        
        const portfolios = listResult.keys.map(key => {
            const name = key.name.replace(`user:${uid}:portfolio:`, '');
            return {
                name: name,
                key: key.name,
                metadata: key.metadata || {}
            };
        });

        console.log(`✅ Found ${portfolios.length} portfolios`);

        return jsonResponse({ 
            success: true, 
            portfolios: portfolios,
            count: portfolios.length
        });

    } catch (error) {
        console.error('❌ Error in getPortfoliosList:', error);
        return jsonResponse({ 
            error: 'Authentication failed', 
            message: error.message 
        }, 401);
    }
}

/**
 * GET /api/portfolios/:name - Récupère un portfolio spécifique
 */
async function getPortfolio(request) {
    try {
        const uid = await verifyFirebaseToken(request);
        const url = new URL(request.url);
        const portfolioName = decodeURIComponent(url.pathname.split('/').pop());
        
        console.log(`📥 Loading portfolio "${portfolioName}" for user: ${uid}`);
        
        const key = `user:${uid}:portfolio:${portfolioName}`;
        const data = await SIMULATIONS_KV.get(key, { type: 'json' });

        if (!data) {
            console.log(`⚠️ Portfolio "${portfolioName}" not found`);
            return jsonResponse({ 
                error: 'Portfolio not found' 
            }, 404);
        }

        console.log(`✅ Portfolio "${portfolioName}" loaded successfully`);

        return jsonResponse({ 
            success: true, 
            portfolio: {
                name: portfolioName,
                data: data
            }
        });

    } catch (error) {
        console.error('❌ Error in getPortfolio:', error);
        return jsonResponse({ 
            error: 'Authentication failed', 
            message: error.message 
        }, 401);
    }
}

/**
 * POST /api/portfolios - Crée un nouveau portfolio
 */
async function createPortfolio(request) {
    try {
        const uid = await verifyFirebaseToken(request);
        const body = await request.json();
        
        if (!body.name) {
            return jsonResponse({ 
                error: 'Portfolio name is required' 
            }, 400);
        }

        console.log(`➕ Creating portfolio "${body.name}" for user: ${uid}`);

        const key = `user:${uid}:portfolio:${body.name}`;
        
        // Vérifier si le portfolio existe déjà
        const existing = await SIMULATIONS_KV.get(key);
        if (existing) {
            console.log(`⚠️ Portfolio "${body.name}" already exists`);
            return jsonResponse({ 
                error: 'Portfolio already exists' 
            }, 409);
        }

        const portfolioData = {
            watchlist: body.watchlist || [],
            alerts: body.alerts || [],
            comparisonSymbols: body.comparisonSymbols || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await SIMULATIONS_KV.put(
            key, 
            JSON.stringify(portfolioData),
            {
                metadata: {
                    createdAt: portfolioData.createdAt,
                    updatedAt: portfolioData.updatedAt,
                    watchlistCount: portfolioData.watchlist.length,
                    alertsCount: portfolioData.alerts.length,
                    comparisonCount: portfolioData.comparisonSymbols.length
                }
            }
        );

        console.log(`✅ Portfolio "${body.name}" created successfully`);

        return jsonResponse({ 
            success: true, 
            message: 'Portfolio created successfully',
            portfolio: {
                name: body.name,
                data: portfolioData
            }
        }, 201);

    } catch (error) {
        console.error('❌ Error in createPortfolio:', error);
        return jsonResponse({ 
            error: 'Failed to create portfolio', 
            message: error.message 
        }, 500);
    }
}

/**
 * PUT /api/portfolios/:name - Met à jour un portfolio existant
 */
async function updatePortfolio(request) {
    try {
        const uid = await verifyFirebaseToken(request);
        const url = new URL(request.url);
        const portfolioName = decodeURIComponent(url.pathname.split('/').pop());
        const body = await request.json();
        
        console.log(`📝 Updating portfolio "${portfolioName}" for user: ${uid}`);
        
        const key = `user:${uid}:portfolio:${portfolioName}`;
        
        // Vérifier si le portfolio existe
        const existing = await SIMULATIONS_KV.get(key, { type: 'json' });
        
        // Si le portfolio n'existe pas, le créer (comportement upsert)
        const portfolioData = {
            watchlist: body.watchlist ?? (existing?.watchlist || []),
            alerts: body.alerts ?? (existing?.alerts || []),
            comparisonSymbols: body.comparisonSymbols ?? (existing?.comparisonSymbols || []),
            createdAt: existing?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await SIMULATIONS_KV.put(
            key, 
            JSON.stringify(portfolioData),
            {
                metadata: {
                    createdAt: portfolioData.createdAt,
                    updatedAt: portfolioData.updatedAt,
                    watchlistCount: portfolioData.watchlist.length,
                    alertsCount: portfolioData.alerts.length,
                    comparisonCount: portfolioData.comparisonSymbols.length
                }
            }
        );

        console.log(`✅ Portfolio "${portfolioName}" updated successfully`);

        return jsonResponse({ 
            success: true, 
            message: 'Portfolio updated successfully',
            portfolio: {
                name: portfolioName,
                data: portfolioData
            }
        });

    } catch (error) {
        console.error('❌ Error in updatePortfolio:', error);
        return jsonResponse({ 
            error: 'Failed to update portfolio', 
            message: error.message 
        }, 500);
    }
}

/**
 * DELETE /api/portfolios/:name - Supprime un portfolio
 */
async function deletePortfolio(request) {
    try {
        const uid = await verifyFirebaseToken(request);
        const url = new URL(request.url);
        const portfolioName = decodeURIComponent(url.pathname.split('/').pop());
        
        // Empêcher la suppression du portfolio "default"
        if (portfolioName === 'default') {
            console.log(`⚠️ Cannot delete default portfolio`);
            return jsonResponse({ 
                error: 'Cannot delete default portfolio' 
            }, 403);
        }
        
        console.log(`🗑️ Deleting portfolio "${portfolioName}" for user: ${uid}`);
        
        const key = `user:${uid}:portfolio:${portfolioName}`;
        
        await SIMULATIONS_KV.delete(key);

        console.log(`✅ Portfolio "${portfolioName}" deleted successfully`);

        return jsonResponse({ 
            success: true, 
            message: 'Portfolio deleted successfully'
        });

    } catch (error) {
        console.error('❌ Error in deletePortfolio:', error);
        return jsonResponse({ 
            error: 'Failed to delete portfolio', 
            message: error.message 
        }, 500);
    }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Helper pour créer des réponses JSON
 */
function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status: status,
        headers: {
            'Content-Type': 'application/json',
            ...CORS_HEADERS
        }
    });
}