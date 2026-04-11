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

// Fonction principale de calcul du salaire
function calculatePayroll(data) {
  const {
    salaire_base,
    heures_sup = 0,
    jours_absence = 0,
    grade = 'Employee',
    objectifs = false,
    anciennete_mois = 0
  } = data;

  const tauxHoraire = salaire_base / 160;

  const heuresSupMontant = calculateOvertimePay(heures_sup, tauxHoraire);
  const deductionAbsence = calculateAbsenceDeduction(salaire_base, jours_absence);
  const primeManager = calculateManagerBonus(grade);
  const bonusPerformance = calculatePerformanceBonus(salaire_base, objectifs, anciennete_mois);

  const salaireFinal = salaire_base + heuresSupMontant - deductionAbsence + primeManager + bonusPerformance;

  return {
    salaire_base,
    salaire_final: parseFloat(salaireFinal.toFixed(2)),
    details: {
      heures_sup_montant: parseFloat(heuresSupMontant.toFixed(2)),
      deduction_absence: parseFloat(deductionAbsence.toFixed(2)),
      prime_manager: primeManager,
      bonus_performance: parseFloat(bonusPerformance.toFixed(2)),
      taux_horaire_calcule: parseFloat(tauxHoraire.toFixed(2))
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