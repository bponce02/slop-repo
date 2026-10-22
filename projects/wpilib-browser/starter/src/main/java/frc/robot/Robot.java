package frc.robot;

import edu.wpi.first.wpilibj2.command.Command;
import edu.wpi.first.wpilibj2.command.CommandScheduler;
import frc.browser.BrowserIO;

/** Standard command-based lifecycle, invoked every 20 ms by the browser adapter. */
public class Robot extends edu.wpi.first.wpilibj.TimedRobot {
  private final RobotContainer container = new RobotContainer();
  private Command autonomousCommand;
  private boolean wasEnabled, wasAutonomous;
  @Override public void robotPeriodic() {
    boolean changed = BrowserIO.enabled != wasEnabled || BrowserIO.autonomous != wasAutonomous;
    if (changed) {
      CommandScheduler.getInstance().cancelAll();
      if (BrowserIO.enabled && BrowserIO.autonomous) {
        autonomousCommand = container.getAutonomousCommand();
        autonomousCommand.schedule();
      }
    }
    CommandScheduler.getInstance().run();
    if (!BrowserIO.enabled) container.drive.stop();
    container.drive.step();
    container.drive.publish();
    wasEnabled=BrowserIO.enabled; wasAutonomous=BrowserIO.autonomous;
  }
  public void reset() { CommandScheduler.getInstance().cancelAll(); container.drive.reset(); }
}
