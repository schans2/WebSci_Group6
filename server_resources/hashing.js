var crypto = require('crypto');

var genRandomString = function(length){
    return crypto.randomBytes(Math.ceil(length/2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0,length);   /** return required number of characters */
};

var sha512 = function(password, salt){
    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt:salt,
        passwordHash:value
    };
};

var hashIt = function(password){
    var salt = genRandomString(16);
    return sha512(password, salt);
};

var validate = function(password, hashed, salt){
    return hashed == sha512(password, salt).passwordHash;
}

module.exports.hashIt = hashIt;
module.exports.validate = validate;