/**
 * ═══════════════════════════════════════════════════════════════════
 * 🧬 FORM 8-K PARSER - AlphaVault AI
 * ═══════════════════════════════════════════════════════════════════
 * Parser ultra-performant pour extraire toutes les données des Form 8-K
 * (Material Events, Current Reports)
 * ═══════════════════════════════════════════════════════════════════
 */

class Form8KParser {
    static parse(rawText) {
        try {
            console.log('🔬 Parsing 8-K document...');
            
            if (!rawText || rawText.length < 500) {
                throw new Error('Document too short or invalid');
            }

            const parsed = {
                // Métadonnées du document
                metadata: this.parseMetadata(rawText),
                
                // Items reportés
                items: this.parseItems(rawText),
                
                // Event date
                eventDate: this.extractEventDate(rawText),
                
                // Item-specific parsing
                item101: this.parseItem101(rawText), // Material Agreements
                item201: this.parseItem201(rawText), // Acquisition/Disposition
                item202: this.parseItem202(rawText), // Financial Results
                item502: this.parseItem502(rawText), // Leadership Changes
                item701: this.parseItem701(rawText), // Regulation FD
                item801: this.parseItem801(rawText), // Other Events
                item901: this.parseItem901(rawText), // Financial Statements
                
                // Acquisitions détaillées
                acquisitions: this.parseAcquisitions(rawText),
                
                // Agreements détaillés
                materialAgreements: this.parseMaterialAgreements(rawText),
                
                // Leadership changes détaillés
                leadershipChanges: this.parseLeadershipChanges(rawText),
                
                // Financial results
                financialResults: this.parseFinancialResults(rawText),
                
                // Exhibits
                exhibits: this.parseExhibits(rawText),
                
                // Signatures
                signatures: this.parseSignatures(rawText),
                
                // Flags critiques
                criticalFlags: this.parseCriticalFlags(rawText)
            };

            // Analytics
            parsed.analytics = this.calculateAnalytics(parsed);

            console.log('✅ 8-K parsing complete');
            return parsed;

        } catch (error) {
            console.error('❌ Form 8-K parsing error:', error);
            return {
                error: error.message,
                rawText: rawText.substring(0, 5000)
            };
        }
    }

    /**
     * 📋 Parse Metadata
     */
    static parseMetadata(text) {
        return {
            accessionNumber: this.extractPattern(text, /ACCESSION NUMBER:\s*([\d-]+)/i),
            conformed: {
                submissionType: this.extractPattern(text, /CONFORMED SUBMISSION TYPE:\s*([^\n]+)/i),
                publicDocumentCount: this.extractPattern(text, /PUBLIC DOCUMENT COUNT:\s*(\d+)/i),
                periodOfReport: this.extractPattern(text, /CONFORMED PERIOD OF REPORT:\s*(\d{8})/i),
                filedAsOfDate: this.extractPattern(text, /FILED AS OF DATE:\s*(\d{8})/i),
                dateAsOfChange: this.extractPattern(text, /DATE AS OF CHANGE:\s*(\d{8})/i)
            },
            filer: {
                companyName: this.extractPattern(text, /COMPANY CONFORMED NAME:\s*([^\n]+)/i),
                cik: this.extractPattern(text, /CENTRAL INDEX KEY:\s*(\d+)/i),
                irsNumber: this.extractPattern(text, /IRS NUMBER:\s*([\d-]+)/i),
                stateOfIncorporation: this.extractPattern(text, /STATE OF INCORPORATION:\s*([^\n]+)/i),
                fiscalYearEnd: this.extractPattern(text, /FISCAL YEAR END:\s*(\d+)/i)
            },
            
            // Trading symbol
            tradingSymbol: this.extractPattern(text, /\((?:NYSE|NASDAQ|AMEX):\s*([A-Z]{1,5})\)/i)
        };
    }

