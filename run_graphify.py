#!/usr/bin/env python3
"""
Graphify runner for EDL Carepa project.
Run this script to generate the knowledge graph for the edl-carepa codebase.
"""

import subprocess
import sys
import os

def run_graphify():
    project_path = "/data/data/com.termux/files/home/Projects/TI-Carepa/edl-carepa"
    output_dir = os.path.join(project_path, "graphify-out")
    
    # Check if graphify is available
    try:
        result = subprocess.run(["graphify", "--version"], capture_output=True, text=True)
        print(f"Graphify version: {result.stdout.strip()}")
    except FileNotFoundError:
        print("graphify not found. Install with: pipx install graphifyy")
        print("Or: uv tool install graphifyy")
        return 1
    
    # Run graphify on the project
    print(f"Running graphify on {project_path}...")
    result = subprocess.run(
        ["graphify", project_path, "-o", output_dir],
        capture_output=True,
        text=True
    )
    
    if result.returncode == 0:
        print("✓ Graphify completed successfully!")
        print(f"Output directory: {output_dir}")
        print(f"Files generated:")
        for f in os.listdir(output_dir):
            print(f"  - {f}")
        return 0
    else:
        print(f"✗ Graphify failed:")
        print(result.stderr)
        return 1

if __name__ == "__main__":
    sys.exit(run_graphify())