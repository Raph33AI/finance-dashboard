/**
 * ═══════════════════════════════════════════════════════════════════
 * 🧬 FORM S-4 PARSER - AlphaVault AI
 * ═══════════════════════════════════════════════════════════════════
 * Parser ultra-performant pour extraire toutes les données des Form S-4
 * (Mergers, Acquisitions, Business Combinations)
 * ═══════════════════════════════════════════════════════════════════
 */

class FormS4Parser {
    static parse(rawText) {
        try {
            console.log('🔬 Parsing S-4 document...');
            
            if (!rawText || rawText.length < 1000) {
                throw new Error('Document too short or invalid');
            }

            const parsed = {
                // Métadonnées du document
                metadata: this.parseMetadata(rawText),
                
                // Structure du deal
                dealStructure: this.parseDealStructure(rawText),
                
                // Termes financiers
                financialTerms: this.parseFinancialTerms(rawText),
                
                // Parties impliquées
                parties: this.parseParties(rawText),
                
                // Conseillers
                advisors: this.parseAdvisors(rawText),
                
                // Timeline réglementaire
                regulatory: this.parseRegulatory(rawText),
                
                // Conditions de clôture
                closingConditions: this.parseClosingConditions(rawText),
                
                // Synergies et rationale
                synergies: this.parseSynergies(rawText),
                
                // Facteurs de risque
                riskFactors: this.parseRiskFactors(rawText),
                
                // Clauses de résiliation
                terminationClauses: this.parseTerminationClauses(rawText),
                
                // Informations sur les actionnaires
                shareholderInfo: this.parseShareholderInfo(rawText),
                
                // Documents exhibés
                exhibits: this.parseExhibits(rawText)
            };

            // Calcul des scores et métriques
            parsed.analytics = this.calculateAnalytics(parsed);

            console.log('✅ S-4 parsing complete');
            return parsed;

        } catch (error) {
            console.error('❌ Form S-4 parsing error:', error);
            return {
                error: error.message,
                rawText: rawText.substring(0, 5000) // Échantillon pour debug
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
            }
        };
    }

    /**
     * 💼 Parse Deal Structure
     */
    static parseDealStructure(text) {
        // Détection du type de deal
        let dealType = 'unknown';
        if (/\bmerger\b/i.test(text)) dealType = 'merger';
        else if (/\bacquisition\b/i.test(text)) dealType = 'acquisition';
        else if (/\bbusiness combination\b/i.test(text)) dealType = 'business_combination';
        else if (/\breverse merger\b/i.test(text)) dealType = 'reverse_merger';
        else if (/\btender offer\b/i.test(text)) dealType = 'tender_offer';

        // Structure de paiement
        let paymentStructure = [];
        if (/\bcash\b/i.test(text)) paymentStructure.push('cash');
        if (/\bstock\b|\bshares\b/i.test(text)) paymentStructure.push('stock');
        if (/\bmixed\b|\bcombination of cash and stock\b/i.test(text)) paymentStructure.push('mixed');

        return {
            dealType,
            paymentStructure,
            
            // Acquirer vs Target
            acquirerName: this.extractPattern(text, /acquirer[:\s]+([A-Z][a-zA-Z\s&,.]+(?:Inc\.|Corp\.|LLC|Ltd\.))/i),
            targetName: this.extractPattern(text, /target[:\s]+([A-Z][a-zA-Z\s&,.]+(?:Inc\.|Corp\.|LLC|Ltd\.))/i),
            
            // Surviving entity
            survivingEntity: this.extractPattern(text, /surviving (?:entity|corporation)[:\s]+([A-Z][a-zA-Z\s&,.]+)/i),
            
            // Effective date
            effectiveDate: this.extractPattern(text, /effective date[:\s]+([A-Za-z]+\s+\d{1,2},\s+\d{4})/i),
            
            // Merger agreement date
            agreementDate: this.extractPattern(text, /(?:merger agreement|agreement and plan)[^.]*dated[:\s]+([A-Za-z]+\s+\d{1,2},\s+\d{4})/i)
        };
    }

