import { useState } from 'react';
import type { SocketItem } from '../types';
import { computeWedgeGeometry, donutSlicePath, RADIAL_INNER, RADIAL_OUTER } from '../lib/radial';
import { miniIconSVG } from '../lib/icon';

interface Props {
  index: number;
  total: number;
  item: SocketItem | null;
  selected: boolean;
  dragOver: boolean;
  highlighted?: boolean;
  compact?: boolean;
  onClick?: (index: number) => void;
  onDoubleClick?: (index: number) => void;
  onClear?: (index: number) => void;
  onDragStart?: (e: React.DragEvent, index: number) => void;
  onDragEnd?: () => void;
  onDragEnter?: (index: number) => void;
  onDragLeave?: () => void;
  onDragOver?: (e: React.DragEvent, index: number) => void;
  onDrop?: (e: React.DragEvent, index: number) => void;
}

function truncate(s: string, max = 13) {
  if (!s) return '';
  if (s.length <= max) return s;
  return s.slice(0, max - 1) + '…';
}

export default function Socket({
  index,
  total,
  item,
  selected,
  dragOver,
  highlighted,
  compact,
  onClick,
  onDoubleClick,
  onClear,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
}: Props) {
  const [hover, setHover] = useState(false);
  const geo = computeWedgeGeometry(index, total);
  const path = donutSlicePath(RADIAL_INNER, RADIAL_OUTER, geo.startAngle, geo.endAngle);
  const filled = !!item;
  const isSubmenu = !!item && item.command.startsWith('view:radial:');
  const label = item ? truncate(item.label || '') : '';

  const fill = dragOver
    ? '#3a2a20'
    : highlighted
      ? '#3a2a20'
      : filled
        ? '#2a2a2a'
        : '#1f1f1f';
  const stroke = selected
    ? '#ff6b35'
    : highlighted
      ? '#ff8557'
      : dragOver
        ? '#ff6b35'
        : '#444';
  const strokeWidth = selected ? 2 : highlighted ? 2 : dragOver ? 1.5 : 1;

  const showClear = filled && hover && !!onClear;
  const clearX = geo.midPoint.x - 14;
  const clearY = geo.midPoint.y - 18;

  return (
    <g
      style={{ cursor: filled ? 'grab' : 'pointer' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(index);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick?.(index);
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        onDragEnter?.(index);
      }}
      onDragLeave={onDragLeave}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = e.dataTransfer.effectAllowed === 'copy' ? 'copy' : 'move';
        onDragOver?.(e, index);
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop?.(e, index);
      }}
    >
      <path
        d={path}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={filled ? undefined : '3 3'}
        draggable={filled}
        onDragStart={(e) => {
          if (!filled) return;
          onDragStart?.(e, index);
        }}
        onDragEnd={onDragEnd}
        style={{ transition: 'fill 120ms ease, stroke 120ms ease' }}
      />

      {!compact && (
        <text
          x={geo.outerLabelPoint.x}
          y={geo.outerLabelPoint.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="9"
          fontFamily="ui-monospace, SF Mono, Cascadia Mono, monospace"
          fill="#6a6a6a"
          style={{ pointerEvents: 'none' }}
        >
          {index + 1}
        </text>
      )}

      {filled ? (
        <>
          <g
            transform={
              compact
                ? `translate(${geo.midPoint.x - 9}, ${geo.midPoint.y - 9})`
                : `translate(${geo.midPoint.x - 11}, ${geo.midPoint.y - 18})`
            }
            style={{ pointerEvents: 'none' }}
            dangerouslySetInnerHTML={{ __html: miniIconSVG(item!.icon || '', compact ? 18 : 22) }}
          />
          {!compact && (
            <text
              x={geo.midPoint.x}
              y={geo.midPoint.y + 16}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="11"
              fill="#e8e8e8"
              style={{ pointerEvents: 'none' }}
            >
              {label}
            </text>
          )}
          {isSubmenu && (
            <circle
              cx={geo.midPoint.x + 13}
              cy={geo.midPoint.y - 13}
              r="3"
              fill="#ff6b35"
              style={{ pointerEvents: 'none' }}
            />
          )}
        </>
      ) : (
        !compact && (
          <text
            x={geo.midPoint.x}
            y={geo.midPoint.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="22"
            fill="#4a4a4a"
            style={{ pointerEvents: 'none' }}
          >
            +
          </text>
        )
      )}

      {showClear && (
        <g
          style={{ cursor: 'pointer' }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onClear?.(index);
          }}
        >
          <circle
            cx={clearX}
            cy={clearY}
            r={9}
            fill="#1a1a1a"
            stroke="#e85d5d"
            strokeWidth={1}
          />
          <text
            x={clearX}
            y={clearY + 0.5}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="12"
            fontWeight={600}
            fill="#e85d5d"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            ×
          </text>
        </g>
      )}
    </g>
  );
}
