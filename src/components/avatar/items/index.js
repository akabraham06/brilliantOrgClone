/**
 * Registry mapping cosmetic item ids → bespoke SVG components. Each component is
 * a default export returning an SVG <g> fragment authored against the shared
 * avatar coordinate contract (viewBox 0 0 120 140; head center ≈ 60,40 r≈24).
 *
 * The consumer (Avatar renderer) looks items up by their kebab-case id. Unknown
 * ids should be skipped silently so the catalog and the art can evolve apart.
 */

// Headwear
import TopHat from './TopHat.jsx';
import GraduationCap from './GraduationCap.jsx';
import Beanie from './Beanie.jsx';
import Crown from './Crown.jsx';
import WizardHat from './WizardHat.jsx';
import PartyHat from './PartyHat.jsx';
import Beret from './Beret.jsx';
import CowboyHat from './CowboyHat.jsx';
import BaseballCap from './BaseballCap.jsx';
import FlaskHelmet from './FlaskHelmet.jsx';
import Headband from './Headband.jsx';
import Halo from './Halo.jsx';

// Eyewear
import RoundGlasses from './RoundGlasses.jsx';
import Sunglasses from './Sunglasses.jsx';
import LabGoggles from './LabGoggles.jsx';
import Monocle from './Monocle.jsx';
import ThreeDGlasses from './ThreeDGlasses.jsx';
import StarShades from './StarShades.jsx';
import Visor from './Visor.jsx';
import SafetySpecs from './SafetySpecs.jsx';

// Tops
import LabCoat from './LabCoat.jsx';
import Hoodie from './Hoodie.jsx';
import Tee from './Tee.jsx';
import Sweater from './Sweater.jsx';
import Tuxedo from './Tuxedo.jsx';
import VarsityJacket from './VarsityJacket.jsx';
import Flannel from './Flannel.jsx';
import TankTop from './TankTop.jsx';
import Raincoat from './Raincoat.jsx';
import Polo from './Polo.jsx';
import PufferVest from './PufferVest.jsx';
import Turtleneck from './Turtleneck.jsx';

// Bottoms
import Jeans from './Jeans.jsx';
import Shorts from './Shorts.jsx';
import Skirt from './Skirt.jsx';
import CargoPants from './CargoPants.jsx';
import Sweatpants from './Sweatpants.jsx';
import Kilt from './Kilt.jsx';
import Overalls from './Overalls.jsx';
import TrackPants from './TrackPants.jsx';
import Slacks from './Slacks.jsx';

// Accessories
import Backpack from './Backpack.jsx';
import Scarf from './Scarf.jsx';
import Bowtie from './Bowtie.jsx';
import MedalNecklace from './MedalNecklace.jsx';
import Headphones from './Headphones.jsx';
import Cape from './Cape.jsx';
import Wristband from './Wristband.jsx';
import PinBadge from './PinBadge.jsx';
import Satchel from './Satchel.jsx';

export const ITEM_COMPONENTS = {
  // headwear
  'top-hat': TopHat,
  'graduation-cap': GraduationCap,
  'beanie': Beanie,
  'crown': Crown,
  'wizard-hat': WizardHat,
  'party-hat': PartyHat,
  'beret': Beret,
  'cowboy-hat': CowboyHat,
  'baseball-cap': BaseballCap,
  'flask-helmet': FlaskHelmet,
  'headband': Headband,
  'halo': Halo,
  // eyewear
  'round-glasses': RoundGlasses,
  'sunglasses': Sunglasses,
  'lab-goggles': LabGoggles,
  'monocle': Monocle,
  'three-d-glasses': ThreeDGlasses,
  'star-shades': StarShades,
  'visor': Visor,
  'safety-specs': SafetySpecs,
  // tops
  'lab-coat': LabCoat,
  'hoodie': Hoodie,
  'tee': Tee,
  'sweater': Sweater,
  'tuxedo': Tuxedo,
  'varsity-jacket': VarsityJacket,
  'flannel': Flannel,
  'tank-top': TankTop,
  'raincoat': Raincoat,
  'polo': Polo,
  'puffer-vest': PufferVest,
  'turtleneck': Turtleneck,
  // bottoms
  'jeans': Jeans,
  'shorts': Shorts,
  'skirt': Skirt,
  'cargo-pants': CargoPants,
  'sweatpants': Sweatpants,
  'kilt': Kilt,
  'overalls': Overalls,
  'track-pants': TrackPants,
  'slacks': Slacks,
  // accessories
  'backpack': Backpack,
  'scarf': Scarf,
  'bowtie': Bowtie,
  'medal-necklace': MedalNecklace,
  'headphones': Headphones,
  'cape': Cape,
  'wristband': Wristband,
  'pin-badge': PinBadge,
  'satchel': Satchel,
};

/** Look up a cosmetic item component by its kebab-case id (or null). */
export function getItemComponent(id) {
  return ITEM_COMPONENTS[id] || null;
}

// Backward-compatible aliases for the earlier renderer API.
export const ITEM_RENDERERS = ITEM_COMPONENTS;
export function getItemRenderer(id) {
  return ITEM_COMPONENTS[id] || null;
}
