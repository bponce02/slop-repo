import edu.wpi.first.wpilibj.Timer;
import frc.browser.BrowserIO;
public class TimerAdapterTest {
 static void check(boolean value){if(!value)throw new AssertionError();}
 public static void main(String[] args){
  BrowserIO.time=0;Timer t=new Timer();t.start();BrowserIO.time=.1;check(t.hasElapsed(.1));
  check(t.advanceIfElapsed(.04));check(Math.abs(t.get()-.06)<1e-9);
  t.stop();BrowserIO.time=3;check(Math.abs(t.get()-.06)<1e-9);
  t.reset();check(t.get()==0);t.restart();BrowserIO.time=3.5;check(t.get()==.5);
  try{Timer.delay(1);throw new AssertionError();}catch(UnsupportedOperationException expected){}
  System.out.println("PASS deterministic Timer start/stop/reset/restart/advance and unsupported blocking delay");
 }
}
