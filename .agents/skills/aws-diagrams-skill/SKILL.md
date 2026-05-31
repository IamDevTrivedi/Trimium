---
name: aws-diagrams
description: >
  TRIGGER when user asks to create AWS architecture diagrams, cloud infrastructure
  diagrams, or any diagram that benefits from real AWS/GCP/Azure service icons.
  TRIGGER when user mentions the Python `diagrams` library or wants PNG diagrams
  with cloud service icons. DO NOT trigger for hand-drawn/sketch style diagrams
  (use excalidraw-diagrams instead).
---

# AWS Architecture Diagrams — Python `diagrams` Library

Generate cloud architecture diagrams with real AWS service icons using the Python `diagrams` library, with light/dark theme support and post-processing for proper centering.

## Pipeline

```
Python script (diagrams library) → Graphviz renders PNG → Post-process for centering → Embed in markdown/HTML
```

### 1. Install (once)

```bash
pip install diagrams
brew install graphviz  # or apt-get install graphviz
```

### 2. Script structure

Every script follows the same pattern: a `gen(dark: bool)` function called twice for light and dark variants.

```python
from diagrams import Diagram, Cluster, Edge
from diagrams.aws.compute import EC2
# ... other imports
import os

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "images", "diagrams")
os.makedirs(OUT_DIR, exist_ok=True)

def gen(dark: bool):
    suffix = "-dark" if dark else ""
    bg = "#0f0f13" if dark else "white"
    fc = "#e8e8ea" if dark else "#1e1e1e"
    edge_color = "#65656e" if dark else "#495057"
    # ... build diagram ...

gen(dark=False)
gen(dark=True)
```

### 3. Embed with theme switching

Place diagrams **below** the text content they illustrate.

```html
<img src="/images/diagrams/diagram-dark.png" alt="..." class="diagram diagram-dark" />
<img src="/images/diagrams/diagram.png" alt="..." class="diagram diagram-light" />
```

---

## Two Diagram Types

The `diagrams` library supports two common layout patterns. Each has different optimal settings.

### Pipeline diagrams (LR — Left to Right)

For data flows: Source → Extract → Transform → Load. Flat cluster structure, no deep nesting.

| Attribute | Value | Notes |
|---|---|---|
| `rankdir` | `"LR"` | Horizontal data flow |
| `nodesep` | `"0.3"` | Default spacing works fine |
| `ranksep` | `"1.2"` | Wide gaps between pipeline stages |
| `fontsize` (graph) | `"18"` | Title |
| `fontsize` (node) | `"12"` | Service labels |
| `fontsize` (cluster) | `"14"` | Stage labels |
| `height` (node) | `"1.1"` | Compact icons |
| `penwidth` (edge) | `"2.0"` | Standard arrows |
| `margin` (cluster) | `"14"` | Standard padding |

These are simple — Graphviz handles LR pipeline layouts well with no post-processing needed.

### Architecture diagrams (TB — Top to Bottom)

For VPC/infrastructure layouts with nested clusters (VPC > AZ > Subnet > Resources). These require special handling.

| Attribute | Value | Notes |
|---|---|---|
| `rankdir` | `"TB"` | Vertical hierarchy |
| `nodesep` | `"3.0"` | **Critical** — pushes side-by-side clusters apart horizontally |
| `ranksep` | `"0.7"` | Moderate vertical spacing |
| `fontsize` (graph) | `"32"` | Large title to compensate for CSS scaling |
| `fontsize` (node) | `"20"` | Large labels |
| `fontsize` (cluster) | `"22"` | Large cluster labels |
| `height` (node) | `"1.7"` | Bigger icons |
| `penwidth` (edge) | `"3.0"` | Thicker arrows |
| `margin` (cluster) | `"18"` | More padding inside clusters |
| `compound` | `"true"` | **Required** for `lhead`/`ltail` on inter-cluster edges |
| `dpi` | `"150"` | Standard resolution |
| `pad` | `"0.3"` | Canvas padding |

