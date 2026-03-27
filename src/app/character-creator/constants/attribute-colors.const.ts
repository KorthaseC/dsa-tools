import { Attribute } from '../models/base-creation.model';

export interface AttributeColorDef {
  label: Attribute;
  key: string;
  color: string;
}

export const ATTR_COLORS: Record<Attribute, string> = {
  MU: '#e74c3c',
  KL: '#9b59b6',
  IN: '#2ecc71',
  CH: '#3d3d3d',
  FF: '#f1c40f',
  GE: '#3498db',
  KO: '#95a5a6',
  KK: '#e67e22',
};
