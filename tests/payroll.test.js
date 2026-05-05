const { calculatePayroll } = require('../routes/payroll');
const request = require('supertest');
const express = require('express');
const payrollRoute = require('../routes/payroll');

const app = express();
app.use(express.json());
app.use('/', payrollRoute);

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
  // TESTS SUPPLÉMENTAIRES
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
  // TESTS POUR LA VALIDATION DES ERREURS (TypeError)
  // ============================================================

  test('Gestion erreur : salaire_base manquant', () => {
    expect(() => {
      calculatePayroll({
        heures_sup: 12,
        jours_absence: 3,
        grade: 'Manager',
        objectifs: true,
        anciennete_mois: 18
      });
    }).toThrow(TypeError);
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
    }).toThrow(TypeError);
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
    }).toThrow(TypeError);
  });

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
    }).toThrow(TypeError);
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
    }).toThrow(TypeError);
  });

  test('Gestion erreur : heures_sup négatives', () => {
    expect(() => {
      calculatePayroll({
        salaire_base: 2000,
        heures_sup: -5,
        jours_absence: 0,
        grade: 'Employee',
        objectifs: false,
        anciennete_mois: 18
      });
    }).toThrow(TypeError);
  });

  test('Gestion erreur : jours_absence négatifs', () => {
    expect(() => {
      calculatePayroll({
        salaire_base: 2000,
        heures_sup: 0,
        jours_absence: -3,
        grade: 'Employee',
        objectifs: false,
        anciennete_mois: 18
      });
    }).toThrow(TypeError);
  });

  test('Gestion erreur : anciennete_mois négatif', () => {
    expect(() => {
      calculatePayroll({
        salaire_base: 2000,
        heures_sup: 0,
        jours_absence: 0,
        grade: 'Employee',
        objectifs: false,
        anciennete_mois: -12
      });
    }).toThrow(TypeError);
  });

  test('Gestion erreur : salaire_base négatif', () => {
    expect(() => {
      calculatePayroll({
        salaire_base: -100,
        heures_sup: 0,
        jours_absence: 0,
        grade: 'Employee',
        objectifs: false,
        anciennete_mois: 18
      });
    }).toThrow(TypeError);
  });

  // ============================================================
  // TESTS DE LA ROUTE API
  // ============================================================

  test('POST /calculate-payroll - succès (200)', async () => {
    const res = await request(app)
      .post('/calculate-payroll')
      .send({
        salaire_base: 2000,
        heures_sup: 10,
        jours_absence: 0,
        grade: 'Employee',
        objectifs: false,
        anciennete_mois: 12
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('salaire_final');
  });

  test('POST /calculate-payroll - erreur (400) car salaire_base manquant', async () => {
    const res = await request(app)
      .post('/calculate-payroll')
      .send({
        heures_sup: 12,
        jours_absence: 3,
        grade: 'Manager',
        objectifs: true,
        anciennete_mois: 18
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('POST /calculate-payroll - erreur (400) heures sup négatives', async () => {
    const res = await request(app)
      .post('/calculate-payroll')
      .send({
        salaire_base: 2000,
        heures_sup: -5,
        jours_absence: 0,
        grade: 'Employee',
        objectifs: false,
        anciennete_mois: 18
      });
    expect(res.statusCode).toBe(400);
  });
});