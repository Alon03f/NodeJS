const loginAttempts = new Map();

function isUserBlocked(email) {
    const attempt = loginAttempts.get(email);
    if (!attempt) return false;

    const { count, lastAttempt } = attempt;
    const now = Date.now();

    if (count >= 3 && now - lastAttempt < 60000) {
        return true;
    }

    if (now - lastAttempt >= 60000) {
        loginAttempts.delete(email);
    }

    return false;
}

function recordLoginAttempt(email, success) {
    if (success) {
        loginAttempts.delete(email);
        return;
    }

    const now = Date.now();
    const attempt = loginAttempts.get(email);

    if (attempt) {
        loginAttempts.set(email, {
            count: attempt.count + 1,
            lastAttempt: now,
        });
    } else {
        loginAttempts.set(email, {
            count: 1,
            lastAttempt: now,
        });
    }
}

module.exports = { isUserBlocked, recordLoginAttempt };