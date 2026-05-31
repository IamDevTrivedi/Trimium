#!/usr/bin/env python3
"""Template for AWS architecture diagrams using the Python `diagrams` library.

Copy this file and modify the diagram content section.
Adjust graph_attr values based on diagram type:
  - Pipeline (LR): use PIPELINE values
  - Architecture (TB): use ARCHITECTURE values (already set as defaults)
"""

from diagrams import Diagram, Cluster, Edge
# Import the AWS services you need:
# from diagrams.aws.compute import EC2, Lambda
# from diagrams.aws.database import RDS, Redshift
# from diagrams.aws.network import ALB, NATGateway, InternetGateway
# from diagrams.aws.storage import S3
# from diagrams.aws.analytics import Glue, EMR
# from diagrams.aws.general import User
import os

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "images", "diagrams")
os.makedirs(OUT_DIR, exist_ok=True)

# Diagram name for output files (change this)
DIAGRAM_NAME = "my-diagram-aws"


def gen(dark: bool):
    suffix = "-dark" if dark else ""
    bg = "#0f0f13" if dark else "white"
    fc = "#e8e8ea" if dark else "#1e1e1e"
    edge_color = "#65656e" if dark else "#495057"

    # === COLOR PALETTE ===
    # Pick colors from this palette for your clusters.
    # Each entry: {"bg": ..., "fc": ..., "border": ...}
    if dark:
        cc = {
            "purple": {"bg": "#1a1a2a", "fc": "#c4b5fd", "border": "#6741d9"},
            "green":  {"bg": "#1a2a1a", "fc": "#86efac", "border": "#2f9e44"},
            "yellow": {"bg": "#2a2a1a", "fc": "#fde68a", "border": "#e67700"},
            "red":    {"bg": "#2a1a1a", "fc": "#fca5a5", "border": "#c92a2a"},
            "blue":   {"bg": "#1a1a2a", "fc": "#93c5fd", "border": "#1971c2"},
            "cyan":   {"bg": "#1a2a2a", "fc": "#67e8f9", "border": "#0c8599"},
        }
    else:
        cc = {
            "purple": {"bg": "#d0bfff40", "fc": "#6741d9", "border": "#6741d9"},
            "green":  {"bg": "#b2f2bb40", "fc": "#2f9e44", "border": "#2f9e44"},
            "yellow": {"bg": "#ffec9940", "fc": "#e67700", "border": "#e67700"},
            "red":    {"bg": "#ffc9c940", "fc": "#c92a2a", "border": "#c92a2a"},
            "blue":   {"bg": "#a5d8ff40", "fc": "#1971c2", "border": "#1971c2"},
            "cyan":   {"bg": "#99e9f240", "fc": "#0c8599", "border": "#0c8599"},
        }

    # === GRAPH ATTRIBUTES ===
    # ARCHITECTURE (TB) values shown. For PIPELINE (LR), see comments.
    graph_attr = {
        "bgcolor": bg,
        "fontcolor": fc,
        "fontsize": "32",       # PIPELINE: "18"
        "fontname": "Helvetica Bold",
        "pad": "0.3",
        "nodesep": "3.0",       # PIPELINE: "0.3"
        "ranksep": "0.7",       # PIPELINE: "1.2"
        "dpi": "150",
        "label": "Diagram Title\n\n",
        "labelloc": "t",
        "rankdir": "TB",        # PIPELINE: "LR"
        "compound": "true",
    }

    # === NODE ATTRIBUTES ===
    node_attr = {
        "fontsize": "20",       # PIPELINE: "12"
        "fontname": "Helvetica",
        "fontcolor": fc,
        "height": "1.7",        # PIPELINE: "1.1"
    }

    # === EDGE ATTRIBUTES ===
    edge_attr = {
        "color": edge_color,
        "penwidth": "3.0",      # PIPELINE: "2.0"
    }

    # === CLUSTER ATTRIBUTES ===
    def cattr(key):
        c = cc[key]
        return {
            "fontsize": "22",   # PIPELINE: "14"
            "fontname": "Helvetica Bold",
            "penwidth": "1.5",
            "labeljust": "c",
            "labelloc": "t",
            "style": "dashed,rounded",
            "margin": "18",     # PIPELINE: "14"
            "bgcolor": c["bg"],
            "fontcolor": c["fc"],
            "pencolor": c["border"],
        }

    out_path = os.path.join(OUT_DIR, f"{DIAGRAM_NAME}{suffix}")

    with Diagram(
        "",
        filename=out_path,
        show=False,
        direction="TB",         # PIPELINE: "LR"
        graph_attr=graph_attr,
        node_attr=node_attr,
        edge_attr=edge_attr,
        outformat="png",
    ):
        # === EDGE HELPER ===
        e = lambda **kw: Edge(color=edge_color, **kw)

        # === BUILD YOUR DIAGRAM HERE ===
        # Example:
        # with Cluster("Source", graph_attr=cattr("green")):
        #     source = RDS("RDS")
        # with Cluster("Target", graph_attr=cattr("purple")):
        #     target = S3("S3")
        # source >> e(lhead="cluster_Target", ltail="cluster_Source") >> target
        pass


gen(dark=False)
gen(dark=True)
print(f"Done — generated light and dark {DIAGRAM_NAME} diagrams")
