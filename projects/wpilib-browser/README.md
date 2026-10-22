# WPILib Browser Lab — incomplete prototype

Static browser Java workspace, statement REPL, CLI output panel, simulated Driver Station controls and an isometric tank-drive preview with four Kraken placeholders (two per side).

## Run

```sh
python3 scripts/fetch-assets.py
python3 -m http.server 8080 --directory public
```

Open http://localhost:8080. No Java execution backend is used. Assets are served locally. Requires a modern browser with Wasm GC.

## Current blocker / verified status

Tested in headless Chromium through Playwright. Real WPILib Java successfully compiles to Wasm and executes:

```text
WPILib clamp: 1.0
Two-Kraken stall torque (Nm): 14.18
```

The initial failure was caused by mixing upstream compiler and classlib versions. All compiler assets now use `/playground/3/` together.

A separate test of `DifferentialDrivetrainSim` fails during Wasm generation: EJML `pabeles/concurrency/ConcurrencyOps.java` references missing classes. The diagnostic formatter has now been patched and rebuilt. Chromium confirms the missing class is `java.util.concurrent.ForkJoinPool`. Physics integration remains blocked; no fake replacement is presented as WPILib.

The Driver Station and canvas preview are independent approximate JavaScript models. They are NOT connected to Java robot code. Native HAL/Phoenix, actual WPILib DifferentialDrivetrainSim, and the normal command-based starter are not implemented. The default Java workspace is only a math smoke test. The canvas is an isometric projection, not a full WebGL scene.

REPL submissions wrap statements in a main method and replay prior successful submissions; this is not JShell and side effects repeat. Workers can be terminated using Stop. Browser localStorage saves edited files.

Bundled dependencies: WPILib 2025.3.2 and its math dependencies. `public/assets.json` records download URLs and hashes. TeaVM-javac is Apache-2.0 with OpenJDK GPLv2+Classpath Exception components; WPILib is BSD. See upstream licensing before redistributing prebuilt dependencies.

Next step: implement or avoid the missing ForkJoinPool API before implementing HAL bridges. Do not replace real WPILib classes with silent stubs.

## Patched compiler

Compiler + both class libraries are now built together from teavm-javac revision `208d4c97a602` (TeaVM 0.16.0). The diagnostic fix is in `patches/teavm-javac-diagnostics.patch`. Reproduce with JDK 25:

```sh
JAVA_HOME=/path/to/jdk25 sh scripts/build-compiler.sh
```

Successful build took 47 seconds after container memory increased from 2 GB to 6 GB. One Gradle worker and a 1200 MB daemon heap were used; the upstream Wasm compiler child has a 4 GB heap cap. No ForkJoinPool implementation or concurrency behavior changes have been made yet.

## Runtime compatibility progress (latest)

The previous ForkJoinPool blocker is now bypassed by an explicitly **single-threaded compatibility subset** in `runtime-src`. `ForkJoinTask` runs lazily on get/join, records results/failures/cancellation; the pool reports parallelism 1 and rejects requests for multiple workers. Only listed methods are supported; this is not a conformant general-purpose ForkJoinPool. `IntStream.parallel()` remains sequential. No WPILib or EJML physics formulas were changed.

Browser test now executes real `DifferentialDrivetrainSim`, using two Kraken X60 motors per side. At 6 V per side for 50 × 20 ms it outputs:

```
WPILib drivetrain distance: 2.097324209817624
```

`tests/physics-snippet.java.txt` contains the exact test, including an explicit subclass overriding battery-voltage clamping with simulated 12 V. Without that adapter, the unmodified setInputs path still hits native HAL. No real HAL or Phoenix support has been implemented. The canvas preview remains disconnected. JVM parity and broader concurrency behavioral testing are still pending.

Run `npm install`, `npx playwright install chromium`, then `npm test` / `npm run test:physics` with the static server already running. These tests assert the recorded output. The runtime patch is reproducible with `JAVA_HOME=/path/to/jdk25 python3 scripts/patch-runtime.py`.
