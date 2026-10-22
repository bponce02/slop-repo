package edu.wpi.first.wpilibj;
/** Deterministic simulation clock; advanced by the browser's 20ms robot steps. */
public class Timer {
 private double accumulated,start;
 private boolean running;
 public static double getFPGATimestamp(){return frc.browser.BrowserIO.time;}
 public static double getTimestamp(){return getFPGATimestamp();}
 public static void delay(double seconds){throw new UnsupportedOperationException("Blocking Timer.delay is unsupported; use commands or elapsed-time checks");}
 public double get(){return accumulated+(running?getFPGATimestamp()-start:0);}
 public void reset(){accumulated=0;start=getFPGATimestamp();}
 public void start(){if(!running){start=getFPGATimestamp();running=true;}}
 public void restart(){reset();running=true;}
 public void stop(){if(running){accumulated=get();running=false;}}
 public boolean isRunning(){return running;}
 public boolean hasElapsed(double seconds){return get()>=seconds;}
 public boolean advanceIfElapsed(double seconds){if(!hasElapsed(seconds))return false;if(running)start+=seconds;else accumulated-=seconds;return true;}
}
