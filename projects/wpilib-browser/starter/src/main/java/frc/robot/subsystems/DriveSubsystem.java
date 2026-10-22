package frc.robot.subsystems;

import edu.wpi.first.math.MathUtil;
import edu.wpi.first.math.Matrix;
import edu.wpi.first.math.StateSpaceUtil;
import edu.wpi.first.math.numbers.N1;
import edu.wpi.first.math.numbers.N2;
import edu.wpi.first.math.system.plant.DCMotor;
import edu.wpi.first.wpilibj.simulation.DifferentialDrivetrainSim;
import edu.wpi.first.wpilibj2.command.SubsystemBase;

/** Four Kraken X60s, two per side. Browser output is voltage, not Phoenix CAN. */
public class DriveSubsystem extends SubsystemBase {
  private double leftVolts, rightVolts;
  private final DifferentialDrivetrainSim physics = new DifferentialDrivetrainSim(
      DCMotor.getKrakenX60(2), 10.71, 7.5, 60.0, 0.0762, 0.62, null) {
    @Override
    protected Matrix<N2, N1> clampInput(Matrix<N2, N1> input) {
      return StateSpaceUtil.desaturateInputVector(input, 12.0);
    }
  };

  public void tankDrive(double left, double right) {
    // Edit this multiplier and rebuild to change how the robot drives.
    leftVolts = MathUtil.clamp(left, -1, 1) * 6.0;
    rightVolts = MathUtil.clamp(right, -1, 1) * 6.0;
  }
  public void stop() { leftVolts = rightVolts = 0; }
  public void step() { physics.setInputs(leftVolts, rightVolts); physics.update(0.02); }
  public void reset() { stop(); physics.setState(new Matrix<>(edu.wpi.first.math.Nat.N7(), edu.wpi.first.math.Nat.N1())); }
  public void publish() {
    var pose = physics.getPose();
    System.out.println("@STATE " + pose.getX() + "," + pose.getY() + "," + pose.getRotation().getRadians()
        + "," + physics.getLeftVelocityMetersPerSecond() + "," + physics.getRightVelocityMetersPerSecond()
        + "," + physics.getLeftPositionMeters() + "," + physics.getRightPositionMeters()
        + "," + leftVolts + "," + rightVolts);
  }
}
