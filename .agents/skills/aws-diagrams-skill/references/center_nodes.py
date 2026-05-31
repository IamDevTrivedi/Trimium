"""Reusable post-processing function to center nodes horizontally in Graphviz output.

Usage:
    from center_nodes import render_centered

    with Diagram(...) as d:
        user = User("User")
        igw = InternetGateway("IGW")
        alb = ALB("ALB")
        # ... build diagram ...
        dot_source = d.dot.source
        top_ids = [user._id, igw._id, alb._id]

    render_centered(dot_source, "output.png", top_ids)
"""

import os
import re
import subprocess
import tempfile


def render_centered(dot_source, png_path, node_ids):
    """Render DOT with target nodes centered horizontally.

    1. Writes DOT source to a temp file
    2. Runs `dot -Tdot` to get positioned layout with pos="x,y" attributes
    3. Finds the bounding box center x-coordinate
    4. Shifts each target node's x-position to center_x
    5. Re-renders with `neato -n` (fixed nodes, recalculated edges)

    Args:
        dot_source: Raw DOT source string from d.dot.source
        png_path: Output PNG file path
        node_ids: List of node _id strings to center (from node._id)
    """
    # Write DOT source to temp file
    with tempfile.NamedTemporaryFile(mode="w", suffix=".dot", delete=False) as f:
        f.write(dot_source)
        dot_path = f.name

    # Get positioned DOT from dot layout engine
    result = subprocess.run(
        ["dot", "-Tdot", dot_path], capture_output=True, text=True
    )
    positioned = result.stdout
    os.remove(dot_path)

    # Find bounding box center
    bb_match = re.search(r'bb="([^"]+)"', positioned)
    if not bb_match:
        # Fallback: render without centering
        with tempfile.NamedTemporaryFile(mode="w", suffix=".dot", delete=False) as f:
            f.write(dot_source)
            fallback_path = f.name
        subprocess.run(["dot", "-Tpng", "-o", png_path, fallback_path])
        os.remove(fallback_path)
        return

    bb = bb_match.group(1).split(",")
    center_x = (float(bb[0]) + float(bb[2])) / 2

    # Shift each target node's x-position to center
    for nid in node_ids:
        # Node IDs may or may not be quoted in the positioned DOT
        pattern = rf'"?{re.escape(nid)}"?\s+\[(?:[^\]]*?)pos="([0-9.]+),([0-9.]+)"'
        match = re.search(pattern, positioned)
        if match:
            new_pos = f'{center_x:.2f},{match.group(2)}'
            positioned = positioned[:match.start(1)] + new_pos + positioned[match.end(2):]

    # Write centered DOT and render with neato -n (fixed nodes, recalculated edges)
    # IMPORTANT: use -n (NOT -n2). -n2 fixes edge splines too, leaving arrows disconnected.
    with tempfile.NamedTemporaryFile(mode="w", suffix=".dot", delete=False) as f:
        f.write(positioned)
        centered_path = f.name

    subprocess.run(["neato", "-n", "-Tpng", "-o", png_path, centered_path])
    os.remove(centered_path)
