package frc.robot;
import frc.browser.BrowserIO;
import org.teavm.jso.JSExport;
/** Browser launcher; official Robot.java is unchanged except its package declaration. */
public final class Main {
 private static Robot robot;
 private static boolean wasEnabled,wasAutonomous,started;
 public static void main(String[] args) {
   robot=new Robot();robot.robotInit();robot.simulationInit();
   System.out.println("Official WPILib command-based Robot ready: 4 Kraken X60, 2 per side");
 }
 @JSExport public static void tick(boolean enabled,boolean autonomous,double left,double right,boolean reset) {
   BrowserIO.set(enabled,autonomous,left,right);
   if(reset){edu.wpi.first.wpilibj2.command.CommandScheduler.getInstance().cancelAll();frc.robot.subsystems.DriveSubsystem.instance.reset();}
   if(!started||enabled!=wasEnabled||autonomous!=wasAutonomous){
     if(!enabled)robot.disabledInit();else if(autonomous)robot.autonomousInit();else robot.teleopInit();
   }
   if(!enabled)robot.disabledPeriodic();else if(autonomous)robot.autonomousPeriodic();else robot.teleopPeriodic();
   robot.robotPeriodic();robot.simulationPeriodic();
   wasEnabled=enabled;wasAutonomous=autonomous;started=true;
 }
}
