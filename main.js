
var bindings = require('bindings')
var addon = bindings('rpi_rgb_led_matrix')

var _ = require('underscore');

var isStarted = false

var board = module.exports = {
	start: function(rows, chain, clearOnClose) {
		if (!rows) rows = 32
		if (!chain) chain = 1
		clearOnClose = clearOnClose !== false

		addon.start(rows, chain)
		isStarted = true

		if (clearOnClose) {
			process.on('exit', function() { addon.stop() })
			process.on('SIGINT', function() { addon.stop(); process.exit(0) })
		}
	},

	stop: function() {
		addon.stop()
		isStarted = false
	},

	setPixel: function(x, y, r, g, b) {
		if (!isStarted) throw new Error("'setPixel' called before 'start'")
		if (r > 255 || g > 255 || b > 255) throw new Error("Colors should be between 0 and 255")
		addon.setPixel(x, y, r, g, b)
	},

	fill: function(r, g, b) {
		if (!isStarted) throw new Error("'fill' called before 'start'")
		if (r > 255 || g > 255 || b > 255) throw new Error("Colors should be between 0 and 255")
		addon.fill(r, g, b)
	},

	drawCanvas: function(ctx, width, height, byColumn, fromTopOrLeft) {
		if (byColumn == undefined) byColumn = true;
		if (fromTopOrLeft == undefined) fromTopOrLeft = true;

		// this is kind of slow but could be optimized by passing imageData.data directly
		// and copying it to the screen framebuffer
		if (!isStarted) throw new Error("'drawCanvas' called before 'start'")

		var imageData = ctx.getImageData(0, 0, width, height)
		var data = imageData.data

		var colorPixel = function(x, y) {
			var offset = 4 * (x + y * width);
			board.setPixel(x, y, data[offset], data[offset + 1], data[offset + 2]);
		}

		var xRange = _.range(0, width, 1);
		var xRangeRev = _.range(width-1, -1, -1);
		var yRange = _.range(0, height, 1);
		var yRangeRev = _.range(height-1, -1, -1);

		if (byColumn) {
			var useRange = fromTopOrLeft ? xRange : xRangeRev;
			_.map(useRange, function (x) { _.map(yRange, function (y) { colorPixel(x, y); }); });
		} else {
			var useRange = fromTopOrLeft ? yRange : yRangeRev;
			_.map(useRange, function (y) { _.map(xRange, function (x) { colorPixel(x, y); }); });
		}
	},

	clear: function() {
		if (!isStarted) throw new Error("'clear' called before 'start'")
		addon.clear()
	}
}

// vim: nosta noet
