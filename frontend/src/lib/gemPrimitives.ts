import * as THREE from 'three';
import type { GemType } from '../types';

export interface GemMaterialConfig {
  color: string;
  emissive: string;
  metalness: number;
  roughness: number;
  transparent: boolean;
  opacity: number;
  refractionRatio: number;
  envMapIntensity: number;
}

export const GEM_MATERIALS: Record<GemType, GemMaterialConfig> = {
  diamond: {
    color: '#E8F4FD', emissive: '#88CCFF', metalness: 0.0, roughness: 0.0,
    transparent: true, opacity: 0.92, refractionRatio: 0.98, envMapIntensity: 3.0,
  },
  emerald: {
    color: '#00C853', emissive: '#004D20', metalness: 0.0, roughness: 0.1,
    transparent: true, opacity: 0.88, refractionRatio: 0.97, envMapIntensity: 2.0,
  },
  ruby: {
    color: '#FF1744', emissive: '#7F0000', metalness: 0.0, roughness: 0.05,
    transparent: true, opacity: 0.9, refractionRatio: 0.97, envMapIntensity: 2.2,
  },
  sapphire: {
    color: '#2979FF', emissive: '#002171', metalness: 0.0, roughness: 0.05,
    transparent: true, opacity: 0.9, refractionRatio: 0.97, envMapIntensity: 2.0,
  },
  amethyst: {
    color: '#AA00FF', emissive: '#4A0072', metalness: 0.0, roughness: 0.08,
    transparent: true, opacity: 0.85, refractionRatio: 0.96, envMapIntensity: 1.8,
  },
  topaz: {
    color: '#FFD740', emissive: '#FF6D00', metalness: 0.0, roughness: 0.05,
    transparent: true, opacity: 0.88, refractionRatio: 0.96, envMapIntensity: 2.0,
  },
};

export const METAL_MATERIALS: Record<string, Partial<THREE.MeshStandardMaterialParameters>> = {
  'yellow-gold': { color: '#FFD700', metalness: 0.95, roughness: 0.08, envMapIntensity: 1.5 },
  'white-gold':  { color: '#E8E8E8', metalness: 0.96, roughness: 0.07, envMapIntensity: 1.5 },
  'rose-gold':   { color: '#E8A090', metalness: 0.95, roughness: 0.09, envMapIntensity: 1.5 },
  'silver':      { color: '#C0C0C0', metalness: 0.90, roughness: 0.12, envMapIntensity: 1.2 },
  'platinum':    { color: '#E5E4E2', metalness: 0.97, roughness: 0.05, envMapIntensity: 1.8 },
};

export function createGemMaterial(gemType: GemType): THREE.MeshPhysicalMaterial {
  const cfg = GEM_MATERIALS[gemType];
  return new THREE.MeshPhysicalMaterial({
    color: cfg.color,
    emissive: cfg.emissive,
    emissiveIntensity: 0.15,
    metalness: cfg.metalness,
    roughness: cfg.roughness,
    transparent: cfg.transparent,
    opacity: cfg.opacity,
    transmission: 0.6,
    thickness: 1.0,
    ior: 1.0 / cfg.refractionRatio,
    envMapIntensity: cfg.envMapIntensity,
    side: THREE.DoubleSide,
  });
}

export function createMetalMaterial(metalType: string): THREE.MeshStandardMaterial {
  const cfg = METAL_MATERIALS[metalType] ?? METAL_MATERIALS['yellow-gold'];
  return new THREE.MeshStandardMaterial(cfg);
}

export const GEM_DISPLAY: Record<GemType, { label: string; hex: string }> = {
  diamond:  { label: 'Diamond',  hex: '#b9d9f7' },
  emerald:  { label: 'Emerald',  hex: '#00C853' },
  ruby:     { label: 'Ruby',     hex: '#FF1744' },
  sapphire: { label: 'Sapphire', hex: '#2979FF' },
  amethyst: { label: 'Amethyst', hex: '#AA00FF' },
  topaz:    { label: 'Topaz',    hex: '#FFD740' },
};
