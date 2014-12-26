
0.8.5 / 2014-12-26
==================

  * fix - Invalid JSDoc

0.8.4 / 2013-10-25
==================

  * fix - ensure that exceptions thrown inside a read/write job don't prevent the rest of the jobs being flushed.

0.8.3 / 2013-10-25
==================

  * fix - ensure rAF loop can continue when error is thrown inside job.

0.8.2 / 2013-10-15
==================

  * fix - prevent unnecessary frame being scheduled when write requested inside read callback, inside write callback.

0.8.1 / 2013-10-15
==================

  * change - if `fastdom.onError` handler is registered, errors are caught and handler is called.

0.8.0 / 2013-10-14
==================

  * change - to a rAF loop technique of emptying frame queue to prevent frame conflicts
  * add - ability to call `FastDom#defer` with no frame argument to schedule job for next free frame
  * change - errors not caught by default

0.7.1 / 2013-10-05
==================

  * fix - memory leaks with undeleted refs
  * fix - context not being passed to `.defer` jobs

0.7.0 / 2013-10-05
==================

  * add - `FastDom#clear` clears read, write and defer jobs by id
  * remove - `FastDom#clearRead`
  * remove - `FastDom#clearWrite`
  * change - directory structure by removing `/lib`
