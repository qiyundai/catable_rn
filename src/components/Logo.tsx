import React from 'react';
import LogoCali from '../assets/logos/logo-cali.svg';

interface LogoProps {
  width?: number;
  height?: number;
  style?: any;
}

export const Logo: React.FC<LogoProps> = ({ 
  width = 193, 
  height = 136, 
  style 
}) => (
  <LogoCali 
    width={width} 
    height={height} 
    style={style}
  />
);
