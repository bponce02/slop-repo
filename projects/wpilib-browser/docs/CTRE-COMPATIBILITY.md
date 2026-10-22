# CTRE swerve compatibility audit

Target inspected: CrossTheRoadElec/Phoenix6-Examples `java/SwerveWithPathPlanner`, pinned in ctre-reference/PROVENANCE.json. This is reference code, NOT a passing browser test.

The example uses Phoenix 26.3.0 / WPILib 2026 plus PathPlanner, whereas Browser Lab uses WPILib 2025.3.2. A matching dependency set is required before claiming source compatibility.

CTRE's published Phoenix 26.3.0 Java source JAR was inspected: `com.ctre.phoenix6.swerve.SwerveDrivetrain` delegates drivetrain creation, requests, odometry and pose resets to `SwerveJNI`. `SimSwerveDrivetrain` does not eliminate that native control dependency. Downloading the Java JAR alone will not make this example execute in Wasm.

Missing boundaries:
- Xbox axes/buttons/POV, command triggers and event polling.
- Native Phoenix TalonFX/CANcoder/Pigeon2 configuration, status signals, control requests, timestamps, native swerve control and odometry.
- Periodic notifier simulation dispatch; concurrent native control/odometry threads cannot be promised by the sequential browser runtime.
- SmartDashboard/NetworkTables/chooser and PathPlanner dependencies.

Current increment: deterministic WPILib Timer surface, validated on JVM against adapter tests. Timer.delay fails explicitly instead of blocking the browser. Browser execution and WaitCommand regression are pending. Xbox, native motors and Phoenix have NOT been implemented by this increment.

A Java-only swerve kinematics demo would be useful but would not constitute running this CTRE project. Any replacement for native Phoenix must be labeled an independent compatibility implementation, with separate numerical/behavioral tests; do not present it as CTRE simulation.
