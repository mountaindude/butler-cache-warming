var later = require('later');
var moment = require('moment');
require('moment-precise-range-plugin');

function serviceUptimeStart(config, logger) {
    var uptimeLogLevel = config.get('uptimeMonitor.logLevel'),
        uptimeInterval = config.get('uptimeMonitor.frequency');

    // Formatter for numbers
    const formatter = new Intl.NumberFormat('en-US');

    // Log uptime to console
    Number.prototype.toTime = function (isSec) {
        var ms = isSec ? this * 1e3 : this,
            lm = ~(4 * !!isSec),
            /* limit fraction */
            fmt = new Date(ms).toISOString().slice(11, lm);

        if (ms >= 8.64e7) {
            /* >= 24 hours */
            var parts = fmt.split(/:(?=\d{2}:)/);
            parts[0] -= -24 * ((ms / 8.64e7) | 0);
            return parts.join(':');
        }

        return fmt;
    };

    var startTime = Date.now();
    var startIterations = 0;

    later.setInterval(function () {
        startIterations++;
        let uptimeMilliSec = Date.now() - startTime;
        moment.duration(uptimeMilliSec);

        let heapTotal = Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
            heapUsed = Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
            processMemory = Math.round((process.memoryUsage().rss / 1024 / 1024) * 100) / 100;

        logger.log(uptimeLogLevel, '--------------------------------');
        logger.log(
            uptimeLogLevel,
            'Iteration # ' +
                formatter.format(startIterations) +
                ', Uptime: ' +
                moment.preciseDiff(0, uptimeMilliSec) +
                `, Heap used ${heapUsed} MB of total heap ${heapTotal} MB. Memory allocated to process: ${processMemory} MB.`,
        );

    }, later.parse.text(uptimeInterval));
}

module.exports = {
    serviceUptimeStart,
};
