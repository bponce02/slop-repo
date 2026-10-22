package edu.wpi.first.wpilibj;
public final class RobotController {
 public static double getBatteryVoltage(){return 12.0;}
 public static long getFPGATime(){return (long)(frc.browser.BrowserIO.time*1000000);}
}
