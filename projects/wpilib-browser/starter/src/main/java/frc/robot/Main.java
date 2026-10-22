package frc.robot;

import frc.browser.BrowserIO;
import org.teavm.jso.JSExport;

/** Browser entrypoint. Runtime adapter lives separately from robot control logic. */
public final class Main {
  private static Robot robot;
  public static void main(String[] args) { robot=new Robot(); System.out.println("Command-based WPILib robot ready: 4 Kraken X60, 2 per side"); }
  @JSExport public static void tick(boolean enabled,boolean autonomous,double left,double right,boolean reset) {
    BrowserIO.set(enabled,autonomous,left,right);
    if(reset)robot.reset();
    robot.robotPeriodic();
  }
}