**Why the values are so different from pipeline diagrams:** TB architecture diagrams with nested clusters produce tall, narrow images. CSS `max-height` (typically 650px) then scales the entire image down, making fonts and icons tiny. The solution is larger fonts/icons at the source so they remain readable after CSS scaling.

### Catalog diagrams (categories side by side)

For showcasing groups of related services without data flow edges (e.g. "AWS Ingestion Tools" organized by category). Categories should be **horizontally arranged** with nodes stacked **vertically** within each category.

| Attribute | Value | Notes |
|---|---|---|
| `rankdir` | `"LR"` | Categories flow left to right |
| `direction` (Diagram) | `"TB"` | Nodes stack vertically within clusters |
| `nodesep` | `"0.5"` | Moderate spacing between nodes |
| `ranksep` | `"0.5"` | Moderate spacing between ranks |
| `fontsize` (graph) | `"18"` | Title |
| `fontsize` (node) | `"12"` | Service labels |
| `fontsize` (cluster) | `"14"` | Category labels |
| `height` (node) | `"1.1"` | Compact icons |
| `margin` (cluster) | `"14"` | Standard padding |

**Key technique:** Without edges between clusters, Graphviz may stack them vertically. Use invisible edges between one node in each adjacent cluster to force horizontal placement:

```python
# Force clusters side by side
node_in_cluster1 >> Edge(style="invis") >> node_in_cluster2
node_in_cluster2 >> Edge(style="invis") >> node_in_cluster3
```

Pick a node from the **bottom** of each cluster for the invisible edge so it doesn't distort the top alignment.

---

## Aspect Ratio — The #1 Issue

**The rendered PNG's aspect ratio determines how large content appears on the page.**

- CSS `.diagram { max-height: 650px; width: 100%; object-fit: contain }` scales images to fit
- A square image (1:1) fills 650x650px — content is large
- A 2:1 landscape image fills 1300x650px — content gets half the visual area
- A 1:2 portrait image fills 325x650px — content is narrow and tiny

**Target ratio: 0.85–1.15** (nearly square, matching the reference diagrams that look good).

How to control it:
- `nodesep` controls horizontal spread (higher = wider image)
- `ranksep` controls vertical spread (higher = taller image)
- `minlen` on specific edges adds vertical space selectively
- Tune these until the PNG ratio is ~1.0

Check ratio after generating:
```python
from PIL import Image
img = Image.open("diagram.png")
print(f"Ratio: {img.size[0]/img.size[1]:.2f}")  # aim for 0.85-1.15
```

---

## Centering Top Nodes (Post-Processing)

**Problem:** In TB layouts with nested clusters, Graphviz pulls top-level nodes (User, Internet Gateway, ALB) toward one side instead of centering them between two side-by-side clusters.

**Techniques that DON'T work:**
- Equal edge weights (`weight="10"` on both sides) — no effect with nested clusters
- Asymmetric edge weights — overshoots unpredictably
- Swapping cluster declaration order — shifts which AZ is left/right but doesn't center
- `newrank=true` — breaks cluster layout, causes public/private subnets to jump around
- `constraint=false` on edges — pulls nodes to far left
- Invisible anchor nodes injected via `d.dot.node()` — completely destroys cluster structure
- `group` attribute on nodes — no effect through the `diagrams` library API

**Technique that WORKS:** Post-process the Graphviz positioned DOT output.

1. Let `dot` layout the graph normally
2. Run `dot -Tdot` to get positioned DOT with `pos="x,y"` on each node
3. Find the bounding box center: `center_x = (bb_x1 + bb_x2) / 2`
4. Shift target node x-coordinates to `center_x`
5. Re-render with `neato -n` (fixes node positions, recalculates edge routing)

**Critical:** Use `neato -n` (NOT `neato -n2`). The `-n` flag fixes node positions but recalculates edge splines. The `-n2` flag fixes BOTH nodes and edges, leaving arrows disconnected after moving nodes.

