import { penetrate } from './penetrate';
import fixtures from './__fixtures__/penetrate.fixtures.json';

// Run every fixture scenario
describe('penetrate() — fixture suite', () => {
  fixtures.forEach(({ id, description, shell, hit, rng: rngValue, expect: expected }) => {
    test(`${id}: ${description}`, () => {
      const rng = () => rngValue;
      const result = penetrate(shell, hit, { rng });

      for (const [key, val] of Object.entries(expected)) {
        if (key === 'damageRoll') {
          expect(result.damageRoll).toBeCloseTo(val, 5);
        } else {
          expect(result[key]).toBe(val);
        }
      }
    });
  });
});

// Structural / branch coverage for paths not fully exercised by fixtures
describe('penetrate() — unit branches', () => {
  const apShell = { type: 'AP', caliberMm: 100, penAt100m: 200, damage: 320 };

  test('shellAxisRad defaults to impactAngleRad when omitted', () => {
    const rng = () => 0.5;
    const withDefault = penetrate(apShell, { thicknessMm: 50, impactAngleRad: 0 }, { rng });
    const explicit    = penetrate(apShell, { thicknessMm: 50, impactAngleRad: 0, shellAxisRad: 0 }, { rng });
    expect(withDefault).toEqual(explicit);
  });

  test('effectiveArmorMm is Infinity when cos(angle) is effectively zero', () => {
    // 89.99° → cos ≈ 0.000017, but our 1e-6 guard kicks in when cos < 1e-6
    // We need cos < 1e-6, i.e. angle > ~89.9999°; force it with a direct angle
    // AP normalises 5° so we need impactAngle > ~89.9999° + 5° is impossible
    // Use HE (no normalisation) at ≈90° to get cos ≈ 0
    const heShell = { type: 'HE', caliberMm: 40, penAt100m: 50, damage: 200 };
    const result = penetrate(heShell, { thicknessMm: 10, impactAngleRad: Math.PI / 2 - 1e-8 });
    expect(result.effectiveArmorMm).toBe(Infinity);
    expect(result.penetrated).toBe(false);
  });

  test('rng default (Math.random) is used when no opts supplied', () => {
    const result = penetrate(apShell, { thicknessMm: 50, impactAngleRad: 0 });
    expect(result.penetrated).toBe(true);
    expect(result.damageRoll).toBeGreaterThanOrEqual(320 * 0.75);
    expect(result.damageRoll).toBeLessThanOrEqual(320 * 1.25);
  });

  test('ricochet result shape is complete', () => {
    const result = penetrate(apShell, { thicknessMm: 80, impactAngleRad: 1.2566 });
    expect(result).toMatchObject({
      ricochet: true,
      overmatch: false,
      effectiveArmorMm: Infinity,
      penetrationMm: 200,
      penetrated: false,
      damageRoll: 0,
    });
  });

  test('overmatch doubles normalization — effective armor lower than without', () => {
    const bigShell = { type: 'AP', caliberMm: 120, penAt100m: 200, damage: 320 };
    const thinPlate = { thicknessMm: 30, impactAngleRad: 1.2566 }; // 72°, caliber=120>=3*30
    const normalShell = { type: 'AP', caliberMm: 89, penAt100m: 200, damage: 320 }; // no overmatch

    const withOvermatch    = penetrate(bigShell, thinPlate);
    const withoutOvermatch = penetrate(normalShell, thinPlate);

    expect(withOvermatch.overmatch).toBe(true);
    expect(withoutOvermatch.overmatch).toBe(false);
    expect(withOvermatch.effectiveArmorMm).toBeLessThan(withoutOvermatch.effectiveArmorMm);
  });

  test('HEAT normalization gives higher effective armor than AP for same plate', () => {
    const heatShell = { type: 'HEAT', caliberMm: 105, penAt100m: 330, damage: 400 };
    const apShell2  = { type: 'AP',   caliberMm: 105, penAt100m: 330, damage: 400 };
    const plate     = { thicknessMm: 100, impactAngleRad: 0.5236 }; // 30°

    const heatResult = penetrate(heatShell, plate);
    const apResult   = penetrate(apShell2,  plate);

    // HEAT only normalises 2° vs AP's 5°, so effective armor must be thicker
    expect(heatResult.effectiveArmorMm).toBeGreaterThan(apResult.effectiveArmorMm);
  });
});
