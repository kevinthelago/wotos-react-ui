/**
 * WoT ricochet / penetration math module.
 *
 * MVP note: range-based pen fall-off is not modelled. penAt100m is used as a
 * flat value regardless of the `hit.range` field. Wire in a fall-off curve once
 * real per-shell data is available.
 *
 * RNG is injected via `rng` (0-arg fn returning [0,1]) for deterministic testing.
 */

const RICOCHET_THRESHOLD = {
  AP:   (70 * Math.PI) / 180,
  APCR: (70 * Math.PI) / 180,
  HEAT: (85 * Math.PI) / 180,
  HE:   null,
};

const NORMALIZATION = {
  AP:   (5 * Math.PI) / 180,
  APCR: (5 * Math.PI) / 180,
  HEAT: (2 * Math.PI) / 180,
  HE:   0,
};

/**
 * @param {{ type: 'AP'|'APCR'|'HEAT'|'HE', caliberMm: number, penAt100m: number, damage: number }} shell
 * @param {{ thicknessMm: number, impactAngleRad: number, shellAxisRad?: number, range?: number }} hit
 *   impactAngleRad — angle between the incoming shell velocity vector and the armor normal (0 = straight on).
 *   shellAxisRad   — angle between the armor surface normal and the shell's own axis; defaults to impactAngleRad.
 * @param {{ rng?: () => number }} opts
 * @returns {{ ricochet: boolean, overmatch: boolean, effectiveArmorMm: number, penetrationMm: number, penetrated: boolean, damageRoll: number }}
 */
export function penetrate(shell, hit, { rng = Math.random } = {}) {
  const { type, caliberMm, penAt100m, damage } = shell;
  const { thicknessMm, impactAngleRad } = hit;
  // shellAxisRad defaults to impactAngleRad (shell flies straight at the plate)
  const shellAxisRad = hit.shellAxisRad !== undefined ? hit.shellAxisRad : impactAngleRad;

  // Step 1 — angle between impact normal and shell axis
  const impactAngle = Math.abs(impactAngleRad);
  const shellAngle  = Math.abs(shellAxisRad);

  // Step 2 — three-caliber overmatch check (caliber >= 3× thickness)
  const overmatch = caliberMm >= 3 * thicknessMm;

  // Step 3 — ricochet (before normalization; overmatch prevents it)
  const threshold = RICOCHET_THRESHOLD[type];
  const ricochet =
    !overmatch &&
    threshold !== null &&
    impactAngle > threshold;

  if (ricochet) {
    return {
      ricochet: true,
      overmatch: false,
      effectiveArmorMm: Infinity,
      penetrationMm: penAt100m,
      penetrated: false,
      damageRoll: 0,
    };
  }

  // Step 4 — normalization
  let norm = NORMALIZATION[type];
  if (overmatch) norm *= 2;

  const angleAfterNorm = Math.max(0, impactAngle - norm);

  // Step 5 — effective armor
  const cosAngle = Math.cos(angleAfterNorm);
  // Guard against near-grazing shots that would blow up (cos ≈ 0)
  const effectiveArmorMm = cosAngle > 1e-6 ? thicknessMm / cosAngle : Infinity;

  // Step 6 — penetration (range fall-off deferred; use flat penAt100m)
  const penetrationMm = penAt100m;

  // Step 7 — outcome
  const penetrated = penetrationMm >= effectiveArmorMm;

  // Step 8 — damage roll [0.75, 1.25] if penetrated, else 0
  const damageRoll = penetrated ? damage * (0.75 + rng() * 0.5) : 0;

  return {
    ricochet: false,
    overmatch,
    effectiveArmorMm,
    penetrationMm,
    penetrated,
    damageRoll,
  };
}