    /**
     * 💰 Parse Financial Terms
     */
    static parseFinancialTerms(text) {
        const dealValue = this.extractDealValue(text);
        const breakUpFee = this.extractBreakUpFee(text);
        const exchangeRatio = this.extractExchangeRatio(text);
        const premium = this.extractPremium(text);
        
        return {
            // Valeur du deal
            dealValue: dealValue.value,
            dealValueCurrency: dealValue.currency,
            
            // Break-up fee
            breakUpFee: breakUpFee.value,
            breakUpFeePercentage: dealValue.value > 0 
                ? ((breakUpFee.value / dealValue.value) * 100).toFixed(2) 
                : null,
            
            // Exchange ratio
            exchangeRatio: exchangeRatio,
            
            // Premium
            premiumOffered: premium.percentage,
            premiumBasis: premium.basis,
            
            // Prix par action
            pricePerShare: this.extractPricePerShare(text),
            
            // Financing
            financing: this.parseFinancing(text),
            
            // Enterprise Value
            enterpriseValue: this.extractEnterpriseValue(text),
            
            // Equity Value
            equityValue: this.extractEquityValue(text)
        };
    }

    /**
     * 🏢 Parse Parties
     */
    static parseParties(text) {
        return {
            acquirer: {
                name: this.extractPattern(text, /acquirer[:\s]+([A-Z][a-zA-Z\s&,.]+(?:Inc\.|Corp\.|LLC|Ltd\.))/i),
                ticker: this.extractPattern(text, /\((?:NYSE|NASDAQ|AMEX):\s*([A-Z]{1,5})\)/i),
                jurisdiction: this.extractPattern(text, /incorporated (?:in|under the laws of)\s+([A-Za-z\s]+)/i),
                website: this.extractPattern(text, /(https?:\/\/[^\s]+)/i)
            },
            
            target: {
                name: this.extractPattern(text, /target[:\s]+([A-Z][a-zA-Z\s&,.]+(?:Inc\.|Corp\.|LLC|Ltd\.))/i),
                ticker: this.extractAllPatterns(text, /\((?:NYSE|NASDAQ|AMEX):\s*([A-Z]{1,5})\)/gi)[1],
                businessDescription: this.extractPattern(text, /(?:target|company) (?:is|engages in)[^.]{0,200}([^.]+\.)/i)
            },
            
            subsidiaries: this.extractSubsidiaries(text)
        };
    }

    /**
     * 👔 Parse Advisors
     */
    static parseAdvisors(text) {
        // Law firms
        const lawFirms = [
            'Wachtell, Lipton, Rosen & Katz',
            'Skadden, Arps, Slate, Meagher & Flom',
            'Sullivan & Cromwell',
            'Cravath, Swaine & Moore',
            'Davis Polk & Wardwell',
            'Simpson Thacher & Bartlett',
            'Kirkland & Ellis',
            'Latham & Watkins',
            'Paul, Weiss, Rifkind, Wharton & Garrison',
            'Cleary Gottlieb Steen & Hamilton',
            'Fried, Frank, Harris, Shriver & Jacobson',
            'Gibson, Dunn & Crutcher',
            'Debevoise & Plimpton',
            'Shearman & Sterling',
            'Ropes & Gray'
        ];

        // Investment banks
        const banks = [
            'Goldman Sachs',
            'Morgan Stanley',
            'J.P. Morgan',
            'JPMorgan',
            'Bank of America',
            'BofA Securities',
            'Citigroup',
            'Credit Suisse',
            'Barclays',
            'Deutsche Bank',
            'Lazard',
            'Evercore',
            'Centerview Partners',
            'Moelis & Company',
            'Qatalyst Partners',
            'PJT Partners',
            'Perella Weinberg',
            'Guggenheim Securities',
            'Jefferies',
            'UBS'
        ];

        const foundLawFirms = lawFirms.filter(firm => 
            new RegExp(this.escapeRegex(firm), 'i').test(text)
        );

        const foundBanks = banks.filter(bank => 
            new RegExp(this.escapeRegex(bank), 'i').test(text)
        );

        return {
            acquirerLegalCounsel: foundLawFirms[0] || null,
            targetLegalCounsel: foundLawFirms[1] || null,
            allLegalCounsel: foundLawFirms,
            
            acquirerFinancialAdvisor: foundBanks[0] || null,
            targetFinancialAdvisor: foundBanks[1] || null,
            allFinancialAdvisors: foundBanks,
            
            // Comptables/auditeurs
            auditors: this.extractAuditors(text),
            
            // Proxy solicitor
            proxySolicitor: this.extractPattern(text, /proxy solicitor[:\s]+([A-Z][a-zA-Z\s&,.]+)/i)
        };
    }

