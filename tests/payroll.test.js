const { calculatePayroll } = require('../routes/payroll');

describe('SmartHR Payroll Tests', () => {

  // ============================================================
  // TESTS DES 4 RÈGLES MÉTIER
  // ============================================================

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
      salaire_base: 2500,
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
      salaire_base: 2500,
      heures_sup: 0,
      jours_absence: 0,
      grade: 'Employee',
      objectifs: false,
      anciennete_mois: 18
    });
    expect(result.details.bonus_performance).toBe(0);
  });

  // ============================================================
  // TESTS SUPPLÉMENTAIRES POUR AUGMENTER LA COUVERTURE
  // ============================================================

  test('Cas limite : ancienneté exactement 12 mois', () => {
    const result = calculatePayroll({
      salaire_base: 2500,
      heures_sup: 0,
      jours_absence: 0,
      grade: 'Employee',
      objectifs: true,
      anciennete_mois: 12
    });
    // 10% de 2500 = 250 (corrigé de 200 à 250)
    expect(result.details.bonus_performance).toBe(250);
  });

  test('Cas limite : exactement 10 heures supplémentaires', () => {
    const result = calculatePayroll({
      salaire_base: 2000,
      heures_sup: 10,
      jours_absence: 0,
      grade: 'Employee',
      objectifs: false,
      anciennete_mois: 18
    });
    expect(result.details.heures_sup_montant).toBe(0);
  });

  test('Cas limite : salaire avec zéro absence et zéro bonus', () => {
    const result = calculatePayroll({
      salaire_base: 2000,
      heures_sup: 0,
      jours_absence: 0,
      grade: 'Employee',
      objectifs: false,
      anciennete_mois: 6
    });
    expect(result.salaire_final).toBe(2000);
  });

  test('Cas combiné : heures sup + bonus + absence', () => {
    const result = calculatePayroll({
      salaire_base: 3000,
      heures_sup: 15,
      jours_absence: 1,
      grade: 'Employee',
      objectifs: true,
      anciennete_mois: 24
    });
    expect(result.salaire_final).toBeDefined();
  });

  test('Cas extrême : toutes les valeurs nulles', () => {
    const result = calculatePayroll({
      salaire_base: 0,
      heures_sup: 0,
      jours_absence: 0,
      grade: 'Employee',
      objectifs: false,
      anciennete_mois: 0
    });
    expect(result.salaire_final).toBe(0);
  });

  // ============================================================
  // TESTS POUR COUVRIR LE BLOC CATCH (lignes 64-68)
  // ============================================================

  test('Gestion erreur : salaire_base manquant', () => {
    expect(() => {
      calculatePayroll({
        // salaire_base tsy misy
        heures_sup: 12,
        jours_absence: 3,
        grade: 'Manager',
        objectifs: true,
        anciennete_mois: 18
      });
    }).toThrow('salaire_base est requis');
  });

  test('Gestion erreur : salaire_base = null', () => {
    expect(() => {
      calculatePayroll({
        salaire_base: null,
        heures_sup: 12,
        jours_absence: 2,
        grade: 'Manager',
        objectifs: true,
        anciennete_mois: 18
      });
    }).toThrow('salaire_base est requis');
  });

  test('Gestion erreur : salaire_base = undefined', () => {
    expect(() => {
      calculatePayroll({
        salaire_base: undefined,
        heures_sup: 12,
        jours_absence: 4,
        grade: 'Manager',
        objectifs: true,
        anciennete_mois: 18
      });
    }).toThrow('salaire_base est requis');
  });
// test erreur
  test('Gestion erreur : salaire_base = NaN', () => {
    expect(() => {
      calculatePayroll({
        salaire_base: NaN,
        heures_sup: 12,
        jours_absence: 3,
        grade: 'Manager',
        objectifs: true,
        anciennete_mois: 18
      });
    }).toThrow('salaire_base doit être un nombre valide');
  });

  test('Gestion erreur : salaire_base = string non numérique', () => {
    expect(() => {
      calculatePayroll({
        salaire_base: "deux mille",
        heures_sup: 12,
        jours_absence: 3,
        grade: 'Manager',
        objectifs: true,
        anciennete_mois: 18
      });
    }).toThrow('salaire_base doit être un nombre valide');
  });
});
// ============================================================
// TESTS POUR LA ROUTE API (couvre les lignes 73-77)
// ============================================================

const express = require('express');
const request = require('supertest');
const app = express();

app.use(express.json());
app.use('/api', require('../routes/payroll'));

test('Route API POST /api/calculate-payroll - succès', async () => {
  const response = await request(app)
    .post('/api/calculate-payroll')
    .send({
      salaire_base: 2000,
      heures_sup: 12,
      jours_absence: 3,
      grade: 'Manager',
      objectifs: true,
      anciennete_mois: 18
    });
  expect(response.status).toBe(200);
  expect(response.body.salaire_final).toBe(2437.5);
});

test('Route API POST /api/calculate-payroll - erreur (salaire_base manquant)', async () => {
  const response = await request(app)
    .post('/api/calculate-payroll')
    .send({
      heures_sup: 12,
      jours_absence: 3,
      grade: 'Manager',
      objectifs: true,
      anciennete_mois: 18
    });
  expect(response.status).toBe(400);
  expect(response.body.error).toBeDefined();
});
// ============================================================
// TESTS POUR AUGMENTER LA COUVERTURE À 80%+
// ============================================================

test('Cas limite : heures sup négatives (doit être traité comme 0)', () => {
  const result = calculatePayroll({
    salaire_base: 2000,
    heures_sup: -5,
    jours_absence: 0,
    grade: 'Employee',
    objectifs: false,
    anciennete_mois: 18
  });
  expect(result.details.heures_sup_montant).toBe(0);
});

test('Cas limite : absences négatives', () => {
  const result = calculatePayroll({
    salaire_base: 2000,
    heures_sup: 0,
    jours_absence: -2,
    grade: 'Employee',
    objectifs: false,
    anciennete_mois: 18
  });
  expect(result.details.deduction_absence).toBe(0);
});

test('Cas limite : grade inconnu (ni Manager ni Employee)', () => {
  const result = calculatePayroll({
    salaire_base: 2000,
    heures_sup: 0,
    jours_absence: 0,
    grade: 'Directeur',
    objectifs: false,
    anciennete_mois: 18
  });
  expect(result.details.prime_manager).toBe(0);
});

test('Cas limite : objectifs = undefined', () => {
  const result = calculatePayroll({
    salaire_base: 2000,
    heures_sup: 0,
    jours_absence: 0,
    grade: 'Employee',
    objectifs: undefined,
    anciennete_mois: 18
  });
  expect(result.details.bonus_performance).toBe(0);
});

test('Cas limite : salaire_base très grand', () => {
  const result = calculatePayroll({
    salaire_base: 100000,
    heures_sup: 20,
    jours_absence: 1,
    grade: 'Manager',
    objectifs: true,
    anciennete_mois: 24
  });
  expect(result.salaire_final).toBeDefined();
  expect(result.salaire_final).toBeGreaterThan(100000);
});