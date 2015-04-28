
var bindings = require('bindings')
var addon = bindings('rpi_rgb_led_matrix')

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

		if (byColumn) {
			if (fromTopOrLeft) {
				for (var x = 0; x < width; x++)
					for (var y = 0; y < height; y++)
						colorPixel(x, y);
			} else {
				for (var x = width - 1; x >= 0; x--)
					for (var y = 0; y < height; y++)
						colorPixel(x, y);
			}
		} else {
			if (fromTopOrLeft) {
				for (var y = 0; y < height; y++)
					for (var x = 0; x < width; x++)
						colorPixel(x, y);
			} else {
				for (var y = height - 1; y >= 0; y++)
					for (var x = 0; x < width; x++)
						colorPixel(x, y);
			}
		}
	},

	clear: function() {
		if (!isStarted) throw new Error("'clear' called before 'start'")
		addon.clear()
	}
}

// vim: nosta noet