    /**
     * 🏛 Parse Regulatory
     */
    static parseRegulatory(text) {
        const approvals = [];
        
        // Détection des approbations requises
        if (/\bFTC\b|\bFederal Trade Commission\b/i.test(text)) {
            approvals.push({
                authority: 'FTC',
                required: true,
                description: 'Federal Trade Commission antitrust review'
            });
        }
        
        if (/\bDOJ\b|\bDepartment of Justice\b/i.test(text)) {
            approvals.push({
                authority: 'DOJ',
                required: true,
                description: 'Department of Justice antitrust review'
            });
        }
        
        if (/\bSEC\b|\bSecurities and Exchange Commission\b/i.test(text)) {
            approvals.push({
                authority: 'SEC',
                required: true,
                description: 'SEC registration and approval'
            });
        }
        
        if (/\bCFIUS\b|\bCommittee on Foreign Investment\b/i.test(text)) {
            approvals.push({
                authority: 'CFIUS',
                required: true,
                description: 'Foreign investment security review'
            });
        }
        
        if (/\bEuropean Commission\b|\bEC\b.*\bantitrust\b/i.test(text)) {
            approvals.push({
                authority: 'EC',
                required: true,
                description: 'European Commission competition review'
            });
        }
        
        if (/\bshareholder approval\b|\bstockholders.*vote\b/i.test(text)) {
            approvals.push({
                authority: 'Shareholders',
                required: true,
                description: 'Shareholder vote approval'
            });
        }

        return {
            approvalsRequired: approvals,
            
            // HSR Act
            hsrRequired: /Hart-Scott-Rodino|HSR Act/i.test(text),
            hsrFilingDate: this.extractPattern(text, /HSR filing[^.]*(\d{1,2}\/\d{1,2}\/\d{4})/i),
            
            // Regulatory filings
            foreignFilingsRequired: /foreign.*regulatory.*filing/i.test(text),
            
            // Antitrust concerns
            antitrustConcerns: /antitrust.*concern|regulatory.*challenge/i.test(text),
            
            // Conditions
            regulatoryConditions: this.extractRegulatoryConditions(text)
        };
    }

    /**
     * ✅ Parse Closing Conditions
     */
    static parseClosingConditions(text) {
        const conditions = [];
        
        // Conditions standards
        if (/shareholder approval/i.test(text)) {
            conditions.push({
                type: 'shareholder_approval',
                description: 'Approval by shareholders of both companies',
                satisfied: false
            });
        }
        
        if (/regulatory approval/i.test(text)) {
            conditions.push({
                type: 'regulatory_approval',
                description: 'Receipt of all required regulatory approvals',
                satisfied: false
            });
        }
        
        if (/no material adverse (?:change|effect)/i.test(text)) {
            conditions.push({
                type: 'mac_clause',
                description: 'No Material Adverse Change (MAC)',
                satisfied: false
            });
        }
        
        if (/financing condition/i.test(text)) {
            conditions.push({
                type: 'financing',
                description: 'Availability of financing',
                satisfied: false
            });
        }

        return {
            conditions,
            totalConditions: conditions.length,
            
            // Walk-away rights
            walkAwayRights: /walk.away|termination right/i.test(text),
            
            // Waiver provisions
            waiverProvisions: /waive.*condition|waiver/i.test(text)
        };
    }

