/**
 * ═══════════════════════════════════════════════════════════════════
 * 🧬 FORM 4 XML PARSER - AlphaVault AI
 * ═══════════════════════════════════════════════════════════════════
 * Parser ultra-performant pour extraire toutes les données des Form 4
 * ═══════════════════════════════════════════════════════════════════
 */

class Form4Parser {
    static parse(xmlText) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

            // Vérification que c'est bien un Form 4
            const ownershipDocument = xmlDoc.getElementsByTagName('ownershipDocument')[0];
            if (!ownershipDocument) {
                throw new Error('Invalid Form 4 XML: ownershipDocument not found');
            }

            return {
                schemaVersion: this.getTextContent(xmlDoc, 'schemaVersion'),
                documentType: this.getTextContent(xmlDoc, 'documentType'),
                periodOfReport: this.getTextContent(xmlDoc, 'periodOfReport'),
                notSubjectToSection16: this.getTextContent(xmlDoc, 'notSubjectToSection16') === '1',
                
                // Informations sur le déclarant (Insider)
                reportingOwner: this.parseReportingOwner(xmlDoc),
                
                // Informations sur l'émetteur (Company)
                issuer: this.parseIssuer(xmlDoc),
                
                // Transactions non-dérivés (actions classiques)
                nonDerivativeTransactions: this.parseNonDerivativeTransactions(xmlDoc),
                
                // Holdings non-dérivés
                nonDerivativeHoldings: this.parseNonDerivativeHoldings(xmlDoc),
                
                // Transactions dérivés (options, warrants, etc.)
                derivativeTransactions: this.parseDerivativeTransactions(xmlDoc),
                
                // Holdings dérivés
                derivativeHoldings: this.parseDerivativeHoldings(xmlDoc),
                
                // Signatures
                signatures: this.parseSignatures(xmlDoc),
                
                // Notes complémentaires
                footnotes: this.parseFootnotes(xmlDoc),
                
                // Remarques
                remarks: this.getTextContent(xmlDoc, 'remarks'),
                
                // Métadonnées calculées
                metadata: this.calculateMetadata(xmlDoc)
            };

        } catch (error) {
            console.error('❌ Form 4 parsing error:', error);
            return null;
        }
    }

    /**
     * 👤 Parse Reporting Owner (Insider)
     */
    static parseReportingOwner(xmlDoc) {
        const owner = xmlDoc.getElementsByTagName('reportingOwner')[0];
        if (!owner) return null;

        const reportingOwnerId = owner.getElementsByTagName('reportingOwnerId')[0];
        const reportingOwnerAddress = owner.getElementsByTagName('reportingOwnerAddress')[0];
        const reportingOwnerRelationship = owner.getElementsByTagName('reportingOwnerRelationship')[0];

        return {
            // Identité
            cik: this.getTextContent(reportingOwnerId, 'rptOwnerCik'),
            name: this.getTextContent(reportingOwnerId, 'rptOwnerName'),
            
            // Adresse
            address: {
                street1: this.getTextContent(reportingOwnerAddress, 'rptOwnerStreet1'),
                street2: this.getTextContent(reportingOwnerAddress, 'rptOwnerStreet2'),
                city: this.getTextContent(reportingOwnerAddress, 'rptOwnerCity'),
                state: this.getTextContent(reportingOwnerAddress, 'rptOwnerState'),
                zipCode: this.getTextContent(reportingOwnerAddress, 'rptOwnerZipCode')
            },
            
            // Relation avec la société
            relationship: {
                isDirector: this.getTextContent(reportingOwnerRelationship, 'isDirector') === '1',
                isOfficer: this.getTextContent(reportingOwnerRelationship, 'isOfficer') === '1',
                isTenPercentOwner: this.getTextContent(reportingOwnerRelationship, 'isTenPercentOwner') === '1',
                isOther: this.getTextContent(reportingOwnerRelationship, 'isOther') === '1',
                officerTitle: this.getTextContent(reportingOwnerRelationship, 'officerTitle'),
                otherText: this.getTextContent(reportingOwnerRelationship, 'otherText')
            },
            
            // Classification
            classification: this.classifyInsider(reportingOwnerRelationship)
        };
    }

    /**
     * 🏢 Parse Issuer (Company)
     */
    static parseIssuer(xmlDoc) {
        const issuer = xmlDoc.getElementsByTagName('issuer')[0];
        if (!issuer) return null;

        return {
            cik: this.getTextContent(issuer, 'issuerCik'),
            name: this.getTextContent(issuer, 'issuerName'),
            tradingSymbol: this.getTextContent(issuer, 'issuerTradingSymbol')
        };
    }

    /**
     * 💰 Parse Non-Derivative Transactions (Actions)
     */
    static parseNonDerivativeTransactions(xmlDoc) {
        const transactions = xmlDoc.getElementsByTagName('nonDerivativeTransaction');
        const result = [];

        for (let i = 0; i < transactions.length; i++) {
            const txn = transactions[i];
            
            const securityTitle = this.getTextContent(txn, 'securityTitle', 'value');
            const transactionDate = this.getTextContent(txn, 'transactionDate', 'value');
            const transactionCoding = txn.getElementsByTagName('transactionCoding')[0];
            const transactionAmounts = txn.getElementsByTagName('transactionAmounts')[0];
            const postTransactionAmounts = txn.getElementsByTagName('postTransactionAmounts')[0];
            const ownershipNature = txn.getElementsByTagName('ownershipNature')[0];

            const shares = parseFloat(this.getTextContent(transactionAmounts, 'transactionShares', 'value')) || 0;
            const pricePerShare = parseFloat(this.getTextContent(transactionAmounts, 'transactionPricePerShare', 'value')) || 0;

            const transaction = {
                securityTitle,
                transactionDate,
                
                // Codage de la transaction
                transactionCode: this.getTextContent(transactionCoding, 'transactionCode'),
                equitySwapInvolved: this.getTextContent(transactionCoding, 'equitySwapInvolved') === '1',
                
                // Montants
                shares,
                pricePerShare,
                totalValue: shares * pricePerShare,
                
                // Acquisition (A) ou Disposition (D)
                acquiredDisposed: this.getTextContent(transactionAmounts, 'transactionAcquiredDisposedCode', 'value'),
                
                // Post-transaction
                sharesOwnedFollowing: parseFloat(this.getTextContent(postTransactionAmounts, 'sharesOwnedFollowingTransaction', 'value')) || 0,
                
                // Nature de la propriété
                directOrIndirect: this.getTextContent(ownershipNature, 'directOrIndirectOwnership', 'value'),
                natureOfOwnership: this.getTextContent(ownershipNature, 'natureOfOwnership', 'value'),
                
                // Métadonnées calculées
                transactionType: this.determineTransactionType(
                    this.getTextContent(transactionCoding, 'transactionCode'),
                    this.getTextContent(transactionAmounts, 'transactionAcquiredDisposedCode', 'value')
                ),
                
                // Signaux
                signal: this.calculateTransactionSignal(
                    this.getTextContent(transactionCoding, 'transactionCode'),
                    this.getTextContent(transactionAmounts, 'transactionAcquiredDisposedCode', 'value'),
                    shares,
                    pricePerShare
                )
            };

            result.push(transaction);
        }

        return result;
    }

    /**
     * 📊 Parse Non-Derivative Holdings
     */
    static parseNonDerivativeHoldings(xmlDoc) {
        const holdings = xmlDoc.getElementsByTagName('nonDerivativeHolding');
        const result = [];

        for (let i = 0; i < holdings.length; i++) {
            const holding = holdings[i];
            const postTransactionAmounts = holding.getElementsByTagName('postTransactionAmounts')[0];
            const ownershipNature = holding.getElementsByTagName('ownershipNature')[0];

            result.push({
                securityTitle: this.getTextContent(holding, 'securityTitle', 'value'),
                sharesOwned: parseFloat(this.getTextContent(postTransactionAmounts, 'sharesOwnedFollowingTransaction', 'value')) || 0,
                directOrIndirect: this.getTextContent(ownershipNature, 'directOrIndirectOwnership', 'value'),
                natureOfOwnership: this.getTextContent(ownershipNature, 'natureOfOwnership', 'value')
            });
        }

        return result;
    }

    /**
     * 🎯 Parse Derivative Transactions (Options, Warrants)
     */
    static parseDerivativeTransactions(xmlDoc) {
        const transactions = xmlDoc.getElementsByTagName('derivativeTransaction');
        const result = [];

        for (let i = 0; i < transactions.length; i++) {
            const txn = transactions[i];
            
            const securityTitle = this.getTextContent(txn, 'securityTitle', 'value');
            const conversionOrExercisePrice = parseFloat(this.getTextContent(txn, 'conversionOrExercisePrice', 'value')) || 0;
            const transactionDate = this.getTextContent(txn, 'transactionDate', 'value');
            const transactionCoding = txn.getElementsByTagName('transactionCoding')[0];
            const transactionAmounts = txn.getElementsByTagName('transactionAmounts')[0];

            result.push({
                securityTitle,
                conversionOrExercisePrice,
                transactionDate,
                transactionCode: this.getTextContent(transactionCoding, 'transactionCode'),
                shares: parseFloat(this.getTextContent(transactionAmounts, 'transactionShares', 'value')) || 0,
                pricePerShare: parseFloat(this.getTextContent(transactionAmounts, 'transactionPricePerShare', 'value')) || 0,
                acquiredDisposed: this.getTextContent(transactionAmounts, 'transactionAcquiredDisposedCode', 'value'),
                exerciseDate: this.getTextContent(txn, 'exerciseDate', 'value'),
                expirationDate: this.getTextContent(txn, 'expirationDate', 'value')
            });
        }

        return result;
    }

    /**
     * 📊 Parse Derivative Holdings
     */
    static parseDerivativeHoldings(xmlDoc) {
        const holdings = xmlDoc.getElementsByTagName('derivativeHolding');
        const result = [];

        for (let i = 0; i < holdings.length; i++) {
            const holding = holdings[i];
            
            result.push({
                securityTitle: this.getTextContent(holding, 'securityTitle', 'value'),
                conversionOrExercisePrice: parseFloat(this.getTextContent(holding, 'conversionOrExercisePrice', 'value')) || 0,
                exerciseDate: this.getTextContent(holding, 'exerciseDate', 'value'),
                expirationDate: this.getTextContent(holding, 'expirationDate', 'value'),
                underlyingSecurity: {
                    title: this.getTextContent(holding, 'underlyingSecurityTitle', 'value'),
                    shares: parseFloat(this.getTextContent(holding, 'underlyingSecurityShares', 'value')) || 0
                }
            });
        }

        return result;
    }

    /**
     * ✍ Parse Signatures
     */
    static parseSignatures(xmlDoc) {
        const signatures = xmlDoc.getElementsByTagName('ownerSignature');
        const result = [];

        for (let i = 0; i < signatures.length; i++) {
            const sig = signatures[i];
            result.push({
                signatureName: this.getTextContent(sig, 'signatureName'),
                signatureDate: this.getTextContent(sig, 'signatureDate')
            });
        }

        return result;
    }

    /**
     * 📝 Parse Footnotes
     */
    static parseFootnotes(xmlDoc) {
        const footnotes = xmlDoc.getElementsByTagName('footnote');
        const result = {};

        for (let i = 0; i < footnotes.length; i++) {
            const footnote = footnotes[i];
            const id = footnote.getAttribute('id');
            result[id] = footnote.textContent;
        }

        return result;
    }

    /**
     * 📊 Calcule les métadonnées agrégées
     */
    static calculateMetadata(xmlDoc) {
        const parsed = this.parse(xmlText);
        if (!parsed) return null;

        const nonDerivTxns = parsed.nonDerivativeTransactions || [];
        const derivTxns = parsed.derivativeTransactions || [];

        // Calculs agrégés
        const purchases = nonDerivTxns.filter(t => t.transactionType === 'Purchase');
        const sales = nonDerivTxns.filter(t => t.transactionType === 'Sale');

        const totalPurchaseValue = purchases.reduce((sum, t) => sum + t.totalValue, 0);
        const totalSaleValue = sales.reduce((sum, t) => sum + t.totalValue, 0);
        const netValue = totalPurchaseValue - totalSaleValue;

        return {
            totalTransactions: nonDerivTxns.length + derivTxns.length,
            purchaseCount: purchases.length,
            saleCount: sales.length,
            totalPurchaseValue,
            totalSaleValue,
            netValue,
            
            // Sentiment score (-100 à +100)
            sentimentScore: this.calculateSentimentScore(totalPurchaseValue, totalSaleValue, purchases.length, sales.length),
            
            // Signal global
            overallSignal: netValue > 100000 ? 'BULLISH' : netValue < -100000 ? 'BEARISH' : 'NEUTRAL',
            
            // Conviction level (basé sur la taille des transactions)
            convictionLevel: this.calculateConvictionLevel(totalPurchaseValue, totalSaleValue)
        };
    }

    /**
     * 🎯 Détermine le type de transaction
     */
    static determineTransactionType(code, acquiredDisposed) {
        // Codes courants:
        // P = Purchase, S = Sale, A = Award/Grant, M = Exercise of option, etc.
        if (code === 'P' || (acquiredDisposed === 'A' && code !== 'A')) return 'Purchase';
        if (code === 'S' || acquiredDisposed === 'D') return 'Sale';
        if (code === 'A') return 'Award/Grant';
        if (code === 'M') return 'Option Exercise';
        if (code === 'G') return 'Gift';
        if (code === 'W') return 'Will/Inheritance';
        return 'Other';
    }

    /**
     * 🚨 Calcule le signal d'une transaction
     */
    static calculateTransactionSignal(code, acquiredDisposed, shares, price) {
        const type = this.determineTransactionType(code, acquiredDisposed);
        const value = shares * price;

        if (type === 'Purchase') {
            if (value > 1000000) return { type: 'STRONG_BUY', confidence: 95 };
            if (value > 100000) return { type: 'BUY', confidence: 80 };
            return { type: 'WEAK_BUY', confidence: 60 };
        }

        if (type === 'Sale') {
            if (value > 5000000) return { type: 'STRONG_SELL', confidence: 85 };
            if (value > 500000) return { type: 'SELL', confidence: 70 };
            return { type: 'WEAK_SELL', confidence: 50 };
        }

        return { type: 'NEUTRAL', confidence: 40 };
    }

    /**
     * 📊 Calcule le sentiment score
     */
    static calculateSentimentScore(purchaseValue, saleValue, purchaseCount, saleCount) {
        if (purchaseValue === 0 && saleValue === 0) return 0;

        // Ratio de valeur
        const valueRatio = (purchaseValue - saleValue) / (purchaseValue + saleValue);
        
        // Ratio de count
        const countRatio = (purchaseCount - saleCount) / (purchaseCount + saleCount || 1);
        
        // Score combiné (70% valeur, 30% count)
        const score = (valueRatio * 0.7 + countRatio * 0.3) * 100;
        
        return Math.round(Math.max(-100, Math.min(100, score)));
    }

    /**
     * 💪 Calcule le niveau de conviction
     */
    static calculateConvictionLevel(purchaseValue, saleValue) {
        const maxValue = Math.max(purchaseValue, saleValue);
        
        if (maxValue > 5000000) return 'VERY_HIGH';
        if (maxValue > 1000000) return 'HIGH';
        if (maxValue > 100000) return 'MEDIUM';
        if (maxValue > 10000) return 'LOW';
        return 'VERY_LOW';
    }

    /**
     * 👔 Classifie le type d'insider
     */
    static classifyInsider(relationship) {
        const title = this.getTextContent(relationship, 'officerTitle').toLowerCase();
        
        if (title.includes('ceo') || title.includes('chief executive')) return 'CEO';
        if (title.includes('cfo') || title.includes('chief financial')) return 'CFO';
        if (title.includes('cto') || title.includes('chief technology')) return 'CTO';
        if (title.includes('coo') || title.includes('chief operating')) return 'COO';
        if (title.includes('president')) return 'President';
        if (this.getTextContent(relationship, 'isDirector') === '1') return 'Director';
        if (this.getTextContent(relationship, 'isTenPercentOwner') === '1') return '10% Owner';
        if (this.getTextContent(relationship, 'isOfficer') === '1') return 'Officer';
        
        return 'Other';
    }

    /**
     * 🔧 Helper pour extraire le texte
     */
    static getTextContent(parent, tagName, subTag = null) {
        if (!parent) return '';
        const element = parent.getElementsByTagName(tagName)[0];
        if (!element) return '';
        
        if (subTag) {
            const subElement = element.getElementsByTagName(subTag)[0];
            return subElement?.textContent?.trim() || '';
        }
        
        return element.textContent?.trim() || '';
    }
}

// Export global
window.Form4Parser = Form4Parser;