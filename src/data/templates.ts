import type { SocketItem } from '../types';
import { PLASTICITY_COMMANDS } from './plasticityCommands';
import { iconFromCommand } from '../lib/icon';

export interface MenuTemplate {
  id: string;
  name: string;
  command: string;
  description: string;
  commands: string[];
}

export const MENU_TEMPLATES: MenuTemplate[] = [
  {
    id: 'modeling',
    name: 'Modeling',
    command: 'your-name:modeling',
    description: 'Primitives, booleans, and the everyday modify tools.',
    commands: [
      'command:center-box',
      'command:cylinder',
      'command:sphere',
      'command:extrude',
      'command:fillet',
      'command:boolean',
      'command:mirror',
      'command:move',
    ],
  },
  {
    id: 'curves',
    name: 'Curves & Sketch',
    command: 'your-name:curves',
    description: 'Sketch primitives for building 2D profiles.',
    commands: [
      'command:line',
      'command:control-point-curve',
      'command:center-rectangle',
      'command:center-circle',
      'command:polygon',
      'command:tangent-arc',
      'command:ellipse',
      'command:text',
    ],
  },
  {
    id: 'modify',
    name: 'Modify Tools',
    command: 'your-name:modify',
    description: 'Surface and solid modify operations.',
    commands: [
      'command:fillet',
      'command:extrude',
      'command:revolve',
      'command:loft',
      'command:sweep',
      'command:offset',
      'command:thicken',
      'command:hollow',
    ],
  },
  {
    id: 'transform',
    name: 'Transform',
    command: 'your-name:transform',
    description: 'Move, rotate, scale, mirror, and array.',
    commands: [
      'command:move',
      'command:rotate',
      'command:scale',
      'command:mirror',
    ],
  },
];

export function templateToItems(template: MenuTemplate): (SocketItem | null)[] {
  return template.commands.map((id) => {
    const def = PLASTICITY_COMMANDS.find((c) => c.id === id);
    return {
      command: id,
      icon: iconFromCommand(id),
      label: def?.label ?? id,
    };
  });
}