    /**
     * 🎯 Parse Synergies
     */
    static parseSynergies(text) {
        // Extraction des synergies
        const synergiesMatch = text.match(/synergies of.*?\$?([\d,\.]+)\s*(million|billion)/i);
        const costSavingsMatch = text.match(/cost savings of.*?\$?([\d,\.]+)\s*(million|billion)/i);
        const revenueMatch = text.match(/revenue (?:synergies|opportunities) of.*?\$?([\d,\.]+)\s*(million|billion)/i);

        const parseSynergy = (match) => {
            if (!match) return null;
            const amount = parseFloat(match[1].replace(/,/g, ''));
            const multiplier = match[2].toLowerCase() === 'billion' ? 1000 : 1;
            return amount * multiplier;
        };

        return {
            totalSynergies: parseSynergy(synergiesMatch),
            costSynergies: parseSynergy(costSavingsMatch),
            revenueSynergies: parseSynergy(revenueMatch),
            
            // Timeline
            synergyTimeframe: this.extractPattern(text, /synergies.*(?:within|over)\s+(\d+)\s+years?/i),
            
            // Sources
            synergySources: this.extractSynergySources(text),
            
            // Strategic rationale
            strategicRationale: this.extractStrategicRationale(text)
        };
    }

    /**
     * ⚠ Parse Risk Factors
     */
    static parseRiskFactors(text) {
        const riskSection = this.extractSection(text, 'RISK FACTORS', 5000);
        
        const risks = {
            integration: /integration.*risk/i.test(riskSection),
            regulatory: /regulatory.*(?:risk|uncertainty)/i.test(riskSection),
            financial: /financial.*risk/i.test(riskSection),
            operational: /operational.*risk/i.test(riskSection),
            market: /market.*(?:risk|condition)/i.test(riskSection),
            competition: /competitive.*risk/i.test(riskSection),
            retention: /employee.*retention|key personnel/i.test(riskSection),
            litigation: /litigation.*risk/i.test(riskSection),
            technology: /technology.*risk|cyber/i.test(riskSection),
            debt: /debt.*level|leverage/i.test(riskSection)
        };

        const riskCount = Object.values(risks).filter(v => v).length;

        return {
            risks,
            riskCount,
            riskLevel: riskCount > 7 ? 'HIGH' : riskCount > 4 ? 'MEDIUM' : 'LOW',
            
            // Facteurs de risque spécifiques
            materialAdverseEffect: /material adverse (?:change|effect)/i.test(text),
            
            // Extraits de risques
            riskExcerpts: this.extractRiskExcerpts(riskSection)
        };
    }

    /**
     * 🚫 Parse Termination Clauses
     */
    static parseTerminationClauses(text) {
        const breakUpFeeSection = this.extractSection(text, 'termination.*fee|break.?up fee', 2000);
        
        return {
            // Break-up fee
            hasBreakUpFee: /termination fee|break.?up fee/i.test(text),
            breakUpFeeAmount: this.extractBreakUpFee(text).value,
            
            // Reverse break-up fee
            hasReverseBreakUpFee: /reverse.*termination fee/i.test(text),
            reverseBreakUpFeeAmount: this.extractReverseBreakUpFee(text),
            
            // Termination rights
            terminationRights: {
                byAcquirer: /acquirer.*terminate/i.test(text),
                byTarget: /target.*terminate/i.test(text),
                mutual: /either party.*terminate/i.test(text)
            },
            
            // Triggering events
            triggeringEvents: this.extractTerminationTriggers(text),
            
            // Outside date
            outsideDate: this.extractPattern(text, /outside date.*?(\d{1,2}\/\d{1,2}\/\d{4}|[A-Za-z]+\s+\d{1,2},\s+\d{4})/i)
        };
    }

    /**
     * 📊 Parse Shareholder Info
     */
    static parseShareholderInfo(text) {
        return {
            // Voting requirements
            votingRequirements: {
                acquirer: this.extractVotingRequirement(text, 'acquirer'),
                target: this.extractVotingRequirement(text, 'target')
            },
            
            // Record date
            recordDate: this.extractPattern(text, /record date.*?(\d{1,2}\/\d{1,2}\/\d{4}|[A-Za-z]+\s+\d{1,2},\s+\d{4})/i),
            
            // Meeting date
            meetingDate: this.extractPattern(text, /(?:special )?meeting.*?(\d{1,2}\/\d{1,2}\/\d{4}|[A-Za-z]+\s+\d{1,2},\s+\d{4})/i),
            
            // Shareholder support
            supportAgreements: /support agreement|voting agreement/i.test(text),
            
            // Lock-up provisions
            lockUpPeriod: this.extractPattern(text, /lock.?up.*?(\d+)\s*(?:days|months)/i),
            
            // Dissent rights
            dissentRights: /dissent.*right|appraisal.*right/i.test(text)
        };
    }

