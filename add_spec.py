#!/usr/bin/env python3
import subprocess
import json

COOKIES = "/tmp/stephud_cookies.txt"
API = "http://localhost:3000/api/specs"
PARENT_ID = "cmrcj3pf10000drj1tzdp3elp"

def add(name, details, color="#ff4500"):
    payload = {
        "name": name,
        "details": str(details),
        "color": color,
        "icon": None,
        "parentId": PARENT_ID,
        "published": True,
        "locked": False,
        "lockContent": False,
        "price": 0,
        "linkOnly": False
    }
    result = subprocess.run([
        "curl", "-s", "-X", "POST", API,
        "-H", "Content-Type: application/json",
        "-b", COOKIES,
        "-d", json.dumps(payload)
    ], capture_output=True, text=True)
    try:
        data = json.loads(result.stdout)
        if "spec" in data:
            print(f"  ✓ {name}")
        else:
            print(f"  ✗ {name}: {data.get('error', result.stdout[:80])}")
    except:
        print(f"  ✗ {name}: {result.stdout[:80]}")

# ═══════════════════════════════════════════════════
# FH5 TUNE MENU ORDER
# ═══════════════════════════════════════════════════

# ── 1. TYRES & RIMS ──
print("\n[1] TYRES & RIMS")
add("Tyre Pressure — Front", "30.0 PSI", "#45b7d1")
add("Tyre Pressure — Rear", "27.0 PSI", "#45b7d1")
add("Rim Size — Front", '9.5"', "#45b7d1")
add("Rim Size — Rear", '10.5"', "#45b7d1")
add("Tyre Compound", "Sport", "#45b7d1")

# ── 2. GEARING ──
print("\n[2] GEARING")
add("Final Drive", "4.90", "#f7dc6f")
add("1st Gear", "3.50", "#f7dc6f")
add("2nd Gear", "2.30", "#f7dc6f")
add("3rd Gear", "1.70", "#f7dc6f")
add("4th Gear", "1.30", "#f7dc6f")
add("5th Gear", "1.05", "#f7dc6f")
add("6th Gear", "0.85", "#f7dc6f")

# ── 3. CAMBER ──
print("\n[3] CAMBER")
add("Camber — Front", "-3.5°", "#96ceb4")
add("Camber — Rear", "-1.5°", "#96ceb4")

# ── 4. ALIGNMENT ──
print("\n[4] ALIGNMENT")
add("Toe — Front", "+0.2°", "#96ceb4")
add("Toe — Rear", "0.0°", "#96ceb4")
add("Caster", "5.0°", "#96ceb4")

# ── 5. SUSPENSION ──
print("\n[5] SUSPENSION")
add("Spring Rate — Front", "380 lb/in", "#dda0dd")
add("Spring Rate — Rear", "280 lb/in", "#dda0dd")
add("Ride Height — Front", '3.5"', "#dda0dd")
add("Ride Height — Rear", '4.0"', "#dda0dd")
add("Rebound — Front", "8", "#dda0dd")
add("Rebound — Rear", "5", "#dda0dd")
add("Bump — Front", "6", "#dda0dd")
add("Bump — Rear", "4", "#dda0dd")
add("Anti-Roll Bar — Front", "22", "#dda0dd")
add("Anti-Roll Bar — Rear", "8", "#dda0dd")

# ── 6. BRAKES ──
print("\n[6] BRAKES")
add("Brake Pressure", "100%", "#ff6b6b")
add("Brake Balance", "52% Front / 48% Rear", "#ff6b6b")

# ── 7. AERO ──
print("\n[7] AERO")
add("Rear Wing Angle", "+3 (moderate)", "#85c1e9")
add("Front Bumper", "Street-style", "#85c1e9")
add("Side Skirts", "Stock or Street", "#85c1e9")
add("Hood", "Carbon fiber", "#85c1e9")

# ── 8. DRIVETRAIN ──
print("\n[8] DRIVETRAIN")
add("Differential — Acceleration", "85%", "#4ecdc4")
add("Differential — Deceleration", "60%", "#4ecdc4")
add("Clutch", "Sport", "#4ecdc4")
add("Transmission", "Race (6-speed)", "#4ecdc4")

# ── ENGINE ──
print("\n[9] ENGINE")
add("Engine Swap", "2.6L I6 Twin-Turbo (RB26DETT)", "#ff6b35")
add("Intake", "Race", "#ff6b35")
add("Exhaust", "Race", "#ff6b35")
add("Fuel System", "Race", "#ff6b35")
add("Ignition", "Race", "#ff6b35")
add("Pistons", "Forged", "#ff6b35")
add("Intercooler", "Race", "#ff6b35")
add("Turbo", "Race w/ Anti-Lag", "#ff6b35")
add("Wastegate", "Race", "#ff6b35")
add("Oil Cooler", "Sport", "#ff6b35")

# ── SUMMARY ──
print("\n[SUMMARY]")
add("PI Class", "S1 900", "#ff4500")
add("Est. Power", "~550–600 HP", "#ff4500")
add("Est. Torque", "~500 lb-ft", "#ff4500")
add("Weight", "~2650 lbs", "#ff4500")
add("Power-to-Weight", "~0.23 HP/lb", "#ff4500")
add("Drift Style", "Smooth / Sustained / Flow", "#ff4500")

print("\nAll done!")
