package edu.wpi.first.wpilibj2.command;
/** No native notifier; loop deadline monitoring is handled by the browser host. */
final class BrowserWatchdog {
 void reset(){} void addEpoch(String name){} void disable(){} boolean isExpired(){return false;}
 void printEpochs(){} void setTimeout(double timeout){}
}
