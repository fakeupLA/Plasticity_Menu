import { useState } from 'react';
import { useStore } from '../store';
import { RADIAL_INNER, STAGE_VIEWBOX } from '../lib/radial';
import { defaultIconFor } from '../lib/icon';
import { toast } from '../lib/toast';
import type { RadialMenu } from '../types';
import Socket from './Socket';

interface Props {
  menu: RadialMenu;
  isActive: boolean;
  highlightedIndex?: number;
  sizePx?: number;
}

export default function WheelView({ menu, isActive, highlightedIndex, sizePx = 560 }: Props) {
  const slotCountActive = useStore((s) => s.slotCount);
  const selectedSocket = useStore((s) => s.selectedSocket);
  const drag = useStore((s) => s.drag);
  const menus = useStore((s) => s.menus);
  const activeMenuId = useStore((s) => s.activeMenuId);
  const selectSocket = useStore((s) => s.selectSocket);
  const setSocketIn = useStore((s) => s.setSocketIn);
  const swapSocketsIn = useStore((s) => s.swapSocketsIn);
  const createSubmenuFromWedge = useStore((s) => s.createSubmenuFromWedge);
  const setActiveMenu = useStore((s) => s.setActiveMenu);
  const setDrag = useStore((s) => s.setDrag);

  const [hoverSocket, setHoverSocket] = useState<number | null>(null);
  const [centerHover, setCenterHover] = useState(false);

  const slotCount = isActive ? slotCountActive : menu.items.length;
  const items = menu.items;
  const isOwnSocketDrag = drag?.kind === 'socket' && drag.menuId === menu.id;
  const compact = sizePx < 240;

  function handleSocketDragStart(e: React.DragEvent, idx: number) {
    setDrag({ kind: 'socket', menuId: menu.id, socketIndex: idx });
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', `socket:${idx}`);
    } catch {
      // ignore
    }
  }

  function handleSocketDragEnd() {
    setTimeout(() => setDrag(null), 50);
    setHoverSocket(null);
    setCenterHover(false);
  }

  function handleSocketDrop(_: React.DragEvent, idx: number) {
    setHoverSocket(null);
    if (!drag) return;
    if (drag.kind === 'command') {
      setSocketIn(menu.id, idx, {
        command: drag.commandId,
        icon: defaultIconFor(drag.commandId),
        label: drag.label,
      });
    } else if (drag.kind === 'socket') {
      // Cross-menu socket drag: ignore in v1
      if (drag.menuId !== menu.id) {
        setDrag(null);
        return;
      }
      if (drag.socketIndex === idx) return;
      swapSocketsIn(menu.id, drag.socketIndex, idx);
    } else if (drag.kind === 'new-submenu') {
      // Submenu tile always nests under the user's active menu (the wheel they're "in").
      // If they dropped on the active wheel, honor the wedge index they picked.
      // If they dropped on a parent context wheel, redirect to the next empty wedge of active.
      if (isActive) {
        createSubmenuFromWedge(menu.id, idx);
      } else {
        const active = menus.find((m) => m.id === activeMenuId);
        if (!active) {
          setDrag(null);
          return;
        }
        const emptyIdx = active.items.findIndex((it) => it === null);
        if (emptyIdx === -1) {
          toast('error', 'No empty sockets in the active menu — drop on one of its wedges');
          setDrag(null);
          return;
        }
        createSubmenuFromWedge(active.id, emptyIdx);
      }
    }
    setDrag(null);
  }

  function handleCenterDragOver(e: React.DragEvent) {
    if (!isOwnSocketDrag) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setCenterHover(true);
  }

  function handleCenterDrop(e: React.DragEvent) {
    e.preventDefault();
    setCenterHover(false);
    if (!drag) return;
    if (drag.kind === 'socket' && drag.menuId === menu.id) {
      setSocketIn(menu.id, drag.socketIndex, null);
    }
    setDrag(null);
  }

  function handleSocketClick(idx: number) {
    if (isActive) {
      selectSocket(idx);
    } else {
      setActiveMenu(menu.id, { source: 'breadcrumb' });
      selectSocket(idx);
    }
  }

  function handleSocketDoubleClick(idx: number) {
    if (!isActive) return;
    const it = items[idx];
    if (!it) return;
    const prefix = 'view:radial:';
    if (!it.command.startsWith(prefix)) return;
    const target = menus.find((m) => m.command === it.command.slice(prefix.length));
    if (target) setActiveMenu(target.id, { source: 'wedge' });
  }

  return (
    <svg
      data-tour={isActive ? 'wheel' : undefined}
      className="block select-none cursor-default"
      style={{
        width: sizePx,
        maxWidth: '100%',
        height: 'auto',
        opacity: isActive ? 1 : 0.92,
        filter: isActive ? undefined : 'saturate(0.85)',
        transition: 'opacity 200ms ease, filter 200ms ease',
      }}
      viewBox={`${STAGE_VIEWBOX.x} ${STAGE_VIEWBOX.y} ${STAGE_VIEWBOX.w} ${STAGE_VIEWBOX.h}`}
      onClick={(e) => {
        e.stopPropagation();
        if (isActive) selectSocket(null);
      }}
      onDragLeave={(e) => {
        // Only clear when the drag actually leaves the SVG element (not when crossing children)
        const related = e.relatedTarget as Node | null;
        if (related && (e.currentTarget as Node).contains(related)) return;
        setHoverSocket(null);
      }}
    >
      {Array.from({ length: slotCount }).map((_, i) => (
        <Socket
          key={i}
          index={i}
          total={slotCount}
          item={items[i] ?? null}
          selected={isActive && selectedSocket === i}
          dragOver={hoverSocket === i}
          highlighted={highlightedIndex === i}
          compact={compact}
          onClick={handleSocketClick}
          onDoubleClick={handleSocketDoubleClick}
          onClear={(idx) => setSocketIn(menu.id, idx, null)}
          onDragStart={handleSocketDragStart}
          onDragEnd={handleSocketDragEnd}
          onDragEnter={(idx) => setHoverSocket(idx)}
          onDragOver={(_, idx) => {
            // Idempotent: keep hover sticky even if dragenter/dragleave races miss
            setHoverSocket((cur) => (cur === idx ? cur : idx));
          }}
          onDrop={handleSocketDrop}
        />
      ))}

      <g
        onDragEnter={(e) => {
          if (isOwnSocketDrag) {
            e.preventDefault();
            setCenterHover(true);
          }
        }}
        onDragOver={handleCenterDragOver}
        onDragLeave={() => setCenterHover(false)}
        onDrop={handleCenterDrop}
        style={{ pointerEvents: isOwnSocketDrag ? 'all' : 'none' }}
      >
        <circle
          cx={0}
          cy={0}
          r={RADIAL_INNER - 4}
          fill={centerHover ? 'rgba(232, 93, 93, 0.25)' : '#1a1a1a'}
          stroke={centerHover ? '#e85d5d' : '#3a3a3a'}
          strokeWidth={1}
          style={{ transition: 'fill 120ms, stroke 120ms' }}
        />
      </g>
      <text
        x={0}
        y={0}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={centerHover ? 11 : 9}
        letterSpacing={centerHover ? 0 : 1.4}
        fill={centerHover ? '#e85d5d' : '#a8a8a8'}
        style={{ pointerEvents: 'none', textTransform: 'uppercase', fontWeight: 500 }}
      >
        {centerHover ? '✕ REMOVE' : (menu.name || '').toUpperCase()}
      </text>
    </svg>
  );
}
