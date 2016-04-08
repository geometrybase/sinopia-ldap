var ldap = require("ldapjs");

module.exports = Auth;

function Auth(config, stuff) {
    var self = Object.create(Auth.prototype);
    self._users = {};
    self._config = config;
    self._logger = stuff.logger;
    self._ldap_client = ldap.createClient(self._config.client_options);
    return self;
}

Auth.prototype.authenticate = function(user, password, callback) {
    var self = this, domain = self._config.domain;
    if (domain) {
        if (user.indexOf('@') !== -1 && user.split("@").pop() !== domain) {
            self._logger.warn({user: user}, "Rejected auth due to invalid domain: @{user}");
            return callback(null, false);
        }
        if (user.indexOf("@") === -1) {
            user += "@" + domain;
        }
    }
    self._ldap_client.bind(user, password, function(error) {
        var groups = [];
        if (error) {
            if (error.name === "InvalidCredentialsError") {
                self._logger.warn({user: user}, "Invalid Credentials for user: @{user}");
                return callback(null, false);
            }
            self._logger.error({err: error}, "LDAP bind failed: @{err}");
            return callback("Unable to authenticate against LDAP");
        }
        if (domain) {
            groups.push(user.split("@")[0]);
        }
        groups.push(user);
        return callback(null, groups);
    });
}