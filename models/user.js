const mongodb = require("./db");

function User(user) {
	this.name = user.name;
	this.password = user.password;
	this.email = user.email;
}

User.prototype.save = function(callback) {
	let user ={
		name: this.name,
		password: this.password,
		email: this.email
	};

	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('user', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err)
			}
			collection.insertOne(user, function (err, user) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null, user[0]);
			});
		});
	});
};

User.get = function(name, callback) {
	mongodb.open(function (err, db) {
		if(err) {
			return callback(err);
		}
		db.collection('user', function(err, collection) {
			if(err) {
				mongodb.close();
				return callback(err);
			}
			collection.findOne({
				name:name
			}, function (err, user) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null, user);
			});
		});
	});
};

module.exports=User;