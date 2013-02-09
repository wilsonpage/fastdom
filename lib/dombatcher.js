
/**
 * Util
 */

function dispatch(fns) {
	var fn;
	while (fn = fns.shift()) fn();
}

/**
 * Lib
 */

function DomBatcher() {
	this.reads = [];
	this.writes = [];
}

DomBatcher.prototype.read = function(fn) {
	this._dispatcher = this._dispatcher || this.dispatch();
	this.reads.push(fn);
};

DomBatcher.prototype.write = function(fn) {
	this._dispatcher = this._dispatcher || this.dispatch();
	this.writes.push(fn);
};

DomBatcher.prototype.dispatch = function() {
	var self = this;
	return setTimeout(function() {
		dispatch(self.reads);
		dispatch(self.writes);
		delete self._dispatcher;
	}, 0);
};
