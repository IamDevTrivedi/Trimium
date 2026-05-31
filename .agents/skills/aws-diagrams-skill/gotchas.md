# Gotchas — Things That Waste Iteration Cycles

Scan this before generating any diagram. These are the non-obvious failures learned from painful trial and error.

## Sizing & Scaling

| Symptom | Cause | Fix |
|---|---|---|
| Increased font sizes had no visible effect | CSS `max-height` scales the entire image down. Bigger fonts = bigger image = same apparent size after scaling | Reduce spacing (`nodesep`, `ranksep`) to make the image more compact. Fonts become proportionally larger relative to the image |
| Diagram looks tiny despite large coordinates | Image aspect ratio doesn't match the CSS container. A 2:1 landscape image gets half the visual area of a 1:1 square | Target 0.85–1.15 aspect ratio. Check with PIL: `img.size[0]/img.size[1]` |
| Increasing DPI didn't help | DPI increases pixel count but doesn't change proportions. CSS scales by dimensions, not pixels | DPI 150 is fine. Focus on aspect ratio and content density instead |
| Forced wide aspect ratio with `size="16,8!"` made everything tiny | The image fills width but CSS `max-height` still applies, squishing the tall content | Don't use `size`/`ratio` to force aspect ratio. Tune `nodesep`/`ranksep` instead |
| `nodesep` too high pushed AZs apart but made image wider and content smaller | More horizontal space = wider image = more CSS scaling = smaller everything | Find the sweet spot. `nodesep: 3.0` with `ranksep: 0.7` gives ~0.94 ratio for VPC diagrams |

## Centering

| Symptom | Cause | Fix |
|---|---|---|
| Top nodes (User, IGW, ALB) pulled to one side | Graphviz positions parent nodes above the barycenter of their children. Nested clusters create asymmetric pull | Use post-processing: `dot -Tdot` → shift node positions → `neato -n` to re-render |
| Arrows disconnected after centering | Used `neato -n2` which fixes both nodes AND edge splines | Use `neato -n` (without the 2) — fixes nodes, recalculates edges |
| Equal edge weights didn't center nodes | Nested cluster internal structure creates stronger pull than edge weights can overcome | Edge weights don't work for this. Use post-processing |
| `newrank=true` broke cluster layout | `newrank` enables cross-cluster rank constraints but changes how clusters are positioned | Don't use `newrank` with nested clusters |
| `constraint=false` pushed nodes to far left | Removing constraints removes the vertical ordering pull, causing unpredictable placement | Only use `constraint=false` on non-critical edges (e.g. EC2→NAT outbound) |
| Invisible anchor nodes via `d.dot.node()` destroyed layout | Injecting raw DOT nodes into the `diagrams` library's graph conflicts with its internal structure | Don't inject nodes via `d.dot`. Use post-processing instead |
| Swapping cluster declaration order changed which AZ is left/right | Graphviz respects declaration order for horizontal placement of siblings | Use declaration order to control left/right, but it won't fix centering |

## Layout

| Symptom | Cause | Fix |
|---|---|---|
| AZs stacked vertically instead of side-by-side (LR mode) | Deeply nested clusters in LR mode confuse Graphviz's ranking algorithm | Use TB mode with high `nodesep` for side-by-side clusters |
| `ranksep` increased gap everywhere, not just where needed | `ranksep` is global — applies to all rank gaps equally | Use `minlen="2"` on specific edges for selective spacing |
| Public and private subnets not aligned between AZs | Different content counts in subnets cause Graphviz to size them differently | Accept minor asymmetry — Graphviz determines subplot sizes based on content |

## Colors & Theme

| Symptom | Cause | Fix |
|---|---|---|
| Light mode cluster backgrounds invisible | Background color too transparent | Use stroke color + `40` opacity suffix (e.g. `#b2f2bb40`) |
| Dark mode text unreadable | Font color too dark for dark background | Use `#e8e8ea` for dark mode font color |
| Cluster borders invisible in dark mode | Border color too dark | Use bright border colors (e.g. `#6741d9` not `#3a1a6d`) |

## Library Quirks

| Symptom | Cause | Fix |
|---|---|---|
| `Node.__init__() got multiple values for 'label'` | First positional arg to Node IS the label; don't also pass `label=` | Use `EC2("EC2")` not `EC2("EC2", label="EC2")` |
| DOT file deleted after `with Diagram()` block | `__exit__` calls `render()` then `os.remove(self.filename)` | Capture `d.dot.source` inside the `with` block before exit |
| Node `_id` not found in positioned DOT | IDs may or may not be quoted in DOT output | Use regex: `"?{nid}"?\s+\[` to match both quoted and unquoted |
| `lhead` cluster name doesn't match | Cluster names are prefixed with `cluster_` in DOT | Use `lhead="cluster_My Label"` matching the exact Cluster label |
