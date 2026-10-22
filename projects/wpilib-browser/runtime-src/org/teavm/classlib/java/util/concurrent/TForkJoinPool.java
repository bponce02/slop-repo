package org.teavm.classlib.java.util.concurrent;

import java.util.concurrent.Callable;

/** Browser-only sequential compatibility subset; never creates worker threads. */
public class TForkJoinPool {
  private boolean shutdown;
  private static final TForkJoinPool COMMON = new TForkJoinPool();
  public TForkJoinPool() {}
  public TForkJoinPool(int parallelism) {
    if(parallelism<1 || parallelism>32767)throw new IllegalArgumentException("Invalid parallelism");
    if(parallelism!=1)throw new UnsupportedOperationException("Browser pool supports parallelism=1 only");
  }
  public static TForkJoinPool commonPool() { return COMMON; }
  public int getParallelism() { return 1; }
  private void check() { if(shutdown)throw new IllegalStateException("Pool is shut down"); }
  public <T> TForkJoinTask<T> submit(TForkJoinTask<T> task) {check();if(task==null)throw new NullPointerException();return task;}
  public TForkJoinTask<?> submit(Runnable action) {return submit(action,null);}
  public <T> TForkJoinTask<T> submit(Runnable action,T result) {
    check();if(action==null)throw new NullPointerException();
    return new TForkJoinTask<T>() {
      private T value=result;
      public T getRawResult(){return value;}
      protected void setRawResult(T v){value=v;}
      protected boolean exec(){action.run();return true;}
    };
  }
  public <T> TForkJoinTask<T> submit(Callable<T> action) {
    check();if(action==null)throw new NullPointerException();
    return new TForkJoinTask<T>() {
      private T value;
      public T getRawResult(){return value;}
      protected void setRawResult(T v){value=v;}
      protected boolean exec(){try{value=action.call();return true;}catch(Exception e){fail(e);return true;}}
    };
  }
  public <T> T invoke(TForkJoinTask<T> task) {check();return task.invoke();}
  public void shutdown(){shutdown=true;}
  public boolean isShutdown(){return shutdown;}
}
