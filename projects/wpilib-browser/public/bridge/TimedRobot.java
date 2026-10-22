package edu.wpi.first.wpilibj;
/** Browser lifecycle adapter: host invokes callbacks; no native Notifier thread. */
public class TimedRobot implements AutoCloseable {
 public static final double kDefaultPeriod=0.02;
 public void robotInit(){} public void robotPeriodic(){} public void simulationPeriodic(){}
 public void autonomousInit(){} public void teleopInit(){} public void disabledInit(){}
 public void close(){}
}
