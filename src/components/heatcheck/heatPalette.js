/*
 * Shared palette for the Heat Check WebGL scenes. Colors are pulled straight
 * from the app's "heat" tokens (see HeatCheck.module.css / theme.css) so the
 * 3D embers, glow and depth field read as the same warm system as the rest of
 * the UI: ember orange, gold and deep red on the dark charcoal gradient — not a
 * separate, garish palette.
 */
export const HEAT = {
  // Near-white warm core for the hottest particles / glow centers.
  core: '#fff1cf',
  // theme.css --accent gold / heat gold.
  gold: '#f7c948',
  // Heat ember orange (border + CTA gradient stop).
  ember: '#ef6f3b',
  // Heat deep red (blaze accent).
  deepRed: '#e0452f',
};

/*
 * Smooth target "heat level" (0..1) for each streak tier. The live-round scene
 * eases its current level toward this target every frame, so glow intensity,
 * particle speed and color temperature ramp up with the player's combo instead
 * of snapping. Tiers mirror the thresholds in HeatCheck.jsx (heatTier()).
 */
export const TIER_LEVEL = {
  cold: 0.16,
  warm: 0.46,
  hot: 0.76,
  blaze: 1,
};
