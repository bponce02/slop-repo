package frc.browser;
import org.teavm.jso.JSExport;
import edu.wpi.first.wpilibj.RobotBase;
/** Browser host only; no references to team Robot/RobotContainer/subsystem types. */
public final class BrowserEntry {
 public static void main(String[] args){frc.robot.Main.main(args);System.out.println("WPILib template running through browser lifecycle adapter");}
 @JSExport public static void tick(boolean enabled,boolean autonomous,double left,double right,boolean reset){
  BrowserIO.set(enabled,autonomous,left,right);BrowserIO.time+=0.02;
  if(reset&&BrowserIO.resetHandler!=null)BrowserIO.resetHandler.run();
  RobotBase.browserRobot.browserStep();
 }
}
