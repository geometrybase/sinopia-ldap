var ldap = require('ldapjs');

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
    var self = this;
    self._ldap_client.bind(user, password, function(error, res) {
        if (error) {
            if (error.name === "InvalidCredentialsError") {
                self._logger.info({user: user}, "Invalid Credentials for user: @{user}");
                return callback(null, false);
            } else {
                self._logger.error({err: error}, "LDAP bind failed: @{err}");
                return callback("Unable to authenticate against LDAP");
            }
        }
        return callback(null, [user]);
    });
}