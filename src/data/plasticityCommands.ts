export type PlasticityCommand = {
  id: string;
  label: string;
  section: string;
};

export const PLASTICITY_COMMANDS: PlasticityCommand[] = [
  // PRIMITIVES
  { id: 'command:center-box', label: 'Center Box', section: 'Primitives' },
  { id: 'command:corner-box', label: 'Corner Box', section: 'Primitives' },
  { id: 'command:three-point-box', label: 'Three Point Box', section: 'Primitives' },
  { id: 'command:cylinder', label: 'Cylinder', section: 'Primitives' },
  { id: 'command:sphere', label: 'Sphere', section: 'Primitives' },

  // CURVES & SKETCH
  { id: 'command:curve', label: 'Spline Curve', section: 'Curves' },
  { id: 'command:control-point-curve', label: 'Control Point Curve', section: 'Curves' },
  { id: 'command:line', label: 'Line', section: 'Curves' },
  { id: 'command:polygon', label: 'Polygon', section: 'Curves' },
  { id: 'command:square', label: 'Square', section: 'Curves' },
  { id: 'command:center-rectangle', label: 'Center Rectangle', section: 'Curves' },
  { id: 'command:corner-rectangle', label: 'Corner Rectangle', section: 'Curves' },
  { id: 'command:three-point-rectangle', label: 'Three Point Rectangle', section: 'Curves' },
  { id: 'command:slot', label: 'Slot', section: 'Curves' },
  { id: 'command:center-circle', label: 'Center Circle', section: 'Curves' },
  { id: 'command:two-point-circle', label: 'Two Point Circle', section: 'Curves' },
  { id: 'command:three-point-circle', label: 'Three Point Circle', section: 'Curves' },
  { id: 'command:tangent-circle', label: 'Tangent Circle', section: 'Curves' },
  { id: 'command:center-point-arc', label: 'Center Point Arc', section: 'Curves' },
  { id: 'command:three-point-arc', label: 'Three Point Arc', section: 'Curves' },
  { id: 'command:tangent-arc', label: 'Tangent Arc', section: 'Curves' },
  { id: 'command:ellipse', label: 'Ellipse', section: 'Curves' },
  { id: 'command:spiral', label: 'Spiral', section: 'Curves' },
  { id: 'command:text', label: 'Text', section: 'Curves' },
  { id: 'command:dimension', label: 'Dimension', section: 'Curves' },

  // MODIFY
  { id: 'command:fillet', label: 'Fillet', section: 'Modify' },
  { id: 'command:fillet-shell', label: 'Fillet Shell', section: 'Modify' },
  { id: 'command:remove-fillets-from-shell', label: 'Remove Fillets from Shell', section: 'Modify' },
  { id: 'command:extrude', label: 'Extrude', section: 'Modify' },
  { id: 'command:revolve', label: 'Revolve', section: 'Modify' },
  { id: 'command:loft', label: 'Loft', section: 'Modify' },
  { id: 'command:loft-guide', label: 'Loft with Guide', section: 'Modify' },
  { id: 'command:sweep', label: 'Sweep', section: 'Modify' },
  { id: 'command:sweep-tool', label: 'Sweep Tool', section: 'Modify' },
  { id: 'command:pipe', label: 'Pipe', section: 'Modify' },
  { id: 'command:thicken', label: 'Thicken', section: 'Modify' },
  { id: 'command:hollow', label: 'Hollow', section: 'Modify' },
  { id: 'command:offset', label: 'Offset', section: 'Modify' },
  { id: 'command:offset-curve', label: 'Offset Curve', section: 'Modify' },
  { id: 'command:bridge', label: 'Bridge', section: 'Modify' },
  { id: 'command:bridge-curve', label: 'Bridge Curve', section: 'Modify' },
  { id: 'command:bridge-surface', label: 'Bridge Surface', section: 'Modify' },
  { id: 'command:patch', label: 'Patch', section: 'Modify' },
  { id: 'command:constrained-surface', label: 'Constrained Surface', section: 'Modify' },
  { id: 'command:xnurbs', label: 'X-NURBS', section: 'Modify' },
  { id: 'command:push-face', label: 'Push Face', section: 'Modify' },
  { id: 'command:draft-face', label: 'Draft Face', section: 'Modify' },
  { id: 'command:match-face', label: 'Match Face', section: 'Modify' },
  { id: 'command:unwrap-face', label: 'Unwrap Face', section: 'Modify' },
  { id: 'command:deform', label: 'Deform', section: 'Modify' },
  { id: 'command:trim', label: 'Trim', section: 'Modify' },
  { id: 'command:untrim', label: 'Untrim', section: 'Modify' },
  { id: 'command:extend', label: 'Extend', section: 'Modify' },
  { id: 'command:cut', label: 'Cut', section: 'Modify' },
  { id: 'command:cut-curve', label: 'Cut Curve', section: 'Modify' },
  { id: 'command:imprint', label: 'Imprint', section: 'Modify' },
  { id: 'command:project', label: 'Project', section: 'Modify' },
  { id: 'command:create-outline', label: 'Create Outline', section: 'Modify' },
  { id: 'command:join', label: 'Join', section: 'Modify' },
  { id: 'command:unjoin', label: 'Unjoin', section: 'Modify' },
  { id: 'command:rebuild', label: 'Rebuild', section: 'Modify' },
  { id: 'command:raise-degree', label: 'Raise Degree', section: 'Modify' },
  { id: 'command:reverse', label: 'Reverse', section: 'Modify' },
  { id: 'command:insert-knot', label: 'Insert Knot', section: 'Modify' },
  { id: 'command:split-segment', label: 'Split Segment', section: 'Modify' },
  { id: 'command:dissolve', label: 'Dissolve', section: 'Modify' },
  { id: 'command:complete-edge', label: 'Complete Edge', section: 'Modify' },
  { id: 'command:convert-vertex', label: 'Convert Vertex', section: 'Modify' },
  { id: 'command:delete-redundant-topology', label: 'Delete Redundant Topology', section: 'Modify' },
  { id: 'command:isoparam', label: 'Isoparam', section: 'Modify' },
  { id: 'command:polysplines', label: 'Polysplines', section: 'Modify' },
  { id: 'command:remove-nominal-surface', label: 'Remove Nominal Surface', section: 'Modify' },
  { id: 'command:smart-command', label: 'Smart Command', section: 'Modify' },

  // BOOLEAN
  { id: 'command:boolean', label: 'Boolean', section: 'Boolean' },

  // TRANSFORM
  { id: 'command:move', label: 'Move', section: 'Transform' },
  { id: 'command:rotate', label: 'Rotate', section: 'Transform' },
  { id: 'command:scale', label: 'Scale', section: 'Transform' },
  { id: 'command:mirror', label: 'Mirror', section: 'Transform' },
  { id: 'command:place', label: 'Place', section: 'Transform' },
  { id: 'command:align', label: 'Align', section: 'Transform' },
  { id: 'command:duplicate', label: 'Duplicate', section: 'Transform' },
  { id: 'command:alternative-duplicate', label: 'Alternative Duplicate', section: 'Transform' },
  { id: 'command:copy-with-placement', label: 'Copy with Placement', section: 'Transform' },
  { id: 'command:paste-with-placement', label: 'Paste with Placement', section: 'Transform' },
  { id: 'command:create-instance', label: 'Create Instance', section: 'Transform' },
  { id: 'command:realize-instances', label: 'Realize Instances', section: 'Transform' },
  { id: 'command:radial-array', label: 'Radial Array', section: 'Transform' },
  { id: 'command:rectangular-array', label: 'Rectangular Array', section: 'Transform' },
  { id: 'command:curve-array', label: 'Curve Array', section: 'Transform' },

  // FREESTYLE
  { id: 'command:freestyle-move', label: 'Freestyle Move', section: 'Freestyle' },
  { id: 'command:freestyle-rotate', label: 'Freestyle Rotate', section: 'Freestyle' },
  { id: 'command:freestyle-scale', label: 'Freestyle Scale', section: 'Freestyle' },
  { id: 'command:freestyle-mirror', label: 'Freestyle Mirror', section: 'Freestyle' },

  // SELECTION
  { id: 'command:select-all', label: 'Select All', section: 'Selection' },
  { id: 'command:select-all-curves', label: 'Select All Curves', section: 'Selection' },
  { id: 'command:select-adjacent', label: 'Select Adjacent', section: 'Selection' },
  { id: 'command:select-next-entity-collection', label: 'Select Next Entity Collection', section: 'Selection' },
  { id: 'command:select-previous-entity-collection', label: 'Select Previous Entity Collection', section: 'Selection' },
  { id: 'command:invert-selection', label: 'Invert Selection', section: 'Selection' },
  { id: 'command:deselect-all', label: 'Deselect All', section: 'Selection' },
  { id: 'command:find-boundary-edges', label: 'Find Boundary Edges', section: 'Selection' },

  // VISIBILITY
  { id: 'command:hide-selected', label: 'Hide Selected', section: 'Visibility' },
  { id: 'command:hide-unselected', label: 'Hide Unselected', section: 'Visibility' },
  { id: 'command:unhide-all', label: 'Unhide All', section: 'Visibility' },
  { id: 'command:invert-hidden', label: 'Invert Hidden', section: 'Visibility' },
  { id: 'command:isolate', label: 'Isolate', section: 'Visibility' },
  { id: 'command:unisolate', label: 'Unisolate', section: 'Visibility' },
  { id: 'command:lock-selected', label: 'Lock Selected', section: 'Visibility' },
  { id: 'command:group-selected', label: 'Group Selected', section: 'Visibility' },
  { id: 'command:ungroup-selected', label: 'Ungroup Selected', section: 'Visibility' },
  { id: 'command:toggle-points', label: 'Toggle Points', section: 'Visibility' },
  { id: 'command:toggle-curvature', label: 'Toggle Curvature', section: 'Visibility' },

  // MATERIAL
  { id: 'command:set-material', label: 'Set Material', section: 'Material' },
  { id: 'command:remove-material', label: 'Remove Material', section: 'Material' },
  { id: 'command:fork-material', label: 'Fork Material', section: 'Material' },

  // CONSTRUCTION PLANE
  { id: 'command:create-viewspace-construction-plane', label: 'Construction Plane', section: 'Construction' },
  { id: 'command:create-viewspace-construction-plane-at-origin', label: 'CP at Origin', section: 'Construction' },

  // MEASURE
  { id: 'command:measure', label: 'Measure', section: 'Measure' },
  { id: 'command:measure-radius', label: 'Measure Radius', section: 'Measure' },
  { id: 'command:measure-continuity', label: 'Measure Continuity', section: 'Measure' },
  { id: 'command:check', label: 'Check', section: 'Measure' },
  { id: 'command:section-analysis', label: 'Section Analysis', section: 'Measure' },
  { id: 'command:subdivide', label: 'Subdivide', section: 'Measure' },
  { id: 'command:slide', label: 'Slide', section: 'Measure' },

  // EXPORT
  { id: 'command:export-obj', label: 'Export OBJ', section: 'Export' },
  { id: 'command:export-stl', label: 'Export STL', section: 'Export' },
  { id: 'command:export3mf', label: 'Export 3MF', section: 'Export' },
  { id: 'command:export-hidden-line', label: 'Export Hidden Line', section: 'Export' },
  { id: 'command:publish-to-plasticity-share', label: 'Publish to Plasticity Share', section: 'Export' },
  { id: 'command:manage-my-shared-documents', label: 'Manage Shared Documents', section: 'Export' },

  // GENERAL
  { id: 'command:delete', label: 'Delete', section: 'General' },

  // SELECTION MODE
  { id: 'selection:mode:set:all', label: 'Selection: All', section: 'Selection Mode' },
  { id: 'selection:mode:set:control-point', label: 'Selection: Control Point', section: 'Selection Mode' },
  { id: 'selection:mode:set:edge', label: 'Selection: Edge', section: 'Selection Mode' },
  { id: 'selection:mode:set:face', label: 'Selection: Face', section: 'Selection Mode' },
  { id: 'selection:mode:set:solid', label: 'Selection: Solid', section: 'Selection Mode' },
  { id: 'selection:mode:set:curve', label: 'Selection: Curve', section: 'Selection Mode' },

  // VIEWPORT NAVIGATION
  { id: 'viewport:navigate:front', label: 'View: Front', section: 'Viewport' },
  { id: 'viewport:navigate:back', label: 'View: Back', section: 'Viewport' },
  { id: 'viewport:navigate:left', label: 'View: Left', section: 'Viewport' },
  { id: 'viewport:navigate:right', label: 'View: Right', section: 'Viewport' },
  { id: 'viewport:navigate:top', label: 'View: Top', section: 'Viewport' },
  { id: 'viewport:navigate:bottom', label: 'View: Bottom', section: 'Viewport' },
];

export function getCommandById(id: string): PlasticityCommand | undefined {
  return PLASTICITY_COMMANDS.find((c) => c.id === id);
}
