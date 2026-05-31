#!/usr/bin/env python3
"""Generate Trimium System Architecture diagram using the Python `diagrams` library."""

from diagrams import Diagram, Cluster, Edge
from diagrams.programming.framework import NextJs, React, Vercel
from diagrams.programming.language import NodeJS
from diagrams.onprem.database import MongoDB
from diagrams.onprem.inmemory import Redis
from diagrams.onprem.client import User
from diagrams.saas.cdn import Cloudflare
from diagrams.saas.media import Cloudinary
from diagrams.saas.communication import Twilio
from diagrams.generic.database import SQL
import os

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "docs", "diagrams")
os.makedirs(OUT_DIR, exist_ok=True)

DIAGRAM_NAME = "trimium-architecture"


def gen(dark: bool):
    suffix = "-dark" if dark else ""
    bg = "#0f0f13" if dark else "white"
    fc = "#e8e8ea" if dark else "#1e1e1e"
    edge_color = "#65656e" if dark else "#495057"

    if dark:
        cc = {
            "blue":   {"bg": "#1a1a2a", "fc": "#93c5fd", "border": "#1971c2"},
            "yellow": {"bg": "#2a2a1a", "fc": "#fde68a", "border": "#e67700"},
            "green":  {"bg": "#1a2a1a", "fc": "#86efac", "border": "#2f9e44"},
            "cyan":   {"bg": "#1a2a2a", "fc": "#67e8f9", "border": "#0c8599"},
            "red":    {"bg": "#2a1a1a", "fc": "#fca5a5", "border": "#c92a2a"},
        }
    else:
        cc = {
            "blue":   {"bg": "#a5d8ff40", "fc": "#1971c2", "border": "#1971c2"},
            "yellow": {"bg": "#ffec9940", "fc": "#e67700", "border": "#e67700"},
            "green":  {"bg": "#b2f2bb40", "fc": "#2f9e44", "border": "#2f9e44"},
            "cyan":   {"bg": "#99e9f240", "fc": "#0c8599", "border": "#0c8599"},
            "red":    {"bg": "#ffc9c940", "fc": "#c92a2a", "border": "#c92a2a"},
        }

    graph_attr = {
        "bgcolor": bg,
        "fontcolor": fc,
        "fontsize": "28",
        "fontname": "Helvetica Bold",
        "pad": "0.3",
        "nodesep": "0.8",
        "ranksep": "1.2",
        "dpi": "150",
        "label": "Trimium System Architecture\n\n",
        "labelloc": "t",
        "rankdir": "TB",
        "compound": "true",
    }

    node_attr = {
        "fontsize": "14",
        "fontname": "Helvetica",
        "fontcolor": fc,
        "height": "1.2",
    }

    edge_attr = {
        "color": edge_color,
        "penwidth": "2.0",
    }

    def cattr(key):
        c = cc[key]
        return {
            "fontsize": "16",
            "fontname": "Helvetica Bold",
            "penwidth": "1.5",
            "labeljust": "c",
            "labelloc": "t",
            "style": "dashed,rounded",
            "margin": "14",
            "bgcolor": c["bg"],
            "fontcolor": c["fc"],
            "pencolor": c["border"],
        }

    out_path = os.path.join(OUT_DIR, f"{DIAGRAM_NAME}{suffix}")

    with Diagram(
        "",
        filename=out_path,
        show=False,
        direction="TB",
        graph_attr=graph_attr,
        node_attr=node_attr,
        edge_attr=edge_attr,
        outformat="png",
    ):
        e = lambda **kw: Edge(color=edge_color, **kw)

        # ---- Client Layer ----
        with Cluster("Client Layer", graph_attr=cattr("blue")):
            nextjs = NextJs("Next.js 16")
            react = React("React 19")
            browser = User("Browser")

        # ---- CDN / Edge ----
        with Cluster("CDN / Edge", graph_attr=cattr("yellow")):
            vercel = Vercel("Vercel Edge")

        # ---- API Layer ----
        with Cluster("API Layer", graph_attr=cattr("green")):
            api = NodeJS("Express API")

        # ---- Data Layer ----
        with Cluster("Data Layer", graph_attr=cattr("cyan")):
            mongo = MongoDB("MongoDB")
            redis = Redis("Redis")

        # ---- External Services ----
        with Cluster("External Services", graph_attr=cattr("red")):
            cloudinary = Cloudinary("Cloudinary")
            brevo = Twilio("Brevo\n(Email)")
            maxmind = SQL("MaxMind\nGeoIP")
            turnstile = Cloudflare("Turnstile\nCAPTCHA")

        # ---- Edges ----
        browser >> e(label="  HTTPS  ") >> vercel
        vercel >> e(label="  API Calls  ") >> api

        api >> e(label="  Read / Write  ") >> mongo
        api >> e(label="  Cache & Queues  ") >> redis
        api >> e(label="  Image Uploads  ") >> cloudinary
        api >> e(label="  Email  ") >> brevo
        api >> e(label="  GeoIP Lookup  ") >> maxmind

        turnstile >> e(label="  CAPTCHA Verify  ") >> browser

        # Force data + external clusters side by side
        mongo >> Edge(style="invis", color=edge_color) >> cloudinary


gen(dark=False)
gen(dark=True)
print(f"Done — generated light and dark {DIAGRAM_NAME} diagrams")
