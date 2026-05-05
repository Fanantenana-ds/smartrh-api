const express = require('express');
const router = express.Router();

// Règle 1: Calcul des heures supplémentaires
function calculateOvertimePay(heuresSup, tauxHoraire) {
  if (heuresSup <= 10) return 0;
  return (heuresSup - 10) * tauxHoraire * 1.5;
}

// Règle 2: Calcul des déductions pour absences
function calculateAbsenceDeduction(salaireBase, joursAbsence) {
  if (joursAbsence <= 2) return 0;
  return salaireBase * 0.05 * joursAbsence;
}

// Règle 3: Prime manager
function calculateManagerBonus(grade) {
  if (grade !== 'Manager') return 0;
  return 500;
}

// Règle 4: Bonus performance
function calculatePerformanceBonus(salaireBase, objectifsAtteints, ancienneteMois) {
  if (!objectifsAtteints) return 0;
  if (ancienneteMois < 12) return 0;
  return salaireBase * 0.1;
}

// Validation d'un nombre (lance TypeError)
function validateNumberParam(value, name) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new TypeError(`${name} doit être un nombre valide`);
  }
  return value;
}

// Validation d'un nombre requis (lance TypeError)
function assertRequiredNumber(value, name) {
  if (value === undefined || value === null) {
    throw new TypeError(`${name} est requis`);
  }
  return validateNumberParam(value, name);
}

// Validation d'un nombre non négatif (lance TypeError)
function assertNonNegativeNumber(value, name) {
  if (value < 0) {
    throw new TypeError(`${name} ne peut pas être négatif`);
  }
  return value;
}

// Fonction principale de calcul du salaire avec validation
function calculatePayroll(data) {
  const {
    salaire_base,
    heures_sup = 0,
    jours_absence = 0,
    grade = 'Employee',
    objectifs = false,
    anciennete_mois = 0
  } = data;

  // Validations avec TypeError
  assertRequiredNumber(salaire_base, 'salaire_base');
  assertNonNegativeNumber(salaire_base, 'salaire_base');
  assertNonNegativeNumber(heures_sup, 'heures_sup');
  assertNonNegativeNumber(jours_absence, 'jours_absence');
  assertNonNegativeNumber(anciennete_mois, 'anciennete_mois');

  const tauxHoraire = salaire_base / 160;

  const heuresSupMontant = calculateOvertimePay(heures_sup, tauxHoraire);
  const deductionAbsence = calculateAbsenceDeduction(salaire_base, jours_absence);
  const primeManager = calculateManagerBonus(grade);
  const bonusPerformance = calculatePerformanceBonus(salaire_base, objectifs, anciennete_mois);

  const salaireFinal = salaire_base + heuresSupMontant - deductionAbsence + primeManager + bonusPerformance;

  return {
    salaire_base,
    salaire_final: Number.parseFloat(salaireFinal.toFixed(2)),
    details: {
      heures_sup_montant: Number.parseFloat(heuresSupMontant.toFixed(2)),
      deduction_absence: Number.parseFloat(deductionAbsence.toFixed(2)),
      prime_manager: primeManager,
      bonus_performance: Number.parseFloat(bonusPerformance.toFixed(2)),
      taux_horaire_calcule: Number.parseFloat(tauxHoraire.toFixed(2))
    }
  };
}

// Route API 
router.post('/calculate-payroll', (req, res) => {
  try {
    const result = calculatePayroll(req.body);
    res.json(result);
  } catch (error) {
    // Vérification du type d'erreur
    if (error instanceof TypeError) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  }
});

module.exports = router;
module.exports.calculatePayroll = calculatePayroll;