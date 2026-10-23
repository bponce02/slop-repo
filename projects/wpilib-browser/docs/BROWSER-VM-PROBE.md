# Actual Phoenix browser VM feasibility probe

Tested upstream https://ktock.github.io/qemu-wasm-demo/alpine-x86_64.html in desktop Chromium. QEMU/Wasm booted Linux 6.12.43 x86_64 / Alpine 3.21 and accepted root login. `uname -m` returned x86_64. `ldd --version` returned musl 1.2.5. No java executable was installed. The demo exposes 512MB guest RAM and ~235MB writable overlay space. Screenshot: tests/qemu-linux-probe.png.

Actual Phoenix 26.3.0 Linux x86-64 api-cpp-sim ZIP was separately downloaded and inspected with file/readelf: ELF64 x86-64, requires GLIBC_2.35, libCTRE_PhoenixTools_Sim.so, libstdc++, libgcc, libm/libc and the glibc loader. It was NOT loaded or executed in the guest.

Attempting to download the Phoenix ZIP from inside the demo returned HTTP 503 via its browser Fetch proxy. Cause was not isolated; CORS/network proxy restrictions are plausible, not proven. A self-hosted image can preload artifacts instead of relying on that proxy.

CheerpX overview https://cheerpx.io/docs/overview explicitly targets 32-bit x86 executables. It is not directly compatible with this 64-bit Phoenix library.

Next experiment: construct a glibc >=2.35 guest filesystem with Java, matching WPILib and Phoenix native simulation artifacts preinstalled; serve emulator and disk image on same origin with required cross-origin isolation. First verify java -version and native-library loading, then run a finite Phoenix smoke test. Success booting Linux is NOT success running Phoenix. No Phoenix/swerve performance claim has been established.

Custom glibc initramfs built (~85MB unpacked) with minimal JRE and Phoenix libraries. Local QEMU boot failed before userspace with IO-APIC/timer kernel panic. Next configuration prepared: noapic; not tested yet. Phoenix has not executed. Probe files: /home/user/phoenix-vm-probe.

## Confirmed native JNI success

Clean Chromium session with noapic boot successfully ran Java 25 and Phoenix 26.3.0's unmodified Java wrapper and native simulation libraries inside QEMU/Wasm. Observed:

```
[phoenix] Library initialization is complete.
PHOENIX_NATIVE_JNI_OK simulation=true time=33.737371
[phoenix] Library shutdown cleanly
```

Smoke test calls UtilsJNI.isSimulation() and getCurrentTimeSeconds(). Screenshot: tests/phoenix-jni-success.png. This proves native JNI execution, NOT TalonFX control, swerve or real-time performance. Earlier empty/failed attempts were superseded by this successful clean session. noapic resolves the kernel timer panic. Static server provides files only; guest code runs in browser.

Probe source saved under experiments/phoenix-vm; required emulator/kernel/rootfs assets remain outside the Git repo in /home/user/phoenix-vm-probe/assets. The experiment is not integrated into the normal editor app and is not yet a portable build. Browser requires secure context plus COOP/COEP; local desktop test used an insecure-origin-as-secure flag solely for the internal development hostname.

Swerve follow-up: actual CoreTalonFX control returned nonzero simulated voltage in browser. Native Linux baseline using CTRE example TunerConstants, a minimal drivetrain subclass, HAL DriverStationSim and real Phoenix SwerveDrivetrain reached ~1.76m forward. This is a finite probe, not the entire PathPlanner example. Browser execution hit CANcoder/TalonFX configuration TxFailed/stale signal errors. Tried explicit sim bus, loopback-up, device warmup and JVM tiered mode; no verified browser swerve movement yet. An instruction-count virtual-clock configuration was prepared to test emulation timing. Do not treat these results as an integrated or passing swerve app.

## Isolated config failure

DeviceConfigProbe constructs one CoreCANcoder and one CoreTalonFX and applies default configs at 0.1/1/5-second timeouts. Native Linux: all return OK in ~6–30ms. Browser guest: both return TxFailed at all three timeout settings. Therefore a longer public config timeout does not resolve the problem and failure is not specific to SwerveDrivetrain. strace showed repeated futex timeouts, but those alone do not prove a bug (timed waits can be normal). No ENOSYS/EINVAL appeared in the selected trace output. Changing guest clocksource from tsc to hpet did not fix configuration. Screenshot tests/phoenix-config-isolation.png. Actual root cause remains unproven; investigate simulated device config transport/background-thread progress rather than claiming timing as established cause.
