# WPILib Browser Lab

A serverless Java/Wasm robot workspace with top-level **Editor** and **Driving** tabs. VS Code-inspired dark editor, file explorer, Java syntax highlighting, line numbers, persistent files, CLI and REPL. Three.js renders a KOP-style six-wheel tank chassis with **four Kraken X60 motors, two per side**.

## Run

```sh
python3 -m http.server 8080 --directory public
```

Open http://localhost:8080. Bundled compiler/JARs require no execution server. Modern Wasm-GC and WebGL browser required.

1. Editor → **Compile & run project**. Wait for `[robot running]`.
2. Driving → **Enable**. W/S control left side, ↑/↓ right side.
3. Drag to orbit; scroll to zoom. Disable / E-stop cuts commanded voltage, while drivetrain coasts.
4. Edit `DriveSubsystem.java` (e.g. multiplier 6.0 → 3.0), rebuild, then drive to observe changed behavior.
5. REPL compiles independent statement snippets, replaying successful submissions. Running it stops the robot worker; rebuild the robot to drive again.

## Actual Java control loop

`starter/src/main/java/frc/robot/` contains Main, Robot (extends TimedRobot), RobotContainer, and DriveSubsystem. Real WPILib RunCommand and SubsystemBase plus WPILib's CommandScheduler scheduling logic drive real DifferentialDrivetrainSim using DCMotor.getKrakenX60(2). Java publishes pose/encoder/voltage telemetry to WebGL; there is no independent JS physics model. Autonomous drives at 35% of the Java voltage multiplier. Changing mode, switching tabs, losing focus and hiding the page disables driving.

**This is a browser-adapted WPILib project, not an unchanged or deployable GradleRIO/Phoenix robot.** The following adapters are explicit and inspectable in `public/bridge/`:

- TimedRobot callbacks are host-driven at fixed 20 ms simulated steps; browser scheduling can run slower than real time.
- CommandScheduler is derived from WPILib 2025.3.2 (BSD); native HAL reporting, LiveWindow callbacks, native Watchdog and RobotState access are adapted. Scheduling/arbitration logic remains upstream. Composition tracking uses strong identity references instead of WeakHashMap.
- BrowserWatchdog does not monitor deadlines; no native notifier/watchdog emulation is claimed.
- SendableRegistry stores metadata only: no NetworkTables/LiveWindow publication. Strong references persist until rebuilding.
- BrowserIO supplies mode/input; no native joystick HAL or Phoenix CAN support. Four motors are represented in the physical motor model, not four Phoenix devices.
- The simulator subclasses only the battery-voltage clamp to use an explicit 12 V simulation supply.
- Runtime Fork/Join subset is sequential/lazy and is not a conformant concurrent JVM. Requests for parallelism >1 fail. IntStream.parallel remains sequential.

`starter/build.gradle` documents dependencies only; browser builds do not execute Gradle. Native hardware deployment is out of scope.

## Browser validation

```sh
npm install
npx playwright install chromium
# with static server running:
npm test
npm run test:physics
npm run test:ui
```

Chromium E2E verifies real Java project compilation, nonzero pose, teleop 6 V, E-stop latch, autonomous 2.1 V, mode-change disable, edited Java 3 V, disabled zero voltage, and no page exceptions. Screenshots: `tests/editor-tab.png`, `tests/driving-tab.png`, `tests/mobile-editor.png`.

Verified standalone physics output at 6 V for one simulated second: `WPILib drivetrain distance: 2.097324209817624`. JVM numerical parity and arbitrary concurrency programs have not been validated.

## Rebuild / provenance

```sh
JAVA_HOME=/path/to/jdk25 sh scripts/build-compiler.sh
python3 scripts/sync-project.py
python3 scripts/fetch-assets.py
```

TeaVM-javac revision 208d4c97a602 / TeaVM 0.16.0, with diagnostic fixes in `patches/`; sequential runtime additions in `runtime-src/`. Container build succeeded with 6 GB RAM, one Gradle worker, 1200 MB daemon heap and upstream 4 GB compiler child cap. Hashes/URLs are recorded in `public/assets.json` (locally patched compiler binaries are not identical to upstream downloads).

Licenses: TeaVM/TeaVM-javac Apache-2.0, OpenJDK components GPLv2 + Classpath Exception, WPILib BSD, EJML Apache-2.0, CodeMirror MIT, Three.js MIT. Inspect upstream licenses before redistributing bundles.

## Official template provenance

`upstream/commandbased/` contains the verbatim official WPILib v2025.3.2 command-based Java template, with URLs and SHA256 in `upstream/manifest.json`. Active `Robot.java` is identical except for the standard `frc.robot` package substitution. `Constants.java` is likewise imported. RobotContainer is customized for the requested tank robot; Main is a browser lifecycle launcher. Unused example commands/subsystem are kept outside the active starter in `template-examples/` because compiling them exposed a javac/Wasm stack overflow. The complete originals remain under upstream.

The unchanged Robot lifecycle dispatches autonomous scheduling and teleop cancellation; physics now advances in DriveSubsystem.simulationPeriodic. The existing explicit native-service bridges still apply; this is not an unchanged HAL/GradleRIO project. Existing local edits use a separate localStorage key so they are not overwritten.

Desktop validation: downloaded and launched official Microsoft VS Code with a disposable profile for reference (`tests/vscode-reference.png`). This is stock VS Code, not the full WPILib installer. Browser editor was also opened through the agent-owned desktop. Headless Chromium E2E confirms official Robot.java builds and drives, including autonomous and editing Java voltage. Desktop Chromium lacked WebGL in this environment; editor initialization now survives that failure with a visible message. Three.js driving remains verified in Chromium with software WebGL.

## Standard API adapter update

Official Main.java now uses RobotBase.startRobot(Robot::new) without browser exports or robot-specific host logic; Robot.java remains upstream apart from package names. BrowserEntry and TimedRobot adapters dispatch startup, mode exit/init, mode periodic, robotPeriodic and simulationPeriodic. Tank input now uses Joystick.getY(); the physics model uses its original RobotController battery path instead of a subclass override. See docs/SIMULATION-ADAPTERS.md for the exact supported subset. Not all generic command-based projects are supported: Xbox/buttons, timers/notifiers, native motor-controller APIs and HAL are still incomplete.

Desktop Chromium compiled and ran this project through the standard entrypoint and showed JAVA CONNECTED plus running telemetry at http://open-terminal:8080/. Screenshot: tests/standard-api-desktop.png. Its WebGL context was unavailable, so visualization gracefully falls back while simulation controls continue. Full driving regression for this latest adapter change remains to be rerun with software WebGL.
