package edu.wpi.first.wpilibj;
/** Browser callback surface; no native Notifier. Official template Robot overrides these. */
public class TimedRobot extends RobotBase {
 public static final double kDefaultPeriod=0.02;
 private int previous=-1;
 public TimedRobot(){} public TimedRobot(double period){if(period!=0.02)throw new UnsupportedOperationException("Only 20ms period supported");}
 public double getPeriod(){return 0.02;}
 public void disabledExit(){} public void autonomousExit(){} public void teleopExit(){} public void testExit(){}
 public final void browserStep(){
  int mode=DriverStation.isDisabled()?0:DriverStation.isAutonomous()?1:DriverStation.isTest()?3:2;
  if(mode!=previous){
   switch(previous){case 0:disabledExit();break;case 1:autonomousExit();break;case 2:teleopExit();break;case 3:testExit();break;}
   switch(mode){case 0:disabledInit();break;case 1:autonomousInit();break;case 2:teleopInit();break;case 3:testInit();break;}
  }
  switch(mode){case 0:disabledPeriodic();break;case 1:autonomousPeriodic();break;case 2:teleopPeriodic();break;case 3:testPeriodic();break;}
  robotPeriodic();simulationPeriodic();previous=mode;
 }

 public void robotInit(){} public void robotPeriodic(){}
 public void simulationInit(){} public void simulationPeriodic(){}
 public void autonomousInit(){} public void autonomousPeriodic(){}
 public void teleopInit(){} public void teleopPeriodic(){}
 public void disabledInit(){} public void disabledPeriodic(){}
 public void testInit(){} public void testPeriodic(){}
 public void close(){}
}
