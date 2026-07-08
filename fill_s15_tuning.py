#!/usr/bin/env python3
import urllib.request
import urllib.error
import json

BASE = "http://localhost:3000"

def update_spec(spec_id, details):
    url = f"{BASE}/api/specs/{spec_id}"
    data = json.dumps({"details": details}).encode()
    req = urllib.request.Request(url, data=data, method="PUT")
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req) as resp:
            print(f"  ✅ Updated {spec_id}")
    except urllib.error.HTTPError as e:
        print(f"  ❌ {e.code} {e.reason}: {e.read().decode()[:100]}")
    except Exception as e:
        print(f"  ❌ Error: {e}")

# ── PARENT CATEGORIES ──────────────────────────────────────────────────────

parents = {
    "cmrcnucqy0001vsj1fqmod9cl": {
        "name": "ENGINE",
        "details": """The S15 Spec R is powered by Nissan's legendary SR20DET — a 2.0L turbocharged 4-cylinder producing 250 PS and 203 lb-ft of torque from the factory. It responds exceptionally well to modifications and is one of the most popular engines for drift builds due to its balance of reliability, tunability, and aftermarket support.

Upgrade Path (Forza Horizon 5):
• Stage 1 Turbo → ~350 HP (stock block safe)
• Stage 2 Turbo + Intake + Exhaust → ~420-450 HP
• Stage 3 Turbo + Intercooler → ~500-550 HP
• Forged Internals + Stage 3 → 600-800+ HP

Engine Swap Options:
• LS V8 — easiest, most power per dollar
• RB26DETT — iconic JDM twin-turbo six
• 2JZ-GTE — Toyota inline-six, nearly unbreakable
• VR38DETT — GT-R V8, modern and expensive"""
    },
    "cmrcnudb80008vsj1ux0s0et0": {
        "name": "DRIVETRAIN",
        "details": """The drivetrain is what connects your engine power to the wheels and controls how that power is delivered. For drift, the transmission and differential are the two most important components.

Transmission — handles gear selection and power transfer. Race transmission is mandatory for serious drift builds.
Differential — controls how power is split between the two rear wheels. A higher lock percentage means both wheels spin together (more stable). Lower means the inside wheel can spin independently (easier to break loose).

For Forza Horizon 5 drift builds: always go Race Transmission and tune your diff lock % to match your driving style."""
    },
    "cmrcnudjx000bvsj1n5pj4n67": {
        "name": "HANDLING",
        "details": """Handling upgrades control how the car responds to steering input, maintains grip through corners, and behaves during weight transfer. For drift, you want a balance — the car needs to be responsive enough to initiate a slide, but stable enough to hold it.

Springs — control the car's stance and body roll. Lower springs = lower center of gravity = more responsive.
Roll Bars (ARB) — resist body roll in corners. Stiffer front = more turn-in. Stiffer rear = less rotation.
Shocks — control how fast the springs compress and rebound. Too stiff = harsh. Too soft = wallowy.
Camber — angle of the wheel relative to vertical. More negative camber = more grip in corners, less on straights.
Toe — angle of the wheels relative to the car's centerline. Negative rear toe = easier rotation.
Brakes — need to be strong enough to brake into drifts without fading."""
    },
    "cmrcnue56000ivsj1drr1fzkm": {
        "name": "TIRES",
        "details": """Tires are the single most important part of a drift car — they are the only point of contact between the car and the road. Everything else is about putting power through the tires and breaking them loose.

Compound — determines how sticky the tire is. Drift compound is looser (easier slides). Sport is grippier (harder to break loose but better for hybrid driving).
Width — how wide the contact patch is. Wider = more grip up to a point, then diminishing returns.
Tire Pressure — lower pressure = more contact patch = more grip BUT more rolling resistance. For drift, lower rear pressure helps initiate and hold slides."""
    },
    "cmrcnuegr000mvsj13jro6re5": {
        "name": "AERO (OPTIONAL)",
        "details": """Aero is optional on drift builds and has a trade-off. Aero adds downforce which plants the car at high speeds — this helps with stability during long high-speed drifts. But it also adds weight and increases PI rating, which can push you out of your target class.

Wide Body Kit — extends the fenders to accommodate wider wheels/tires. Adds a small amount of downforce and looks aggressive. Recommended for big power builds (500+ HP).
Front Bumper / Splitter — adds front downforce, helps with high-speed stability.
Rear Wing — the most visible aero piece. Adds significant rear downforce. Can be adjusted for angle of attack. Pushes PI rating up significantly.

For PI-limited builds: skip aero. For big power / competitive builds: aero is worth it."""
    },
    "cmrcnueut000qvsj1xm356ps6": {
        "name": "TUNING SETTINGS",
        "details": """This section covers the in-game tuning values to dial in your drift car after installing the physical upgrades. Each category below contains the recommended starting point and how to adjust based on feel.

Tuning is iterative — install your upgrades first, then fine-tune these values while driving. Small adjustments make big differences in drift behavior.

Sub-categories in this section:
• Tire Pressures — cold and hot PSI targets
• Camber — angle adjustment for front and rear
• Springs — stiffness values for front and rear
• Roll Bars (ARB) — sway bar stiffness settings
• Differential — lock percentages for acceleration and deceleration
• Gear Ratios — individual gear tuning (requires Race Transmission)
• Brake Bias — front/rear brake distribution
• Driving Tips — how to drive and tune for different drift styles"""
    },
    "cmrcnuhoy001nvsj1hvxum8ia": {
        "name": "PI TARGET",
        "details": """PI (Performance Index) is Forza's way of classing cars. Your drift build needs to fit within a PI class to compete in certain events and rivals. The two most common classes for S15 drift builds are:

A-Class (A 800): ~450-550 HP builds. Most drift content in Forza Horizon 5 is built around A-Class.
S1-Class (S1 900): ~550-700 HP builds. More competitive, harder to tune but more powerful.

Ballast and Weight Reduction are used to fine-tune PI without changing the car's actual performance. Add ballast (extra weight) to raise PI, or remove weight to lower it.

For competitive drift: A800 is the standard class. S1900 is for high-power show builds."""
    },
}

