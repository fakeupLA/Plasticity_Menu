export const STAGE_VIEWBOX = { x: -300, y: -300, w: 600, h: 600 };
export const RADIAL_INNER = 60;
export const RADIAL_OUTER = 200;

export interface WedgeGeometry {
  index: number;
  startAngle: number;
  endAngle: number;
  midAngle: number;
  midPoint: { x: number; y: number };
  outerLabelPoint: { x: number; y: number };
}

export function computeWedgeGeometry(index: number, total: number, innerR = RADIAL_INNER, outerR = RADIAL_OUTER): WedgeGeometry {
  const wedgeArc = 360 / total;
  const startAngle = -90 - wedgeArc / 2 + index * wedgeArc;
  const endAngle = startAngle + wedgeArc;
  const midAngle = startAngle + wedgeArc / 2;
  const midR = (innerR + outerR) / 2;
  const a = (midAngle * Math.PI) / 180;
  const midPoint = { x: Math.cos(a) * midR, y: Math.sin(a) * midR };
  const outerR2 = outerR - 14;
  const outerLabelPoint = { x: Math.cos(a) * outerR2, y: Math.sin(a) * outerR2 };
  return { index, startAngle, endAngle, midAngle, midPoint, outerLabelPoint };
}

export function donutSlicePath(rIn: number, rOut: number, startDeg: number, endDeg: number): string {
  const a1 = (startDeg * Math.PI) / 180;
  const a2 = (endDeg * Math.PI) / 180;
  const x1 = Math.cos(a1) * rOut;
  const y1 = Math.sin(a1) * rOut;
  const x2 = Math.cos(a2) * rOut;
  const y2 = Math.sin(a2) * rOut;
  const x3 = Math.cos(a2) * rIn;
  const y3 = Math.sin(a2) * rIn;
  const x4 = Math.cos(a1) * rIn;
  const y4 = Math.sin(a1) * rIn;
  const la = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${rOut} ${rOut} 0 ${la} 1 ${x2} ${y2} L ${x3} ${y3} A ${rIn} ${rIn} 0 ${la} 0 ${x4} ${y4} Z`;
}
