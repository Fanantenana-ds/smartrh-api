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

function validateNumberParam(value, name) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`${name} doit être un nombre valide`);
  }
  return value;
}

function assertRequiredNumber(value, name) {
  if (value === undefined || value === null) {
    throw new Error(`${name} est requis`);
  }
  return validateNumberParam(value, name);
}

function calculatePayroll(data) {
  const {
    salaire_base,
    heures_sup = 0,
    jours_absence = 0,
    grade = 'Employee',
    objectifs = false,
    anciennete_mois = 0
  } = data;

  assertRequiredNumber(salaire_base, 'salaire_base');
  validateNumberParam(heures_sup, 'heures_sup');
  validateNumberParam(jours_absence, 'jours_absence');

  const tauxHoraire = salaire_base / 160;

  const heuresSupMontant = calculateOvertimePay(heures_sup, tauxHoraire);
  const deductionAbsence = calculateAbsenceDeduction(salaire_base, jours_absence);
  const primeManager = calculateManagerBonus(grade);
  const bonusPerformance = calculatePerformanceBonus(
    salaire_base,
    objectifs,
    anciennete_mois
  );

  const salaireFinal =
    salaire_base +
    heuresSupMontant -
    deductionAbsence +
    primeManager +
    bonusPerformance;

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
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
module.exports.calculatePayroll = calculatePayroll;