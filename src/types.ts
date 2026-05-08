export interface SocketItem {
  command: string;
  icon: string;
  label: string;
}

export interface RadialMenu {
  id: string;
  name: string;
  command: string;
  items: (SocketItem | null)[];
}

export type DragPayload =
  | { kind: 'command'; commandId: string; label: string }
  | { kind: 'socket'; menuId: string; socketIndex: number }
  | { kind: 'new-submenu' };

export interface PersistedState {
  menus: RadialMenu[];
  activeMenuId: string;
  slotCount: number;
}