    /**
     * 📎 Parse Exhibits
     */
    static parseExhibits(text) {
        const exhibits = [];
        const exhibitPattern = /EXHIBIT\s+(\d+\.?\d*)\s+[—\-]\s*([^\n]+)/gi;
        
        let match;
        while ((match = exhibitPattern.exec(text)) !== null) {
            exhibits.push({
                number: match[1],
                description: match[2].trim()
            });
        }

        return {
            exhibits,
            count: exhibits.length,
            
            // Documents clés
            hasMergerAgreement: exhibits.some(e => /merger agreement/i.test(e.description)),
            hasOpinionLetters: exhibits.some(e => /fairness opinion|opinion.*financial advisor/i.test(e.description)),
            hasVotingAgreements: exhibits.some(e => /voting agreement|support agreement/i.test(e.description))
        };
    }

    /**
     * 📊 Calculate Analytics
     */
    static calculateAnalytics(parsed) {
        const dealValue = parsed.financialTerms?.dealValue || 0;
        const breakUpFee = parsed.financialTerms?.breakUpFee || 0;
        
        return {
            // Deal quality score (0-100)
            dealQualityScore: this.calculateDealQualityScore(parsed),
            
            // Completion probability (0-100)
            completionProbability: this.calculateCompletionProbability(parsed),
            
            // Financial metrics
            breakUpFeePercentage: dealValue > 0 ? ((breakUpFee / dealValue) * 100).toFixed(2) : 0,
            
            // Timeline estimate
            estimatedTimelineMonths: this.estimateTimeline(parsed),
            
            // Risk score (0-100)
            riskScore: this.calculateRiskScore(parsed),
            
            // Advisor prestige score
            advisorPrestigeScore: this.calculateAdvisorPrestige(parsed.advisors)
        };
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔧 HELPER FUNCTIONS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    static extractPattern(text, regex, defaultValue = null) {
        const match = text.match(regex);
        return match ? match[1].trim() : defaultValue;
    }

    static extractAllPatterns(text, regex) {
        const matches = [];
        let match;
        while ((match = regex.exec(text)) !== null) {
            matches.push(match[1].trim());
        }
        return matches;
    }

    static extractDealValue(text) {
        const patterns = [
            /(?:aggregate|total|transaction|deal) (?:consideration|value|price) of (?:approximately )?\$?([\d,\.]+)\s*(million|billion)/i,
            /purchase price of (?:approximately )?\$?([\d,\.]+)\s*(million|billion)/i,
            /\$?([\d,\.]+)\s*(million|billion) (?:transaction|deal)/i
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                const amount = parseFloat(match[1].replace(/,/g, ''));
                const multiplier = match[2].toLowerCase() === 'billion' ? 1000 : 1;
                return {
                    value: amount * multiplier,
                    currency: 'USD'
                };
            }
        }

        return { value: null, currency: 'USD' };
    }

    static extractBreakUpFee(text) {
        const pattern = /(?:termination|break.?up) fee of \$?([\d,\.]+)\s*(million|billion)/i;
        const match = text.match(pattern);
        
        if (match) {
            const amount = parseFloat(match[1].replace(/,/g, ''));
            const multiplier = match[2].toLowerCase() === 'billion' ? 1000 : 1;
            return { value: amount * multiplier };
        }

        return { value: null };
    }

    static extractExchangeRatio(text) {
        const pattern = /exchange ratio of ([\d\.]+)/i;
        const match = text.match(pattern);
        return match ? parseFloat(match[1]) : null;
    }

    static extractPremium(text) {
        const pattern = /premium of ([\d\.]+)%/i;
        const match = text.match(pattern);
        
        return {
            percentage: match ? parseFloat(match[1]) : null,
            basis: this.extractPattern(text, /premium.*?based on.*?([^\n\.]+)/i)
        };
    }

