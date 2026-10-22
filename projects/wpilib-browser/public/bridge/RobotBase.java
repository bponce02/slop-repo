package edu.wpi.first.wpilibj;
import java.util.function.Supplier;
/** Browser implementation of the WPILib startup boundary; no native HAL. */
public abstract class RobotBase implements AutoCloseable {
 public static TimedRobot browserRobot;
 public static boolean isSimulation(){return true;} public static boolean isReal(){return false;}
 public static <T extends RobotBase> void startRobot(Supplier<T> supplier){
   RobotBase robot=supplier.get();
   if(!(robot instanceof TimedRobot))throw new UnsupportedOperationException("Browser supports TimedRobot only");
   browserRobot=(TimedRobot)robot;browserRobot.robotInit();browserRobot.simulationInit();
 }
 public void close(){}
}
