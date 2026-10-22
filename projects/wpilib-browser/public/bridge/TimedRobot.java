package edu.wpi.first.wpilibj;
/** Browser callback surface; no native Notifier. Official template Robot overrides these. */
public class TimedRobot implements AutoCloseable {
 public static final double kDefaultPeriod=0.02;
 public void robotInit(){} public void robotPeriodic(){}
 public void simulationInit(){} public void simulationPeriodic(){}
 public void autonomousInit(){} public void autonomousPeriodic(){}
 public void teleopInit(){} public void teleopPeriodic(){}
 public void disabledInit(){} public void disabledPeriodic(){}
 public void testInit(){} public void testPeriodic(){}
 public void close(){}
}
