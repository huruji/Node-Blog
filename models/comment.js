const mongodb = require("./db");

function Comment(name, day, title, comment) {
	this.name = name;
	this.day = day;
	this.title = title;
	this.comment = comment;
}

Comment.prototype.save = function(callback) {
	let name = this.name;
	let day = this.day;
	let title = this.title;
	let comment = this.comment;

	mongodb.open(function (err, db) {
		if(err) {
			return callback(err);
		}
		db.collection('posts', function(err, collection) {
			if(err) {
				mongodb.close();
				return callback(err);
			}
			collection.update({
				"name": name,
				"time.day": day,
				"title": title
			}, {
				$push: {'comments': comment}
			}, function(err, result) {
				mongodb.close();
				if(err) {
					return callback(err);
				}
				callback(null);
			});
		});
	});
}






module.exports = Comment;