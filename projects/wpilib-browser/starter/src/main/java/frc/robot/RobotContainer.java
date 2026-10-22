// Customized from WPILib 2025.3.2 command-based RobotContainer.
// Example Xbox bindings replaced with explicit browser tank inputs.
package frc.robot;

import edu.wpi.first.wpilibj2.command.Command;
import edu.wpi.first.wpilibj2.command.RunCommand;
import frc.robot.subsystems.DriveSubsystem;
import edu.wpi.first.wpilibj.Joystick;

public class RobotContainer {
  private final Joystick leftStick=new Joystick(0),rightStick=new Joystick(1);
  public final DriveSubsystem drive = new DriveSubsystem();
  public RobotContainer() {
    drive.setDefaultCommand(new RunCommand(
        () -> drive.tankDrive(-leftStick.getY(), -rightStick.getY()), drive));
  }
  public Command getAutonomousCommand() {
    return new RunCommand(() -> drive.tankDrive(0.35, 0.35), drive);
  }
}
