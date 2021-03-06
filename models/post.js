const mongodb = require("./db");
const markdown = require('markdown').markdown;

function Post(name, title, post) {
	this.name = name;
	this.title = title;
	this.post = post;
}
Post.prototype.save = function(callback) {
	let date = new Date();
	let time = {
		date: date,
		year: date.getFullYear(),
		month: date.getFullYear() + '-' + (date.getMonth() + 1),
		day: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate(),
		minute: [date.getFullYear() + '-',
		         (date.getMonth() + 1) + '-',
		         date.getDate() + ' ',
		         date.getHours() + ':',
		         (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())].join('')
	}

	let post = {
		name:this.name,
		time: time,
		title: this.title,
		post: this.post,
		comments: []
	}

	mongodb.open(function (err, db) {
		if(err) {
			return callback(err);
		}
		db.collection('posts', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.insertOne(post, function(err, post) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null);
			});
		});
	});
};

Post.getAll = function (name, callback) {
	mongodb.open(function(err, db) {
		if(err) {
			return callback(err);
		}
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			var query= {};
            if(name) {
            	query.name=name;
            }
			collection.find(query).sort({
				time:-1
			}).toArray(function(err, docs) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				docs.forEach( doc => doc.post = markdown.toHTML(doc.post));
				callback(null, docs);
			});
		});
	});
};

Post.getOne = function (name, day, title, callback) {
	mongodb.open(function (err, db) {
		if(err) {
			mongodb.close();
			return callback(err)
		}
		db.collection('posts', function(err, collection) {
			if(err) {
				mongodb.close();
				return callback(err);
			}
			collection.findOne({
				name: name,
				'time.day': day,
				title: title
			},function(err, doc) {
				mongodb.close();
				if(err) {
					return callback(err);
				}
				doc.post = markdown.toHTML(doc.post);
				if(doc.comments) {
					doc.comments.forEach((comment) => {
						comment.content = markdown.toHTML(comment.content);
					})
				}
				callback(null, doc);
			});
		});
	});
};
Post.getTen = function(name, page, callback) {
	mongodb.open(function(err, db) {
		if(err) {
			return callback(err);
		}
		db.collection('posts', function(err, collection) {
			if(err) {
				mongodb.close();
				return callback(err);
			}
			var query = {};
			if(name) {
				query.name = name;
			} 
			collection.count(query, function(err, total) {
				if(err) {
					mongodb.close();
					return callback(err);
				}
				collection.find(query, {
					skip: (page - 1) * 10,
					limit: 10
				}).sort({
					time: -1
				}).toArray(function(err, docs) {
					mongodb.close();
					if (err) {
						return callback(err);
					}
					docs.forEach(function (doc) {
						doc.post = markdown.toHTML(doc.post);
					});
					callback(null, docs, total);
				})
			})
		})
	})
}

Post.edit = function(name, day, title, callback) {
	mongodb.open(function(err, db) {
		if(err) {
			return callback(err);
		}
		db.collection('posts', function(err, collection) {
			if(err) {
				mongodb.close();
				return callback(err);
			}
			collection.findOne({
				name: name,
				'time.day': day,
				title: title
			}, function(err, doc) {
				mongodb.close();
				if(err) {
					callback(err)
				}
				callback(null, doc);
			});
		});
	});
};

Post.update = function(name, day, title, post, callback) {
	mongodb.open(function(err, db) {
		if(err){
			return callback(err);
		}
		db.collection('posts', (err, collection) => {
			if(err) {
				mongodb.close();
				return callback(err);
			}
			collection.updateOne({
				"name": name,
				"time.day": day,
				"title": title
			}, {
				$set:{post:post}
			}, function(err, result) {
				mongodb.close();
				if(err) {
					return callback(err);
				}
				callback(null);
			});
		});
	});
};

Post.remove = function(name, day, title, callback) {
	mongodb.open(function (err, db) {
		if(err) {
			return callback(err);
		}
		db.collection('posts', function(err, collection) {
			if(err) {
				mongodb.close();
				return callback(err);
			}
			collection.deleteOne({
				"name": name,
				"time.day": day,
				"title": title
			}, function(err, result) {
				mongodb.close();
				if(err) {
					return callback(err);
				}
				callback(err);
			});
		});
	});
}
Post.getArchive = function(callback) {
	mongodb.open(function(err, db) {
		if(err) {
			return callback(err);
		}
		db.collection('posts', function(err, collection) {
			if(err) {
				mongodb.close();
				return callback(err);
			}
			collection.find({}, {
				"name": 1,
				"time": 1,
				"title": 1
			}).sort({
				time: -1
			}).toArray(function(err, docs) {
				mongodb.close();
				if(err) {
					return callback(err);
				}
				return callback(null, docs);
			})
		})
	})
}
module.exports = Post;