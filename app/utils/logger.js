const colors = {
    info: '\x1b[36m%s\x1b[0m',    // Cyan
    success: '\x1b[32m%s\x1b[0m',  // Green
    warning: '\x1b[33m%s\x1b[0m',  // Yellow
    error: '\x1b[31m%s\x1b[0m'     // Red
};

const logger = {
    api: (message, error = null) => {
        const timestamp = new Date().toISOString();
        if (error) {
            console.error(colors.error, `[${timestamp}] [API] ${message}`);
            console.error(colors.error, error.stack || error);
        } else {
            console.log(colors.info, `[${timestamp}] [API] ${message}`);
        }
    },

    db: (message, error = null) => {
        const timestamp = new Date().toISOString();
        if (error) {
            console.error(colors.error, `[${timestamp}] [DB] ${message}`);
            console.error(colors.error, error.stack || error);
        } else {
            console.log(colors.info, `[${timestamp}] [DB] ${message}`);
        }
    },

    thirdParty: (message, error = null) => {
        const timestamp = new Date().toISOString();
        if (error) {
            console.error(colors.error, `[${timestamp}] [3RD-PARTY] ${message}`);
            console.error(colors.error, error.stack || error);
        } else {
            console.log(colors.info, `[${timestamp}] [3RD-PARTY] ${message}`);
        }
    }
};

export default logger;