    /**
     * 📋 Parse Items
     */
    static parseItems(text) {
        const items = [];
        const itemPattern = /Item\s+(\d+\.\d+)[^\n]*([^\n]+)/gi;
        
        let match;
        while ((match = itemPattern.exec(text)) !== null) {
            items.push({
                itemNumber: match[1],
                description: match[2].trim(),
                fullText: this.extractItemFullText(text, match[1])
            });
        }

        return items;
    }

    /**
     * 📅 Extract Event Date
     */
    static extractEventDate(text) {
        const patterns = [
            /Event Date:?\s*(\d{1,2}\/\d{1,2}\/\d{4})/i,
            /Event Date:?\s*(\d{4}-\d{2}-\d{2})/i,
            /Event Date:?\s*([A-Za-z]+\s+\d{1,2},\s+\d{4})/i
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) return match[1];
        }

        return null;
    }

    /**
     * 1.01 - Material Definitive Agreement
     */
    static parseItem101(text) {
        if (!/Item\s+1\.01\b/i.test(text)) return null;

        const section = this.extractItemSection(text, '1.01');

        return {
            detected: true,
            
            // Types d'accords
            agreementTypes: this.extractAgreementTypes(section),
            
            // Parties à l'accord
            parties: this.extractParties(section),
            
            // Termes clés
            keyTerms: this.extractKeyTerms(section),
            
            // Effective date
            effectiveDate: this.extractPattern(section, /effective (?:as of |on )?([A-Za-z]+\s+\d{1,2},\s+\d{4})/i),
            
            // Material clauses
            materialClauses: this.extractMaterialClauses(section)
        };
    }

    /**
     * 2.01 - Completion of Acquisition or Disposition
     */
    static parseItem201(text) {
        if (!/Item\s+2\.01\b/i.test(text)) return null;

        const section = this.extractItemSection(text, '2.01');

        return {
            detected: true,
            
            // Type (acquisition vs disposition)
            transactionType: /\bacquisition\b/i.test(section) ? 'acquisition' : 
                            /\bdisposition\b|\bsale\b/i.test(section) ? 'disposition' : 'unknown',
            
            // Purchase price
            purchasePrice: this.extractPurchasePrice(section),
            
            // Asset/Business description
            assetDescription: this.extractPattern(section, /(?:acquired|purchased|sold).*?([^.]{50,200})/i),
            
            // Seller/Buyer
            counterparty: this.extractPattern(section, /(?:from|to)\s+([A-Z][a-zA-Z\s&,.]+(?:Inc\.|Corp\.|LLC|Ltd\.))/i),
            
            // Closing date
            closingDate: this.extractPattern(section, /closed on ([A-Za-z]+\s+\d{1,2},\s+\d{4})/i),
            
            // Source of funds
            sourceOfFunds: this.extractSourceOfFunds(section)
        };
    }

    /**
     * 2.02 - Results of Operations and Financial Condition
     */
    static parseItem202(text) {
        if (!/Item\s+2\.02\b/i.test(text)) return null;

        const section = this.extractItemSection(text, '2.02');

        return {
            detected: true,
            
            // Press release
            hasPressRelease: /press release/i.test(section),
            
            // Reporting period
            reportingPeriod: this.extractReportingPeriod(section),
            
            // Earnings metrics
            earningsMetrics: this.extractEarningsMetrics(section),
            
            // Conference call info
            conferenceCall: this.extractConferenceCallInfo(section)
        };
    }

    /**
     * 5.02 - Departure/Appointment of Directors or Officers
     */
    static parseItem502(text) {
        if (!/Item\s+5\.02\b/i.test(text)) return null;

        const section = this.extractItemSection(text, '5.02');

        return {
            detected: true,
            
            // Changes
            changes: this.extractExecutiveChanges(section),
            
            // Effective dates
            effectiveDates: this.extractPattern(section, /effective\s+([A-Za-z]+\s+\d{1,2},\s+\d{4})/i)
        };
    }

    /**
     * 7.01 - Regulation FD Disclosure
     */
    static parseItem701(text) {
        if (!/Item\s+7\.01\b/i.test(text)) return null;

        const section = this.extractItemSection(text, '7.01');

        return {
            detected: true,
            
            // Topic
            disclosureTopic: this.extractPattern(section, /(?:regarding|concerning|relating to)\s+([^.]{20,100})/i),
            
            // Has presentation
            hasPresentation: /presentation|investor|analyst/i.test(section)
        };
    }

    /**
     * 8.01 - Other Events
     */
    static parseItem801(text) {
        if (!/Item\s+8\.01\b/i.test(text)) return null;

        const section = this.extractItemSection(text, '8.01');

        return {
            detected: true,
            
            // Event description
            eventDescription: section.substring(0, 500)
        };
    }

    /**
     * 9.01 - Financial Statements and Exhibits
     */
    static parseItem901(text) {
        if (!/Item\s+9\.01\b/i.test(text)) return null;

        const section = this.extractItemSection(text, '9.01');

        return {
            detected: true,
            
            // Pro forma required
            hasProForma: /pro forma/i.test(section),
            
            // Exhibits listed
            exhibitsListed: this.extractExhibitsFromSection(section)
        };
    }

    /**
     * 💼 Parse Acquisitions
     */
    static parseAcquisitions(text) {
        const acquisitions = [];

        // Pattern 1: Direct acquisition mention
        const pattern1 = /acquired.*?([A-Z][a-zA-Z\s&,.]+(?:Inc\.|Corp\.|LLC|Ltd\.)).*?for.*?\$?([\d,\.]+)\s*(million|billion)/gi;
        
        let match;
        while ((match = pattern1.exec(text)) !== null && acquisitions.length < 5) {
            const amount = parseFloat(match[2].replace(/,/g, ''));
            const multiplier = match[3].toLowerCase() === 'billion' ? 1000 : 1;
            
            acquisitions.push({
                target: match[1].trim(),
                value: amount * multiplier,
                currency: 'USD',
                type: 'acquisition'
            });
        }

        return acquisitions;
    }

    /**
     * 📄 Parse Material Agreements
     */
    static parseMaterialAgreements(text) {
        const agreements = [];
        const patterns = [
            /entered into.*?([a-z\s]+agreement)/gi,
            /executed.*?([a-z\s]+agreement)/gi,
            /signed.*?([a-z\s]+agreement)/gi
        ];

        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(text)) !== null && agreements.length < 10) {
                const agreementType = match[1].trim();
                if (agreementType.length > 5 && agreementType.length < 100) {
                    agreements.push({
                        type: agreementType,
                        context: this.extractContext(text, match.index, 200)
                    });
                }
            }
        }

        return [...new Map(agreements.map(a => [a.type, a])).values()]; // Déduplicate
    }

    /**
     * 👔 Parse Leadership Changes
     */
    static parseLeadershipChanges(text) {
        const changes = [];
        const actionPattern = /(appointed|elected|resigned|retired|departed|named|promoted)/gi;
        const positionPattern = /(CEO|CFO|COO|CTO|President|Director|Chairman|Vice President|Secretary|Treasurer|Chief.*Officer)/gi;

        const actions = [...text.matchAll(actionPattern)];
        
        for (const action of actions) {
            const context = this.extractContext(text, action.index, 300);
            const positions = [...context.matchAll(positionPattern)];
            
            if (positions.length > 0) {
                const nameMatch = context.match(/([A-Z][a-z]+\s+[A-Z][a-z]+)/);
                
                changes.push({
                    action: action[1],
                    position: positions[0][1],
                    name: nameMatch ? nameMatch[1] : null,
                    context: context.substring(0, 200)
                });
            }
        }

        return changes.slice(0, 10);
    }

    /**
     * 📊 Parse Financial Results
     */
    static parseFinancialResults(text) {
        return {
            hasEarningsRelease: /earnings|financial results|quarterly results/i.test(text),
            
            // Period
            period: this.extractReportingPeriod(text),
            
            // Revenue
            revenue: this.extractMetric(text, 'revenue'),
            
            // Net income
            netIncome: this.extractMetric(text, 'net income'),
            
            // EPS
            eps: this.extractMetric(text, 'earnings per share|EPS'),
            
            // EBITDA
            ebitda: this.extractMetric(text, 'EBITDA'),
            
            // Guidance
            hasGuidance: /guidance|outlook|forecast/i.test(text)
        };
    }

    /**
     * 📎 Parse Exhibits
     */
    static parseExhibits(text) {
        const exhibits = [];
        const exhibitPattern = /Exhibit\s+(\d+\.?\d*)\s+[—\-]\s*([^\n]+)/gi;
        
        let match;
        while ((match = exhibitPattern.exec(text)) !== null) {
            exhibits.push({
                number: match[1],
                description: match[2].trim()
            });
        }

        return exhibits;
    }

    /**
     * ✍ Parse Signatures
     */
    static parseSignatures(text) {
        const signatures = [];
        const sigSection = this.extractSection(text, 'SIGNATURE', 2000);
        
        const namePattern = /By:\s*([A-Z][a-zA-Z\s\.]+)/g;
        const titlePattern = /(?:Title|Its):\s*([^\n]+)/gi;
        
        const names = [...sigSection.matchAll(namePattern)];
        const titles = [...sigSection.matchAll(titlePattern)];
        
        for (let i = 0; i < Math.min(names.length, titles.length); i++) {
            signatures.push({
                name: names[i][1].trim(),
                title: titles[i][1].trim()
            });
        }

        return signatures;
    }

    /**
     * 🚨 Parse Critical Flags
     */
    static parseCriticalFlags(text) {
        return {
            // Item 1.03 - Bankruptcy
            bankruptcy: /Item\s+1\.03\b/i.test(text),
            
            // Item 1.04 - Mine Safety
            mineSafety: /Item\s+1\.04\b/i.test(text),
            
            // Item 2.03 - Default
            defaultOnSeniorSecurities: /Item\s+2\.03\b/i.test(text),
            
            // Item 2.04 - Triggering Events
            triggeringEvents: /Item\s+2\.04\b/i.test(text),
            
            // Item 3.01 - Delisting
            delisting: /Item\s+3\.01\b/i.test(text),
            
            // Item 4.01 - Accountant changes
            accountantChange: /Item\s+4\.01\b/i.test(text),
            
            // Item 5.01 - Bylaw changes
            bylawChanges: /Item\s+5\.01\b/i.test(text),
            
            // Material weaknesses
            materialWeakness: /material weakness/i.test(text),
            
            // Restatement
            restatement: /restatement|restated/i.test(text),
            
            // Going concern
            goingConcern: /going concern/i.test(text)
        };
    }

    /**
     * 📊 Calculate Analytics
     */
    static calculateAnalytics(parsed) {
        const items = parsed.items || [];
        
        return {
            // Item count
            totalItems: items.length,
            
            // Criticality score (0-100)
            criticalityScore: this.calculateCriticalityScore(parsed),
            
            // Market impact (LOW/MEDIUM/HIGH)
            marketImpact: this.assessMarketImpact(parsed),
            
            // Item breakdown
            itemBreakdown: this.categorizeItems(items),
            
            // Flags summary
            criticalFlagsCount: Object.values(parsed.criticalFlags || {}).filter(v => v).length
        };
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔧 HELPER FUNCTIONS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    static extractPattern(text, regex, defaultValue = null) {
        const match = text.match(regex);
        return match ? match[1].trim() : defaultValue;
    }

    static extractItemFullText(text, itemNumber) {
        const pattern = new RegExp(`Item\\s+${itemNumber.replace('.', '\\.')}[\\s\\S]{0,2000}`, 'i');
        const match = text.match(pattern);
        return match ? match[0] : '';
    }

    static extractItemSection(text, itemNumber) {
        // Extract section between Item X.XX and next Item
        const startPattern = new RegExp(`Item\\s+${itemNumber.replace('.', '\\.')}`, 'i');
        const startMatch = text.search(startPattern);
        
        if (startMatch === -1) return '';
        
        const remainingText = text.substring(startMatch);
        const nextItemMatch = remainingText.search(/Item\s+\d+\.\d+/i);
        
        if (nextItemMatch === -1) {
            return remainingText.substring(0, 5000);
        }
        
        return remainingText.substring(0, nextItemMatch);
    }

    static extractAgreementTypes(text) {
        const types = [];
        const agreementPattern = /([a-z\s]+agreement)/gi;
        
        let match;
        while ((match = agreementPattern.exec(text)) !== null && types.length < 10) {
            const type = match[1].trim();
            if (type.length > 5 && type.length < 100) {
                types.push(type);
            }
        }

        return [...new Set(types)];
    }

    static extractParties(text) {
        const parties = [];
        const partyPattern = /(?:between|with|and)\s+([A-Z][a-zA-Z\s&,.]+(?:Inc\.|Corp\.|LLC|Ltd\.))/gi;
        
        let match;
        while ((match = partyPattern.exec(text)) !== null && parties.length < 5) {
            parties.push(match[1].trim());
        }

        return [...new Set(parties)];
    }

    static extractKeyTerms(text) {
        const terms = [];
        
        if (/term of.*?(\d+)\s*years?/i.test(text)) {
            const match = text.match(/term of.*?(\d+)\s*years?/i);
            terms.push(`Term: ${match[1]} years`);
        }
        
        if (/amount of.*?\$?([\d,\.]+)\s*(million|billion)/i.test(text)) {
            const match = text.match(/amount of.*?\$?([\d,\.]+)\s*(million|billion)/i);
            terms.push(`Amount: $${match[1]}${match[2].charAt(0).toUpperCase()}`);
        }
        
        return terms;
    }

    static extractMaterialClauses(text) {
        const clauses = [];
        
        if (/confidentiality/i.test(text)) clauses.push('Confidentiality');
        if (/non-compete/i.test(text)) clauses.push('Non-compete');
        if (/termination/i.test(text)) clauses.push('Termination provisions');
        if (/indemnification/i.test(text)) clauses.push('Indemnification');
        
        return clauses;
    }

    static extractPurchasePrice(text) {
        const pattern = /(?:purchase price|consideration) of (?:approximately )?\$?([\d,\.]+)\s*(million|billion)/i;
        const match = text.match(pattern);
        
        if (match) {
            const amount = parseFloat(match[1].replace(/,/g, ''));
            const multiplier = match[2].toLowerCase() === 'billion' ? 1000 : 1;
            return {
                value: amount * multiplier,
                currency: 'USD'
            };
        }

        return null;
    }

    static extractSourceOfFunds(text) {
        const sources = [];
        
        if (/cash on hand/i.test(text)) sources.push('Cash on hand');
        if (/borrowing|credit facility/i.test(text)) sources.push('Debt financing');
        if (/equity offering/i.test(text)) sources.push('Equity offering');
        
        return sources;
    }

    static extractReportingPeriod(text) {
        const patterns = [
            /(?:quarter|period) ended ([A-Za-z]+\s+\d{1,2},\s+\d{4})/i,
            /(?:fiscal year|year) ended ([A-Za-z]+\s+\d{1,2},\s+\d{4})/i,
            /(Q[1-4])\s+(\d{4})/i
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                return match[1] + (match[2] ? ' ' + match[2] : '');
            }
        }

        return null;
    }

    static extractEarningsMetrics(text) {
        return {
            revenue: this.extractMetric(text, 'revenue|sales'),
            netIncome: this.extractMetric(text, 'net income|net earnings'),
            eps: this.extractMetric(text, 'earnings per share|diluted EPS')
        };
    }

    static extractMetric(text, metricName) {
        const pattern = new RegExp(`${metricName}.*?\\$?([\\d,\\.]+)\\s*(million|billion)?`, 'i');
        const match = text.match(pattern);
        
        if (match) {
            const value = parseFloat(match[1].replace(/,/g, ''));
            const multiplier = match[2] ? (match[2].toLowerCase() === 'billion' ? 1000 : 1) : 1;
            return value * multiplier;
        }

        return null;
    }

    static extractConferenceCallInfo(text) {
        return {
            hasCall: /conference call|earnings call/i.test(text),
            date: this.extractPattern(text, /call.*?on ([A-Za-z]+\s+\d{1,2},\s+\d{4})/i),
            time: this.extractPattern(text, /call.*?at (\d{1,2}:\d{2}\s*[AP]M)/i)
        };
    }

    static extractExecutiveChanges(text) {
        const changes = [];
        const actionPattern = /(appointed|elected|resigned|retired|departed)/gi;
        
        let match;
        while ((match = actionPattern.exec(text)) !== null && changes.length < 10) {
            const context = this.extractContext(text, match.index, 200);
            const nameMatch = context.match(/([A-Z][a-z]+\s+[A-Z][a-z]+)/);
            const positionMatch = context.match(/(CEO|CFO|COO|CTO|President|Director)/i);
            
            if (nameMatch && positionMatch) {
                changes.push({
                    action: match[1],
                    name: nameMatch[1],
                    position: positionMatch[1]
                });
            }
        }

        return changes;
    }

    static extractExhibitsFromSection(text) {
        const exhibits = [];
        const pattern = /Exhibit\s+(\d+\.?\d*)/gi;
        
        let match;
        while ((match = pattern.exec(text)) !== null && exhibits.length < 20) {
            exhibits.push(match[1]);
        }

        return exhibits;
    }

    static extractContext(text, index, length) {
        const start = Math.max(0, index - length / 2);
        const end = Math.min(text.length, index + length / 2);
        return text.substring(start, end);
    }

    static extractSection(text, sectionName, maxLength = 2000) {
        const regex = new RegExp(`${sectionName}[\\s\\S]{0,${maxLength}}`, 'i');
        const match = text.match(regex);
        return match ? match[0] : '';
    }

    static calculateCriticalityScore(parsed) {
        let score = 0;

        // Critical flags
        const flags = parsed.criticalFlags || {};
        if (flags.bankruptcy) score += 100;
        if (flags.delisting) score += 90;
        if (flags.defaultOnSeniorSecurities) score += 80;
        if (flags.goingConcern) score += 85;
        if (flags.materialWeakness) score += 70;
        if (flags.restatement) score += 60;
        if (flags.accountantChange) score += 40;

        // Item-based scoring
        if (parsed.item101?.detected) score += 30;
        if (parsed.item201?.detected) score += 50;
        if (parsed.item502?.detected) score += 40;

        return Math.min(100, score);
    }

    static assessMarketImpact(parsed) {
        const score = parsed.analytics?.criticalityScore || 0;

        if (score >= 80) return 'HIGH';
        if (score >= 40) return 'MEDIUM';
        return 'LOW';
    }

    static categorizeItems(items) {
        const categories = {
            corporate: [],
            financial: [],
            governance: [],
            regulatory: [],
            other: []
        };

        items.forEach(item => {
            const num = item.itemNumber;
            
            if (['1.01', '1.02', '1.03', '1.04'].includes(num)) {
                categories.corporate.push(item);
            } else if (['2.01', '2.02', '2.03', '2.04', '2.05', '2.06'].includes(num)) {
                categories.financial.push(item);
            } else if (['5.01', '5.02', '5.03', '5.04', '5.05', '5.06', '5.07', '5.08'].includes(num)) {
                categories.governance.push(item);
            } else if (['3.01', '3.02', '3.03', '4.01', '4.02'].includes(num)) {
                categories.regulatory.push(item);
            } else {
                categories.other.push(item);
            }
        });

        return categories;
    }
}

// Export global
window.Form8KParser = Form8KParser;