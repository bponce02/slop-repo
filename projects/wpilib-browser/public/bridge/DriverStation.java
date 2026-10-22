package edu.wpi.first.wpilibj;
import frc.browser.BrowserIO;
/** Supported DS subset. Inputs are injected by the browser, not native DS networking. */
public final class DriverStation {
 public static boolean isEnabled(){return BrowserIO.enabled;} public static boolean isDisabled(){return !isEnabled();}
 public static boolean isAutonomous(){return BrowserIO.autonomous;} public static boolean isAutonomousEnabled(){return isEnabled()&&isAutonomous();}
 public static boolean isTeleop(){return !isAutonomous()&&!isTest();} public static boolean isTeleopEnabled(){return isEnabled()&&isTeleop();}
 public static boolean isTest(){return false;} public static boolean isDSAttached(){return true;}
 public static void reportWarning(String text,boolean trace){System.err.println(text);} public static void reportError(String text,boolean trace){System.err.println(text);}
}
