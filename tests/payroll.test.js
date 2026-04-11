const { calculatePayroll } = require('../routes/payroll');

describe('SmartHR Payroll Tests', () => {

test('Cas nominal complet', () => {
  const result = calculatePayroll({
    salaire_base: 2000,
    heures_sup: 12,
    jours_absence: 3,
    grade: 'Manager',
    objectifs: true,
    anciennete_mois: 18
  });
  expect(result.salaire_final).toBe(2437.5);
});

  test('Règle 1: Heures sup > 10', () => {
    const result = calculatePayroll({
      salaire_base: 2000,
      heures_sup: 12,
      jours_absence: 0,
      grade: 'Employee',
      objectifs: false,
      anciennete_mois: 18
    });
    expect(result.details.heures_sup_montant).toBe(37.5);
  });

  test('Règle 1: Heures sup <= 10 (pas de majoration)', () => {
    const result = calculatePayroll({
      salaire_base: 2000,
      heures_sup: 5,
      jours_absence: 0,
      grade: 'Employee',
      objectifs: false,
      anciennete_mois: 18
    });
    expect(result.details.heures_sup_montant).toBe(0);
  });

  test('Règle 2: Absences > 2 jours', () => {
    const result = calculatePayroll({
      salaire_base: 2000,
      heures_sup: 0,
      jours_absence: 4,
      grade: 'Employee',
      objectifs: false,
      anciennete_mois: 18
    });
    expect(result.details.deduction_absence).toBe(400);
  });

  test('Règle 2: Absences <= 2 jours (pas de déduction)', () => {
    const result = calculatePayroll({
      salaire_base: 2000,
      heures_sup: 0,
      jours_absence: 2,
      grade: 'Employee',
      objectifs: false,
      anciennete_mois: 18
    });
    expect(result.details.deduction_absence).toBe(0);
  });

  test('Règle 3: Prime Manager', () => {
    const result = calculatePayroll({
      salaire_base: 2000,
      heures_sup: 0,
      jours_absence: 0,
      grade: 'Manager',
      objectifs: false,
      anciennete_mois: 18
    });
    expect(result.details.prime_manager).toBe(500);
  });

  test('Règle 3: Pas de prime pour les non-managers', () => {
    const result = calculatePayroll({
      salaire_base: 2000,
      heures_sup: 0,
      jours_absence: 0,
      grade: 'Employee',
      objectifs: false,
      anciennete_mois: 18
    });
    expect(result.details.prime_manager).toBe(0);
  });

  test('Règle 4: Bonus objectifs + ancienneté >= 1 an', () => {
    const result = calculatePayroll({
      salaire_base: 2000,
      heures_sup: 0,
      jours_absence: 0,
      grade: 'Employee',
      objectifs: true,
      anciennete_mois: 18
    });
    expect(result.details.bonus_performance).toBe(200);
  });

  test('Règle 4: Pas de bonus si ancienneté < 1 an', () => {
    const result = calculatePayroll({
      salaire_base: 2000,
      heures_sup: 0,
      jours_absence: 0,
      grade: 'Employee',
      objectifs: true,
      anciennete_mois: 6
    });
    expect(result.details.bonus_performance).toBe(0);
  });

  test('Règle 4: Pas de bonus si objectifs non atteints', () => {
    const result = calculatePayroll({
      salaire_base: 2000,
      heures_sup: 0,
      jours_absence: 0,
      grade: 'Employee',
      objectifs: false,
      anciennete_mois: 18
    });
    expect(result.details.bonus_performance).toBe(0);
  });
});