    static extractPricePerShare(text) {
        const pattern = /\$?([\d\.]+)\s+per share/i;
        const match = text.match(pattern);
        return match ? parseFloat(match[1]) : null;
    }

    static extractEnterpriseValue(text) {
        const pattern = /enterprise value of (?:approximately )?\$?([\d,\.]+)\s*(million|billion)/i;
        const match = text.match(pattern);
        
        if (match) {
            const amount = parseFloat(match[1].replace(/,/g, ''));
            const multiplier = match[2].toLowerCase() === 'billion' ? 1000 : 1;
            return amount * multiplier;
        }

        return null;
    }

    static extractEquityValue(text) {
        const pattern = /equity value of (?:approximately )?\$?([\d,\.]+)\s*(million|billion)/i;
        const match = text.match(pattern);
        
        if (match) {
            const amount = parseFloat(match[1].replace(/,/g, ''));
            const multiplier = match[2].toLowerCase() === 'billion' ? 1000 : 1;
            return amount * multiplier;
        }

        return null;
    }

    static parseFinancing(text) {
        return {
            debtFinancing: /debt financing|term loan|credit facility/i.test(text),
            equityFinancing: /equity financing|stock issuance/i.test(text),
            cashOnHand: /cash on hand|existing cash/i.test(text),
            
            committed: /committed financing|financing commitment/i.test(text),
            
            financingAmount: this.extractPattern(text, /financing.*?\$?([\d,\.]+)\s*(?:million|billion)/i)
        };
    }

    static extractSubsidiaries(text) {
        const subsidiaries = [];
        const pattern = /subsidiary.*?([A-Z][a-zA-Z\s&,.]+(?:Inc\.|Corp\.|LLC|Ltd\.))/gi;
        
        let match;
        while ((match = pattern.exec(text)) !== null && subsidiaries.length < 10) {
            subsidiaries.push(match[1].trim());
        }

        return [...new Set(subsidiaries)]; // Déduplicate
    }

    static extractAuditors(text) {
        const auditors = [
            'Deloitte', 'PwC', 'PricewaterhouseCoopers', 'EY', 'Ernst & Young',
            'KPMG', 'BDO', 'Grant Thornton', 'RSM', 'Crowe'
        ];

        return auditors.filter(auditor => 
            new RegExp(this.escapeRegex(auditor), 'i').test(text)
        );
    }

    static extractRegulatoryConditions(text) {
        const conditions = [];
        
        if (/HSR.*approval/i.test(text)) conditions.push('HSR Act clearance');
        if (/antitrust.*approval/i.test(text)) conditions.push('Antitrust approval');
        if (/foreign.*approval/i.test(text)) conditions.push('Foreign regulatory approval');
        if (/banking.*approval/i.test(text)) conditions.push('Banking regulatory approval');
        
        return conditions;
    }

    static extractSynergySources(text) {
        const sources = [];
        
        if (/operational.*synerg/i.test(text)) sources.push('Operational efficiencies');
        if (/cost.*reduction|cost.*saving/i.test(text)) sources.push('Cost reductions');
        if (/revenue.*synerg/i.test(text)) sources.push('Revenue enhancements');
        if (/technology.*synerg/i.test(text)) sources.push('Technology synergies');
        if (/scale.*econom/i.test(text)) sources.push('Economies of scale');
        
        return sources;
    }

    static extractStrategicRationale(text) {
        const section = this.extractSection(text, 'strategic rationale|reasons for', 1000);
        return section.substring(0, 500);
    }

    static extractRiskExcerpts(text) {
        const excerpts = [];
        const sentences = text.split(/[.!?]/);
        
        for (const sentence of sentences) {
            if (/\brisk\b/i.test(sentence) && sentence.length > 50) {
                excerpts.push(sentence.trim());
                if (excerpts.length >= 5) break;
            }
        }

        return excerpts;
    }

    static extractReverseBreakUpFee(text) {
        const pattern = /reverse.*(?:termination|break.?up) fee of \$?([\d,\.]+)\s*(million|billion)/i;
        const match = text.match(pattern);
        
        if (match) {
            const amount = parseFloat(match[1].replace(/,/g, ''));
            const multiplier = match[2].toLowerCase() === 'billion' ? 1000 : 1;
            return amount * multiplier;
        }

        return null;
    }

