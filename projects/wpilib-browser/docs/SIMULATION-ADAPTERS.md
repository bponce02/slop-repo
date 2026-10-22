# WPILib browser simulation boundaries

Reviewed WPILib v2025.3.2 `RobotBase`, `IterativeRobotBase.loopFunc`, `GenericHID`, `DriverStationSim` (reference sources in docs/reference). Desktop DriverStationSim injects HAL simulation state via DriverStationDataJNI; that JNI library cannot be loaded by TeaVM. Browser adapters implement a limited Java surface instead.

Implemented: official Main.startRobot supplier startup; TimedRobot mode exit/init/periodic then robotPeriodic/simulationPeriodic; DriverStation mode predicates; two Joystick Y axes; 12V RobotController supply and deterministic FPGA time. BrowserEntry now references only the entrypoint, not the team's Robot, RobotContainer, or drivetrain. Official Main.java and Robot.java have only package substitutions. Drive physics uses unmodified DifferentialDrivetrainSim including its battery-clamping method.

Still limited: no native HAL, Phoenix, arbitrary GenericHID/buttons, Xbox, NetworkTables, notifier/timer concurrency, test-mode UI, real DS transport or full TimedRobot API. Unsupported joystick ports/axes fail. Unimplemented methods fail compilation rather than claim full simulation support. Simulation-specific telemetry/reset wiring remains in DriveSubsystem. Scheduler/native-service adapters and sequential ForkJoin subset remain as previously documented.
