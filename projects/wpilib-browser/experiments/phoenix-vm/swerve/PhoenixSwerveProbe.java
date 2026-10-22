public class PhoenixSwerveProbe {
 public static void main(String[] args)throws Exception {
  edu.wpi.first.hal.HAL.initialize(500,0);
  try(var drive=frc.robot.generated.TunerConstants.createDrivetrain()) {
   edu.wpi.first.wpilibj.simulation.DriverStationSim.setDsAttached(true);edu.wpi.first.wpilibj.simulation.DriverStationSim.setEnabled(true);edu.wpi.first.wpilibj.simulation.DriverStationSim.notifyNewData();System.out.println("SWERVE_CREATED");
   for(int i=0;i<100;i++){
    com.ctre.phoenix6.unmanaged.Unmanaged.feedEnable(1000);
    drive.setControl(new com.ctre.phoenix6.swerve.SwerveRequest.RobotCentric().withVelocityX(1).withVelocityY(0).withRotationalRate(0));
    edu.wpi.first.wpilibj.simulation.DriverStationSim.notifyNewData();edu.wpi.first.hal.HAL.simPeriodicBefore();drive.updateSimState(.02,12);edu.wpi.first.hal.HAL.simPeriodicAfter();Thread.sleep(20);
    if(i%10==0)System.out.println("SWERVE_STATE "+i+" "+drive.getState().Pose);
   }
   System.out.println("SWERVE_DONE "+drive.getState().Pose);
  }
 }
}