    static extractTerminationTriggers(text) {
        const triggers = [];
        
        if (/superior proposal/i.test(text)) triggers.push('Superior proposal received');
        if (/material breach/i.test(text)) triggers.push('Material breach of agreement');
        if (/regulatory.*denial/i.test(text)) triggers.push('Regulatory denial');
        if (/shareholder.*fail/i.test(text)) triggers.push('Failure to obtain shareholder approval');
        if (/outside date/i.test(text)) triggers.push('Outside date reached');
        
        return triggers;
    }

    static extractVotingRequirement(text, party) {
        const pattern = new RegExp(`${party}.*?(\\d+)%.*?(?:vote|approval)`, 'i');
        const match = text.match(pattern);
        return match ? `${match[1]}%` : 'Majority';
    }

    static extractSection(text, sectionName, maxLength = 2000) {
        const regex = new RegExp(`${sectionName}[\\s\\S]{0,${maxLength}}`, 'i');
        const match = text.match(regex);
        return match ? match[0] : '';
    }

    static calculateDealQualityScore(parsed) {
        let score = 50; // Base score

        // Financial terms clarity
        if (parsed.financialTerms?.dealValue) score += 15;
        if (parsed.financialTerms?.breakUpFee) score += 10;
        if (parsed.financialTerms?.exchangeRatio) score += 5;

        // Advisor quality
        if (parsed.advisors?.allFinancialAdvisors?.length > 0) score += 10;
        if (parsed.advisors?.allLegalCounsel?.length > 0) score += 5;

        // Synergies identified
        if (parsed.synergies?.totalSynergies) score += 10;

        // Regulatory clarity
        if (parsed.regulatory?.approvalsRequired?.length > 0) score += 5;

        return Math.min(100, score);
    }

    static calculateCompletionProbability(parsed) {
        let probability = 70; // Base probability

        // Break-up fee presence (commitment signal)
        if (parsed.terminationClauses?.hasBreakUpFee) probability += 15;

        // Shareholder support
        if (parsed.shareholderInfo?.supportAgreements) probability += 10;

        // Regulatory complexity
        const approvals = parsed.regulatory?.approvalsRequired?.length || 0;
        if (approvals > 4) probability -= 20;
        else if (approvals > 2) probability -= 10;

        // Risk factors
        const riskCount = parsed.riskFactors?.riskCount || 0;
        if (riskCount > 7) probability -= 15;

        return Math.max(0, Math.min(100, probability));
    }

    static estimateTimeline(parsed) {
        let months = 6; // Base timeline

        // Regulatory complexity
        const approvals = parsed.regulatory?.approvalsRequired || [];
        if (approvals.some(a => a.authority === 'FTC' || a.authority === 'DOJ')) months += 6;
        if (approvals.some(a => a.authority === 'EC')) months += 9;
        if (approvals.some(a => a.authority === 'CFIUS')) months += 4;

        // Shareholder vote
        if (approvals.some(a => a.authority === 'Shareholders')) months += 2;

        return months;
    }

    static calculateRiskScore(parsed) {
        const riskCount = parsed.riskFactors?.riskCount || 0;
        const approvals = parsed.regulatory?.approvalsRequired?.length || 0;

        let score = (riskCount * 5) + (approvals * 8);
        return Math.min(100, score);
    }

    static calculateAdvisorPrestige(advisors) {
        if (!advisors) return 0;

        const topLawFirms = ['Wachtell', 'Skadden', 'Cravath', 'Sullivan & Cromwell', 'Davis Polk'];
        const topBanks = ['Goldman Sachs', 'Morgan Stanley', 'J.P. Morgan', 'Lazard', 'Evercore'];

        let score = 0;

        advisors.allLegalCounsel?.forEach(firm => {
            if (topLawFirms.some(top => firm.includes(top))) score += 20;
        });

        advisors.allFinancialAdvisors?.forEach(bank => {
            if (topBanks.some(top => bank.includes(top))) score += 20;
        });

        return Math.min(100, score);
    }

    static escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}

// Export global
window.FormS4Parser = FormS4Parser;