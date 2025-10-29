# 💰 Personal Finance Dashboard

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![HTML](https://img.shields.io/badge/HTML-5-orange.svg)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow.svg)
![Highcharts](https://img.shields.io/badge/Highcharts-11.0-purple.svg)

**Un dashboard financier interactif complet pour gérer, analyser et optimiser votre portefeuille d'investissement**

[🚀 Démo Live](#) | [📖 Documentation](#features) | [🐛 Report Bug](https://github.com/VOTRE-USERNAME/financial-dashboard/issues)

</div>

---

## 📋 Table des Matières

- [À Propos](#-à-propos)
- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Utilisation](#-utilisation)
- [Structure du Projet](#-structure-du-projet)
- [Captures d'Écran](#-captures-décran)
- [Roadmap](#-roadmap)
- [Contribution](#-contribution)
- [Auteur](#-auteur)
- [License](#-license)

---

## 🎯 À Propos

**Personal Finance Dashboard** est une suite complète d'outils financiers développée en HTML/CSS/JavaScript pur, permettant de :

- 📊 Gérer un budget personnel sur une timeline dynamique (300+ mois)
- 🎲 Simuler l'évolution d'un portefeuille avec Monte Carlo (1000+ simulations)
- 📈 Optimiser l'allocation d'actifs avec le modèle de Markowitz
- ⚖️ Équilibrer le risque avec la stratégie Risk Parity
- 🔍 Tester la résilience du portefeuille face à 6 scénarios historiques

**100% Client-Side** : Aucun serveur requis, toutes les données sont stockées localement dans le navigateur (localStorage).

---

## ✨ Fonctionnalités

### 1️⃣ **Dashboard Budget** (`index.html`)

<details>
<summary>Cliquez pour voir les détails</summary>

#### 🔹 Gestion Budgétaire Dynamique
- **Timeline flexible** : Ajoutez des mois avant/après (1 ou 12 mois à la fois)
- **Suivi complet** : Revenus (Salaire, Divers) | Dépenses (Loyer, Nourriture, Fixes, Autres, Prêts)
- **Investissements** : Investissement mensuel + PEE L'Oréal
- **Calculs automatiques** : Épargne cumulée, gains d'investissement, ROI

#### 🔹 Outils Avancés
- **Bulk Edit** : Modifier plusieurs mois d'un coup (ex: augmentation de salaire)
- **Rendement estimé** : Calculer les gains d'investissement avec taux personnalisable
- **Ajustement inflation** : Visualiser les valeurs réelles (pouvoir d'achat)
- **Export/Import JSON** : Sauvegarder et partager vos données

#### 🔹 Visualisations
- Évolution Revenus vs Dépenses
- Répartition des revenus (camembert)
- Répartition des dépenses (camembert)
- Allocation budgétaire (Besoins/Envies/Épargne)
- Évolution de l'épargne cumulée
- Évolution du portefeuille d'investissement
- Évolution du ROI

</details>

---

### 2️⃣ **Monte Carlo Simulation** (`monte-carlo.html`)

<details>
<summary>Cliquez pour voir les détails</summary>

#### 🔹 Simulation Stochastique
- **Paramètres personnalisables** :
  - Investissement mensuel
  - Rendement mensuel estimé
  - Volatilité du marché
  - Horizon temporel (années)
  - Nombre de simulations (100-10,000+)
  - Objectif financier

#### 🔹 Analyse Probabiliste
- **Percentiles** : P10 (pessimiste), Médiane, P90 (optimiste)
- **Analyse de risque** : VaR 5%, probabilité de perte
- **Temps pour atteindre l'objectif** : Distribution temporelle
- **Stress testing** : 5 scénarios de marché
- **Ajustement inflation** : Rendements réels vs nominaux

#### 🔹 Visualisations
- Évolution du portefeuille (fan chart avec trajectoires)
- Distribution des rendements finaux (histogramme)
- Analyse de probabilité (atteinte de l'objectif)
- Métriques de risque (VaR, ROI, taux de perte)
- Tests de stress (crise, récession, bull market)
- Temps pour atteindre la cible

</details>

---

### 3️⃣ **Portfolio Optimizer - Markowitz** (`portfolio-optimizer.html`)

<details>
<summary>Cliquez pour voir les détails</summary>

#### 🔹 Optimisation Mean-Variance
- **Définition d'actifs** : Nom, rendement espéré, volatilité, corrélations
- **Frontière efficiente** : 5000 portefeuilles aléatoires générés
- **Portefeuilles optimaux** :
  - **Max Sharpe Ratio** : Meilleur rendement ajusté au risque
  - **Minimum Variance** : Risque minimal

#### 🔹 Paramètres
- Taux sans risque personnalisable
- Ajustement pour l'inflation
- Gestion dynamique des actifs (ajout/suppression)

#### 🔹 Visualisations
- Frontière efficiente (scatter plot)
- Allocation optimale Max Sharpe (camembert)
- Allocation Minimum Variance (camembert)
- Tableau détaillé des allocations

</details>

---

### 4️⃣ **Risk Parity** (`risk-parity.html`)

<details>
<summary>Cliquez pour voir les détails</summary>

#### 🔹 Equal Risk Contribution
- **Principe** : Chaque actif contribue équitablement au risque total
- **Méthodologie** : Inverse Volatility Weighting
- **Comparaison** : Risk Parity vs Equal Weight (naïf)

#### 🔹 Métriques
- Volatilité du portefeuille (Risk Parity vs Equal Weight)
- Réduction de volatilité (%)
- Qualité de l'équilibre du risque
- Bénéfice de diversification

#### 🔹 Visualisations
- Allocation Risk Parity (camembert)
- Allocation Equal Weight (camembert)
- Contribution au risque par actif (barres)
- Tableau comparatif détaillé

</details>

---

### 5️⃣ **Scenario Analysis** (`scenario-analysis.html`)

<details>
<summary>Cliquez pour voir les détails</summary>

#### 🔹 Stress Testing Historique
Testez votre portefeuille sur **6 événements majeurs** :

1. **🔴 Crise Financière 2008** : Effondrement bancaire mondial
2. **📈 Inflation 1970s** : Stagflation, chocs pétroliers
3. **🚀 Bulle Tech 1999** : Euphorie dot-com
4. **🦠 COVID-19 2020** : Confinements, relance massive
5. **📉 Récession Modérée** : Ralentissement économique typique
6. **🟢 Bull Market Fort** : Expansion économique

#### 🔹 Analyse
- **Meilleur/pire cas** : Rendements extrêmes
- **Rendement moyen** : Performance moyenne sur tous les scénarios
- **Taux de réussite** : Nombre de scénarios positifs
- **Recommandations personnalisées** : Ajustements suggérés

#### 🔹 Visualisations
- Performance par scénario (barres)
- Profil risque/rendement (scatter)
- Tableau détaillé avec décomposition par actif
- Recommandations d'allocation

</details>

---

## 🛠️ Technologies

### Frontend
- **HTML5** : Structure sémantique
- **CSS3** : Animations, gradients, responsive design
- **JavaScript ES6+** : Modules IIFE, Arrow functions, Promises

### Bibliothèques
- **[Highcharts 11.0](https://www.highcharts.com/)** : Graphiques interactifs
  - Core, Highcharts-more, Heatmap, Exporting modules

### Stockage
- **LocalStorage API** : Sauvegarde automatique locale

### Algorithmes Financiers
- **Monte Carlo** : Simulation stochastique avec Box-Muller transform
- **Markowitz** : Optimisation mean-variance avec matrice de covariance
- **Risk Parity** : Inverse volatility weighting
- **Scenario Analysis** : Stress testing historique

---

## 📥 Installation

### Prérequis
- Un navigateur moderne (Chrome, Firefox, Safari, Edge)
- Aucune installation de serveur requise !

### Étapes

#### **Option 1 : Clone Git**