See `references/center_nodes.py` for the reusable `render_centered()` function.

### Accessing node IDs

The `diagrams` library assigns hex string IDs to nodes (e.g. `fc5d80b9ce504359a81f05e0a2b08264`). Access them via `node._id` inside the `with Diagram()` block. In the positioned DOT, they may appear with or without quotes, so use the regex pattern:

```python
pattern = rf'"?{re.escape(nid)}"?\s+\[(?:[^\]]*?)pos="([0-9.]+),([0-9.]+)"'
```

### Capturing DOT source

The `diagrams` library deletes the DOT file in `__exit__`. Capture it before exit:

```python
with Diagram(...) as d:
    # ... build diagram ...
    dot_source = d.dot.source  # capture before __exit__ deletes it
    top_ids = [user._id, igw._id, alb._id]

# After the with block, post-process
render_centered(dot_source, png_path, top_ids)
```

---

## Selective Spacing with `minlen`

`ranksep` is global — it affects ALL rank gaps equally. To add extra space between specific nodes (e.g. more gap between Internet Gateway and VPC, but keep User and IGW close):

```python
user >> e() >> igw >> e(lhead="cluster_VPC", minlen="2") >> alb
```

`minlen="2"` adds 2x the normal rank separation to that specific edge.

---

## Color Palette

### Dark mode
```python
bg = "#0f0f13"
fc = "#e8e8ea"        # font color
edge_color = "#65656e"
```

### Light mode
```python
bg = "white"
fc = "#1e1e1e"
edge_color = "#495057"
```

### Cluster colors (use consistently across diagrams)
```python
# Dark mode                                    # Light mode
{"bg": "#1a1a2a", "fc": "#c4b5fd", "border": "#6741d9"}  # Purple (VPC, infra)
{"bg": "#1a2a1a", "fc": "#86efac", "border": "#2f9e44"}  # Green (AZ, zones)
{"bg": "#2a2a1a", "fc": "#fde68a", "border": "#e67700"}  # Yellow (public, ingestion)
{"bg": "#2a1a1a", "fc": "#fca5a5", "border": "#c92a2a"}  # Red (private, restricted)
{"bg": "#1a1a2a", "fc": "#93c5fd", "border": "#1971c2"}  # Blue (compute, extract)
{"bg": "#2a1a2a", "fc": "#d8b4fe", "border": "#6741d9"}  # Purple (load, serve)
{"bg": "#1a2a2a", "fc": "#67e8f9", "border": "#0c8599"}  # Cyan (data centers)

# Light mode: use stroke color + "40" suffix for bg (e.g. "#b2f2bb40")
# fc and border are the same value in light mode
```

---

## Edge Patterns

```python
e = lambda **kw: Edge(color=edge_color, **kw)

# Inter-cluster edges: ALWAYS use lhead/ltail
node1 >> e(lhead="cluster_Target", ltail="cluster_Source") >> node2

# Selective spacing
node1 >> e(minlen="2") >> node2  # extra vertical gap

# Same-cluster edges: no lhead/ltail needed
ec2 >> e() >> rds
```

---

## Cluster Attributes (cattr helper)

```python
def cattr(key):
    c = cc[key]  # color dict for this cluster type
    return {
        "fontsize": "22",
        "fontname": "Helvetica Bold",
        "penwidth": "1.5",
        "labeljust": "c",
        "labelloc": "t",
        "style": "dashed,rounded",
        "margin": "18",
        "bgcolor": c["bg"],
        "fontcolor": c["fc"],
        "pencolor": c["border"],
    }
```

---

## Reference Files

| File | Contains |
|---|---|
| `references/template.py` | Complete template script with `gen(dark)` pattern, color palette, and all attributes |
| `references/center_nodes.py` | Reusable `render_centered()` function for post-processing node positions |
| `gotchas.md` | Pre-generation checklist — symptoms and fixes for common rendering bugs |
