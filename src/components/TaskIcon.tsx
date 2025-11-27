import React from 'react';
import { Platform, Image, ImageSourcePropType } from 'react-native';
import { SvgProps } from 'react-native-svg';

// Import SVG icons for native
import FoodIconSvg from '../assets/icons/food.svg';
import ToothBrushIconSvg from '../assets/icons/tooth-brush.svg';
import PlayIconSvg from '../assets/icons/play.svg';
import PoopSolidIconSvg from '../assets/icons/poop-solid.svg';
import PoopRunnyIconSvg from '../assets/icons/poop-runny.svg';
import PoopPalletIconSvg from '../assets/icons/poop-pallet.svg';
import PeeingIconSvg from '../assets/icons/peeing.svg';
import GroomingIconSvg from '../assets/icons/grooming.svg';
import PawLeftIconSvg from '../assets/icons/paw-left.svg';
import PawRightIconSvg from '../assets/icons/paw-right.svg';
import FleaIconSvg from '../assets/icons/flea.svg';
import PrescriptionBottleIconSvg from '../assets/icons/prescription-bottle.svg';
import VetIconSvg from '../assets/icons/vet.svg';
import SleepIconSvg from '../assets/icons/sleep.svg';

// Map task IDs to SVG components (for native)
const SVG_ICON_MAP: Record<string, React.FC<SvgProps>> = {
  'food': FoodIconSvg,
  'teeth-brushed': ToothBrushIconSvg,
  'playtime': PlayIconSvg,
  'poop': PoopSolidIconSvg,
  'poop-solid': PoopSolidIconSvg,
  'poop-runny': PoopRunnyIconSvg,
  'poop-pallet': PoopPalletIconSvg,
  'pee-frequency': PeeingIconSvg,
  'groomed': GroomingIconSvg,
  'nail-clipping': PawRightIconSvg,
  'paw-left': PawLeftIconSvg,
  'paw-right': PawRightIconSvg,
  'flea-treatment': FleaIconSvg,
  'deworming': PrescriptionBottleIconSvg,
  'vet-checkup': VetIconSvg,
  'sleeping-resp-rate': SleepIconSvg,
};

// Map task IDs to PNG images (for web)
const PNG_ICON_MAP: Record<string, ImageSourcePropType> = {
  'food': require('../assets/icons-png/food.png'),
  'teeth-brushed': require('../assets/icons-png/tooth-brush.png'),
  'playtime': require('../assets/icons-png/play.png'),
  'poop': require('../assets/icons-png/poop-solid.png'),
  'poop-solid': require('../assets/icons-png/poop-solid.png'),
  'poop-runny': require('../assets/icons-png/poop-runny.png'),
  'poop-pallet': require('../assets/icons-png/poop-pallet.png'),
  'pee-frequency': require('../assets/icons-png/peeing.png'),
  'groomed': require('../assets/icons-png/grooming.png'),
  'nail-clipping': require('../assets/icons-png/paw-right.png'),
  'paw-left': require('../assets/icons-png/paw-left.png'),
  'paw-right': require('../assets/icons-png/paw-right.png'),
  'flea-treatment': require('../assets/icons-png/flea.png'),
  'deworming': require('../assets/icons-png/prescription-bottle.png'),
  'vet-checkup': require('../assets/icons-png/vet.png'),
  'sleeping-resp-rate': require('../assets/icons-png/sleep.png'),
};

const DEFAULT_PNG = require('../assets/icons-png/paw-left.png');

interface TaskIconProps {
  taskId: string;
  size?: number;
  color?: string;
}

export const TaskIcon: React.FC<TaskIconProps> = ({ 
  taskId, 
  size = 48,
  color,
}) => {
  // Use PNG on web, SVG on native
  if (Platform.OS === 'web') {
    const pngSource = PNG_ICON_MAP[taskId] || DEFAULT_PNG;
    return (
      <Image 
        source={pngSource}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    );
  }
  
  const IconComponent = SVG_ICON_MAP[taskId] || PawLeftIconSvg;
  return (
    <IconComponent 
      width={size} 
      height={size}
      {...(color ? { fill: color } : {})}
    />
  );
};

// Export wrapper components for special icons
export const PoopSolidIcon: React.FC<SvgProps> = (props) => {
  const size = (props.width as number) || 48;
  if (Platform.OS === 'web') {
    return <Image source={PNG_ICON_MAP['poop-solid']} style={{ width: size, height: size }} resizeMode="contain" />;
  }
  return <PoopSolidIconSvg {...props} />;
};

export const PoopRunnyIcon: React.FC<SvgProps> = (props) => {
  const size = (props.width as number) || 48;
  if (Platform.OS === 'web') {
    return <Image source={PNG_ICON_MAP['poop-runny']} style={{ width: size, height: size }} resizeMode="contain" />;
  }
  return <PoopRunnyIconSvg {...props} />;
};

export const PoopPalletIcon: React.FC<SvgProps> = (props) => {
  const size = (props.width as number) || 48;
  if (Platform.OS === 'web') {
    return <Image source={PNG_ICON_MAP['poop-pallet']} style={{ width: size, height: size }} resizeMode="contain" />;
  }
  return <PoopPalletIconSvg {...props} />;
};

export const PawLeftIcon: React.FC<SvgProps> = (props) => {
  const size = (props.width as number) || 48;
  if (Platform.OS === 'web') {
    return <Image source={PNG_ICON_MAP['paw-left']} style={{ width: size, height: size }} resizeMode="contain" />;
  }
  return <PawLeftIconSvg {...props} />;
};

export const PawRightIcon: React.FC<SvgProps> = (props) => {
  const size = (props.width as number) || 48;
  if (Platform.OS === 'web') {
    return <Image source={PNG_ICON_MAP['paw-right']} style={{ width: size, height: size }} resizeMode="contain" />;
  }
  return <PawRightIconSvg {...props} />;
};

export default TaskIcon;

