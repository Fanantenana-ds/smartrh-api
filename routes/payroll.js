const express = require('express');
const router = express.Router();

function calculatePayroll(data) {
  let salaireBase = data.salaire_base;
  let heuresSup = data.heures_sup;
  let joursAbsence = data.jours_absence;
  let grade = data.grade;
  let objectifs = data.objectifs;
  let ancienneteMois = data.anciennete_mois;

  let tauxHoraire = salaireBase / 160;
  let heuresSupMontant = 0;
  let deductionAbsence = 0;
  let primeManager = 0;
  let bonusPerformance = 0;

  // Règle 1 : Heures supplémentaires
  if (heuresSup > 10) {
    heuresSupMontant = (heuresSup - 10) * tauxHoraire * 1.5;
  }

  // Règle 2 : Absences
  if (joursAbsence > 2) {
    deductionAbsence = salaireBase * 0.05 * joursAbsence;
  }

  // Règle 3 : Prime Manager
  if (grade === 'Manager') {
    primeManager = 500;
  }

  // Règle 4 : Bonus objectifs
  if (objectifs === true) {
    if (ancienneteMois >= 12) {
      bonusPerformance = salaireBase * 0.1;
    }
  }

  let salaireFinal = salaireBase + heuresSupMontant - deductionAbsence + primeManager + bonusPerformance;

  return {
    salaire_base: salaireBase,
    salaire_final: salaireFinal,
    details: {
      heures_sup_montant: heuresSupMontant,
      deduction_absence: deductionAbsence,
      prime_manager: primeManager,
      bonus_performance: bonusPerformance,
      taux_horaire_calcule: tauxHoraire
    }
  };
}

router.post('/calculate-payroll', (req, res) => {
  try {
    const result = calculatePayroll(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;