# ── TUNING SETTINGS CHILDREN ───────────────────────────────────────────────

tuning_children = {
    "cmrcnuf65000uvsj1fylbx2vd": {
        "name": "TIRE PRESSURES",
        "details": """Cold Tire Pressures (before driving):

FRONT: 30-32 PSI
REAR: 26-28 PSI

Hot Tire Pressures (after driving, check at start of session):

FRONT: 33-35 PSI
REAR: 28-30 PSI

━━━ HOW TO ADJUST ━━━

If rear is too loose (steps out too hard): raise rear PSI by 1-2 PSI
If rear is too grippy (won't break loose): lower rear PSI by 1-2 PSI
If front pushes (understeer): lower front PSI by 1 PSI
If front is vague (no turn-in feel): raise front PSI by 1 PSI

For drift: err on the side of lower rear PSI. It is easier to control a loose rear than one that hooks unexpectedly."""
    },
    "cmrcnufep000xvsj1wejdhs6s": {
        "name": "CAMBER",
        "details": """Camber Angle Adjustment:

FRONT: -2.0° to -2.5°
REAR: -1.5° to -2.0°

━━━ WHAT CAMBER DOES ━━━

More negative camber (e.g. -3.0°): the top of the wheel tilts inward. This increases tire contact patch during cornering when the body rolls. More grip in corners. Downside: less contact on straight roads, faster tire wear.
Less negative camber (e.g. -1.0°): more even tire wear, better straight-line grip, but less cornering grip.

━━━ FOR DRIFT ━━━

Front: -2.5° is a good aggressive starting point. If your front tires wear unevenly on the outer edge, reduce to -2.0°.
Rear: -2.0° for drift. If the car snaps back during a drift (rear catches traction suddenly), reduce rear camber slightly."""
    },
    "cmrcnufn90010vsj1v7bbqfvr": {
        "name": "SPRINGS",
        "details": """Spring Rates (Race Upgrades):

FRONT: 350-450 lb/in
REAR: 250-350 lb/in

━━━ WHAT SPRINGS DO ━━━

Stiffer springs reduce body roll and keep the car flatter through corners. But too stiff and the car becomes harsh and bouncy over bumps.
Softer springs allow more body movement but can make the car feel vague and sluggish.

━━━ TUNING FOR DRIFT ━━━

If the car understeers (pushes wide in corners): stiffen the front springs OR soften the rear.
If the car snaps/loops (rear steps out too aggressively): soften the rear springs.
If the car feels bouncy or unsettled: try slightly stiffer front, softer rear.

Start at: Front 400 lb/in | Rear 300 lb/in as a baseline."""
    },
    "cmrcnufyu0013vsj1ssdjr1l2": {
        "name": "ROLL BARS (ARB)",
        "details": """Anti-Roll Bar (Sway Bar) Stiffness:

FRONT: Medium-Stiff
REAR: Medium

━━━ WHAT ARBs DO ━━━

ARB's resist body roll when cornering. They work independently of springs — you can have stiff springs but soft ARBs and still get body roll, or vice versa.

Front ARB stiffer = more turn-in responsiveness, can cause understeer if too stiff.
Rear ARB stiffer = more stable, harder to break the rear loose.
Rear ARB softer = rear wants to rotate, easier initiation, can be twitchy.

━━━ TUNING FOR DRIFT ━━━

If car won't initiate drift (rear won't step out): soften the rear ARB.
If car snaps/loops unexpectedly: stiffen the rear ARB or soften the front.
If car understeers: soften the front ARB.

Baseline: Front Medium-Stiff | Rear Medium"""
    },
    "cmrcnufxo000rvsj1zgejqe1i": {
        "name": "DIFFERENTIAL",
        "details": """Differential Lock Settings (Race Differential):

ACCELERATION LOCK: 80-100%
DECELERATION LOCK: 40-60%

━━━ WHAT LOCK % DOES ━━━

Acceleration Lock: Controls how locked the diff is when you are applying throttle. 100% = both rear wheels always spin together. Lower = one wheel can spin independently.

Deceleration Lock: Controls how locked the diff is when you lift off the throttle or brake. This affects how the car behaves when you change throttle position mid-drift.

━━━ FOR DRIFT ━━━

High Accel Lock (80-100%): Both wheels push equally → more stable, planted feel. Better for grippy drift.
Lower Accel Lock (50-70%): Inside wheel can spin independently → easier to break loose, more drifty feel.

Decel Lock: Higher (50-60%) = car rotates faster when you lift. Lower (30-40%) = more stable when lifting.

For grippy drift: Accel 85-100%, Decel 50-60%
For Sibal/snap style: Accel 60-75%, Decel 35-50%"""
    },
    "cmrcnug7g0016vsj171hd1i66": {
        "name": "GEAR RATIOS",
        "details": """Individual Gear Tuning — requires Race Transmission upgrade.

Adjusting gear ratios changes how long each gear pulls and where the RPM sits during a drift. The goal is to keep RPM in the power band throughout your drift.

━━━ RECOMMENDED GEAR SETTINGS ━━━

1ST GEAR: Short (3.5-3.8) — for low-speed maneuvers and clutch kicks
2ND GEAR: Short-Medium (2.2-2.5) — PRIMARY drift gear. Tune so RPM stays at peak torque zone.
3RD GEAR: Medium (1.5-1.7) — sustained mid-speed drifts
4TH GEAR: Medium-Tall (1.2-1.4) — high-speed runs
5TH GEAR: Tall (1.0-1.1) — top speed / highway pulls
6TH GEAR: Tall (0.7-0.8) — overdrive for fuel economy and cruising

━━━ DIFF RATIO ━━━
Recommended: 4.3 to 4.9

Shorter (4.9): More tire spin, easier to initiate drifts, but lower top speed
Taller (4.3): Less tire spin, more stable at speed, harder to initiate

For drift: 4.5-4.9 is ideal. Higher number = more drifty feel."""
    },
    "cmrcnugzs001evsj1li3bp6cd": {
        "name": "BRAKE BIAS",
        "details": """Brake Settings:

BRAKE PRESSURE: 100%
BRAKE BIAS: 55-60% Front / 40-45% Rear

━━━ WHAT BRAKE BIAS DOES ━━━

Bias controls how much braking force goes to the front vs rear brakes.
More front bias (60%+): Car dives hard under braking, rear stays light. Good for grip driving.
More rear bias (50% or less): Rear can lock up easier — useful for brake-initiated drifts.

━━━ FOR DRIFT ━━━

Drift cars use brakes differently than grip cars. You brake to shift weight and initiate the drift, not to stop quickly.

Standard drift bias: 57-60% Front / 40-43% Rear
Aggressive brake-drift setup: 55% Front / 45% Rear

If the car snaps back when you brake mid-drift: shift bias slightly more to the front.
If the rear locks up too easily when braking: reduce rear bias."""
    },
    "cmrcnuh8a001hvsj10f7urmm7": {
        "name": "DRIVING TIPS",
        "details": """━━━ INITIATION ━━━
Clutch kick in 2nd gear: floor the gas, dump the clutch at ~4000 RPM, let the rear step out, countersteer into the slide.
Handbrake: pull the handbrake while turning to break the rear loose, then release and countersteer.

━━━ HOLDING THE DRIFT ━━━
Feed throttle progressively — do not floor it then lift. Lifting suddenly causes the rear to snap back.
The angle should be controlled by throttle, not by fighting the car.
Countersteer opposite to the slide direction with smooth, gradual inputs.

━━━ CATCHING A DRIFT ━━━
If the car is about to spin: lift off the throttle smoothly (not suddenly) and straighten the steering.
If the car is about to push wide: add a small amount of throttle to rotate it back.
Never look at where you want to go — look where you want to exit the drift.

━━━ SPEED MATTERS ━━━
Higher speed = more stable drift but harder to catch.
Lower speed = easier to control but the drift looks slower.
Find the speed where your car is most consistent and build from there."""
    },
}

all_updates = {**parents, **tuning_children}

for spec_id, info in all_updates.items():
    print(f"Updating {info['name']}...")
    update_spec(spec_id, info["details"])

print("\nAll done!")
